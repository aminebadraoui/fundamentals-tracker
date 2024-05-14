import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  const queryCountries = req.query.country
 
  const fromDate = req.query.fromDate ? req.query.fromDate :  "2024-01-01"
  const toDate = req.query.toDate ? req.query.toDate : "2024-01-31"

  const eventData = await getEventData(queryCountries, 1000, fromDate, toDate);


  return res.status(200).json(eventData);
};


export const getEventData = async (country, limit = 1000, fromDate, toDate) => {
  const url = `https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&from=${fromDate}&to=${toDate}&limit=${limit}`
  console.log("url", url)
  const res = await fetch(url)

  const data = await res.json()

  

  // console.log("data", data)

return data

 }




