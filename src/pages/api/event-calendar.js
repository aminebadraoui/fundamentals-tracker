import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  const queryCountries = req.query.countries ? req.query.countries.split(',') : [];
 

  const eventData = await getEventData(queryCountries);

  return res.status(200).json(eventData);
};


export const getEventData = async (countries = [], limit = 1000) => {
  let countriesList = [];
  if (countries.length > 0) {
    countriesList = countries;
  } else {
    countriesList = countryList_Iso3166;
  }

  const currentDate = new Date(); 
  // Make currentDate in YYYY-MM-DD format
  const formattedCurrentDate = currentDate.toISOString().split('T')[0];

  // first day of the previous quarter
  const fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
  // Make firstDayOfPreviousMonth in YYYY-MM-DD format
  const formattedFromDate = fromDate.toISOString().split('T')[0];

  console.log("formattedCurrentDate", formattedCurrentDate)

  const promises = countriesList.map(country => fetch(`https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&from=${formattedFromDate}&to=${formattedCurrentDate}&limit=${limit}`)
    .then(response => response.json())
    .then(eventsForCountryData => ({ 
      // add significance to each event
      [country]: eventsForCountryData.map(event => ({ ...event, significance: 1 })) }))
    .catch(error => {
      console.error(`Error fetching events for ${country}:`, error);
      return { [country]: { error: 'Failed to fetch data', details: error.message } }; // Return error details for each country
    })
  );

  return Promise.all(promises)
    .then(dataArray => {
      const finalData = {};
      dataArray.forEach(data => {
        Object.keys(data).forEach(key => {
          data[key].significance = 1

          finalData[key] = data[key];
        });
      });

      console.log(finalData)
      return finalData;
    })
    .catch(error => {
      console.error('Error processing promises:', error);
      return { error: 'Internal Server Error', details: 'Failed to process economic event data' };
    });
 }




