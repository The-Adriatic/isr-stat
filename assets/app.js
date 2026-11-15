/* ISR Stat — vmesnik
 * En stolpec. Podatki se pokažejo takoj, ko odprete tabelo; izbor je kratek
 * seznam, ki ga spremenite s klikom. ⌘K ali / odpre iskanje od koderkoli.
 */
(function () {
  "use strict";
  const S = window.ISRStat, C = window.ISRChart;
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
      intro1: "Uradna statistika iz prvih virov: SURS, Banka Slovenije, Eurostat, ECB, OECD, IMF, ILO, Svetovna banka in statistični uradi v regiji.",
      intro2: "Poiščite tabelo, izberite države in obdobje. Podatki pridejo neposredno od vira, z navedbo po pravilih FDV in datumom pridobitve.",
      searchPh: "Poiščite tabelo …", tryLabel: "Na primer", searching: "Iščem", none: "Nič ne ustreza. Poskusite z drugo besedo ali v angleščini.",
      shared: "Pripravljene poizvedbe", mine: "Moje shranjene", sources: "Viri", soon: "kmalu",
      groups: { si: "Slovenija", int: "EU in svet", wb: "Regija" },
      back: "Nazaj", home: "Domov", updated: "posodobljeno", atSource: "pri viru",
      loadingMeta: "Berem tabelo …", loading: "Nalagam podatke …", big: "Izbor obsega približno {0} vrednosti.", bigGo: "Vseeno pridobi",
      reqMissing: "Izberite še: {0}.", change: "spremeni", done: "Končano", all: "vse", none2: "nič", find: "Išči med {0} …",
      total: "skupaj", allN: "vse ({0})", andMore: "in še {0}",
      lastP: "zadnje obdobje", lastN: "zadnjih {0}", allPeriods: "vsa obdobja", fromY: "od {0}", toY: "do {0}", latest: "zadnje",
      from: "Od", to: "Do", lastObs: "Zadnjih N",
      partial: "<b>{0}</b> je delno leto ({1}) in začasno. Na grafu ni prikazano; s celimi leti ga ne primerjajte.",
      prov: "Začasni podatki: <b>{0}</b>.", fc: "Obdobja <b>{0}</b> so napovedi, ne izmerjeni podatki.",
      isr: "ISR", color: "barvno", focusHint: "",
      cite: "Navedba", citeFdv: "V Virih (FDV)", citeText: "V besedilu", citeFig: "Pod sliko", citeApa: "Angleško (APA)", pulled: "Pridobljeno", flags: "Zastavice", copy: "kopiraj", copied: "kopirano",
      dl: "Prenesi:", csv: "CSV", xlsx: "Excel", svg: "SVG", png: "PNG", copyTable: "Kopiraj tabelo", link: "Povezava", save: "Shrani",
      saveName: "Ime", saveOk: "Shrani", cancel: "Prekliči", saved: "Shranjeno med Moje shranjene.", linkCopied: "Povezava kopirana.",
      forClaude: "Za Clauda", rows: "Prikazanih prvih {0} vrstic od {1}; izvoz vsebuje vse.", noData: "Za ta izbor ni podatkov.",
      del: "odstrani", sourceSearch: "Išči v viru {0} …", recent: "Nazadnje posodobljene", count: "{0} tabel",
      proxyText: "Strežnik tega vira ne dovoli branja iz brskalnika. Deloval bo, ko bo nastavljen posrednik ISR.",
      about: "O orodju", lang: "English", github: "Koda", err: "Napaka",
      rules: "Pred objavo: zrcalne statistike se razlikujejo (izvoz A v B ni uvoz B iz A); neposredne naložbe so podatek centralnih bank; delnega leta ne primerjajte s celim; pri majhni osnovi navedite tudi absolutno vrednost.",
      aboutText: ["ISR Stat je vmesnik za uradne statistične API-je, s katerimi dela Inštitut za strateške rešitve (ISR). Brskalnik se z vsakim virom poveže neposredno; na strežniku se nič ne hrani.", "Isto kodo (assets/isrstat.js) uporablja Claude, ko za ISR pridobiva podatke, zato podatek v aplikaciji in podatek v Claudovem osnutku izhajata iz iste poizvedbe."],
      palHint: "↑↓ izbira · ↵ odpre · esc zapre", inTime: "v Ljubljani",
    },
    en: {
      app: "Statistics", inst: "Institute for Strategic Solutions (ISR)",
      intro1: "Official statistics from the source: SURS, Bank of Slovenia, Eurostat, the ECB, OECD, IMF, ILO, World Bank and the region's statistical offices.",
      intro2: "Find a table, pick the countries and the period. Data comes straight from the source, with a citation and the date it was pulled.",
      searchPh: "Find a table …", tryLabel: "Try", searching: "Searching", none: "Nothing matches. Try another word.",
      shared: "Ready-made queries", mine: "Saved by me", sources: "Sources", soon: "soon",
      groups: { si: "Slovenia", int: "EU and world", wb: "Region" },
      back: "Back", home: "Home", updated: "updated", atSource: "at source",
      loadingMeta: "Reading the table …", loading: "Loading data …", big: "This selection covers about {0} values.", bigGo: "Fetch anyway",
      reqMissing: "Still to choose: {0}.", change: "change", done: "Done", all: "all", none2: "none", find: "Search {0} values …",
      total: "total", allN: "all ({0})", andMore: "and {0} more",
      lastP: "latest period", lastN: "last {0}", allPeriods: "all periods", fromY: "from {0}", toY: "to {0}", latest: "latest",
      from: "From", to: "To", lastObs: "Last N",
      partial: "<b>{0}</b> is a part-year ({1}) and provisional. It is left off the chart; do not compare it with full years.",
      prov: "Provisional data: <b>{0}</b>.", fc: "Periods <b>{0}</b> are projections, not measured data.",
      isr: "ISR", color: "colour", focusHint: "",
      cite: "Citation", citeFdv: "Reference list (FDV)", citeText: "In text", citeFig: "Under a figure", citeApa: "English (APA)", pulled: "Pulled", flags: "Flags", copy: "copy", copied: "copied",
      dl: "Download:", csv: "CSV", xlsx: "Excel", svg: "SVG", png: "PNG", copyTable: "Copy table", link: "Link", save: "Save",
      saveName: "Name", saveOk: "Save", cancel: "Cancel", saved: "Saved to Saved by me.", linkCopied: "Link copied.",
      forClaude: "For Claude", rows: "Showing the first {0} of {1} rows; exports contain all.", noData: "No data for this selection.",
      del: "remove", sourceSearch: "Search {0} …", recent: "Recently updated", count: "{0} tables",
      proxyText: "This source's server does not let browsers read it. It will work once the ISR proxy is set up.",
      about: "About", lang: "Slovenščina", github: "Code", err: "Error",
      rules: "Before publishing: mirror statistics differ (A's exports to B are not B's imports from A); FDI comes from central banks; never compare a part-year with a full year; off a small base, give the absolute figure too.",
      aboutText: ["ISR Stat is a front end to the official statistics APIs the Institute for Strategic Solutions (ISR) works with. Your browser talks to each source directly; nothing is stored on a server.", "Claude uses the same code (assets/isrstat.js) when it pulls data for ISR, so a figure in the app and a figure in a Claude draft come from the same query."],
      palHint: "↑↓ select · ↵ open · esc close", inTime: "in Ljubljana",
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
  const nf = (n) => new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI").format(n);
  const srcOf = (k) => S.SOURCES[k];
  function fmtDay(s) { if (!s) return ""; const d = new Date(s); if (isNaN(d)) return String(s).slice(0, 10); return LANG === "en" ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : S.util.fmtDateSL(d); }
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.style.display = "block"; clearTimeout(toast._t); toast._t = setTimeout(() => { el.style.display = "none"; }, 1800); }
  async function copyText(text, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ } ta.remove(); }
    if (btn) { const o = btn.textContent; btn.textContent = t("copied"); setTimeout(() => { btn.textContent = o; }, 1400); } else if (ok) toast(t("copied"));
  }
  function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  const b64e = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function b64d(s) { try { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (_) { return null; } }
  function dataLangFor(src, want) { if (want && src.langs.includes(want)) return want; if (src.langs.includes(LANG)) return LANG; if (src.langs.includes("en")) return "en"; return src.langs[0]; }
  function sentence(s) { s = String(s || ""); return s === s.toUpperCase() && /[A-ZČŠŽ]/.test(s) ? s.charAt(0) + s.slice(1).toLowerCase() : s; }
  // common dimension names in Slovene (the source's own name stays in the tooltip)
  const DIM_SL = [
    [/^(ref_area|geo|country|REF_AREA|COUNTRY|JURISDICTION)$/i, "Država"], [/^(time|TIME_PERIOD)$/i, "Obdobje"], [/^sex$/i, "Spol"],
    [/^(freq|FREQUENCY)$/i, "Pogostost"], [/^(unit|UNIT_MEASURE|UNIT)$/i, "Enota"], [/^na_item$/i, "Kazalnik"], [/^INDICATOR$/i, "Kazalnik"],
    [/^CURRENCY$/i, "Valuta"], [/^CURRENCY_DENOM$/i, "Proti valuti"], [/^(s_adj|ADJUSTMENT)$/i, "Desezoniranje"], [/^TRANSFORMATION$/i, "Preračun"],
  ];
  function dimLabel(d) {
    if (LANG === "sl") {
      for (const [re, l] of DIM_SL) if (re.test(d.id)) return l;
      if (/^classif\d$/.test(d.id) && /^Age\b/i.test(d.label)) return "Starost";
      if (/^classif\d$/.test(d.id) && /economic activity/i.test(d.label)) return "Dejavnost";
    }
    return sentence(d.label);
  }
  function debounce(fn, ms) { let h; return function () { const a = arguments; clearTimeout(h); h = setTimeout(() => fn.apply(null, a), ms); }; }
  function tableHref(source, id, extra) {
    const p = new URLSearchParams(Object.assign({ v: "table", s: source, t: id }, extra || {}));
    for (const [k, v] of Array.from(p.entries())) if (v === "" || v === "undefined") p.delete(k);
    return "?" + p.toString();
  }
  function srcAbbr(k) { const s = srcOf(k); return s ? (s.short || (LANG === "en" && s.abbrEn ? s.abbrEn : s.abbr)) : k; }

  /* ---------------- routing ---------------- */
  const st = { meta: null, sel: {}, res: null, local: {}, open: null, token: 0, chart: { mode: "isr", focus: null, title: "", subtitle: "" }, stem: "", source: null, table: null, lang: null, title: null, forceBig: false };
  function params() { const o = {}; new URLSearchParams(location.search).forEach((v, k) => { o[k] = v; }); return o; }
  let inApp = false;   // true once the user has navigated inside the app (so "Back" can use history)
  function go(p, replace) {
    if (!replace) inApp = true;
    const u = new URL(location.href);
    u.search = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
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
    if (p.v === "table") return viewTable(p.s, p.t, p.l, p.sel ? b64d(p.sel) : null, p.ti || null);
    if (p.v === "source") return viewSource(p.s, p.p || "", p.q || "");
    if (p.v === "about") return viewAbout();
    return viewHome(p.q || "");
  }

  function page(html) { const m = $("#main"); m.className = "page"; m.innerHTML = html; return m; }
  function head() {
    return `<header class="head"><a class="brand" href="./" data-nav><img src="assets/isr-logo-navy.svg" alt="ISR">${esc(t("app"))}</a><span class="sub">${esc(t("inst"))}</span></header>`;
  }
  function footer() {
    const now = new Date();
    const time = now.toLocaleTimeString(LANG === "en" ? "en-GB" : "sl-SI", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Ljubljana" });
    return `<div class="foot"></div><div class="footline"><span>${esc(time)} ${esc(t("inTime"))}</span><button data-lang>${esc(t("lang"))}</button><a href="?v=about" data-nav>${esc(t("about"))}</a><a href="https://github.com/The-Adriatic/isr-stat" target="_blank" rel="noopener">${esc(t("github"))}</a><span>${esc(S.VERSION)}</span></div>`;
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-lang]")) { LANG = LANG === "sl" ? "en" : "sl"; store.set("isrstat.lang", LANG); route(); } });

  /* ---------------- search (shared by home and palette) ---------------- */
  let catIndex = null;
  async function loadCatIndex() {
    if (catIndex) return catIndex;
    try { const r = await fetch((CONFIG.catalog || "catalog") + "/index.json", { cache: "no-cache" }); catIndex = r.ok ? (await r.json()).sources || {} : {}; } catch (_) { catIndex = {}; }
    return catIndex;
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
    let hits = [];
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
        hits = hits.concat(r.slice(0, 40).map(x => Object.assign({ source: k }, x)));
      } catch (_) { /* a source that fails simply contributes nothing */ }
      pending.delete(k);
      emit();
    }));
    return hits;
  }
  function hitRow(x, cls) {
    const href = tableHref(x.source, x.id, { ti: x.label || "", l: x.lang || "" });
    return `<a href="${esc(href)}" data-nav class="${cls || ""}"><span class="l">${esc(srcAbbr(x.source))}</span><span class="m">${esc(x.label)}</span><span class="r">${esc(x.code || "")}</span></a>`;
  }

  /* ---------------- home ---------------- */
  async function viewHome(q) {
    const ex = LANG === "en" ? ["exports by country", "direct investment", "GDP growth", "unemployment"] : ["izvoz po državah", "neposredne naložbe", "GDP growth", "brezposelnost"];
    page(`${head()}
      <div class="prose"><p>${esc(t("intro1"))}</p><p class="soft">${esc(t("intro2"))}</p></div>
      <div class="search"><input id="q" autocomplete="off" spellcheck="false" placeholder="${esc(t("searchPh"))}" value="${esc(q)}" aria-label="${esc(t("searchPh"))}"><kbd>⌘K</kbd></div>
      <div class="hint" id="hint">${esc(t("tryLabel"))} ${ex.map(x => `<button data-ex="${esc(x)}">${esc(x)}</button>`).join(", ")}</div>
      <div id="results"></div>
      <div id="lists"></div>
      ${footer()}`);
    const input = $("#q");
    const results = $("#results"), lists = $("#lists"), hint = $("#hint");
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
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); kb = Math.max(0, Math.min(current.length - 1, kb + (e.key === "ArrowDown" ? 1 : -1))); $$("#results a").forEach((a, i) => a.classList.toggle("on", i === kb)); const el = $$("#results a")[kb]; if (el) el.scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter") { const el = $$("#results a")[Math.max(0, kb)]; if (el) el.click(); }
    });
    $$("[data-ex]").forEach(b => b.addEventListener("click", () => { input.value = b.dataset.ex; doSearch(b.dataset.ex); input.focus(); }));
    if (q) { lists.style.display = "none"; hint.style.display = "none"; runSearch(q, render); }
    else if (matchMedia("(pointer:fine)").matches) input.focus();

    // lists: shared, mine, sources
    const shared = await loadShared();
    const my = myLib();
    let h = "";
    if (shared.length) h += `<h2 class="sec">${esc(t("shared"))}</h2><ul class="rows">${shared.map(x => `<li>${libRow(x)}</li>`).join("")}</ul>`;
    if (my.length) h += `<h2 class="sec">${esc(t("mine"))}</h2><ul class="rows">${my.map((x, i) => `<li>${libRow(x, i)}</li>`).join("")}</ul>`;
    h += `<h2 class="sec">${esc(t("sources"))}</h2><ul class="rows">`;
    Object.keys(S.GROUPS).forEach(g => {
      Object.values(S.SOURCES).filter(s => s.group === g).forEach((s, i) => {
        const pend = s.type === "pending";
        h += `<li><a href="?v=source&s=${s.key}" data-nav class="${pend ? "off" : ""}"><span class="l">${i === 0 ? esc(t("groups")[g]) : ""}</span><span class="m">${esc(nm(s.name))}<small>${esc(pend ? t("soon") : nm(s.about))}</small></span><span class="r"></span></a></li>`;
      });
    });
    h += `</ul>`;
    lists.innerHTML = h;
    $$("[data-del]", lists).forEach(b => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const a = myLib(); a.splice(Number(b.dataset.del), 1); setMyLib(a); viewHome(""); }));
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
  function libRow(x, myIdx) {
    const href = tableHref(x.source, x.table, { l: x.lang || "", ti: x.tableTitle || "", sel: b64e(x.sel || {}) });
    const right = myIdx !== undefined ? `<button data-del="${myIdx}" class="lnk">${esc(t("del"))}</button>` : esc(libCode(x));
    return `<a href="${esc(href)}" data-nav><span class="l">${esc(srcAbbr(x.source))}</span><span class="m">${esc(x.title)}${x.note ? `<small>${esc(x.note)}</small>` : ""}</span><span class="r">${right}</span></a>`;
  }
  function libCode(x) { const p = String(x.table).split("/").filter(Boolean).slice(-1)[0] || x.table; return /,/.test(p) ? p.split(",")[1] : p.replace(/\.px$/i, ""); }

  /* ---------------- source ---------------- */
  async function viewSource(key, path, q) {
    const s = srcOf(key);
    if (!s) return viewHome("");
    const backHref = path && s.type === "pxweb" ? `?v=source&s=${key}${path.includes("/") ? "&p=" + encodeURIComponent(path.split("/").slice(0, -1).join("/")) : ""}` : "./";
    page(`<a class="back" href="${esc(backHref)}" data-nav>← ${esc(t("back"))}</a>
      <header class="head"><h1 class="t">${esc(nm(s.name))}</h1><span class="sub">${esc(path ? path.split("/").join(" › ") : nm(s.about))}</span></header>
      ${s.type === "pending" ? `<p class="soft" style="color:var(--muted)">${esc(t("proxyText"))}</p>` : `<div class="search"><input id="sq" autocomplete="off" placeholder="${esc(t("sourceSearch", s.abbr))}" value="${esc(q)}"></div><p class="progress" id="sprog"></p><div id="slist"></div>`}
      ${footer()}`);
    if (s.type === "pending") return;
    const lang = dataLangFor(s);
    const box = $("#slist"), prog = $("#sprog");
    const show = (items, label) => {
      prog.textContent = label || "";
      box.innerHTML = items.length ? `<ul class="rows">${items.slice(0, 400).map(x => x.type === "folder"
        ? `<li><a href="?v=source&s=${key}&p=${encodeURIComponent(x.id)}" data-nav><span class="l"></span><span class="m folder">${esc(x.label)}</span><span class="r"></span></a></li>`
        : `<li>${hitRow(Object.assign({ source: key }, x)).replace(`<span class="r">`, `<span class="r">${x.updated ? esc(fmtDay(x.updated)) + " · " : ""}`)}</li>`).join("")}</ul>` : `<p class="empty">${esc(t("none"))}</p>`;
    };
    const load = async (qq) => {
      prog.innerHTML = `<span class="spin"></span>${esc(t("searching"))} …`;
      try {
        if (qq) show(await S.search(key, qq, lang));
        else if (s.type === "pxweb" && !s.flat) show(await S.browse(key, path, lang));
        else {
          const all = await S.list(key, lang);
          show(all.slice().sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 150), `${t("recent")} · ${t("count", nf(all.length))}`);
        }
      } catch (e) { prog.textContent = ""; box.innerHTML = `<p class="status err">${esc(e.message)}</p>`; }
    };
    const inp = $("#sq");
    inp.addEventListener("input", debounce(() => { const v = inp.value.trim(); history.replaceState({}, "", "?" + new URLSearchParams(Object.assign({ v: "source", s: key }, path ? { p: path } : {}, v ? { q: v } : {}))); load(v); }, 300));
    load(q);
  }

  /* ---------------- table ---------------- */
  async function viewTable(key, id, wantLang, sel, title) {
    const s = srcOf(key);
    if (!s || !id) return viewHome("");
    const lang = dataLangFor(s, wantLang);
    Object.assign(st, { source: key, table: id, lang, title, res: null, local: {}, open: null, meta: null, stem: "", forceBig: false, chart: { mode: st.chart.mode, focus: null, title: "", subtitle: "" } });
    page(`<a class="back" href="./" data-nav id="backLnk">← ${esc(t("back"))}</a>
      <header class="head"><h1 class="t" id="ttl">${esc(title || id)}</h1><span class="sub" id="tmeta">${esc(nm(s.name))}</span></header>
      <div id="selBox"></div>
      <p class="status" id="status"><span class="spin"></span>${esc(t("loadingMeta"))}</p>
      <div id="notes"></div>
      <div class="result" id="result"></div>
      ${footer()}`);
    if (inApp) $("#backLnk").addEventListener("click", (e) => { e.preventDefault(); history.back(); });
    let m;
    try { m = await S.meta(key, id, lang, title && s.type === "pxweb" ? { title } : undefined); }
    catch (e) { $("#status").className = "status err"; $("#status").textContent = e.message; return; }
    st.meta = m;
    st.sel = sel || defaultSel(m, s);
    $("#ttl").textContent = m.title;
    const langs = s.langs.length > 1 ? " · " + s.langs.map(l => l === lang ? `<span>${l.toUpperCase()}</span>` : `<a href="${esc(tableHref(key, id, { l, ti: title || "" }))}" data-nav>${l.toUpperCase()}</a>`).join(" ") : "";
    $("#tmeta").innerHTML = `${esc(nm(s.name))} · ${esc(m.tableCode)}${m.updated ? " · " + esc(t("updated")) + " " + esc(fmtDay(m.updated)) : ""} · <a href="${esc(m.web)}" target="_blank" rel="noopener">${esc(t("atSource"))} ↗</a>${langs}`;
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

  // dimensions that appear only in the result (ILO's sex and age breakdowns): filtered locally
  function localDims() {
    if (!st.res || !st.meta) return [];
    const known = new Set(st.meta.dims.map(d => d.id));
    return st.res.dims.filter(d => !known.has(d.id) && d.id !== st.res.timeDim && d.values.length > 1);
  }

  function summary(d, isLocal) {
    const m = st.meta;
    if (isLocal) {
      const set = st.local[d.id];
      if (!set || !set.size || set.size === d.values.length) return t("allN", d.values.length);
      return listSummary(d, Array.from(set));
    }
    const v = st.sel[d.id];
    if (d.role === "time") {
      const vals = d.values.map(x => x.id);
      const span = (a, b) => a === b ? a : `${a}–${b}`;
      if (v && v.last) { const n = v.last; if (!vals.length) return t("lastN", n); const a = vals[Math.max(0, vals.length - n)], b = vals[vals.length - 1]; return n === 1 ? `${t("lastP")} (${b})` : `${t("lastN", n)} (${span(a, b)})`; }
      if (v === "*" || v === undefined) return vals.length ? `${t("allPeriods")} (${span(vals[0], vals[vals.length - 1])})` : t("allPeriods");
      if (v && (v.from || v.to)) return v.from && v.to ? span(v.from, v.to) : v.from ? t("fromY", v.from) : t("toY", v.to);
      if (Array.isArray(v)) return v.length ? listSummary(d, v) : t("allPeriods");
    }
    if (v === "*") return t("allN", d.values.length);
    if (!Array.isArray(v) || !v.length) return srcOf(st.source).type === "pxweb" && !d.required ? t("total") : t("allN", d.values.length);
    if (v.length === d.values.length && v.length > 3) return t("allN", d.values.length);
    return listSummary(d, v);
  }
  function listSummary(d, codes) {
    const lab = new Map(d.values.map(x => [String(x.id), x.label]));
    const names = codes.slice(0, 3).map(c => lab.get(String(c)) || c);
    return names.join(", ") + (codes.length > 3 ? " " + t("andMore", codes.length - 3) : "");
  }

  function renderSel() {
    const m = st.meta;
    const dims = m.dims.filter(d => d.role === "time" || d.values.length > 1);
    const loc = localDims();
    const item = (d, isLocal) => {
      const open = st.open === (isLocal ? "L:" : "") + d.id;
      return `<div class="item ${open ? "open" : ""}" data-d="${esc(d.id)}" data-local="${isLocal ? 1 : 0}"><button class="row" aria-expanded="${open}"><span class="k" title="${esc(d.label)}">${esc(dimLabel(d))}</span><span class="v">${esc(summary(d, isLocal))}</span><span class="c">${open ? esc(t("done")) : esc(t("change"))}</span></button>${open ? pickerHTML(d, isLocal) : ""}</div>`;
    };
    $("#selBox").innerHTML = `<div class="sel">${dims.map(d => item(d, false)).join("")}${loc.map(d => item(d, true)).join("")}</div>`;
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

  function pickerHTML(d, isLocal) {
    const m = st.meta;
    const isTime = d.role === "time";
    if (isTime && m.timeMode !== "list" && !isLocal) {
      const v = st.sel[d.id] || {};
      return `<div class="picker"><div class="quick">${[5, 10, 20].map(n => `<button data-tlast="${n}">${esc(t("lastN", n))}</button>`).join("")}<button data-tall>${esc(t("allPeriods"))}</button></div><div class="range"><label>${esc(t("from"))}<input data-tf value="${esc(v.from || "")}" placeholder="2015"></label><label>${esc(t("to"))}<input data-tt value="${esc(v.to || "")}" placeholder="${new Date().getFullYear()}"></label><label>${esc(t("lastObs"))}<input data-tl inputmode="numeric" value="${esc(v.last || "")}"></label></div></div>`;
    }
    const quick = [];
    if (isTime && !isLocal) [1, 5, 10, 20].filter(n => n <= d.values.length).forEach(n => quick.push(`<button data-last="${n}">${esc(n === 1 ? t("latest") : t("lastN", n))}</button>`));
    if (d.role === "geo" && !isLocal) Object.entries(S.COUNTRY_GROUPS).forEach(([g, o]) => { if (S.countryCodesFor(d, g).length >= 2) quick.push(`<button data-grp="${g}">${esc(nm(o))}</button>`); });
    quick.push(`<button data-all>${esc(t("all"))}</button>`, `<button data-none>${esc(t("none2"))}</button>`);
    const vals = isTime ? d.values.slice().reverse() : d.values;
    const cap = 600;
    return `<div class="picker">${d.values.length > 8 ? `<input class="find" placeholder="${esc(t("find", nf(d.values.length)))}" autocomplete="off" spellcheck="false">` : ""}<div class="quick">${quick.join("")}</div><div class="opts">${vals.slice(0, cap).map(v => optHTML(d, v, isLocal)).join("")}</div>${vals.length > cap ? `<p class="more" data-more>+ ${nf(vals.length - cap)}</p>` : ""}</div>`;
  }
  function optHTML(d, v, isLocal) {
    return `<button class="opt" data-v="${esc(v.id)}" data-n="${esc(S.util.norm(v.label + " " + v.id))}" aria-pressed="${isOn(d, v.id, isLocal)}"><span>${esc(v.label)}</span>${String(v.label) !== String(v.id) ? `<code>${esc(v.id)}</code>` : "<span></span>"}</button>`;
  }

  function wireItem(el) {
    const id = el.dataset.d, isLocal = el.dataset.local === "1";
    const d = isLocal ? localDims().find(x => x.id === id) : st.meta.dims.find(x => x.id === id);
    const key = (isLocal ? "L:" : "") + id;
    $(".row", el).addEventListener("click", () => { st.open = st.open === key ? null : key; renderSel(); });
    const pk = $(".picker", el);
    if (!pk) return;
    const refresh = () => {
      $$(".opt", pk).forEach(b => b.setAttribute("aria-pressed", isOn(d, b.dataset.v, isLocal)));
      $(".row .v", el).textContent = summary(d, isLocal);
      changed(isLocal);
    };
    pk.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (isLocal) {
        const all = d.values.map(v => String(v.id));
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
        if (!Array.isArray(cur)) cur = d.values.filter(v => isOn(d, v.id, false)).map(v => v.id);
        cur = cur.includes(c) ? cur.filter(x => x !== c) : cur.concat([c]);
        const order = new Map(d.values.map((v, i) => [v.id, i]));
        cur.sort((a, b2) => order.get(a) - order.get(b2));
        st.sel[id] = cur;
      } else if (b.hasAttribute("data-all")) st.sel[id] = d.role === "time" ? "*" : d.values.map(v => v.id);
      else if (b.hasAttribute("data-none")) st.sel[id] = [];
      else if (b.dataset.last) st.sel[id] = { last: Number(b.dataset.last) };
      else if (b.dataset.grp) st.sel[id] = S.countryCodesFor(d, b.dataset.grp);
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
        if (q && d.values.length > 600) {
          // long lists: search the whole list, not just the rendered part
          const hits = d.values.filter(v => S.util.norm(v.label + " " + v.id).includes(q)).slice(0, 200);
          opts.innerHTML = hits.map(v => optHTML(d, v, isLocal)).join("");
        } else $$(".opt", pk).forEach(b => { b.style.display = !q || b.dataset.n.includes(q) ? "" : "none"; });
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
      const upd = () => { const o = {}; if (tl.value.trim()) o.last = Number(tl.value); else { if (tf.value.trim()) o.from = tf.value.trim(); if (tt.value.trim()) o.to = tt.value.trim(); } st.sel[id] = Object.keys(o).length ? o : "*"; $(".row .v", el).textContent = summary(d, false); changed(); };
      [tf, tt, tl].forEach(x => x.addEventListener("input", debounce(upd, 500)));
    }
  }

  function changed(isLocal) {
    if (isLocal) { renderResult(); return; }
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
    const out = {}, s = srcOf(st.source);
    st.meta.dims.forEach(d => {
      const v = st.sel[d.id];
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) { if (v.length) out[d.id] = v.slice(); return; }
      out[d.id] = v;
    });
    void s;
    return out;
  }
  function missingRequired() {
    return st.meta.dims.filter(d => d.required && d.role !== "time" && !(Array.isArray(st.sel[d.id]) && st.sel[d.id].length) && st.sel[d.id] !== "*").map(d => dimLabel(d));
  }
  function shareURL() {
    const u = new URL(location.href);
    u.search = new URLSearchParams({ v: "table", s: st.source, t: st.table, l: st.lang, ti: st.meta ? st.meta.title : "", sel: b64e(cleanSel()) }).toString();
    return u.toString();
  }

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
    history.replaceState({}, "", "?" + new URLSearchParams({ v: "table", s: st.source, t: st.table, l: st.lang, ti: st.meta.title, sel: b64e(cleanSel()) }).toString());
    try {
      const res = await S.query(st.source, st.table, cleanSel(), st.lang, { meta: st.meta, title: st.meta.title });
      if (my !== st.token) return;
      const firstTime = !st.res;
      st.res = res;
      window.ISR_LAST = res;
      if (!st.stem) st.stem = S.fileStem(res);
      // result-only breakdowns start at their totals so the first picture is readable
      localDims().forEach(d => {
        if (st.local[d.id] && st.local[d.id].size && Array.from(st.local[d.id]).every(c => d.values.some(v => String(v.id) === c))) return;
        const tot = d.values.find(v => /(^|_)(T|TOTAL|TOT|YGE15|AGGREGATE)$/i.test(String(v.id))) || d.values.find(v => /^(total|skupaj|15\+)/i.test(String(v.label)));
        st.local[d.id] = new Set([String((tot || d.values[0]).id)]);
      });
      if (firstTime || localDims().length) renderSel();
      if (!st.chart.title || firstTime) st.chart.title = res.title;
      st.chart.subtitle = "";
      status.textContent = "";
      renderResult();
    } catch (e) {
      if (my !== st.token) return;
      status.className = "status err";
      status.textContent = e && e.info && e.info.code === "EMPTY" ? t("noData") : (e.message || String(e));
    } finally { if (my === st.token) result.classList.remove("busy"); }
  }

  /* ---------------- result ---------------- */
  function shown() {
    const r = st.res;
    const keys = Object.keys(st.local).filter(k => st.local[k] && st.local[k].size);
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
    const f = new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI", { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return (v) => (v === null || v === undefined ? "" : f.format(v));
  }

  function renderResult() {
    const r = st.res, box = $("#result"), notes = $("#notes");
    if (!r || !box) return;
    const sr = shown();
    const p = pivot(sr);
    // notes
    let nh = "";
    if (r.partial && r.partial.length) nh += `<p class="note">${t("partial", esc(r.partial.join(", ")), esc(r.partial.map(x => String(r.periodLabels[x] || x).replace(/\s*\(.*\)\s*$/, "")).join(", ")))}</p>`;
    else if (r.provisional.length) nh += `<p class="note">${t("prov", esc(r.provisional.join(", ")))}</p>`;
    if (r.forecast.length) nh += `<p class="note">${t("fc", esc(r.forecast.length > 2 ? r.forecast[0] + "–" + r.forecast[r.forecast.length - 1] : r.forecast.join(", ")))}</p>`;
    notes.innerHTML = nh;
    // subtitle: what is fixed in the selection
    if (!st.chart.subtitle) st.chart.subtitle = p.fixedTxt.map(x => x[1]).join(" · ");
    const fmt = valueFormatter(sr);
    const prov = new Set(r.provisional), fc = new Set(r.forecast), pl = r.periodLabels || {};
    const cap = 1000;
    const tableHTML = `<div class="tbl wide"><table class="data"><thead><tr>${(p.head.length ? p.head : [""]).map(x => `<th>${esc(x)}</th>`).join("")}${p.times.map(tt => `<th title="${esc(pl[tt] || "")}">${esc(tt)}${pl[tt] || prov.has(tt) || fc.has(tt) ? "*" : ""}</th>`).join("")}</tr></thead><tbody>${p.body.slice(0, cap).map(b => `<tr>${(b.labels.length ? b.labels : [st.chart.title]).map(l => `<td class="lab">${esc(l)}</td>`).join("")}${b.vals.map((v, i) => `<td>${v === null || v === undefined ? `<span class="x">–</span>` : esc(fmt(v))}${b.st[i] ? `<sup title="${esc(r.flags[b.st[i]] || b.st[i])}">${esc(b.st[i])}</sup>` : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const starred = p.times.filter(tt => pl[tt] || prov.has(tt) || fc.has(tt));
    const usedFlags = Array.from(new Set(sr.rows.map(x => x.status).filter(Boolean)));
    const tnote = [p.body.length > cap ? t("rows", nf(cap), nf(p.body.length)) : "", starred.length ? starred.map(tt => `* ${tt}: ${pl[tt] || (fc.has(tt) ? (LANG === "en" ? "projection" : "napoved") : (LANG === "en" ? "provisional" : "začasno"))}`).join(" · ") : "", usedFlags.length ? usedFlags.map(s => `${s} = ${r.flags[s] || ""}`).join(" · ") : ""].filter(Boolean).join(" · ");
    const c = r.citation;
    const cites = [[t("citeFdv"), c.fdv], [t("citeText"), c.inText], [t("citeFig"), c.figure], [t("citeApa"), c.apa]];
    const call = `await ISRStat.query(${JSON.stringify(r.source)}, ${JSON.stringify(r.table)}, ${JSON.stringify(r.query.sel)}, ${JSON.stringify(r.query.lang)})`;
    box.innerHTML = `
      <div class="ctitle"><span class="t1" contenteditable="true" spellcheck="false" id="cT">${esc(st.chart.title)}</span><span class="t2" contenteditable="true" spellcheck="false" id="cS">${esc(st.chart.subtitle)}</span></div>
      <div class="legend" id="legend"></div>
      <div class="chart wide" id="chartBox"></div>
      <div class="caption wide"><span id="capL">${esc(c.figure)}</span><span><button data-mode="isr" class="${st.chart.mode === "isr" ? "on" : ""}">${esc(t("isr"))}</button> · <button data-mode="barvno" class="${st.chart.mode === "barvno" ? "on" : ""}">${esc(t("color"))}</button></span></div>
      ${tableHTML}
      ${tnote ? `<p class="tnote wide">${esc(tnote)}</p>` : ""}
      <h2 class="sec">${esc(t("cite"))}</h2>
      <dl class="kv">${cites.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd><button class="cp" data-cp="${esc(v)}">${esc(t("copy"))}</button></div>`).join("")}
        <div><dt>${esc(t("pulled"))}</dt><dd>${esc(fmtDay(r.pulledAt))}, ${esc(new Date(r.pulledAt).toTimeString().slice(0, 5))}${r.updated ? ` · ${esc(t("updated"))} ${esc(fmtDay(r.updated))}` : ""}</dd><span></span></div></dl>
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
    const cap = [st.res.citation.figure];
    if (info.skipped && info.skipped.length) cap.push(LANG === "en" ? `Part-year ${info.skipped.join(", ")} not shown.` : `Delno leto ${info.skipped.join(", ")} ni prikazano.`);
    if (info.scaleTag) cap.unshift(LANG === "en" ? `In ${info.scaleTag}.` : `V ${info.scaleTag}`);
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
    // a full chart for export: title, subtitle and source line inside the image
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
      const lines = [p.head.concat(p.times).join("\t")].concat(p.body.map(b => b.labels.concat(b.vals.map(fmt)).join("\t")));
      return copyText(lines.join("\n"), btn);
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
    const aoa = [];
    aoa.push([st.chart.title || st.res.title]);
    if (p.fixedTxt.length) aoa.push([p.fixedTxt.map(([a, b]) => `${a}: ${b}`).join(" · ")]);
    aoa.push([]);
    aoa.push(p.head.concat(p.times));
    p.body.forEach(b => aoa.push(b.labels.concat(b.vals.map(v => (v === null || v === undefined ? null : v)))));
    aoa.push([]); aoa.push([st.res.citation.figure]);
    const ws2 = X.utils.aoa_to_sheet(aoa);
    ws2["!cols"] = p.head.map(() => ({ wch: 30 })).concat(p.times.map(() => ({ wch: 12 })));
    const c = st.res.citation;
    const used = Array.from(new Set(r.rows.map(x => x.status).filter(Boolean)));
    const info = [
      ["Naslov", st.res.title], ["Vir", nm(S.SOURCES[st.res.source].inst)], ["Tabela", st.res.tableCode], ["Povezava", st.res.doi ? "https://doi.org/" + st.res.doi : st.res.web],
      ["Posodobljeno pri viru", st.res.updated || ""], ["Pridobljeno", new Date(st.res.pulledAt).toLocaleString("sl-SI")],
      ["Delno leto", (st.res.partial || []).map(x => `${x} (${st.res.periodLabels[x] || ""})`).join(", ")], ["Začasni podatki", st.res.provisional.join(", ")], ["Napovedi", st.res.forecast.join(", ")],
      [], ["Navedba (FDV, Viri)", c.fdv], ["V besedilu", c.inText], ["Pod sliko ali tabelo", c.figure], ["Angleško (APA 7)", c.apa], ["Kratko", c.short],
      [], ["Zastavice", used.map(s => `${s} = ${st.res.flags[s] || ""}`).join("; ")], ["Poizvedba (API)", st.res.url], ["Izbor (JSON)", JSON.stringify(st.res.query.sel)],
      ["Orodje", `ISR Stat ${S.VERSION}, ${location.origin}${location.pathname}`],
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
    const guess = st.res.title + (p.fixedTxt.length ? " – " + p.fixedTxt.map(x => x[1]).slice(0, 2).join(", ") : "");
    box.innerHTML = `<div class="saveRow"><input id="svT" value="${esc(guess)}" aria-label="${esc(t("saveName"))}"><button id="svOk">${esc(t("saveOk"))}</button><button id="svNo">${esc(t("cancel"))}</button></div>`;
    const inp = $("#svT"); inp.focus(); inp.select();
    const ok = () => { const a = myLib(); a.unshift({ title: inp.value.trim() || st.res.title, source: st.source, table: st.table, lang: st.lang, sel: cleanSel(), tableTitle: st.meta.title, saved: new Date().toISOString() }); setMyLib(a); box.innerHTML = ""; toast(t("saved")); };
    $("#svOk").addEventListener("click", ok);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") ok(); if (e.key === "Escape") box.innerHTML = ""; });
    $("#svNo").addEventListener("click", () => { box.innerHTML = ""; });
  }

  /* ---------------- about ---------------- */
  function viewAbout() {
    const rows = Object.values(S.SOURCES).map(s => `<li><div class="row"><span class="l">${esc(s.abbr)}</span><span class="m">${esc(nm(s.name))}<small>${esc(s.type === "pending" ? t("soon") : nm(s.about))}</small></span><span class="r"></span></div></li>`).join("");
    page(`<a class="back" href="./" data-nav>← ${esc(t("back"))}</a>
      <header class="head"><h1 class="t">ISR Stat</h1><span class="sub">${esc(t("inst"))}</span></header>
      <div class="prose">${I[LANG].aboutText.map(x => `<p>${esc(x)}</p>`).join("")}<p class="soft">${esc(t("rules"))}</p></div>
      <h2 class="sec">${esc(t("sources"))}</h2><ul class="rows">${rows}</ul>
      ${footer()}`);
  }

  /* ---------------- command palette ---------------- */
  function openPalette() {
    const pal = $("#pal");
    if (pal.classList.contains("open")) return;
    pal.classList.add("open");
    pal.innerHTML = `<div class="box" role="dialog" aria-label="${esc(t("searchPh"))}"><input id="palQ" autocomplete="off" spellcheck="false" placeholder="${esc(t("searchPh"))}"><div class="list" id="palL"></div><div class="foot2"><span id="palP"></span><span>${esc(t("palHint"))}</span></div></div>`;
    const q = $("#palQ"), list = $("#palL"), prog = $("#palP");
    let kb = 0, cur = [];
    const lib = (SHARED || []).slice(0, 6).map(x => ({ source: x.source, id: x.table, label: x.title, code: libCode(x), lib: x }));
    const render = (items, pending) => {
      cur = items.slice(0, 40);
      kb = Math.min(kb, Math.max(0, cur.length - 1));
      list.innerHTML = cur.map((x, i) => x.lib
        ? `<a href="${esc(tableHref(x.source, x.id, { l: x.lib.lang || "", ti: x.lib.tableTitle || "", sel: b64e(x.lib.sel || {}) }))}" data-nav class="${i === kb ? "kb" : ""}"><span class="l">${esc(srcAbbr(x.source))}</span><span>${esc(x.label)}</span><span class="r">${esc(x.code)}</span></a>`
        : `<a href="${esc(tableHref(x.source, x.id, { ti: x.label || "", l: x.lang || "" }))}" data-nav class="${i === kb ? "kb" : ""}"><span class="l">${esc(srcAbbr(x.source))}</span><span>${esc(x.label)}</span><span class="r">${esc(x.code || "")}</span></a>`).join("") || (pending && pending.length ? "" : `<p class="empty" style="padding:.5rem 1.1rem">${esc(t("none"))}</p>`);
      prog.innerHTML = pending && pending.length ? `<span class="spin"></span>${esc(pending.map(srcAbbr).join(", "))}` : "";
    };
    render(lib, []);
    q.focus();
    q.addEventListener("input", debounce(() => { const v = q.value.trim(); kb = 0; if (!v) return render(lib, []); runSearch(v, render); }, 200));
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

  /* ---------------- boot ---------------- */
  route();
  window.ISRApp = { st, go, pull, pivot, openPalette };
})();
