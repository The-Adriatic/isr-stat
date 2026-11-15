// Kopije podatkov za vire, ki brskalnikom pogosto ne odgovorijo (Svetovna banka).
// Teče v GitHub Actions; aplikacija jih uporabi le, kadar vir ne odgovori.
//   node tools/build-snapshots.mjs
import { mkdirSync, writeFileSync } from "fs";
const OUT = new URL("../data/worldbank/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const WB = "https://api.worldbank.org/v2";
const LIST = [
  ["CC.EST", "3"], ["RL.EST", "3"], ["GE.EST", "3"], ["VA.EST", "3"], ["PV.EST", "3"], ["RQ.EST", "3"],
  ["NY.GDP.PCAP.PP.KD", "2"], ["SP.POP.TOTL", "2"], ["NE.TRD.GNFS.ZS", "2"], ["BX.KLT.DINV.WD.GD.ZS", "2"],
];
const year = new Date().getFullYear();
async function getJSON(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "ISR-Stat/1.0 (+https://isr.si)" } });
      if (r.ok) return await r.json();
      console.error(url, r.status);
    } catch (e) { console.error(url, e.message); }
    await new Promise(r => setTimeout(r, 4000 * (i + 1)));
  }
  throw new Error("failed: " + url);
}
let ok = 0;
for (const [id, src] of LIST) {
  try {
    const meta = await getJSON(`${WB}/indicator/${id}?format=json&source=${src}`);
    const ind = (meta[1] || [])[0] || {};
    const js = await getJSON(`${WB}/country/all/indicator/${id}?format=json&per_page=20000&date=1990:${year}&source=${src}`);
    const rows = (js[1] || []).filter(r => r.value !== null && (r.countryiso3code || r.country.id)).map(r => ({ c: r.countryiso3code || r.country.id, n: r.country.value, t: r.date, v: Number(r.value) }));
    writeFileSync(OUT + id.replace(/[^A-Za-z0-9._-]/g, "_") + ".json", JSON.stringify({ id, title: ind.name || id, note: ind.sourceNote || "", sourceOrg: ind.sourceOrganization || "", wbSource: src, lastupdated: js[0] && js[0].lastupdated, pulledAt: new Date().toISOString(), rows }));
    console.log(`${id}: ${rows.length} rows`);
    ok++;
  } catch (e) { console.error(`${id}: ${e.message}`); }
}
if (!ok) process.exit(1);
