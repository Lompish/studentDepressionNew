addMdToPage(`
  ## Samband
  <br>
  `)
// Genomsnittlig depression per kön (i procent)
let genderChartData = await dbQuery(`
  SELECT gender, AVG(depression) as avgDepression
  FROM studentDepression
  GROUP BY gender
`);

genderChartData = genderChartData.map(row => ({
  ...row,
  avgDepression: row.avgDepression * 100
}));

drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(genderChartData, 'Kön', 'Genomsnittlig depression (%)'),
  options: {
    title: 'Genomsnittlig depression per kön (%)',
    height: 400
  }
});

addMdToPage(`
  ## Samband
  <br>
`);

// Kostvanor – genomsnittlig depression i procent + antal
let dietData = await dbQuery(`
  SELECT dietaryHabits, AVG(depression) as avgDepression, COUNT(*) as antalStudenter
  FROM studentDepression
  GROUP BY dietaryHabits
`);

dietData = dietData.map(row => ({
  ...row,
  avgDepression: (row.avgDepression * 100).toFixed(1) + '%'
}));

tableFromData({
  data: dietData,
  columnNames: ['Kostvanor', 'Genomsnittlig depression (%)', 'Antal studenter']
});

addMdToPage(`
  ## Samband
  <br>
`);

// Sömnlängd och depression i procent
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
    hAxis: { title: 'Sömn per natt' }
  }
});

addMdToPage(`
  ## Samband
  <br>
`);

// Familjehistorik och depression i procent
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
    pieHole: 0.4
  }
});



addMdToPage(`
  # Slutsatser och reflektion

  Genom analysen av datan har vi kunnat identifiera flera faktorer som verkar ha samband med studenters psykiska ohälsa:

  - **Könsskillnader:** Kvinnor visar generellt sett något högre nivåer av depression än män. Det kan bero på könsroller, högre press att prestera eller mindre socialt stöd.
  
  - **Utbildningsnivå:** Studenter på vissa utbildningsnivåer verkar uppleva mer depression, vilket kan hänga ihop med ökade krav eller framtidsoro.
  
  - **Sömn och kost:** Kortare sömnlängd och ohälsosamma kostvanor är kopplade till högre nivåer av depression. Det stämmer överens med tidigare forskning om livsstilsfaktorers påverkan på psykisk hälsa.
  
  - **Akademisk stress:** Hög akademisk press är starkt kopplad till både depression och självmordstankar.

  ## Tolkning av resultaten

  Det är viktigt att komma ihåg att korrelation inte är samma sak som kausalitet. Även om vi ser tydliga samband, kan bakomliggande faktorer som ekonomisk stress, familjebakgrund eller samhälleliga normer påverka resultaten.

  Exempelvis kan både dålig sömn och depression orsakas av samma grundproblem – som stress – snarare än att den ena orsakar den andra.

  ## Om social kontext

  I Indien är konkurrensen inom utbildning extremt hög. Familjer investerar mycket i barnens framtid, vilket kan skapa höga prestationskrav. Samtidigt är det inte alla som har tillgång till mentalvård eller förståelse för psykisk ohälsa. Detta kan bidra till att problemen förstärks.

  ## Rekommendationer

  - Universiteten bör erbjuda mer psykologiskt stöd och arbeta förebyggande.
  - Undervisning om mental hälsa bör inkluderas i utbildningen.
  - Vidare forskning kan göras för att undersöka skillnader mellan regioner, typer av universitet eller socioekonomisk bakgrund.

  Tack för att du tagit del av denna rapport!
`);
