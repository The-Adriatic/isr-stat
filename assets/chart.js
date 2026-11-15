/* ISR Stat — grafi (SVG) v sistemu ISR
 * Črta za časovne vrste, vodoravni stolpci za en sam čas.
 * Način »isr«: ena poudarjena serija v mornarsko modri, ostale v sivo-modri,
 * vse z oznako na koncu črte. Način »barvno«: preverjena paleta osmih barv.
 */
(function (global) {
  "use strict";

  const T = {
    navy: "#173049", deep: "#0F2236", steel: "#688FA9", sky: "#A8CBE2", pale: "#E6EEF4", lead: "#557C97",
    context: "#A9BCCB", grid: "#E3EAF0", ink: "#173049", muted: "#557C97", surface: "#FFFFFF",
  };
  // validated categorical palette (dataviz reference, light mode), fixed order
  const PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
  const FONT = "'Noto Sans', 'Helvetica Neue', Arial, sans-serif";
  const NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, attrs) {
    const t = el("text", Object.assign({ x, y, "font-family": FONT }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }

  function niceStep(range, target) {
    const raw = range / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return step * mag;
  }
  function niceScale(min, max, target, includeZero) {
    if (includeZero) { min = Math.min(0, min); max = Math.max(0, max); }
    if (min === max) { const d = Math.abs(min) || 1; min -= d / 2; max += d / 2; }
    const step = niceStep(max - min, target || 5);
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.abs(v) < step / 1e6 ? 0 : v);
    return { lo, hi, ticks, step };
  }

  function scaleFor(values, lang) {
    const max = Math.max.apply(null, values.filter(v => v !== null && isFinite(v)).map(Math.abs).concat([0]));
    if (max >= 5e9) return { div: 1e9, tag: lang === "en" ? "bn" : "mrd." };
    if (max >= 5e6) return { div: 1e6, tag: lang === "en" ? "m" : "mio." };
    if (max >= 5e4 && max < 5e6 && values.every(v => v === null || !isFinite(v) || Math.abs(v - Math.round(v)) < 1e-9)) return { div: 1e3, tag: lang === "en" ? "thousand" : "tisoč" };
    return { div: 1, tag: "" };
  }

  function makeFormat(lang, values) {
    let dec = 0;
    values.forEach(v => {
      if (v === null || !isFinite(v)) return;
      const s = String(v);
      const i = s.indexOf(".");
      if (i >= 0) dec = Math.max(dec, Math.min(3, s.length - i - 1));
    });
    const max = Math.max.apply(null, values.filter(v => v !== null && isFinite(v)).map(Math.abs).concat([0]));
    if (max > 0) dec = Math.max(0, Math.min(dec, 2 - Math.floor(Math.log10(max))));
    const nf = new Intl.NumberFormat(lang === "en" ? "en-GB" : "sl-SI", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
    const axis = (v, step) => {
      const d = step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : 0;
      return new Intl.NumberFormat(lang === "en" ? "en-GB" : "sl-SI", { maximumFractionDigits: d }).format(v);
    };
    return { value: (v) => (v === null || v === undefined ? "–" : nf.format(v)), axis, dec };
  }

  /* Build the plot model from an ISRStat result and the current filter */
  function model(res, opts) {
    const rows = opts.rows || res.rows;
    const tId = res.timeDim;
    const dims = res.dims;
    const varying = dims.filter(d => d.id !== tId && new Set(rows.map(r => r[d.id])).size > 1);
    const skip = new Set(opts.showPartial ? [] : (res.partial || []));
    const times = tId ? res.dims.find(d => d.id === tId).values.map(v => v.id).filter(t => !skip.has(t) && rows.some(r => r[tId] === t)) : [];
    const lab = (d, c) => (res.labels[d] && res.labels[d][c] != null ? res.labels[d][c] : c);
    const keyOf = (r) => varying.map(d => r[d.id]).join("¦");
    const labelOf = (r) => varying.map(d => lab(d.id, r[d.id])).join(" · ");
    if (tId && times.length > 1) {
      const series = new Map();
      rows.forEach(r => {
        const k = keyOf(r);
        if (!series.has(k)) series.set(k, { key: k, label: labelOf(r) || res.title, points: new Map() });
        series.get(k).points.set(r[tId], r.value);
      });
      return { kind: "line", times, series: Array.from(series.values()), varying, skipped: Array.from(skip).filter(t => rows.some(r => r[tId] === t)) };
    }
    // bars: category = the varying dim with most values; series = the rest
    const sorted = varying.slice().sort((a, b) => new Set(rows.map(r => r[b.id])).size - new Set(rows.map(r => r[a.id])).size);
    const cat = sorted[0] || null;
    const rest = sorted.slice(1);
    const cats = new Map(), series = new Map();
    rows.forEach(r => {
      const ck = cat ? r[cat.id] : "_";
      if (!cats.has(ck)) cats.set(ck, cat ? lab(cat.id, ck) : res.title);
      const sk = rest.map(d => r[d.id]).join("¦");
      if (!series.has(sk)) series.set(sk, { key: sk, label: rest.map(d => lab(d.id, r[d.id])).join(" · ") || "", values: new Map() });
      series.get(sk).values.set(ck, r.value);
    });
    return { kind: "bar", cats: Array.from(cats, ([id, label]) => ({ id, label })), series: Array.from(series.values()), cat, rest, period: times[0] || (tId && rows[0] ? rows[0][tId] : null) };
  }

  const TRIO = ["#173049", "#688FA9", "#A3BCD0"];
  function colorFor(i, n, mode, focusIdx) {
    if (mode === "barvno") return PALETTE[i % PALETTE.length];
    if (n === 1) return T.navy;
    if (focusIdx < 0) return n <= 3 ? TRIO[i] : (i === 0 ? T.navy : T.context);
    return i === focusIdx ? T.navy : T.context;
  }

  /* Render. Returns { svg, legend, model } */
  function render(container, res, opts) {
    opts = Object.assign({ mode: "isr", focus: 0, lang: "sl", title: res.title, subtitle: "", source: res.citation ? res.citation.figure : "", width: null, height: 440, maxSeries: 12 }, opts || {});
    container.innerHTML = "";
    const m = model(res, opts);
    const W = Math.max(320, Math.round(opts.width || container.clientWidth || 860));
    const H = opts.height;
    let allVals = m.kind === "line" ? m.series.flatMap(s => Array.from(s.points.values())) : m.series.flatMap(s => Array.from(s.values.values()));
    const sc0 = opts.noScale ? { div: 1, tag: "" } : scaleFor(allVals, opts.lang);
    if (sc0.div !== 1) {
      const f = (v) => (v === null || v === undefined || !isFinite(v) ? v : v / sc0.div);
      if (m.kind === "line") m.series.forEach(s => { s.points.forEach((v, k) => s.points.set(k, f(v))); });
      else m.series.forEach(s => { s.values.forEach((v, k) => s.values.set(k, f(v))); });
      allVals = allVals.map(f);
    }
    const fmt = makeFormat(opts.lang, allVals.map(v => (v === null || v === undefined || !isFinite(v) ? v : Math.round(v * 1000) / 1000)));
    const subtitle = [opts.subtitle, sc0.tag ? (opts.lang === "en" ? `in ${sc0.tag}` : `v ${sc0.tag}`) : ""].filter(Boolean).join(" · ");
    const svg = el("svg", { xmlns: NS, viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": opts.title, style: "display:block;max-width:100%;height:auto;background:#fff" });
    el("rect", { x: 0, y: 0, width: W, height: H, fill: T.surface }, svg);
    // titles
    const pad = { l: 24, r: 24, t: 24 };
    let y = pad.t + 20;
    const titleLines = wrap(opts.title || "", Math.floor((W - 48) / 10.5));
    titleLines.slice(0, 2).forEach((ln, i) => text(svg, pad.l, y + i * 26, ln, { "font-size": 20, "font-weight": 700, fill: T.ink }));
    y += (Math.min(2, titleLines.length) - 1) * 26;
    if (subtitle) { y += 24; text(svg, pad.l, y, trunc(subtitle, Math.floor((W - 48) / 7.2)), { "font-size": 14, "font-weight": 300, fill: T.muted }); }
    const plotTop = y + 30;
    const plotBottomPad = 52;
    const info = { svg, model: m, fmt, series: [] };

    let series = m.series;
    let dropped = 0;
    if (series.length > opts.maxSeries) { dropped = series.length - opts.maxSeries; series = series.slice(0, opts.maxSeries); }
    // default focus: Slovenia when it is one of many series, otherwise none (up to three) or the first
    const siIdx = series.findIndex(sr => /(^|¦)(SI|SVN)(¦|$)/.test(sr.key) || /^Sloven/i.test(sr.label));
    const focusIdx = opts.focus === undefined || opts.focus === null ? (series.length <= 3 ? -1 : (siIdx >= 0 ? siIdx : 0)) : Math.min(opts.focus, series.length - 1);

    if (m.kind === "line") drawLines(svg, m, series, { W, H, plotTop, plotBottomPad, fmt, opts, focusIdx, info });
    else drawBars(svg, m, series, { W, H, plotTop, plotBottomPad, fmt, opts, focusIdx, info });

    // source line
    const skippedTxt = m.skipped && m.skipped.length ? (opts.lang === "en" ? `Part-year ${m.skipped.join(", ")} not shown.` : `Delno leto ${m.skipped.join(", ")} ni prikazano.`) : "";
    const foot = [opts.source, skippedTxt, dropped ? (opts.lang === "en" ? `Showing ${series.length} of ${series.length + dropped} series.` : `Prikazanih ${series.length} od ${series.length + dropped} serij.`) : ""].filter(Boolean).join("  ");
    text(svg, pad.l, H - 18, foot, { "font-size": 12, fill: T.muted });
    container.appendChild(svg);
    info.series = series.map((s, i) => ({ key: s.key, label: s.label, color: colorFor(i, series.length, opts.mode, focusIdx) }));
    info.dropped = dropped;
    return info;
  }

  function wrap(s, n) {
    const words = String(s).split(/\s+/);
    const lines = [];
    let cur = "";
    words.forEach(w => { if ((cur + " " + w).trim().length > n && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
    if (cur) lines.push(cur);
    if (lines.length > 2) { lines[1] = trunc(lines.slice(1).join(" "), n); return lines.slice(0, 2); }
    return lines;
  }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + "…" : s; }

  function drawLines(svg, m, series, c) {
    const { W, H, plotTop, plotBottomPad, fmt, opts, focusIdx, info } = c;
    const vals = series.flatMap(s => Array.from(s.points.values())).filter(v => v !== null && isFinite(v));
    if (!vals.length) return;
    const allPos = Math.min.apply(null, vals) >= 0;
    const sc = niceScale(Math.min.apply(null, vals), Math.max.apply(null, vals), 5, allPos && Math.min.apply(null, vals) < Math.max.apply(null, vals) * 0.35);
    const narrow = W < 600;
    const labelW = narrow ? 52 : (series.length > 1 ? Math.min(220, Math.max(90, Math.max.apply(null, series.map(s => s.label.length)) * 6.6 + 64)) : 64);
    const yAxisW = Math.max.apply(null, sc.ticks.map(t => fmt.axis(t, sc.step).length)) * 7.2 + 12;
    const L = 24 + yAxisW, R = W - 24 - labelW, Tp = plotTop, B = H - plotBottomPad;
    const n = m.times.length;
    const X = (i) => L + (n === 1 ? (R - L) / 2 : (i * (R - L)) / (n - 1));
    const Y = (v) => B - ((v - sc.lo) / (sc.hi - sc.lo)) * (B - Tp);
    const g = el("g", {}, svg);
    const gBand = el("g", {}, g);
    // grid + y labels
    sc.ticks.forEach(t => {
      el("line", { x1: L, x2: R, y1: Y(t), y2: Y(t), stroke: t === 0 ? "#9FB0BF" : T.grid, "stroke-width": 1 }, g);
      text(g, L - 8, Y(t) + 4, fmt.axis(t, sc.step), { "font-size": 12, fill: T.muted, "text-anchor": "end" });
    });
    // x labels, thinned
    const maxLabels = Math.max(2, Math.floor((R - L) / 64));
    const every = Math.ceil(n / maxLabels);
    m.times.forEach((t, i) => {
      if (i % every !== 0 && i !== n - 1) return;
      if (i !== n - 1 && n - 1 - i < every) return;
      text(g, X(i), B + 20, t, { "font-size": 12, fill: T.muted, "text-anchor": "middle" });
    });
    // projections: a pale band from the first projected period, labelled
    const fc = new Set((opts.forecast || []).filter(t => m.times.includes(t)));
    if (fc.size) {
      const first = m.times.findIndex(t => fc.has(t));
      const x0 = first > 0 ? (X(first - 1) + X(first)) / 2 : L;
      el("rect", { x: x0, y: Tp, width: R - x0, height: B - Tp, fill: "#F1F5F8" }, gBand);
      text(gBand, x0 + 6, Tp + 14, opts.lang === "en" ? "Projection" : "Napoved", { "font-size": 11, fill: T.muted, "font-weight": 700 });
    }
    // lines: context first, focus last
    const order = series.map((s, i) => i).sort((a, b) => (a === focusIdx) - (b === focusIdx));
    const endLabels = [];
    order.forEach(i => {
      const s = series[i];
      const color = colorFor(i, series.length, opts.mode, focusIdx);
      const isFocus = series.length === 1 || i === focusIdx || opts.mode === "barvno" || (focusIdx < 0 && series.length <= 3);
      let d = "", pen = false, last = null;
      m.times.forEach((t, k) => {
        const v = s.points.get(t);
        if (v === null || v === undefined || !isFinite(v)) { pen = false; return; }
        d += (pen ? "L" : "M") + X(k).toFixed(1) + " " + Y(v).toFixed(1);
        pen = true;
        last = { k, v };
      });
      el("path", { d, fill: "none", stroke: color, "stroke-width": isFocus ? 2.5 : 1.6, "stroke-linejoin": "round", "stroke-linecap": "round", "data-series": i }, g);
      // single points (isolated) get a dot so they don't vanish
      m.times.forEach((t, k) => {
        const v = s.points.get(t);
        if (v === null || v === undefined) return;
        const prev = s.points.get(m.times[k - 1]), next = s.points.get(m.times[k + 1]);
        if ((prev === null || prev === undefined) && (next === null || next === undefined)) el("circle", { cx: X(k), cy: Y(v), r: 3, fill: color }, g);
      });
      if (last) {
        el("circle", { cx: X(last.k), cy: Y(last.v), r: isFocus ? 4 : 3, fill: color, stroke: "#fff", "stroke-width": 2 }, g);
        endLabels.push({ i, y: Y(last.v), x: X(last.k), v: last.v, label: s.label, color: isFocus ? T.ink : T.muted, weight: isFocus ? 700 : 400 });
      }
    });
    // end labels with collision avoidance (on phones only the focus keeps its label)
    if (narrow && series.length > 1) { const keep = endLabels.filter(e => e.weight === 700); endLabels.length = 0; keep.forEach(e => endLabels.push(e)); }
    endLabels.sort((a, b) => a.y - b.y);
    const gap = 15;
    for (let k = 1; k < endLabels.length; k++) if (endLabels[k].y - endLabels[k - 1].y < gap) endLabels[k].y = endLabels[k - 1].y + gap;
    for (let k = endLabels.length - 1; k >= 0; k--) { if (endLabels[k].y > B + 4) endLabels[k].y = B + 4; if (k > 0 && endLabels[k].y - endLabels[k - 1].y < gap) endLabels[k - 1].y = endLabels[k].y - gap; }
    const maxChars = Math.floor((labelW - 12) / 6.6);
    endLabels.forEach(e => {
      if (narrow && series.length > 1 && e.weight !== 700) return;   // on phones the legend names the series
      const lbl = series.length > 1 && !narrow ? `${fmt.value(e.v)}  ${trunc(e.label, Math.max(6, maxChars - fmt.value(e.v).length - 2))}` : fmt.value(e.v);
      text(g, R + 10, e.y + 4, lbl, { "font-size": 12, fill: e.color, "font-weight": e.weight });
    });
    // hover layer
    const hover = el("g", { "pointer-events": "none", style: "display:none", class: "isr-hover" }, svg);
    const vline = el("line", { y1: Tp, y2: B, stroke: T.steel, "stroke-width": 1, "stroke-dasharray": "3 3" }, hover);
    const dots = series.map((s, i) => el("circle", { r: 4, fill: colorFor(i, series.length, opts.mode, focusIdx), stroke: "#fff", "stroke-width": 2 }, hover));
    const hit = el("rect", { x: L - 10, y: Tp, width: R - L + 20, height: B - Tp, fill: "transparent", style: "cursor:crosshair" }, svg);
    info.hover = { kind: "line", hit, hover, vline, dots, X, Y, L, R, n, times: m.times, series };
  }

  function drawBars(svg, m, series, c) {
    const { W, H, plotTop, plotBottomPad, fmt, opts, focusIdx, info } = c;
    let cats = m.cats.slice();
    const first = series[0];
    if (series.length === 1) cats.sort((a, b) => (first.values.get(b.id) ?? -Infinity) - (first.values.get(a.id) ?? -Infinity));
    const maxCats = 30;
    let droppedCats = 0;
    if (cats.length > maxCats) { droppedCats = cats.length - maxCats; cats = cats.slice(0, maxCats); }
    const vals = series.flatMap(s => cats.map(cc => s.values.get(cc.id))).filter(v => v !== null && v !== undefined && isFinite(v));
    if (!vals.length) return;
    const sc = niceScale(Math.min.apply(null, vals), Math.max.apply(null, vals), 5, true);
    const catW = Math.min(260, Math.max(60, Math.max.apply(null, cats.map(cc => String(cc.label).length)) * 6.8 + 16));
    const L = 24 + catW, R = W - 24 - 70, Tp = plotTop + (series.length > 1 ? 22 : 0), B = H - plotBottomPad;
    const groupH = (B - Tp) / cats.length;
    const barH = Math.max(3, Math.min(26, (groupH - 6) / series.length - 2));
    const X = (v) => L + ((v - sc.lo) / (sc.hi - sc.lo)) * (R - L);
    const g = el("g", {}, svg);
    sc.ticks.forEach(t => {
      el("line", { x1: X(t), x2: X(t), y1: Tp, y2: B, stroke: t === 0 ? "#9FB0BF" : T.grid }, g);
      text(g, X(t), B + 18, fmt.axis(t, sc.step), { "font-size": 12, fill: T.muted, "text-anchor": "middle" });
    });
    if (series.length > 1) {
      let lx = L;
      series.forEach((s, i) => {
        const col = colorFor(i, series.length, opts.mode === "barvno" ? "barvno" : "isr-bars", focusIdx);
        el("rect", { x: lx, y: plotTop + 4, width: 12, height: 12, fill: barColor(i, series.length, opts.mode) }, g);
        const t = text(g, lx + 18, plotTop + 14, trunc(s.label || "–", 28), { "font-size": 12, fill: T.ink });
        lx += 18 + Math.min(28, (s.label || "–").length) * 6.6 + 18;
        void col; void t;
      });
    }
    const bars = [];
    cats.forEach((cc, ci) => {
      const gy = Tp + ci * groupH + (groupH - (barH + 2) * series.length) / 2;
      text(g, L - 8, gy + ((barH + 2) * series.length) / 2 + 4, trunc(cc.label, Math.floor((catW - 8) / 6.8)), { "font-size": 12, fill: T.ink, "text-anchor": "end" });
      series.forEach((s, si) => {
        const v = s.values.get(cc.id);
        if (v === null || v === undefined || !isFinite(v)) return;
        const x0 = X(Math.max(0, sc.lo)), x1 = X(v);
        const yy = gy + si * (barH + 2);
        const x = Math.min(x0, x1), w = Math.max(1, Math.abs(x1 - x0));
        const r = el("path", { d: roundedBar(x, yy, w, barH, v >= 0), fill: barColor(si, series.length, opts.mode) }, g);
        bars.push({ el: r, cat: cc.label, series: s.label, v });
        if (series.length * cats.length <= 40) text(g, v >= 0 ? x1 + 6 : x1 - 6, yy + barH / 2 + 4, fmt.value(v), { "font-size": 11, fill: T.muted, "text-anchor": v >= 0 ? "start" : "end" });
      });
    });
    if (droppedCats) text(g, L, B + 36, (opts.lang === "en" ? `+ ${droppedCats} more not shown` : `+ ${droppedCats} nadaljnjih ni prikazanih`), { "font-size": 11, fill: T.muted });
    info.hover = { kind: "bar", bars };
  }

  function barColor(i, n, mode) {
    if (mode === "barvno") return PALETTE[i % PALETTE.length];
    return [T.navy, T.steel, T.sky, "#C9D6E0"][i] || T.context;
  }

  function roundedBar(x, y, w, h, positive) {
    const r = Math.min(4, h / 2, w);
    if (positive) return `M${x} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x}Z`;
    return `M${x + w} ${y}H${x + r}Q${x} ${y} ${x} ${y + r}V${y + h - r}Q${x} ${y + h} ${x + r} ${y + h}H${x + w}Z`;
  }

  /* Hover wiring (tooltip is an HTML element supplied by the app) */
  function wireHover(info, tip, fmtLabel) {
    const h = info.hover;
    if (!h) return;
    const svg = info.svg;
    const pt = (evt) => {
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      return { x: (evt.clientX - r.left) * (vb.width / r.width), y: (evt.clientY - r.top) * (vb.height / r.height) };
    };
    if (h.kind === "line") {
      const move = (evt) => {
        const p = pt(evt);
        const i = Math.max(0, Math.min(h.n - 1, Math.round(((p.x - h.L) / (h.R - h.L)) * (h.n - 1))));
        const t = h.times[i];
        h.hover.style.display = "";
        h.vline.setAttribute("x1", h.X(i)); h.vline.setAttribute("x2", h.X(i));
        const items = [];
        h.series.forEach((s, k) => {
          const v = s.points.get(t);
          const dot = h.dots[k];
          if (v === null || v === undefined) { dot.setAttribute("display", "none"); return; }
          dot.setAttribute("display", ""); dot.setAttribute("cx", h.X(i)); dot.setAttribute("cy", h.Y(v));
          items.push({ label: s.label, v, color: dot.getAttribute("fill") });
        });
        items.sort((a, b) => b.v - a.v);
        tip.innerHTML = `<div class="tip-h">${esc(t)}</div>` + items.slice(0, 14).map(x => `<div class="tip-r"><span class="tip-k" style="background:${x.color}"></span><span class="tip-l">${esc(x.label)}</span><span class="tip-v">${esc(info.fmt.value(x.v))}</span></div>`).join("");
        place(tip, evt);
      };
      h.hit.addEventListener("mousemove", move);
      h.hit.addEventListener("mouseleave", () => { h.hover.style.display = "none"; tip.style.display = "none"; });
    } else {
      h.bars.forEach(b => {
        b.el.style.cursor = "default";
        b.el.addEventListener("mousemove", (evt) => {
          tip.innerHTML = `<div class="tip-h">${esc(b.cat)}</div><div class="tip-r"><span class="tip-l">${esc(b.series || "")}</span><span class="tip-v">${esc(info.fmt.value(b.v))}</span></div>`;
          place(tip, evt);
        });
        b.el.addEventListener("mouseleave", () => { tip.style.display = "none"; });
      });
    }
  }
  function place(tip, evt) {
    tip.style.display = "block";
    const pad = 14;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* Export helpers: SVG with embedded fonts, PNG at 2x */
  async function fontFaceCSS(base) {
    const files = [["400", "noto-sans-latin-400-normal.woff2"], ["400", "noto-sans-latin-ext-400-normal.woff2"], ["700", "noto-sans-latin-700-normal.woff2"], ["700", "noto-sans-latin-ext-700-normal.woff2"], ["300", "noto-sans-latin-300-normal.woff2"], ["300", "noto-sans-latin-ext-300-normal.woff2"]];
    const parts = await Promise.all(files.map(async ([w, f]) => {
      try {
        const b = await (await fetch(base + f)).arrayBuffer();
        let s = ""; const u = new Uint8Array(b);
        for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return `@font-face{font-family:'Noto Sans';font-weight:${w};src:url(data:font/woff2;base64,${btoa(s)}) format('woff2');}`;
      } catch (_) { return ""; }
    }));
    return parts.join("");
  }
  async function svgString(svg, fontBase) {
    const clone = svg.cloneNode(true);
    clone.querySelectorAll(".isr-hover").forEach(n => n.remove());
    clone.querySelectorAll("rect[style*='crosshair']").forEach(n => n.remove());
    clone.removeAttribute("style");
    const css = fontBase ? await fontFaceCSS(fontBase) : "";
    if (css) { const st = document.createElementNS(NS, "style"); st.textContent = css; clone.insertBefore(st, clone.firstChild); }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }
  async function pngBlob(svg, fontBase, scale) {
    scale = scale || 2;
    const s = await svgString(svg, fontBase);
    const vb = svg.viewBox.baseVal;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = url; });
    const cv = document.createElement("canvas");
    cv.width = vb.width * scale; cv.height = vb.height * scale;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(url);
    return new Promise(ok => cv.toBlob(ok, "image/png"));
  }

  global.ISRChart = { render, wireHover, svgString, pngBlob, model, PALETTE, T };
})(typeof globalThis !== "undefined" ? globalThis : this);
