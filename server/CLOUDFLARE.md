# Cloudflare + alarm instellen (extra beveiliging)

Dit tilt je beveiliging naar een echt goed niveau:
- **Verbergt het IP-adres** van de server van je vader (aanvallers vinden je thuis niet).
- **Blokkeert aanvallen/DDoS en bots** automatisch (gratis).
- **HTTPS** (slotje) krijg je er meteen bij.
- Met de **origin-lock** kan niemand Cloudflare omzeilen en je server rechtstreeks raken.

Je hoeft niets te programmeren — alleen instellen. (Account aanmaken en je gegevens invullen moet jij doen; dat mag ik niet voor je.)

---

## Optie A (aanrader voor een thuisserver): Cloudflare Tunnel
Hiermee hoef je **geen poort open te zetten** in de router en blijft je thuis-IP volledig verborgen.

1. Maak een gratis account op **cloudflare.com** en voeg je domein toe (volg hun stappen om de DNS over te zetten).
2. Installeer **cloudflared** op de server:
   - Download van Cloudflare (Zero Trust → Tunnels → "Create a tunnel").
3. Maak een tunnel aan en koppel een subdomein, bv. `api.jouwdomein.nl`, aan `http://localhost:8787` (de poort uit je `.env`).
4. Start de tunnel (cloudflared draait als service). Klaar: `https://api.jouwdomein.nl` werkt nu veilig, mét HTTPS, zonder poort-forwarding.

> In dit geval hoef je zelf geen Caddy/nginx voor HTTPS te regelen — de tunnel doet dat.

## Optie B: Cloudflare vóór een normale (port-forward) opstelling
1. Account + domein op Cloudflare (zoals hierboven).
2. Zet bij **DNS** een record naar je server-IP en zet het **oranje wolkje AAN** (proxied).
3. Regel HTTPS op de server zelf (zie `README.md`, stap 4, Caddy).

---

## Origin-lock aanzetten (zodat niemand Cloudflare kan omzeilen)
1. Verzin een lang geheim (bv. 40 willekeurige tekens) en zet het in je `.env`:
   ```
   CLOUDFLARE_SECRET=dat-lange-geheim
   ```
2. In Cloudflare: **Rules → Transform Rules → Modify Request Header → Create**.
   - Actie: **Set static** header
   - Naam: `X-Origin-Secret`
   - Waarde: hetzelfde lange geheim
   - Toepassen op: al het verkeer naar `api.jouwdomein.nl`
3. Herstart de server. Vanaf nu weigert hij alles wat niet via Cloudflare komt (status 403).

## Aanbevolen Cloudflare-instellingen (gratis)
- **SSL/TLS** → modus **Full (strict)** als je HTTPS op de server hebt, anders **Full**.
- **Security → Bots → Bot Fight Mode**: AAN.
- **Security → WAF**: zet de gratis managed rules aan.
- **Security → Rate limiting**: maak een regel, bv. max 60 verzoeken/min per IP op `/api/*`.
- **Caching**: laat `/api/*` ongecached (Cloudflare doet dit standaard goed voor POST).

---

## Alarm (krijg een seintje bij verdachte dingen)
De server waarschuwt je bij: brute-force op codes, een mogelijk **gedeelde code**, een foute **admin-login**, en als iemand zijn **maandlimiet** raakt. Alles komt sowieso in `events.log`. Voor een seintje op je telefoon/PC:

**Met Discord (makkelijkst):**
1. Maak in een Discord-server een kanaal → Kanaalinstellingen → **Integraties → Webhooks → Nieuwe webhook** → kopieer de URL.
2. Zet in `.env`:
   ```
   ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/....
   ```
3. Herstart de server. Je krijgt nu meldingen in dat Discord-kanaal.

(Slack-webhooks werken net zo. Wil je iets anders, bv. e-mail of Telegram? Zeg het, dan pas ik het aan.)

---

## Wat is "gedeelde code"-detectie?
Elke klant heeft één code. Als die code binnen 24 uur door **meer dan `SHARE_IP_LIMIT` verschillende apparaten** wordt gebruikt (standaard 4), krijg jij een alarm — waarschijnlijk heeft iemand zijn code doorgegeven. Standaard wordt er **alleen gewaarschuwd** (niet geblokkeerd), zodat een gebruiker die van wifi naar 4G wisselt geen last heeft. Wil je het hard blokkeren? Zet `SHARE_HARD_BLOCK=1` in `.env`.
