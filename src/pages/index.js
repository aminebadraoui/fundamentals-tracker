import { useState } from 'react';
import { getForexFactoryFormattedDate } from '@/utils/forex-factory-date-formatter';
import { performFetch } from '@/utils/perform-ff-fetch';

const ForexEvents = () => {
  const lookback = 3
  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [dataLength, setDataLength] = useState({})

  function findMostRecentEvent(data, eventName) {
    for (const week in data) {
      const currencies = data[week];
      if (currencies["USD"]) {
        for (const day in currencies["USD"]) {
          const events = currencies["USD"][day];
          const event = events.find(event => event.eventTitle === eventName && event.actual && event.forecast && event.previous);
          if (event) {
            return { ...event, day, week  };
          }
        }
      }
    }
    return null; // If no matching event is found
  }

  const handleDownload = async () => {
    setLoading(true);

    let combinedData = JSON.parse(localStorage.getItem('combinedData') || '{}');
    setDataLength(Object.keys(combinedData).length ) 
  
    if (Object.keys(combinedData).length === 0 || Object.keys(combinedData).length - 1 !== lookback ) {
      combinedData = {}
      // If combinedData is empty, perform the fetch
      for (let i = 0; i <= lookback; i++) {
        const date = getForexFactoryFormattedDate(i);
        const data = await performFetch(date);
  
        if (!combinedData[date]) {
          combinedData[date] = data;
        }
      }
      
      // Store the fetched data for future use
      localStorage.setItem('combinedData', JSON.stringify(combinedData));
      setDataLength(Object.keys(combinedData).length ) 
    }

    const cpiYY = findMostRecentEvent(combinedData, "CPI y/y")

    setEvents({...cpiYY});
    
    setLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <button onClick={handleDownload}>Download Forex Events</button>
          <pre>{JSON.stringify(events, null, 2)}</pre>
          <pre>{JSON.stringify(dataLength, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ForexEvents;