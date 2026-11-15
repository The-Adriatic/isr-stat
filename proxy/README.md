# Posrednik ISR Stat (Cloudflare Worker)

Zakaj: nekateri statistični strežniki (Srbija RZS, Albanija INSTAT in Banka Albanije, Črna gora, BiH, UN Comtrade, HNB) brskalniku ne dovolijo branja odgovorov. Tudi strežniki, ki to dovolijo (npr. hrvaški DZS), ob napaki ali preobremenitvi (429) vrnejo odgovor brez glav CORS. Posrednik zahtevo prenese naprej in doda glave. Aplikacija ga uporabi samodejno: za vire, ki ga potrebujejo, vedno, za ostale pa le, če neposreden klic ne uspe.

Kaj prepušča: samo strežnike s seznama `ALLOW` v `worker.js` in samo zahteve z izvorov `ORIGINS` (stran aplikacije). Odgovore GET hrani eno uro.

## Namestitev (enkrat, ~10 minut)

1. Brezplačen račun na <https://dash.cloudflare.com> (lahko z naslovom ISR).
2. *Workers & Pages* → *Create* → *Create Worker* → ime `isr-stat-proxy` → *Deploy*.
3. *Edit code*: vsebino zamenjajte z `proxy/worker.js` → *Deploy*.
4. Naslov workerja (npr. `https://isr-stat-proxy.<račun>.workers.dev`) vpišite v `index.html`:

   ```html
   window.ISR_CONFIG = { proxy: "https://isr-stat-proxy.<račun>.workers.dev", catalog: "catalog" };
   ```

5. Če bo aplikacija na lastni domeni (npr. `data.isr.si`), jo dodajte na seznam `ORIGINS` v workerju.

Brezplačni paket dovoljuje 100.000 zahtev na dan, kar za ISR zadošča z veliko rezervo.

Ali z ukazno vrstico (na Macu):

```bash
cd proxy && npx wrangler deploy worker.js --name isr-stat-proxy --compatibility-date 2026-11-01
```
