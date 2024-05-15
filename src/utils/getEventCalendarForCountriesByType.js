
import { monthDates, years } from './event-names';









export const filterByTypeAndCountries = async (baseUrl, type, countries) => {
  const promises = years.map(async (year) => {
    // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : 'http://localhost:3000'
    // console.log("process.env", process.env.NEXT_PUBLIC_BASE_URL)
    
    const url = `${baseUrl}/api/download-event-calendar?year=${year}`;
    const res = await fetch(url);
    const json = await res.json();
    return json;
  });

  const jsonFiles = await Promise.all(promises);

  const mergedData = jsonFiles.reduce((acc, json) => {
    Object.keys(json).forEach((year) => {
      if (!acc[year]) {
        acc[year] = {};
      }
      Object.keys(json[year]).forEach((country) => {
        if (!acc[year][country]) {
          acc[year][country] = {};
        }
        Object.keys(json[year][country]).forEach((month) => {
          if (!acc[year][country][month]) {
            acc[year][country][month] = [];
          }
          acc[year][country][month].push(...json[year][country][month]);
        });
      });
    });

    // Ensure months are in order for each year and country
    Object.keys(acc).forEach((year) => {
      Object.keys(acc[year]).forEach((country) => {
        acc[year][country] = Object.keys(monthDates).reduce((obj, month) => {
          obj[month] = acc[year][country][month] || [];
          return obj;
        }, {});
      });
    });

    return acc;
  }, {});

  const filteredData = {};

  Object.keys(mergedData).forEach((year) => {
    filteredData[year] = {};

    Object.keys(mergedData[year]).forEach((cnt) => {
      if (countries.length > 0 && !countries.includes(cnt)) return; // Skip if the country is not in the selected countries

      filteredData[year][cnt] = {};

      Object.keys(mergedData[year][cnt]).forEach((month) => {
        const events = mergedData[year][cnt][month].filter(item => item.type === type);

        // Prioritize events based on the comparison field
        const filteredEvents = events.filter(event => event.comparison === 'yoy');
        if (filteredEvents.length === 0) {
          const qoqEvents = events.filter(event => event.comparison === 'qoq');
          if (qoqEvents.length === 0) {
            filteredData[year][cnt][month] = events;
          } else {
            filteredData[year][cnt][month] = qoqEvents;
          }
        } else {
          filteredData[year][cnt][month] = filteredEvents;
        }
      });
    });
  });

  // Reassign mismatched period data and retain only the most recent data
  Object.keys(filteredData).forEach((year) => {
    Object.keys(filteredData[year]).forEach((cnt) => {
      Object.keys(filteredData[year][cnt]).forEach((month) => {
        const events = filteredData[year][cnt][month];

        const organizedEvents = events.reduce((acc, event) => {
          const itemPeriod = event.period?.toLowerCase();
          if (itemPeriod) {
            const periodMonth = Object.keys(monthDates).find((m) => m.slice(0, 3).toLowerCase() === itemPeriod);
            if (periodMonth && periodMonth !== month) {
              if (!acc[periodMonth]) {
                acc[periodMonth] = [];
              }
              acc[periodMonth].push(event);
            } else {
              if (!acc[month]) {
                acc[month] = [];
              }
              acc[month].push(event);
            }
          } else {
            if (!acc[month]) {
              acc[month] = [];
            }
            acc[month].push(event);
          }
          return acc;
        }, {});

        Object.keys(organizedEvents).forEach((organizedMonth) => {
          // Sort by date and keep only the most recent event
          const recentEvent = organizedEvents[organizedMonth].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          filteredData[year][cnt][organizedMonth] = [recentEvent];
        });
      });
    });
  });

  return filteredData;
};