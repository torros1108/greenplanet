export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  status?: "live" | "draft" | "archived";
};

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  tags: string[];
  description: string;
  cost: number;
  price: number;
  stock: number;
  sku: string;
  image?: string;
  variants?: ProductVariant[];
  giftbox: boolean;
  occasions: string[];
  shape: "jar" | "box" | "pouch" | "bottle";
  status: "Live" | "Kladde";
};

export type Giftbox = {
  id: string;
  title: string;
  category: string;
  description: string;
  productIds: string[];
  note: string;
  recipient: string;
  occasion: string;
  packing: string;
  cardText: string;
  delivery: string;
  why: string;
  details: string[];
};

export const initialProducts: Product[] = [
  { id: "p1", title: "Linen baby sleeper", brand: "Babyly", category: "Baby & barsel", tags: ["baby", "linen", "barsel"], description: "Blød babysleeper i hor til en rolig barselsgave.", cost: 345.34, price: 690.69, stock: 4, sku: "BABYLY-SLEEPER", variants: [{ id: "p1-beige", title: "Beige", sku: "BABYLY-SLEEPER-BEIGE", price: 690.69, stock: 2, image: "https://cdn.faire.com/fastly/0a4b47c9202f6e86eb7fc4f9ac12be65afbd26a83c5ea8198f5fc3227639fa68.jpeg", status: "live" }, { id: "p1-powder-pink", title: "Powder pink", sku: "BABYLY-SLEEPER-POWDER-PINK", price: 690.69, stock: 2, image: "https://cdn.faire.com/fastly/837c12049e4bb36794e1ad0c0b5ff97dd79531a1441aaefd9b9ae7c28e3d7313.jpeg", status: "live" }], image: "https://cdn.faire.com/fastly/0a4b47c9202f6e86eb7fc4f9ac12be65afbd26a83c5ea8198f5fc3227639fa68.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "box", status: "Live" },
  { id: "p2", title: "Linen babynest", brand: "Babyly", category: "Baby & barsel", tags: ["baby", "babynest"], description: "Blødt babynest i hør til barselsgaver og den første tid.", cost: 407.93, price: 815.86, stock: 2, sku: "BABYLY-NEST", variants: [{ id: "p2-beige", title: "Beige", sku: "BABYLY-NEST-BEIGE", price: 815.86, stock: 1, image: "https://cdn.faire.com/fastly/81b057e82552add927d1a2040ad353dbb3c89a2244af930cc0dd7a12b7f2137c.jpeg", status: "live" }, { id: "p2-sea-blue", title: "Sea blue", sku: "BABYLY-NEST-SEA-BLUE", price: 815.86, stock: 1, image: "https://cdn.faire.com/fastly/a3d7ad0eb4bf89e3a8c07f054dfae3a23b800c4e22cdecc691e8e7c4d9b5376b.jpeg", status: "live" }, { id: "p2-forest-green", title: "Forest green", sku: "BABYLY-NEST-FOREST-GREEN", price: 815.86, stock: 0, image: "https://cdn.faire.com/fastly/820d1a649bbd4de36c678921bb5b73636a7b1177b0cd04bec78bd0b39f0950a8.jpeg", status: "live" }], image: "https://cdn.faire.com/fastly/81b057e82552add927d1a2040ad353dbb3c89a2244af930cc0dd7a12b7f2137c.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "box", status: "Live" },
  { id: "p3", title: "Dear Baby Skin Care Kit", brand: "SoKind", category: "Baby & barsel", tags: ["babypleje", "hudpleje"], description: "Komplet hudplejekit til baby og nybagte forældre.", cost: 284.48, price: 536.75, stock: 5, sku: "5745000074006", image: "https://cdn.faire.com/fastly/bd8a91f05ae745117431e43cfe5ca6a371cc1f4fce212ef45cb89f6814745ed9.jpeg", giftbox: true, occasions: ["Barsel", "Ny mor"], shape: "bottle", status: "Live" },
  { id: "p4", title: "Belly Sheet Masks", brand: "SoKind", category: "Baby & barsel", tags: ["graviditet", "wellness"], description: "Nærende belly sheet masks til graviditets- og barselsgaver.", cost: 138.16, price: 276.32, stock: 12, sku: "5745000074082", image: "https://cdn.faire.com/fastly/d37349ca6195cddcbf7b0302881802dbee0521bdb8a05e422117f7b63d55c327.jpeg", giftbox: true, occasions: ["Ny mor", "Rolig weekend"], shape: "pouch", status: "Live" },
  { id: "p5", title: "Baby Shampoo & Body Wash", brand: "SoKind", category: "Baby & barsel", tags: ["babypleje", "bad"], description: "Mild shampoo og body wash til baby.", cost: 96.91, price: 193.83, stock: 8, sku: "5745000074020", image: "https://cdn.faire.com/fastly/636f7f3928bd59c52789bcfa73fd1d37dbc5d769617a2d6fec57cef2d6303d35.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "bottle", status: "Live" },
  { id: "p6", title: "Organic Cuddly Rabbit White", brand: "Summerville organic", category: "Baby & barsel", tags: ["kanin", "baby", "gave"], description: "Økologisk cuddly rabbit i hvid.", cost: 66.34, price: 148.33, stock: 2, sku: "680001", image: "https://cdn.faire.com/fastly/c360dff72332ad9e4cafd748a5960597043b7794a3c54ce6370d89a83f147a94.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "jar", status: "Live" },
  { id: "p7", title: "Organic Cuddly Rabbit Ice Blue", brand: "Summerville organic", category: "Baby & barsel", tags: ["kanin", "baby", "gave"], description: "Økologisk cuddly rabbit i ice blue.", cost: 66.34, price: 148.33, stock: 2, sku: "680007", image: "https://cdn.faire.com/fastly/c11015db21acc7ed1384994bb6501accc7d13c750238e10ec46c5e0b5bb14999.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "jar", status: "Live" },
  { id: "p8", title: "Hooded Baby Towel White", brand: "Summerville organic", category: "Baby & barsel", tags: ["håndklæde", "baby"], description: "Økologisk babyhåndklæde med hætte i hvid.", cost: 67.09, price: 170.7, stock: 2, sku: "600825", image: "https://cdn.faire.com/fastly/2945f340f3ecc013ede8569292ea50c3423f2c7da14e8ff062c93fed8e57ae56.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "box", status: "Live" },
  { id: "p9", title: "Hooded Baby Towel Rabbit Pink", brand: "Summerville organic", category: "Baby & barsel", tags: ["håndklæde", "baby"], description: "Økologisk babyhåndklæde med kanin-detalje i pink.", cost: 87.96, price: 207.97, stock: 2, sku: "600882", image: "https://cdn.faire.com/fastly/b8cd0ea17ef4435d3572b690f02ff8ba20ea2224604fda66cdb2df5684dacb89.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "box", status: "Live" },
  { id: "p10", title: "Hooded Baby Towel Rabbit Grey", brand: "Summerville organic", category: "Baby & barsel", tags: ["håndklæde", "baby"], description: "Økologisk babyhåndklæde med kanin-detalje i grå.", cost: 87.96, price: 207.97, stock: 2, sku: "600879", image: "https://cdn.faire.com/fastly/95f5cd5ac72e9298312585ebc8eab2306fdb06cc4f0e3b614205c600dadb8358.jpeg", giftbox: true, occasions: ["Barsel", "Baby gave"], shape: "box", status: "Live" },
  { id: "p11", title: "Franse Roze Klei", brand: "More", category: "Naturlig beauty", tags: ["klei", "wellness"], description: "100% naturlig fransk rosa ler til wellness-æsker.", cost: 49.58, price: 118.91, stock: 2, sku: "7442956129115", image: "https://cdn.faire.com/fastly/4c3ce9eb94878f5e25df6f9e40ddf14abd1bd592dff1df26a3d1021086d66d6a.jpeg", giftbox: true, occasions: ["Wellness", "Rolig weekend"], shape: "jar", status: "Live" },
  { id: "p12", title: "Marokkaanse Ghassoul Kleipoeder", brand: "More", category: "Naturlig beauty", tags: ["ghassoul", "wellness"], description: "100% naturlig ghassoul lerpulver.", cost: 49.58, price: 118.91, stock: 2, sku: "7442956129139", image: "https://cdn.faire.com/fastly/98491dad59eb608744f9aea983f7feeaf86a2ffb51519ecd3ab6b0b23e1238b4.jpeg", giftbox: true, occasions: ["Wellness", "Rolig weekend"], shape: "jar", status: "Live" },
  { id: "p13", title: "Bulgaarse rozenwater", brand: "More", category: "Naturlig beauty", tags: ["rosenvand", "beauty"], description: "Økologisk bulgarsk rosenvand til ansigt og hudpleje.", cost: 52.63, price: 133.82, stock: 2, sku: "8719327521557", image: "https://cdn.faire.com/fastly/86c6e142f2bc3d341345044ab2d8947dbe3cfed709927713b5abaa122da6abab.jpeg", giftbox: true, occasions: ["Wellness", "Ny mor"], shape: "bottle", status: "Live" },
  { id: "p14", title: "Arganolie", brand: "More", category: "Naturlig beauty", tags: ["olie", "beauty"], description: "Økologisk og koldpresset arganolie.", cost: 61.95, price: 148.73, stock: 2, sku: "1", image: "https://cdn.faire.com/fastly/c1647a7becd367e3a9a01783053a3d3e20edeb286cb7ee5d3bb3d7ca5b937868.jpeg", giftbox: true, occasions: ["Wellness", "Rolig weekend"], shape: "bottle", status: "Live" },
  { id: "p15", title: "Rosehip olie", brand: "More", category: "Naturlig beauty", tags: ["olie", "beauty"], description: "Økologisk og koldpresset rosehip olie.", cost: 71.27, price: 171.09, stock: 2, sku: "8720299095168", image: "https://cdn.faire.com/fastly/0ae6cc5fc64666b88bd818d984c3c92702695f39d2d69b520ce0f0b2ffa164cd.jpeg", giftbox: true, occasions: ["Wellness", "Ny mor"], shape: "bottle", status: "Live" },
  { id: "p16", title: "Jojoba Olie", brand: "More", category: "Naturlig beauty", tags: ["olie", "beauty"], description: "Økologisk og koldpresset jojobaolie.", cost: 76.26, price: 186, stock: 2, sku: "8720299095137", image: "https://cdn.faire.com/fastly/9433451c7afbdc5e0a362368282f6decc233b05183e8f693f0402e1ae1ded286.jpeg", giftbox: true, occasions: ["Wellness", "Rolig weekend"], shape: "bottle", status: "Live" }
];

export const giftboxes: Giftbox[] = [
  {
    id: "g1",
    title: "Ny Mor Ro",
    category: "Ny mor",
    description: "En gave med blid hudpleje til den gravide eller nybagte mor.",
    productIds: ["p4", "p13", "p15"],
    note: "Belly masks, rosenvand og rosehip olie.",
    recipient: "Til den gravide eller nybagte mor, der fortjener en lille pause.",
    occasion: "Barsel, babyshower, mors dag eller en omsorgsfuld hilsen.",
    packing: "Pakkes i Greenplanet gaveæske med silkepapir, roligt udtryk og mulighed for personlig hilsen.",
    cardText: "Skriv en kort hilsen ved checkout, så lægger vi den ved i æsken.",
    delivery: "Kan sendes direkte til modtageren eller til dig, hvis du selv vil overrække gaven.",
    why: "Æsken samler blid kropspleje og små pauser, som kan bruges uden at kræve meget tid eller overskud.",
    details: ["3 produkter", "Personligt kort kan tilføjes", "Velegnet til direkte gavelevering", "Naturlig beauty og barselsro"]
  },
  {
    id: "g2",
    title: "Baby First Care",
    category: "Barsel",
    description: "Blid babypleje og en lille økologisk ven til den forste gave.",
    productIds: ["p3", "p5", "p6"],
    note: "SoKind plejekit, baby wash og cuddly rabbit.",
    recipient: "Til nybagte forældre, der gerne vil have en praktisk og smuk startpakke.",
    occasion: "Barselsbesøg, firmagave, babyshower eller velkommen-til-verden gave.",
    packing: "Pakkes som en rolig barselsæske med babypleje for sig og tekstilproduktet synligt i toppen.",
    cardText: "Mulighed for personlig hilsen, fx fra kollegaer, familie eller vennegruppe.",
    delivery: "Egnet til levering direkte til familien, og nem at sende som samlet gave.",
    why: "Kombinationen af plejeprodukt og lille blød gave gør æsken både brugbar og personlig.",
    details: ["3 produkter", "Blid babypleje", "Lille økologisk gave", "God som første barselsgave"]
  },
  {
    id: "g3",
    title: "Økologisk Babybad",
    category: "Baby gave",
    description: "Alt til et blødt babybad samlet i en gaveæske.",
    productIds: ["p8", "p5", "p7"],
    note: "Hooded towel, baby wash og cuddly rabbit.",
    recipient: "Til baby og forældre, der kan bruge en praktisk gave med lidt luksus i hverdagen.",
    occasion: "Barsel, dåb, babyshower eller en lille hverdagsgave.",
    packing: "Håndklæde, baby wash og lille ven pakkes sammen, så æsken føles komplet ved udpakning.",
    cardText: "Tilføj korttekst ved checkout, hvis gaven skal sendes direkte.",
    delivery: "Kan pakkes som gavelevering med kort og uden prisbilag.",
    why: "Æsken rammer noget forældre faktisk bruger, men stadig med en gavefølelse.",
    details: ["3 produkter", "Babybad-tema", "Praktisk og gaveegnet", "Kan sendes direkte"]
  },
  {
    id: "g4",
    title: "Premium Barsel",
    category: "Premium",
    description: "En større barselsgave med Babyly, SoKind og Summerville organic.",
    productIds: ["p1", "p3", "p10"],
    note: "Til familie, fællesgave eller firmagave.",
    recipient: "Til den lidt større barselsgave, hvor flere går sammen om noget ordentligt.",
    occasion: "Firmagave, fællesgave, barsel eller en særlig velkommen-til-verden gave.",
    packing: "Pakkes som premium-æske med tekstil, pleje og babyprodukt tydeligt opdelt.",
    cardText: "Plads til en længere hilsen fra team, familie eller vennegruppe.",
    delivery: "Velegnet til direkte levering til hjemmet eller arbejdspladsen.",
    why: "Den kombinerer en højere gaveværdi med produkter, der både er pæne og praktiske.",
    details: ["3 produkter", "Premium barselsgave", "God til fællesgave", "Mulighed for længere hilsen"]
  },
  {
    id: "g5",
    title: "Rolig Weekend",
    category: "Wellness",
    description: "Naturlig beauty til en langsom weekend og lidt selvforkælelse.",
    productIds: ["p11", "p13", "p14", "p16"],
    note: "Ler, rosenvand og økologiske olier fra More.",
    recipient: "Til hende, der elsker naturlig beauty, hjemme-spa og lidt tid for sig selv.",
    occasion: "Fødselsdag, venindegave, tak-for-hjælpen eller selvforkælelse.",
    packing: "Pakkes med beautyprodukterne samlet som en lille hjemme-spa gave.",
    cardText: "Korttekst kan tilføjes, så gaven føles personlig selv ved direkte levering.",
    delivery: "Kan sendes direkte til modtager eller bestilles hjem til egen overrækkelse.",
    why: "Æsken fungerer som en samlet wellness-gave frem for enkeltprodukter, der bare ligger ved siden af hinanden.",
    details: ["4 produkter", "Naturlig beauty", "Hjemme-spa følelse", "God til venindegaver"]
  }
];

export function productSpecs(product: Product) {
  const shared = [
    { label: "Brand", value: product.brand },
    { label: "Gaveegnet", value: product.giftbox ? "Ja, passer i gaveæske" : "Bedst som enkeltprodukt" },
    { label: "Anledning", value: product.occasions.join(", ") }
  ];

  const byProduct: Record<string, { label: string; value: string }[]> = {
    p1: [
      { label: "Produkttype", value: "Babysleeper" },
      { label: "Materiale", value: "100% linen/hør" },
      { label: "Fyld", value: "Silikonefyld med OekoTex Standard 100 certifikat" },
      { label: "Størrelse", value: "36 x 78 cm (+/- 2 cm)" },
      { label: "Farver", value: "Beige / powder pink" },
      { label: "Brug", value: "Baby wrap, sovepose, første bedding eller barnevognspose" },
      { label: "Produktion", value: "Håndlavet i Krakow" }
    ],
    p2: [
      { label: "Produkttype", value: "Babynest" },
      { label: "Materiale", value: "100% soften linen/hør" },
      { label: "Fyld", value: "Ball filling og foam mattress med OekoTex Standard 100 certifikat" },
      { label: "Indvendige mål", value: "Baby size: 34 x 67 cm" },
      { label: "Farver", value: "Beige / sea blue / forest green" },
      { label: "Brug", value: "Baby crib, forældreseng, Moses basket, sofa eller terrasse" }
    ],
    p3: [
      { label: "Produkttype", value: "Baby hudplejekit" },
      { label: "Indhold", value: "4 head-to-toe produkter til babyhud" },
      { label: "Ingredienser", value: "Avocado-, almond-, wheat- og jojobaolie" },
      { label: "Certificering", value: "AllergyCertified" },
      { label: "Uden", value: "Parfume og fragrance" },
      { label: "Emballage", value: "Leveres i FSC-godkendt baby suitcase" },
      { label: "Brug", value: "Nærer, beskytter og holder babyhuden fugtet og blød" }
    ],
    p4: [
      { label: "Produkttype", value: "Belly sheet masks" },
      { label: "Område", value: "Mave og graviditetspleje" },
      { label: "Indhold", value: "4 nourishing belly sheet masks" },
      { label: "Nøgleingredienser", value: "Aloe vera, coconut extract og cucumber" },
      { label: "Ingredienser", value: "Aqua, glycerin, lactobacillus ferment, aloe, cucumber, sorbitol m.fl." },
      { label: "Certificering", value: "AllergyCertified" },
      { label: "Uden", value: "Parfume og fragrance" },
      { label: "Brug", value: "Fugt og kølende pleje til gravid mave og efter graviditet" }
    ],
    p5: [
      { label: "Produkttype", value: "Baby shampoo og body wash" },
      { label: "Indhold", value: "Blød skummende shampoo og body soap" },
      { label: "Nøgleingredienser", value: "Oat, jojoba oil og aloe vera" },
      { label: "Ingredienser", value: "Aqua, coco-glucoside, glycerin, aloe, oat extract, almond oil m.fl." },
      { label: "Rens", value: "Naturlig detergent fra coconut, udviklet til ikke at svie i øjnene" },
      { label: "Certificering", value: "AllergyCertified" },
      { label: "Uden", value: "Parfume og fragrance" }
    ],
    p6: [
      { label: "Produkttype", value: "Cuddly rabbit" },
      { label: "Materiale", value: "100% organic cotton" },
      { label: "Fyld", value: "Rabbit head med 100% recycled polyester filling" },
      { label: "Størrelse", value: "Ca. 47 x 30 cm" },
      { label: "Farve", value: "White" },
      { label: "Vask", value: "40 grader" },
      { label: "Certificering", value: "GOTS-certified product (Ceres-0497)" }
    ],
    p7: [
      { label: "Produkttype", value: "Cuddly rabbit" },
      { label: "Materiale", value: "100% organic cotton" },
      { label: "Fyld", value: "Rabbit head med 100% recycled polyester filling" },
      { label: "Størrelse", value: "Ca. 47 x 30 cm" },
      { label: "Farve", value: "Ice blue" },
      { label: "Vask", value: "40 grader" },
      { label: "Certificering", value: "GOTS-certified product (Ceres-0497)" }
    ],
    p8: [
      { label: "Produkttype", value: "Babyhåndklæde med hætte" },
      { label: "Materiale", value: "100% organic cotton" },
      { label: "Størrelse", value: "75 x 75 cm" },
      { label: "Farve", value: "White" },
      { label: "Vask", value: "40 eller 60 grader" },
      { label: "Detalje", value: "Hanger på bagsiden" },
      { label: "Certificering", value: "GOTS-certified product" }
    ],
    p9: [
      { label: "Produkttype", value: "Babyhåndklæde med hætte" },
      { label: "Materiale", value: "100% organic cotton" },
      { label: "Størrelse", value: "75 x 75 cm" },
      { label: "Farve", value: "Rabbit pink" },
      { label: "Vask", value: "40 eller 60 grader" },
      { label: "Detalje", value: "Hætte med kaninører" },
      { label: "Certificering", value: "GOTS-certified product" }
    ],
    p10: [
      { label: "Produkttype", value: "Babyhåndklæde med hætte" },
      { label: "Materiale", value: "100% certified organic cotton terry" },
      { label: "Størrelse", value: "75 x 75 cm" },
      { label: "Farve", value: "Rabbit grey" },
      { label: "Vask", value: "40 eller 60 grader" },
      { label: "Detalje", value: "Hætte med kaninører og hanger på bagsiden" },
      { label: "Certificering", value: "GOTS-certified product" }
    ],
    p11: [
      { label: "Produkttype", value: "Rosa ler" },
      { label: "Størrelse", value: "50 GR" },
      { label: "Indhold", value: "Franse roze klei" },
      { label: "INCI", value: "Pink clay" },
      { label: "Hudtype", value: "Mild ler til følsom hud" },
      { label: "Brug", value: "Bland 1-2 spsk. ler med rozenwater/hydrosol, lad virke ca. 15 min." },
      { label: "Profil", value: "100% naturlig beauty" }
    ],
    p12: [
      { label: "Produkttype", value: "Ghassoul lerpulver" },
      { label: "Størrelse", value: "50 GR" },
      { label: "Indhold", value: "Marokkansk ghassoul" },
      { label: "Brug", value: "Hudpleje, maske og selvforkælelse" },
      { label: "Profil", value: "100% naturlig beauty" }
    ],
    p13: [
      { label: "Produkttype", value: "Rosenvand" },
      { label: "Størrelse", value: "50 ML" },
      { label: "Indhold", value: "Bulgarsk rozenwater" },
      { label: "Brug", value: "Toner, opfriskning og hudpleje" },
      { label: "Hudtype", value: "Mildt produkt, egnet til alle hudtyper" },
      { label: "Profil", value: "100% biologisk/økologisk" }
    ],
    p14: [
      { label: "Produkttype", value: "Arganolie" },
      { label: "Størrelse", value: "30 ML" },
      { label: "Indhold", value: "Marokkansk arganolie" },
      { label: "Profil", value: "100% naturlig, biologisk og koldpresset olie" },
      { label: "Brug", value: "Ansigt, hud, hår og negle" },
      { label: "Egenskab", value: "Rig på vitamin E og antioxidanter" }
    ],
    p15: [
      { label: "Produkttype", value: "Rosehip olie" },
      { label: "Størrelse", value: "30 ML" },
      { label: "Indhold", value: "Koldpresset rosehip/rozenbottel olie" },
      { label: "Profil", value: "Uraffineret olie med omega 3, omega 6 og pro-vitamin A" },
      { label: "Brug", value: "Ansigtspleje, glød og pigment-/ar-pleje" },
      { label: "Duft", value: "Jordet og varm duft, let chokoladeagtig" }
    ],
    p16: [
      { label: "Produkttype", value: "Jojobaolie" },
      { label: "Størrelse", value: "50 ML" },
      { label: "Indhold", value: "Jojoba olie" },
      { label: "Profil", value: "100% naturlig, biologisk og koldpresset olie" },
      { label: "Hudtype", value: "Velegnet til alle hudtyper" },
      { label: "Brug", value: "Balancering, fugt, ro og hudpleje til sensitiv hud" }
    ]
  };

  return [...(byProduct[product.id] || []), ...shared];
}
