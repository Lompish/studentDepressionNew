addMdToPage(`
  <br> 
  <br> 
  
  ### Depression bland kvinnor och män
  <br>
 
Diagrammet visar den procentuella fördelningen av depression mellan kvinnor och män. Här visas att kvinnor och män rapporterar nästan lika nivåer av depression, med en liten skillnad mellan de två grupperna. Procentandelarna representerar andelen av den totala populationen som är kvinnor respektive män och deras genomsnittliga depression i förhållande till hela studien.

  <br>

  Undersökningen visar att män och kvinnor nästan har lika nivåer av depression, där män rapporterar en genomsnittlig depression på 58.60% och kvinnor 58.41%. Den lilla skillnaden i genomsnittlig depression kan förklaras delvis genom att män är något fler än kvinnor i vårt urval, vilket kan ge en liten förskjutning i resultaten. Detta mönster är dock väldigt nära och understryker att kön inte är den största faktorn när det gäller depression i denna grupp, även om könsspecifika insatser kan vara värdefulla. 
  
  <br>
`);

// Genomsnittlig depression per kön.
let genderChartData = await dbQuery(`
  SELECT gender, AVG(depression) as avgDepression
  FROM studentDepression
  GROUP BY gender
`);

// Ersätt 'Male' och 'Female' med 'Män' och 'Kvinnor' i könsdatan.
genderChartData = genderChartData.map(row => ({
  ...row,
  gender: row.gender === 'Male' ? 'Män' : 'Kvinnor', // Ersätt värdena
  avgDepression: row.avgDepression * 100
}));

drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(genderChartData, 'Kön', 'Genomsnittlig depression (%)'),
  options: {
    title: 'Genomsnittlig depression per kön (%)',
    height: 400,
    slices: {
      0: { color: '#f1948a' }, // t.ex. Kvinna
      1: { color: '#5dade2' }  // t.ex. Man
    },
    tooltip: { text: 'percentage' }
  }
});

addMdToPage(`
  ---
  `)

addMdToPage(`
<br>

  ### Kost och hälsa

  <br>

 Kostvanor spelar också en roll. Studenter med ohälsosamma matvanor har i genomsnitt högre depression än de med balanserad kost. Detta stärker tidigare forskning som visar att näring påverkar hjärnans funktioner och välbefinnande.  
*En översikt från *NIH* visar att hälsosam kost är kopplad till lägre risk för depression, medan ohälsosamma matvanor ökar risken för psykisk ohälsa*. 
[Association Between Dietary Habits and Depression: A Systematic Review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9828042/).

  <br>
`);

// Kostvanor.
let dietData = await dbQuery(`
  SELECT dietaryHabits, AVG(depression) as avgDepression, COUNT(*) as antalStudenter
  FROM studentDepression
  GROUP BY dietaryHabits
`);

// Ersätt engelska kostvanor med svenska.
const dietaryTranslation = {
  'Healthy': 'Hälsosam',
  'Moderate': 'Måttlig',
  'Others': 'Annat',
  'Unhealthy': 'Ohälsosam',
};

dietData = dietData.map(row => ({
  ...row,
  dietaryHabits: dietaryTranslation[row.dietaryHabits] || row.dietaryHabits, // Översätt till svenska
  avgDepression: (row.avgDepression * 100).toFixed(1) + '%'
}));

tableFromData({
  data: dietData,
  columnNames: ['Kostvanor', 'Genomsnittlig depression (%)', 'Antal studenter']
});


addMdToPage(`
  ---
  `)


addMdToPage(`
  <br>

  ### Sömnens betydelse

  <br>

Sömn är en annan kritisk faktor. Analysen visar att kort sömn (under 4 timmar per natt) är starkt kopplat till förhöjd depression, med en genomsnittlig nivå på över 64 %. Intressant nog visar resultaten att studenter som sover mer än 8 timmar har de lägsta nivåerna av depression, vilket tyder på att tillräcklig vila kan ha en skyddande effekt på det psykiska välbefinnandet.  
*En omfattande metaanalys av över 50 studier visar att kort sömn (≤6 timmar) är associerad med en ökad risk för depression, medan längre sömn (≥9 timmar) inte visade någon signifikant koppling till depression*.  
[Association of sleep duration and risk of mental disorder](https://link.springer.com/article/10.1007/s11325-023-02905-1).

  <br>
`);

// Sömnlängd och depression i procent.
let dataForSleepChart = await dbQuery(`
  SELECT sleepDuration, AVG(depression) as avgDepression
  FROM studentDepression
  GROUP BY sleepDuration
`);

dataForSleepChart = dataForSleepChart.map(row => ({
  ...row,
  avgDepression: row.avgDepression * 100
}));

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(dataForSleepChart, 'Sömn per natt', 'Genomsnittlig depressionsnivå (%)'),
  options: {
    title: 'Samband mellan sömnlängd och depression (%)',
    height: 400,
    vAxis: { title: 'Depression (%)', minValue: 0, maxValue: 100 },
    hAxis: { title: 'Sömn per natt' },
    colors: ['#5dade2']
  }
});


addMdToPage(`
  ---
  `)

addMdToPage(`
  <br>

  ### Familjehistorik

  <br>

  Studenter med familjehistorik av psykisk ohälsa har i snitt högre depressionsnivåer än de utan sådan bakgrund. Detta visar att ärftlighet och familjemiljö är starka riskfaktorer, vilket understryker behovet av tidig upptäckt och förebyggande stöd.
  <br>

  *En svensk nationell studie visar att personer med en förälder som haft depression har en 2,68 gånger högre risk att själva utveckla depression jämfört med personer utan sådan familjehistorik*.  
[Age-specific familial risks of depression: a nation-wide epidemiological study from Sweden](https://pubmed.ncbi.nlm.nih.gov/17983628/).

  <br>
`);

// Familjehistorik och depression i procent.
let familyData = await dbQuery(`
  SELECT 
    CASE 
      WHEN familyMentalIllness = 1 THEN 'Familjehistorik'
      ELSE 'Ingen familjehistorik'
    END AS category,
    AVG(depression) AS avgDepression
  FROM studentDepression
  GROUP BY category;
`);

familyData = familyData.map(row => ({
  ...row,
  avgDepression: row.avgDepression * 100
}));

drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(familyData, 'Kategori', 'Genomsnittlig depression (%)'),
  options: {
    title: 'Depression hos studenter med/utan familjehistorik av psykisk ohälsa (%)',
    height: 400,
    pieHole: 0.4,
    slices: {
      0: { color: '#5dade2' },
      1: { color: '#21618c' }
    },
    tooltip: { text: 'percentage' }
  }
});

addMdToPage(`
  ---
  `)

addMdToPage(`
  <br>
  <br>

  # Slutsatser:

Analysen visar att depression bland studenter påverkas av en mängd olika faktorer, både individuella och externa. Resultaten indikerar tydliga samband mellan depression och flera variabler som kön, utbildningsnivå, akademisk stress, sömnvanor, kost och familjehistorik.
Det är viktigt att förstå att dessa samband inte innebär kausalitet. Faktorer som stress, socioekonomisk bakgrund och sociala normer kan också påverka resultatet. Även om vi ser en stark koppling mellan olika livsstilsfaktorer och depression, kan de underliggande orsakerna vara mer komplexa och mångfacetterade.

- Våra resultat visar att kvinnor tenderar att ha högre nivåer av depression än män, särskilt på kandidat- och doktorandnivå. Detta kan bero på olika sociala och kulturella faktorer som påverkar kvinnors välmående i akademiska sammanhang, och innebär att könsspecifika insatser kan vara nödvändiga för att minska den psykiska belastningen bland kvinnliga studenter.
- Det finns ett starkt samband mellan akademisk prestation och depression. Studenter med högre CGPA (över 7,5) rapporterar den högsta nivån av depression, vilket tyder på att den akademiska pressen är en viktig faktor för psykisk ohälsa. Detta understryker behovet av förbättrade strategier för att hantera akademisk stress, inte bara genom att fokusera på resultat utan också på att ge studenter bättre verktyg för att hantera pressen.
- Kortare sömnlängd (under 6 timmar) och ohälsosamma matvanor är starkt kopplade till högre nivåer av depression. Studenter som sover mer än 8 timmar har generellt sett lägre nivåer av depression, vilket tyder på att tillräcklig sömn kan ha en skyddande effekt. Kostens påverkan är också tydlig, där hälsosamma kostvanor leder till lägre depression, i linje med forskning om näringens betydelse för psykisk hälsa.
- Studenter med en familjehistorik av psykisk ohälsa rapporterar högre nivåer av depression. Detta understryker vikten av att förstå den genetiska och miljömässiga påverkan som familjebakgrund kan ha på studenternas mentala hälsa, vilket pekar på behovet av tidig upptäckt och förebyggande insatser.

### Vad kan göras:
- Hantering av akademisk stress bör implementeras på universitetsnivå, med särskilt fokus på att minska prestationspressen och erbjuda bättre psykologiskt stöd.
- Universiteten kan arbeta för att främja hälsosamma vanor bland studenter, exempelvis genom utbildning om näringens och sömnens roll i mental hälsa.
- Specifik hjälp för kvinnor som upplever högre nivåer av depression, särskilt på högre utbildningsnivåer, skulle kunna vara fördelaktiga.
- Genom att adressera de faktorer som är kopplade till depression, såsom familjehistorik och akademisk stress, kan universiteten skapa en mer stödjande miljö för studenterna.

### Avslutningsvis: 
Det är viktigt att skilja mellan korrelation och kausalitet i tolkningen av resultaten. Analyserna visar flera tydliga korrelationer som till exempel mellan sömnlängd och depression, kön och depression, samt akademisk prestation och psykisk ohälsa. Det innebär att dessa faktorer ofta förekommer tillsammans i vår data.
Däremot innebär det inte att den ena faktorn orsakar den andra. Exempelvis:
- Kort sömn kan hänga samman med depression, men det kan också vara så att depression leder till sämre sömn, eller att båda påverkas av en tredje faktor som stress.
- Kvinnor rapporterar högre nivåer av depression, men orsaken kan ligga i yttre faktorer som sociala normer, olika förväntningar eller stödstrukturer.
<br>

**Med det sagt är korrelationerna vi observerar ändå värdefulla. De synliggör mönster som kan hjälpa oss att identifiera riskområden, prioritera insatser och förstå vilka faktorer som kan vara viktiga att undersöka vidare i framtida forskning**.
`)