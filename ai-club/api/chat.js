// POST /api/chat — the club assistant.
// Browser → this function → Ollama. The Ollama address and key stay here.
// Response: NDJSON stream of {type:'meta'|'token'|'done'|'error', …}.
import { env, ollamaConfigured, supabaseServerConfigured } from './_lib/env.js';
import { send, fail, readJson, cors, clientIp, sha256, methodGuard } from './_lib/http.js';
import { serviceClient } from './_lib/supabase.js';
import { ollamaChat, OllamaError } from './_lib/ollama.js';
import { buildContext } from './_lib/chat-context.js';
import { hasArabic, toPlainText } from './_lib/text.js';

export const config = { maxDuration: 60 };

const MESSAGES = {
  ar: {
    not_configured: 'المساعد غير متصل بنموذج بعد. سيعمل بعد أن تضبط إدارة النادي خدمة Ollama.',
    rate_limited: 'وصلت للحد المسموح من الأسئلة مؤقتًا. حاول بعد قليل.',
    too_long: 'الرسالة طويلة. اختصرها إلى أقل من {n} حرفًا.',
    unavailable: 'تعذّر الوصول إلى خدمة النموذج الآن. حاول مرة أخرى بعد قليل.',
    timeout: 'تأخر النموذج في الرد. حاول بسؤال أقصر أو بعد قليل.',
    bad_request: 'لم أفهم الطلب. أعد كتابة سؤالك.',
  },
  en: {
    not_configured: "The assistant isn't connected to a model yet. It will work once the club sets up the Ollama service.",
    rate_limited: "You've reached the question limit for now. Please try again shortly.",
    too_long: 'Your message is too long. Keep it under {n} characters.',
    unavailable: "The model service can't be reached right now. Please try again shortly.",
    timeout: 'The model took too long to answer. Try a shorter question or try again later.',
    bad_request: "I couldn't read that request. Please rephrase your question.",
  },
};

export default async function handler(req, res) {
  if (!cors(req, res, 'POST, OPTIONS')) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const c = env();

  let body;
  try { body = await readJson(req, 24 * 1024); }
  catch (e) { return fail(res, e.status || 400, 'bad_request', MESSAGES.ar.bad_request); }

  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const last = raw[raw.length - 1];
  const question = typeof last?.content === 'string' ? last.content.trim() : '';
  const lang = body?.lang === 'en' ? 'en' : body?.lang === 'ar' ? 'ar' : (hasArabic(question) || !question ? 'ar' : 'en');
  const M = MESSAGES[lang];

  if (!question || last.role !== 'user') return fail(res, 400, 'bad_request', M.bad_request);
  if (question.length > c.chatMaxMessageChars) return fail(res, 413, 'too_long', M.too_long.replace('{n}', c.chatMaxMessageChars));
  if (!ollamaConfigured(c) || !supabaseServerConfigured(c)) return fail(res, 503, 'not_configured', M.not_configured);

  const db = serviceClient();
  // per-visitor budget (salted IP hash; raw IPs are never stored)
  const key = sha256(`${c.rateSalt}|${clientIp(req)}`);
  const { data: allowed, error: rlErr } = await db.rpc('chat_rate_hit', { p_key: key, p_limit: c.chatRateLimit, p_window_seconds: c.chatRateWindowSec });
  if (rlErr) return fail(res, 503, 'unavailable', M.unavailable);
  if (allowed === false) return fail(res, 429, 'rate_limited', M.rate_limited);

  // keep the last few turns; everything from the visitor is plain text and bounded
  const history = raw.slice(-c.chatMaxTurns * 2)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: toPlainText(m.content, c.chatMaxMessageChars * (m.role === 'assistant' ? 2 : 1)) }))
    .filter(m => m.content);

  let ctx;
  try { ctx = await buildContext(db, question, lang); }
  catch { return fail(res, 503, 'unavailable', M.unavailable); }

  const messages = [
    { role: 'system', content: ctx.system },
    { role: 'system', content: ctx.context },
    ...history.slice(0, -1),
    { role: 'user', content: `<untrusted_data source="visitor">\n${history[history.length - 1].content}\n</untrusted_data>` },
  ];

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const write = obj => { try { res.write(JSON.stringify(obj) + '\n'); } catch { /* client left */ } };
  write({ type: 'meta', sources: ctx.sources.filter(s => s.kind === 'library'), model: true });

  const abort = new AbortController();
  res.on('close', () => { if (!res.writableEnded) abort.abort(); }); // visitor closed the chat mid-answer
  try {
    await ollamaChat({ messages, signal: abort.signal, onToken: t => write({ type: 'token', text: t }) });
    write({ type: 'done' });
  } catch (e) {
    const code = e instanceof OllamaError && e.code === 'ollama_timeout' ? 'timeout' : 'unavailable';
    write({ type: 'error', code, message: M[code] });
  }
  res.end();
}
