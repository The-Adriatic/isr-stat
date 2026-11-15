# ISR Stat

Uradna statistika iz prvih virov, za Inštitut za strateške rešitve (ISR).

**Aplikacija:** <https://the-adriatic.github.io/isr-stat/>

Brskalnik se z vsakim virom poveže neposredno prek njegovega uradnega API-ja; strežnika z bazo ni. Vsak prenos nosi naslov tabele, oznako, datum posodobitve pri viru, datum pridobitve, zastavice (začasno, ocena, prelom, napoved) in navedbo vira po pravilih FDV (v Virih, v besedilu, pod sliko) ter po APA 7.

## Viri

| Vir | API | V brskalniku |
|---|---|---|
| SURS (SiStat) | PxWeb | da |
| Banka Slovenije | PxWeb (`px.bsi.si`) | da |
| Eurostat | JSON-stat + SDMX | da |
| ECB | SDMX | da, včasih nezanesljivo |
| OECD | SDMX (.Stat Suite) | da |
| IMF | SDMX 2.1 (`api.imf.org`) | da |
| ILO (ILOSTAT) | rplumber | da (katalog prek GitHub Actions) |
| Svetovna banka | API v2 | da, včasih nezanesljivo |
| Hrvaška (DZS) | PxWeb | da, a strogo omejuje število zahtev |
| Severna Makedonija (MakStat) | PxWeb | da |
| Kosovo (ASK) | PxWeb | da |
| Srbija, Albanija, Črna gora, BiH, UN Comtrade | različno | potreben posrednik (`proxy/`) |

## Zgradba

```
index.html              lupina strani; nastavitve v window.ISR_CONFIG (proxy, catalog)
assets/isrstat.js       knjižnica: viri, prilagojevalniki (PxWeb, Eurostat, SDMX, ILO, WB), navedbe
assets/chart.js         grafi v SVG v sistemu ISR (črte, stolpci, izvoz SVG/PNG)
assets/app.js           vmesnik: iskanje, brskanje, izbor dimenzij, tabela, graf, izvoz, knjižnica
assets/style.css        slog (Noto Sans, mornarsko modra, ravni robovi)
library.json            skupna knjižnica shranjenih poizvedb
catalog/                katalogi tabel za iskanje (gradi jih .github/workflows/catalog.yml)
tools/build-catalog.mjs gradnja katalogov v Nodu z isto knjižnico
proxy/                  Cloudflare Worker za vire brez CORS
```

## Knjižnica v kodi (in za Clauda)

Na strani aplikacije (ali v katerikoli strani, ki naloži `assets/isrstat.js`):

```js
await ISRStat.search("surs", "izvoz po državah", "sl");
const m = await ISRStat.meta("surs", "2490004S", "sl");          // dimenzije in šifre
const r = await ISRStat.query("surs", "2490004S",
  { "UVOZ/IZVOZ": ["2"], "DRŽAVA": ["XS", "00"], "ENOTA": ["EUR"], "LETO": { last: 10 } }, "sl");
r.rows;            // [{ "UVOZ/IZVOZ": "2", "DRŽAVA": "XS", "LETO": "2025", "ENOTA": "EUR", value: … }, …]
r.labels;          // šifre → oznake
r.provisional; r.partial; r.forecast; r.updated; r.pulledAt;
r.citation.fdv;    // navedba v Virih po FDV
ISRStat.toCSV(r);  // urejen CSV (oznaka + šifra za vsako dimenzijo)
```

Izbor po dimenzijah: seznam šifer `["A","B"]`, vse `"*"`, zadnjih N `{ last: N }`, obdobje `{ from: "2015", to: "2024" }` (Eurostat, SDMX, ILO, Svetovna banka). Pri PxWeb (SURS, BS) izpuščena neobvezna dimenzija pomeni »skupaj«.

## Skupna knjižnica

`library.json` ureja ISR. V aplikaciji »Shrani v knjižnico« shrani poizvedbo v brskalnik (Moja knjižnica); »Kopiraj JSON« da vnos, ki ga dodate v `library.json`.

## Lokalno

```bash
python3 -m http.server 8000   # nato http://localhost:8000
```
