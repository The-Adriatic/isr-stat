// Gradnja kataloga tabel za iskanje v ISR Stat.
// Teče v GitHub Actions (tedensko in ob spremembi knjižnice). Uporablja isto
// knjižnico kot spletna aplikacija (assets/isrstat.js); v Nodu ni CORS, zato
// lahko zajame tudi metapodatke virov, ki jih brskalnik ne doseže (ILO).
//
//   npm install --no-save @xmldom/xmldom@0.8
//   node tools/build-catalog.mjs [vir ...]
import { createRequire } from "module";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
const require = createRequire(import.meta.url);
const S = require("../assets/isrstat.js");
const { DOMParser } = require("@xmldom/xmldom");

S.configure({ DOMParser, timeout: 300000, walkDelay: 400 });
const OUT = new URL("../catalog/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// fast list endpoints first, tree walks (rate-limited PxWeb servers) last
const JOBS = [
  ["surs", "sl"], ["surs", "en"],
  ["eurostat", "en"],
  ["ecb", "en"], ["oecd", "en"], ["imf", "en"],
  ["worldbank", "en"],
  ["ilo", "en"],
  ["bsi", "sl"], ["bsi", "en"],
  ["ask", "en"],
  ["makstat", "en"], ["makstat", "mk"],
  ["dzs", "hr"], ["dzs", "en"],
];
const BUDGET_MS = 9 * 60 * 1000;   // per source; a walk that runs over is recorded as failed
const withBudget = (p) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("time budget exceeded")), BUDGET_MS))]);

const only = process.argv.slice(2);
const index = existsSync(OUT + "index.json") ? JSON.parse(readFileSync(OUT + "index.json", "utf8")) : { sources: {} };
index.sources = index.sources || {};

async function iloList() {
  // full indicator list; the browser cannot read this endpoint (no CORS)
  const res = await fetch("https://rplumber.ilo.org/metadata/toc/indicator/?lang=en&format=.csv");
  if (!res.ok) throw new Error("ILO toc HTTP " + res.status);
  const rows = S.util.parseCSV(await res.text());
  if (!rows.length) return [];
  const cols = Object.keys(rows[0]);
  const idCol = cols.find(c => /^id$/i.test(c)) || cols.find(c => /^indicator$/i.test(c)) || cols[0];
  const labCol = cols.find(c => /indicator\.label|^label$|title/i.test(c)) || cols[1];
  const updCol = cols.find(c => /last.?update/i.test(c));
  return rows.map(r => ({ id: r[idCol], label: r[labCol], updated: updCol ? r[updCol] : null, code: r[idCol] })).filter(x => x.id && x.label);
}

for (const [key, lang] of JOBS) {
  if (only.length && !only.includes(key)) continue;
  const t0 = Date.now();
  try {
    const src = S.SOURCES[key];
    const items = await withBudget(key === "ilo" ? iloList() : S._internal[src.type].list(src, lang));
    const seen = new Set();
    const rows = [];
    items.forEach(x => {
      if (!x || !x.id || seen.has(x.id)) return;
      seen.add(x.id);
      rows.push([x.id, String(x.label || "").replace(/\s+/g, " ").trim(), x.updated || "", x.code || ""]);
    });
    if (!rows.length) throw new Error("empty list");
    writeFileSync(`${OUT}${key}.${lang}.json`, JSON.stringify({ source: key, lang, built: new Date().toISOString(), n: rows.length, items: rows }));
    index.sources[`${key}.${lang}`] = { n: rows.length, built: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000) };
    console.log(`${key}.${lang}: ${rows.length} tables in ${Math.round((Date.now() - t0) / 1000)} s`);
  } catch (e) {
    index.sources[`${key}.${lang}`] = Object.assign(index.sources[`${key}.${lang}`] || {}, { error: String(e && e.message || e), tried: new Date().toISOString() });
    console.error(`${key}.${lang}: FAILED ${e && e.message}`);
  }
}
index.built = new Date().toISOString();
writeFileSync(OUT + "index.json", JSON.stringify(index, null, 2));
process.exit(0);
