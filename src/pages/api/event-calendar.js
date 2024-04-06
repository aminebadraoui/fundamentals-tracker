import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  const promises = countryList_Iso3166.map( async (country) => {
      const eventsForCountry = await fetch(`https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&country=${country}&limit=1000&fmt=json`, {cache: 'force-cache'});
      const eventsForCountryData = await eventsForCountry.json();
      
      return { [country]: eventsForCountryData }
    })

    Promise.all(promises).then((dataArray) => {  
      const finalData = {}
      for (const data in dataArray) {
        Object.keys(dataArray[data]).map((key) => {
          finalData[key] = dataArray[data][key].filter(event => event.actual && event.estimate && event.previous)
        })
      }
      console.log(finalData)
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
