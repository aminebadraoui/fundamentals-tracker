import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  const queryCountries = req.query.countries ? req.query.countries.split(',') : []
  let countries = []
  const limit = 600

  if (queryCountries.length > 0) {
    countries = queryCountries
}
  else {
    countries = countryList_Iso3166
  }
 

  const promises = countries.map( async (country) => {
      const eventsForCountry = await fetch(`https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&limit=${limit}`, {cache: 'force-cache'});
      const eventsForCountryData = await eventsForCountry.json();

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