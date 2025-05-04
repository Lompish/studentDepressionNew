
addMdToPage(`
  <br> 
  <br> 

  ### Akademisk prestation och press

  <br>

   Resultaten visar ett tydligt samband mellan akademisk prestation (CGPA) och depression. Studenter med CGPA > 7.5 rapporterar den högsta nivån av depression, följt av dem med CGPA mellan 6.0 och 7.5, medan studenter med CGPA < 6.0 har den lägsta genomsnittliga depressionen. Detta resultat kan tyda på att akademisk press, snarare än bara resultatnivå, spelar en avgörande roll för psykisk ohälsa. Studenter med högre prestation kan känna ett större tryck att upprätthålla sina betyg, vilket leder till ökad stress och psykiska påfrestningar.
  <br>
`);

// Hämta CGPA-data.
let cgpaData = await dbQuery(`
  SELECT 
    CASE 
      WHEN cgpa < 6 THEN '< 6.0'
      WHEN cgpa BETWEEN 6 AND 7.5 THEN '6.0–7.5'
      ELSE '> 7.5'
    END AS cgpa_range,
    AVG(depression) * 100 AS avgDepression
  FROM studentDepression
  GROUP BY cgpa_range
  ORDER BY 
    CASE cgpa_range 
      WHEN '< 6.0' THEN 1
      WHEN '6.0–7.5' THEN 2
      WHEN '> 7.5' THEN 3
    END;
`);

// Tre nyanser av blått.
let colorMap = {
  '< 6.0': 'color: #aec6cf',      // Ljusblå
  '6.0–7.5': 'color: #5dade2',    // Mellanblå
  '> 7.5': 'color: #21618c'       // Mörkblå
};

// Förbered data för Google Charts.
let chart = [
  ['CGPA-intervall', 'Genomsnittlig depression (%)', { role: 'style' }]
];

for (let row of cgpaData) {
  let color = colorMap[row.cgpa_range] || 'color: gray';
  chart.push([row.cgpa_range, row.avgDepression, color]);
}

// Rita diagrammet.
drawGoogleChart({
  type: 'ColumnChart',
  data: chart,
  options: {
    title: 'Genomsnittlig depression beroende på CGPA',
    height: 400,
    hAxis: { title: 'CGPA-intervall' },
    vAxis: { title: 'Depression (%)', minValue: 0, maxValue: 100 },
    legend: { position: 'none' },
    chartArea: { left: 60, right: 20, top: 50, bottom: 60 }
  }
});



addMdToPage(`
  ---
   `)





// Akademisk stress.
let stressTable = await dbQuery(`
  SELECT academicPressure, AVG(depression) as avgDepression, AVG(suicidalThoughts) as avgSuicidal
  FROM studentDepression
  GROUP BY academicPressure
  ORDER BY academicPressure
`);

stressTable = stressTable.map(row => ({
  academicPressure: row.academicPressure,
  avgDepression: (row.avgDepression * 100).toFixed(1) + '%',
  avgSuicidal: (row.avgSuicidal * 100).toFixed(1) + '%'
}));

addMdToPage(`
  <br>

  ### Akademisk stress

  <br>
 
  Tabellen visar att både depression och självmordstankar ökar kraftigt i takt med upplevd stressnivå. Akademisk press är alltså en central riskfaktor som måste adresseras i studenthälsovården.
  
`);

tableFromData({
  data: stressTable,
  columnNames: ['Akademisk stress (1–5)', 'Genomsnittlig depression (%)', 'Genomsnittliga suicidtankar (%)']
});

addMdToPage(`
  ---
  `)





addMdToPage(`
<br>

### Kön och utbildningsnivå

<br> 

När vi jämför kön och utbildningsnivå framgår det att kvinnor i de flesta utbildningskategorier tenderar att ha högre depression än män. Detta mönster återfinns särskilt i kategorierna kandidatnivå och doktorandnivå, där kvinnors genomsnittliga depression är högre än männens. I kategorin övriga utbildningsnivåer är depressionen lika hög för både kvinnor och män. Resultaten antyder att könsspecifika insatser kan vara avgörande, särskilt för kvinnor i vissa utbildningsnivåer. 
Det finns en skillnad i urvalet av män och kvinnor som även gör att jag har använt mig utav ett diagram på sida 2 med andelar. 
`)

// Översättningar.
const degreeTranslations = {
  'bachelor': 'Kandidatnivå',
  'master': 'Magisternivå',
  'doctor': 'Doktorandnivå',
  'other': 'Övriga'
};

const reverseDegreeTranslations = Object.fromEntries(
  Object.entries(degreeTranslations).map(([eng, swe]) => [swe, eng])
);

// Skapa dropdown-menyer.
let rawDegrees = await dbQuery('SELECT DISTINCT degree FROM studentDepression');
let educationOptions = ['Totalt', ...rawDegrees.map(x => degreeTranslations[x.degree] || x.degree)];

let rawGenders = await dbQuery('SELECT DISTINCT gender FROM studentDepression');
let genderOptions = ['Totalt', ...rawGenders.map(x =>
  x.gender === 'Male' ? 'Män' : x.gender === 'Female' ? 'Kvinnor' : x.gender
)];

let selectedEducation = addDropdown('Utbildningsnivå', educationOptions, 'Totalt');
let selectedGender = addDropdown('Kön', genderOptions, 'Totalt');

// SQL-filter.
let filters = [];
if (selectedEducation !== 'Totalt') {
  filters.push(`degree = '${reverseDegreeTranslations[selectedEducation] || selectedEducation}'`);
}
if (selectedGender !== 'Totalt') {
  const genderValue = selectedGender === 'Män' ? 'Male' : selectedGender === 'Kvinnor' ? 'Female' : selectedGender;
  filters.push(`gender = '${genderValue}'`);
}

let whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

// Hämta data.
let rawData = await dbQuery(`
  SELECT gender, degree, AVG(depression) as avgDepression
  FROM studentDepression
  ${whereClause}
  GROUP BY gender, degree
`);

// Förbered data för Google Chart.
let chartData = [
  ['Kön - Utbildning', 'Genomsnittlig depression (%)', { role: 'style' }]
];

let colorMapping = {
  'Male': 'color: #5dade2',
  'Female': 'color: #f1948a'
};

for (let row of rawData) {
  let genderLabel = row.gender === 'Male' ? 'Män' : row.gender === 'Female' ? 'Kvinnor' : row.gender;
  let degreeLabel = degreeTranslations[row.degree] || row.degree;
  let label = `${degreeLabel} - ${genderLabel}`;
  let depression = row.avgDepression * 100;
  let color = colorMapping[row.gender] || 'color: gray';
  chartData.push([label, depression, color]);
}

// Rita diagrammet.
drawGoogleChart({
  type: 'ColumnChart',
  data: chartData,
  options: {
    title: 'Genomsnittlig depression per kön och utbildningsnivå (%)',
    height: 600,
    chartArea: { left: 50, right: 20, top: 50, bottom: 80 },
    legend: { position: 'none' },
    hAxis: {
      title: 'Kön och utbildning',
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: 'Depression (%)',
      minValue: 0,
      textStyle: { fontSize: 10 }
    },
    titleTextStyle: {
      fontSize: 14
    },
    tooltip: { isHtml: true }
  }
});
