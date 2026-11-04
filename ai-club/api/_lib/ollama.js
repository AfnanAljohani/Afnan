// Thin client for the Ollama HTTP API (/api/chat). Works with a self-hosted
// Ollama behind a protected reverse proxy, or Ollama Cloud (Bearer key).
import { env, ollamaConfigured } from './env.js';

export class OllamaError extends Error {
  constructor(code, message, status) { super(message); this.code = code; this.status = status; }
}

function headers(c) {
  const h = { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' };
  if (c.ollamaApiKey) h.Authorization = `Bearer ${c.ollamaApiKey}`;
  return h;
}

/**
 * Streams a chat completion. Calls onToken(text) for each chunk.
 * Resolves with the full text. Aborts on timeout or when `signal` fires.
 */
export async function ollamaChat({ messages, onToken, signal, maxTokens = 600, temperature = 0.2, timeoutMs }) {
  const c = env();
  if (!ollamaConfigured(c)) throw new OllamaError('ollama_not_configured', 'OLLAMA_URL / OLLAMA_MODEL are not set');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(new OllamaError('ollama_timeout', 'Model did not answer in time')), timeoutMs ?? c.ollamaTimeoutMs);
  const onOuterAbort = () => ctl.abort(signal.reason);
  signal?.addEventListener('abort', onOuterAbort, { once: true });

  let res;
  try {
    res = await fetch(`${c.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: headers(c),
      body: JSON.stringify({
        model: c.ollamaModel,
        messages,
        stream: true,
        options: { temperature, num_predict: maxTokens },
      }),
      signal: ctl.signal,
    });
  } catch (e) {
    clearTimeout(timer); signal?.removeEventListener('abort', onOuterAbort);
    if (ctl.signal.reason instanceof OllamaError) throw ctl.signal.reason;
    throw new OllamaError('ollama_unreachable', 'Could not reach the model service');
  }
  if (!res.ok || !res.body) {
    clearTimeout(timer); signal?.removeEventListener('abort', onOuterAbort);
    const code = res.status === 401 || res.status === 403 ? 'ollama_auth' : res.status === 404 ? 'ollama_model_missing' : 'ollama_http_error';
    throw new OllamaError(code, `Model service answered HTTP ${res.status}`, res.status);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        let msg; try { msg = JSON.parse(line); } catch { continue; }
        if (msg.error) throw new OllamaError('ollama_error', String(msg.error).slice(0, 200));
        const t = msg.message?.content || '';
        if (t) { full += t; onToken?.(t); }
        if (msg.done) return full;
      }
    }
    return full;
  } catch (e) {
    if (e instanceof OllamaError) throw e;
    if (ctl.signal.reason instanceof OllamaError) throw ctl.signal.reason;
    throw new OllamaError('ollama_stream_error', 'The model stream was interrupted');
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', onOuterAbort);
  }
}

/** Cheap reachability check used by the admin status panel. */
export async function ollamaPing() {
  const c = env();
  if (!ollamaConfigured(c)) return { configured: false, reachable: false, modelAvailable: false };
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(`${c.ollamaUrl}/api/tags`, { headers: headers(c), signal: ctl.signal });
    if (!r.ok) return { configured: true, reachable: false, modelAvailable: false, httpStatus: r.status };
    const j = await r.json().catch(() => ({}));
    const names = (j.models || []).map(m => m.name || m.model);
    const want = c.ollamaModel;
    const modelAvailable = names.some(n => n === want || n === `${want}:latest` || n.split(':')[0] === want);
    return { configured: true, reachable: true, modelAvailable };
  } catch {
    return { configured: true, reachable: false, modelAvailable: false };
  } finally { clearTimeout(t); }
}
