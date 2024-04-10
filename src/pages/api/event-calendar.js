import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  console.log("query", req.query.countries)

  const queryCountries = req.query.countries ? req.query.countries.split(',') : []

  console.log("queryCountries", queryCountries)

  let countries = []

  if (queryCountries.length > 0) {
    countries = queryCountries
}
  else {
    countries = countryList_Iso3166
  }
  console.log("api countries", countries)

  const promises = countries.map( async (country) => {
      const eventsForCountry = await fetch(`https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&limit=1000`, {cache: 'force-cache'});
      const eventsForCountryData = await eventsForCountry.json();

      console.log("eventsForCountryData", eventsForCountryData)
      
      return { [country]: eventsForCountryData }
    })

    Promise.all(promises).then((dataArray) => {  
      const finalData = {}
      for (const data in dataArray) {
        Object.keys(dataArray[data]).map((key) => {
          finalData[key] = dataArray[data][key]
        })
      }
 
      res.status(200).json(finalData)
    })
}

// US "Initial Jobless Claims" 
// "Balance of Trade" 
// "ISM Services Business Activity"
// "ISM Services PMI" 
// "ADP Employment Change"
// "JOLTs Job Openings"
// ISM Manufacturing Prices"
// "ISM Manufacturing PMI"
// Core PCE Price Index",
// "Goods Trade Balance",
// "PCE Price Index",
// "Personal Spending",
// "Pending Home Sales",
// "Chicago PMI",
// "Core PCE Prices",
// "GDP Price Index",
// "Real Consumer Spending",
// "Initial Jobless Claims",
// "GDP Growth Rate",
// "GDP Sales",
// "PCE Prices",
// "CB Consumer Confidence",
// "New Home Sales",
// "Existing Home Sales",
// "S&P Global Services PMI",
// "S&P Global Manufacturing PMI",
// "Philadelphia Fed Manufacturing Index",
// "Fed Interest Rate Decision",
// "Manufacturing Production",
// "Import Prices",
// "Export Prices",
// NY Empire State Manufacturing Index",
// "Retail Inventories Ex Autos",
// Retail Sales Ex Autos",
// "PPI",
// "Core PPI",
// "Core PPI",
// "Continuing Jobless Claims",
// "Inflation Rate",
// "Core Inflation Rate",
// "CPI",
// "Unemployment Rate",
// "Manufacturing Payrolls",
// "Average Hourly Earnings",
// "Average Hourly Earnings",
// "Non Farm Payrolls",
// "Non Farm Payrolls",
// "Consumer Credit Change",

// EU
