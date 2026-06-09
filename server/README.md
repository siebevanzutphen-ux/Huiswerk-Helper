# Huiswerk-Helper — beveiligde server (handleiding)

Deze server zorgt dat:
- jouw **Anthropic API-sleutel geheim blijft** (staat alleen op de server, nooit in de website);
- **niemand de app zomaar kan gebruiken** — alleen mensen met een geldige **toegangscode**;
- je **kosten beschermd** worden met een snelheidslimiet en een maandlimiet per gebruiker.

De website (`index.html`) praat dus niet meer rechtstreeks met Anthropic, maar met **jouw** server. De server controleert de toegangscode en praat pas dán met Anthropic.

---

## Wat je nodig hebt
1. De server van je vader, bereikbaar vanaf internet via een **eigen domeinnaam** (bv. `api.huiswerkhelper.nl`).
2. **Node.js 18 of hoger** op die server. (Check: `node -v`)
3. **HTTPS** (een slotje). Dat is verplicht: zonder HTTPS kan iemand de toegangscodes onderscheppen. Zie stap 4.

---

## Stap 1 — Zet de bestanden op de server
Kopieer de hele map `server/` naar de server, bijvoorbeeld naar `/opt/huiswerk-helper/`.

## Stap 2 — Vul je geheimen in
Maak in die map een bestand `.env` (kopie van `.env.example`) en vul in:
```
ANTHROPIC_API_KEY=sk-ant-...     # jouw echte sleutel
PORT=8787
ALLOWED_ORIGIN=https://jouwdomein.nl   # het adres van je wébsite (waar index.html staat)
ADMIN_TOKEN=<een-lang-willekeurig-geheim>
DEFAULT_MONTHLY_LIMIT=1500       # max AI-verzoeken per gebruiker per maand (0 = onbeperkt)
```
> `.env` en `codes.json` staan in `.gitignore` — die deel je dus nooit.

## Stap 3 — Starten
```
cd /opt/huiswerk-helper
npm install
npm start
```
Je ziet "✅ Huiswerk-Helper proxy draait op poort 8787".

**Laten doordraaien** (ook na herstart/uitloggen) — kies één:
- **pm2**: `npm i -g pm2 && pm2 start server.js --name huiswerk && pm2 save && pm2 startup`
- of een **systemd**-service.

## Stap 4 — HTTPS (slotje) met een domein
De makkelijkste manier is **Caddy** (regelt automatisch een gratis HTTPS-certificaat). Voorbeeld-`Caddyfile`:
```
api.jouwdomein.nl {
    reverse_proxy localhost:8787
}
```
Daarna draait je server veilig op `https://api.jouwdomein.nl`. (Alternatief: nginx + certbot, of een Cloudflare Tunnel.)

## Stap 5 — Koppel de website aan de server
Open `index.html`, zoek bovenin het script naar:
```js
const BACKEND_URL = '';
```
en zet daar je serveradres neer:
```js
const BACKEND_URL = 'https://api.jouwdomein.nl';
```
Zet `index.html` op je webhosting (bv. `https://jouwdomein.nl`). Klaar: de app vraagt nu om een **toegangscode** in plaats van een API-sleutel, en alle AI loopt via je server.

> Tip: laat `BACKEND_URL` leeg tijdens lokaal testen — dan werkt de app in "eigen sleutel"-modus zonder server.

## Stap 6 — Toegangscodes aanmaken
Een code maak je aan met je `ADMIN_TOKEN`. Voorbeeld (vervang het token):

**Linux/Mac (curl):**
```
curl -X POST https://api.jouwdomein.nl/admin/codes \
  -H "Authorization: Bearer JOUW_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Klant Jan","monthlyLimit":1500}'
```
**Windows (PowerShell):**
```
Invoke-RestMethod -Method Post -Uri "https://api.jouwdomein.nl/admin/codes" `
  -Headers @{ Authorization = "Bearer JOUW_ADMIN_TOKEN" } `
  -ContentType "application/json" -Body '{"note":"Klant Jan","monthlyLimit":1500}'
```
Je krijgt een code terug, bv. `HH-7F3A-9K2D-XQ1P`. Die geef je aan de klant; hij vult hem in de app in.

- Alle codes bekijken: `GET /admin/codes` (met dezelfde Authorization-header)
- Een code uitzetten (bv. bij opzeggen): `POST /admin/codes/HH-XXXX-XXXX-XXXX` met body `{"active":false}`
- Iemand upgraden/downgraden: `POST /admin/codes/HH-XXXX-XXXX-XXXX` met body `{"plan":"plus"}`

### Abonnementen & tokens
Elke code hoort bij een **abonnement** dat een maandelijks **token-tegoed** geeft. Een token = een echte AI-token (invoer + uitvoer) die een verzoek verbruikt. We trekken het **échte** verbruik af, dus niemand kan meer gebruiken dan zijn tegoed — **je API-rekening kan nooit hoger worden dan het plan toelaat**. Op = op (tot volgende maand of een upgrade).

Standaardplannen (pas de aantallen aan in `server.js` → `PLANS`):

| Plan | Tokens/maand | Richtprijs* | Max. API-kosten (worst case) |
|------|-------------:|-------------|------------------------------|
| Gratis | 50.000 | gratis (proef) | ~€0,25 |
| Basis | 500.000 | €4,99 / mnd | ~€2,30 |
| Plus | 1.500.000 | €9,99 / mnd | ~€7 |
| Pro | 3.000.000 | €19,99 / mnd | ~€14 |

\* De prijzen toon je op de site (`index.html` → `PLAN_PRICES`). "Worst case" = als álles uitvoer-tokens zouden zijn; in de praktijk ligt het verbruik veel lager, dus je marge is ruimer. Wil je voorzichtiger zijn? Verlaag de tokens per plan.

Een code voor een bepaald plan maak je zo aan: `POST /admin/codes` met body `{"plan":"basis"}`. Een eigen tegoed kan ook: `{"monthlyTokens": 800000}`.

De app toont de gebruiker zijn saldo (chip rechtsboven) en een abonnementen-scherm; bij "tokens op" verschijnt automatisch het upgrade-scherm.

## Stap 7 — Later: automatisch betalen koppelen
In `server.js` staan twee kant-en-klare plekken (`/webhook/stripe` en `/webhook/lemonsqueezy`). Zodra je een betaaldienst kiest, vul je daar in:
- bij een **geslaagde betaling** → automatisch een code aanmaken en naar de klant mailen;
- bij **opzeggen/terugbetaling** → die code op `active:false` zetten.

Zeg het me als je gekozen hebt (Stripe of Lemon Squeezy), dan bouw ik dat erin (incl. handtekening-verificatie).

---

## Wat dit wél en niet beschermt
- ✅ Jouw API-sleutel is onzichtbaar voor gebruikers (staat alleen op de server).
- ✅ Alleen geldige, actieve codes kunnen de AI gebruiken.
- ✅ Snelheids- en maandlimiet per code beschermen je rekening.
- ✅ Alleen jouw eigen website mag de server aanroepen (CORS).
- ⚠️ Een betalende gebruiker kan zijn eigen code natuurlijk zelf gebruiken — dat hoort zo. Deel je `ADMIN_TOKEN` en `.env` met niemand.
- ⚠️ Gebruik altijd HTTPS (stap 4). Zonder slotje is niets veilig.
