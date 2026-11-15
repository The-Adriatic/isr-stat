/* ISR Stat — aplikacija */
(function () {
  "use strict";
  const S = window.ISRStat, C = window.ISRChart;
  const CONFIG = window.ISR_CONFIG || {};
  S.setCatalogBase(CONFIG.catalog || "catalog");
  if (CONFIG.proxy) S.configure({ proxy: CONFIG.proxy });

  /* ---------------- i18n ---------------- */
  const I = {
    sl: {
      appName: "Statistika", search: "Išči", searchPh: "Išči po vseh virih: npr. izvoz Srbija, BDP rast, brezposelnost",
      heroK: "ISR Stat", heroT: "Uradna statistika iz prvih virov",
      heroL: "Tabele SURS, Banke Slovenije, Eurostata, ECB, OECD, IMF, ILO, Svetovne banke in statističnih uradov regije na enem mestu. Vsak prenos nosi navedbo vira po pravilih FDV in datum pridobitve.",
      examples: "Primeri:", sources: "Viri", library: "Knjižnica", sharedLib: "Skupna knjižnica", myLib: "Moja knjižnica", about: "O orodju", home: "Domov",
      needsProxy: "potreben posrednik", searching: "Iščem …", results: "Zadetki", noResults: "Ni zadetkov.", all: "Vsi",
      inSource: "Išči v tem viru", openAtSource: "Odpri pri viru", updated: "posodobljeno", code: "oznaka",
      loading: "Nalagam …", loadingMeta: "Berem strukturo tabele …", pull: "Pridobi podatke", pulling: "Pridobivam …",
      cells: "≈ {0} celic", cellsBig: "≈ {0} celic. To je veliko; zožite izbor, sicer lahko vir zavrne poizvedbo.",
      selAll: "Vse", selNone: "Nič", filter: "Filtriraj …", required: "obvezno", total: "skupaj (izpuščeno)", every: "vse vrednosti",
      last1: "Zadnje", lastN: "Zadnjih {0}", from: "Od", to: "Do", lastObs: "ali zadnjih N", timeHint: "Prazno = celotno obdobje.",
      table: "Tabela", chart: "Graf", sourceTab: "Vir in navedba", notes: "Opombe",
      csv: "CSV", xlsx: "Excel", copyTable: "Kopiraj tabelo", svg: "SVG", png: "PNG", save: "Shrani v knjižnico", share: "Povezava do izbora", fileName: "Ime datoteke",
      copied: "Kopirano.", saved: "Shranjeno v Mojo knjižnico.", linkCopied: "Povezava kopirana.",
      obs: "{0} opazovanj", partNote: "Delno leto in začasni podatki: {0}. Delnega leta ne primerjajte s celimi leti; po potrebi primerjajte enaka obdobja (npr. jan.–sep.).", period: "obdobje", pulledAt: "pridobljeno", prov: "Začasni podatki", forecast: "Napovedi", provNote: "Začasni podatki za {0}. Pri primerjavi z drugimi obdobji to navedite.", fcNote: "Obdobja {0} so napovedi, ne izmerjeni podatki.",
      fixed: "Izbor:", chartTitle: "Naslov", chartSub: "Podnaslov", modeIsr: "ISR", modeColor: "Barvno",
      citeFdv: "Navedba v Virih (FDV)", citeText: "V besedilu", citeFig: "Pod sliko ali tabelo", citeApa: "Angleško (APA 7)", citeShort: "Kratko, za zapiske",
      updAt: "Posodobljeno pri viru", pulled: "Pridobljeno", flags: "Zastavice", apiQuery: "Poizvedba (API)", forClaude: "Za Clauda",
      rulesH: "Pred objavo preverite",
      rules: ["Zrcalne statistike se razlikujejo: izvoz države A v B ni enak uvozu B iz A. Izberite enega poročevalca in ga navedite.", "Neposredne naložbe (NTI) so podatek centralnih bank, ne trgovinskih zbirk.", "Zadnje obdobje je pogosto delno ali začasno. Delnega leta ne primerjajte s celim.", "Rast potrebuje osnovo: pri majhni osnovi navedite tudi absolutno vrednost."],
      noData: "Za ta izbor ni podatkov.", chooseReq: "Izberite vsaj eno vrednost pri: {0}", error: "Napaka",
      libEmpty: "Knjižnica je prazna. Shranite izbor iz katerekoli tabele.", open: "Odpri", run: "Pridobi", del: "Izbriši", copyJson: "Kopiraj JSON",
      saveTitle: "Ime vnosa", saveNote: "Opomba (neobvezno)", saveBtn: "Shrani", cancel: "Prekliči",
      sharedHint: "Skupno knjižnico ureja ISR (datoteka library.json v repozitoriju). Vnos iz Moje knjižnice predlagate s »Kopiraj JSON«.",
      browse: "Brskaj", recent: "Nazadnje posodobljene", showing: "Prikazanih {0} od {1}.", filterAfter: "Filtriraj rezultat", filterNote: "Tabela, graf in izvoz upoštevajo filter.",
      truncated: "Prikazanih prvih {0} vrstic od {1}. Izvoz vsebuje vse.", dataLang: "Jezik podatkov", searchSrc: "Išči v viru …",
      proxyText: "Strežnik tega vira ne dovoli klicev iz brskalnika. Ko bo nastavljen posrednik ISR (Cloudflare Worker), bo vir deloval kot ostali.",
      aboutT: "O orodju",
      catalogNote: "Iskanje uporablja katalog tabel. Če ga za vir še ni, se seznam naloži neposredno pri viru (prvič lahko traja nekaj sekund).",
      series: "serij", focusHint: "Kliknite serijo, da jo poudarite.",
    },
    en: {
      appName: "Statistics", search: "Search", searchPh: "Search every source: e.g. exports Serbia, GDP growth, unemployment",
      heroK: "ISR Stat", heroT: "Official statistics, from the source",
      heroL: "Tables from SURS, Bank of Slovenia, Eurostat, the ECB, OECD, IMF, ILO, World Bank and the region's statistical offices in one place. Every download carries a citation and the date it was pulled.",
      examples: "Try:", sources: "Sources", library: "Library", sharedLib: "Shared library", myLib: "My library", about: "About", home: "Home",
      needsProxy: "needs proxy", searching: "Searching …", results: "Results", noResults: "No results.", all: "All",
      inSource: "Search this source", openAtSource: "Open at source", updated: "updated", code: "code",
      loading: "Loading …", loadingMeta: "Reading table structure …", pull: "Get data", pulling: "Fetching …",
      cells: "≈ {0} cells", cellsBig: "≈ {0} cells. That is a lot; narrow the selection or the source may refuse it.",
      selAll: "All", selNone: "None", filter: "Filter …", required: "required", total: "total (eliminated)", every: "all values",
      last1: "Latest", lastN: "Last {0}", from: "From", to: "To", lastObs: "or last N", timeHint: "Empty = whole period.",
      table: "Table", chart: "Chart", sourceTab: "Source and citation", notes: "Notes",
      csv: "CSV", xlsx: "Excel", copyTable: "Copy table", svg: "SVG", png: "PNG", save: "Save to library", share: "Link to selection", fileName: "File name",
      copied: "Copied.", saved: "Saved to My library.", linkCopied: "Link copied.",
      obs: "{0} observations", partNote: "Part-year, provisional data: {0}. Do not compare a part-year with full years; compare like periods (e.g. Jan–Sep) instead.", period: "period", pulledAt: "pulled", prov: "Provisional", forecast: "Projections", provNote: "Provisional data for {0}. Say so when comparing periods.", fcNote: "Periods {0} are projections, not measured data.",
      fixed: "Selection:", chartTitle: "Title", chartSub: "Subtitle", modeIsr: "ISR", modeColor: "Colour",
      citeFdv: "Reference list (FDV, Slovene)", citeText: "In text", citeFig: "Under figure or table", citeApa: "English (APA 7)", citeShort: "Short, for notes",
      updAt: "Updated at source", pulled: "Pulled", flags: "Flags", apiQuery: "Query (API)", forClaude: "For Claude",
      rulesH: "Check before publishing",
      rules: ["Mirror statistics differ: A's exports to B never equal B's imports from A. Pick one reporter and name it.", "FDI comes from central banks, not trade databases.", "The latest period is often partial or provisional. Never compare a part-year with a full year.", "Growth needs a base: off a small base, give the absolute figure too."],
      noData: "No data for this selection.", chooseReq: "Choose at least one value for: {0}", error: "Error",
      libEmpty: "The library is empty. Save a selection from any table.", open: "Open", run: "Fetch", del: "Delete", copyJson: "Copy JSON",
      saveTitle: "Entry name", saveNote: "Note (optional)", saveBtn: "Save", cancel: "Cancel",
      sharedHint: "The shared library is kept by ISR (library.json in the repository). Propose an entry from My library with “Copy JSON”.",
      browse: "Browse", recent: "Recently updated", showing: "Showing {0} of {1}.", filterAfter: "Filter the result", filterNote: "Table, chart and exports follow the filter.",
      truncated: "Showing the first {0} rows of {1}. Exports contain everything.", dataLang: "Data language", searchSrc: "Search source …",
      proxyText: "This source's server refuses calls from browsers. It will work like the others once the ISR proxy (Cloudflare Worker) is set up.",
      aboutT: "About",
      catalogNote: "Search uses a table catalogue. Where there is none yet, the list is loaded from the source directly (the first time can take a few seconds).",
      series: "series", focusHint: "Click a series to highlight it.",
    },
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* ignore */ } },
  };
  let LANG = store.get("isrstat.lang") || "sl";
  if (!I[LANG]) LANG = "sl";
  function t(k) { let s = (I[LANG][k] != null ? I[LANG][k] : I.sl[k]); if (s == null) s = k; for (let i = 1; i < arguments.length; i++) s = String(s).replace("{" + (i - 1) + "}", arguments[i]); return s; }
  function nm(o) { return o ? (o[LANG] || o.sl || o.en) : ""; }

  /* ---------------- helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function nf(n) { return new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI").format(n); }
  function fmtUpd(s) { if (!s) return ""; const d = new Date(s); return isNaN(d) ? String(s).slice(0, 10) : (LANG === "en" ? S.util.isoDate(d) : S.util.fmtDateSL(d)); }
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.style.display = "block"; clearTimeout(toast._t); toast._t = setTimeout(() => { el.style.display = "none"; }, 2200); }
  async function copy(text) { try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch (_) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(t("copied")); } catch (e) { /* ignore */ } ta.remove(); } }
  function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function b64e(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64d(s) { try { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (_) { return null; } }
  function errBox(e) { const info = (e && e.info) || {}; return `<div class="err"><b>${esc(t("error"))}:</b> ${esc(e && e.message || e)}${info.url ? `<br><code>${esc(info.url)}</code>` : ""}</div>`; }
  function spin(msg) { return `<p class="muted"><span class="spinner"></span>${esc(msg)}</p>`; }
  function srcOf(k) { return S.SOURCES[k]; }
  function dataLangFor(src, want) { if (want && src.langs.includes(want)) return want; if (src.langs.includes(LANG)) return LANG; if (src.langs.includes("en")) return "en"; return src.langs[0]; }

  /* ---------------- state + routing ---------------- */
  const st = { meta: null, sel: {}, res: null, filter: {}, tab: "table", chart: { mode: "isr", focus: 0, title: "", subtitle: "" }, dataLang: null, source: null, table: null, title: null };

  function params() { const p = new URLSearchParams(location.search); const o = {}; p.forEach((v, k) => { o[k] = v; }); return o; }
  function go(p, replace) {
    const u = new URL(location.href);
    u.search = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
    u.hash = "";
    history[replace ? "replaceState" : "pushState"]({}, "", u);
    route();
  }
  window.addEventListener("popstate", route);

  function route() {
    const p = params();
    renderSide(p);
    const main = $("#main");
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    if (p.v === "search") return viewSearch(p.q || "", p.f || "");
    if (p.v === "source") return viewSource(p.s, p.p || "", p.q || "");
    if (p.v === "table") return viewTable(p.s, p.t, p.l, p.sel ? b64d(p.sel) : null, p.run === "1", p.ti || null);
    if (p.v === "library") return viewLibrary();
    if (p.v === "about") return viewAbout();
    return viewHome();
  }

  /* ---------------- chrome ---------------- */
  function renderTop() {
    $("#gq").placeholder = t("searchPh");
    $("#gbtn").textContent = t("search");
    $("#brandName").textContent = t("appName");
    $$(".langs button").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
    document.documentElement.lang = LANG;
  }
  function renderSide(p) {
    const groups = Object.keys(S.GROUPS);
    let h = "";
    groups.forEach(g => {
      h += `<h3>${esc(nm(S.GROUPS[g]))}</h3>`;
      Object.values(S.SOURCES).filter(s => s.group === g).forEach(s => {
        const on = (p.v === "source" || p.v === "table") && p.s === s.key;
        h += `<a href="?v=source&s=${s.key}" data-nav class="${on ? "on" : ""} ${s.type === "pending" ? "dim" : ""}"><span>${esc(nm(s.name))}</span>${s.type === "pending" ? `<span class="tag">${esc(t("needsProxy"))}</span>` : ""}</a>`;
      });
    });
    h += `<h3>${esc(t("library"))}</h3><a href="?v=library" data-nav class="${p.v === "library" ? "on" : ""}"><span>${esc(t("sharedLib"))} · ${esc(t("myLib"))}</span></a>`;
    h += `<a href="?v=about" data-nav class="${p.v === "about" ? "on" : ""}"><span>${esc(t("about"))}</span></a>`;
    $("#side").innerHTML = h;
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-nav]");
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && a.origin === location.origin) {
      e.preventDefault();
      const u = new URL(a.href);
      const o = {}; u.searchParams.forEach((v, k) => { o[k] = v; });
      $("#side").classList.remove("open");
      go(o);
    }
  });

  /* ---------------- views: home ---------------- */
  async function viewHome() {
    const main = $("#main");
    const ex = LANG === "en" ? ["exports by country", "direct investment", "GDP growth", "unemployment rate", "exchange rate"] : ["izvoz po državah", "neposredne naložbe", "GDP growth", "unemployment rate", "inflacija"];
    let h = `<section class="hero"><div class="kicker">${esc(t("heroK"))}</div><h1>${esc(t("heroT"))}</h1><p class="lede">${esc(t("heroL"))}</p>
      <form class="bigsearch" id="homeSearch"><input name="q" autocomplete="off" placeholder="${esc(t("searchPh"))}" aria-label="${esc(t("search"))}"><button>${esc(t("search"))}</button></form>
      <div class="examples">${esc(t("examples"))} ${ex.map(x => `<button type="button" data-ex="${esc(x)}">${esc(x)}</button>`).join("")}</div></section>`;
    h += `<h2>${esc(t("sharedLib"))}</h2><div id="homeLib">${spin(t("loading"))}</div>`;
    h += `<h2>${esc(t("sources"))}</h2>`;
    Object.keys(S.GROUPS).forEach(g => {
      h += `<div class="kicker" style="margin:14px 0 8px">${esc(nm(S.GROUPS[g]))}</div><div class="cards">`;
      Object.values(S.SOURCES).filter(s => s.group === g).forEach(s => {
        h += `<a class="card ${s.type === "pending" ? "off" : ""}" href="?v=source&s=${s.key}" data-nav><b>${esc(nm(s.name))} ${s.type === "pending" ? `<span class="badge warn">${esc(t("needsProxy"))}</span>` : ""}</b><p>${esc(nm(s.about))}</p></a>`;
      });
      h += `</div>`;
    });
    h += footer();
    main.innerHTML = h;
    $("#homeSearch").addEventListener("submit", (e) => { e.preventDefault(); const q = e.target.q.value.trim(); if (q) go({ v: "search", q }); });
    $$("[data-ex]").forEach(b => b.addEventListener("click", () => go({ v: "search", q: b.dataset.ex })));
    const lib = await loadShared();
    $("#homeLib").innerHTML = lib.length ? `<div class="lib">${lib.slice(0, 6).map(libItem).join("")}</div>` : `<p class="muted">${esc(t("libEmpty"))}</p>`;
    wireLib($("#homeLib"));
  }

  function footer() {
    return `<div class="footer">Inštitut za strateške rešitve (ISR) · Nazorjeva ulica 6a, 1000 Ljubljana · <a href="https://isr.si">isr.si</a> · ISR Stat ${esc(S.VERSION)} · <a href="https://github.com/The-Adriatic/isr-stat">GitHub</a></div>`;
  }

  /* ---------------- views: search ---------------- */
  let searchToken = 0;
  async function viewSearch(q, f) {
    const main = $("#main");
    $("#gq").value = q;
    const my = ++searchToken;
    const keys = Object.keys(S.SOURCES).filter(k => S.SOURCES[k].type !== "pending");
    const status = {};
    let hits = [];
    main.innerHTML = `<div class="kicker">${esc(t("results"))}</div><h1>»${esc(q)}«</h1><div class="progress" id="prog"></div><div class="filterbar" id="fbar"></div><div id="hits"></div><p class="small muted">${esc(t("catalogNote"))}</p>`;
    const draw = () => {
      if (my !== searchToken) return;
      $("#prog").innerHTML = keys.map(k => { const s = status[k]; const name = esc(srcOf(k).abbr); if (!s) return `<span><span class="spinner"></span>${name}</span>`; if (s.err) return `<span class="err" title="${esc(s.err)}">${name} ✕</span>`; return `<span class="ok">${name} ${s.n}</span>`; }).join("");
      const counts = {};
      hits.forEach(x => { counts[x.source] = (counts[x.source] || 0) + 1; });
      $("#fbar").innerHTML = `<button class="chip ${!f ? "on" : ""}" data-f="">${esc(t("all"))} ${hits.length}</button>` + Object.keys(counts).map(k => `<button class="chip ${f === k ? "on" : ""}" data-f="${k}">${esc(srcOf(k).abbr)} ${counts[k]}</button>`).join("");
      $$("#fbar [data-f]").forEach(b => b.addEventListener("click", () => { f = b.dataset.f; history.replaceState({}, "", "?" + new URLSearchParams({ v: "search", q, f }).toString()); draw(); }));
      const shown = hits.filter(x => !f || x.source === f).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 300);
      const done = Object.keys(status).length === keys.length;
      $("#hits").innerHTML = shown.length ? `<ul class="results">${shown.map(resultItem).join("")}</ul>` : (done ? `<p>${esc(t("noResults"))}</p>` : "");
    };
    draw();
    await Promise.all(keys.map(async k => {
      try {
        const s = srcOf(k);
        let r;
        if (s.type === "pxweb" && !s.flat) r = await S.search(k, q, dataLangFor(s));
        else r = S.util.rankSearch(await S.list(k, dataLangFor(s)), q);
        // Slovene-first sources: an English query should still find the table
        if (!r.length && s.langs.includes("en") && dataLangFor(s) !== "en") {
          r = s.type === "pxweb" && !s.flat ? await S.search(k, q, "en") : S.util.rankSearch(await S.list(k, "en"), q);
          r = r.map(x => Object.assign({ lang: "en" }, x));
        }
        r = r.slice(0, 80).map(x => Object.assign({ source: k }, x));
        status[k] = { n: r.length };
        hits = hits.concat(r);
      } catch (e) { status[k] = { err: e.message || String(e) }; }
      draw();
    }));
  }

  function resultItem(x) {
    const s = srcOf(x.source);
    const href = `?v=table&s=${x.source}&t=${encodeURIComponent(x.id)}&ti=${encodeURIComponent(x.label || "")}${x.lang ? "&l=" + x.lang : ""}`;
    return `<li><a href="${href}" data-nav><span class="src">${esc(s.abbr)}</span><span>${esc(x.label)}</span><span class="code">${esc(x.code || x.id)}${x.updated ? " · " + esc(fmtUpd(x.updated)) : ""}</span></a></li>`;
  }

  /* ---------------- views: source ---------------- */
  async function viewSource(key, path, q) {
    const s = srcOf(key);
    const main = $("#main");
    if (!s) return viewHome();
    let h = `<div class="crumbs"><a href="?" data-nav>${esc(t("home"))}</a> › ${esc(nm(s.name))}</div><h1>${esc(nm(s.name))}</h1><p class="lede" style="font-size:16px">${esc(nm(s.about))}</p>`;
    if (s.type === "pending") { main.innerHTML = h + `<div class="note">${esc(t("proxyText"))}</div>` + footer(); return; }
    const lang = dataLangFor(s);
    h += `<form class="inline-search" id="srcSearch"><input name="q" value="${esc(q)}" placeholder="${esc(t("searchSrc"))}"><button>${esc(t("search"))}</button></form>`;
    if (path && s.type === "pxweb") {
      const parts = path.split("/");
      h += `<div class="crumbs" style="margin-bottom:10px"><a href="?v=source&s=${key}" data-nav>${esc(s.abbr)}</a>${parts.map((p, i) => ` › <a href="?v=source&s=${key}&p=${encodeURIComponent(parts.slice(0, i + 1).join("/"))}" data-nav>${esc(p)}</a>`).join("")}</div>`;
    }
    h += `<div id="srcList">${spin(t("loading"))}</div>` + footer();
    main.innerHTML = h;
    $("#srcSearch").addEventListener("submit", (e) => { e.preventDefault(); go({ v: "source", s: key, q: e.target.q.value.trim() }); });
    const box = $("#srcList");
    try {
      let items;
      if (q) items = await S.search(key, q, lang);
      else if (s.type === "pxweb" && !s.flat) items = await S.browse(key, path, lang);
      else {
        const all = await S.list(key, lang);
        items = all.slice().sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 200);
        box.insertAdjacentHTML("beforebegin", `<p class="small muted">${esc(t("recent"))} · ${esc(t("showing", nf(items.length), nf(all.length)))}</p>`);
      }
      if (!items.length) { box.innerHTML = `<p>${esc(t("noResults"))}</p>`; return; }
      box.innerHTML = `<ul class="results">${items.slice(0, 500).map(x => {
        if (x.type === "folder") return `<li><a href="?v=source&s=${key}&p=${encodeURIComponent(x.id)}" data-nav><span class="src">${esc(s.abbr)}</span><span class="folder">${esc(x.label)}</span><span class="code"></span></a></li>`;
        return resultItem(Object.assign({ source: key }, x));
      }).join("")}</ul>`;
    } catch (e) { box.innerHTML = errBox(e); }
  }

  /* ---------------- views: table ---------------- */
  async function viewTable(key, id, wantLang, sel, run, title) {
    const s = srcOf(key);
    const main = $("#main");
    if (!s || !id) return viewHome();
    const lang = dataLangFor(s, wantLang);
    st.source = key; st.table = id; st.dataLang = lang; st.res = null; st.filter = {}; st.tab = "table"; st.title = title;
    main.innerHTML = `<div class="crumbs"><a href="?" data-nav>${esc(t("home"))}</a> › <a href="?v=source&s=${key}" data-nav>${esc(nm(s.name))}</a></div><h1>${esc(title || id)}</h1>${spin(t("loadingMeta"))}`;
    let m;
    try { m = await S.meta(key, id, lang, title && s.type === "pxweb" ? { title } : undefined); }
    catch (e) { main.insertAdjacentHTML("beforeend", errBox(e)); return; }
    st.meta = m;
    st.sel = sel || defaultSel(m, s);
    renderTable();
    if (run) pull();
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
      if (d.role === "time") {
        if (m.timeMode === "list" && d.values.length) sel[d.id] = { last: Math.min(10, d.values.length) };
        else sel[d.id] = { from: String(new Date().getFullYear() - 15) };
        return;
      }
      if (!d.values.length) return;
      if (d.values.length === 1) { sel[d.id] = [d.values[0].id]; return; }
      if (s.type === "pxweb") { if (d.required) sel[d.id] = [pickDefault(d)]; return; }
      if (d.role === "geo") { const si = S.countryCodesFor(d, ["SI"]); sel[d.id] = si.length ? si : [d.values[0].id]; return; }
      if (/^FREQ/i.test(d.id) || d.id === "freq") { const a = d.values.find(v => v.id === "A"); sel[d.id] = [a ? "A" : d.values[0].id]; return; }
      sel[d.id] = [pickDefault(d)];
    });
    return sel;
  }

  function selCount(d) {
    const s = st.sel[d.id];
    if (s === "*") return d.values.length;
    if (Array.isArray(s)) return s.length;
    if (s && s.last) return Math.min(s.last, d.values.length || s.last);
    return 0;
  }
  function isChecked(d, code) {
    const s = st.sel[d.id];
    if (s === "*") return true;
    if (Array.isArray(s)) return s.includes(code);
    if (s && s.last && d.role === "time") { const idx = d.values.findIndex(v => v.id === code); return idx >= d.values.length - s.last; }
    return false;
  }

  function renderTable() {
    const m = st.meta, s = srcOf(st.source);
    const main = $("#main");
    const langSel = s.langs.length > 1 ? `<label class="small">${esc(t("dataLang"))} <select id="dlang">${s.langs.map(l => `<option ${l === st.dataLang ? "selected" : ""}>${l}</option>`).join("")}</select></label>` : "";
    let h = `<div class="crumbs"><a href="?" data-nav>${esc(t("home"))}</a> › <a href="?v=source&s=${st.source}" data-nav>${esc(nm(s.name))}</a></div>
      <div class="kicker" style="margin-top:8px">${esc(s.abbr)} · ${esc(m.tableCode)}</div><h1>${esc(m.title)}</h1>
      <div class="meta-line"><span>${esc(nm(s.name))}</span>${m.updated ? `<span>${esc(t("updated"))} <b>${esc(fmtUpd(m.updated))}</b></span>` : ""}${m.latest ? `<span>${esc(m.oldest || "")}–${esc(m.latest)}</span>` : ""}<span><a href="${esc(m.web)}" target="_blank" rel="noopener">${esc(t("openAtSource"))} ↗</a></span>${langSel}</div>`;
    if (m.hint) h += `<div class="note info">${esc(nm(m.hint))}</div>`;
    if (m.note) h += `<details class="small muted" style="margin:-6px 0 14px"><summary>${esc(LANG === "en" ? "Definition" : "Opredelitev")}</summary><p>${esc(m.note)}</p>${m.sourceOrg ? `<p><i>${esc(m.sourceOrg)}</i></p>` : ""}</details>`;
    h += `<div class="dims" id="dims">${m.dims.map(dimCard).join("")}</div>`;
    h += `<div class="runbar"><button class="btn" id="runBtn">${esc(t("pull"))}</button><span class="est" id="est"></span><span style="flex:1"></span><button class="btn ghost sm" id="shareBtn">${esc(t("share"))}</button></div>`;
    h += `<div id="out"></div>` + footer();
    main.innerHTML = h;
    wireDims();
    $("#runBtn").addEventListener("click", pull);
    $("#shareBtn").addEventListener("click", () => copy(shareURL(false)).then(() => toast(t("linkCopied"))));
    const dl = $("#dlang");
    if (dl) dl.addEventListener("change", () => go({ v: "table", s: st.source, t: st.table, l: dl.value, ti: st.title || "" }));
    updateEst();
  }

  function dimCard(d) {
    const m = st.meta, s = srcOf(st.source);
    const isTime = d.role === "time";
    const n = d.values.length;
    const cnt = selCount(d);
    const emptyMeaning = s.type === "pxweb" ? (d.required ? "" : t("total")) : t("every");
    let tools = "";
    if (isTime && m.timeMode === "list" && n) {
      tools += [1, 5, 10, 20].filter(k => k <= n).map(k => `<button class="q" data-last="${k}">${esc(k === 1 ? t("last1") : t("lastN", k))}</button>`).join("");
    }
    if (n && !(isTime && m.timeMode !== "list")) tools += `<button data-all>${esc(t("selAll"))}</button><button data-none>${esc(t("selNone"))}</button>`;
    if (d.role === "geo" && n) {
      Object.entries(S.COUNTRY_GROUPS).forEach(([g, o]) => { if (S.countryCodesFor(d, g).length >= 2) tools += `<button class="q" data-grp="${g}">${esc(nm(o))}</button>`; });
    }
    let body;
    if (isTime && m.timeMode !== "list") {
      const v = st.sel[d.id] || {};
      body = `<div class="range"><label>${esc(t("from"))}<input data-tf value="${esc(v.from || "")}" placeholder="2015"></label><label>${esc(t("to"))}<input data-tt value="${esc(v.to || "")}" placeholder="${new Date().getFullYear()}"></label><label style="grid-column:1/3">${esc(t("lastObs"))}<input data-tl type="number" min="1" value="${esc(v.last || "")}"></label></div><div class="hint">${esc(t("timeHint"))}</div>`;
    } else {
      const vals = isTime ? d.values.slice().reverse() : d.values;
      const cap = 1500;
      body = `${n > 12 ? `<input class="filter" data-filter placeholder="${esc(t("filter"))}">` : ""}<div class="vals">${vals.slice(0, cap).map(v => `<label data-lbl="${esc(S.util.norm(v.label + " " + v.id))}"><input type="checkbox" value="${esc(v.id)}" ${isChecked(d, v.id) ? "checked" : ""}><span>${esc(v.label)}</span>${String(v.label) !== String(v.id) ? `<code>${esc(v.id)}</code>` : ""}</label>`).join("")}${n > cap ? `<div class="hint">${esc(t("showing", cap, n))}</div>` : ""}</div>`;
    }
    const countTxt = isTime && m.timeMode !== "list" ? "" : `${cnt || 0} / ${n}${!cnt && emptyMeaning ? ` · ${emptyMeaning}` : ""}`;
    return `<section class="dim" data-dim="${esc(d.id)}"><header><div class="t"><b>${esc(d.label)}</b><span class="n" data-n>${esc(countTxt)}${d.required ? ` <span class="req">· ${esc(t("required"))}</span>` : ""}</span></div><div class="picked" data-picked>${esc(pickedTxt(d))}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</header>${body}</section>`;
  }

  function pickedTxt(d) {
    if (d.role === "time" && st.meta.timeMode !== "list") return "";
    const s = st.sel[d.id];
    if (!Array.isArray(s) || !s.length || s.length === d.values.length) return "";
    const lab = new Map(d.values.map(v => [v.id, v.label]));
    const names = s.slice(0, 4).map(c => lab.get(c) || c);
    return names.join(", ") + (s.length > 4 ? ` +${s.length - 4}` : "");
  }

  function wireDims() {
    $$("#dims .dim").forEach(card => {
      const id = card.dataset.dim;
      const d = st.meta.dims.find(x => x.id === id);
      const refresh = () => {
        $$("input[type=checkbox]", card).forEach(cb => { cb.checked = isChecked(d, cb.value); });
        const n = d.values.length, cnt = selCount(d);
        const s = srcOf(st.source);
        const emptyMeaning = s.type === "pxweb" ? (d.required ? "" : t("total")) : t("every");
        const nEl = $("[data-n]", card);
        if (nEl && !(d.role === "time" && st.meta.timeMode !== "list")) nEl.innerHTML = `${esc(`${cnt} / ${n}${!cnt && emptyMeaning ? ` · ${emptyMeaning}` : ""}`)}${d.required ? ` <span class="req">· ${esc(t("required"))}</span>` : ""}`;
        const pk = $("[data-picked]", card); if (pk) pk.textContent = pickedTxt(d);
        updateEst();
      };
      card.addEventListener("change", (e) => {
        const cb = e.target.closest("input[type=checkbox]");
        if (!cb) return;
        let cur = st.sel[id];
        if (!Array.isArray(cur)) cur = d.values.filter(v => isChecked(d, v.id)).map(v => v.id);
        if (cb.checked) { if (!cur.includes(cb.value)) cur.push(cb.value); } else cur = cur.filter(x => x !== cb.value);
        // keep dimension order
        const order = new Map(d.values.map((v, i) => [v.id, i]));
        cur.sort((a, b) => order.get(a) - order.get(b));
        st.sel[id] = cur;
        refresh();
      });
      card.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.hasAttribute("data-all")) st.sel[id] = d.values.map(v => v.id);
        else if (b.hasAttribute("data-none")) st.sel[id] = [];
        else if (b.dataset.last) st.sel[id] = { last: Number(b.dataset.last) };
        else if (b.dataset.grp) st.sel[id] = S.countryCodesFor(d, b.dataset.grp);
        else return;
        refresh();
      });
      const f = $("[data-filter]", card);
      if (f) f.addEventListener("input", () => { const q = S.util.norm(f.value); $$("label[data-lbl]", card).forEach(l => { l.style.display = !q || l.dataset.lbl.includes(q) ? "" : "none"; }); });
      const tf = $("[data-tf]", card), tt = $("[data-tt]", card), tl = $("[data-tl]", card);
      const upd = () => { const o = {}; if (tl && tl.value) o.last = Number(tl.value); else { if (tf.value.trim()) o.from = tf.value.trim(); if (tt.value.trim()) o.to = tt.value.trim(); } st.sel[id] = Object.keys(o).length ? o : "*"; updateEst(); };
      [tf, tt, tl].forEach(x => { if (x) x.addEventListener("input", upd); });
    });
  }

  function estimate() {
    const m = st.meta, s = srcOf(st.source);
    let n = 1;
    m.dims.forEach(d => {
      const v = st.sel[d.id];
      if (Array.isArray(v)) n *= Math.max(1, v.length) || 1;
      else if (v && v.last) n *= v.last;
      else if (v && (v.from || v.to)) { const a = parseInt(v.from || "1990", 10), b = parseInt(v.to || String(new Date().getFullYear()), 10); n *= Math.max(1, b - a + 1) * (/M|-\d\d$/.test(v.from || "") ? 12 : 1); }
      else if (s.type === "pxweb" && !d.required) n *= 1;
      else n *= Math.max(1, d.values.length || (d.role === "time" ? 30 : 1));
    });
    return n;
  }
  function updateEst() {
    const el = $("#est");
    if (!el) return;
    const n = estimate();
    el.textContent = n > 150000 ? t("cellsBig", nf(n)) : t("cells", nf(n));
    el.classList.toggle("big", n > 150000);
  }

  function cleanSel() {
    const m = st.meta, s = srcOf(st.source);
    const out = {};
    m.dims.forEach(d => {
      const v = st.sel[d.id];
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) { if (v.length) out[d.id] = v.slice(); else if (s.type !== "pxweb") return; }
      else out[d.id] = v;
    });
    return out;
  }
  function missingRequired() {
    return st.meta.dims.filter(d => d.required && d.role !== "time" && !(Array.isArray(st.sel[d.id]) && st.sel[d.id].length)).map(d => d.label);
  }

  function shareURL(run) {
    const u = new URL(location.href);
    u.search = new URLSearchParams({ v: "table", s: st.source, t: st.table, l: st.dataLang, ti: st.meta ? st.meta.title : "", sel: b64e(cleanSel()), run: run ? "1" : "" }).toString();
    u.search = u.search.replace(/&run=$/, "");
    return u.toString();
  }

  async function pull() {
    const out = $("#out");
    const miss = missingRequired();
    if (miss.length) { out.innerHTML = `<div class="err">${esc(t("chooseReq", miss.join(", ")))}</div>`; return; }
    const btn = $("#runBtn");
    btn.disabled = true; btn.textContent = t("pulling");
    out.innerHTML = spin(t("pulling"));
    history.replaceState({}, "", "?" + new URLSearchParams({ v: "table", s: st.source, t: st.table, l: st.dataLang, ti: st.meta.title, sel: b64e(cleanSel()) }).toString());
    try {
      const res = await S.query(st.source, st.table, cleanSel(), st.dataLang, { meta: st.meta, title: st.meta.title });
      st.res = res; st.filter = {}; st.chart = { mode: st.chart.mode, focus: null, title: res.title, subtitle: "" };
      st.tab = st.tab || "table";
      renderResult();
      window.ISR_LAST = res; // for Claude / console
    } catch (e) {
      out.innerHTML = errBox(e);
    } finally { btn.disabled = false; btn.textContent = t("pull"); }
  }

  /* ---------------- result ---------------- */
  function filtered() {
    const r = st.res;
    const f = st.filter;
    const keys = Object.keys(f).filter(k => f[k] && f[k].size);
    if (!keys.length) return r;
    const rows = r.rows.filter(row => keys.every(k => f[k].has(String(row[k]))));
    const dims = r.dims.map(d => keys.includes(d.id) ? Object.assign({}, d, { values: d.values.filter(v => f[d.id].has(String(v.id))) }) : d);
    return Object.assign({}, r, { rows, dims, count: rows.length });
  }

  function pivot(r) {
    const tId = r.timeDim;
    const rows = r.rows;
    const lab = (d, c) => (r.labels[d] && r.labels[d][c] != null ? r.labels[d][c] : c);
    const nonT = r.dims.filter(d => d.id !== tId);
    const varying = nonT.filter(d => new Set(rows.map(x => x[d.id])).size > 1);
    const fixed = nonT.filter(d => new Set(rows.map(x => x[d.id])).size === 1 && rows.length);
    const times = tId ? r.dims.find(d => d.id === tId).values.map(v => v.id).filter(tt => rows.some(x => x[tId] === tt)) : [];
    const fixedTxt = fixed.map(d => [d.label, lab(d.id, rows[0][d.id])]);
    if (tId && times.length) {
      const order = varying.map(d => new Map(d.values.map((v, i) => [String(v.id), i])));
      const map = new Map();
      rows.forEach(x => {
        const k = varying.map(d => x[d.id]).join("¦");
        if (!map.has(k)) map.set(k, { codes: varying.map(d => x[d.id]), vals: {}, st: {} });
        const e = map.get(k);
        e.vals[x[tId]] = x.value;
        if (x.status) e.st[x[tId]] = x.status;
      });
      const body = Array.from(map.values()).sort((a, b) => { for (let i = 0; i < varying.length; i++) { const d = (order[i].get(String(a.codes[i])) ?? 1e9) - (order[i].get(String(b.codes[i])) ?? 1e9); if (d) return d; } return 0; });
      return { kind: "time", head: varying.map(d => d.label), times, body: body.map(e => ({ labels: e.codes.map((c, i) => lab(varying[i].id, c)), vals: times.map(tt => e.vals[tt]), st: times.map(tt => e.st[tt] || "") })), fixedTxt, single: !varying.length };
    }
    return { kind: "flat", head: varying.map(d => d.label), body: rows.map(x => ({ labels: varying.map(d => lab(d.id, x[d.id])), vals: [x.value], st: [x.status || ""] })), fixedTxt, times: [t("table")] };
  }

  function valueFormatter(r) {
    let dec = 0;
    r.rows.forEach(x => { if (x.value === null || !isFinite(x.value)) return; const s = String(x.value); const i = s.indexOf("."); if (i >= 0) dec = Math.max(dec, Math.min(4, s.length - i - 1)); });
    const f = new Intl.NumberFormat(LANG === "en" ? "en-GB" : "sl-SI", { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return (v) => (v === null || v === undefined ? "" : f.format(v));
  }

  function renderResult() {
    const r = st.res;
    const out = $("#out");
    const fr = filtered();
    const span = r.timeDim ? (() => { const d = r.dims.find(x => x.id === r.timeDim); return d.values.length ? (d.values[0].id === d.values[d.values.length - 1].id ? d.values[0].id : `${d.values[0].id}–${d.values[d.values.length - 1].id}`) : ""; })() : "";
    let h = `<div class="result" id="result">`;
    h += `<div class="tabs">${["table", "chart", "source"].map(k => `<button data-tab="${k}" class="${st.tab === k ? "on" : ""}">${esc(t(k === "source" ? "sourceTab" : k))}</button>`).join("")}${r.notes && r.notes.length ? `<button data-tab="notes" class="${st.tab === "notes" ? "on" : ""}">${esc(t("notes"))}</button>` : ""}<span class="spacer"></span><span class="small muted" style="align-self:center;padding-right:8px">${esc(t("obs", nf(fr.count)))}${span ? " · " + esc(span) : ""} · ${esc(t("pulledAt"))} ${esc(S.util.fmtDateSL(r.pulledAt))}</span></div>`;
    h += `<div class="toolbar"><button class="btn ghost sm" data-x="csv">${esc(t("csv"))}</button><button class="btn ghost sm" data-x="xlsx">${esc(t("xlsx"))}</button><button class="btn ghost sm" data-x="copy">${esc(t("copyTable"))}</button>${st.tab === "chart" ? `<span class="sep"></span><button class="btn ghost sm" data-x="svg">${esc(t("svg"))}</button><button class="btn ghost sm" data-x="png">${esc(t("png"))}</button>` : ""}<span class="sep"></span><button class="btn ghost sm" data-x="save">${esc(t("save"))}</button><button class="btn ghost sm" data-x="share">${esc(t("share"))}</button><span style="flex:1"></span><label class="small muted">${esc(t("fileName"))} <input id="stem" value="${esc(st.stem || S.fileStem(r))}" style="border:1px solid var(--line);padding:4px 6px;width:200px"></label></div>`;
    h += `<div id="saveForm"></div>`;
    h += `<div class="pane">`;
    if (r.partial && r.partial.length) h += `<div class="note">${esc(t("partNote", r.partial.map(p => `${p} (${r.periodLabels[p]})`).join(", ")))}</div>`;
    else if (r.provisional.length) h += `<div class="note">${esc(t("provNote", r.provisional.map(p => r.periodLabels && r.periodLabels[p] ? `${p} (${r.periodLabels[p]})` : p).join(", ")))}</div>`;
    if (r.forecast.length) h += `<div class="note">${esc(t("fcNote", r.forecast.length > 2 ? r.forecast[0] + "–" + r.forecast[r.forecast.length - 1] : r.forecast.join(", ")))}</div>`;
    h += filterBar(r);
    h += `<div id="paneBody"></div></div></div>`;
    out.innerHTML = h;
    $$("#result [data-tab]").forEach(b => b.addEventListener("click", () => { st.tab = b.dataset.tab; renderResult(); }));
    $$("#result [data-x]").forEach(b => b.addEventListener("click", () => doExport(b.dataset.x)));
    $("#stem").addEventListener("input", (e) => { st.stem = e.target.value; });
    wireFilter();
    renderPane();
  }

  function filterBar(r) {
    const dims = r.dims.filter(d => d.id !== r.timeDim && d.values.length > 1 && d.values.length <= 80);
    if (!dims.length) return "";
    return `<details class="small" style="margin-bottom:12px" ${Object.keys(st.filter).some(k => st.filter[k] && st.filter[k].size) ? "open" : ""}><summary>${esc(t("filterAfter"))}</summary><p class="muted">${esc(t("filterNote"))}</p><div class="dims" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${dims.map(d => `<section class="dim" data-fdim="${esc(d.id)}" style="max-height:260px"><header><b>${esc(d.label)}</b></header><div class="vals">${d.values.map(v => `<label><input type="checkbox" value="${esc(v.id)}" ${!st.filter[d.id] || !st.filter[d.id].size || st.filter[d.id].has(String(v.id)) ? "checked" : ""}><span>${esc(v.label)}</span></label>`).join("")}</div></section>`).join("")}</div></details>`;
  }
  function wireFilter() {
    $$("[data-fdim]").forEach(card => {
      card.addEventListener("change", () => {
        const id = card.dataset.fdim;
        const on = $$("input:checked", card).map(i => i.value);
        const all = $$("input", card).length;
        st.filter[id] = on.length === all ? new Set() : new Set(on);
        st.chart.focus = null;
        const sumOpen = true;
        renderPane();
        void sumOpen;
      });
    });
  }

  function renderPane() {
    const body = $("#paneBody");
    if (!body) return;
    const r = filtered();
    if (st.tab === "table") body.innerHTML = tableHTML(r);
    else if (st.tab === "chart") renderChartPane(body, r);
    else if (st.tab === "source") body.innerHTML = sourceHTML(st.res);
    else if (st.tab === "notes") body.innerHTML = `<div class="small">${st.res.notes.map(n => `<p>${esc(n)}</p>`).join("")}</div>`;
    $$("[data-copy]", body).forEach(b => b.addEventListener("click", () => copy(b.closest("[data-row]").querySelector("[data-val]").textContent)));
  }

  function tableHTML(r) {
    const p = pivot(r);
    const fmt = valueFormatter(r);
    const prov = new Set(st.res.provisional), fc = new Set(st.res.forecast);
    const cap = 1500;
    let h = "";
    if (p.fixedTxt.length) h += `<div class="fixed">${esc(t("fixed"))} ${p.fixedTxt.map(([a, b]) => `${esc(a)}: <b>${esc(b)}</b>`).join(" · ")}</div>`;
    const pl = st.res.periodLabels || {};
    h += `<div class="tablewrap"><table class="data"><thead><tr>${p.head.map(x => `<th>${esc(x)}</th>`).join("")}${p.kind === "time" ? p.times.map(tt => `<th class="num ${prov.has(tt) ? "prov" : ""} ${fc.has(tt) ? "fc" : ""}" ${pl[tt] ? `title="${esc(pl[tt])}"` : ""}>${esc(tt)}${pl[tt] ? "*" : ""}</th>`).join("") : `<th class="num">${esc(LANG === "en" ? "Value" : "Vrednost")}</th>`}</tr></thead><tbody>`;
    p.body.slice(0, cap).forEach(row => {
      h += `<tr>${row.labels.map(l => `<td>${esc(l)}</td>`).join("")}${p.single && !row.labels.length ? "" : ""}${row.vals.map((v, i) => { const tt = p.times[i]; const s = row.st[i]; return `<td class="num ${prov.has(tt) ? "prov" : ""} ${fc.has(tt) ? "fc" : ""}">${esc(fmt(v))}${s ? `<sup title="${esc(st.res.flags[s] || s)}">${esc(s)}</sup>` : ""}</td>`; }).join("")}</tr>`;
    });
    h += `</tbody></table></div>`;
    if (p.body.length > cap) h += `<p class="small muted">${esc(t("truncated", nf(cap), nf(p.body.length)))}</p>`;
    const starred = p.kind === "time" ? p.times.filter(tt => pl[tt]) : [];
    if (starred.length) h += `<p class="small muted">${starred.map(tt => `* ${esc(tt)}: ${esc(pl[tt])}`).join(" · ")}</p>`;
    const used = new Set(r.rows.map(x => x.status).filter(Boolean));
    if (used.size) h += `<ul class="flags">${Array.from(used).map(s => `<li><b>${esc(s)}</b> ${esc(st.res.flags[s] || "")}</li>`).join("")}</ul>`;
    return h;
  }

  let resizeT = null;
  function renderChartPane(body, r) {
    const c = st.chart;
    const p = pivot(r);
    if (!c.subtitle) c.subtitle = p.fixedTxt.map(x => x[1]).join(" · ") + (st.res.unit ? (p.fixedTxt.length ? " · " : "") + st.res.unit : "");
    body.innerHTML = `<div class="chartopts"><label>${esc(t("chartTitle"))}<input id="cTitle" value="${esc(c.title)}"></label><label>${esc(t("chartSub"))}<input id="cSub" value="${esc(c.subtitle)}"></label><div class="seg"><button data-mode="isr" class="${c.mode === "isr" ? "on" : ""}">${esc(t("modeIsr"))}</button><button data-mode="barvno" class="${c.mode === "barvno" ? "on" : ""}">${esc(t("modeColor"))}</button></div></div><div class="legend" id="legend"></div><div class="chartbox" id="chartBox"></div>`;
    const draw = () => {
      const box = $("#chartBox");
      if (!box) return;
      const info = C.render(box, r, { mode: c.mode, focus: c.focus, lang: LANG, title: c.title, subtitle: c.subtitle, source: st.res.citation.figure, width: box.clientWidth - 8 });
      st.chartInfo = info;
      C.wireHover(info, $("#tip"));
      const lg = $("#legend");
      if (info.series.length > 1) {
        lg.innerHTML = info.series.map((s, i) => `<button data-focus="${i}" class="${i === c.focus ? "on" : ""}" title="${esc(s.label)}"><span class="k" style="background:${s.color}"></span><em>${esc(s.label || "–")}</em></button>`).join("") + `<span class="small muted" style="align-self:center">${esc(t("focusHint"))}</span>`;
        $$("[data-focus]", lg).forEach(b => b.addEventListener("click", () => { const k = Number(b.dataset.focus); c.focus = c.focus === k ? null : k; draw(); }));
      } else lg.innerHTML = "";
    };
    $("#cTitle").addEventListener("input", (e) => { c.title = e.target.value; draw(); });
    $("#cSub").addEventListener("input", (e) => { c.subtitle = e.target.value; draw(); });
    $$("[data-mode]", body).forEach(b => b.addEventListener("click", () => { c.mode = b.dataset.mode; $$("[data-mode]", body).forEach(x => x.classList.toggle("on", x === b)); draw(); }));
    draw();
    window.onresize = () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (st.tab === "chart") draw(); }, 200); };
  }

  function sourceHTML(r) {
    const c = r.citation;
    const rows = [
      [t("citeFdv"), c.fdv], [t("citeText"), c.inText], [t("citeFig"), c.figure], [t("citeApa"), c.apa], [t("citeShort"), c.short],
    ];
    let h = `<dl class="cite">`;
    rows.forEach(([k, v]) => { h += `<dt>${esc(k)}</dt><dd data-row><span data-val>${esc(v)}</span></dd><span data-row><span data-val hidden>${esc(v)}</span><button class="copy" data-copy>${esc(LANG === "en" ? "Copy" : "Kopiraj")}</button></span>`; });
    const info = [
      [t("updAt"), r.updated ? fmtUpd(r.updated) : "–"],
      [t("pulled"), `${S.util.fmtDateSL(r.pulledAt)} ${new Date(r.pulledAt).toTimeString().slice(0, 5)}`],
    ];
    if (r.provisional.length) info.push([t("prov"), r.provisional.join(", ")]);
    if (r.forecast.length) info.push([t("forecast"), r.forecast.join(", ")]);
    info.forEach(([k, v]) => { h += `<dt>${esc(k)}</dt><dd>${esc(v)}</dd><span></span>`; });
    const used = new Set(r.rows.map(x => x.status).filter(Boolean));
    if (used.size) h += `<dt>${esc(t("flags"))}</dt><dd><ul class="flags">${Array.from(used).map(s => `<li><b>${esc(s)}</b> ${esc(r.flags[s] || "")}</li>`).join("")}</ul></dd><span></span>`;
    const isPost = S.SOURCES[r.source].type === "pxweb";
    h += `<dt>${esc(t("apiQuery"))}</dt><dd class="mono small"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>${isPost ? `<br>POST ${esc(JSON.stringify(r.query.sel))}` : ""}</dd><span></span>`;
    const call = `await ISRStat.query(${JSON.stringify(r.source)}, ${JSON.stringify(r.table)}, ${JSON.stringify(r.query.sel)}, ${JSON.stringify(r.query.lang)})`;
    h += `<dt>${esc(t("forClaude"))}</dt><dd class="mono small" data-row><span data-val>${esc(call)}</span></dd><span data-row><span data-val hidden>${esc(call)}</span><button class="copy" data-copy>${esc(LANG === "en" ? "Copy" : "Kopiraj")}</button></span>`;
    h += `</dl>`;
    h += `<h2 style="font-size:15px">${esc(t("rulesH"))}</h2><ul class="small">${I[LANG].rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return h;
  }

  /* ---------------- exports ---------------- */
  function stemName(ext) { const stem = (st.stem || S.fileStem(st.res)).replace(/[^\w.\-čšžČŠŽ]+/g, "_"); return `${stem}_${S.util.compactDate(st.res.pulledAt)}.${ext}`; }

  async function doExport(kind) {
    const r = filtered();
    if (kind === "csv") return download(new Blob(["﻿" + S.toCSV(r)], { type: "text/csv;charset=utf-8" }), stemName("csv"));
    if (kind === "xlsx") return exportXLSX(r);
    if (kind === "copy") { const p = pivot(r); const fmt = (v) => (v === null || v === undefined ? "" : String(v).replace(".", LANG === "en" ? "." : ",")); const lines = [p.head.concat(p.kind === "time" ? p.times : ["Vrednost"]).join("\t")].concat(p.body.map(b => b.labels.concat(b.vals.map(fmt)).join("\t"))); return copy(lines.join("\n")); }
    if (kind === "svg" && st.chartInfo) { const s = await C.svgString(st.chartInfo.svg, "assets/fonts/"); return download(new Blob([s], { type: "image/svg+xml" }), stemName("svg")); }
    if (kind === "png" && st.chartInfo) { const b = await C.pngBlob(st.chartInfo.svg, "assets/fonts/", 2); return download(b, stemName("png")); }
    if (kind === "share") return copy(shareURL(true)).then(() => toast(t("linkCopied")));
    if (kind === "save") return saveForm();
  }

  function exportXLSX(r) {
    if (!window.XLSX) { toast("XLSX ni naložen."); return; }
    const X = window.XLSX;
    const wb = X.utils.book_new();
    const tidy = S.toTidy(r);
    const ws1 = X.utils.aoa_to_sheet([tidy.header].concat(tidy.rows));
    ws1["!cols"] = tidy.header.map(hh => ({ wch: Math.min(48, Math.max(10, hh.length + 2)) }));
    const p = pivot(r);
    const aoa = [];
    if (p.fixedTxt.length) { aoa.push([p.fixedTxt.map(([a, b]) => `${a}: ${b}`).join(" · ")]); aoa.push([]); }
    aoa.push(p.head.concat(p.kind === "time" ? p.times : ["Vrednost"]));
    p.body.forEach(b => aoa.push(b.labels.concat(b.vals.map(v => (v === null || v === undefined ? null : v)))));
    const ws2 = X.utils.aoa_to_sheet(aoa);
    ws2["!cols"] = p.head.map(() => ({ wch: 30 })).concat((p.kind === "time" ? p.times : [1]).map(() => ({ wch: 11 })));
    const c = st.res.citation;
    const used = Array.from(new Set(r.rows.map(x => x.status).filter(Boolean)));
    const info = [
      ["Naslov", st.res.title], ["Vir", nm(S.SOURCES[st.res.source].inst)], ["Tabela", st.res.tableCode], ["Povezava", st.res.doi ? "https://doi.org/" + st.res.doi : st.res.web],
      ["Posodobljeno pri viru", st.res.updated || ""], ["Pridobljeno", new Date(st.res.pulledAt).toLocaleString("sl-SI")],
      ["Začasni podatki", st.res.provisional.join(", ")], ["Napovedi", st.res.forecast.join(", ")],
      [], ["Navedba (FDV, Viri)", c.fdv], ["V besedilu", c.inText], ["Pod sliko ali tabelo", c.figure], ["Angleško (APA 7)", c.apa], ["Kratko", c.short],
      [], ["Zastavice", used.map(s => `${s} = ${st.res.flags[s] || ""}`).join("; ")], ["Poizvedba (API)", st.res.url], ["Izbor (JSON)", JSON.stringify(st.res.query.sel)],
      ["Orodje", `ISR Stat ${S.VERSION}, https://the-adriatic.github.io/isr-stat/`],
    ];
    const ws3 = X.utils.aoa_to_sheet(info);
    ws3["!cols"] = [{ wch: 24 }, { wch: 110 }];
    X.utils.book_append_sheet(wb, ws2, "Tabela");
    X.utils.book_append_sheet(wb, ws1, "Podatki");
    X.utils.book_append_sheet(wb, ws3, "Vir");
    X.writeFile(wb, stemName("xlsx"));
  }

  /* ---------------- library ---------------- */
  let SHARED = null;
  async function loadShared() {
    if (SHARED) return SHARED;
    try { const r = await fetch("library.json", { cache: "no-cache" }); SHARED = r.ok ? (await r.json()).items || [] : []; } catch (_) { SHARED = []; }
    SHARED.forEach(x => { x.shared = true; });
    return SHARED;
  }
  function myLib() { try { return JSON.parse(store.get("isrstat.lib") || "[]"); } catch (_) { return []; } }
  function setMyLib(a) { store.set("isrstat.lib", JSON.stringify(a)); }

  function libItem(x, i) {
    const s = srcOf(x.source) || { abbr: x.source };
    return `<div class="item" data-lib="${x.shared ? "s" : "m"}:${x.shared ? esc(x.id) : i}"><span class="kicker">${esc(s.abbr)} · ${esc(libCode(x))}</span><b>${esc(x.title)}</b>${x.note ? `<span class="muted">${esc(x.note)}</span>` : ""}<div class="row"><button class="btn sm" data-la="run">${esc(t("run"))}</button><button class="btn ghost sm" data-la="open">${esc(t("open"))}</button>${x.shared ? "" : `<button class="btn ghost sm" data-la="json">${esc(t("copyJson"))}</button><button class="btn ghost sm" data-la="del">${esc(t("del"))}</button>`}</div></div>`;
  }
  function libCode(x) { const p = String(x.table).split(/[/]/).filter(Boolean).slice(-1)[0] || x.table; return /,/.test(p) ? p.split(",")[1] : p.replace(/\.px$/i, ""); }
  function wireLib(root) {
    $$("[data-lib]", root).forEach(el => {
      el.addEventListener("click", (e) => {
        const b = e.target.closest("[data-la]");
        if (!b) return;
        const [kind, ref] = el.dataset.lib.split(":");
        const item = kind === "s" ? SHARED.find(x => x.id === ref) : myLib()[Number(ref)];
        if (!item) return;
        const act = b.dataset.la;
        if (act === "run" || act === "open") go({ v: "table", s: item.source, t: item.table, l: item.lang || "", ti: item.tableTitle || "", sel: b64e(item.sel || {}), run: act === "run" ? "1" : "" });
        if (act === "json") copy(JSON.stringify({ id: slug(item.title), title: item.title, source: item.source, table: item.table, lang: item.lang, sel: item.sel, note: item.note || "", tableTitle: item.tableTitle || "" }, null, 2));
        if (act === "del") { const a = myLib(); a.splice(Number(ref), 1); setMyLib(a); viewLibrary(); }
      });
    });
  }
  function slug(s) { return S.util.norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

  function saveForm() {
    const box = $("#saveForm");
    if (box.innerHTML) { box.innerHTML = ""; return; }
    const p = pivot(filtered());
    const guess = st.res.title + (p.fixedTxt.length ? " – " + p.fixedTxt.map(x => x[1]).slice(0, 3).join(", ") : "");
    box.innerHTML = `<div class="pane" style="border-bottom:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:end"><label class="small muted">${esc(t("saveTitle"))}<input id="svT" value="${esc(guess)}" style="width:100%;border:1px solid var(--line);padding:6px 8px"></label><label class="small muted">${esc(t("saveNote"))}<input id="svN" style="width:100%;border:1px solid var(--line);padding:6px 8px"></label><button class="btn sm" id="svOk">${esc(t("saveBtn"))}</button><button class="btn ghost sm" id="svNo">${esc(t("cancel"))}</button></div>`;
    $("#svNo").addEventListener("click", () => { box.innerHTML = ""; });
    $("#svOk").addEventListener("click", () => {
      const a = myLib();
      a.unshift({ title: $("#svT").value.trim() || st.res.title, note: $("#svN").value.trim(), source: st.source, table: st.table, lang: st.dataLang, sel: cleanSel(), tableTitle: st.meta.title, saved: new Date().toISOString() });
      setMyLib(a);
      box.innerHTML = "";
      toast(t("saved"));
    });
  }

  async function viewLibrary() {
    const main = $("#main");
    main.innerHTML = `<div class="kicker">${esc(t("library"))}</div><h1>${esc(t("sharedLib"))}</h1><p class="small muted">${esc(t("sharedHint"))}</p><div id="libS">${spin(t("loading"))}</div><h1 style="margin-top:34px">${esc(t("myLib"))}</h1><div id="libM"></div>` + footer();
    const sh = await loadShared();
    $("#libS").innerHTML = sh.length ? `<div class="lib">${sh.map(libItem).join("")}</div>` : `<p class="muted">${esc(t("libEmpty"))}</p>`;
    const my = myLib();
    $("#libM").innerHTML = my.length ? `<div class="lib">${my.map((x, i) => libItem(x, i)).join("")}</div>` : `<p class="muted">${esc(t("libEmpty"))}</p>`;
    wireLib(main);
  }

  /* ---------------- about ---------------- */
  function viewAbout() {
    const main = $("#main");
    const rows = Object.values(S.SOURCES).map(s => `<tr><td><b>${esc(nm(s.name))}</b></td><td>${esc(nm(s.about))}</td><td>${s.type === "pending" ? `<span class="badge warn">${esc(t("needsProxy"))}</span>` : `<span class="badge">${esc(s.type)}</span>`}</td></tr>`).join("");
    main.innerHTML = `<div class="kicker">${esc(t("about"))}</div><h1>ISR Stat</h1>
      <p class="lede" style="font-size:17px">${LANG === "en" ? "A front end for the official statistics APIs ISR works with. Your browser talks to each source directly; nothing is stored on a server. The same code (<code>assets/isrstat.js</code>) is what Claude loads when it pulls data for ISR work, so a figure in the app and a figure in a Claude draft come from the same query." : "Vmesnik za uradne statistične API-je, s katerimi dela ISR. Brskalnik se z vsakim virom poveže neposredno; na strežniku se nič ne hrani. Isto kodo (<code>assets/isrstat.js</code>) naloži Claude, ko za ISR pridobiva podatke, zato podatek v aplikaciji in podatek v Claudovem osnutku izhajata iz iste poizvedbe."}</p>
      <h2>${esc(t("rulesH"))}</h2><ul>${I[LANG].rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <h2>${esc(t("sources"))}</h2><div class="tablewrap" style="max-height:none"><table class="data" style="white-space:normal"><tbody>${rows}</tbody></table></div>
      <h2>${esc(t("forClaude"))}</h2><pre class="small" style="background:#fff;border:1px solid var(--line);padding:12px;overflow:auto">// ${LANG === "en" ? "in the browser pane, on this page:" : "v brskalniku, na tej strani:"}
const m = await ISRStat.meta("surs", "2490004S", "sl");
const r = await ISRStat.query("surs", "2490004S", { "UVOZ/IZVOZ": ["2"], "DRŽAVA": ["XS"], "ENOTA": ["EUR"] }, "sl");
r.citation.fdv;  ISRStat.toCSV(r);</pre>` + footer();
  }

  /* ---------------- boot ---------------- */
  $("#gform").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#gq").value.trim(); if (q) go({ v: "search", q }); });
  $$(".langs button").forEach(b => b.addEventListener("click", () => { LANG = b.dataset.lang; store.set("isrstat.lang", LANG); renderTop(); route(); }));
  $("#menuBtn").addEventListener("click", () => $("#side").classList.toggle("open"));
  renderTop();
  route();
  window.ISRApp = { st, go, pull, pivot };
})();
