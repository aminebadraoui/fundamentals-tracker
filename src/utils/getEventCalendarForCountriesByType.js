import { assets, monthDates, years } from './event-names';

const fetchJsonFilesUrls = async (baseUrl) => {
  const promises = years.map(async (year) => {
    const url = `${baseUrl}/api/download-event-calendar?year=${year}`;
    const res = await fetch(url);
    const json = await res.json();
    return json;
  });

  return await Promise.all(promises);
};

const fetchAndMergeEventCalendar = async (baseUrl) => {
  const jsonFilesUrls = await fetchJsonFilesUrls(baseUrl);


  const jsonFilesPromises = jsonFilesUrls.map( async (jsonUrl) => {
    if (jsonUrl) {
   
      const year = Object.keys(jsonUrl)[0];

      const url = jsonUrl[Object.keys(jsonUrl)[0]];

      const res = await fetch(url);
      const json = await res.json();
      return { [year] : json}
    }
    return null;
  });

  const jsonFiles = await Promise.all(jsonFilesPromises);



  const mergedData = jsonFiles.reduce((acc, json) => {
    if (json) {
      Object.keys(json).forEach((year) => {
        if (!acc[year]) {
          acc[year] = {};
        }
        Object.keys(json[year]).forEach((asset) => {
          if (!acc[year][asset]) {
            acc[year][asset] = {};
          }
          Object.keys(json[year][asset]).forEach((country) => {
            if (!acc[year][asset][country]) {
              acc[year][asset][country] = {};
            }
            Object.keys(json[year][asset][country]).forEach((month) => {
              if (!acc[year][asset][country][month]) {
                acc[year][asset][country][month] = [];
              }
              const events = json[year][asset][country][month];
              if (Array.isArray(events)) {
                acc[year][asset][country][month].push(...events);
              }
            });
          });
        });
      });

      // Ensure months are in order for each year and country
      Object.keys(acc).forEach((year) => {
        Object.keys(acc[year]).forEach((asset) => {
          Object.keys(acc[year][asset]).forEach((country) => {
            acc[year][asset][country] = Object.keys(monthDates).reduce((obj, month) => {
              obj[month] = acc[year][asset][country][month] || [];
              return obj;
            }, {});
          });
        });
      });
    }
    return acc;
  }, {});

  return mergedData;
};

const filterByTypeAndCountries =  (mergedData, type, asset, country) => {



  const filteredData = {};

  Object.keys(mergedData).forEach((year) => {
    if (!filteredData[year]) {
      filteredData[year] = {};
    }

    // if (!filteredData[year][asset]) {
    //   filteredData[year][asset] = {};
    // }

  
    if (!filteredData[year][country]) {
      filteredData[year][country] = {};
    }

    Object.keys(mergedData[year][asset][country] || {}).forEach((month) => {
      const events = (mergedData[year][asset][country][month] || []).filter(item => item.type === type);

      // Prioritize events based on the comparison field
      const filteredEvents = events.filter(event => event.comparison === 'yoy');
      if (filteredEvents.length === 0) {
        const qoqEvents = events.filter(event => event.comparison === 'qoq');
        if (qoqEvents.length === 0) {
          filteredData[year][country][month] = events;

        } else {
          filteredData[year][country][month] = qoqEvents;
        }
      } else {
        filteredData[year][country][month] = filteredEvents;
      }
    });
   
  });

  // Reassign mismatched period data and retain only the most recent data
  Object.keys(filteredData).forEach((year) => {
    Object.keys(filteredData[year] || {}).forEach((country) => {
      Object.keys(filteredData[year][country] || {}).forEach((month) => {
        const events = filteredData[year][country][month];

        const organizedEvents = (events || []).reduce((acc, event) => {
          acc[month] = []
          acc[month].push(event);
          
         
          return acc;
        }, {});

        Object.keys(organizedEvents).forEach((organizedMonth) => {
          // Sort by date and keep only the most recent event
          const recentEvent = organizedEvents[organizedMonth].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          filteredData[year][country][organizedMonth] = [recentEvent];
        });
      });
    });
  });


  return filteredData;
};

const baseUrl = 'http://localhost:3000'; // Replace with your actual base URL

export { fetchAndMergeEventCalendar, filterByTypeAndCountries };
