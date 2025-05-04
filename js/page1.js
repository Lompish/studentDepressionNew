
addMdToPage(`
  ## Studenters vanor
  <br>
`);

// CGPA och depression i procent
let cgpaData = await dbQuery(`
  SELECT 
    CASE 
      WHEN cgpa < 6 THEN '< 6.0'
      WHEN cgpa BETWEEN 6 AND 7.5 THEN '6.0–7.5'
      ELSE '> 7.5'
    END AS cgpa_range,
    AVG(depression) AS avgDepression
  FROM studentDepression
  GROUP BY cgpa_range
  ORDER BY cgpa_range;
`);

cgpaData = cgpaData.map(row => ({
  ...row,
  avgDepression: row.avgDepression * 100
}));

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(cgpaData, 'CGPA-intervall', 'Genomsnittlig depression (%)'),
  options: {
    title: 'Samband mellan CGPA och depression (%)',
    height: 400,
    vAxis: { title: 'Depression (%)' },
    hAxis: { title: 'CGPA-intervall' },
    colors: ['#3366cc']
  }
});

// Akademisk stress och depression/suicidtankar i procent
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
  ### Studerandes vanor
  <br>
`);

tableFromData({
  data: stressTable,
  columnNames: ['Akademisk stress (1–5)', 'Genomsnittlig depression (%)', 'Genomsnittliga suicidtankar (%)']
});


// Dropdown för kön och utbildning
let educationOptions = ['Totalt', ...(await dbQuery(
  'SELECT DISTINCT degree FROM studentDepression'
)).map(x => x.degree)];

let genderOptions = ['Totalt', ...(await dbQuery(
  'SELECT DISTINCT gender FROM studentDepression'
)).map(x => x.gender)];

let selectedEducation = addDropdown('Utbildningsnivå', educationOptions, 'Totalt');
let selectedGender = addDropdown('Kön', genderOptions, 'Totalt');

let filters = [];
if (selectedEducation !== 'Totalt') filters.push(`degree = '${selectedEducation}'`);
if (selectedGender !== 'Totalt') filters.push(`gender = '${selectedGender}'`);

let whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

let rawData = await dbQuery(`
  SELECT gender, degree, AVG(depression) as avgDepression
  FROM studentDepression
  ${whereClause}
  GROUP BY gender, degree
`);

// Förbered data till stapeldiagram, med depression i procent
let chartData = [
  ['Kön - Utbildning', 'Genomsnittlig depression (%)', { role: 'style' }]
];

let colorMapping = {
  'Male': 'color: blue',
  'Female': 'color: pink'
};

for (let row of rawData) {
  let label = `${row.gender} - ${row.degree}`;
  let depression = row.avgDepression * 100;
  let color = colorMapping[row.gender] || 'color: gray';
  chartData.push([label, depression, color]);
}

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
    }
  }
});
