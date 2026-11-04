// TEST-ONLY Ollama stand-in. It does not run a model: it streams a fixed,
// clearly-marked reply so the chat plumbing (streaming, sources, errors,
// limits) can be exercised end to end. Modes: FAKE_OLLAMA_MODE=ok|down|slow.
import http from 'node:http';

const PORT = +process.env.FAKE_OLLAMA_PORT || 54500;
let mode = process.env.FAKE_OLLAMA_MODE || 'ok';
export const lastRequests = [];

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__mode') { mode = url.searchParams.get('m') || mode; res.end(mode); return; }
  if (url.pathname === '/__last') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(lastRequests.slice(-3))); return; }
  if (req.headers.authorization !== 'Bearer test-ollama-key') { res.statusCode = 401; res.end('{"error":"unauthorized"}'); return; }
  if (mode === 'down') { req.socket.destroy(); return; }
  if (url.pathname === '/api/tags') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ models: [{ name: 'test-model:latest' }] })); return; }
  if (url.pathname !== '/api/chat') { res.statusCode = 404; res.end(); return; }
  let body = ''; req.on('data', d => (body += d)); req.on('end', () => {
    const j = JSON.parse(body); lastRequests.push(j);
    const sys = j.messages.map(m => m.content).join('\n');
    const isSummary = /محرر في مكتبة رقمية/.test(sys);
    const hasLib = /<untrusted_data source="library">/.test(sys);
    const text = isSummary
      ? 'ملخص تجريبي من خادم الاختبار: تتناول المادة موضوعًا في الذكاء الاصطناعي.'
      : `[رد تجريبي من خادم الاختبار] وصلني سؤالك مع ${j.messages.length} رسائل سياق.` + (hasLib ? ' أحدث مادة في المكتبة: [L1].' : '');
    res.setHeader('Content-Type', 'application/x-ndjson');
    const parts = text.match(/.{1,12}/gs);
    let i = 0;
    const tick = () => {
      if (i < parts.length) { res.write(JSON.stringify({ model: j.model, message: { role: 'assistant', content: parts[i++] }, done: false }) + '\n'); setTimeout(tick, mode === 'slow' ? 4000 : 25); }
      else { res.end(JSON.stringify({ model: j.model, message: { role: 'assistant', content: '' }, done: true }) + '\n'); }
    };
    tick();
  });
}).listen(PORT, '127.0.0.1', () => console.log(`fake ollama on http://127.0.0.1:${PORT} (test only, mode=${mode})`));
