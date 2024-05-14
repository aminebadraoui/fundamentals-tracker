import { monthDates } from "@/utils/event-names";
import { countryList_Iso3166 } from "@/utils/event-names";
import { put } from '@vercel/blob';

export default async (req, res) => {
 
  const year = req.query.year;

  let dates = {};


  dates[year] = [];
  Object.keys(monthDates).map((month) => {
    const fromDate = `${year}-${monthDates[month].first}`;
    const toDate = `${year}-${monthDates[month].last}`;
    dates[year].push({ fromDate, toDate, month });
  });


  let eventsPromises = [];
  Object.keys(dates).map((year) => {
    dates[year].map((date) => {
      countryList_Iso3166.map((country) => {
        const fromDate = date.fromDate;
        const toDate = date.toDate;
        const limit = 1000;

        try {
          const url = `https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&from=${fromDate}&to=${toDate}&limit=${limit}`
          console.log("url", url)
          eventsPromises.push(fetch(url).then((res) => res.json().then((data) => ({ country, year, month: date.month, data }))));
        } catch (error) {
          console.log(error);
        }
      });
    });
  });

  const responses = await Promise.all(eventsPromises);

  // Organize the data into separate JSON objects by year
  const organizedDataByYear = responses.reduce((acc, { country, year, month, data }) => {
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][country]) {
      acc[year][country] = {};
    }
    if (!acc[year][country][month]) {
      acc[year][country][month] = [];
    }
    acc[year][country][month].push(...data);
    return acc;
  }, {});

  // Ensure months are in order for each year and country
  Object.keys(organizedDataByYear).forEach((year) => {
    Object.keys(organizedDataByYear[year]).forEach((country) => {
      organizedDataByYear[year][country] = Object.keys(monthDates).reduce((obj, month) => {
        obj[month] = organizedDataByYear[year][country][month] || [];
        return obj;
      }, {});
    });
  });

  // Upload each year's data separately
  const uploadPromises = Object.keys(organizedDataByYear).map(async (year) => {
    const yearData = organizedDataByYear[year];
    const blobFile = new Blob([JSON.stringify(yearData, null, 2)], { type: 'application/json' });
    const fileName = `event_calendar_${year}.json`;

     await put(fileName, blobFile, {
        access: 'public',
        addRandomSuffix: false,
      });
  });

  await Promise.all(uploadPromises);

  res.status(200).json({ success: true });
}