alter table public.products
add column if not exists specs jsonb default '[]'::jsonb not null;

with product_copy(legacy_id, description, specs) as (
  values
  (
    'p1',
    $$Blød babysleeper i hør, der kan bruges som svøb, sovepose, første sengetøj eller i barnevognen. Den omslutter babyen nænsomt, holder på varmen og giver en tryg fornemmelse i den første tid. Produktet er håndsyet og fyldt med certificeret silikonefyld.$$,
    $$[
      {"label":"Produkttype","value":"Babysleeper / wrap sleeping sack"},
      {"label":"Materiale","value":"100% hør"},
      {"label":"Fyld","value":"Silikonefyld med OekoTex Standard 100-certifikat"},
      {"label":"Størrelse","value":"36 x 78 cm (+/- 2 cm)"},
      {"label":"Farver","value":"Beige / powder pink"},
      {"label":"Produktion","value":"Håndsyet i Krakow"}
    ]$$::jsonb
  ),
  (
    'p2',
    $$Babynest i blød hør, der kan bruges i tremmeseng, forældreseng, Moses basket, sofa eller på terrassen under opsyn. Det giver babyen en afgrænset og velkendt plads, og kan åbnes op, så det kan bruges i længere tid. En stor og praktisk barselsgave.$$,
    $$[
      {"label":"Produkttype","value":"Babynest"},
      {"label":"Materiale","value":"100% blødgjort hør"},
      {"label":"Fyld","value":"Kuglefyld og skummadras med OekoTex Standard 100-certifikat"},
      {"label":"Indvendige mål","value":"Ca. 34 x 67 cm"},
      {"label":"Farver","value":"Beige / sea blue / forest green"},
      {"label":"Brug","value":"Seng, sofa, Moses basket eller tryg hvileplads under opsyn"}
    ]$$::jsonb
  ),
  (
    'p3',
    $$Hudplejekit med fire produkter til babyens sarte hud. Produkterne er baseret på naturlige ingredienser som avocado-, mandel-, hvede- og jojobaolie, der plejer, beskytter og holder huden blød. Leveres i en FSC-godkendt lille kuffert, som også kan bruges til opbevaring.$$,
    $$[
      {"label":"Produkttype","value":"Baby hudplejekit"},
      {"label":"Indhold","value":"4 head-to-toe produkter"},
      {"label":"Nøgleingredienser","value":"Avocado-, mandel-, hvede- og jojobaolie"},
      {"label":"Certificering","value":"AllergyCertified"},
      {"label":"Uden","value":"Parfume og fragrance"},
      {"label":"Emballage","value":"FSC-godkendt baby suitcase"}
    ]$$::jsonb
  ),
  (
    'p4',
    $$Belly sheet masks til maven under graviditet og efter fødsel. Maskerne giver fugt og en kølende fornemmelse til hud, der føles stram, tør eller kløende. Formlen er uden parfume og baseret på blandt andet aloe vera, kokos-ekstrakt og agurk.$$,
    $$[
      {"label":"Produkttype","value":"Belly sheet masks"},
      {"label":"Indhold","value":"4 nourishing belly sheet masks"},
      {"label":"Nøgleingredienser","value":"Aloe vera, kokos-ekstrakt og agurk"},
      {"label":"Certificering","value":"AllergyCertified"},
      {"label":"Uden","value":"Parfume og fragrance"},
      {"label":"Brug","value":"Fugt og kølende pleje til gravid mave og efter graviditet"}
    ]$$::jsonb
  ),
  (
    'p5',
    $$Mild babyshampoo og body wash med blødt skum til både hud og hår. Formlen indeholder plejende olier fra havre og jojoba samt aloe vera, og den naturlige detergent fra kokos er udviklet til ikke at svie i øjnene. Et godt hverdagsprodukt til babybadet.$$,
    $$[
      {"label":"Produkttype","value":"Baby shampoo og body wash"},
      {"label":"Nøgleingredienser","value":"Havre, jojobaolie og aloe vera"},
      {"label":"Rens","value":"Naturlig detergent fra kokos"},
      {"label":"Certificering","value":"AllergyCertified"},
      {"label":"Uden","value":"Parfume og fragrance"},
      {"label":"Brug","value":"Mild rens til babyens hud og hår"}
    ]$$::jsonb
  ),
  (
    'p6',
    $$Blød økologisk nussekanin i hvid, der både kan være putteven og lille legeven. De lange ører og knuderne er nemme for små hænder at gribe fat i. Fremstillet i økologisk bomuld med fyld af genanvendt polyester.$$,
    $$[
      {"label":"Produkttype","value":"Nussekanin"},
      {"label":"Materiale","value":"100% økologisk bomuld"},
      {"label":"Fyld","value":"Kaninens hoved har 100% genanvendt polyesterfyld"},
      {"label":"Størrelse","value":"Ca. 47 x 30 cm"},
      {"label":"Farve","value":"White"},
      {"label":"Vask","value":"40 grader"},
      {"label":"Certificering","value":"GOTS-certificeret produkt"}
    ]$$::jsonb
  ),
  (
    'p7',
    $$Blød økologisk nussekanin i ice blue, der både kan være putteven og lille legeven. De lange ører og knuderne er nemme for små hænder at gribe fat i. Fremstillet i økologisk bomuld med fyld af genanvendt polyester.$$,
    $$[
      {"label":"Produkttype","value":"Nussekanin"},
      {"label":"Materiale","value":"100% økologisk bomuld"},
      {"label":"Fyld","value":"Kaninens hoved har 100% genanvendt polyesterfyld"},
      {"label":"Størrelse","value":"Ca. 47 x 30 cm"},
      {"label":"Farve","value":"Ice blue"},
      {"label":"Vask","value":"40 grader"},
      {"label":"Certificering","value":"GOTS-certificeret produkt"}
    ]$$::jsonb
  ),
  (
    'p8',
    $$Blødt hættehåndklæde i 100% økologisk bomuld til babyens sensitive hud. Godt efter badet, hvor hætten hjælper med at holde babyen varm. Håndklædet har ophæng på bagsiden, så det er nemt at hænge op efter brug.$$,
    $$[
      {"label":"Produkttype","value":"Babyhåndklæde med hætte"},
      {"label":"Materiale","value":"100% økologisk bomuld"},
      {"label":"Størrelse","value":"75 x 75 cm"},
      {"label":"Farve","value":"White"},
      {"label":"Vask","value":"40 eller 60 grader"},
      {"label":"Detalje","value":"Ophæng på bagsiden"},
      {"label":"Certificering","value":"GOTS-certificeret produkt"}
    ]$$::jsonb
  ),
  (
    'p9',
    $$Blødt hættehåndklæde i økologisk bomuld med fine kaninører. Håndklædet er velegnet efter badet og har en praktisk størrelse, der kan bruges til både baby og mindre børn. En sød og brugbar barselsgave.$$,
    $$[
      {"label":"Produkttype","value":"Babyhåndklæde med hætte"},
      {"label":"Materiale","value":"100% økologisk bomuld"},
      {"label":"Størrelse","value":"75 x 75 cm"},
      {"label":"Farve","value":"Rabbit pink"},
      {"label":"Vask","value":"40 eller 60 grader"},
      {"label":"Detalje","value":"Hætte med kaninører"},
      {"label":"Certificering","value":"GOTS-certificeret produkt"}
    ]$$::jsonb
  ),
  (
    'p10',
    $$Lækkert babyhåndklæde i certificeret økologisk bomuldsterry med hætte og kaninører. Den gode størrelse gør det nemt at svøbe babyen efter badet, og ophænget på bagsiden gør håndklædet praktisk i hverdagen.$$,
    $$[
      {"label":"Produkttype","value":"Babyhåndklæde med hætte"},
      {"label":"Materiale","value":"100% certificeret økologisk bomuldsterry"},
      {"label":"Størrelse","value":"75 x 75 cm"},
      {"label":"Farve","value":"Rabbit grey"},
      {"label":"Vask","value":"40 eller 60 grader"},
      {"label":"Detalje","value":"Hætte med kaninører og ophæng"},
      {"label":"Certificering","value":"GOTS-certificeret produkt"}
    ]$$::jsonb
  ),
  (
    'p11',
    $$Fransk rosa ler er en mild blanding af rød og hvid ler. Den er god til sensitiv hud, fordi den renser og absorberer uden at efterlade huden stram. Kan bruges som ansigtsmaske sammen med rosenvand eller anden hydrosol.$$,
    $$[
      {"label":"Produkttype","value":"Rosa ler"},
      {"label":"Størrelse","value":"50 g"},
      {"label":"Indhold","value":"Fransk rosa ler"},
      {"label":"INCI","value":"Pink clay"},
      {"label":"Hudtype","value":"Særligt velegnet til sensitiv hud"},
      {"label":"Brug","value":"Bland 1-2 spsk. ler med rosenvand, lad virke ca. 15 min."},
      {"label":"Profil","value":"100% naturlig beauty"}
    ]$$::jsonb
  ),
  (
    'p12',
    $$Marokkansk ghassoul lerpulver med mild og rensende virkning. Lerets mineraler gør det velegnet til ansigtsmaske og selvforkælelse, og det kan også bruges til hårpleje. En enkel wellness-vare til gaveæsker.$$,
    $$[
      {"label":"Produkttype","value":"Ghassoul lerpulver"},
      {"label":"Størrelse","value":"50 g"},
      {"label":"Indhold","value":"Marokkansk ghassoul"},
      {"label":"Mineraler","value":"Silica, calcium, natrium og magnesium"},
      {"label":"Hudtype","value":"Velegnet til de fleste hudtyper"},
      {"label":"Brug","value":"Ansigtsmaske, rens og selvforkælelse"}
    ]$$::jsonb
  ),
  (
    'p13',
    $$Økologisk bulgarsk rosenvand, som kan bruges som toner, opfriskende mist eller sammen med ler til ansigtsmaske. Rosenvand virker mildt og beroligende og passer derfor godt i naturlige wellness- og barselsgaver.$$,
    $$[
      {"label":"Produkttype","value":"Rosenvand"},
      {"label":"Størrelse","value":"50 ml"},
      {"label":"Indhold","value":"Bulgarsk rosenvand"},
      {"label":"Brug","value":"Toner, mist, hudpleje eller blanding med ler"},
      {"label":"Hudtype","value":"Mildt produkt til alle hudtyper"},
      {"label":"Profil","value":"100% økologisk"}
    ]$$::jsonb
  ),
  (
    'p14',
    $$Økologisk og koldpresset arganolie fra Marokko. Olien kan bruges til ansigt, hud, hår og negle, og den er rig på E-vitamin og antioxidanter. En alsidig olie til naturlig pleje og selvforkælelse.$$,
    $$[
      {"label":"Produkttype","value":"Arganolie"},
      {"label":"Størrelse","value":"30 ml"},
      {"label":"Indhold","value":"Marokkansk arganolie"},
      {"label":"Profil","value":"100% naturlig, økologisk og koldpresset olie"},
      {"label":"Brug","value":"Ansigt, hud, hår og negle"},
      {"label":"Egenskab","value":"Rig på E-vitamin og antioxidanter"}
    ]$$::jsonb
  ),
  (
    'p15',
    $$Koldpresset rosehip olie, også kendt som rosenbottelolie. Olien er rig på omega 3, omega 6 og pro-vitamin A og bruges ofte i ansigtspleje, hvor man ønsker glød, fugt og pleje af hudens udtryk.$$,
    $$[
      {"label":"Produkttype","value":"Rosehip olie"},
      {"label":"Størrelse","value":"30 ml"},
      {"label":"Indhold","value":"Koldpresset rosehip / rosenbottelolie"},
      {"label":"Profil","value":"Uraffineret olie med omega 3, omega 6 og pro-vitamin A"},
      {"label":"Brug","value":"Ansigtspleje, glød og pleje af pigmentering eller ar"},
      {"label":"Duft","value":"Jordet og varm duft, let chokoladeagtig"}
    ]$$::jsonb
  ),
  (
    'p16',
    $$Økologisk og koldpresset jojobaolie, der kan bruges til både tør, sensitiv og fedtet hud. Olien minder om hudens naturlige sebum og kan derfor hjælpe med at fugte, beskytte og bringe huden i balance.$$,
    $$[
      {"label":"Produkttype","value":"Jojobaolie"},
      {"label":"Størrelse","value":"50 ml"},
      {"label":"Indhold","value":"Jojobaolie"},
      {"label":"Profil","value":"100% naturlig, økologisk og koldpresset olie"},
      {"label":"Hudtype","value":"Velegnet til alle hudtyper"},
      {"label":"Brug","value":"Balancering, fugt og pleje af sensitiv hud"}
    ]$$::jsonb
  )
)
update public.products as products
set
  description = product_copy.description,
  specs = product_copy.specs,
  updated_at = now()
from product_copy
where products.legacy_id = product_copy.legacy_id;
