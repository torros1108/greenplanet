-- Launch-ready customer pages for Greenplanet.
-- Run in Supabase SQL editor to update the public pages shown in the footer.

insert into public.pages (slug, title, eyebrow, intro, sections)
values
  (
    'contact',
    'Kontakt Greenplanet',
    'Kundeservice',
    'Har du spørgsmål til produkter, gaveæsker, levering direkte til modtager eller en konkret ordre, er du altid velkommen til at kontakte Greenplanet.',
    '[
      {"title":"Kontaktoplysninger","body":"Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum. E-mail: hello@greenplanet.dk. Vi svarer normalt inden for 1-2 hverdage."},
      {"title":"Hjælp til gavevalg","body":"Skriv gerne anledning, budget, ønsket leveringsdato og om gaven skal sendes direkte til modtager. Så hjælper vi med at finde en passende gaveæske eller et udvalg til byg-selv."},
      {"title":"Ordre og ændringer","body":"Kontakt os hurtigst muligt, hvis du vil ændre en bestilling, leveringsadresse, korttekst eller ønsket leveringsdato. Når en gave er pakket eller afsendt, kan ændringer være begrænsede."},
      {"title":"Svar på reklamationer","body":"Ved fejl, skade eller mangler skal du sende ordrenummer, en kort beskrivelse og gerne billeder. Så vurderer vi sagen og vender tilbage med en løsning."}
    ]'::jsonb
  ),
  (
    'delivery',
    'Levering',
    'Kundeservice',
    'Greenplanet kan sende gaveæsker direkte til modtager eller til dig, hvis du selv vil overrække gaven.',
    '[
      {"title":"Levering til modtager","body":"Ved checkout kan du vælge modtagers navn, adresse, ønsket leveringsdato og en leveringsnote. Vi sender uden prisbilag, når gaven sendes direkte."},
      {"title":"Leveringstid","body":"Lagervarer pakkes som udgangspunkt inden for 1-3 hverdage efter ordrebekræftelse. Den forventede leveringsdato fremgår af den bekræftelse, du modtager fra Greenplanet."},
      {"title":"Fragt og levering","body":"Fragtprisen vises i checkout, før du går til betaling. Levering koster 49 kr., mens afhentning eller særskilt aftalt levering vises som 0 kr. i checkout."},
      {"title":"Forsinkelse eller fejl","body":"Hvis pakken bliver forsinket eller beskadiget under levering, hjælper vi med at finde en løsning. Kontakt os med ordrenummer og gerne billeder ved transportskade."}
    ]'::jsonb
  ),
  (
    'returns',
    'Returnering og fortrydelse',
    'Kundeservice',
    'Vi vil gerne gøre returnering enkel og fair. Kontakt os altid først, så vi kan registrere returneringen og hjælpe med den rigtige løsning.',
    '[
      {"title":"Fortrydelsesret","body":"Private kunder har som udgangspunkt 14 dages fortrydelsesret ved køb online. Fristen regnes normalt fra den dag, du eller den valgte modtager får varen i fysisk besiddelse."},
      {"title":"Sådan returnerer du","body":"Send en mail med ordrenummer, navn og hvilke varer du ønsker at returnere. Varen skal returneres forsvarligt pakket, ubrugt og i væsentligt samme stand som ved modtagelsen."},
      {"title":"Returfragt","body":"Du betaler som udgangspunkt selv returfragten, medmindre returneringen skyldes en fejl fra Greenplanet eller andet er aftalt skriftligt."},
      {"title":"Undtagelser","body":"Forseglede pleje- og hygiejneprodukter kan miste fortrydelsesretten, hvis forseglingen brydes. Personlige korttekster, specialpakkede gaveæsker og varer tilpasset efter dine specifikke ønsker kan være undtaget fra fortrydelsesretten."},
      {"title":"Tilbagebetaling","body":"Når vi har modtaget og kontrolleret returneringen, tilbagebetaler vi beløbet til samme betalingsmiddel, som blev brugt ved købet, medmindre andet er aftalt."}
    ]'::jsonb
  ),
  (
    'legal',
    'Juridisk overblik',
    'Jura',
    'Her finder du Greenplanets virksomhedsoplysninger, handelsbetingelser, privatlivspolitik og cookiepolitik samlet ét sted.',
    '[
      {"title":"Virksomhedsoplysninger","body":"Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, e-mail hello@greenplanet.dk."},
      {"title":"Handelsbetingelser","body":"Handelsbetingelserne gælder for køb og bestillinger hos Greenplanet. De beskriver blandt andet ordreproces, betaling, levering, fortrydelsesret, reklamation og klageadgang."},
      {"title":"Privatlivspolitik","body":"Privatlivspolitikken beskriver, hvordan Greenplanet behandler kunders og modtageres personoplysninger i forbindelse med bestilling, levering, kundeservice og bogføring."},
      {"title":"Cookiepolitik","body":"Cookiepolitikken beskriver brugen af nødvendige cookies og eventuelle cookies til statistik eller marketing, hvis sådanne teknologier aktiveres på webshoppen."}
    ]'::jsonb
  ),
  (
    'terms',
    'Handelsbetingelser',
    'Jura',
    'Disse handelsbetingelser gælder for køb og bestillinger hos Greenplanet. Teksterne er skrevet til lancering og bør løbende opdateres, hvis sortiment, leveringsform eller betalingsflow ændres.',
    '[
      {"title":"Virksomhed","body":"Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, e-mail hello@greenplanet.dk."},
      {"title":"Bestilling og aftale","body":"Når du gennemfører betaling i checkout, modtager Greenplanet dine ordreoplysninger og den samlede pris inkl. fragt. Aftalen er bindende, når betalingen er gennemført, og du har modtaget en ordrebekræftelse."},
      {"title":"Priser og betaling","body":"Alle priser vises i danske kroner. Fragt vises i checkout, før du går til betaling. Betaling gennemføres sikkert via Stripe, og ordren behandles, når betalingen er registreret."},
      {"title":"Produkter og gaveæsker","body":"Greenplanet sælger gaveæsker og udvalgte produkter til baby, barsel og personlig pleje. Indhold, farver og emballage kan variere en smule afhængigt af lagerstatus. Hvis et produkt ikke kan leveres, kontakter vi dig med forslag til erstatning eller ændring af ordren."},
      {"title":"Levering","body":"Gaver kan sendes direkte til modtager eller til bestiller. Ved direkte gavelevering sendes pakken uden prisbilag, når det er muligt. Levering koster 49 kr., medmindre afhentning eller anden løsning er aftalt. Ønsket leveringsdato er et ønske og ikke en garanti, medmindre det er særskilt bekræftet."},
      {"title":"Fortrydelsesret","body":"Som forbruger har du som udgangspunkt 14 dages fortrydelsesret ved køb online. Fristen regnes normalt fra den dag, du eller en valgt modtager får varen i fysisk besiddelse. Du skal give Greenplanet besked inden fristens udløb, hvis du vil fortryde købet."},
      {"title":"Returnering","body":"Ved fortrydelse skal varen returneres uden unødig forsinkelse og senest 14 dage efter, at du har givet besked om fortrydelse. Varen skal returneres forsvarligt pakket og i væsentligt samme stand. Du betaler selv returfragten, medmindre andet er aftalt."},
      {"title":"Undtagelser","body":"Forseglede pleje- og hygiejneprodukter kan miste fortrydelsesretten, hvis forseglingen er brudt. Personlige korttekster, specialpakkede gaveæsker eller varer, der er fremstillet eller tilpasset efter dine specifikke ønsker, kan være undtaget fra fortrydelsesretten."},
      {"title":"Reklamation","body":"Købelovens regler om mangler gælder. Kontakt Greenplanet hurtigst muligt, hvis en vare er beskadiget, forkert eller mangelfuld. Send ordrenummer, beskrivelse og gerne billeder, så vi kan vurdere sagen og finde en løsning."},
      {"title":"Klageadgang","body":"Hvis vi ikke finder en løsning, kan du klage til Nævnenes Hus, Toldboden 2, 8800 Viborg, via naevneneshus.dk. EU-Kommissionens online klageportal kan også anvendes ved køb på tværs af EU."}
    ]'::jsonb
  ),
  (
    'privacy',
    'Privatlivspolitik',
    'Jura',
    'Vi behandler personoplysninger for at kunne håndtere bestillinger, levering, kundeservice og drift af webshoppen.',
    '[
      {"title":"Dataansvarlig","body":"Greenplanet, CVR 44640376, Bøgevejen 6, 2850 Nærum, e-mail hello@greenplanet.dk, er dataansvarlig for behandlingen af personoplysninger på webshoppen."},
      {"title":"Hvilke oplysninger vi behandler","body":"Vi kan behandle navn, e-mail, telefonnummer, fakturaadresse, leveringsadresse, modtagernavn, korttekst, ordreindhold, betalingsstatus og eventuelle leveringsnoter."},
      {"title":"Formål og grundlag","body":"Oplysninger bruges til at behandle bestillinger, pakke og levere gaver, sende ordrebekræftelser, yde kundeservice, håndtere reklamationer og opfylde bogførings- og dokumentationskrav. Behandlingen sker blandt andet for at kunne opfylde en aftale, overholde retlige forpligtelser og varetage Greenplanets legitime interesse i drift og kundeservice."},
      {"title":"Modtageroplysninger","body":"Hvis du sender en gave direkte til en anden person, behandler vi modtagerens navn, adresse og eventuelle leveringsnoter for at kunne levere gaven. Skriv ikke følsomme oplysninger i korttekst eller leveringsnote."},
      {"title":"Deling","body":"Nødvendige oplysninger kan deles med fragtleverandører, betalingsudbydere, regnskabssystemer, hostingudbydere og tekniske leverandører, der hjælper med drift af webshoppen. Leverandører må kun behandle oplysninger efter aftale og til de relevante formål."},
      {"title":"Opbevaring","body":"Oplysninger opbevares kun så længe det er nødvendigt for formålet eller påkrævet efter lovgivning. Regnskabsoplysninger opbevares som udgangspunkt i 5 år efter bogføringsreglerne."},
      {"title":"Dine rettigheder","body":"Du kan kontakte Greenplanet for at anmode om indsigt, rettelse, sletning, begrænsning, dataportabilitet eller indsigelse, når betingelserne for det er opfyldt. Du kan også klage til Datatilsynet via datatilsynet.dk."}
    ]'::jsonb
  ),
  (
    'cookies',
    'Cookiepolitik',
    'Jura',
    'Cookiepolitikken beskriver, hvordan Greenplanet kan bruge cookies og lignende teknologier på webshoppen.',
    '[
      {"title":"Hvad er cookies?","body":"Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De kan bruges til at få siden til at fungere, huske valg eller måle brug af siden."},
      {"title":"Nødvendige cookies","body":"Greenplanet kan bruge nødvendige cookies og lokal lagring til grundlæggende funktioner som kurv, checkout, sikkerhed og teknisk drift. Disse er nødvendige for, at webshoppen kan fungere."},
      {"title":"Statistik og analyse","body":"Hvis Greenplanet bruger statistik- eller analyseværktøjer, sker det for at forstå besøg, populære produkter og tekniske fejl. Ikke-nødvendige cookies bruges kun, når det relevante samtykke er indhentet."},
      {"title":"Marketing","body":"Marketingcookies bruges kun, hvis Greenplanet senere tilføjer annoncering, tracking eller sociale medier-integrationer, og kun efter relevant samtykke."},
      {"title":"Ændring af samtykke","body":"Du skal kunne ændre eller trække dit samtykke tilbage igen, hvis der bruges samtykkekrævende cookies. Nødvendige cookies kan normalt ikke fravælges, fordi de får siden til at fungere."}
    ]'::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  intro = excluded.intro,
  sections = excluded.sections;
