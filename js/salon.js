/* Podaci salona. Sve što vlasnica mijenja nalazi se u ovom fajlu.
 * Tekstovi su na tri jezika: [bosanski, engleski, njemački].
 * Sve označeno sa "PRIMJER" su izmišljeni podaci za demo i treba ih zamijeniti pravim. */
window.SALON = {
  name: 'Glaze Nail Studio',                       // PRIMJER: naziv salona
  short: 'Glaze',
  slogan: ['Nokti koji sijaju kao prvog dana.', 'Nails that shine like day one.', 'Nägel, die strahlen wie am ersten Tag.'],
  url: 'https://beauty-salon.example',             // PRIMJER: prava adresa stranice kad se objavi
  currency: 'KM',                                  // 'KM' ili 'EUR'
  timeZone: 'Europe/Sarajevo',

  // Dodatni dijelovi stranice. false = dio se ne prikazuje i njegov kod se ne učitava. true = vraća se kao prije.
  features: {
    mirror: false,        // "Isprobaj na svojoj ruci" (kamera i ogledalo)
    lights: false,        // prekidač svjetla Dan / Salon / Večer i "Pomjeri telefon"
    season: false,        // sekcija "Kolekcija sezone"
    beforeAfter: false,   // sekcija "Razlika se vidi" (prije i poslije)
    gift: false,          // sekcija "Poklon bon" i link u meniju
  },

  contact: {
    phone: '+387 61 000 000',                      // PRIMJER
    tel: '+38761000000',                           // PRIMJER: broj bez razmaka
    viber: '38761000000',                          // PRIMJER: broj za Viber, bez +
    whatsapp: '38761000000',                       // PRIMJER: broj za WhatsApp, bez +
    instagram: 'glaze.nailstudio',                 // PRIMJER: Instagram korisničko ime
    email: 'hello@glaze.example',                  // PRIMJER
    googleReview: 'https://www.google.com/maps',   // PRIMJER: link za ostavljanje Google recenzije
  },
  address: {
    street: 'Ulica Primjera 12',                   // PRIMJER
    city: 'Sarajevo',
    zip: '71000',
    country: 'BA',
    lat: 43.8563, lng: 18.4131,                    // PRIMJER: koordinate
    maps: 'https://www.google.com/maps/search/?api=1&query=43.8563,18.4131',
    parking: ['Javni parking 50 m od studija, prvih 15 minuta besplatno (primjer).', 'Public parking 50 m from the studio, first 15 minutes free (example).', 'Öffentlicher Parkplatz 50 m vom Studio, die ersten 15 Minuten kostenlos (Beispiel).'],
  },

  // Radno vrijeme: [otvara, zatvara] u satima i minutama, null = zatvoreno. 0 = nedjelja.
  hours: { 1: ['09:00', '20:00'], 2: ['09:00', '20:00'], 3: ['09:00', '20:00'], 4: ['09:00', '20:00'], 5: ['09:00', '20:00'], 6: ['09:00', '15:00'], 0: null },
  holidays: ['2026-01-01', '2026-01-02', '2026-03-01', '2026-05-01', '2026-05-02', '2026-11-25', '2026-12-25', '2027-01-01', '2027-01-02'], // datumi kad je zatvoreno

  // Brze činjenice u heroju (PRIMJER, promijeniti po stvarnom stanju salona)
  facts: [
    ['Sterilni alati', 'Sterile tools', 'Sterile Werkzeuge'],
    ['Gel do 3 sedmice', 'Gel up to 3 weeks', 'Gel bis zu 3 Wochen'],
    ['Termini i subotom', 'Saturday appointments', 'Termine auch samstags'],
  ],

  // Usluge. cat = kategorija, min = trajanje, price = cijena, from = "od", tag = 'hot' | 'new' | null
  categories: [
    ['mani', 'Manikura', 'Manicure', 'Maniküre'],
    ['gel', 'Gel lak', 'Gel polish', 'Gel-Lack'],
    ['ext', 'Nadogradnja i korekcija', 'Extensions & refills', 'Modellage & Auffüllen'],
    ['pedi', 'Pedikura', 'Pedicure', 'Pediküre'],
    ['care', 'Njega i tretmani', 'Care & treatments', 'Pflege & Behandlungen'],
    ['art', 'Ukrasi i dodaci', 'Nail art & extras', 'Nail Art & Extras'],
  ],
  services: [ // PRIMJER: cijene i trajanja
    { id: 'classic', cat: 'mani', min: 40, price: 25, tag: null, name: ['Klasična manikura', 'Classic manicure', 'Klassische Maniküre'], desc: ['Oblikovanje, njega zanoktica i lak po izboru.', 'Shaping, cuticle care and polish of your choice.', 'Formen, Nagelhautpflege und Lack nach Wahl.'] },
    { id: 'russian', cat: 'mani', min: 60, price: 35, tag: 'hot', name: ['Ruska manikura', 'Russian manicure', 'Russische Maniküre'], desc: ['Precizna suha manikura za uredne zanoktice koje duže traju.', 'Precise dry manicure for neat cuticles that last longer.', 'Präzise Trockenmaniküre für länger gepflegte Nagelhaut.'] },
    { id: 'gel', cat: 'gel', min: 60, price: 40, tag: 'hot', name: ['Gel lak na prirodne nokte', 'Gel polish on natural nails', 'Gel-Lack auf Naturnägel'], desc: ['Sjaj bez ljuštenja i do tri sedmice.', 'Chip-free shine for up to three weeks.', 'Glanz ohne Absplittern, bis zu drei Wochen.'] },
    { id: 'gelfrench', cat: 'gel', min: 75, price: 50, tag: null, name: ['Gel lak French', 'French gel polish', 'French Gel-Lack'], desc: ['Klasičan French sa čistom linijom osmijeha.', 'Classic French with a clean smile line.', 'Klassisches French mit sauberer Smile-Line.'] },
    { id: 'build', cat: 'ext', min: 120, price: 70, from: true, tag: null, name: ['Nadogradnja gelom', 'Gel extensions', 'Gel-Modellage'], desc: ['Duži i čvršći nokti u obliku koji ti stoji.', 'Longer, stronger nails in a shape that suits you.', 'Längere, stabile Nägel in deiner Wunschform.'] },
    { id: 'refill', cat: 'ext', min: 90, price: 55, tag: null, name: ['Korekcija nadogradnje', 'Extension refill', 'Auffüllen'], desc: ['Popunjavanje izraslog dijela i novi lak.', 'Filling the grown-out part and fresh colour.', 'Auffüllen des Nachwuchses und neue Farbe.'] },
    { id: 'removal', cat: 'ext', min: 20, price: 10, tag: null, name: ['Skidanje gela', 'Gel removal', 'Gel-Entfernung'], desc: ['Nježno skidanje bez oštećenja nokta.', 'Gentle removal without damaging the nail.', 'Schonendes Entfernen ohne Nagelschäden.'] },
    { id: 'pedi', cat: 'pedi', min: 60, price: 40, tag: null, name: ['Klasična pedikura', 'Classic pedicure', 'Klassische Pediküre'], desc: ['Kupka, njega kože i nokata na nogama i lak.', 'Soak, skin and nail care for your feet, plus polish.', 'Fußbad, Haut- und Nagelpflege und Lack.'] },
    { id: 'medpedi', cat: 'pedi', min: 75, price: 50, tag: 'new', name: ['Medicinska pedikura', 'Medical pedicure', 'Medizinische Fußpflege'], desc: ['Suha pedikura za zadebljanja i problematične nokte.', 'Dry pedicure for calluses and problem nails.', 'Trockene Fußpflege bei Hornhaut und Problemnägeln.'] },
    { id: 'pedigel', cat: 'pedi', min: 75, price: 50, tag: null, name: ['Pedikura sa gel lakom', 'Pedicure with gel polish', 'Pediküre mit Gel-Lack'], desc: ['Uredna stopala i sjaj koji traje cijelo ljeto.', 'Neat feet and shine that lasts all summer.', 'Gepflegte Füße und Glanz, der den Sommer hält.'] },
    { id: 'paraffin', cat: 'care', min: 25, price: 20, tag: null, name: ['Parafinska njega ruku', 'Paraffin hand treatment', 'Paraffin-Handpflege'], desc: ['Topli parafin za mekane i nahranjene ruke.', 'Warm paraffin for soft, nourished hands.', 'Warmes Paraffin für weiche, gepflegte Hände.'] },
    { id: 'spa', cat: 'care', min: 30, price: 25, tag: 'new', name: ['SPA tretman ruku', 'Hand spa ritual', 'Hand-Spa-Ritual'], desc: ['Piling, maska i masaža za umorne ruke.', 'Scrub, mask and massage for tired hands.', 'Peeling, Maske und Massage für müde Hände.'] },
    { id: 'chrome', cat: 'art', min: 15, price: 10, tag: 'hot', name: ['Chrome efekat', 'Chrome finish', 'Chrome-Effekt'], desc: ['Biserni ili ogledalni sjaj preko gel laka.', 'Pearly or mirror shine over gel polish.', 'Perlmutt- oder Spiegelglanz über Gel-Lack.'] },
    { id: 'design', cat: 'art', min: 5, price: 3, unit: true, tag: null, name: ['Dizajn po noktu', 'Design per nail', 'Design pro Nagel'], desc: ['Linije, tačkice, cvjetići ili kamenčići.', 'Lines, dots, tiny flowers or stones.', 'Linien, Punkte, Blümchen oder Steinchen.'] },
  ],
  // Dodaci u zakazivanju (korak 2): id usluge koji se dodaje
  addons: ['removal', 'chrome', 'design', 'paraffin'],

  // Nijanse laka za "Isprobaj boju". kind: solid | chrome | glitter
  shadeGroups: [['nude', 'Nude', 'Nude', 'Nude'], ['pink', 'Roze', 'Pink', 'Rosa'], ['red', 'Crvene i bordo', 'Reds & burgundy', 'Rot & Bordeaux'], ['pastel', 'Pastelne', 'Pastels', 'Pastell'], ['dark', 'Tamne', 'Dark', 'Dunkel'], ['chrome', 'Chrome i biser', 'Chrome & pearl', 'Chrome & Perle'], ['glitter', 'Glitter', 'Glitter', 'Glitzer']],
  shades: [
    { id: 'latte', g: 'nude', hex: '#D9B49B', name: ['Latte', 'Latte', 'Latte'] },
    { id: 'porcelain', g: 'nude', hex: '#EFD9CF', name: ['Porculan', 'Porcelain', 'Porzellan'] },
    { id: 'almond', g: 'nude', hex: '#E3BFA6', name: ['Badem', 'Almond', 'Mandel'] },
    { id: 'cashmere', g: 'nude', hex: '#C49A86', name: ['Kašmir', 'Cashmere', 'Kaschmir'] },
    { id: 'milk', g: 'nude', hex: '#F3E7E0', name: ['Mliječna', 'Milky', 'Milchig'] },
    { id: 'ballet', g: 'pink', hex: '#F2C6CF', name: ['Balerina', 'Ballet', 'Ballett'] },
    { id: 'peony', g: 'pink', hex: '#E792A8', name: ['Božur', 'Peony', 'Pfingstrose'] },
    { id: 'peach', g: 'pink', hex: '#F5B49C', name: ['Breskva', 'Peach', 'Pfirsich'] },
    { id: 'rosewood', g: 'pink', hex: '#C6798C', name: ['Ružino drvo', 'Rosewood', 'Rosenholz'] },
    { id: 'fuchsia', g: 'pink', hex: '#D8407A', name: ['Fuksija', 'Fuchsia', 'Fuchsia'] },
    { id: 'cherry', g: 'red', hex: '#B5122E', name: ['Trešnja', 'Cherry', 'Kirsche'] },
    { id: 'classic', g: 'red', hex: '#D0202F', name: ['Klasična crvena', 'Classic red', 'Klassisches Rot'] },
    { id: 'coral', g: 'red', hex: '#EE5A4F', name: ['Koralj', 'Coral', 'Koralle'] },
    { id: 'wine', g: 'red', hex: '#6E1A2D', name: ['Bordo vino', 'Bordeaux wine', 'Bordeaux'] },
    { id: 'berry', g: 'red', hex: '#8E2148', name: ['Bobica', 'Berry', 'Beere'] },
    { id: 'lilac', g: 'pastel', hex: '#CDB8E6', name: ['Jorgovan', 'Lilac', 'Flieder'] },
    { id: 'mint', g: 'pastel', hex: '#BFE3D3', name: ['Menta', 'Mint', 'Minze'] },
    { id: 'sky', g: 'pastel', hex: '#BBD4F0', name: ['Nebo', 'Sky', 'Himmel'] },
    { id: 'butter', g: 'pastel', hex: '#F4E3A8', name: ['Vanila', 'Vanilla', 'Vanille'] },
    { id: 'plum', g: 'dark', hex: '#4A1F33', name: ['Šljiva', 'Plum', 'Pflaume'] },
    { id: 'espresso', g: 'dark', hex: '#3A2622', name: ['Espresso', 'Espresso', 'Espresso'] },
    { id: 'pearl', g: 'chrome', hex: '#EBDDE6', kind: 'chrome', name: ['Biserni chrome', 'Pearl chrome', 'Perlmutt-Chrome'] },
    { id: 'rosechrome', g: 'chrome', hex: '#D9A2B0', kind: 'chrome', name: ['Roze chrome', 'Rose chrome', 'Rosé-Chrome'] },
    { id: 'champagne', g: 'glitter', hex: '#E8CFB3', kind: 'glitter', name: ['Šampanjac', 'Champagne', 'Champagner'] },
  ],
  // Tenovi kože za ruku, svaki u 5 tonova: [osnova, sjena, crvenilo, svjetlo, nabor]
  skins: [
    ['#F4D5C4', '#DDAD97', '#EBAE9F', '#FCEAE0', '#C38E7C'],
    ['#E8BA98', '#C99271', '#DF977F', '#F5D6BF', '#A9775A'],
    ['#C68F69', '#A06C4C', '#BE755B', '#DDB08E', '#87573B'],
    ['#8C5A3F', '#683F2B', '#8F4E3C', '#AE7F65', '#4F2F20']
  ],

  // Galerija dizajna. style: solid | french | ombre | chrome | matte | deco | glitter. tags za filtere.
  designs: [
    { id: 'd1', tags: ['minimal'], shape: 'almond', style: 'solid', shade: 'milk', price: 40, name: ['Mliječni minimal', 'Milky minimal', 'Milchig minimal'] },
    { id: 'd2', tags: ['french'], shape: 'almond', style: 'french', shade: 'ballet', price: 50, name: ['Mekani French', 'Soft French', 'Soft French'] },
    { id: 'd3', tags: ['chrome'], shape: 'oval', style: 'chrome', shade: 'pearl', price: 50, name: ['Glazirana krafna', 'Glazed donut', 'Glazed Donut'] },
    { id: 'd4', tags: ['ombre'], shape: 'coffin', style: 'ombre', shade: 'peony', price: 55, name: ['Roze ombre', 'Pink ombré', 'Rosa Ombré'] },
    { id: 'd5', tags: ['minimal'], shape: 'squoval', style: 'solid', shade: 'cherry', price: 40, name: ['Trešnja crvena', 'Cherry red', 'Kirschrot'] },
    { id: 'd6', tags: ['glitter'], shape: 'almond', style: 'glitter', shade: 'champagne', price: 50, name: ['Šampanjac glitter', 'Champagne glitter', 'Champagner-Glitzer'] },
    { id: 'd7', tags: ['french'], shape: 'square', style: 'french', shade: 'porcelain', price: 50, name: ['Klasičan French', 'Classic French', 'Klassisches French'] },
    { id: 'd8', tags: ['chrome'], shape: 'stiletto', style: 'chrome', shade: 'rosechrome', price: 60, name: ['Roze ogledalo', 'Rose mirror', 'Rosé-Spiegel'] },
    { id: 'd9', tags: ['minimal'], shape: 'oval', style: 'matte', shade: 'cashmere', price: 45, name: ['Mat kašmir', 'Matte cashmere', 'Matt Kaschmir'] },
    { id: 'd10', tags: ['ombre'], shape: 'almond', style: 'ombre', shade: 'lilac', price: 55, name: ['Jorgovan oblak', 'Lilac cloud', 'Fliederwolke'] },
    { id: 'd11', tags: ['minimal'], shape: 'squoval', style: 'deco', shade: 'latte', price: 50, name: ['Latte sa kamenčićem', 'Latte with a gem', 'Latte mit Steinchen'] },
    { id: 'd12', tags: ['glitter'], shape: 'coffin', style: 'glitter', shade: 'champagne', price: 55, name: ['Zlatna prašina', 'Gold dust', 'Goldstaub'] },
    { id: 'd13', tags: ['french'], shape: 'almond', style: 'french', shade: 'lilac', price: 55, name: ['Pastelni French', 'Pastel French', 'Pastell-French'] },
    { id: 'd14', tags: ['chrome'], shape: 'almond', style: 'chrome', shade: 'lilac', price: 55, name: ['Aurora chrome', 'Aurora chrome', 'Aurora-Chrome'] },
    { id: 'd15', tags: ['minimal'], shape: 'oval', style: 'solid', shade: 'wine', price: 40, name: ['Bordo večer', 'Bordeaux evening', 'Bordeaux-Abend'] },
    { id: 'd16', tags: ['ombre'], shape: 'square', style: 'ombre', shade: 'peach', price: 55, name: ['Breskva zalazak', 'Peach sunset', 'Pfirsich-Sonnenuntergang'] },
    { id: 'd17', tags: ['minimal'], shape: 'almond', style: 'deco', shade: 'ballet', price: 50, name: ['Balerina tačkice', 'Ballet dots', 'Ballett-Pünktchen'] },
    { id: 'd18', tags: ['minimal'], shape: 'squoval', style: 'matte', shade: 'plum', price: 45, name: ['Mat šljiva', 'Matte plum', 'Matt Pflaume'] },
    { id: 'd19', tags: ['chrome'], shape: 'coffin', style: 'chrome', shade: 'espresso', price: 60, name: ['Espresso chrome', 'Espresso chrome', 'Espresso-Chrome'] },
    { id: 'd20', tags: ['glitter'], shape: 'oval', style: 'glitter', shade: 'ballet', price: 50, name: ['Roze iskre', 'Pink sparkle', 'Rosa Funkeln'] },
  ],
  // Kolekcija sezone: 6 dizajna po godišnjem dobu (id-jevi iz galerije)
  seasons: {
    autumn: ['d15', 'd9', 'd19', 'd11', 'd18', 'd5'],
    winter: ['d3', 'd6', 'd8', 'd15', 'd14', 'd12'],
    spring: ['d2', 'd10', 'd13', 'd17', 'd1', 'd4'],
    summer: ['d16', 'd4', 'd20', 'd10', 'd8', 'd13'],
  },

  // Prave fotografije salona: upiši putanju (npr. 'assets/photos/enterijer.jpg'). Prazno = okvir sa natpisom.
  photos: { interior: '', team: '', work: '' },

  team: [ // PRIMJER: tim
    { name: 'Amra', hair: '#3B2420', skin: 0, role: ['Gel i nadogradnja', 'Gel & extensions', 'Gel & Modellage'], shade: 'peony' },
    { name: 'Lejla', hair: '#8A5A3B', skin: 1, role: ['Nail art i chrome', 'Nail art & chrome', 'Nail Art & Chrome'], shade: 'pearl' },
    { name: 'Selma', hair: '#1F1716', skin: 2, role: ['Pedikura i njega', 'Pedicure & care', 'Pediküre & Pflege'], shade: 'wine' },
  ],

  reviews: [ // PRIMJER: izmišljene recenzije za demo, zamijeniti pravim
    { name: 'Ajla', stars: 5, text: ['Gel mi drži skoro tri sedmice, a zanoktice nikad nisu bile urednije.', 'My gel lasts almost three weeks and my cuticles have never looked neater.', 'Mein Gel hält fast drei Wochen und meine Nagelhaut war nie gepflegter.'] },
    { name: 'Merima', stars: 5, text: ['Isprobala sam boju na stranici i tačno to dobila. Studio je miran i čist.', 'I tried the colour on the website and got exactly that. Calm, clean studio.', 'Ich habe die Farbe auf der Website ausprobiert und genau die bekommen. Ruhiges, sauberes Studio.'] },
    { name: 'Dženana', stars: 5, text: ['Termin potvrđen za par minuta na Viberu. Preporučujem French!', 'Appointment confirmed on Viber within minutes. Recommend the French!', 'Termin in wenigen Minuten per Viber bestätigt. Das French ist top!'] },
    { name: 'Lana', stars: 4, text: ['Divan chrome efekat, jedva čekam sljedeći termin.', 'Lovely chrome finish, can’t wait for my next visit.', 'Wunderschöner Chrome-Effekt, ich freue mich auf den nächsten Termin.'] },
  ],
 // PRIMJER pravilo
  giftAmounts: [30, 50, 80, 100, 150],              // PRIMJER iznosi poklon bona
  correctionWeeks: 3,                               // preporuka za korekciju gela, u sedmicama

  hygiene: [
    ['steril', ['Sterilni alati', 'Sterile tools', 'Sterile Werkzeuge'], ['Metalni alati prolaze čišćenje i sterilizaciju nakon svake klijentice.', 'Metal tools are cleaned and sterilised after every client.', 'Metallwerkzeuge werden nach jeder Kundin gereinigt und sterilisiert.']],
    ['file', ['Jednokratne turpije', 'Single-use files', 'Einweg-Feilen'], ['Turpije i bufovi su jednokratni ili samo tvoji.', 'Files and buffers are single-use or yours alone.', 'Feilen und Buffer sind Einwegartikel oder nur für dich.']],
    ['spray', ['Dezinfekcija', 'Disinfection', 'Desinfektion'], ['Radno mjesto i ruke dezinficiramo prije svakog termina.', 'We disinfect the station and hands before every appointment.', 'Arbeitsplatz und Hände werden vor jedem Termin desinfiziert.']],
    ['air', ['Čist zrak', 'Fresh air', 'Saubere Luft'], ['Usisivač prašine na stolu i provjetren prostor.', 'Dust extraction at the desk and a well-aired studio.', 'Staubabsaugung am Tisch und gut gelüftetes Studio.']],
  ],

  faq: [
    [['Koliko traje gel lak?', 'How long does gel polish last?', 'Wie lange hält Gel-Lack?'], ['Obično dvije do tri sedmice, zavisno od rasta nokta i načina korištenja ruku.', 'Usually two to three weeks, depending on nail growth and how you use your hands.', 'Meist zwei bis drei Wochen, je nach Nagelwachstum und Beanspruchung.']],
    [['Da li gel oštećuje nokte?', 'Does gel damage nails?', 'Schadet Gel den Nägeln?'], ['Pravilno nanošenje i stručno skidanje ne oštećuju nokat. Problem nastaje kad se gel skida na silu, pa ga uvijek skidamo mi.', 'Proper application and professional removal don’t damage the nail. Damage happens when gel is forced off, so let us remove it.', 'Richtiges Auftragen und fachgerechtes Entfernen schaden nicht. Schäden entstehen beim gewaltsamen Abziehen, daher entfernen wir es.']],
    [['Mogu li doći u trudnoći?', 'Can I come while pregnant?', 'Darf ich in der Schwangerschaft kommen?'], ['Da, manikura i pedikura su uobičajene i u trudnoći. Ako imaš posebne preporuke ljekara, reci nam pri zakazivanju.', 'Yes, manicures and pedicures are common during pregnancy. If your doctor gave special advice, tell us when booking.', 'Ja, Maniküre und Pediküre sind üblich. Wenn dein Arzt etwas Besonderes empfohlen hat, sag es uns bei der Buchung.']],
    [['Kako da otkažem ili pomjerim termin?', 'How do I cancel or move my appointment?', 'Wie sage ich ab oder verschiebe?'], ['Pošalji nam poruku na Viber ili WhatsApp najmanje 24 sata ranije (primjer pravila, salon ga može promijeniti).', 'Send us a message on Viber or WhatsApp at least 24 hours ahead (example policy, the salon can change it).', 'Schreib uns mindestens 24 Stunden vorher per Viber oder WhatsApp (Beispielregel, kann vom Studio geändert werden).']],
    [['Kasnim, šta sad?', 'I’m running late, what now?', 'Ich verspäte mich, was nun?'], ['Javi nam se odmah. Ako kasniš više od 15 minuta, možda ćemo skratiti uslugu ili pomjeriti termin (primjer pravila).', 'Let us know right away. If you’re more than 15 minutes late we may shorten the service or reschedule (example policy).', 'Sag uns sofort Bescheid. Bei mehr als 15 Minuten Verspätung kürzen oder verschieben wir eventuell (Beispielregel).']],
    [['Mogu li platiti karticom?', 'Can I pay by card?', 'Kann ich mit Karte zahlen?'], ['Pitaj salon: način plaćanja upisuje vlasnica.', 'Ask the salon: the owner fills in payment options.', 'Frag das Studio: die Zahlungsarten trägt die Inhaberin ein.']],
    [['Radite li i djeci?', 'Do you do kids’ nails?', 'Macht ihr auch Kindernägel?'], ['Pitaj salon. Za djecu obično radimo samo njegu i lak bez gela.', 'Ask the salon. For kids we usually offer only care and regular polish, no gel.', 'Frag das Studio. Für Kinder meist nur Pflege und normalen Lack, kein Gel.']],
    [['Mogu li doći sa prijateljicom?', 'Can I come with a friend?', 'Kann ich mit einer Freundin kommen?'], ['Naravno. Napiši u napomeni da želite termin u isto vrijeme, pa ćemo provjeriti.', 'Of course. Add a note that you’d like the same time and we’ll check.', 'Natürlich. Schreib in die Notiz, dass ihr gleichzeitig möchtet, wir prüfen das.']],
    [['Koliko ranije da zakažem?', 'How far ahead should I book?', 'Wie früh sollte ich buchen?'], ['Za radne dane obično nekoliko dana ranije, a za petak i subotu najbolje sedmicu ranije.', 'For weekdays usually a few days ahead, for Friday and Saturday ideally a week ahead.', 'Unter der Woche meist ein paar Tage vorher, für Freitag und Samstag am besten eine Woche.']],
    [['Šta ako mi se gel odvoji?', 'What if my gel lifts?', 'Was, wenn sich das Gel löst?'], ['Ne čupaj ga. Javi nam se, pa ćemo ga popraviti ili skinuti bez oštećenja.', 'Don’t pick it. Contact us and we’ll fix or remove it without damage.', 'Nicht abziehen. Melde dich, wir reparieren oder entfernen es schonend.']],
    [['Mogu li donijeti sliku dizajna?', 'Can I bring a design photo?', 'Kann ich ein Designfoto mitbringen?'], ['Da, pošalji je uz upit ili izaberi dizajn ovdje u galeriji.', 'Yes, send it with your request or pick one from our gallery.', 'Ja, schick es mit der Anfrage oder wähle eines aus der Galerie.']],
  ],

  tips: [
    ['oil', ['Ulje za zanoktice', 'Cuticle oil', 'Nagelhautöl'], ['Kap ulja svako veče drži zanoktice mekanim i gel sjajnim.', 'A drop every evening keeps cuticles soft and gel glossy.', 'Ein Tropfen jeden Abend hält Nagelhaut weich und Gel glänzend.']],
    ['gloves', ['Rukavice za čišćenje', 'Gloves for chores', 'Handschuhe beim Putzen'], ['Deterdženti i vruća voda skraćuju trajanje laka.', 'Detergents and hot water shorten polish life.', 'Spülmittel und heißes Wasser verkürzen die Haltbarkeit.']],
    ['nohands', ['Ne skidaj gel sama', 'Don’t peel off gel', 'Gel nicht selbst abziehen'], ['Čupanjem gela skidaš i slojeve nokta.', 'Peeling gel also strips layers of your nail.', 'Beim Abziehen gehen Nagelschichten mit.']],
    ['cream', ['Krema za ruke', 'Hand cream', 'Handcreme'], ['Nahranjena koža oko nokta izgleda urednije.', 'Nourished skin around the nail looks neater.', 'Gepflegte Haut lässt die Nägel ordentlicher wirken.']],
    ['cal', ['Korekcija na vrijeme', 'Refill on time', 'Rechtzeitig auffüllen'], ['Na tri sedmice dođi na korekciju, prije nego nokat izraste previše.', 'Come for a refill every three weeks, before it grows out too far.', 'Alle drei Wochen auffüllen, bevor es zu weit herauswächst.']],
    ['lift', ['Ako se gel odvoji', 'If gel lifts', 'Wenn Gel sich löst'], ['Zalijepi flaster i javi nam se, da voda ne uđe ispod.', 'Cover it with a plaster and message us so water can’t get under.', 'Mit Pflaster abdecken und uns schreiben, damit kein Wasser darunter kommt.']],
  ],
};
