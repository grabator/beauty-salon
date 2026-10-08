# Glaze Nail Studio

Web stranica za salon za nokte: manikura, gel lak, nadogradnja, pedikura i njega.

Posjetiteljka može isprobati boju, oblik, dužinu i stil noktiju na ilustrovanoj ruci, sačuvati omiljene kombinacije i jednim dodirom poslati upit za termin preko Vibera, WhatsAppa ili Instagrama. Stranica radi na bosanskom, engleskom i njemačkom, a na mobitelu se ponaša kao aplikacija (može se dodati na početni ekran i radi bez interneta).

Čisti HTML, CSS i JavaScript, bez frameworka i bez build koraka. Sva grafika je nacrtana u SVG-u.

## Pokretanje

```
node serve.mjs
```

Zatim otvori http://localhost:8080.

## Gdje se mijenjaju podaci

Svi podaci salona su u `js/salon.js`. Tekstovi interfejsa (dugmad, naslovi) su u `js/i18n.js`.

## Šta vlasnica treba popuniti u `js/salon.js`

Sve označeno sa "PRIMJER" je izmišljeno za demo:

- `name`, `short`, `slogan`: naziv i slogan salona
- `url`: prava adresa stranice (ista adresa i u `index.html`, `robots.txt` i `sitemap.xml`, umjesto `beauty-salon.example`)
- `contact`: telefon, Viber, WhatsApp, Instagram, email i link za Google recenzije
- `address`: ulica, grad, poštanski broj, koordinate, link za mapu i opis parkinga
- `hours` i `holidays`: radno vrijeme po danima i neradni dani
- `busy`: zauzeti termini (sada je primjer koji se ponavlja svake sedmice)
- `facts`: tri kratke činjenice u heroju
- `services`: usluge, cijene, trajanja i opisi
- `team`: imena i specijalnosti tima
- `reviews`: prave recenzije (sada su primjer i tako su označene)
- `loyalty`, `giftAmounts`, `correctionWeeks`: pravila kartice vjernosti, iznosi poklon bona i preporuka za korekciju
- `faq`: odgovori na pitanja (plaćanje karticom, djeca, otkazivanje)

## Licence

Fontovi Instrument Serif i Manrope su pod SIL Open Font License (licence su u `assets/fonts`).
