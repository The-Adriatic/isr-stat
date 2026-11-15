# ISR Stat — notes for Claude

Static site on GitHub Pages (`main`, root). No build step: edit files, bump the version, push.

## Releasing a change

- Bump `VERSION` in `assets/isrstat.js` and every `?v=` in `index.html` to the same value (GitHub Pages caches assets for 10 minutes; the query string is the cache-buster).
- `node --check assets/*.js` before pushing.
- Test on the live page in the browser pane (the shells cannot reach the statistics APIs; the browser can).

## Pulling data in a session (any surface with the built-in browser)

Open `https://the-adriatic.github.io/isr-stat/` in the browser pane, then use the page's `ISRStat` object through the JavaScript tool. Keep each call under ~40 s: start long pulls without awaiting, store the result on `window`, read it in a second call.

```js
const m = await ISRStat.meta("surs", "2490004S", "sl");
m.dims.map(d => [d.id, d.required, d.values.length]);
const r = await ISRStat.query("surs", "2490004S", { "UVOZ/IZVOZ": ["2"], "DRŽAVA": ["XS"], "ENOTA": ["EUR"], "LETO": { last: 5 } }, "sl");
({ rows: r.rows.slice(0, 20), cite: r.citation, partial: r.partial, provisional: r.provisional });
```

Large results: return `ISRStat.toCSV(r)` in slices (`.slice(0, 40000)`, then the next) and write them to a file.

## Codes that trip people up

- SURS: Serbia is `XS` (not `RS`); `00` is the world total; `UVOZ/IZVOZ` 1 = imports, 2 = exports; the newest `LETO` is part-year and provisional.
- Banka Slovenije: own numeric country codes (Albania 8, BiH 12, Montenegro 40, North Macedonia 41, Serbia 48, Kosovo 55); Slovene table files end in `s.px`, English in `e.px` (the library maps them).
- Eurostat: Greece is `EL`, Kosovo `XK`; DOI per dataset (10.2908/CODE).
- World Bank: Kosovo `XKX`. ILO: Kosovo `KOS`. IMF WEO: years after the latest actual are flagged `F` (projection).

## Sources not yet connected

Serbia (RZS), Albania (INSTAT, Bank of Albania), Montenegro, BiH, UN Comtrade need the proxy in `proxy/` (Cloudflare Worker). Once `ISR_CONFIG.proxy` is set in `index.html`, give each an adapter (`type` in `SOURCES`).
