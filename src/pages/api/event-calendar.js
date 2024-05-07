import { countryList_Iso3166 } from '@/utils/event-names';

export default async (req, res) => {
  const queryCountries = req.query.countries ? req.query.countries.split(',') : [];
 

  const eventData = await getEventData(queryCountries);

  return res.status(200).json(eventData);
};

export const getEventData = async (countries = [], limit = 600) => {
  let countriesList = [];
  if (countries.length > 0) {
    countriesList = countries;
  } else {
    countriesList = countryList_Iso3166;
  }

  const promises = countriesList.map(country => fetch(`https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&limit=${limit}`, { cache: 'force-cache' })
    .then(response => response.json())
    .then(eventsForCountryData => ({ [country]: eventsForCountryData }))
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
          finalData[key] = data[key];
        });
      });
      return finalData;
    })
    .catch(error => {
      console.error('Error processing promises:', error);
      return { error: 'Internal Server Error', details: 'Failed to process economic event data' };
    });
 }




