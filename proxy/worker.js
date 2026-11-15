// ISR Stat — posrednik (Cloudflare Worker)
//
// Nekateri statistični strežniki ne dovolijo klicev iz brskalnika (ni glav CORS)
// ali ob napaki (429, 500) vrnejo odgovor brez njih. Ta posrednik prenese
// zahtevo naprej in odgovoru doda glave CORS. Prepušča samo strežnike s
// seznama ALLOW in samo izvorom s seznama ORIGINS.
//
// Uporaba iz aplikacije:  https://<ime>.workers.dev/?url=<kodiran URL vira>
// Namestitev: glej proxy/README.md.

const ALLOW = [
  // Slovenija in EU
  "pxweb.stat.si", "px.bsi.si", "ec.europa.eu", "data-api.ecb.europa.eu",
  // mednarodno
  "sdmx.oecd.org", "api.imf.org", "www.imf.org", "rplumber.ilo.org", "api.worldbank.org", "comtradeapi.un.org",
  // regija
  "web.dzs.hr", "podaci.dzs.hr", "api.hnb.hr", "makstat.stat.gov.mk", "askdata.rks-gov.net",
  "data.stat.gov.rs", "opendata.stat.gov.rs", "databaza.instat.gov.al", "www.instat.gov.al", "www.bankofalbania.org",
  "monstat.org", "www.monstat.org", "bhas.gov.ba", "www.bhas.gov.ba",
];

const ORIGINS = [
  "https://the-adriatic.github.io",
  "https://data.isr.si",
  "https://stat.isr.si",
  "http://localhost:8000",
];

function corsHeaders(origin) {
  const ok = ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!["GET", "POST"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: cors });
    if (origin && !ORIGINS.includes(origin)) return new Response("Origin not allowed", { status: 403, headers: cors });

    const target = new URL(request.url).searchParams.get("url");
    let u;
    try { u = new URL(target); } catch (_) { return new Response("Missing or bad ?url=", { status: 400, headers: cors }); }
    if (!["https:", "http:"].includes(u.protocol) || !ALLOW.includes(u.hostname)) {
      return new Response("Host not allowed: " + u.hostname, { status: 403, headers: cors });
    }

    const init = {
      method: request.method,
      headers: {
        "User-Agent": "ISR-Stat-proxy/1.0 (+https://isr.si)",
        "Accept": request.headers.get("Accept") || "*/*",
        "Accept-Language": "en",
      },
      redirect: "follow",
    };
    if (request.method === "POST") {
      init.body = await request.text();
      init.headers["Content-Type"] = request.headers.get("Content-Type") || "application/json";
    } else {
      // cache public GET answers at the edge for an hour
      init.cf = { cacheTtl: 3600, cacheEverything: true };
    }

    let upstream;
    try { upstream = await fetch(u.toString(), init); }
    catch (e) { return new Response(JSON.stringify({ error: [{ status: 502, label: "Upstream unreachable: " + e.message }] }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } }); }

    const headers = new Headers(upstream.headers);
    ["set-cookie", "access-control-allow-origin", "access-control-allow-credentials", "content-security-policy", "x-frame-options"].forEach(h => headers.delete(h));
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    headers.set("X-ISR-Proxy", "1");
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  },
};
