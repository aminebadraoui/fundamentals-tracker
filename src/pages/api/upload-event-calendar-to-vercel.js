import { monthDates, assets, years } from "@/utils/event-names";
import { put } from '@vercel/blob';

const fetchEvents = async (year, fromDate, toDate, country) => {
  const limit = 1000;
  const url = `https://eodhd.com/api/economic-events?api_token=${process.env.EOD_TOKEN}&fmt=json&country=${country}&from=${fromDate}&to=${toDate}&limit=${limit}`;
  console.log("url", url);
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const organizeDataByYear = (responses) => {
  return responses.reduce((acc, response) => {
    if (!response || !response.asset || !response.country || !response.year || !response.month || !response.data) {
      console.error('Invalid response object:', response);
      return acc;
    }

    const { asset, country, year, month, data } = response;

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][asset]) {
      acc[year][asset] = {};
    }
    if (!acc[year][asset][country]) {
      acc[year][asset][country] = {};
    }
    if (!acc[year][asset][country][month]) {
      acc[year][asset][country][month] = [];
    }
    acc[year][asset][country][month].push(...data);
    return acc;
  }, {});
};

const ensureMonthsOrder = (organizedDataByYear) => {
  Object.keys(organizedDataByYear).forEach((year) => {
    Object.keys(organizedDataByYear[year]).forEach((asset) => {
      Object.keys(organizedDataByYear[year][asset]).forEach((country) => {
        organizedDataByYear[year][asset][country] = Object.keys(monthDates).reduce((obj, month) => {
          obj[month] = organizedDataByYear[year][asset][country][month] || [];
          return obj;
        }, {});
      });
    });
  });
};

const filterCommonEvents = (organizedDataByYear) => {
  Object.keys(organizedDataByYear).forEach((year) => {
    Object.keys(organizedDataByYear[year]).forEach((asset) => {
      const countries = Object.keys(organizedDataByYear[year][asset]);
      if (countries.length === 2) {
        const [country1, country2] = countries;
        Object.keys(organizedDataByYear[year][asset][country1]).forEach((month) => {
          const eventsCountry1 = organizedDataByYear[year][asset][country1][month];
          const eventsCountry2 = organizedDataByYear[year][asset][country2][month];
          const commonEventTypes = eventsCountry1
            .map(event => event.type)
            .filter(type => eventsCountry2.some(event => event.type === type));
          organizedDataByYear[year][asset][country1][month] = eventsCountry1.filter(event => commonEventTypes.includes(event.type));
          organizedDataByYear[year][asset][country2][month] = eventsCountry2.filter(event => commonEventTypes.includes(event.type));
        });
      }
    });
  });
};

const uploadYearData = async (year, yearData) => {
  const blobFile = new Blob([JSON.stringify(yearData, null, 2)], { type: 'application/json' });
  const fileName = `event_calendar_${year}.json`;
  await put(fileName, blobFile, {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
};

export default async (req, res) => {
  const year = req.query.year;
  const dates = {};

  dates[year] = Object.keys(monthDates).map((month) => {
    const fromDate = `${year}-${monthDates[month].first}`;
    const toDate = `${year}-${monthDates[month].last}`;
    return { fromDate, toDate, month };
  });

  const eventsPromises = [];

  dates[year].forEach((date) => {
    Object.keys(assets).forEach((asset) => {
      assets[asset].countries.forEach((country) => {
        eventsPromises.push(
          fetchEvents(year, date.fromDate, date.toDate, country)
            .then(data => ({ asset, country, year, month: date.month, data }))
            .catch(error => console.log(error))
        );
      });
    });
  });

  const responses = await Promise.all(eventsPromises);
  const organizedDataByYear = organizeDataByYear(responses);
  ensureMonthsOrder(organizedDataByYear);
  filterCommonEvents(organizedDataByYear);

  const uploadPromises = Object.keys(organizedDataByYear).map((year) => {
    const yearData = organizedDataByYear[year];
    return uploadYearData(year, yearData);
  });

  await Promise.all(uploadPromises);

  res.status(200).json({ success: true });
};
