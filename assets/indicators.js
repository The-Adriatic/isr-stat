/* ISR Stat — teme in kazalniki
 * Vsak kazalnik je pripravljena poizvedba pri uradnem viru: izbrati je treba
 * samo države in obdobje (pri nekaterih še eno možnost, npr. valuto).
 *
 *   source, table, lang   vir in tabela (kot v ISRStat.query)
 *   geo                   dimenzija z državami (null: kazalnik nima držav)
 *   partner               true: države so partnerice Slovenije (SURS, Banka Slovenije)
 *   fixed                 dimenzije, ki so določene in jih uporabnik ne vidi
 *   choices               dimenzije, ki jih uporabnik lahko izbere (z oznakami)
 *   local                 privzeti izbor razčlenitev, ki jih vir vrne sam (ILO: spol, starost)
 *   period                privzeto obdobje
 *   countries             privzete države (ISO 2)
 *   show                  zapis vrednosti v profilu države: pct, eur, meur, ppp, mio, idx, rate
 *   profile               true: kazalnik se pokaže na strani države
 *   batch                 kazalniki z istim batch se na strani države pridobijo z eno poizvedbo
 */
(function (g) {
  "use strict";
  const WB6 = ["RS", "BA", "ME", "MK", "AL", "XK"];
  const REGION = ["SI", "HR", "RS", "BA", "ME", "MK", "AL", "XK"];
  const WEO = { source: "imf", table: "IMF.RES,WEO,9.0.0", lang: "en", geo: "COUNTRY", period: { from: "2015" }, countries: REGION, batch: "weo" };

  const TOPICS = [
    { id: "gospodarstvo", name: { sl: "Gospodarstvo", en: "Economy" }, about: { sl: "Rast, raven razvitosti in zunanje ravnovesje držav.", en: "Growth, income level and external balance." },
      items: ["bdp-rast", "bdp-pc", "tekoci-racun"] },
    { id: "cene", name: { sl: "Cene", en: "Prices" }, about: { sl: "Inflacija na letni ravni in mesec za mesecem.", en: "Inflation, annual and monthly." },
      items: ["inflacija", "inflacija-mesecno"] },
    { id: "trgovina", name: { sl: "Trgovina s Slovenijo", en: "Trade with Slovenia" }, about: { sl: "Koliko blaga in storitev Slovenija izvozi v posamezno državo in uvozi iz nje.", en: "Slovenia's exports to and imports from each country." },
      items: ["izvoz-blaga", "uvoz-blaga", "izvoz-storitev", "uvoz-storitev"] },
    { id: "nalozbe", name: { sl: "Neposredne naložbe", en: "Direct investment" }, about: { sl: "Slovenske naložbe v tujini in tuje naložbe v Sloveniji, po podatkih Banke Slovenije.", en: "Slovenian investment abroad and foreign investment in Slovenia." },
      items: ["nti-v-tujini", "nti-v-sloveniji"] },
    { id: "trg-dela", name: { sl: "Trg dela", en: "Labour market" }, about: { sl: "Brezposelnost in zaposlenost po anketi o delovni sili.", en: "Unemployment and employment from labour force surveys." },
      items: ["brezposelnost", "brezposelnost-mladih", "zaposlenost"] },
    { id: "javne-finance", name: { sl: "Javne finance", en: "Public finance" }, about: { sl: "Javni dolg in proračunski saldo sektorja država.", en: "Government debt and budget balance." },
      items: ["javni-dolg", "proracunski-saldo"] },
    { id: "prebivalstvo", name: { sl: "Prebivalstvo", en: "Population" }, about: { sl: "Število prebivalcev.", en: "Population." },
      items: ["prebivalstvo"] },
    { id: "denar", name: { sl: "Denar in tečaji", en: "Money and exchange rates" }, about: { sl: "Referenčni tečaji evra.", en: "Euro reference rates." },
      items: ["tecaj-evra"] },
    { id: "upravljanje", name: { sl: "Upravljanje", en: "Governance" }, about: { sl: "Kazalniki upravljanja Svetovne banke (WGI): ocena od približno –2,5 (slabo) do 2,5 (dobro).", en: "World Bank governance indicators (WGI), from about –2.5 (weak) to 2.5 (strong)." },
      items: ["wgi-korupcija", "wgi-pravna-drzava", "wgi-ucinkovitost", "wgi-glas"] },
  ];

  const IND = {
    "bdp-rast": Object.assign({}, WEO, {
      name: { sl: "Realna rast BDP", en: "Real GDP growth" }, unit: { sl: "sprememba obsega v %", en: "volume change, %" },
      about: { sl: "Za koliko se je povečal obseg gospodarstva v enem letu. Leta po zadnjem dejanskem podatku so napovedi IMF.", en: "How much the economy grew in a year. Years after the latest actual figure are IMF projections." },
      fixed: { INDICATOR: ["NGDP_RPCH"], FREQUENCY: ["A"] }, show: "pct", profile: true }),
    "bdp-pc": Object.assign({}, WEO, {
      name: { sl: "BDP na prebivalca po kupni moči", en: "GDP per capita at PPP" }, unit: { sl: "mednarodni dolarji po pariteti kupne moči", en: "international dollars at PPP" },
      about: { sl: "Primerljiva raven razvitosti: koliko blaga in storitev ustvari država na prebivalca, preračunano na enake cene.", en: "Comparable income level: output per person at equal prices." },
      fixed: { INDICATOR: ["PPPPC"], FREQUENCY: ["A"] }, show: "ppp", profile: true }),
    "tekoci-racun": Object.assign({}, WEO, {
      name: { sl: "Saldo tekočega računa", en: "Current account balance" }, unit: { sl: "% BDP", en: "% of GDP" },
      about: { sl: "Razlika med prilivi in odlivi v menjavi s tujino. Primanjkljaj pomeni, da država porabi več, kot zasluži v tujini.", en: "Balance of a country's transactions with the rest of the world." },
      fixed: { INDICATOR: ["BCA_NGDPD"], FREQUENCY: ["A"] }, show: "pct", profile: true }),

    "inflacija": Object.assign({}, WEO, {
      name: { sl: "Inflacija", en: "Inflation" }, unit: { sl: "povprečna letna rast cen življenjskih potrebščin v %", en: "average annual consumer price growth, %" },
      about: { sl: "Za koliko so se cene v povprečju zvišale v letu. Leta po zadnjem dejanskem podatku so napovedi IMF.", en: "Average annual rise in consumer prices." },
      fixed: { INDICATOR: ["PCPIPCH"], FREQUENCY: ["A"] }, show: "pct", profile: true }),
    "inflacija-mesecno": {
      source: "eurostat", table: "prc_hicp_minr", lang: "en", geo: "geo",
      name: { sl: "Inflacija, mesečno", en: "Inflation, monthly" }, unit: { sl: "harmonizirani indeks cen (HICP), medletna rast v %", en: "HICP, annual rate of change, %" },
      about: { sl: "Medletna rast cen po mesecih, po primerljivi metodologiji EU. Bosna in Hercegovina ni zajeta.", en: "Annual rate of change by month, harmonised across the EU." },
      fixed: { freq: ["M"], unit: ["RCH_A"], coicop18: ["TOTAL"] }, period: { last: 36 }, countries: ["SI", "HR", "RS", "ME", "MK", "AL", "XK"], show: "pct" },

    "izvoz-blaga": {
      source: "surs", table: "2490004S.px", lang: "sl", geo: "DRŽAVA", partner: true,
      name: { sl: "Izvoz blaga iz Slovenije", en: "Slovenia's goods exports" }, unit: { sl: "EUR", en: "EUR" },
      about: { sl: "Vrednost blaga, ki ga Slovenija izvozi v državo, po podatkih SURS. Zadnje leto je delno in začasno.", en: "Value of goods Slovenia exports to the country (SURS). The latest year is partial and provisional." },
      fixed: { "UVOZ/IZVOZ": ["2"], ENOTA: ["EUR"] }, period: { last: 11 }, countries: WB6, show: "eur", profile: true },
    "uvoz-blaga": {
      source: "surs", table: "2490004S.px", lang: "sl", geo: "DRŽAVA", partner: true,
      name: { sl: "Uvoz blaga v Slovenijo", en: "Slovenia's goods imports" }, unit: { sl: "EUR", en: "EUR" },
      about: { sl: "Vrednost blaga, ki ga Slovenija uvozi iz države, po podatkih SURS. Zadnje leto je delno in začasno.", en: "Value of goods Slovenia imports from the country (SURS)." },
      fixed: { "UVOZ/IZVOZ": ["1"], ENOTA: ["EUR"] }, period: { last: 11 }, countries: WB6, show: "eur", profile: true },
    "izvoz-storitev": {
      source: "bsi", table: "30_EOT/15_BLAG_STOR/t3_bsdas.px", lang: "sl", geo: "Koda porazdelitve", partner: true,
      name: { sl: "Izvoz storitev iz Slovenije", en: "Slovenia's services exports" }, unit: { sl: "mio EUR", en: "EUR million" },
      about: { sl: "Storitve, ki jih Slovenija proda v državo (transport, potovanja, gradbeništvo …), po plačilni bilanci Banke Slovenije.", en: "Services Slovenia sells to the country, balance of payments (Bank of Slovenia)." },
      fixed: { Porazdelitev: ["0"], Postavke: ["6"] }, period: { last: 10 }, countries: WB6, show: "meur", profile: true },
    "uvoz-storitev": {
      source: "bsi", table: "30_EOT/15_BLAG_STOR/t3_bsdas.px", lang: "sl", geo: "Koda porazdelitve", partner: true,
      name: { sl: "Uvoz storitev v Slovenijo", en: "Slovenia's services imports" }, unit: { sl: "mio EUR", en: "EUR million" },
      about: { sl: "Storitve, ki jih Slovenija kupi iz države, po plačilni bilanci Banke Slovenije.", en: "Services Slovenia buys from the country (Bank of Slovenia)." },
      fixed: { Porazdelitev: ["0"], Postavke: ["19"] }, period: { last: 10 }, countries: WB6, show: "meur" },

    "nti-v-tujini": {
      source: "bsi", table: "30_EOT/50_NEPOSREDNE_NALOZBE/nn_s_2as.px", lang: "sl", geo: "Koda porazdelitve", partner: true,
      name: { sl: "Slovenske naložbe v državi", en: "Slovenian investment in the country" }, unit: { sl: "stanje neposrednih naložb, mio EUR", en: "FDI stock, EUR million" },
      about: { sl: "Stanje neposrednih naložb slovenskih podjetij v državi ob koncu leta, po podatkih Banke Slovenije.", en: "Stock of Slovenian direct investment in the country at year end (Bank of Slovenia)." },
      fixed: { Porazdelitev: ["0"], Postavke: ["0"] }, period: { last: 10 }, countries: WB6, show: "meur", profile: true },
    "nti-v-sloveniji": {
      source: "bsi", table: "30_EOT/50_NEPOSREDNE_NALOZBE/nn_s_2bs.px", lang: "sl", geo: "Koda porazdelitve", partner: true,
      name: { sl: "Naložbe iz države v Sloveniji", en: "Investment from the country in Slovenia" }, unit: { sl: "stanje neposrednih naložb, mio EUR", en: "FDI stock, EUR million" },
      about: { sl: "Stanje neposrednih naložb vlagateljev iz države v Sloveniji ob koncu leta, po podatkih Banke Slovenije.", en: "Stock of direct investment from the country in Slovenia (Bank of Slovenia)." },
      fixed: { Porazdelitev: ["0"], Postavke: ["0"] }, period: { last: 10 }, countries: ["AT", "DE", "IT", "HR", "CH", "RS"], show: "meur", profile: true },

    "brezposelnost": {
      source: "ilo", table: "UNE_DEAP_SEX_AGE_RT_A", lang: "en", geo: "ref_area",
      name: { sl: "Stopnja brezposelnosti", en: "Unemployment rate" }, unit: { sl: "% aktivnega prebivalstva", en: "% of the labour force" },
      about: { sl: "Delež brezposelnih med tistimi, ki delajo ali iščejo delo, po anketi o delovni sili (ILO). Spol in starost lahko spremenite.", en: "Share of the labour force that is unemployed (ILO labour force surveys)." },
      local: { sex: "SEX_T", classif1: "AGE_YTHADULT_YGE15" }, period: { from: "2012" }, countries: REGION, show: "pct", profile: true },
    "brezposelnost-mladih": {
      source: "ilo", table: "UNE_DEAP_SEX_AGE_RT_A", lang: "en", geo: "ref_area",
      name: { sl: "Brezposelnost mladih", en: "Youth unemployment" }, unit: { sl: "% aktivnih mladih, 15–24 let", en: "% of the youth labour force, 15–24" },
      about: { sl: "Delež brezposelnih med mladimi od 15 do 24 let, ki delajo ali iščejo delo (ILO).", en: "Unemployment among 15 to 24 year olds (ILO)." },
      local: { sex: "SEX_T", classif1: "AGE_YTHADULT_Y15-24" }, period: { from: "2012" }, countries: REGION, show: "pct", profile: true },
    "zaposlenost": {
      source: "ilo", table: "EMP_DWAP_SEX_AGE_RT_A", lang: "en", geo: "ref_area",
      name: { sl: "Stopnja zaposlenosti", en: "Employment rate" }, unit: { sl: "% prebivalcev, starih 15 let ali več", en: "% of population aged 15+" },
      about: { sl: "Delež zaposlenih med vsemi prebivalci, starimi 15 let ali več (ILO).", en: "Employed persons as a share of the population aged 15+ (ILO)." },
      local: { sex: "SEX_T", classif1: "AGE_YTHADULT_YGE15" }, period: { from: "2012" }, countries: REGION, show: "pct" },

    "javni-dolg": Object.assign({}, WEO, {
      name: { sl: "Javni dolg", en: "Government debt" }, unit: { sl: "bruto dolg sektorja država, % BDP", en: "general government gross debt, % of GDP" },
      about: { sl: "Dolg države v razmerju do BDP. Leta po zadnjem dejanskem podatku so napovedi IMF.", en: "Government debt relative to GDP." },
      fixed: { INDICATOR: ["GGXWDG_NGDP"], FREQUENCY: ["A"] }, show: "pct", profile: true }),
    "proracunski-saldo": Object.assign({}, WEO, {
      name: { sl: "Proračunski saldo", en: "Budget balance" }, unit: { sl: "neto posojanje (+) ali izposojanje (–) države, % BDP", en: "general government net lending/borrowing, % of GDP" },
      about: { sl: "Presežek (+) ali primanjkljaj (–) javnih financ v razmerju do BDP.", en: "Government surplus (+) or deficit (–) relative to GDP." },
      fixed: { INDICATOR: ["GGXCNL_NGDP"], FREQUENCY: ["A"] }, show: "pct", profile: true }),

    "prebivalstvo": Object.assign({}, WEO, {
      name: { sl: "Število prebivalcev", en: "Population" }, unit: { sl: "število oseb", en: "persons" },
      about: { sl: "Število prebivalcev po podatkih in ocenah IMF.", en: "Population (IMF)." },
      fixed: { INDICATOR: ["LP"], FREQUENCY: ["A"] }, show: "mio", profile: true }),

    "tecaj-evra": {
      source: "ecb", table: "ECB,EXR,1.0", lang: "en", geo: null,
      name: { sl: "Tečaj evra", en: "Euro exchange rate" }, unit: { sl: "enot tuje valute za 1 EUR, mesečno povprečje", en: "units of foreign currency per EUR, monthly average" },
      about: { sl: "Referenčni tečaj Evropske centralne banke. Za valute regije (dinar, marka, lek, denar) ECB tečaja ne objavlja.", en: "ECB reference rate. The ECB does not publish rates for the region's currencies." },
      fixed: { FREQ: ["M"], CURRENCY_DENOM: ["EUR"], EXR_TYPE: ["SP00"], EXR_SUFFIX: ["A"] },
      choices: { CURRENCY: { label: { sl: "Valuta", en: "Currency" }, default: ["USD"], options: ["USD", "CHF", "GBP", "JPY", "CNY", "HUF", "PLN", "CZK", "RON", "TRY", "SEK", "NOK"] } },
      period: { from: "2015-01" }, show: "rate",
      // the ECB structure call is slow (half a megabyte); the few codes this view needs are known
      structure: { title: "Exchange Rates", dims: [
        { id: "FREQ", label: "Frequency", values: [{ id: "M", label: { sl: "mesečno", en: "Monthly" } }] },
        { id: "CURRENCY", label: "Currency", values: [
          { id: "USD", label: { sl: "ameriški dolar", en: "US dollar" } }, { id: "CHF", label: { sl: "švicarski frank", en: "Swiss franc" } }, { id: "GBP", label: { sl: "britanski funt", en: "Pound sterling" } },
          { id: "JPY", label: { sl: "japonski jen", en: "Japanese yen" } }, { id: "CNY", label: { sl: "kitajski juan", en: "Chinese yuan renminbi" } }, { id: "HUF", label: { sl: "madžarski forint", en: "Hungarian forint" } },
          { id: "PLN", label: { sl: "poljski zlot", en: "Polish zloty" } }, { id: "CZK", label: { sl: "češka krona", en: "Czech koruna" } }, { id: "RON", label: { sl: "romunski lev", en: "Romanian leu" } },
          { id: "TRY", label: { sl: "turška lira", en: "Turkish lira" } }, { id: "SEK", label: { sl: "švedska krona", en: "Swedish krona" } }, { id: "NOK", label: { sl: "norveška krona", en: "Norwegian krone" } }] },
        { id: "CURRENCY_DENOM", label: "Currency denominator", values: [{ id: "EUR", label: { sl: "evro", en: "Euro" } }] },
        { id: "EXR_TYPE", label: "Exchange rate type", values: [{ id: "SP00", label: { sl: "referenčni tečaj", en: "Spot" } }] },
        { id: "EXR_SUFFIX", label: "Series variation", values: [{ id: "A", label: { sl: "povprečje", en: "Average" } }] },
        { id: "TIME_PERIOD", label: "Time period", role: "time", values: [] }] } },

    "wgi-korupcija": {
      source: "worldbank", table: "CC.EST", lang: "en", geo: "country", wbSource: "3",
      name: { sl: "Nadzor nad korupcijo", en: "Control of corruption" }, unit: { sl: "ocena WGI, od –2,5 do 2,5", en: "WGI estimate, –2.5 to 2.5" },
      about: { sl: "Koliko se javna oblast izvaja v zasebno korist, vključno z zajetjem države (Svetovna banka, WGI).", en: "Extent to which public power is exercised for private gain (World Bank WGI)." },
      period: { from: "2010" }, countries: REGION, show: "idx", profile: true },
    "wgi-pravna-drzava": {
      source: "worldbank", table: "RL.EST", lang: "en", geo: "country", wbSource: "3",
      name: { sl: "Pravna država", en: "Rule of law" }, unit: { sl: "ocena WGI, od –2,5 do 2,5", en: "WGI estimate, –2.5 to 2.5" },
      about: { sl: "Zaupanje v pravila in njihovo spoštovanje: izvrševanje pogodb, lastninske pravice, policija in sodišča (Svetovna banka, WGI).", en: "Confidence in and abidance by the rules of society (World Bank WGI)." },
      period: { from: "2010" }, countries: REGION, show: "idx", profile: true },
    "wgi-ucinkovitost": {
      source: "worldbank", table: "GE.EST", lang: "en", geo: "country", wbSource: "3",
      name: { sl: "Učinkovitost vlade", en: "Government effectiveness" }, unit: { sl: "ocena WGI, od –2,5 do 2,5", en: "WGI estimate, –2.5 to 2.5" },
      about: { sl: "Kakovost javnih storitev in uprave ter verodostojnost politik (Svetovna banka, WGI).", en: "Quality of public services and policy credibility (World Bank WGI)." },
      period: { from: "2010" }, countries: REGION, show: "idx" },
    "wgi-glas": {
      source: "worldbank", table: "VA.EST", lang: "en", geo: "country", wbSource: "3",
      name: { sl: "Glas in odgovornost", en: "Voice and accountability" }, unit: { sl: "ocena WGI, od –2,5 do 2,5", en: "WGI estimate, –2.5 to 2.5" },
      about: { sl: "Volitve, svoboda izražanja in združevanja ter svobodni mediji (Svetovna banka, WGI).", en: "Elections, freedom of expression and association, free media (World Bank WGI)." },
      period: { from: "2010" }, countries: REGION, show: "idx" },
  };
  Object.keys(IND).forEach(k => { IND[k].id = k; });
  TOPICS.forEach(tp => tp.items.forEach(k => { IND[k].topic = tp.id; }));

  const COUNTRY_PAGES = [
    { group: { sl: "Zahodni Balkan", en: "Western Balkans" }, list: ["RS", "BA", "ME", "MK", "AL", "XK"] },
    { group: { sl: "Slovenija in sosede", en: "Slovenia and neighbours" }, list: ["SI", "HR", "AT", "IT", "HU"] },
    { group: { sl: "Pomembne partnerice", en: "Key partners" }, list: ["DE", "FR", "CH", "PL", "CZ", "SK", "TR", "CN", "US"] },
  ];

  g.ISR_TOPICS = TOPICS;
  g.ISR_INDICATORS = IND;
  g.ISR_COUNTRY_PAGES = COUNTRY_PAGES;
})(typeof globalThis !== "undefined" ? globalThis : this);
