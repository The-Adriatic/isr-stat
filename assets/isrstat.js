/*!
 * ISR Stat — knjižnica za pridobivanje uradne statistike
 * Inštitut za strateške rešitve (ISR)
 *
 * Ena koda za spletno aplikacijo in za Clauda: v brskalniku (ali v Nodu s
 * fetch in DOMParserjem) pokliče uradne API-je neposredno, vrne urejene vrstice
 * (ena vrstica = eno opazovanje), oznake, zastavice, letnik podatkov in navedbo
 * vira po pravilih FDV.
 *
 *   const meta = await ISRStat.meta("surs", "2490004S");
 *   const res  = await ISRStat.query("surs", "2490004S",
 *                   { "UVOZ/IZVOZ": ["2"], "DRŽAVA": ["XS", "00"], "ENOTA": ["EUR"] });
 *   ISRStat.toCSV(res); res.citation.fdv;
 */
(function (global) {
  "use strict";

  const VERSION = "0.5.3";
  const CFG = { proxy: "", fetch: null, DOMParser: null, timeout: 90000, lang: "sl", walkDelay: 150 };

  /* ------------------------------------------------------------------ */
  /* Sources                                                              */
  /* ------------------------------------------------------------------ */

  const SOURCES = {
    surs: {
      type: "pxweb", group: "si", abbr: "SURS",
      name: { sl: "SURS (SiStat)", en: "SURS (SiStat)" },
      inst: { sl: "Statistični urad Republike Slovenije", en: "Statistical Office of the Republic of Slovenia" },
      about: { sl: "Uradna statistika Slovenije: trgovina, prebivalstvo, BDP, cene, trg dela, regije.", en: "Official statistics of Slovenia." },
      api: "https://pxweb.stat.si/SiStatData/api/v1", db: { sl: "Data", en: "Data" }, langs: ["sl", "en"],
      desc: { sl: "podatkovni portal SI-STAT", en: "Data set" },
      web: (lang, id) => `https://pxweb.stat.si/SiStatData/pxweb/${lang}/Data/-/${pxFile(id)}`,
      flat: true,
    },
    bsi: {
      type: "pxweb", group: "si", abbr: "BS",
      name: { sl: "Banka Slovenije", en: "Bank of Slovenia" },
      inst: { sl: "Banka Slovenije", en: "Bank of Slovenia" },
      about: { sl: "Plačilna bilanca, neposredne naložbe (NTI), zunanji dolg, finančni računi, obrestne mere.", en: "Balance of payments, FDI, external debt, financial accounts." },
      api: "https://px.bsi.si/api/v1", db: { sl: "serije_slo", en: "serije_ang" }, langs: ["sl", "en"],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => pxWebUrl("https://px.bsi.si/pxweb", lang, lang === "sl" ? "serije_slo" : "serije_ang", id),
    },
    eurostat: {
      type: "eurostat", group: "int", abbr: "Eurostat",
      name: { sl: "Eurostat", en: "Eurostat" },
      inst: { sl: "Eurostat", en: "Eurostat" },
      about: { sl: "Primerljivi podatki za EU, države kandidatke in EFTA, ~8000 zbirk.", en: "Harmonised EU statistics, ~8,000 datasets." },
      api: "https://ec.europa.eu/eurostat/api/dissemination", langs: ["en", "de", "fr"],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => `https://ec.europa.eu/eurostat/databrowser/view/${id}/default/table?lang=en`,
    },
    ecb: {
      type: "sdmx", group: "int", abbr: "ECB",
      name: { sl: "Evropska centralna banka", en: "European Central Bank" },
      inst: { sl: "European Central Bank", en: "European Central Bank" },
      about: { sl: "Menjalni tečaji, obrestne mere, denarna in bančna statistika evrskega območja.", en: "Exchange rates, interest rates, monetary statistics." },
      api: "https://data-api.ecb.europa.eu/service", flows: "https://data-api.ecb.europa.eu/service/dataflow",
      csv: { param: "format=csvdata" }, langs: ["en"],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => `https://data.ecb.europa.eu/data/datasets/${flowParts(id).id}`,
    },
    oecd: {
      type: "sdmx", group: "int", abbr: "OECD",
      name: { sl: "OECD", en: "OECD" },
      inst: { sl: "OECD", en: "OECD" },
      about: { sl: "Nacionalni računi, produktivnost, davki, izobraževanje, ~1500 zbirk (Data Explorer).", en: "National accounts, productivity, taxes, education." },
      api: "https://sdmx.oecd.org/public/rest", flows: "https://sdmx.oecd.org/public/rest/dataflow/all/all/latest?detail=allstubs",
      csv: { param: "format=csvfile" }, langs: ["en", "fr"], partial: true,
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => { const p = flowParts(id); return `https://data-explorer.oecd.org/vis?df[ds]=dsDisseminateFinalDMZ&df[id]=${encodeURIComponent(p.id)}&df[ag]=${encodeURIComponent(p.agency)}`; },
    },
    imf: {
      type: "sdmx", group: "int", abbr: "IMF",
      name: { sl: "Mednarodni denarni sklad", en: "International Monetary Fund" },
      inst: { sl: "International Monetary Fund", en: "International Monetary Fund" },
      about: { sl: "WEO (napovedi), plačilne bilance, javne finance, finančna trdnost.", en: "WEO projections, BoP, government finance, FSI." },
      api: "https://api.imf.org/external/sdmx/2.1", flows: "https://api.imf.org/external/sdmx/2.1/dataflow",
      csv: { accept: "application/vnd.sdmx.data+csv;version=1.0.0" }, langs: ["en"],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => `https://data.imf.org/en/datasets/${flowParts(id).agency}:${flowParts(id).id}`,
    },
    ilo: {
      type: "ilo", group: "int", abbr: "ILO",
      name: { sl: "Mednarodna organizacija dela", en: "International Labour Organization" },
      inst: { sl: "International Labour Organization", en: "International Labour Organization" },
      about: { sl: "ILOSTAT: zaposlenost, brezposelnost, plače, delovni čas po državah.", en: "ILOSTAT: employment, unemployment, wages." },
      api: "https://rplumber.ilo.org", langs: ["en"],
      desc: { sl: "podatkovna zbirka ILOSTAT", en: "ILOSTAT data set" },
      web: (lang, id) => `https://rshiny.ilo.org/dataexplorer/?lang=en&id=${encodeURIComponent(id)}`,
    },
    worldbank: {
      type: "worldbank", group: "int", abbr: "Svetovna banka",
      name: { sl: "Svetovna banka", en: "World Bank" },
      inst: { sl: "World Bank", en: "World Bank" },
      abbrEn: "World Bank", short: "WB",
      about: { sl: "Kazalniki razvoja (WDI) in kazalniki upravljanja (WGI) za vse države.", en: "World Development Indicators and Worldwide Governance Indicators." },
      api: "https://api.worldbank.org/v2", langs: ["en"],
      wbSources: [["2", "WDI"], ["3", "WGI"]],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => `https://data.worldbank.org/indicator/${encodeURIComponent(id)}`,
    },
    dzs: {
      type: "pxweb", group: "wb", abbr: "DZS",
      name: { sl: "Hrvaška (DZS)", en: "Croatia (CBS)" },
      inst: { sl: "Državni zavod za statistiku", en: "Croatian Bureau of Statistics", hr: "Državni zavod za statistiku" },
      about: { sl: "Hrvaški statistični urad: cene, energija, industrija, nacionalni računi, trgovina.", en: "Croatian official statistics." },
      api: "https://web.dzs.hr/PXWeb/api/v1", db: null, langs: ["hr", "en"],
      desc: { sl: "podatkovna zbirka", en: "Data set" },
      web: (lang, id) => pxWebUrl("https://web.dzs.hr/PXWeb/pxweb", lang, null, id),
    },
    makstat: {
      type: "pxweb", group: "wb", abbr: "MakStat",
      name: { sl: "Severna Makedonija (MakStat)", en: "North Macedonia (MakStat)" },
      inst: { sl: "State Statistical Office of the Republic of North Macedonia", en: "State Statistical Office of the Republic of North Macedonia", mk: "Државен завод за статистика" },
      about: { sl: "Makedonski statistični urad, podatkovna zbirka MakStat.", en: "North Macedonian official statistics." },
      api: "https://makstat.stat.gov.mk/PXWeb/api/v1", db: { mk: "MakStat", en: "MakStat" }, langs: ["en", "mk"],
      desc: { sl: "podatkovna zbirka MakStat", en: "MakStat database" },
      web: (lang, id) => pxWebUrl("https://makstat.stat.gov.mk/PXWeb/pxweb", lang, "MakStat", id),
    },
    ask: {
      type: "pxweb", group: "wb", abbr: "ASK",
      name: { sl: "Kosovo (ASK)", en: "Kosovo (KAS)" },
      inst: { sl: "Kosovo Agency of Statistics", en: "Kosovo Agency of Statistics", sq: "Agjencia e Statistikave të Kosovës" },
      about: { sl: "Kosovska statistična agencija, podatkovna zbirka ASKdata.", en: "Kosovo official statistics." },
      api: "https://askdata.rks-gov.net/api/v1", db: { en: "ASKdata", sq: "ASKdata", sr: "ASKdata" }, langs: ["en", "sq", "sr"],
      desc: { sl: "podatkovna zbirka ASKdata", en: "ASKdata database" },
      web: (lang, id) => pxWebUrl("https://askdata.rks-gov.net/pxweb", lang, "ASKdata", id),
    },
    /* Sources reachable only through a proxy (no CORS). Listed so the app can
       show them; they switch on once ISRStat.configure({ proxy }) is set. */
    rzs: {
      type: "pending", group: "wb", abbr: "RZS", needsProxy: true,
      name: { sl: "Srbija (RZS)", en: "Serbia (SORS)" },
      inst: { sl: "Republički zavod za statistiku", en: "Statistical Office of the Republic of Serbia" },
      about: { sl: "Srbski statistični urad. Potreben posrednik (strežnik ne dovoli klicev iz brskalnika).", en: "Needs the proxy." },
      langs: ["sr-Latn", "en"],
    },
    instat: {
      type: "pending", group: "wb", abbr: "INSTAT", needsProxy: true,
      name: { sl: "Albanija (INSTAT)", en: "Albania (INSTAT)" },
      inst: { sl: "Instituti i Statistikave", en: "Institute of Statistics of Albania" },
      about: { sl: "Albanski statistični urad. Potreben posrednik.", en: "Needs the proxy." },
      langs: ["en", "sq"],
    },
    monstat: {
      type: "pending", group: "wb", abbr: "MONSTAT", needsProxy: true,
      name: { sl: "Črna gora (MONSTAT)", en: "Montenegro (MONSTAT)" },
      inst: { sl: "Uprava za statistiku Crne Gore", en: "Statistical Office of Montenegro" },
      about: { sl: "Črnogorski statistični urad. Potreben posrednik.", en: "Needs the proxy." },
      langs: ["en"],
    },
    bhas: {
      type: "pending", group: "wb", abbr: "BHAS", needsProxy: true,
      name: { sl: "BiH (BHAS)", en: "Bosnia and Herzegovina (BHAS)" },
      inst: { sl: "Agencija za statistiku Bosne i Hercegovine", en: "Agency for Statistics of Bosnia and Herzegovina" },
      about: { sl: "Statistična agencija BiH. Potreben posrednik.", en: "Needs the proxy." },
      langs: ["en"],
    },
    comtrade: {
      type: "pending", group: "int", abbr: "UN Comtrade", needsProxy: true,
      name: { sl: "UN Comtrade", en: "UN Comtrade" },
      inst: { sl: "United Nations", en: "United Nations" },
      about: { sl: "Blagovna menjava po državah in proizvodih (HS). Potreben posrednik.", en: "Needs the proxy." },
      langs: ["en"],
    },
  };

  const GROUPS = {
    si: { sl: "Slovenija", en: "Slovenia" },
    int: { sl: "EU in mednarodno", en: "EU and international" },
    wb: { sl: "Zahodni Balkan in Hrvaška", en: "Western Balkans and Croatia" },
  };

  /* ------------------------------------------------------------------ */
  /* Countries and groups (for quick picks on geographic dimensions)     */
  /* ------------------------------------------------------------------ */

  // iso2, iso3, sl, en, extra codes used by some sources
  const COUNTRIES = [
    ["SI", "SVN", "Slovenija", "Slovenia"],
    ["HR", "HRV", "Hrvaška", "Croatia"],
    ["RS", "SRB", "Srbija", "Serbia", ["XS"]],
    ["BA", "BIH", "Bosna in Hercegovina", "Bosnia and Herzegovina"],
    ["ME", "MNE", "Črna gora", "Montenegro"],
    ["MK", "MKD", "Severna Makedonija", "North Macedonia"],
    ["AL", "ALB", "Albanija", "Albania"],
    ["XK", "XKX", "Kosovo", "Kosovo", ["KOS", "UVK", "XKV"]],
    ["AT", "AUT", "Avstrija", "Austria"],
    ["IT", "ITA", "Italija", "Italy"],
    ["HU", "HUN", "Madžarska", "Hungary"],
    ["DE", "DEU", "Nemčija", "Germany"],
    ["FR", "FRA", "Francija", "France"],
    ["BE", "BEL", "Belgija", "Belgium"],
    ["NL", "NLD", "Nizozemska", "Netherlands"],
    ["LU", "LUX", "Luksemburg", "Luxembourg"],
    ["IE", "IRL", "Irska", "Ireland"],
    ["DK", "DNK", "Danska", "Denmark"],
    ["SE", "SWE", "Švedska", "Sweden"],
    ["FI", "FIN", "Finska", "Finland"],
    ["EE", "EST", "Estonija", "Estonia"],
    ["LV", "LVA", "Latvija", "Latvia"],
    ["LT", "LTU", "Litva", "Lithuania"],
    ["PL", "POL", "Poljska", "Poland"],
    ["CZ", "CZE", "Češka", "Czechia"],
    ["SK", "SVK", "Slovaška", "Slovakia"],
    ["RO", "ROU", "Romunija", "Romania"],
    ["BG", "BGR", "Bolgarija", "Bulgaria"],
    ["GR", "GRC", "Grčija", "Greece", ["EL"]],
    ["CY", "CYP", "Ciper", "Cyprus"],
    ["MT", "MLT", "Malta", "Malta"],
    ["PT", "PRT", "Portugalska", "Portugal"],
    ["ES", "ESP", "Španija", "Spain"],
    ["TR", "TUR", "Turčija", "Türkiye"],
    ["UA", "UKR", "Ukrajina", "Ukraine"],
    ["MD", "MDA", "Moldavija", "Moldova"],
    ["GB", "GBR", "Združeno kraljestvo", "United Kingdom", ["UK"]],
    ["CH", "CHE", "Švica", "Switzerland"],
    ["NO", "NOR", "Norveška", "Norway"],
    ["US", "USA", "ZDA", "United States"],
    ["CN", "CHN", "Kitajska", "China"],
    ["RU", "RUS", "Rusija", "Russia"],
  ];
  const COUNTRY_GROUPS = {
    wb6: { sl: "Zahodni Balkan (6)", en: "Western Balkans 6", m: ["RS", "BA", "ME", "MK", "AL", "XK"] },
    exyu: { sl: "Nekdanja Jugoslavija", en: "Former Yugoslavia", m: ["SI", "HR", "BA", "RS", "ME", "MK", "XK"] },
    sosede: { sl: "Slovenija in sosede", en: "Slovenia and neighbours", m: ["SI", "AT", "IT", "HU", "HR"] },
    eu27: { sl: "EU-27", en: "EU-27", m: ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"] },
    cee: { sl: "Srednja in vzhodna Evropa", en: "Central and Eastern Europe", m: ["SI", "HR", "HU", "CZ", "SK", "PL", "RO", "BG", "EE", "LV", "LT"] },
  };

  /* ------------------------------------------------------------------ */
  /* Utilities                                                            */
  /* ------------------------------------------------------------------ */

  class StatError extends Error {
    constructor(message, info) { super(message); this.name = "StatError"; this.info = info || {}; }
  }

  function configure(o) { Object.assign(CFG, o || {}); return { ...CFG }; }
  function _fetch() { return CFG.fetch || global.fetch.bind(global); }
  function parseXML(text) {
    const P = CFG.DOMParser || global.DOMParser;
    if (!P) throw new StatError("DOMParser ni na voljo (v Nodu nastavite ISRStat.configure({ DOMParser })).");
    const doc = new P().parseFromString(text, "application/xml");
    return doc;
  }
  function host(u) { try { return new URL(u).host; } catch (_) { return u; } }

  function norm(s) {
    return String(s == null ? "" : s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function normKey(s) { return norm(s).replace(/[^a-z0-9]/g, ""); }

  function pad(n) { return String(n).padStart(2, "0"); }
  const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function fmtDateSL(d) { d = new Date(d); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; }
  function fmtDateEN(d) { d = new Date(d); return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
  function isoDate(d) { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function compactDate(d) { d = new Date(d); return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; }

  function pxFile(id) { const p = String(id).split("/"); return p[p.length - 1]; }
  function pxWebUrl(base, lang, db, id) {
    const parts = String(id).split("/");
    const file = parts.pop();
    const d = db || parts.shift();
    const folders = parts.length ? "__" + parts.join("__") : "";
    return `${base}/${lang}/${d}/${d}${folders}/${file}/`;
  }
  function flowParts(id) {
    const [agency, fid, version] = String(id).split(",");
    return { agency, id: fid, version: version || "latest" };
  }

  async function request(url, opts) {
    opts = opts || {};
    const src = opts.src || null;
    let u = url;
    if (src && src.needsProxy) {
      if (!CFG.proxy) throw new StatError(`Vir ${src.abbr} potrebuje posrednika (proxy), ki še ni nastavljen.`, { code: "NO_PROXY" });
      u = CFG.proxy.replace(/\/$/, "") + "/?url=" + encodeURIComponent(url);
    }
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), opts.timeout || CFG.timeout) : null;
    let r;
    try {
      r = await _fetch()(u, { method: opts.method || "GET", body: opts.body || undefined, headers: opts.headers || {}, signal: ctrl ? ctrl.signal : undefined });
    } catch (e) {
      const aborted = e && e.name === "AbortError";
      if (!aborted && !opts._retried && (opts.method || "GET") === "GET") {
        // some servers (World Bank, ECB) drop CORS headers on throttled or cached answers now and then
        if (timer) clearTimeout(timer);
        await sleep(1200);
        try { return await request(url, Object.assign({}, opts, { _retried: true })); } catch (e2) { if (!CFG.proxy) throw e2; }
      }
      if (!aborted && CFG.proxy && !opts._viaProxy && !(src && src.needsProxy) && /^https?:/.test(url)) {
        // the source refused a direct browser call (often an error page without CORS headers): try the ISR proxy
        if (timer) clearTimeout(timer);
        return request(url, Object.assign({}, opts, { _viaProxy: true, src: Object.assign({}, src || { abbr: host(url) }, { needsProxy: true }) }));
      }
      throw new StatError(aborted
        ? `Strežnik ${host(url)} se ni odzval v ${Math.round((opts.timeout || CFG.timeout) / 1000)} s.`
        : `Strežnik ${host(url)} ni vrnil berljivega odgovora: poizvedba je morda napačna ali prevelika, strežnik pa ob napaki ne dovoli branja iz brskalnika. Preverite izbor ali poskusite znova.`, { code: aborted ? "TIMEOUT" : "NETWORK", url, cause: e && e.message });
    } finally { if (timer) clearTimeout(timer); }
    if (!r.ok) {
      let t = "";
      try { t = await r.text(); } catch (_) { /* ignore */ }
      throw new StatError(httpMessage(r.status, t), { code: "HTTP", status: r.status, url, body: t.slice(0, 800) });
    }
    const as = opts.as || "json";
    const text = await r.text();
    if (as === "text") return text;
    try { return JSON.parse(text.replace(/^﻿/, "")); }
    catch (e) { throw new StatError("Odgovor strežnika ni veljaven JSON.", { url, body: text.slice(0, 300) }); }
  }

  function httpMessage(status, body) {
    let detail = "";
    try {
      const j = JSON.parse(String(body).replace(/^﻿/, ""));
      if (j && j.error) detail = Array.isArray(j.error) ? j.error.map(e => e.label || e.message).join("; ") : (j.error.label || j.error.message || "");
    } catch (_) {
      const m = String(body).match(/<(?:\w+:)?Text[^>]*>([^<]{3,300})</) || String(body).match(/^([^<{]{3,200})$/);
      if (m) detail = m[1].trim();
    }
    const base = {
      400: "Strežnik je zavrnil poizvedbo (preverite izbor).",
      403: "Strežnik je zavrnil poizvedbo, verjetno je izbor prevelik.",
      404: "Za ta izbor ni podatkov ali tabela ne obstaja.",
      413: "Izbor je prevelik. Zožite ga.",
      429: "Preveč zahtev v kratkem času. Počakajte nekaj sekund in poskusite znova.",
      500: "Napaka na strežniku vira.",
      503: "Vir trenutno ni dosegljiv.",
    }[status] || `Napaka ${status}.`;
    return detail ? `${base} (${detail})` : base;
  }

  // RFC 4180 CSV parser
  function parseCSV(text, sep) {
    sep = sep || ",";
    text = String(text).replace(/^﻿/, "");
    const rows = [];
    let row = [], field = "", i = 0, q = false;
    const n = text.length;
    while (i < n) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } q = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { q = true; i++; continue; }
      if (c === sep) { row.push(field); field = ""; i++; continue; }
      if (c === "\r") { i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0];
    return rows.slice(1).filter(r => r.length > 1 || (r[0] || "").length).map(r => {
      const o = {};
      head.forEach((h, k) => { o[h] = r[k] === undefined ? "" : r[k]; });
      return o;
    });
  }

  function num(v) {
    if (v === null || v === undefined || v === "") return null;
    if (typeof v === "number") return isFinite(v) ? v : null;
    const x = Number(String(v).replace(",", "."));
    return isFinite(x) ? x : null;
  }

  // Sortable key for period labels: 2024, 2024M03, 2024-03, 2024Q1, 2024-Q1, 2024S2, 2024-W05, 2024-03-15
  function timeKey(t) {
    const s = String(t);
    let m;
    if ((m = s.match(/^(\d{4})$/))) return m[1] + "-00-00";
    if ((m = s.match(/^(\d{4})[-M]?(\d{1,2})$/i)) && s.length > 4) return `${m[1]}-${pad(m[2])}-00`;
    if ((m = s.match(/^(\d{4})-?Q([1-4])$/i))) return `${m[1]}-${pad(m[2] * 3)}-q`;
    if ((m = s.match(/^(\d{4})-?S([12])$/i))) return `${m[1]}-${pad(m[2] * 6)}-s`;
    if ((m = s.match(/^(\d{4})-?W(\d{1,2})$/i))) return `${m[1]}-w${pad(m[2])}`;
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return `${m[1]}-${m[2]}-${m[3]}`;
    if ((m = s.match(/^(\d{4})M(\d{2})D(\d{2})$/))) return `${m[1]}-${m[2]}-${m[3]}`;
    return s;
  }
  function periodStart(t) {
    const s = String(t);
    let m;
    if ((m = s.match(/^(\d{4})$/))) return new Date(+m[1], 0, 1);
    if ((m = s.match(/^(\d{4})[-M](\d{1,2})$/i))) return new Date(+m[1], +m[2] - 1, 1);
    if ((m = s.match(/^(\d{4})-?Q([1-4])$/i))) return new Date(+m[1], (+m[2] - 1) * 3, 1);
    if ((m = s.match(/^(\d{4})-?S([12])$/i))) return new Date(+m[1], (+m[2] - 1) * 6, 1);
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return new Date(+m[1], +m[2] - 1, +m[3]);
    if ((m = s.match(/^(\d{4})/))) return new Date(+m[1], 0, 1);
    return null;
  }
  function sortTimes(arr) { return arr.slice().sort((a, b) => (timeKey(a) < timeKey(b) ? -1 : timeKey(a) > timeKey(b) ? 1 : 0)); }

  const PROV_RE = /(provisional|preliminar|za[čc]asn|ocena|ocenjen|estimat|privremen|prethodn|provizor|paraprak)/i;
  const FORECAST_RE = /(forecast|projection|napoved|projekcij)/i;
  const PARTIAL_RE = /(M0?1\s*[-–]\s*M\d{1,2}|Q1\s*[-–]\s*Q[23]|kumulativ|cumulative|jan\.?\s*[-–]|januar\s*[-–])/i;

  function nodeText(el, name) {
    if (!el) return "";
    const c = el.getElementsByTagNameNS("*", name)[0];
    return c ? c.textContent.trim() : "";
  }
  function localized(el, name, lang) {
    if (!el) return "";
    const kids = Array.from(el.childNodes).filter(c => c.nodeType === 1 && c.localName === name);
    if (!kids.length) return "";
    const pick = (l) => kids.find(k => (k.getAttribute("xml:lang") || k.getAttributeNS("http://www.w3.org/XML/1998/namespace", "lang") || "").toLowerCase().startsWith(l));
    const k = pick(lang) || pick("en") || kids[0];
    return k.textContent.trim();
  }
  function byTag(doc, name) { return Array.from(doc.getElementsByTagNameNS("*", name)); }
  function childEls(el, name) { return Array.from(el.childNodes).filter(c => c.nodeType === 1 && c.localName === name); }

  /* ------------------------------------------------------------------ */
  /* JSON-stat 2.0 → tidy rows                                            */
  /* ------------------------------------------------------------------ */

  function fromJsonStat(js) {
    const ids = js.id || (js.dimension && js.dimension.id) || [];
    const sizes = js.size || (js.dimension && js.dimension.size) || [];
    const D = js.dimension;
    const role = js.role || {};
    const dims = ids.map(id => {
      const d = D[id] || {};
      const cat = d.category || {};
      const idx = cat.index;
      let codes;
      if (Array.isArray(idx)) codes = idx.slice();
      else if (idx) codes = Object.keys(idx).sort((a, b) => idx[a] - idx[b]);
      else codes = Object.keys(cat.label || {});
      const labels = cat.label || {};
      let r = null;
      if ((role.time || []).includes(id) || /^(time|time_period|leto|mesec|četrtletje|cetrtletje|year|godina|vit|period)$/i.test(id)) r = "time";
      else if ((role.geo || []).includes(id)) r = "geo";
      else if ((role.metric || []).includes(id)) r = "metric";
      return { id, label: d.label || id, role: r, values: codes.map(c => ({ id: c, label: labels[c] != null ? String(labels[c]) : c })), unit: cat.unit || null };
    });
    const values = js.value || [];
    const status = js.status || null;
    const getV = Array.isArray(values) ? (i) => values[i] : (i) => values[String(i)];
    const getS = !status ? () => null : typeof status === "string" ? () => status : Array.isArray(status) ? (i) => status[i] || null : (i) => status[String(i)] || null;
    let total = 1;
    sizes.forEach(s => { total *= s; });
    const rows = [];
    const strides = [];
    let acc = 1;
    for (let a = sizes.length - 1; a >= 0; a--) { strides[a] = acc; acc *= sizes[a]; }
    for (let i = 0; i < total; i++) {
      const v = getV(i);
      const st = getS(i);
      if ((v === null || v === undefined) && !st) continue;
      const row = {};
      for (let a = 0; a < dims.length; a++) {
        const k = Math.floor(i / strides[a]) % sizes[a];
        row[dims[a].id] = dims[a].values[k].id;
      }
      row.value = (v === null || v === undefined) ? null : Number(v);
      if (st) row.status = st;
      rows.push(row);
    }
    return { dims, rows };
  }

  /* ------------------------------------------------------------------ */
  /* SDMX-ML structure parsing (dataflow + DSD + codelists + concepts)    */
  /* ------------------------------------------------------------------ */

  function parseFlows(xml, lang) {
    const doc = parseXML(xml);
    return byTag(doc, "Dataflow").map(df => {
      const id = df.getAttribute("id"), agency = df.getAttribute("agencyID"), version = df.getAttribute("version");
      if (!id) return null;
      return { type: "table", id: `${agency},${id},${version}`, label: localized(df, "Name", lang) || id, code: id };
    }).filter(Boolean);
  }

  function parseStructure(xml, lang) {
    const doc = parseXML(xml);
    const err = byTag(doc, "parsererror")[0];
    if (err) throw new StatError("Strukture podatkov ni bilo mogoče prebrati.");
    const df = byTag(doc, "Dataflow")[0];
    const title = df ? localized(df, "Name", lang) : "";
    const annotations = {};
    if (df) byTag(df, "Annotation").forEach(a => {
      const t = nodeText(a, "AnnotationType"), ti = nodeText(a, "AnnotationTitle"), tx = nodeText(a, "AnnotationText");
      if (t) annotations[t] = ti || tx;
    });
    const codelists = {};
    byTag(doc, "Codelist").forEach(cl => {
      const id = cl.getAttribute("id"), ag = cl.getAttribute("agencyID");
      const codes = childEls(cl, "Code").map(c => ({ id: c.getAttribute("id"), label: localized(c, "Name", lang) || c.getAttribute("id"), parent: (childEls(c, "Parent")[0] && byTag(childEls(c, "Parent")[0], "Ref")[0]) ? byTag(childEls(c, "Parent")[0], "Ref")[0].getAttribute("id") : null }));
      codelists[`${ag}:${id}`] = codes;
      if (!codelists[id]) codelists[id] = codes;
    });
    const concepts = {}, conceptEnum = {};
    byTag(doc, "ConceptScheme").forEach(cs => {
      const sid = cs.getAttribute("id");
      childEls(cs, "Concept").forEach(c => {
        const cid = c.getAttribute("id");
        const name = localized(c, "Name", lang);
        concepts[`${sid}:${cid}`] = name;
        if (!concepts[cid]) concepts[cid] = name;
        const cr = childEls(c, "CoreRepresentation")[0];
        const en = cr ? byTag(cr, "Enumeration")[0] : null;
        const ref = en ? byTag(en, "Ref")[0] : null;
        if (ref) { const k = { agency: ref.getAttribute("agencyID"), id: ref.getAttribute("id") }; conceptEnum[`${sid}:${cid}`] = k; if (!conceptEnum[cid]) conceptEnum[cid] = k; }
      });
    });
    const clFor = (ref) => ref ? (codelists[`${ref.agency}:${ref.id}`] || codelists[ref.id] || []) : [];
    const dsd = byTag(doc, "DataStructure")[0];
    if (!dsd) throw new StatError("Struktura podatkov manjka v odgovoru.");
    const dl = byTag(dsd, "DimensionList")[0];
    const dimEls = dl ? childEls(dl, "Dimension") : [];
    const dims = dimEls.map(d => {
      const id = d.getAttribute("id");
      const pos = Number(d.getAttribute("position") || 0);
      const ci = byTag(d, "ConceptIdentity")[0];
      const cref = ci ? byTag(ci, "Ref")[0] : null;
      const conceptId = cref ? cref.getAttribute("id") : id;
      const scheme = cref ? cref.getAttribute("maintainableParentID") : "";
      const lr = childEls(d, "LocalRepresentation")[0];
      const en = lr ? byTag(lr, "Enumeration")[0] : null;
      const r0 = en ? byTag(en, "Ref")[0] : null;
      const ref = r0 ? { agency: r0.getAttribute("agencyID"), id: r0.getAttribute("id") } : (conceptEnum[`${scheme}:${conceptId}`] || conceptEnum[conceptId] || null);
      const cl = clFor(ref);
      return { id, pos, label: concepts[`${scheme}:${conceptId}`] || concepts[conceptId] || concepts[id] || id, values: cl.map(c => ({ id: c.id, label: c.label })) };
    }).sort((a, b) => a.pos - b.pos);
    const tdEl = dl ? childEls(dl, "TimeDimension")[0] : null;
    const timeId = tdEl ? tdEl.getAttribute("id") : "TIME_PERIOD";
    // attribute codelists we care about (status flags)
    const flags = {};
    const al = byTag(dsd, "AttributeList")[0];
    (al ? childEls(al, "Attribute") : []).forEach(a => {
      const id = a.getAttribute("id");
      if (!/OBS_STATUS|OBS_FLAG/i.test(id)) return;
      const en = byTag(a, "Enumeration")[0];
      const ref = en ? byTag(en, "Ref")[0] : null;
      const cl = ref ? (codelists[`${ref.getAttribute("agencyID")}:${ref.getAttribute("id")}`] || codelists[ref.getAttribute("id")] || []) : [];
      cl.forEach(c => { flags[c.id] = c.label; });
    });
    // content constraints, if any came along
    const constraint = {};
    byTag(doc, "KeyValue").forEach(kv => {
      const id = kv.getAttribute("id");
      const vals = childEls(kv, "Value").map(v => v.textContent.trim());
      if (vals.length) constraint[id] = (constraint[id] || []).concat(vals);
    });
    return { title, annotations, dims, timeId, flags, constraint };
  }

  function parseConstraint(xml) {
    const doc = parseXML(xml);
    const out = {};
    byTag(doc, "KeyValue").forEach(kv => {
      const id = kv.getAttribute("id");
      const vals = childEls(kv, "Value").map(v => v.textContent.trim());
      if (vals.length) out[id] = (out[id] || []).concat(vals);
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Result object, provisional detection, citations, exports            */
  /* ------------------------------------------------------------------ */

  function detectTimeDim(dims) {
    return dims.find(d => d.role === "time") || null;
  }

  function finishResult(o) {
    // o: { source, table, title, lang, dims, rows, updated, url, web, query, notes, flags, doi, unit }
    const src = SOURCES[o.source];
    const pulledAt = o.pulledAt || new Date().toISOString();
    const labels = {};
    o.dims.forEach(d => { labels[d.id] = {}; d.values.forEach(v => { labels[d.id][v.id] = v.label; }); });
    // keep only values present in rows, in the dimension's own order
    const present = {};
    o.dims.forEach(d => { present[d.id] = new Set(); });
    o.rows.forEach(r => { o.dims.forEach(d => { if (r[d.id] !== undefined) present[d.id].add(String(r[d.id])); }); });
    o.dims.forEach(d => {
      d.values = d.values.filter(v => present[d.id].has(String(v.id)));
      // values seen in rows but missing from the dimension list (SDMX CSV): add
      const known = new Set(d.values.map(v => String(v.id)));
      present[d.id].forEach(id => { if (!known.has(id)) d.values.push({ id, label: labels[d.id][id] || id }); });
      if (d.role === "time") {
        const order = sortTimes(d.values.map(v => v.id));
        const map = Object.fromEntries(d.values.map(v => [v.id, v]));
        d.values = order.map(id => map[id]);
      }
    });
    const tdim = detectTimeDim(o.dims);
    const flags = Object.assign({}, o.flags || {});
    const provisional = new Set(), forecast = new Set(), partial = new Set();
    const periodLabels = {};
    const now = new Date();
    if (tdim) {
      tdim.values.forEach(v => {
        if (String(v.label) !== String(v.id)) periodLabels[v.id] = v.label;
        if (PROV_RE.test(v.label)) provisional.add(v.id);
        if (FORECAST_RE.test(v.label)) forecast.add(v.id);
        if (PARTIAL_RE.test(v.label) && /^\d{4}$/.test(v.id)) partial.add(v.id);
        const ps = periodStart(v.id);
        if (ps && ps > now) forecast.add(v.id);
      });
    }
    o.rows.forEach(r => {
      if (!r.status || !tdim) return;
      const st = String(r.status);
      const label = flags[st] || "";
      if (/^p$/i.test(st) || PROV_RE.test(label)) provisional.add(r[tdim.id]);
      if (/^f$/i.test(st) && /forecast|projection/i.test(label)) forecast.add(r[tdim.id]);
    });
    const res = {
      isrstat: VERSION,
      source: o.source,
      sourceName: src.name,
      table: o.table,
      tableCode: o.tableCode || pxFile(o.table).replace(/\.px$/i, ""),
      title: cleanTitle(o.title || o.table),
      lang: o.lang,
      dims: o.dims,
      rows: o.rows,
      labels: Object.fromEntries(o.dims.map(d => [d.id, Object.fromEntries(d.values.map(v => [v.id, v.label]))])),
      timeDim: tdim ? tdim.id : null,
      flags,
      provisional: sortTimes(Array.from(provisional)),
      forecast: sortTimes(Array.from(forecast)),
      partial: sortTimes(Array.from(partial)),
      periodLabels,
      updated: o.updated || null,
      pulledAt,
      url: o.url,
      web: o.web || o.url,
      doi: o.doi || null,
      unit: o.unit || null,
      notes: o.notes || [],
      query: o.query,
      count: o.rows.length,
      snapshot: o.snapshot || null,
    };
    res.citation = cite(res);
    return res;
  }

  function cleanTitle(t) {
    return String(t || "").replace(/\s+/g, " ").replace(/\s*\.\s*$/, "").trim();
  }

  function periodSpan(res) {
    if (!res.timeDim) return "";
    const d = res.dims.find(x => x.id === res.timeDim);
    if (!d || !d.values.length) return "";
    const a = d.values[0].id, b = d.values[d.values.length - 1].id;
    return a === b ? a : `${a}–${b}`;
  }

  function instName(src, lang) {
    return (src.inst && (src.inst[lang] || (lang === "sl" ? src.inst.sl : null) || src.inst.en)) || src.abbr;
  }

  function cite(res) {
    const src = SOURCES[res.source];
    const year = new Date(res.updated || res.pulledAt).getFullYear();
    const pulled = res.pulledAt;
    const link = res.doi ? `https://doi.org/${res.doi}` : (res.web || res.url);
    const code = res.tableCode;
    const title = res.title;
    // FDV: institution keeps the language of the source content
    const instSl = res.lang === "sl" ? src.inst.sl : instName(src, res.lang === "en" ? "en" : res.lang);
    const abbrSl = src.abbr && src.abbr !== instSl && !/^Svetovna banka$/.test(src.abbr) ? src.abbr : null;
    const abbrForText = res.lang === "sl" ? (src.abbr || instSl) : ((src.abbrEn || src.abbr) || instSl);
    const desc = (src.desc && src.desc.sl) || "podatkovna zbirka";
    const retrieved = res.doi ? "" : ` Pridobljeno ${fmtDateSL(pulled)} na ${link}`;
    const fdv = `${instSl}${abbrSl && abbrSl !== instSl ? ` [${abbrSl}]` : ""}. (${year}). ${title} (${code}) [${desc}].${res.doi ? " " + link : retrieved}`;
    const inText = `(${abbrForText}, ${year})`;
    const figure = `Vir podatkov: ${abbrForText} (${year}).`;
    const instEn = src.inst.en;
    const apa = `${instEn}. (${year}). ${title} (${code}) [Data set]. ${res.doi ? link : `Retrieved ${fmtDateEN(pulled)}, from ${link}`}`;
    const span = periodSpan(res);
    const prov = (res.partial.length ? `; delno leto: ${res.partial.map(p => res.periodLabels[p] || p).join(", ")}` : "") + (res.provisional.length ? `; začasni podatki: ${res.provisional.join(", ")}` : "");
    const fc = res.forecast.length ? `; napovedi: ${res.forecast[0]}${res.forecast.length > 1 ? "–" + res.forecast[res.forecast.length - 1] : ""}` : "";
    const short = `${src.abbrEn && res.lang !== "sl" ? src.abbrEn : src.abbr}, ${title} (${code})${span ? ", " + span : ""}${prov}${fc}; pridobljeno ${fmtDateSL(pulled)}`;
    return { fdv, inText, figure, apa, short, year, link };
  }

  function toTidy(res, opts) {
    opts = opts || {};
    const cols = [];
    res.dims.forEach(d => { cols.push({ key: d.id, head: d.label, kind: "label" }); cols.push({ key: d.id, head: d.label + "_code", kind: "code" }); });
    cols.push({ key: "value", head: "value", kind: "value" });
    const hasStatus = res.rows.some(r => r.status);
    if (hasStatus) cols.push({ key: "status", head: "status", kind: "status" });
    const out = res.rows.map(r => cols.map(c => {
      if (c.kind === "label") return res.labels[c.key][r[c.key]] != null ? res.labels[c.key][r[c.key]] : r[c.key];
      if (c.kind === "code") return r[c.key];
      if (c.kind === "value") return r.value;
      return r.status || "";
    }));
    return { header: cols.map(c => c.head), rows: out };
  }

  function csvCell(v) {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(res) {
    const t = toTidy(res);
    return [t.header].concat(t.rows).map(r => r.map(csvCell).join(",")).join("\n") + "\n";
  }

  function fileStem(res) {
    const code = String(res.tableCode || "data").replace(/[^A-Za-z0-9_-]+/g, "_");
    return `${res.source}_${code}`;
  }

  /* ------------------------------------------------------------------ */
  /* Adapter: PxWeb                                                       */
  /* ------------------------------------------------------------------ */

  const pxweb = {
    lang(src, lang) { return src.langs.includes(lang) ? lang : src.langs[0]; },
    dbFor(src, lang) { return src.db ? (src.db[lang] || src.db[src.langs[0]]) : null; },
    normId(src, id, lang) {
      id = String(id).replace(/^\/+/, "");
      if (!/\.px$/i.test(id)) id += ".px";
      if (src.key === "bsi" && lang) id = id.replace(/[es]\.px$/i, (lang === "sl" ? "s" : "e") + ".px");
      return id;
    },
    url(src, lang, id) {
      const db = this.dbFor(src, lang);
      return `${src.api}/${lang}/${db ? db + "/" : ""}${id}`;
    },
    async browse(src, path, lang) {
      lang = this.lang(src, lang);
      const db = this.dbFor(src, lang);
      let url = `${src.api}/${lang}/${db ? db + "/" : ""}${path || ""}`;
      if (db || path) url = url.replace(/\/$/, "");
      const nodes = await request(url, { src });
      return nodes.map(n => {
        if (n.dbid) return { type: "folder", id: n.dbid, label: n.text || n.dbid };
        const full = (path ? path.replace(/\/$/, "") + "/" : "") + n.id;
        return { type: n.type === "t" ? "table" : "folder", id: full, label: n.text, updated: n.updated || null, code: n.type === "t" ? n.id.replace(/\.px$/i, "") : null };
      });
    },
    async list(src, lang) {
      lang = this.lang(src, lang);
      if (src.flat) return (await this.browse(src, "", lang)).filter(n => n.type === "table");
      const out = [];
      const walk = async (path, depth) => {
        if (depth > 6) return;
        let nodes;
        for (let attempt = 0; attempt < 3; attempt++) {
          try { nodes = await this.browse(src, path, lang); break; }
          catch (e) { if (e.info && e.info.status === 429) { await sleep(11000); continue; } return; }
        }
        if (!nodes) return;
        for (const n of nodes) {
          if (n.type === "table") out.push(n);
          else { await sleep(CFG.walkDelay); await walk(n.id, depth + 1); }
        }
      };
      await walk("", 0);
      return out;
    },
    async search(src, q, lang) {
      lang = this.lang(src, lang);
      // multi-database servers (DZS) rate-limit hard: use the catalogue when there is one
      if (!src.db) {
        const ck = src.key + ":" + lang;
        const cat = CATALOG_CACHE[ck] || await loadCatalogFile(src.key, lang);
        if (cat && cat.length) { CATALOG_CACHE[ck] = cat; return rankSearch(cat, q); }
      }
      const dbs = src.db ? [this.dbFor(src, lang)] : (await this.browse(src, "", lang)).map(n => n.id);
      const out = [];
      for (const db of dbs) {
        if (!src.db) await sleep(400);
        let hits = [];
        try { hits = await request(`${src.api}/${lang}/${db}?query=${encodeURIComponent(q)}`, { src }); } catch (e) { continue; }
        if (!hits.length && !/\*/.test(q)) {
          const wq = String(q).trim().split(/\s+/).map(w => w.length > 3 ? w + "*" : w).join(" ");
          try { hits = await request(`${src.api}/${lang}/${db}?query=${encodeURIComponent(wq)}`, { src }); } catch (e) { /* ignore */ }
        }
        hits.forEach(h => {
          const p = String(h.path || "").replace(/^\/+|\/+$/g, "");
          const rel = (src.db ? "" : db + "/") + (p ? p + "/" : "") + h.id;
          out.push({ type: "table", id: rel, label: h.title, updated: h.published || null, code: h.id.replace(/\.px$/i, ""), score: h.score });
        });
      }
      return out;
    },
    async meta(src, id, lang, opts) {
      lang = this.lang(src, lang);
      id = this.normId(src, id, lang);
      const url = this.url(src, lang, id);
      const m = await request(url, { src });
      const ALL = COUNTRIES.map(c => c[0]);
      const dims = m.variables.map(v => {
        const isTime = !!v.time;
        const key = normKey(v.code + " " + v.text);
        const d = { id: v.code, label: v.text, role: null, required: !v.elimination, values: v.values.map((c, i) => ({ id: c, label: stripCode(c, v.valueTexts[i]) })) };
        if (isTime) d.role = "time";
        else if (/(drzav|country|countries|geo|zemlj|teritorij|codeofbreakdown|kodaporazdelitve|partner)/.test(key) || (d.values.length >= 5 && countryCodesFor(d, ALL).length >= 4)) d.role = "geo";
        return d;
      });
      let title = cleanTitle(String(m.title).replace(/\s+(po spremenljivkah|by variables|po varijablama)\s*:.*$/i, ""));
      const code = pxFile(id).replace(/\.px$/i, "");
      // PxWeb's own title is often generated ("… po: A, B, C"); the catalogue title reads better
      if (!(opts && opts.title) && (/\bpo:|\bby:|:\s*[A-ZČŠŽ/ ]{3,},/.test(title) || title.length < 8)) {
        try {
          const hits = await this.search(src, code, lang);
          const hit = hits.find(h => pxFile(h.id).toLowerCase() === pxFile(id).toLowerCase());
          if (hit && hit.label) title = cleanTitle(hit.label);
        } catch (_) { /* keep generated title */ }
      }
      return { source: src.key, table: id, tableCode: code, title: (opts && opts.title) || title, lang, dims, url, web: src.web ? src.web(lang, id) : url, updated: null, timeMode: "list" };
    },
    async query(src, id, sel, lang, opts) {
      lang = this.lang(src, lang);
      id = this.normId(src, id, lang);
      const url = this.url(src, lang, id);
      const query = [];
      Object.keys(sel || {}).forEach(code => {
        const s = sel[code];
        if (s === undefined || s === null) return;
        if (s === "*") query.push({ code, selection: { filter: "all", values: ["*"] } });
        else if (s && s.last) query.push({ code, selection: { filter: "top", values: [String(s.last)] } });
        else if (Array.isArray(s) && s.length) query.push({ code, selection: { filter: "item", values: s.map(String) } });
      });
      const js = await request(url, { src, method: "POST", body: JSON.stringify({ query, response: { format: "json-stat2" } }), headers: { "Content-Type": "application/json" } });
      const { dims, rows } = fromJsonStat(js);
      dims.forEach(d => d.values.forEach(v => { v.label = stripCode(v.id, v.label); }));
      // carry roles from meta when available
      const m = opts && opts.meta;
      if (m) dims.forEach(d => { const md = m.dims.find(x => x.id === d.id); if (md && md.role) d.role = md.role; if (md && md.label) d.label = md.label; });
      const notes = [].concat(js.note || []).map(String);
      return finishResult({
        source: src.key, table: id, tableCode: pxFile(id).replace(/\.px$/i, ""),
        title: (opts && opts.title) || (m && m.title) || js.label, lang, dims, rows, updated: js.updated || null,
        url, web: src.web ? src.web(lang, id) : url, query: { source: src.key, table: id, sel, lang }, notes,
        flags: symbolFlags(),
      });
    },
  };

  // PxWeb labels often repeat the code in front ("XS Srbija", "00 Države - SKUPAJ")
  function stripCode(code, label) {
    const c = String(code), l = String(label == null ? c : label);
    return l !== c && l.startsWith(c + " ") && l.length > c.length + 1 ? l.slice(c.length + 1) : l;
  }

  function symbolFlags() {
    return { "..": "ni podatka", "...": "podatek ne obstaja", "-": "ni pojava", "z": "zaupno", "M": "manj zanesljiva ocena", "N": "premalo zanesljiva ocena" };
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ------------------------------------------------------------------ */
  /* Adapter: Eurostat                                                    */
  /* ------------------------------------------------------------------ */

  const eurostat = {
    L(lang) { return ["de", "fr"].includes(lang) ? lang.toUpperCase() : "EN"; },
    async list(src, lang) {
      const js = await request(`${src.api}/sdmx/2.1/dataflow/ESTAT/all?detail=allstubs&format=json&lang=${this.L(lang).toLowerCase()}`, { src, timeout: 120000 });
      const items = (js.link && js.link.item) || [];
      return items.map(it => {
        const ext = it.extension || {};
        let updated = null;
        (ext.annotation || []).forEach(a => { if (/UPDATE_DATA/.test(a.type || "")) updated = a.date || a.title || updated; });
        return { type: "table", id: String(ext.id || "").toLowerCase(), code: String(ext.id || "").toLowerCase(), label: it.label, updated };
      }).filter(x => x.id);
    },
    async search(src, q, lang) {
      const all = await cachedList("eurostat", lang);
      return rankSearch(all, q);
    },
    async meta(src, id, lang) {
      id = String(id).toLowerCase();
      const L = this.L(lang).toLowerCase();
      const [sx, cx] = await Promise.all([
        request(`${src.api}/sdmx/2.1/dataflow/ESTAT/${id}?references=descendants&detail=referencepartial`, { src, as: "text" }),
        request(`${src.api}/sdmx/2.1/contentconstraint/ESTAT/${id}`, { src, as: "text" }).catch(() => ""),
      ]);
      const st = parseStructure(sx, L);
      if (cx) { try { Object.assign(st.constraint, parseConstraint(cx)); } catch (_) { /* ignore */ } }
      const dims = st.dims.map(d => {
        const avail = st.constraint[d.id];
        let values = d.values;
        if (avail) { const set = new Set(avail); values = values.filter(v => set.has(v.id)); }
        return { id: d.id, label: d.label, role: d.id === "geo" ? "geo" : null, required: false, values };
      });
      const times = sortTimes(st.constraint[st.timeId] || st.constraint.TIME_PERIOD || []);
      dims.push({ id: "time", label: "Time", role: "time", required: false, values: times.map(t => ({ id: t, label: t })) });
      const doiM = String(st.annotations.DISSEMINATION_DOI_XML || "").match(/10\.2908\/[A-Za-z0-9_.-]+/);
      const updated = st.annotations.DISSEMINATION_TIMESTAMP_DATA || st.annotations.UPDATE_DATA || null;
      return {
        source: "eurostat", table: id, tableCode: id, title: st.title || id, lang: L, dims,
        url: `${src.api}/statistics/1.0/data/${id}`, web: src.web(lang, id), updated,
        doi: doiM ? doiM[0] : null, timeMode: times.length ? "list" : "range",
        latest: st.annotations.OBS_PERIOD_OVERALL_LATEST || null, oldest: st.annotations.OBS_PERIOD_OVERALL_OLDEST || null,
      };
    },
    async query(src, id, sel, lang, opts) {
      id = String(id).toLowerCase();
      const L = this.L(lang);
      const params = [["format", "JSON"], ["lang", L]];
      Object.keys(sel || {}).forEach(k => {
        const s = sel[k];
        if (k === "time") {
          if (!s || s === "*") return;
          if (s.last) params.push(["lastTimePeriod", String(s.last)]);
          else if (s.from || s.to) { if (s.from) params.push(["sinceTimePeriod", s.from]); if (s.to) params.push(["untilTimePeriod", s.to]); }
          else if (Array.isArray(s)) s.forEach(t => params.push(["time", t]));
          return;
        }
        if (s === "*" || !s) return;
        if (Array.isArray(s)) s.forEach(c => params.push([k, c]));
      });
      const url = `${src.api}/statistics/1.0/data/${id}?` + params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
      const js = await request(url, { src, timeout: 120000 });
      if (js.error) throw new StatError(httpMessage(400, JSON.stringify(js)));
      if (!js.value || (Array.isArray(js.value) ? !js.value.length : !Object.keys(js.value).length)) throw new StatError("Za ta izbor ni podatkov.", { code: "EMPTY", url });
      const { dims, rows } = fromJsonStat(js);
      const m = opts && opts.meta;
      dims.forEach(d => {
        if (d.id === "time") d.role = "time";
        if (d.id === "geo") d.role = "geo";
        if (m) { const md = m.dims.find(x => x.id === d.id); if (md && md.label && md.label !== md.id) d.label = md.label; }
      });
      const ext = js.extension || {};
      const flags = Object.assign({}, (ext.status && ext.status.label) || {});
      const notes = [];
      (ext.annotation || []).forEach(a => { if (a.type === "OBS_FLAG" || a.type === "FOOTNOTE") return; if (a.title && a.type && /NOTE|COMMENT/.test(a.type)) notes.push(a.title); });
      return finishResult({
        source: "eurostat", table: id, tableCode: id, title: (opts && opts.title) || (m && m.title) || js.label, lang: L.toLowerCase(), dims, rows,
        updated: js.updated || (m && m.updated) || null, url, web: src.web(lang, id), doi: m && m.doi,
        query: { source: "eurostat", table: id, sel, lang }, notes, flags,
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Adapter: SDMX 2.1 REST (ECB, OECD, IMF)                              */
  /* ------------------------------------------------------------------ */

  const sdmx = {
    async list(src, lang) {
      const xml = await request(src.flows, { src, as: "text", timeout: 120000 });
      return parseFlows(xml, lang === "fr" ? "fr" : "en");
    },
    async search(src, q, lang) { return rankSearch(await cachedList(src.key, lang), q); },
    async meta(src, id, lang, opts) {
      const p = flowParts(id);
      if (opts && opts.structure) return Object.assign({ source: src.key, table: `${p.agency},${p.id},${p.version}`, tableCode: p.id, lang: "en", url: `${src.api}/data/${p.agency},${p.id},${p.version}`, web: src.web(lang, id), updated: null, timeMode: "range", flags: {}, timeId: "TIME_PERIOD" }, opts.structure, { keyOrder: opts.structure.dims.filter(d => d.role !== "time").map(d => d.id) });
      const det = src.partial ? "&detail=referencepartial" : "";
      const url = `${src.api}/dataflow/${p.agency}/${p.id}/${p.version}?references=descendants${det}`;
      const xml = await request(url, { src, as: "text", timeout: 120000 });
      const st = parseStructure(xml, lang === "fr" ? "fr" : "en");
      const dims = st.dims.map(d => {
        let values = d.values;
        const avail = st.constraint[d.id];
        if (avail && avail.length) { const set = new Set(avail); values = values.filter(v => set.has(v.id)); }
        const role = /^(REF_AREA|COUNTRY|GEO|JURISDICTION|COUNTERPART_AREA|AREA)$/i.test(d.id) ? "geo" : (/^FREQ(UENCY)?$/i.test(d.id) ? "freq" : null);
        return { id: d.id, label: d.label, role, required: false, values };
      });
      dims.push({ id: st.timeId || "TIME_PERIOD", label: "Time period", role: "time", required: false, values: [] });
      return {
        source: src.key, table: `${p.agency},${p.id},${p.version}`, tableCode: p.id, title: st.title || p.id, lang: "en", dims,
        url: `${src.api}/data/${p.agency},${p.id},${p.version}`, web: src.web(lang, id), updated: null,
        timeMode: "range", flags: st.flags, keyOrder: st.dims.map(d => d.id), timeId: st.timeId || "TIME_PERIOD",
      };
    },
    async query(src, id, sel, lang, opts) {
      const p = flowParts(id);
      const m = (opts && opts.meta) || await this.meta(src, id, lang);
      const timeId = m.timeId || "TIME_PERIOD";
      const key = m.keyOrder.map(d => {
        const s = sel[d];
        if (!s || s === "*") return "";
        return Array.isArray(s) ? s.join("+") : "";
      }).join(".");
      const params = [];
      const ts = sel[timeId] || sel.time;
      if (ts && ts !== "*") {
        if (ts.from) params.push("startPeriod=" + encodeURIComponent(ts.from));
        if (ts.to) params.push("endPeriod=" + encodeURIComponent(ts.to));
        if (ts.last) params.push("lastNObservations=" + encodeURIComponent(ts.last));
      }
      const headers = {};
      if (src.csv && src.csv.param) params.push(src.csv.param);
      if (src.csv && src.csv.accept) headers.Accept = src.csv.accept;
      const url = `${src.api}/data/${p.agency},${p.id},${p.version}/${key || "all"}${params.length ? "?" + params.join("&") : ""}`;
      let text;
      try { text = await request(url, { src, as: "text", headers, timeout: 120000 }); }
      catch (e) { if (e.info && e.info.status === 404) throw new StatError("Za ta izbor ni podatkov.", { code: "EMPTY", url }); throw e; }
      const recs = parseCSV(text);
      if (!recs.length) throw new StatError("Za ta izbor ni podatkov.", { code: "EMPTY", url });
      const dims = m.dims.filter(d => d.role !== "time").map(d => ({ id: d.id, label: d.label, role: d.role === "freq" ? null : d.role, values: d.values.slice() }));
      const tdim = { id: timeId, label: m.dims.find(d => d.role === "time").label, role: "time", values: [] };
      const times = new Set();
      const unitCols = ["UNIT_MEASURE", "UNIT", "UNIT_MULT", "CURRENCY", "SCALE"].filter(c => c in recs[0]);
      const rows = recs.map(r => {
        const row = {};
        dims.forEach(d => { row[d.id] = r[d.id] !== undefined ? r[d.id] : ""; });
        row[timeId] = r.TIME_PERIOD || r[timeId];
        times.add(row[timeId]);
        row.value = num(r.OBS_VALUE);
        const st = r.OBS_STATUS || r.OBS_FLAG || "";
        if (st && st !== "A") row.status = st;
        const la = r.LATEST_ACTUAL_ANNUAL_DATA;
        if (!row.status && la && /^\d{4}$/.test(la) && /^\d{4}/.test(row[timeId]) && Number(String(row[timeId]).slice(0, 4)) > Number(la)) row.status = "F";
        return row;
      });
      tdim.values = sortTimes(Array.from(times)).map(t => ({ id: t, label: t }));
      // unit, when constant
      let unit = null;
      if (unitCols.length) {
        const u = unitCols.map(c => { const s = new Set(recs.map(r => r[c])); return s.size === 1 ? `${c}: ${Array.from(s)[0]}` : null; }).filter(Boolean);
        unit = u.join("; ") || null;
      }
      // drop dimensions not present in the CSV (keeps ECB KEY-style responses sane)
      const outDims = dims.filter(d => recs[0][d.id] !== undefined).concat([tdim]);
      return finishResult({
        source: src.key, table: `${p.agency},${p.id},${p.version}`, tableCode: p.id, title: (opts && opts.title) || m.title, lang: "en",
        dims: outDims, rows, updated: null, url, web: src.web(lang, id), query: { source: src.key, table: id, sel, lang },
        flags: Object.assign({ A: "normal value", B: "break", E: "estimated value", F: "forecast value", P: "provisional value", M: "missing" }, m.flags || {}), unit,
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Adapter: ILOSTAT                                                     */
  /* ------------------------------------------------------------------ */

  const ILO_CORE = [
    ["UNE_DEAP_SEX_AGE_RT_A", "Unemployment rate by sex and age (%) – annual"],
    ["UNE_DEAP_SEX_AGE_RT_Q", "Unemployment rate by sex and age (%) – quarterly"],
    ["EMP_DWAP_SEX_AGE_RT_A", "Employment-to-population ratio by sex and age (%) – annual"],
    ["EAP_DWAP_SEX_AGE_RT_A", "Labour force participation rate by sex and age (%) – annual"],
    ["EMP_TEMP_SEX_ECO_NB_A", "Employment by sex and economic activity (thousands) – annual"],
    ["EMP_TEMP_SEX_OCU_NB_A", "Employment by sex and occupation (thousands) – annual"],
    ["EAR_4MTH_SEX_ECO_CUR_NB_A", "Average monthly earnings of employees by sex and economic activity – annual"],
    ["HOW_TEMP_SEX_ECO_NB_A", "Mean weekly hours actually worked per employed person by sex and economic activity – annual"],
    ["EIP_NEET_SEX_RT_A", "Share of youth not in employment, education or training (NEET) by sex (%) – annual"],
    ["SDG_0831_SEX_ECO_RT_A", "Proportion of informal employment in total employment by sex and sector (%) – annual"],
    ["LUU_XLU4_SEX_AGE_RT_A", "Composite rate of labour underutilization by sex and age (%) – annual"],
    ["EMP_2EMP_SEX_STE_NB_A", "Employment by sex and status in employment (thousands) – annual"],
    ["GDP_205U_NOC_NB_A", "Output per worker (GDP constant 2021 international $ at PPP) – annual"],
    ["LAP_2GDP_NOC_RT_A", "Labour income share as a percent of GDP (%) – annual"],
    ["UNE_TUNE_SEX_AGE_NB_A", "Unemployment by sex and age (thousands) – annual"],
    ["POP_XWAP_SEX_AGE_NB_A", "Working-age population by sex and age (thousands) – annual"],
  ];

  const ilo = {
    async list() { return ILO_CORE.map(([id, label]) => ({ type: "table", id, code: id, label })); },
    async search(src, q, lang) { return rankSearch(await cachedList("ilo", lang), q); },
    async meta(src, id, lang) {
      const label = (ILO_CORE.find(x => x[0] === id) || [])[1] || (CATALOG_CACHE.ilo && (CATALOG_CACHE.ilo.find(x => x.id === id) || {}).label) || id;
      return {
        source: "ilo", table: id, tableCode: id, title: label, lang: "en",
        dims: [
          { id: "ref_area", label: "Reference area", role: "geo", required: true, values: COUNTRIES.map(c => ({ id: c[0] === "XK" ? "KOS" : c[1], label: c[3] })) },
          { id: "time", label: "Time", role: "time", required: false, values: [] },
        ],
        url: `${src.api}/data/indicator/?id=${id}`, web: src.web(lang, id), updated: null, timeMode: "range",
        hint: { sl: "ILO vrne vse razčlenitve (spol, starost, dejavnost); filtrirate jih po prenosu.", en: "ILO returns every breakdown; filter after the pull." },
      };
    },
    async query(src, id, sel, lang, opts) {
      const areas = Array.isArray(sel.ref_area) ? sel.ref_area : [];
      if (!areas.length) throw new StatError("Izberite vsaj eno državo.");
      const t = sel.time || {};
      const params = [`id=${encodeURIComponent(id)}`, `ref_area=${areas.map(encodeURIComponent).join("+")}`, "type=both", "format=.csv"];
      if (t.from) params.push("timefrom=" + encodeURIComponent(t.from));
      if (t.to) params.push("timeto=" + encodeURIComponent(t.to));
      const url = `${src.api}/data/indicator/?${params.join("&")}`;
      const text = await request(url, { src, as: "text", timeout: 120000 });
      const recs = parseCSV(text);
      if (!recs.length) throw new StatError("Za ta izbor ni podatkov.", { code: "EMPTY", url });
      const cand = ["ref_area", "source", "sex", "classif1", "classif2", "classif3"].filter(c => c in recs[0]);
      const dims = cand.map(c => {
        const seen = new Map();
        recs.forEach(r => { if (!seen.has(r[c])) seen.set(r[c], r[c + ".label"] || r[c]); });
        const lbl = { ref_area: "Reference area", source: "Source", sex: "Sex", classif1: "Classification 1", classif2: "Classification 2", classif3: "Classification 3" }[c];
        return { id: c, label: lbl, role: c === "ref_area" ? "geo" : null, values: Array.from(seen, ([k, v]) => ({ id: k, label: v })) };
      });
      // name classif dims after their content (e.g. "Age (Youth, adults)") and drop the prefix from values
      dims.forEach(d => {
        if (!/^classif/.test(d.id) || !d.values[0]) return;
        const m = String(d.values[0].label).match(/^([^:]+):\s*/);
        if (m) { d.label = m[1].trim(); d.values.forEach(v => { v.label = String(v.label).replace(/^[^:]+:\s*/, ""); }); }
      });
      // the survey source usually follows the country one to one: keep it as a note, not a dimension
      const notes = [];
      const srcDim = dims.find(d => d.id === "source");
      if (srcDim) {
        const per = new Map();
        recs.forEach(r => { if (!per.has(r.ref_area)) per.set(r.ref_area, new Set()); per.get(r.ref_area).add(r.source); });
        if (Array.from(per.values()).every(s => s.size === 1)) {
          const areaLab = Object.fromEntries(dims[0].values.map(v => [v.id, v.label]));
          const srcLab = Object.fromEntries(srcDim.values.map(v => [v.id, v.label]));
          per.forEach((s, a) => notes.push(`${areaLab[a] || a}: ${srcLab[Array.from(s)[0]] || Array.from(s)[0]}`));
          dims.splice(dims.indexOf(srcDim), 1);
          cand.splice(cand.indexOf("source"), 1);
        }
      }
      const times = sortTimes(Array.from(new Set(recs.map(r => r.time))));
      dims.push({ id: "time", label: "Time", role: "time", values: times.map(x => ({ id: x, label: x })) });
      const flags = {};
      const rows = recs.map(r => {
        const row = {};
        cand.forEach(c => { row[c] = r[c]; });
        row.time = r.time;
        row.value = num(r.obs_value);
        if (r.obs_status) { row.status = r.obs_status; flags[r.obs_status] = r["obs_status.label"] || r.obs_status; }
        return row;
      });
      const title = (recs[0]["indicator.label"]) || (opts && opts.title) || id;
      return finishResult({ source: "ilo", table: id, tableCode: id, title, lang: "en", dims, rows, updated: null, url, web: src.web(lang, id), query: { source: "ilo", table: id, sel, lang }, flags, notes });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Adapter: World Bank API v2                                           */
  /* ------------------------------------------------------------------ */

  let WB_COUNTRIES = null;
  let SNAPSHOT_BASE = "data";
  async function wbSnapshot(id) {
    const safe = String(id).replace(/[^A-Za-z0-9._-]/g, "_");
    return request(`${SNAPSHOT_BASE.replace(/\/$/, "")}/worldbank/${safe}.json`, { timeout: 20000 });
  }
  const worldbank = {
    async list(src) {
      const out = [];
      for (const [sid, tag] of src.wbSources) {
        const js = await request(`${src.api}/source/${sid}/indicators?format=json&per_page=20000`, { src, timeout: 120000 });
        (js[1] || []).forEach(x => out.push({ type: "table", id: x.id, code: x.id, label: `${x.name} [${tag}]`, wbSource: sid }));
      }
      return out;
    },
    async search(src, q, lang) { return rankSearch(await cachedList("worldbank", lang), q); },
    async countries(src) {
      if (WB_COUNTRIES) return WB_COUNTRIES;
      const js = await request(`${src.api}/country?format=json&per_page=400`, { src });
      WB_COUNTRIES = (js[1] || []).map(c => ({ id: c.id, label: c.name, iso2: c.iso2Code, aggregate: c.region && c.region.value === "Aggregates" }));
      return WB_COUNTRIES;
    },
    async meta(src, id, lang) {
      let ind, ctys;
      try { [ind, ctys] = await Promise.all([request(`${src.api}/indicator/${encodeURIComponent(id)}?format=json`, { src, timeout: 12000 }), this.countries(src)]); }
      catch (e) {
        // the World Bank API often refuses browsers; fall back to ISR's weekly copy
        const snap = await wbSnapshot(id).catch(() => { throw e; });
        const cmap = new Map(); snap.rows.forEach(r => cmap.set(r.c, r.n));
        return {
          source: "worldbank", table: id, tableCode: id, title: snap.title || id, lang: "en",
          dims: [{ id: "country", label: "Country", role: "geo", required: true, values: Array.from(cmap, ([c, n]) => ({ id: c, label: n })).sort((a, b) => a.label.localeCompare(b.label)) }, { id: "time", label: "Year", role: "time", required: false, values: [] }],
          url: `${src.api}/indicator/${id}`, web: src.web(lang, id), updated: snap.lastupdated || null, timeMode: "range", note: snap.note || "", sourceOrg: snap.sourceOrg || "", wbSource: snap.wbSource || null, snapshot: snap,
        };
      }
      const x = (ind[1] || [])[0] || {};
      const countries = ctys.filter(c => !c.aggregate).sort((a, b) => a.label.localeCompare(b.label)).concat(ctys.filter(c => c.aggregate).sort((a, b) => a.label.localeCompare(b.label)));
      return {
        source: "worldbank", table: id, tableCode: id, title: x.name || id, lang: "en",
        dims: [
          { id: "country", label: "Country", role: "geo", required: true, values: countries.map(c => ({ id: c.id, label: c.label + (c.aggregate ? " (agregat)" : "") })) },
          { id: "time", label: "Year", role: "time", required: false, values: [] },
        ],
        url: `${src.api}/indicator/${id}`, web: src.web(lang, id), updated: null, timeMode: "range",
        note: x.sourceNote || "", sourceOrg: x.sourceOrganization || "", wbSource: x.source && x.source.id,
      };
    },
    async query(src, id, sel, lang, opts) {
      const ctys = Array.isArray(sel.country) ? sel.country : [];
      if (!ctys.length) throw new StatError("Izberite vsaj eno državo.");
      const t = sel.time || {};
      const params = ["format=json", "per_page=20000"];
      if (t.from || t.to) params.push(`date=${t.from || "1960"}:${t.to || new Date().getFullYear()}`);
      if (t.last) params.push(`mrv=${t.last}`);
      const m = opts && opts.meta;
      if (m && m.wbSource && m.wbSource !== "2") params.push("source=" + m.wbSource);
      const url = `${src.api}/country/${ctys.map(encodeURIComponent).join(";")}/indicator/${encodeURIComponent(id)}?${params.join("&")}`;
      let js;
      try { js = m && m.snapshot ? null : await request(url, { src, timeout: 25000 }); }
      catch (e) { js = null; if (!(e.info && /NETWORK|TIMEOUT/.test(e.info.code))) throw e; }
      if (!js) return this.fromSnapshot(src, id, sel, lang, (m && m.snapshot) || await wbSnapshot(id), url);
      if (!Array.isArray(js) || !js[1]) {
        const msg = js && js[0] && js[0].message ? js[0].message.map(x => x.value).join("; ") : "";
        throw new StatError("Za ta izbor ni podatkov." + (msg ? " (" + msg + ")" : ""), { code: "EMPTY", url });
      }
      const recs = js[1];
      const cMap = new Map(), tSet = new Set();
      const rows = recs.map(r => {
        const code = r.countryiso3code || r.country.id;
        cMap.set(code, r.country.value);
        tSet.add(r.date);
        const row = { country: code, time: r.date, value: r.value === null ? null : Number(r.value) };
        if (r.obs_status) row.status = r.obs_status;
        return row;
      }).filter(r => r.value !== null || r.status);
      if (!rows.length) throw new StatError("Za ta izbor ni podatkov (vse vrednosti so prazne).", { code: "EMPTY", url });
      const order = ctys.filter(c => cMap.has(c)).concat(Array.from(cMap.keys()).filter(c => !ctys.includes(c)));
      const dims = [
        { id: "country", label: "Country", role: "geo", values: order.map(c => ({ id: c, label: cMap.get(c) })) },
        { id: "time", label: "Year", role: "time", values: sortTimes(Array.from(tSet)).map(x => ({ id: x, label: x })) },
      ];
      const title = (recs[0] && recs[0].indicator && recs[0].indicator.value) || (m && m.title) || id;
      return finishResult({ source: "worldbank", table: id, tableCode: id, title, lang: "en", dims, rows, updated: js[0] && js[0].lastupdated, url, web: src.web(lang, id), query: { source: "worldbank", table: id, sel, lang }, flags: {} });
    },
    fromSnapshot(src, id, sel, lang, snap, url) {
      const ctys = Array.isArray(sel.country) ? sel.country : [];
      const t = sel.time || {};
      const from = t.from ? parseInt(t.from, 10) : -Infinity, to = t.to ? parseInt(t.to, 10) : Infinity;
      let recs = snap.rows.filter(r => ctys.includes(r.c) && +r.t >= from && +r.t <= to && r.v !== null);
      if (t.last) { const yrs = Array.from(new Set(recs.map(r => r.t))).sort().slice(-t.last); recs = recs.filter(r => yrs.includes(r.t)); }
      if (!recs.length) throw new StatError("Za ta izbor ni podatkov.", { code: "EMPTY", url });
      const names = new Map(recs.map(r => [r.c, r.n]));
      const dims = [
        { id: "country", label: "Country", role: "geo", values: ctys.filter(c => names.has(c)).map(c => ({ id: c, label: names.get(c) })) },
        { id: "time", label: "Year", role: "time", values: sortTimes(Array.from(new Set(recs.map(r => r.t)))).map(x => ({ id: x, label: x })) },
      ];
      const rows = recs.map(r => ({ country: r.c, time: r.t, value: r.v }));
      return finishResult({
        source: "worldbank", table: id, tableCode: id, title: snap.title || id, lang: "en", dims, rows, updated: snap.lastupdated || null, url, web: src.web(lang, id),
        query: { source: "worldbank", table: id, sel, lang }, flags: {}, pulledAt: snap.pulledAt,
        notes: [`Svetovna banka se ni odzvala; podatki so iz kopije ISR z dne ${fmtDateSL(snap.pulledAt)}.`], snapshot: { pulledAt: snap.pulledAt },
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Catalogs and search                                                  */
  /* ------------------------------------------------------------------ */

  const CATALOG_CACHE = {};
  let CATALOG_BASE = "";

  async function loadCatalogFile(key, lang) {
    if (!CATALOG_BASE) return null;
    const s = SOURCES[key];
    const l = s.langs.includes(lang) ? lang : s.langs[0];
    try {
      const js = await request(`${CATALOG_BASE.replace(/\/$/, "")}/${key}.${l}.json`, { timeout: 30000 });
      return (js.items || []).map(x => ({ type: "table", id: x[0], label: x[1], updated: x[2] || null, code: x[3] || null }));
    } catch (_) { return null; }
  }

  async function cachedList(key, lang) {
    const s = SOURCES[key];
    const l = s.langs.includes(lang) ? lang : s.langs[0];
    const ck = key + ":" + l;
    if (CATALOG_CACHE[ck]) return CATALOG_CACHE[ck];
    let items = await loadCatalogFile(key, l);
    if (!items || !items.length) {
      try { items = await adapter(key).list(s, l); }
      catch (e) { if (e.info && (e.info.code === "NETWORK" || e.info.code === "TIMEOUT")) { await sleep(1500); items = await adapter(key).list(s, l); } else throw e; }
    }
    CATALOG_CACHE[ck] = items;
    if (key === "ilo") CATALOG_CACHE.ilo = items;
    return items;
  }

  function rankSearch(items, q) {
    const toks = norm(q).split(/[\s,;]+/).filter(Boolean);
    if (!toks.length) return [];
    const out = [];
    for (const it of items) {
      const hay = norm(it.label + " " + (it.code || it.id));
      let score = 0, ok = true;
      for (const t of toks) {
        const i = hay.indexOf(t);
        if (i < 0) {
          // tolerate inflection: try the stem (drop up to two final letters) for long tokens
          const stem = t.length >= 6 ? t.slice(0, -2) : null;
          const j = stem ? hay.indexOf(stem) : -1;
          if (j < 0) { ok = false; break; }
          score += 1;
        } else score += (i === 0 ? 4 : /\s/.test(hay[i - 1] || " ") ? 3 : 2);
      }
      if (!ok) continue;
      if (norm(it.code || it.id) === norm(q)) score += 20;
      out.push(Object.assign({ score }, it));
    }
    out.sort((a, b) => b.score - a.score || String(b.updated || "").localeCompare(String(a.updated || "")) || a.label.length - b.label.length);
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                           */
  /* ------------------------------------------------------------------ */

  Object.keys(SOURCES).forEach(k => { SOURCES[k].key = k; });

  function adapter(key) {
    const s = SOURCES[key];
    if (!s) throw new StatError(`Neznan vir: ${key}`);
    const a = { pxweb, eurostat, sdmx, ilo, worldbank }[s.type];
    if (!a) throw new StatError(`Vir ${s.abbr} še ni povezan${s.needsProxy ? " (potreben posrednik)" : ""}.`, { code: "PENDING" });
    return a;
  }
  function src(key) { const s = SOURCES[key]; if (!s) throw new StatError(`Neznan vir: ${key}`); return s; }

  async function search(key, q, lang) {
    lang = lang || CFG.lang;
    const s = src(key), a = adapter(key);
    if (s.type === "pxweb") {
      // server-side search, then fall back to the catalog
      let hits = [];
      try { hits = await a.search(s, q, a.lang(s, lang)); } catch (_) { /* ignore */ }
      if (!hits.length) { try { hits = rankSearch(await cachedList(key, lang), q); } catch (_) { /* ignore */ } }
      // server search is loose (any word); keep the hits that match every word when there are some
      const strict = rankSearch(hits, q);
      return strict.length ? strict : hits.map(h => Object.assign({}, h, { score: 0.5 }));
    }
    return a.search(s, q, lang);
  }

  async function searchAll(q, lang, keys, onProgress) {
    keys = keys || Object.keys(SOURCES).filter(k => SOURCES[k].type !== "pending");
    const out = [];
    await Promise.all(keys.map(async k => {
      try {
        let hits;
        const s = SOURCES[k];
        if (s.type === "pxweb" && !s.flat) hits = await search(k, q, lang);
        else hits = rankSearch(await cachedList(k, lang), q);
        hits.slice(0, 60).forEach(h => out.push(Object.assign({ source: k }, h)));
        if (onProgress) onProgress(k, hits.length, null);
      } catch (e) { if (onProgress) onProgress(k, 0, e); }
    }));
    out.sort((a, b) => (b.score || 0) - (a.score || 0));
    return out;
  }

  async function browse(key, path, lang) {
    const s = src(key), a = adapter(key);
    lang = lang || CFG.lang;
    if (a.browse) return a.browse(s, path, a.lang ? a.lang(s, lang) : lang);
    return cachedList(key, lang);
  }
  async function list(key, lang) { return cachedList(key, lang || CFG.lang); }
  const META_CACHE = new Map();
  async function meta(key, id, lang, opts) {
    const s = src(key);
    const ck = [key, id, lang || CFG.lang, (opts && opts.title) || "", opts && opts.structure ? "static" : ""].join("|");
    if (META_CACHE.has(ck)) return META_CACHE.get(ck);
    const p = (async () => {
      const m = await adapter(key).meta(s, id, lang || CFG.lang, opts);
      m.sourceInfo = { key, abbr: s.abbr, name: s.name, inst: s.inst };
      return m;
    })();
    META_CACHE.set(ck, p);
    try { return await p; } catch (e) { META_CACHE.delete(ck); throw e; }
  }
  async function query(key, id, sel, lang, opts) {
    const s = src(key);
    opts = opts || {};
    if (!opts.meta && (s.type === "sdmx")) opts.meta = await meta(key, id, lang);
    return adapter(key).query(s, id, sel || {}, lang || CFG.lang, opts);
  }

  function countryCodesFor(dim, groupOrIso) {
    const isos = Array.isArray(groupOrIso) ? groupOrIso : (COUNTRY_GROUPS[groupOrIso] ? COUNTRY_GROUPS[groupOrIso].m : [groupOrIso]);
    const out = [];
    const vals = dim.values;
    isos.forEach(iso => {
      const c = COUNTRIES.find(x => x[0] === iso);
      if (!c) return;
      const codes = [c[0], c[1]].concat(c[4] || []);
      let hit = vals.find(v => codes.includes(String(v.id).toUpperCase()));
      if (!hit) {
        const names = [norm(c[2]), norm(c[3])];
        hit = vals.find(v => names.some(n => norm(v.label) === n || norm(v.label).startsWith(n + " ") || norm(v.label).startsWith(n + ",") || norm(v.label).startsWith(n + " (")));
      }
      if (hit && !out.includes(hit.id)) out.push(hit.id);
    });
    return out;
  }

  // Estimate the number of cells a selection would return
  function estimateCells(m, sel) {
    let n = 1;
    m.dims.forEach(d => {
      const s = sel[d.id];
      if (Array.isArray(s)) n *= Math.max(1, s.length);
      else if (s && s.last) n *= s.last;
      else if (s === "*" || s === undefined) n *= Math.max(1, d.values.length || (d.role === "time" ? 30 : 1));
      else if (s && (s.from || s.to)) {
        const a = parseInt(s.from || "1990", 10), b = parseInt(s.to || String(new Date().getFullYear()), 10);
        n *= Math.max(1, (b - a + 1));
      }
    });
    return n;
  }

  const ISRStat = {
    VERSION, SOURCES, GROUPS, COUNTRIES, COUNTRY_GROUPS, StatError,
    configure, setCatalogBase(u) { CATALOG_BASE = u; }, setSnapshotBase(u) { SNAPSHOT_BASE = u; },
    search, searchAll, browse, list, meta, query,
    toCSV, toTidy, fileStem, cite, countryCodesFor, estimateCells,
    util: { norm, parseCSV, sortTimes, timeKey, periodStart, fmtDateSL, fmtDateEN, isoDate, compactDate, fromJsonStat, parseStructure, parseFlows, rankSearch },
    _cache: CATALOG_CACHE,
    _internal: { pxweb, eurostat, sdmx, ilo, worldbank, request, finishResult, parseStructure, parseCSV, fromJsonStat, rankSearch, cachedList, httpMessage, num, sortTimes, flowParts, cite },
  };

  if (typeof module === "object" && module.exports) module.exports = ISRStat;
  global.ISRStat = ISRStat;
})(typeof globalThis !== "undefined" ? globalThis : this);
