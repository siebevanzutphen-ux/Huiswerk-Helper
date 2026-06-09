// ============================================================================
//  Huiswerk-Helper — beveiligde proxy-server
//  - Houdt de Anthropic API-sleutel GEHEIM (staat alleen hier, in .env).
//  - Laat de website NIET rechtstreeks met Anthropic praten.
//  - Geeft alleen toegang aan gebruikers met een geldige, actieve toegangscode.
//  - Beschermt je portemonnee met snelheids- en maandlimieten per code.
//  Vereist Node 18+ (gebruikt de ingebouwde fetch). Enige dependency: express.
// ============================================================================
import express from 'express';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Mini .env loader (geen extra dependency nodig) ----
(function loadEnv() {
  const p = join(__dirname, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
})();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const PORT = parseInt(process.env.PORT || '8787', 10);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DEFAULT_MONTHLY_LIMIT = parseInt(process.env.DEFAULT_MONTHLY_LIMIT || '1500', 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || '')
  .split(',').map(s => s.trim()).filter(Boolean);

if (!ANTHROPIC_API_KEY) console.warn('⚠  ANTHROPIC_API_KEY ontbreekt in .env — de proxy kan niets doen.');
if (!ADMIN_TOKEN) console.warn('⚠  ADMIN_TOKEN ontbreekt — beheer-endpoints zijn uitgeschakeld tot je er een instelt.');

// ---- Toegangscodes opslaan in een simpel JSON-bestand ----
const CODES_FILE = join(__dirname, 'codes.json');
let codes = {};
try { if (existsSync(CODES_FILE)) codes = JSON.parse(readFileSync(CODES_FILE, 'utf8')) || {}; } catch { codes = {}; }
let saveTimer = null;
function saveCodes() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2)); } catch (e) { console.error('Kon codes niet opslaan:', e.message); } }, 200);
}
function monthKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1); }
function newCode() {
  // Leesbare code, bv. HH-7F3A-9K2D-XQ1P
  const raw = randomBytes(9).toString('base64').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12);
  return 'HH-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12);
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16mb' }));

// ---- CORS: alleen jouw eigen website mag de server aanroepen ----
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  // Lichte beveiligingsheaders
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- Simpele snelheidslimiet per code (in geheugen) ----
const hits = new Map(); // code -> [timestamps]
function rateLimited(code, maxPerMin = 25) {
  const now = Date.now();
  const arr = (hits.get(code) || []).filter(t => now - t < 60000);
  arr.push(now);
  hits.set(code, arr);
  return arr.length > maxPerMin;
}

// ---- Toegangscode controleren ----
function getValidCode(req) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const code = m[1].trim();
  const rec = codes[code];
  if (!rec || !rec.active) return null;
  return { code, rec };
}

// ---- Toegang + verbruik voor de app (om plan/limiet te tonen) ----
app.get('/api/me', (req, res) => {
  const v = getValidCode(req);
  if (!v) return res.status(401).json({ ok: false, error: 'invalid_code' });
  const u = v.rec.usage && v.rec.usage.month === monthKey() ? v.rec.usage : { requests: 0 };
  res.json({ ok: true, plan: v.rec.plan || 'standard', limit: v.rec.monthlyLimit ?? DEFAULT_MONTHLY_LIMIT, used: u.requests || 0 });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// ---- DE PROXY: stuurt het verzoek door naar Anthropic met de geheime sleutel ----
app.post('/api/messages', async (req, res) => {
  const v = getValidCode(req);
  if (!v) return res.status(401).json({ error: { message: 'Ongeldige of verlopen toegangscode.' } });
  const { code, rec } = v;

  if (rateLimited(code)) return res.status(429).json({ error: { message: 'Te veel verzoeken. Wacht heel even.' } });

  // Maandlimiet (verbruiksbescherming)
  const mk = monthKey();
  if (!rec.usage || rec.usage.month !== mk) rec.usage = { month: mk, requests: 0, inputTokens: 0, outputTokens: 0 };
  const limit = rec.monthlyLimit ?? DEFAULT_MONTHLY_LIMIT;
  if (limit > 0 && rec.usage.requests >= limit) {
    return res.status(402).json({ error: { message: 'Je maandlimiet is bereikt. Probeer het volgende maand weer of upgrade je abonnement.' } });
  }

  const body = req.body || {};
  // Veiligheid: laat de client het model kiezen, maar dwing redelijke grenzen af.
  if (typeof body.max_tokens !== 'number' || body.max_tokens > 8000) body.max_tokens = Math.min(body.max_tokens || 1024, 8000);

  const headers = {
    'content-type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };
  // web_fetch-tool? Dan de bijbehorende beta-header server-side toevoegen.
  if (Array.isArray(body.tools) && body.tools.some(t => t && /web_fetch/.test(t.type || ''))) {
    headers['anthropic-beta'] = 'web-fetch-2025-09-10';
  }

  rec.usage.requests += 1; saveCodes();

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers, body: JSON.stringify(body),
    });
  } catch (e) {
    return res.status(502).json({ error: { message: 'Kon de AI niet bereiken: ' + e.message } });
  }

  if (body.stream && upstream.ok && upstream.body) {
    res.status(upstream.status);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    Readable.fromWeb(upstream.body).pipe(res);
    return;
  }

  // Niet-streaming (of fout): doorgeven en (bij succes) tokens bijhouden.
  const text = await upstream.text();
  res.status(upstream.status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (upstream.ok) {
    try { const j = JSON.parse(text); if (j.usage) { rec.usage.inputTokens += j.usage.input_tokens || 0; rec.usage.outputTokens += j.usage.output_tokens || 0; saveCodes(); } } catch { }
  }
  res.send(text);
});

// ============================================================================
//  BEHEER — maak en beheer toegangscodes (beschermd met ADMIN_TOKEN).
//  Later doet de betaaldienst (Stripe / Lemon Squeezy) dit automatisch.
// ============================================================================
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(403).json({ error: 'Beheer uitgeschakeld (geen ADMIN_TOKEN ingesteld).' });
  const auth = req.headers.authorization || '';
  if (auth !== 'Bearer ' + ADMIN_TOKEN) return res.status(401).json({ error: 'Onjuist admin-token.' });
  next();
}

// Nieuwe code aanmaken:  POST /admin/codes  { "plan": "standard", "monthlyLimit": 1500, "note": "voor Jan" }
app.post('/admin/codes', requireAdmin, (req, res) => {
  const code = newCode();
  codes[code] = {
    active: true,
    plan: (req.body && req.body.plan) || 'standard',
    monthlyLimit: (req.body && typeof req.body.monthlyLimit === 'number') ? req.body.monthlyLimit : DEFAULT_MONTHLY_LIMIT,
    note: (req.body && req.body.note) || '',
    createdAt: new Date().toISOString(),
    usage: { month: monthKey(), requests: 0, inputTokens: 0, outputTokens: 0 },
  };
  saveCodes();
  res.json({ ok: true, code, record: codes[code] });
});

// Alle codes bekijken (zonder verbruik te wissen):  GET /admin/codes
app.get('/admin/codes', requireAdmin, (_req, res) => {
  res.json({ ok: true, count: Object.keys(codes).length, codes });
});

// Een code aan/uit zetten:  POST /admin/codes/:code  { "active": false }
app.post('/admin/codes/:code', requireAdmin, (req, res) => {
  const rec = codes[req.params.code];
  if (!rec) return res.status(404).json({ error: 'Code bestaat niet.' });
  if (req.body && typeof req.body.active === 'boolean') rec.active = req.body.active;
  if (req.body && typeof req.body.monthlyLimit === 'number') rec.monthlyLimit = req.body.monthlyLimit;
  saveCodes();
  res.json({ ok: true, record: rec });
});

// ============================================================================
//  BETAAL-WEBHOOKS — vul in zodra je Stripe OF Lemon Squeezy hebt gekozen.
//  Idee: bij een geslaagde betaling maak je hier automatisch een code aan en
//  mail je die naar de klant; bij opzeggen/terugbetaling zet je hem op inactief.
//  BELANGRIJK: verifieer altijd de handtekening van de webhook (anti-fraude).
// ============================================================================
app.post('/webhook/lemonsqueezy', express.raw({ type: '*/*' }), (req, res) => {
  // TODO (Lemon Squeezy): verifieer 'X-Signature' met je webhook-secret (HMAC-SHA256).
  // Bij 'order_created'/'subscription_created' -> codes[newCode()] = {active:true,...}; mail de code.
  // Bij 'subscription_cancelled'/'expired' -> zet de bijbehorende code op active:false.
  res.sendStatus(200);
});
app.post('/webhook/stripe', express.raw({ type: '*/*' }), (req, res) => {
  // TODO (Stripe): verifieer 'Stripe-Signature' met je webhook-secret (stripe.webhooks.constructEvent).
  // Bij 'checkout.session.completed' -> maak een code aan; bij 'customer.subscription.deleted' -> deactiveer.
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log('✅ Huiswerk-Helper proxy draait op poort ' + PORT);
  console.log('   Toegestane origins: ' + (ALLOWED_ORIGINS.join(', ') || '(alle — stel ALLOWED_ORIGIN in!)'));
  console.log('   Codes in beheer: ' + Object.keys(codes).length);
});
