# Glaze Nail Studio

Web stranica za salon za nokte: manikura, gel lak, nadogradnja, pedikura i njega.

Posjetiteljka može isprobati boju, oblik, dužinu i stil noktiju na realistično nacrtanoj ruci, pogledati lak u dnevnom, salonskom ili večernjem svjetlu, isprobati boju na svojoj ruci kroz kameru (Ogledalo), dobiti prijedlog nijanse uz svoj outfit, sačuvati omiljene kombinacije i jednim dodirom poslati upit za termin preko Vibera, WhatsAppa ili Instagrama. Stranica radi na bosanskom, engleskom i njemačkom, a na mobitelu se ponaša kao aplikacija (može se dodati na početni ekran i radi bez interneta).

Čisti HTML, CSS i JavaScript, bez frameworka i bez build koraka. Sva grafika je nacrtana u SVG-u.

## Pokretanje

```
node serve.mjs
```

Zatim otvori http://localhost:8080.

## Gdje se mijenjaju podaci

Svi podaci salona su u `js/salon.js`. Tekstovi interfejsa su u `js/i18n-bs.js`, `js/i18n-en.js` i `js/i18n-de.js` (učitava se samo izabrani jezik).

## Šta vlasnica treba popuniti u `js/salon.js`

Sve označeno sa "PRIMJER" je izmišljeno za demo:

- `name`, `short`, `slogan`: naziv i slogan salona
- `url`: prava adresa stranice (ista adresa i u `index.html`, `robots.txt` i `sitemap.xml`, umjesto `beauty-salon.example`)
- `contact`: telefon, Viber, WhatsApp, Instagram, email i link za Google recenzije
- `address`: ulica, grad, poštanski broj, koordinate, link za mapu i opis parkinga
- `hours` i `holidays`: radno vrijeme po danima i neradni dani
- `facts`: tri kratke činjenice u heroju
- `services`: usluge, cijene, trajanja i opisi
- `team`: imena i specijalnosti tima
- `reviews`: prave recenzije (sada su primjer i tako su označene)
- `giftAmounts`: iznosi poklon bona
- `faq`: odgovori na pitanja (plaćanje karticom, djeca, otkazivanje)
- `photos`: putanje do pravih fotografija (enterijer, tim, radovi). Dok su prazne, prikazuju se okviri sa natpisom "Ovdje ide fotografija salona".
- `skins`: tenovi kože za ruku, svaki u 5 tonova (osnova, sjena, crvenilo, svjetlo, nabor). Mogu se mijenjati po želji.

## Ogledalo (kamera)

Dugme "Isprobaj na svojoj ruci" učitava prepoznavanje ruke tek kad se dodirne:

- biblioteka MediaPipe Tasks Vision 0.10.21 sa `cdn.jsdelivr.net` (Apache License 2.0)
- model `hand_landmarker.task` sa `storage.googleapis.com` (Apache License 2.0)

Slika sa kamere i učitane fotografije obrađuju se samo u pregledniku i nigdje se ne šalju. U `_headers` je dozvoljena kamera samo za ovu stranicu (`camera=(self)`). Ako biblioteka ili model nisu dostupni, prikazuje se poruka i povratak na ilustrovanu ruku.

## Licence

Fontovi Instrument Serif i Manrope su pod SIL Open Font License (licence su u `assets/fonts`).
