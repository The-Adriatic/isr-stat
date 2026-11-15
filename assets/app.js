/* ISR Stat — vmesnik
 * Navigacija: Teme › kazalnik, Države › profil države, Viri › tabela.
 * Kazalnik je pripravljena poizvedba: izberete samo države in obdobje.
 * Podatki se pokažejo takoj in se ob vsaki spremembi osvežijo sami.
 */
(function () {
  "use strict";
  const S = window.ISRStat, C = window.ISRChart;
  const TOPICS = window.ISR_TOPICS, INDS = window.ISR_INDICATORS, CPAGES = window.ISR_COUNTRY_PAGES;
  const CONFIG = window.ISR_CONFIG || {};
  S.setCatalogBase(CONFIG.catalog || "catalog");
  if (CONFIG.proxy) S.configure({ proxy: CONFIG.proxy });

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* ignore */ } },
  };

  /* ---------------- words ---------------- */
  const I = {
    sl: {
      app: "Statistika", inst: "Inštitut za strateške rešitve (ISR)",
      nav: { topics: "Teme", countries: "Države", sources: "Viri", library: "Knjižnica" }, find: "Išči",
      heroT: "Uradna statistika, preprosto",
      heroL: "Izberite temo ali državo. Podatki pridejo neposredno od SURS, Banke Slovenije, Eurostata, IMF, ILO, ECB in Svetovne banke, vsak z navedbo vira po pravilih FDV.",
      searchPh: "Ali poiščite kar koli, npr. izvoz Srbija, inflacija, brezposelnost …", searching: "Iščem", none: "Nič ne ustreza. Poskusite z drugo besedo ali v angleščini.",
      topics: "Teme", countries: "Države", shared: "Pripravljene poizvedbe", mine: "Moje shranjene", sources: "Viri", soon: "kmalu", allTopics: "Vse teme", allCountries: "Vse države",
      groups: { si: "Slovenija", int: "EU in svet", wb: "Regija" },
      updated: "posodobljeno", atSource: "pri viru", fullTable: "celotna tabela",
      loadingMeta: "Pripravljam …", loading: "Nalagam podatke …", big: "Izbor obsega približno {0} vrednosti.", bigGo: "Vseeno pridobi",
      reqMissing: "Izberite še: {0}.", change: "spremeni", done: "končano", all: "vse", none2: "nič", find2: "Išči med {0} …",
      total: "skupaj", allN: "vse ({0})", andMore: "in še {0}",
      lastP: "zadnje obdobje", lastN: "zadnjih {0}", allPeriods: "vsa obdobja", fromY: "od {0}", toY: "do {0}", latest: "zadnje",
      from: "Od", to: "Do", lastObs: "Zadnjih N", countriesL: "Države", partnersL: "Države partnerice", periodL: "Obdobje", others: "Druge države",
      partial: "<b>{0}</b> je delno leto ({1}) in začasno. Na grafu ni prikazano; s celimi leti ga ne primerjajte.",
      prov: "Začasni podatki: <b>{0}</b>.", fc: "Obdobja <b>{0}</b> so napovedi, ne izmerjeni podatki.",
      isr: "ISR", color: "barvno",
      cite: "Navedba", citeFdv: "V Virih (FDV)", citeText: "V besedilu", citeFig: "Pod sliko", citeApa: "Angleško (APA)", pulled: "Pridobljeno", copy: "kopiraj", copied: "kopirano",
      dl: "Prenesi:", csv: "CSV", xlsx: "Excel", svg: "SVG", png: "PNG", copyTable: "Kopiraj tabelo", link: "Povezava", save: "Shrani",
      saveName: "Ime", saveOk: "Shrani", cancel: "Prekliči", saved: "Shranjeno v Knjižnico.",
      forClaude: "Za Clauda", rows: "Prikazanih prvih {0} vrstic od {1}; izvoz vsebuje vse.", noData: "Za ta izbor ni podatkov.",
      del: "odstrani", sourceSearch: "Išči v viru {0} …", recent: "Nazadnje posodobljene", count: "{0} tabel",
      proxyText: "Strežnik tega vira ne dovoli branja iz brskalnika. Deloval bo, ko bo nastavljen posrednik ISR.",
      about: "O orodju", lang: "English", github: "Koda", related: "Sorodno",
      rules: "Pred objavo: zrcalne statistike se razlikujejo (izvoz A v B ni uvoz B iz A); neposredne naložbe so podatek centralnih bank; delnega leta ne primerjajte s celim; pri majhni osnovi navedite tudi absolutno vrednost.",
      aboutText: ["ISR Stat je vmesnik za uradne statistične API-je, s katerimi dela Inštitut za strateške rešitve (ISR). Brskalnik se z vsakim virom poveže neposredno; na strežniku se nič ne hrani.", "Teme in kazalniki so pripravljene poizvedbe. Pod Viri so vse tabele vseh virov, za tiste, ki iščejo nekaj posebnega.", "Isto kodo (assets/isrstat.js) uporablja Claude, ko za ISR pridobiva podatke, zato podatek v aplikaciji in podatek v Claudovem osnutku izhajata iz iste poizvedbe."],
      palHint: ["↑↓ izbira", "↵ odpre", "esc zapre"], inTime: "v Ljubljani",
      cIntro: "Ključni podatki iz uradnih virov. Kliknite vrstico za graf in primerjavo s Slovenijo.", cNa: "ni podatka", cDown: "vir se ne odziva", cLoading: "nalagam",
      cNoteSI: "Pri Sloveniji niso prikazani kazalniki menjave in naložb s Slovenijo.", indCount: "{0} kazalnikov", libHint: "Pripravljene poizvedbe ureja ISR. Svoje shranite z gumbom Shrani pod tabelo.",
      ex: "Na primer", tableWord: "Tabela",
    },
    en: {
      app: "Statistics", inst: "Institute for Strategic Solutions (ISR)",
      nav: { topics: "Topics", countries: "Countries", sources: "Sources", library: "Library" }, find: "Search",
      heroT: "Official statistics, made simple",
      heroL: "Pick a topic or a country. Data comes straight from SURS, the Bank of Slovenia, Eurostat, the IMF, ILO, ECB and World Bank, each with a citation.",
      searchPh: "Or search anything, e.g. exports Serbia, inflation, unemployment …", searching: "Searching", none: "Nothing matches. Try another word.",
      topics: "Topics", countries: "Countries", shared: "Ready-made queries", mine: "Saved by me", sources: "Sources", soon: "soon", allTopics: "All topics", allCountries: "All countries",
      groups: { si: "Slovenia", int: "EU and world", wb: "Region" },
      updated: "updated", atSource: "at source", fullTable: "full table",
      loadingMeta: "Preparing …", loading: "Loading data …", big: "This selection covers about {0} values.", bigGo: "Fetch anyway",
      reqMissing: "Still to choose: {0}.", change: "change", done: "done", all: "all", none2: "none", find2: "Search {0} values …",
      total: "total", allN: "all ({0})", andMore: "and {0} more",
      lastP: "latest period", lastN: "last {0}", allPeriods: "all periods", fromY: "from {0}", toY: "to {0}", latest: "latest",
      from: "From", to: "To", lastObs: "Last N", countriesL: "Countries", partnersL: "Partner countries", periodL: "Period", others: "Other countries",
      partial: "<b>{0}</b> is a part-year ({1}) and provisional. It is left off the chart; do not compare it with full years.",
      prov: "Provisional data: <b>{0}</b>.", fc: "Periods <b>{0}</b> are projections, not measured data.",
      isr: "ISR", color: "colour",
      cite: "Citation", citeFdv: "Reference list (FDV)", citeText: "In text", citeFig: "Under a figure", citeApa: "English (APA)", pulled: "Pulled", copy: "copy", copied: "copied",
      dl: "Download:", csv: "CSV", xlsx: "Excel", svg: "SVG", png: "PNG", copyTable: "Copy table", link: "Link", save: "Save",
      saveName: "Name", saveOk: "Save", cancel: "Cancel", saved: "Saved to Library.",
      forClaude: "For Claude", rows: "Showing the first {0} of {1} rows; exports contain all.", noData: "No data for this selection.",
      del: "remove", sourceSearch: "Search {0} …", recent: "Recently updated", count: "{0} tables",
      proxyText: "This source's server does not let browsers read it. It will work once the ISR proxy is set up.",
      about: "About", lang: "Slovenščina", github: "Code", related: "Related",
      rules: "Before publishing: mirror statistics differ (A's exports to B are not B's imports from A); FDI comes from central banks; never compare a part-year with a full year; off a small base, give the absolute figure too.",
      aboutText: ["ISR Stat is a front end to the official statistics APIs the Institute for Strategic Solutions (ISR) works with. Your browser talks to each source directly; nothing is stored on a server.", "Topics and indicators are ready-made queries. Sources lists every table of every source, for when you need something specific.", "Claude uses the same code (assets/isrstat.js) when it pulls data for ISR, so a figure in the app and a figure in a Claude draft come from the same query."],
      palHint: ["↑↓ select", "↵ open", "esc close"], inTime: "in Ljubljana",
      cIntro: "Key figures from official sources. Click a row for the chart and a comparison with Slovenia.", cNa: "no data", cDown: "source not responding", cLoading: "loading",
      cNoteSI: "Trade and investment with Slovenia are not shown for Slovenia itself.", indCount: "{0} indicators", libHint: "Ready-made queries are kept by ISR. Save your own with Save under a table.",
      ex: "Try", tableWord: "Table",
    },
  };
  let LANG = store.get("isrstat.lang") || "sl";
  if (!I[LANG]) LANG = "sl";
  function t(k) { let s = I[LANG][k] != null ? I[LANG][k] : I.sl[k]; if (s == null) s = k; for (let i = 1; i < arguments.length; i++) s = String(s).replace("{" + (i - 1) + "}", arguments[i]); return s; }
  function nm(o) { return o ? (o[LANG] || o.sl || o.en) : ""; }

  /* ---------------- helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = (n, d) => new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI", d === undefined ? {} : { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const srcOf = (k) => S.SOURCES[k];
  function fmtDay(s) { if (!s) return ""; const d = new Date(s); if (isNaN(d)) return String(s).slice(0, 10); return LANG === "en" ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : S.util.fmtDateSL(d); }
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.style.display = "block"; clearTimeout(toast._t); toast._t = setTimeout(() => { el.style.display = "none"; }, 1800); }
  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); } catch (_) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } ta.remove(); }
    if (btn) { const o = btn.textContent; btn.textContent = t("copied"); setTimeout(() => { btn.textContent = o; }, 1400); } else toast(t("copied"));
  }
  function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  const b64e = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function b64d(s) { try { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (_) { return null; } }
  function dataLangFor(src, want) { if (want && src.langs.includes(want)) return want; if (src.langs.includes(LANG)) return LANG; if (src.langs.includes("en")) return "en"; return src.langs[0]; }
  function sentence(s) { s = String(s || ""); return s === s.toUpperCase() && /[A-ZČŠŽ]/.test(s) ? s.charAt(0) + s.slice(1).toLowerCase() : s; }
  function debounce(fn, ms) { let h; return function () { const a = arguments; clearTimeout(h); h = setTimeout(() => fn.apply(null, a), ms); }; }
  function srcAbbr(k) { const s = srcOf(k); return s ? (s.short || (LANG === "en" && s.abbrEn ? s.abbrEn : s.abbr)) : k; }
  function href(o) { const p = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") p.set(k, v); }); return "?" + p.toString(); }
  const tableHref = (source, id, extra) => href(Object.assign({ v: "table", s: source, t: id }, extra || {}));
  const country = (iso) => S.COUNTRIES.find(c => c[0] === iso);
  const cName = (iso) => { const c = country(iso); return c ? (LANG === "en" ? c[3] : c[2]) : iso; };

  const DIM_SL = [
    [/^(ref_area|geo|country|REF_AREA|COUNTRY|JURISDICTION)$/i, "Država"], [/^(time|TIME_PERIOD)$/i, "Obdobje"], [/^sex$/i, "Spol"],
    [/^(freq|FREQUENCY)$/i, "Pogostost"], [/^(unit|UNIT_MEASURE|UNIT)$/i, "Enota"], [/^na_item$/i, "Kazalnik"], [/^INDICATOR$/i, "Kazalnik"],
    [/^CURRENCY$/i, "Valuta"], [/^CURRENCY_DENOM$/i, "Proti valuti"], [/^(s_adj|ADJUSTMENT)$/i, "Desezoniranje"], [/^TRANSFORMATION$/i, "Preračun"],
  ];
  function dimLabel(d) {
    if (st.ind) {
      if (d.id === st.ind.geo) return st.ind.partner ? t("partnersL") : t("countriesL");
      if (d.role === "time") return t("periodL");
      if (st.ind.choices && st.ind.choices[d.id]) return nm(st.ind.choices[d.id].label);
    }
    if (LANG === "sl") {
      for (const [re, l] of DIM_SL) if (re.test(d.id)) return l;
      if (/^classif\d$/.test(d.id) && /^Age\b/i.test(d.label)) return "Starost";
      if (/^classif\d$/.test(d.id) && /economic activity/i.test(d.label)) return "Dejavnost";
    }
    return sentence(d.label);
  }
  const LOCAL_SL = { SEX_T: "skupaj", SEX_M: "moški", SEX_F: "ženske", SEX_O: "drugo" };

  /* ---------------- state + routing ---------------- */
  const st = { ind: null, meta: null, sel: {}, res: null, local: {}, open: null, token: 0, chart: { mode: "isr", focus: null, title: "", subtitle: "" }, stem: "", source: null, table: null, lang: null, title: null, forceBig: false, geoMap: null };
  let inApp = false;
  function params() { const o = {}; new URLSearchParams(location.search).forEach((v, k) => { o[k] = v; }); return o; }
  function go(p, replace) {
    if (!replace) inApp = true;
    const u = new URL(location.href);
    u.search = href(p).slice(1);
    u.hash = "";
    history[replace ? "replaceState" : "pushState"]({}, "", u);
    route();
  }
  window.addEventListener("popstate", route);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-nav]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.origin !== location.origin) return;
    e.preventDefault();
    closePalette();
    const o = {}; new URL(a.href).searchParams.forEach((v, k) => { o[k] = v; });
    go(o);
  });

  function route() {
    const p = params();
    window.scrollTo(0, 0);
    document.documentElement.lang = LANG;
    st.ind = null;
    const v = p.v || "";
    renderTop(v === "topic" || v === "ind" || v === "topics" ? "topics" : v === "country" || v === "countries" ? "countries" : v === "source" || v === "sources" || v === "table" ? "sources" : v === "library" ? "library" : "");
    if (v === "topics") return viewTopics();
    if (v === "topic") return viewTopic(p.k);
    if (v === "ind") return viewIndicator(p.i, p.sel ? b64d(p.sel) : null, p.loc ? b64d(p.loc) : null, p.c ? p.c.split(",") : null);
    if (v === "countries") return viewCountries();
    if (v === "country") return viewCountry(p.c);
    if (v === "sources") return viewSources();
    if (v === "source") return viewSource(p.s, p.p || "", p.q || "");
    if (v === "table") return viewTable(p.s, p.t, p.l, p.sel ? b64d(p.sel) : null, p.ti || null);
    if (v === "library") return viewLibrary();
    if (v === "about") return viewAbout();
    return viewHome(p.q || "");
  }

  /* ---------------- chrome ---------------- */
  function renderTop(active) {
    const n = I[LANG].nav;
    $("#top").innerHTML = `<div class="topin"><a class="brand" href="./" data-nav><img src="assets/isr-logo-navy.svg" alt="ISR"><span>${esc(t("app"))}</span></a>
      <nav class="nav" aria-label="Glavna">${["topics", "countries", "sources", "library"].map(k => `<a href="?v=${k}" data-nav class="${active === k ? "on" : ""}">${esc(n[k])}</a>`).join("")}</nav>
      <button class="findbtn" id="findBtn" aria-label="${esc(t("find"))}"><span>${esc(t("find"))}</span><kbd>⌘K</kbd></button></div>`;
    $("#findBtn").addEventListener("click", () => loadShared().then(openPalette));
  }
  function layout(rail, main, cls) {
    const m = $("#main");
    m.className = "wrap " + (cls || "");
    m.innerHTML = `${rail ? `<aside class="rail">${rail}</aside>` : ""}<div class="content">${main}${footer()}</div>`;
    return m;
  }
  function crumbs(list) {
    return `<nav class="crumbs">${list.map(([label, h], i) => (h && i < list.length - 1 ? `<a href="${esc(h)}" data-nav>${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join(`<i>›</i>`)}</nav>`;
  }
  function footer() {
    const time = new Date().toLocaleTimeString(LANG === "en" ? "en-GB" : "sl-SI", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Ljubljana" });
    return `<div class="foot"></div><div class="footline"><span>${esc(time)} ${esc(t("inTime"))}</span><button data-lang>${esc(t("lang"))}</button><a href="?v=about" data-nav>${esc(t("about"))}</a><a href="https://github.com/The-Adriatic/isr-stat" target="_blank" rel="noopener">${esc(t("github"))}</a><span>${esc(S.VERSION)}</span></div>`;
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-lang]")) { LANG = LANG === "sl" ? "en" : "sl"; store.set("isrstat.lang", LANG); route(); } });

  function topicsRail(curTopic, curInd) {
    return `<p class="rh">${esc(t("topics"))}</p><ul>${TOPICS.map(tp => {
      const on = tp.id === curTopic;
      return `<li><a href="?v=topic&k=${tp.id}" data-nav class="${on && !curInd ? "on" : ""} ${on ? "open" : ""}">${esc(nm(tp.name))}</a>${on ? `<ul>${tp.items.map(k => `<li><a href="?v=ind&i=${k}" data-nav class="${k === curInd ? "on" : ""}">${esc(nm(INDS[k].name))}</a></li>`).join("")}</ul>` : ""}</li>`;
    }).join("")}</ul>`;
  }
  function countriesRail(cur) {
    return CPAGES.map(g => `<p class="rh">${esc(nm(g.group))}</p><ul>${g.list.map(c => `<li><a href="?v=country&c=${c}" data-nav class="${c === cur ? "on" : ""}">${esc(cName(c))}</a></li>`).join("")}</ul>`).join("");
  }
  function sourcesRail(cur) {
    return Object.keys(S.GROUPS).map(g => `<p class="rh">${esc(t("groups")[g])}</p><ul>${Object.values(S.SOURCES).filter(s => s.group === g).map(s => `<li><a href="?v=source&s=${s.key}" data-nav class="${s.key === cur ? "on" : ""} ${s.type === "pending" ? "off" : ""}">${esc(nm(s.name))}</a></li>`).join("")}</ul>`).join("");
  }

  /* ---------------- search ---------------- */
  let catIndex = null;
  async function loadCatIndex() {
    if (catIndex) return catIndex;
    try { const r = await fetch((CONFIG.catalog || "catalog") + "/index.json", { cache: "no-cache" }); catIndex = r.ok ? (await r.json()).sources || {} : {}; } catch (_) { catIndex = {}; }
    return catIndex;
  }
  // indicators first: they match plain words and open ready-made views
  function searchIndicators(q) {
    const items = Object.values(INDS).map(x => ({ id: x.id, label: nm(x.name), code: nm(TOPICS.find(tp => tp.id === x.topic).name), kind: "ind", hay: [x.name.sl, x.name.en, x.about.sl, x.about.en, x.unit.sl].join(" ") }));
    const toks = S.util.norm(q).split(/\s+/).filter(Boolean);
    return items.map(it => {
      const hay = S.util.norm(it.hay);
      let score = 0;
      for (const tk of toks) { const stem = tk.length > 5 ? tk.slice(0, -2) : tk; if (hay.includes(tk)) score += 10; else if (hay.includes(stem)) score += 6; else return null; }
      return Object.assign({ score: score + 50 }, it);
    }).filter(Boolean);
  }
  let searchSeq = 0;
  async function runSearch(q, onUpdate) {
    const my = ++searchSeq;
    const idx = await loadCatIndex();
    const keys = Object.keys(S.SOURCES).filter(k => {
      const s = S.SOURCES[k];
      if (s.type === "pending") return false;
      if (s.type === "pxweb" && !s.db) { const e = idx[`${k}.${dataLangFor(s)}`]; return !!(e && e.n); }
      return true;
    });
    const countryHits = S.COUNTRIES.filter(c => { const n = S.util.norm(q); return n.length >= 3 && (S.util.norm(c[2]).startsWith(n) || S.util.norm(c[3]).startsWith(n)); }).map(c => ({ kind: "country", id: c[0], label: cName(c[0]), code: t("countries"), score: 100 }));
    let hits = countryHits.concat(searchIndicators(q));
    const pending = new Set(keys);
    const emit = () => { if (my === searchSeq) onUpdate(hits.slice().sort((a, b) => (b.score || 0) - (a.score || 0)), Array.from(pending)); };
    emit();
    await Promise.all(keys.map(async k => {
      try {
        const s = srcOf(k);
        let r = s.type === "pxweb" && !s.flat ? await S.search(k, q, dataLangFor(s)) : S.util.rankSearch(await S.list(k, dataLangFor(s)), q);
        if (!r.length && s.langs.includes("en") && dataLangFor(s) !== "en") {
          r = s.type === "pxweb" && !s.flat ? await S.search(k, q, "en") : S.util.rankSearch(await S.list(k, "en"), q);
          r = r.map(x => Object.assign({ lang: "en" }, x));
        }
        if (my !== searchSeq) return;
        hits = hits.concat(r.slice(0, 40).map(x => Object.assign({ source: k, kind: "table" }, x)));
      } catch (_) { /* a source that fails contributes nothing */ }
      pending.delete(k);
      emit();
    }));
  }
  function hitHref(x) {
    if (x.kind === "ind") return `?v=ind&i=${x.id}`;
    if (x.kind === "country") return `?v=country&c=${x.id}`;
    if (x.kind === "lib") return x.href;
    return tableHref(x.source, x.id, { ti: x.label || "", l: x.lang || "" });
  }
  function hitLeft(x) { return x.kind === "ind" ? (LANG === "en" ? "Indicator" : "Kazalnik") : x.kind === "country" ? (LANG === "en" ? "Country" : "Država") : x.kind === "lib" ? srcAbbr(x.source) : srcAbbr(x.source); }
  function hitRow(x, cls) { return `<a href="${esc(hitHref(x))}" data-nav class="${cls || ""}"><span class="l">${esc(hitLeft(x))}</span><span class="m">${esc(x.label)}</span><span class="r">${esc(x.code || "")}</span></a>`; }

  /* ---------------- home ---------------- */
  async function viewHome(q) {
    const ex = LANG === "en" ? ["exports Serbia", "inflation", "unemployment", "debt"] : ["izvoz", "inflacija", "brezposelnost", "javni dolg"];
    layout("", `
      <header class="hero"><h1 class="t">${esc(t("heroT"))}</h1><p class="sub">${esc(t("heroL"))}</p></header>
      <h2 class="sec">${esc(t("topics"))}</h2>
      <div class="tgrid">${TOPICS.map(tp => `<a class="tcard" href="?v=topic&k=${tp.id}" data-nav><b>${esc(nm(tp.name))}</b><span>${esc(tp.items.slice(0, 3).map((k, i) => { const n = nm(INDS[k].name); return i && /^[A-ZČŠŽ][a-zčšž]/.test(n) ? n.charAt(0).toLowerCase() + n.slice(1) : n; }).join(", "))}</span></a>`).join("")}</div>
      <h2 class="sec">${esc(t("countries"))}</h2>
      ${CPAGES.slice(0, 2).map(g => `<div class="clist"><span class="cg">${esc(nm(g.group))}</span><span class="cl">${g.list.map(c => `<a href="?v=country&c=${c}" data-nav>${esc(cName(c))}</a>`).join("")}</span></div>`).join("")}
      <div class="clist"><span class="cg"></span><span class="cl"><a href="?v=countries" data-nav class="more2">${esc(t("allCountries"))} ›</a></span></div>
      <div class="search"><input id="q" autocomplete="off" spellcheck="false" placeholder="${esc(t("searchPh"))}" value="${esc(q)}" aria-label="${esc(t("find"))}"><kbd>⌘K</kbd></div>
      <div class="hint" id="hint">${esc(t("ex"))} ${ex.map(x => `<button data-ex="${esc(x)}">${esc(x)}</button>`).join(", ")}</div>
      <div id="results"></div>
      <div id="lists"></div>`, "home");
    const input = $("#q"), results = $("#results"), lists = $("#lists"), hint = $("#hint");
    let kb = -1, current = [];
    const render = (hits, pending) => {
      current = hits.slice(0, 60);
      kb = Math.min(kb, current.length - 1);
      const prog = pending.length ? `<p class="progress"><span class="spin"></span>${esc(t("searching"))}: ${pending.map(srcAbbr).join(", ")}</p>` : `<p class="progress"></p>`;
      results.innerHTML = prog + (current.length ? `<ul class="rows">${current.map((x, i) => `<li>${hitRow(x, i === kb ? "on" : "")}</li>`).join("")}</ul>` : (pending.length ? "" : `<p class="empty">${esc(t("none"))}</p>`));
    };
    const doSearch = debounce((v) => {
      history.replaceState({}, "", v ? "?" + new URLSearchParams({ q: v }) : "./");
      if (!v) { searchSeq++; results.innerHTML = ""; lists.style.display = ""; hint.style.display = ""; return; }
      lists.style.display = "none"; hint.style.display = "none"; kb = -1;
      runSearch(v, render);
    }, 220);
    input.addEventListener("input", () => doSearch(input.value.trim()));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); kb = Math.max(0, Math.min(current.length - 1, kb + (e.key === "ArrowDown" ? 1 : -1))); $$("#results a").forEach((a, i) => a.classList.toggle("on", i === kb)); }
      if (e.key === "Enter") { const el = $$("#results a")[Math.max(0, kb)]; if (el) el.click(); }
    });
    $$("[data-ex]").forEach(b => b.addEventListener("click", () => { input.value = b.dataset.ex; doSearch(b.dataset.ex); input.focus(); }));
    if (q) { lists.style.display = "none"; hint.style.display = "none"; runSearch(q, render); input.scrollIntoView({ block: "center" }); }
    const shared = await loadShared();
    lists.innerHTML = shared.length ? `<h2 class="sec">${esc(t("shared"))}</h2><ul class="rows">${shared.slice(0, 5).map(x => `<li>${libRow(x)}</li>`).join("")}</ul><p class="hint"><a class="lnk" href="?v=library" data-nav>${esc(t("nav").library)} ›</a></p>` : "";
  }

  /* ---------------- topics ---------------- */
  function viewTopics() {
    layout(topicsRail(null, null), `${crumbs([[t("topics")]])}<h1 class="t">${esc(t("topics"))}</h1>
      ${TOPICS.map(tp => `<h2 class="sec"><a class="lnk" href="?v=topic&k=${tp.id}" data-nav>${esc(nm(tp.name))}</a></h2><ul class="rows two">${tp.items.map(k => indRow(INDS[k])).join("")}</ul>`).join("")}`);
  }
  function indRow(x) { return `<li><a href="?v=ind&i=${x.id}" data-nav><span class="m">${esc(nm(x.name))}<small>${esc(nm(x.about))}</small></span><span class="r">${esc(srcAbbr(x.source))}</span></a></li>`; }
  function viewTopic(k) {
    const tp = TOPICS.find(x => x.id === k);
    if (!tp) return viewTopics();
    layout(topicsRail(tp.id, null), `${crumbs([[t("topics"), "?v=topics"], [nm(tp.name)]])}<h1 class="t">${esc(nm(tp.name))}</h1><p class="sub lede">${esc(nm(tp.about))}</p>
      <ul class="rows two" style="margin-top:1.5rem">${tp.items.map(i => indRow(INDS[i])).join("")}</ul>`);
  }

  /* ---------------- indicator ---------------- */
  async function viewIndicator(id, sel, loc, cs) {
    const ind = INDS[id];
    if (!ind) return viewTopics();
    const tp = TOPICS.find(x => x.id === ind.topic);
    const s = srcOf(ind.source);
    Object.assign(st, { ind, source: ind.source, table: ind.table, lang: ind.lang, title: nm(ind.name), res: null, local: {}, open: null, meta: null, stem: `${ind.source}_${ind.id}`, forceBig: false, geoMap: null, chart: { mode: st.chart.mode, focus: null, title: "", subtitle: "" } });
    const related = tp.items.filter(k => k !== id);
    layout(topicsRail(tp.id, id), `${crumbs([[t("topics"), "?v=topics"], [nm(tp.name), `?v=topic&k=${tp.id}`], [nm(ind.name)]])}
      <h1 class="t" id="ttl">${esc(nm(ind.name))}</h1><p class="sub lede">${esc(nm(ind.about))}</p>
      <p class="metaline" id="tmeta"><span>${esc(nm(s.name))}</span></p>
      <div id="selBox"></div>
      <p class="status" id="status"><span class="spin"></span>${esc(t("loadingMeta"))}</p>
      <div id="notes"></div>
      <div class="result" id="result"></div>
      ${related.length ? `<h2 class="sec">${esc(t("related"))}</h2><ul class="rows two">${related.map(k => indRow(INDS[k])).join("")}</ul>` : ""}`);
    let m;
    try { m = await S.meta(ind.source, ind.table, ind.lang); }
    catch (e) { $("#status").className = "status err"; $("#status").textContent = e.message; return; }
    if (st.ind !== ind) return;
    st.meta = m; st.table = m.table;
    buildGeoMap();
    st.sel = sel || indDefaultSel(ind, m, cs);
    const ld = Object.assign({}, ind.local || {}, loc || {});
    Object.keys(ld).forEach(k => { st.local[k] = new Set([].concat(ld[k]).map(String)); });
    $("#tmeta").innerHTML = `<span>${esc(nm(s.name))}</span><span>${esc(m.tableCode)}</span>${m.updated ? `<span>${esc(t("updated"))} ${esc(fmtDay(m.updated))}</span>` : ""}<span><a href="${esc(m.web)}" target="_blank" rel="noopener">${esc(t("atSource"))} ↗</a></span><span><a href="${esc(tableHref(ind.source, m.table, { l: ind.lang, ti: m.title }))}" data-nav>${esc(t("fullTable"))} ›</a></span>`;
    renderSel();
    pull();
  }
  function timeDim(m) { return m.dims.find(d => d.role === "time"); }
  function indDefaultSel(ind, m, cs) {
    const sel = {};
    Object.keys(ind.fixed || {}).forEach(k => { sel[k] = ind.fixed[k].slice(); });
    if (ind.geo) {
      const d = m.dims.find(x => x.id === ind.geo);
      if (d) sel[ind.geo] = S.countryCodesFor(d, (cs || ind.countries || ["SI"]).filter(c => !(ind.partner && c === "SI")));
    }
    Object.keys(ind.choices || {}).forEach(k => { sel[k] = ind.choices[k].default.slice(); });
    const td = timeDim(m);
    if (td) sel[td.id] = ind.period ? JSON.parse(JSON.stringify(ind.period)) : (m.timeMode === "list" ? { last: 10 } : { from: "2015" });
    if (td && m.timeMode === "list" && sel[td.id] && sel[td.id].from) {
      // list-mode sources take explicit periods
      const f = sel[td.id].from; sel[td.id] = td.values.map(v => v.id).filter(x => x >= f);
    }
    return sel;
  }
  // codes of a geographic dimension mapped to our country list (Slovene names, region first)
  function buildGeoMap() {
    st.geoMap = null;
    if (!st.ind || !st.ind.geo || !st.meta) return;
    const d = st.meta.dims.find(x => x.id === st.ind.geo);
    if (!d) return;
    const map = new Map();
    S.COUNTRIES.forEach(c => { const code = S.countryCodesFor(d, [c[0]])[0]; if (code !== undefined && !map.has(String(code))) map.set(String(code), c[0]); });
    st.geoMap = map;
  }
  // the dimension as the user sees it: relabelled, reordered, trimmed to what makes sense
  function dimView(d) {
    if (!st.ind) return d;
    if (d.id === st.ind.geo && st.geoMap) {
      const known = [], rest = [];
      d.values.forEach(v => {
        const iso = st.geoMap.get(String(v.id));
        if (st.ind.partner && iso === "SI") return;
        if (iso) known.push({ id: v.id, label: cName(iso), iso }); else rest.push(v);
      });
      const order = S.COUNTRIES.map(c => c[0]);
      known.sort((a, b) => order.indexOf(a.iso) - order.indexOf(b.iso));
      return Object.assign({}, d, { values: known.concat(rest), split: known.length });
    }
    const ch = st.ind.choices && st.ind.choices[d.id];
    if (ch && ch.options) return Object.assign({}, d, { values: ch.options.map(o => d.values.find(v => v.id === o)).filter(Boolean) });
    return d;
  }

  /* ---------------- raw table (advanced) ---------------- */
  async function viewTable(key, id, wantLang, sel, title) {
    const s = srcOf(key);
    if (!s || !id) return viewSources();
    const lang = dataLangFor(s, wantLang);
    Object.assign(st, { ind: null, source: key, table: id, lang, title, res: null, local: {}, open: null, meta: null, stem: "", forceBig: false, geoMap: null, chart: { mode: st.chart.mode, focus: null, title: "", subtitle: "" } });
    layout(sourcesRail(key), `${crumbs([[t("sources"), "?v=sources"], [nm(s.name), `?v=source&s=${key}`], [t("tableWord")]])}
      <h1 class="t" id="ttl">${esc(title || id)}</h1>
      <p class="metaline" id="tmeta"><span>${esc(nm(s.name))}</span></p>
      <div id="selBox"></div>
      <p class="status" id="status"><span class="spin"></span>${esc(t("loadingMeta"))}</p>
      <div id="notes"></div>
      <div class="result" id="result"></div>`);
    let m;
    try { m = await S.meta(key, id, lang, title && s.type === "pxweb" ? { title } : undefined); }
    catch (e) { $("#status").className = "status err"; $("#status").textContent = e.message; return; }
    st.meta = m;
    st.sel = sel || defaultSel(m, s);
    $("#ttl").textContent = m.title;
    const langs = s.langs.length > 1 ? `<span>${s.langs.map(l => l === lang ? `<span>${l.toUpperCase()}</span>` : `<a href="${esc(tableHref(key, id, { l, ti: title || "" }))}" data-nav>${l.toUpperCase()}</a>`).join(" ")}</span>` : "";
    $("#tmeta").innerHTML = `<span>${esc(nm(s.name))}</span><span>${esc(m.tableCode)}</span>${m.updated ? `<span>${esc(t("updated"))} ${esc(fmtDay(m.updated))}</span>` : ""}<span><a href="${esc(m.web)}" target="_blank" rel="noopener">${esc(t("atSource"))} ↗</a></span>${langs}`;
    renderSel();
    pull();
  }
  function pickDefault(d) {
    const pref = ["TOTAL", "_T", "T", "TOT", "00", "_Z", "A", "EUR", "SVN", "SI"];
    for (const p of pref) { const v = d.values.find(x => String(x.id).toUpperCase() === p); if (v) return v.id; }
    const tot = d.values.find(x => /^(skupaj|total|vsi|vse|all)\b/i.test(x.label));
    return (tot || d.values[0]).id;
  }
  function defaultSel(m, s) {
    const sel = {};
    m.dims.forEach(d => {
      if (d.role === "time") { sel[d.id] = m.timeMode === "list" && d.values.length ? { last: Math.min(10, d.values.length) } : { from: String(new Date().getFullYear() - 15) }; return; }
      if (!d.values.length) return;
      if (d.values.length === 1) { sel[d.id] = [d.values[0].id]; return; }
      if (s.type === "pxweb") { if (d.required) sel[d.id] = [pickDefault(d)]; return; }
      if (d.role === "geo") { const si = S.countryCodesFor(d, ["SI"]); sel[d.id] = si.length ? si : [d.values[0].id]; return; }
      if (/^FREQ/i.test(d.id)) { const a = d.values.find(v => v.id === "A"); sel[d.id] = [a ? "A" : d.values[0].id]; return; }
      sel[d.id] = [pickDefault(d)];
    });
    return sel;
  }

  /* ---------------- selection list ---------------- */
  function localDims() {
    if (!st.res || !st.meta) return [];
    const known = new Set(st.meta.dims.map(d => d.id));
    return st.res.dims.filter(d => !known.has(d.id) && d.id !== st.res.timeDim && d.values.length > 1).map(d => {
      if (LANG !== "sl") return d;
      return Object.assign({}, d, { values: d.values.map(v => Object.assign({}, v, { label: LOCAL_SL[v.id] || v.label })) });
    });
  }
  function visibleDims() {
    const m = st.meta;
    if (!st.ind) return m.dims.filter(d => d.role === "time" || d.values.length > 1);
    const show = [st.ind.geo].concat(Object.keys(st.ind.choices || {})).filter(Boolean);
    const out = show.map(id => m.dims.find(d => d.id === id)).filter(Boolean);
    const td = timeDim(m);
    if (td) out.push(td);
    return out;
  }
  function summary(d0, isLocal) {
    const d = dimView(d0);
    if (isLocal) {
      const set = st.local[d.id];
      if (!set || !set.size || set.size === d.values.length) return t("allN", d.values.length);
      return listSummary(d, Array.from(set));
    }
    const v = st.sel[d.id];
    if (d.role === "time") {
      const vals = d.values.map(x => x.id);
      const span = (a, b) => (a === b ? a : `${a}–${b}`);
      if (v && v.last) { const n = v.last; if (!vals.length) return t("lastN", n); const a = vals[Math.max(0, vals.length - n)], b = vals[vals.length - 1]; return n === 1 ? `${t("lastP")} (${b})` : `${t("lastN", n)} (${span(a, b)})`; }
      if (v === "*" || v === undefined) return vals.length ? `${t("allPeriods")} (${span(vals[0], vals[vals.length - 1])})` : t("allPeriods");
      if (v && (v.from || v.to)) return v.from && v.to ? span(v.from, v.to) : v.from ? t("fromY", v.from) : t("toY", v.to);
      if (Array.isArray(v)) return v.length ? (v.length > 3 ? span(v[0], v[v.length - 1]) : listSummary(d, v)) : t("allPeriods");
    }
    if (v === "*") return t("allN", d.values.length);
    if (!Array.isArray(v) || !v.length) return srcOf(st.source).type === "pxweb" && !d.required ? t("total") : t("allN", d.values.length);
    if (v.length === d0.values.length && v.length > 3) return t("allN", d0.values.length);
    return listSummary(d, v);
  }
  function listSummary(d, codes) {
    const lab = new Map(d.values.map(x => [String(x.id), x.label]));
    const names = codes.slice(0, 4).map(c => lab.get(String(c)) || c);
    return names.join(", ") + (codes.length > 4 ? " " + t("andMore", codes.length - 4) : "");
  }
  function renderSel() {
    const loc = localDims();
    const item = (d, isLocal) => {
      const open = st.open === (isLocal ? "L:" : "") + d.id;
      return `<div class="item ${open ? "open" : ""}" data-d="${esc(d.id)}" data-local="${isLocal ? 1 : 0}"><button class="row" aria-expanded="${open}"><span class="k" title="${esc(d.label)}">${esc(dimLabel(d))}</span><span class="v">${esc(summary(d, isLocal))}</span><span class="c">${open ? esc(t("done")) : esc(t("change"))}</span></button>${open ? pickerHTML(d, isLocal) : ""}</div>`;
    };
    $("#selBox").innerHTML = `<div class="sel">${visibleDims().map(d => item(d, false)).join("")}${loc.map(d => item(d, true)).join("")}</div>`;
    $$("#selBox .item").forEach(wireItem);
    const f = $("#selBox .item.open .find");
    if (f && matchMedia("(pointer:fine)").matches) f.focus({ preventScroll: true });
  }
  function isOn(d, code, isLocal) {
    if (isLocal) { const set = st.local[d.id]; return !set || !set.size || set.has(String(code)); }
    const v = st.sel[d.id];
    if (v === "*") return true;
    if (Array.isArray(v)) return v.map(String).includes(String(code));
    if (v && v.last && d.role === "time") { const i = d.values.findIndex(x => x.id === code); return i >= d.values.length - v.last; }
    return false;
  }
  function pickerHTML(d0, isLocal) {
    const m = st.meta, d = dimView(d0);
    const isTime = d.role === "time";
    if (isTime && m.timeMode !== "list" && !isLocal) {
      const v = st.sel[d.id] || {};
      return `<div class="picker"><div class="quick">${[5, 10, 20].map(n => `<button data-tlast="${n}">${esc(t("lastN", n))}</button>`).join("")}<button data-tall>${esc(t("allPeriods"))}</button></div><div class="range"><label>${esc(t("from"))}<input data-tf value="${esc(v.from || "")}" placeholder="2015"></label><label>${esc(t("to"))}<input data-tt value="${esc(v.to || "")}" placeholder="${new Date().getFullYear()}"></label><label>${esc(t("lastObs"))}<input data-tl inputmode="numeric" value="${esc(v.last || "")}"></label></div></div>`;
    }
    const quick = [];
    if (isTime && !isLocal) [1, 5, 10, 20].filter(n => n <= d.values.length).forEach(n => quick.push(`<button data-last="${n}">${esc(n === 1 ? t("latest") : t("lastN", n))}</button>`));
    if ((d.role === "geo" || (st.ind && d.id === st.ind.geo)) && !isLocal) Object.entries(S.COUNTRY_GROUPS).forEach(([g, o]) => { const c = S.countryCodesFor(d0, o.m.filter(x => !(st.ind && st.ind.partner && x === "SI"))); if (c.length >= 2) quick.push(`<button data-grp="${g}">${esc(nm(o))}</button>`); });
    if (!(st.ind && d.id === st.ind.geo)) quick.push(`<button data-all>${esc(t("all"))}</button>`);
    quick.push(`<button data-none>${esc(t("none2"))}</button>`);
    const vals = isTime ? d.values.slice().reverse() : d.values;
    const cap = 600;
    const opts = vals.slice(0, cap).map((v, i) => (d.split && i === d.split ? `<p class="osep">${esc(t("others"))}</p>` : "") + optHTML(d, v, isLocal)).join("");
    return `<div class="picker">${d.values.length > 8 ? `<input class="find" placeholder="${esc(t("find2", nf(d.values.length)))}" autocomplete="off" spellcheck="false">` : ""}<div class="quick">${quick.join("")}</div><div class="opts">${opts}</div>${vals.length > cap ? `<p class="more">+ ${nf(vals.length - cap)}</p>` : ""}</div>`;
  }
  function optHTML(d, v, isLocal) {
    const showCode = !st.ind && String(v.label) !== String(v.id);
    return `<button class="opt" data-v="${esc(v.id)}" data-n="${esc(S.util.norm(v.label + " " + v.id))}" aria-pressed="${isOn(d, v.id, isLocal)}"><span>${esc(v.label)}</span>${showCode ? `<code>${esc(v.id)}</code>` : "<span></span>"}</button>`;
  }
  function wireItem(el) {
    const id = el.dataset.d, isLocal = el.dataset.local === "1";
    const d0 = isLocal ? localDims().find(x => x.id === id) : st.meta.dims.find(x => x.id === id);
    const d = dimView(d0);
    const key = (isLocal ? "L:" : "") + id;
    $(".row", el).addEventListener("click", () => { st.open = st.open === key ? null : key; renderSel(); });
    const pk = $(".picker", el);
    if (!pk) return;
    const refresh = () => {
      $$(".opt", pk).forEach(b => b.setAttribute("aria-pressed", isOn(d0, b.dataset.v, isLocal)));
      $(".row .v", el).textContent = summary(d0, isLocal);
      changed(isLocal);
    };
    pk.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (isLocal) {
        const all = d0.values.map(v => String(v.id));
        let set = st.local[id] && st.local[id].size ? new Set(st.local[id]) : new Set(all);
        if (b.classList.contains("opt")) { const c = b.dataset.v; if (set.has(c)) set.delete(c); else set.add(c); if (!set.size) set = new Set([c]); }
        else if (b.hasAttribute("data-all")) set = new Set(all);
        else if (b.hasAttribute("data-none")) set = new Set([all[0]]);
        st.local[id] = set.size === all.length ? new Set() : set;
        return refresh();
      }
      if (b.classList.contains("opt")) {
        const c = b.dataset.v;
        let cur = st.sel[id];
        if (!Array.isArray(cur)) cur = d0.values.filter(v => isOn(d0, v.id, false)).map(v => v.id);
        cur = cur.map(String).includes(c) ? cur.filter(x => String(x) !== c) : cur.concat([c]);
        const order = new Map(d.values.map((v, i) => [String(v.id), i]));
        cur.sort((a, b2) => (order.get(String(a)) ?? 1e9) - (order.get(String(b2)) ?? 1e9));
        st.sel[id] = cur;
      } else if (b.hasAttribute("data-all")) st.sel[id] = d0.role === "time" ? "*" : d.values.map(v => v.id);
      else if (b.hasAttribute("data-none")) st.sel[id] = [];
      else if (b.dataset.last) st.sel[id] = { last: Number(b.dataset.last) };
      else if (b.dataset.grp) st.sel[id] = S.countryCodesFor(d0, S.COUNTRY_GROUPS[b.dataset.grp].m.filter(x => !(st.ind && st.ind.partner && x === "SI")));
      else if (b.dataset.tlast) { st.sel[id] = { last: Number(b.dataset.tlast) }; renderSel(); return changed(); }
      else if (b.hasAttribute("data-tall")) { st.sel[id] = "*"; renderSel(); return changed(); }
      else return;
      refresh();
    });
    const f = $(".find", pk);
    if (f) {
      let kb = -1;
      const visible = () => $$(".opt", pk).filter(b => b.style.display !== "none");
      f.addEventListener("input", () => {
        const q = S.util.norm(f.value.trim());
        const opts = $(".opts", pk);
        if (q && d.values.length > 600) opts.innerHTML = d.values.filter(v => S.util.norm(v.label + " " + v.id).includes(q)).slice(0, 200).map(v => optHTML(d, v, isLocal)).join("");
        else { $$(".opt", pk).forEach(b => { b.style.display = !q || b.dataset.n.includes(q) ? "" : "none"; }); $$(".osep", pk).forEach(p => { p.style.display = q ? "none" : ""; }); }
        kb = -1; $$(".opt", pk).forEach(b => b.classList.remove("kb"));
      });
      f.addEventListener("keydown", (e) => {
        const vis = visible();
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); kb = Math.max(0, Math.min(vis.length - 1, kb + (e.key === "ArrowDown" ? 1 : -1))); vis.forEach((b, i) => b.classList.toggle("kb", i === kb)); if (vis[kb]) vis[kb].scrollIntoView({ block: "nearest" }); }
        if (e.key === "Enter") { e.preventDefault(); const b = vis[Math.max(0, kb)]; if (b) b.click(); }
        if (e.key === "Escape") { st.open = null; renderSel(); }
      });
    }
    const tf = $("[data-tf]", pk), tt = $("[data-tt]", pk), tl = $("[data-tl]", pk);
    if (tf) {
      const upd = () => { const o = {}; if (tl.value.trim()) o.last = Number(tl.value); else { if (tf.value.trim()) o.from = tf.value.trim(); if (tt.value.trim()) o.to = tt.value.trim(); } st.sel[id] = Object.keys(o).length ? o : "*"; $(".row .v", el).textContent = summary(d0, false); changed(); };
      [tf, tt, tl].forEach(x => x.addEventListener("input", debounce(upd, 500)));
    }
  }
  function changed(isLocal) {
    if (isLocal) { syncURL(); renderResult(); return; }
    st.forceBig = false;
    schedulePull();
  }
  const schedulePull = debounce(() => pull(), 450);

  function estimate() {
    const m = st.meta, s = srcOf(st.source);
    let n = 1;
    m.dims.forEach(d => {
      const v = st.sel[d.id];
      if (Array.isArray(v)) n *= Math.max(1, v.length);
      else if (v && v.last) n *= v.last;
      else if (v && (v.from || v.to)) { const a = parseInt(v.from || "1990", 10), b = parseInt(v.to || String(new Date().getFullYear()), 10); n *= Math.max(1, b - a + 1) * (/[MQ-]/.test(String(v.from || "").slice(4)) ? 6 : 1); }
      else if (s.type === "pxweb" && !d.required) n *= 1;
      else n *= Math.max(1, d.values.length || (d.role === "time" ? 30 : 1));
    });
    return n;
  }
  function cleanSel() {
    const out = {};
    st.meta.dims.forEach(d => { const v = st.sel[d.id]; if (v === undefined || v === null) return; if (Array.isArray(v)) { if (v.length) out[d.id] = v.slice(); return; } out[d.id] = v; });
    return out;
  }
  function missingRequired() {
    const geo = st.ind && st.ind.geo;
    return st.meta.dims.filter(d => (d.required || d.id === geo) && d.role !== "time" && !(Array.isArray(st.sel[d.id]) && st.sel[d.id].length) && st.sel[d.id] !== "*").map(d => dimLabel(d));
  }
  function localForURL() { const o = {}; Object.keys(st.local).forEach(k => { if (st.local[k] && st.local[k].size) o[k] = Array.from(st.local[k]); }); return o; }
  function currentParams() {
    if (st.ind) return { v: "ind", i: st.ind.id, sel: b64e(cleanSel()), loc: Object.keys(localForURL()).length ? b64e(localForURL()) : "" };
    return { v: "table", s: st.source, t: st.table, l: st.lang, ti: st.meta ? st.meta.title : "", sel: b64e(cleanSel()) };
  }
  function syncURL() { history.replaceState({}, "", href(currentParams())); }
  function shareURL() { const u = new URL(location.href); u.search = href(currentParams()).slice(1); return u.toString(); }

  async function pull() {
    const status = $("#status"), result = $("#result");
    if (!status || !st.meta) return;
    const miss = missingRequired();
    if (miss.length) { status.className = "status"; status.textContent = t("reqMissing", miss.join(", ")); return; }
    const n = estimate();
    if (n > 60000 && !st.forceBig) {
      status.className = "status";
      status.innerHTML = `${esc(t("big", nf(n)))} <button id="goBig">${esc(t("bigGo"))}</button>`;
      $("#goBig").addEventListener("click", () => { st.forceBig = true; pull(); });
      return;
    }
    const my = ++st.token;
    status.className = "status";
    status.innerHTML = `<span class="spin"></span>${esc(t("loading"))}`;
    result.classList.add("busy");
    syncURL();
    try {
      const res = await S.query(st.source, st.table, cleanSel(), st.lang, { meta: st.meta, title: st.meta.title });
      if (my !== st.token) return;
      const firstTime = !st.res;
      if (st.ind) relabel(res);
      st.res = res;
      window.ISR_LAST = res;
      if (!st.stem) st.stem = S.fileStem(res);
      localDims().forEach(d => {
        if (st.local[d.id] && st.local[d.id].size && Array.from(st.local[d.id]).every(c => d.values.some(v => String(v.id) === c))) return;
        const tot = d.values.find(v => /(^|_)(T|TOTAL|TOT|YGE15|AGGREGATE)$/i.test(String(v.id))) || d.values.find(v => /^(total|skupaj|15\+)/i.test(String(v.label)));
        st.local[d.id] = new Set([String((tot || d.values[0]).id)]);
      });
      renderSel();
      if (firstTime || !st.chart.title) st.chart.title = st.ind ? nm(st.ind.name) : res.title;
      st.chart.subtitle = st.ind ? nm(st.ind.unit) : "";
      status.textContent = "";
      renderResult();
    } catch (e) {
      if (my !== st.token) return;
      status.className = "status err";
      status.textContent = e && e.info && e.info.code === "EMPTY" ? t("noData") : (e.message || String(e));
    } finally { if (my === st.token) result.classList.remove("busy"); }
  }
  // indicator pages: countries in Slovene, choices with friendly names
  function relabel(res) {
    const g = st.ind.geo;
    if (g && st.geoMap && res.labels[g]) {
      Object.keys(res.labels[g]).forEach(code => { const iso = st.geoMap.get(String(code)); if (iso) res.labels[g][code] = cName(iso); });
      const d = res.dims.find(x => x.id === g);
      if (d) d.values.forEach(v => { v.label = res.labels[g][v.id]; });
    }
    if (LANG === "sl") res.dims.forEach(d => { if (!res.labels[d.id]) return; Object.keys(res.labels[d.id]).forEach(c => { if (LOCAL_SL[c]) res.labels[d.id][c] = LOCAL_SL[c]; }); d.values.forEach(v => { if (LOCAL_SL[v.id]) v.label = LOCAL_SL[v.id]; }); });
  }

  /* ---------------- result ---------------- */
  function shown() {
    const r = st.res;
    const keys = Object.keys(st.local).filter(k => st.local[k] && st.local[k].size && r.dims.some(d => d.id === k));
    if (!keys.length) return r;
    const rows = r.rows.filter(row => keys.every(k => st.local[k].has(String(row[k]))));
    const dims = r.dims.map(d => keys.includes(d.id) ? Object.assign({}, d, { values: d.values.filter(v => st.local[d.id].has(String(v.id))) }) : d);
    return Object.assign({}, r, { rows, dims, count: rows.length });
  }
  function pivot(r) {
    const tId = r.timeDim, rows = r.rows;
    const lab = (d, c) => (r.labels[d] && r.labels[d][c] != null ? r.labels[d][c] : c);
    const nonT = r.dims.filter(d => d.id !== tId);
    const varying = nonT.filter(d => new Set(rows.map(x => x[d.id])).size > 1);
    const fixed = nonT.filter(d => new Set(rows.map(x => x[d.id])).size === 1 && rows.length);
    const times = tId ? r.dims.find(d => d.id === tId).values.map(v => v.id).filter(tt => rows.some(x => x[tId] === tt)) : [];
    const fixedTxt = fixed.map(d => [dimLabel(d), lab(d.id, rows[0][d.id])]);
    if (tId && times.length) {
      const order = varying.map(d => new Map(d.values.map((v, i) => [String(v.id), i])));
      const map = new Map();
      rows.forEach(x => {
        const k = varying.map(d => x[d.id]).join("¦");
        if (!map.has(k)) map.set(k, { codes: varying.map(d => x[d.id]), vals: {}, st: {} });
        const e = map.get(k); e.vals[x[tId]] = x.value; if (x.status) e.st[x[tId]] = x.status;
      });
      const body = Array.from(map.values()).sort((a, b) => { for (let i = 0; i < varying.length; i++) { const dd = (order[i].get(String(a.codes[i])) ?? 1e9) - (order[i].get(String(b.codes[i])) ?? 1e9); if (dd) return dd; } return 0; });
      return { kind: "time", head: varying.map(d => dimLabel(d)), times, body: body.map(e => ({ labels: e.codes.map((c, i) => lab(varying[i].id, c)), vals: times.map(tt => e.vals[tt]), st: times.map(tt => e.st[tt] || "") })), fixedTxt };
    }
    return { kind: "flat", head: varying.map(d => dimLabel(d)), body: rows.map(x => ({ labels: varying.map(d => lab(d.id, x[d.id])), vals: [x.value], st: [x.status || ""] })), fixedTxt, times: [LANG === "en" ? "Value" : "Vrednost"] };
  }
  function valueFormatter(r) {
    let dec = 0;
    r.rows.forEach(x => { if (x.value === null || !isFinite(x.value)) return; const s = String(x.value); const i = s.indexOf("."); if (i >= 0) dec = Math.max(dec, Math.min(3, s.length - i - 1)); });
    if (st.ind && /pct|idx|rate/.test(st.ind.show || "")) dec = Math.min(dec, st.ind.show === "pct" ? 1 : 2);
    const f = new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI", { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return (v) => (v === null || v === undefined ? "" : f.format(v));
  }
  function renderResult() {
    const r = st.res, box = $("#result"), notes = $("#notes");
    if (!r || !box) return;
    const sr = shown();
    const p = pivot(sr);
    let nh = "";
    if (r.partial && r.partial.length) nh += `<p class="note">${t("partial", esc(r.partial.join(", ")), esc(r.partial.map(x => String(r.periodLabels[x] || x).replace(/\s*\(.*\)\s*$/, "")).join(", ")))}</p>`;
    else if (r.provisional.length) nh += `<p class="note">${t("prov", esc(r.provisional.join(", ")))}</p>`;
    if (r.forecast.length) nh += `<p class="note">${t("fc", esc(r.forecast.length > 2 ? r.forecast[0] + "–" + r.forecast[r.forecast.length - 1] : r.forecast.join(", ")))}</p>`;
    notes.innerHTML = nh;
    if (!st.chart.subtitle) st.chart.subtitle = p.fixedTxt.map(x => x[1]).join(", ");
    const fmt = valueFormatter(sr);
    const prov = new Set(r.provisional), fc = new Set(r.forecast), pl = r.periodLabels || {};
    const cap = 1000;
    const tableHTML = `<div class="tbl wide"><table class="data"><thead><tr>${(p.head.length ? p.head : [""]).map(x => `<th>${esc(x)}</th>`).join("")}${p.times.map(tt => `<th title="${esc(pl[tt] || "")}">${esc(tt)}${pl[tt] || prov.has(tt) || fc.has(tt) ? "*" : ""}</th>`).join("")}</tr></thead><tbody>${p.body.slice(0, cap).map(b => `<tr>${(b.labels.length ? b.labels : [st.chart.title]).map(l => `<td class="lab">${esc(l)}</td>`).join("")}${b.vals.map((v, i) => `<td>${v === null || v === undefined ? `<span class="x">–</span>` : esc(fmt(v))}${b.st[i] ? `<sup title="${esc(r.flags[b.st[i]] || b.st[i])}">${esc(b.st[i])}</sup>` : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const starred = p.times.filter(tt => pl[tt] || prov.has(tt) || fc.has(tt));
    const usedFlags = Array.from(new Set(sr.rows.map(x => x.status).filter(Boolean)));
    const tnote = [p.body.length > cap ? t("rows", nf(cap), nf(p.body.length)) : "", starred.length ? starred.map(tt => `* ${tt}: ${pl[tt] || (fc.has(tt) ? (LANG === "en" ? "projection" : "napoved") : (LANG === "en" ? "provisional" : "začasno"))}`).join("; ") : "", usedFlags.length ? usedFlags.map(s => `${s} = ${r.flags[s] || ""}`).join("; ") : ""].filter(Boolean);
    const c = r.citation;
    const cites = [[t("citeFdv"), c.fdv], [t("citeText"), c.inText], [t("citeFig"), c.figure], [t("citeApa"), c.apa]];
    const call = `await ISRStat.query(${JSON.stringify(r.source)}, ${JSON.stringify(r.table)}, ${JSON.stringify(r.query.sel)}, ${JSON.stringify(r.query.lang)})`;
    box.innerHTML = `
      <div class="ctitle"><span class="t1" contenteditable="true" spellcheck="false" id="cT">${esc(st.chart.title)}</span><span class="t2" contenteditable="true" spellcheck="false" id="cS">${esc(st.chart.subtitle)}</span></div>
      <div class="legend" id="legend"></div>
      <div class="chart wide" id="chartBox"></div>
      <div class="caption wide"><span id="capL">${esc(c.figure)}</span><span><button data-mode="isr" class="${st.chart.mode === "isr" ? "on" : ""}">${esc(t("isr"))}</button><button data-mode="barvno" class="${st.chart.mode === "barvno" ? "on" : ""}">${esc(t("color"))}</button></span></div>
      ${tableHTML}
      ${tnote.map(x => `<p class="tnote wide">${esc(x)}</p>`).join("")}
      <h2 class="sec">${esc(t("cite"))}</h2>
      <dl class="kv">${cites.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd><button class="cp" data-cp="${esc(v)}">${esc(t("copy"))}</button></div>`).join("")}
        <div><dt>${esc(t("pulled"))}</dt><dd>${esc(fmtDay(r.pulledAt))}, ${esc(new Date(r.pulledAt).toTimeString().slice(0, 5))}${r.updated ? `, ${esc(t("updated"))} ${esc(fmtDay(r.updated))}` : ""}</dd><span></span></div></dl>
      <div class="actions"><span class="sub">${esc(t("dl"))}</span><button data-x="csv">${esc(t("csv"))}</button><button data-x="xlsx">${esc(t("xlsx"))}</button><button data-x="svg">${esc(t("svg"))}</button><button data-x="png">${esc(t("png"))}</button><button data-x="copy">${esc(t("copyTable"))}</button><button data-x="link">${esc(t("link"))}</button><button data-x="save">${esc(t("save"))}</button></div>
      <div id="saveBox"></div>
      <p class="tnote" style="margin-top:1.5rem">${esc(t("rules"))}</p>
      <details class="claude"><summary>${esc(t("forClaude"))} ›</summary><pre>${esc(call)}</pre></details>`;
    $("#cT").addEventListener("input", (e) => { st.chart.title = e.target.textContent; });
    $("#cS").addEventListener("input", (e) => { st.chart.subtitle = e.target.textContent; });
    $$("[data-cp]", box).forEach(b => b.addEventListener("click", () => copyText(b.dataset.cp, b)));
    $$("[data-x]", box).forEach(b => b.addEventListener("click", () => doExport(b.dataset.x, b)));
    $$("[data-mode]", box).forEach(b => b.addEventListener("click", () => { st.chart.mode = b.dataset.mode; $$("[data-mode]", box).forEach(x => x.classList.toggle("on", x === b)); drawChart(); }));
    drawChart();
  }
  let resizeT = null;
  window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (st.res && $("#chartBox")) drawChart(); }, 150); });
  function drawChart() {
    const box = $("#chartBox"), lg = $("#legend");
    if (!box) return;
    const r = shown();
    const W = box.clientWidth;
    const info = C.render(box, r, { bare: true, mode: st.chart.mode, focus: st.chart.focus, lang: LANG, title: st.chart.title, subtitle: "", width: W, height: Math.round(Math.min(380, Math.max(260, W * 0.42))), forecast: st.res.forecast });
    st.chartInfo = info;
    C.wireHover(info, $("#tip"));
    const cap = [];
    if (info.scaleTag) cap.push(LANG === "en" ? `In ${info.scaleTag}` : `V ${info.scaleTag}`);
    cap.push(st.res.citation.figure);
    if (info.skipped && info.skipped.length) cap.push(LANG === "en" ? `Part-year ${info.skipped.join(", ")} not shown.` : `Delno leto ${info.skipped.join(", ")} ni prikazano.`);
    if (info.dropped) cap.push(LANG === "en" ? `${info.series.length} of ${info.series.length + info.dropped} series shown.` : `Prikazanih ${info.series.length} od ${info.series.length + info.dropped} serij.`);
    $("#capL").textContent = cap.join(" ");
    if (info.series.length > 1) {
      lg.innerHTML = info.series.map((s, i) => `<button data-focus="${i}" class="${i === (st.chart.focus ?? info.focus) ? "on" : ""}" title="${esc(s.label)}"><i style="background:${s.color}"></i>${esc(s.label || "–")}</button>`).join("");
      $$("[data-focus]", lg).forEach(b => b.addEventListener("click", () => { const k = Number(b.dataset.focus); st.chart.focus = st.chart.focus === k ? null : k; drawChart(); }));
    } else lg.innerHTML = "";
  }

  /* ---------------- exports ---------------- */
  function fileName(ext) { const stem = (st.stem || S.fileStem(st.res)).replace(/[^\w.\-čšžČŠŽ]+/g, "_"); return `${stem}_${S.util.compactDate(st.res.pulledAt)}.${ext}`; }
  function exportChartSVG() {
    const tmp = document.createElement("div");
    tmp.style.cssText = "position:absolute;left:-9999px;top:0;width:1000px";
    document.body.appendChild(tmp);
    const info = C.render(tmp, shown(), { mode: st.chart.mode, focus: st.chart.focus, lang: LANG, title: st.chart.title, subtitle: st.chart.subtitle, source: st.res.citation.figure, width: 1000, height: 560, forecast: st.res.forecast });
    return { svg: info.svg, done: () => tmp.remove() };
  }
  async function doExport(kind, btn) {
    const r = shown();
    if (kind === "csv") return download(new Blob(["﻿" + S.toCSV(r)], { type: "text/csv;charset=utf-8" }), fileName("csv"));
    if (kind === "xlsx") return exportXLSX(r);
    if (kind === "copy") {
      const p = pivot(r);
      const fmt = (v) => (v === null || v === undefined ? "" : String(v).replace(".", LANG === "en" ? "." : ","));
      return copyText([p.head.concat(p.times).join("\t")].concat(p.body.map(b => b.labels.concat(b.vals.map(fmt)).join("\t"))).join("\n"), btn);
    }
    if (kind === "svg") { const e = exportChartSVG(); const s = await C.svgString(e.svg, "assets/fonts/"); e.done(); return download(new Blob([s], { type: "image/svg+xml" }), fileName("svg")); }
    if (kind === "png") { const e = exportChartSVG(); const b = await C.pngBlob(e.svg, "assets/fonts/", 2); e.done(); return download(b, fileName("png")); }
    if (kind === "link") return copyText(shareURL(), btn);
    if (kind === "save") return saveForm();
  }
  function exportXLSX(r) {
    if (!window.XLSX) return toast("Excel se še nalaga.");
    const X = window.XLSX, wb = X.utils.book_new();
    const tidy = S.toTidy(r);
    const ws1 = X.utils.aoa_to_sheet([tidy.header].concat(tidy.rows));
    ws1["!cols"] = tidy.header.map(h => ({ wch: Math.min(48, Math.max(10, h.length + 2)) }));
    const p = pivot(r);
    const aoa = [[st.chart.title || st.res.title]];
    if (st.chart.subtitle) aoa.push([st.chart.subtitle]);
    aoa.push([]);
    aoa.push(p.head.concat(p.times));
    p.body.forEach(b => aoa.push(b.labels.concat(b.vals.map(v => (v === null || v === undefined ? null : v)))));
    aoa.push([]); aoa.push([st.res.citation.figure]);
    const ws2 = X.utils.aoa_to_sheet(aoa);
    ws2["!cols"] = p.head.map(() => ({ wch: 30 })).concat(p.times.map(() => ({ wch: 12 })));
    const c = st.res.citation;
    const used = Array.from(new Set(r.rows.map(x => x.status).filter(Boolean)));
    const info = [
      ["Naslov", st.chart.title || st.res.title], ["Tabela pri viru", st.res.title], ["Vir", nm(S.SOURCES[st.res.source].inst)], ["Oznaka tabele", st.res.tableCode], ["Povezava", st.res.doi ? "https://doi.org/" + st.res.doi : st.res.web],
      ["Posodobljeno pri viru", st.res.updated || ""], ["Pridobljeno", new Date(st.res.pulledAt).toLocaleString("sl-SI")],
      ["Delno leto", (st.res.partial || []).map(x => `${x} (${st.res.periodLabels[x] || ""})`).join(", ")], ["Začasni podatki", st.res.provisional.join(", ")], ["Napovedi", st.res.forecast.join(", ")],
      [], ["Navedba (FDV, Viri)", c.fdv], ["V besedilu", c.inText], ["Pod sliko ali tabelo", c.figure], ["Angleško (APA 7)", c.apa], ["Kratko", c.short],
      [], ["Zastavice", used.map(s => `${s} = ${st.res.flags[s] || ""}`).join("; ")], ["Poizvedba (API)", st.res.url], ["Izbor (JSON)", JSON.stringify(st.res.query.sel)],
      ["Orodje", `ISR Stat ${S.VERSION}, ${shareURL()}`],
    ];
    const ws3 = X.utils.aoa_to_sheet(info);
    ws3["!cols"] = [{ wch: 24 }, { wch: 110 }];
    X.utils.book_append_sheet(wb, ws2, "Tabela");
    X.utils.book_append_sheet(wb, ws1, "Podatki");
    X.utils.book_append_sheet(wb, ws3, "Vir");
    X.writeFile(wb, fileName("xlsx"));
  }
  function saveForm() {
    const box = $("#saveBox");
    if (box.innerHTML) { box.innerHTML = ""; return; }
    const p = pivot(shown());
    const guess = (st.ind ? nm(st.ind.name) : st.res.title) + (p.fixedTxt.length && !st.ind ? ", " + p.fixedTxt.map(x => x[1]).slice(0, 2).join(", ") : "");
    box.innerHTML = `<div class="saveRow"><input id="svT" value="${esc(guess)}" aria-label="${esc(t("saveName"))}"><button id="svOk">${esc(t("saveOk"))}</button><button id="svNo">${esc(t("cancel"))}</button></div>`;
    const inp = $("#svT"); inp.focus(); inp.select();
    const ok = () => { const a = myLib(); a.unshift({ title: inp.value.trim() || st.res.title, source: st.source, table: st.table, lang: st.lang, sel: cleanSel(), tableTitle: st.meta.title, ind: st.ind ? st.ind.id : undefined, loc: localForURL(), saved: new Date().toISOString() }); setMyLib(a); box.innerHTML = ""; toast(t("saved")); };
    $("#svOk").addEventListener("click", ok);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") ok(); if (e.key === "Escape") box.innerHTML = ""; });
    $("#svNo").addEventListener("click", () => { box.innerHTML = ""; });
  }

  /* ---------------- countries ---------------- */
  function viewCountries() {
    layout(countriesRail(null), `${crumbs([[t("countries")]])}<h1 class="t">${esc(t("countries"))}</h1><p class="sub lede">${esc(t("cIntro"))}</p>
      ${CPAGES.map(g => `<h2 class="sec">${esc(nm(g.group))}</h2><ul class="rows two">${g.list.map(c => `<li><a href="?v=country&c=${c}" data-nav><span class="m">${esc(cName(c))}</span><span class="r">›</span></a></li>`).join("")}</ul>`).join("")}`);
  }
  function fmtShow(kind, v) {
    if (v === null || v === undefined || !isFinite(v)) return "–";
    const sp = " ";
    if (kind === "pct") return nf(v, 1) + sp + "%";
    if (kind === "idx") return nf(v, 2);
    if (kind === "rate") return nf(v, 4);
    if (kind === "ppp") return nf(Math.round(v)) + sp + (LANG === "en" ? "int. $" : "mednar. $");
    if (kind === "mio") return nf(Math.abs(v) > 1000 ? v / 1e6 : v, 2) + sp + (LANG === "en" ? "m" : "mio.");
    if (kind === "eur") return Math.abs(v) >= 1e9 ? nf(v / 1e9, 2) + sp + (LANG === "en" ? "bn EUR" : "mrd. EUR") : nf(v / 1e6, 1) + sp + (LANG === "en" ? "m EUR" : "mio. EUR");
    if (kind === "meur") return Math.abs(v) >= 1000 ? nf(v / 1000, 2) + sp + (LANG === "en" ? "bn EUR" : "mrd. EUR") : nf(v, 1) + sp + (LANG === "en" ? "m EUR" : "mio. EUR");
    return nf(v);
  }
  function spark(points) {
    const vals = points.map(p => p[1]).filter(v => v !== null && isFinite(v));
    if (vals.length < 2) return `<svg class="spark" viewBox="0 0 84 22"></svg>`;
    const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    const X = (i) => 2 + (i * 80) / (points.length - 1), Y = (v) => 19 - ((v - lo) / ((hi - lo) || 1)) * 16;
    let d = "", pen = false;
    points.forEach((p, i) => { if (p[1] === null || !isFinite(p[1])) { pen = false; return; } d += (pen ? "L" : "M") + X(i).toFixed(1) + " " + Y(p[1]).toFixed(1); pen = true; });
    const li = points.length - 1 - points.slice().reverse().findIndex(p => p[1] !== null && isFinite(p[1]));
    return `<svg class="spark" viewBox="0 0 84 22" aria-hidden="true"><path d="${d}" fill="none" stroke="#173049" stroke-width="1.25" stroke-linejoin="round"/><circle cx="${X(li).toFixed(1)}" cy="${Y(points[li][1]).toFixed(1)}" r="2" fill="#173049"/></svg>`;
  }
  async function viewCountry(iso) {
    if (!country(iso)) return viewCountries();
    const list = Object.values(INDS).filter(x => x.profile && x.geo && !(iso === "SI" && x.partner));
    const byTopic = TOPICS.map(tp => ({ tp, items: list.filter(x => x.topic === tp.id) })).filter(g => g.items.length);
    layout(countriesRail(iso), `${crumbs([[t("countries"), "?v=countries"], [cName(iso)]])}<h1 class="t">${esc(cName(iso))}</h1><p class="sub lede">${esc(t("cIntro"))}</p>
      ${byTopic.map(g => `<h2 class="sec">${esc(nm(g.tp.name))}</h2><ul class="kfig">${g.items.map(x => `<li><a href="${esc(indLink(x, iso))}" data-nav id="kf-${x.id}"><span class="n">${esc(nm(x.name))}<small>${esc(nm(x.unit))}</small></span><span class="v"><span class="spin"></span></span><span class="p"></span><span class="s">${spark([])}</span><span class="src">${esc(srcAbbr(x.source))}</span></a></li>`).join("")}</ul>`).join("")}
      ${iso === "SI" ? `<p class="tnote" style="margin-top:1rem">${esc(t("cNoteSI"))}</p>` : ""}`);
    // group indicators that share a query (IMF WEO) into one request
    const groups = [];
    const seen = {};
    list.forEach(x => { if (x.batch) { if (!seen[x.batch]) { seen[x.batch] = { batch: x.batch, items: [] }; groups.push(seen[x.batch]); } seen[x.batch].items.push(x); } else groups.push({ items: [x] }); });
    const myToken = ++st.token;
    let i = 0;
    const worker = async () => {
      while (i < groups.length) {
        const g = groups[i++];
        try { await fillProfile(g.items, iso); } catch (e) { g.items.forEach(x => setFig(x, null, null, [], e.message)); }
        if (myToken !== st.token) return;
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  }
  function indLink(x, iso) {
    const cs = x.partner ? [iso] : (iso === "SI" ? ["SI"] : [iso, "SI"]);
    return href({ v: "ind", i: x.id, c: cs.join(",") });
  }
  function setFig(x, value, period, points, err) {
    const a = $("#kf-" + x.id);
    if (!a) return;
    $(".v", a).textContent = value === null || value === undefined ? (err ? t("cDown") : t("cNa")) : fmtShow(x.show, value);
    $(".v", a).classList.toggle("na", value === null || value === undefined);
    $(".p", a).textContent = period || "";
    $(".s", a).innerHTML = spark(points || []);
    if (err) a.title = err;
  }
  async function fillProfile(items, iso) {
    const x0 = items[0];
    const m = await S.meta(x0.source, x0.table, x0.lang);
    const gd = m.dims.find(d => d.id === x0.geo);
    const code = gd ? S.countryCodesFor(gd, [iso])[0] : undefined;
    if (code === undefined) { items.forEach(x => setFig(x, null, null, [])); return; }
    const sel = {};
    Object.keys(x0.fixed || {}).forEach(k => { sel[k] = x0.fixed[k].slice(); });
    if (items.length > 1) { const k = "INDICATOR"; sel[k] = items.map(x => x.fixed[k][0]); }
    sel[x0.geo] = [code];
    const td = timeDim(m);
    if (td) sel[td.id] = m.timeMode === "list" ? { last: 12 } : { from: String(new Date().getFullYear() - 12) };
    const res = await S.query(x0.source, m.table, sel, x0.lang, { meta: m });
    const fc = new Set(res.forecast || []), part = new Set(res.partial || []);
    items.forEach(x => {
      let rows = res.rows;
      if (items.length > 1) rows = rows.filter(r => r.INDICATOR === x.fixed.INDICATOR[0]);
      Object.keys(x.local || {}).forEach(k => { rows = rows.filter(r => r[k] === undefined || String(r[k]) === String(x.local[k])); });
      const tId = res.timeDim;
      const times = S.util.sortTimes(Array.from(new Set(rows.map(r => r[tId]))));
      const val = new Map(rows.map(r => [r[tId], r.value]));
      const actual = times.filter(tt => !fc.has(tt) && !part.has(tt) && val.get(tt) !== null && val.get(tt) !== undefined);
      const last = actual[actual.length - 1];
      setFig(x, last !== undefined ? val.get(last) : null, last || "", actual.slice(-10).map(tt => [tt, val.get(tt)]));
    });
  }

  /* ---------------- sources ---------------- */
  function viewSources() {
    layout(sourcesRail(null), `${crumbs([[t("sources")]])}<h1 class="t">${esc(t("sources"))}</h1><p class="sub lede">${esc(I[LANG].aboutText[1])}</p>
      ${Object.keys(S.GROUPS).map(g => `<h2 class="sec">${esc(t("groups")[g])}</h2><ul class="rows two">${Object.values(S.SOURCES).filter(s => s.group === g).map(s => `<li><a href="?v=source&s=${s.key}" data-nav class="${s.type === "pending" ? "off" : ""}"><span class="m">${esc(nm(s.name))}<small>${esc(s.type === "pending" ? t("soon") : nm(s.about))}</small></span><span class="r">${s.type === "pending" ? "" : "›"}</span></a></li>`).join("")}</ul>`).join("")}`);
  }
  async function viewSource(key, path, q) {
    const s = srcOf(key);
    if (!s) return viewSources();
    const trail = [[t("sources"), "?v=sources"], [nm(s.name), path ? `?v=source&s=${key}` : null]];
    if (path) path.split("/").forEach((p, i, arr) => trail.push([p, i < arr.length - 1 ? `?v=source&s=${key}&p=${encodeURIComponent(arr.slice(0, i + 1).join("/"))}` : null]));
    layout(sourcesRail(key), `${crumbs(trail)}<h1 class="t">${esc(nm(s.name))}</h1><p class="sub lede">${esc(nm(s.about))}</p>
      ${s.type === "pending" ? `<p class="sub" style="margin-top:1rem">${esc(t("proxyText"))}</p>` : `<div class="search"><input id="sq" autocomplete="off" placeholder="${esc(t("sourceSearch", s.abbr))}" value="${esc(q)}"></div><p class="progress" id="sprog"></p><div id="slist"></div>`}`);
    if (s.type === "pending") return;
    const lang = dataLangFor(s);
    const box = $("#slist"), prog = $("#sprog");
    const show = (items, label) => {
      prog.textContent = label || "";
      box.innerHTML = items.length ? `<ul class="rows two">${items.slice(0, 400).map(x => x.type === "folder"
        ? `<li><a href="?v=source&s=${key}&p=${encodeURIComponent(x.id)}" data-nav><span class="m folder">${esc(x.label)}</span><span class="r"></span></a></li>`
        : `<li><a href="${esc(tableHref(key, x.id, { ti: x.label || "", l: x.lang || "" }))}" data-nav><span class="m">${esc(x.label)}<small>${esc(x.code || "")}</small></span><span class="r">${x.updated ? esc(fmtDay(x.updated)) : ""}</span></a></li>`).join("")}</ul>` : `<p class="empty">${esc(t("none"))}</p>`;
    };
    const load = async (qq) => {
      prog.innerHTML = `<span class="spin"></span>${esc(t("searching"))} …`;
      try {
        if (qq) show(await S.search(key, qq, lang));
        else if (s.type === "pxweb" && !s.flat) show(await S.browse(key, path, lang));
        else { const all = await S.list(key, lang); show(all.slice().sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 150), `${t("recent")}, ${t("count", nf(all.length))}`); }
      } catch (e) { prog.textContent = ""; box.innerHTML = `<p class="status err">${esc(e.message)}</p>`; }
    };
    const inp = $("#sq");
    inp.addEventListener("input", debounce(() => { const v = inp.value.trim(); history.replaceState({}, "", href(Object.assign({ v: "source", s: key }, path ? { p: path } : {}, v ? { q: v } : {}))); load(v); }, 300));
    load(q);
  }

  /* ---------------- library ---------------- */
  let SHARED = null;
  async function loadShared() {
    if (SHARED) return SHARED;
    try { const r = await fetch("library.json", { cache: "no-cache" }); SHARED = r.ok ? (await r.json()).items || [] : []; } catch (_) { SHARED = []; }
    return SHARED;
  }
  function myLib() { try { return JSON.parse(store.get("isrstat.lib") || "[]"); } catch (_) { return []; } }
  function setMyLib(a) { store.set("isrstat.lib", JSON.stringify(a)); }
  function libHref(x) { return x.ind ? href({ v: "ind", i: x.ind, sel: b64e(x.sel || {}), loc: x.loc && Object.keys(x.loc).length ? b64e(x.loc) : "" }) : tableHref(x.source, x.table, { l: x.lang || "", ti: x.tableTitle || "", sel: b64e(x.sel || {}) }); }
  function libRow(x, myIdx) {
    const right = myIdx !== undefined ? `<button data-del="${myIdx}" class="lnk">${esc(t("del"))}</button>` : esc(srcAbbr(x.source));
    return `<a href="${esc(libHref(x))}" data-nav><span class="m">${esc(x.title)}${x.note ? `<small>${esc(x.note)}</small>` : ""}</span><span class="r">${right}</span></a>`;
  }
  async function viewLibrary() {
    const sh = await loadShared(), my = myLib();
    layout("", `${crumbs([[t("nav").library]])}<h1 class="t">${esc(t("nav").library)}</h1><p class="sub lede">${esc(t("libHint"))}</p>
      ${my.length ? `<h2 class="sec">${esc(t("mine"))}</h2><ul class="rows two">${my.map((x, i) => `<li>${libRow(x, i)}</li>`).join("")}</ul>` : ""}
      <h2 class="sec">${esc(t("shared"))}</h2><ul class="rows two">${sh.map(x => `<li>${libRow(x)}</li>`).join("")}</ul>`);
    $$("[data-del]").forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const a = myLib(); a.splice(Number(b.dataset.del), 1); setMyLib(a); viewLibrary(); }));
  }

  /* ---------------- about ---------------- */
  function viewAbout() {
    layout("", `${crumbs([[t("about")]])}<h1 class="t">ISR Stat</h1><p class="sub">${esc(t("inst"))}</p>
      <div class="prose" style="margin-top:1.25rem">${I[LANG].aboutText.map(x => `<p>${esc(x)}</p>`).join("")}<p class="soft">${esc(t("rules"))}</p></div>`);
  }

  /* ---------------- command palette ---------------- */
  function openPalette() {
    const pal = $("#pal");
    if (pal.classList.contains("open")) return;
    pal.classList.add("open");
    pal.innerHTML = `<div class="box" role="dialog" aria-label="${esc(t("find"))}"><input id="palQ" autocomplete="off" spellcheck="false" placeholder="${esc(t("searchPh"))}"><div class="list" id="palL"></div><div class="foot2"><span id="palP"></span><span class="keys">${I[LANG].palHint.map(x => `<span>${esc(x)}</span>`).join("")}</span></div></div>`;
    const q = $("#palQ"), list = $("#palL"), prog = $("#palP");
    let kb = 0, cur = [];
    const start = TOPICS.map(tp => ({ kind: "topic", label: nm(tp.name), href: `?v=topic&k=${tp.id}`, code: t("topics") }));
    const render = (items, pending) => {
      cur = items.slice(0, 40);
      kb = Math.min(kb, Math.max(0, cur.length - 1));
      list.innerHTML = cur.map((x, i) => `<a href="${esc(x.kind === "topic" ? x.href : hitHref(x))}" data-nav class="${i === kb ? "kb" : ""}"><span class="l">${esc(x.kind === "topic" ? t("topics") : hitLeft(x))}</span><span>${esc(x.label)}</span><span class="r">${esc(x.kind === "topic" ? "" : x.code || "")}</span></a>`).join("") || (pending && pending.length ? "" : `<p class="empty" style="padding:.5rem 1.1rem">${esc(t("none"))}</p>`);
      prog.innerHTML = pending && pending.length ? `<span class="spin"></span>${esc(pending.map(srcAbbr).join(", "))}` : "";
    };
    render(start, []);
    q.focus();
    q.addEventListener("input", debounce(() => { const v = q.value.trim(); kb = 0; if (!v) return render(start, []); runSearch(v, render); }, 200));
    q.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); kb = Math.max(0, Math.min(cur.length - 1, kb + (e.key === "ArrowDown" ? 1 : -1))); $$("a", list).forEach((a, i) => a.classList.toggle("kb", i === kb)); const el = $$("a", list)[kb]; if (el) el.scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter") { const el = $$("a", list)[kb]; if (el) el.click(); }
    });
  }
  function closePalette() { const pal = $("#pal"); if (pal) { pal.classList.remove("open"); pal.innerHTML = ""; searchSeq++; } }
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); loadShared().then(openPalette); }
    if (e.key === "Escape") { if ($("#pal").classList.contains("open")) closePalette(); else if (st.open) { st.open = null; if ($("#selBox")) renderSel(); } }
  });
  document.addEventListener("click", (e) => { const pal = $("#pal"); if (pal.classList.contains("open") && e.target === pal) closePalette(); });

  route();
  window.ISRApp = { st, go, pull, pivot, openPalette };
})();
