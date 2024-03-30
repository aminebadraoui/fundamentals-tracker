import { useEffect, useState } from 'react';
import { performFetch } from '@/utils/perform-ff-fetch';
import { getForexFactoryFormattedDate } from '@/utils/forex-factory-date-formatter';

const FFScraper = () => { 
  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleSaveData = async (inputData) => {
    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({data: inputData}),
    });

    if (response.ok) {
      console.log('Data saved successfully!');
    } else {
      console.log('Something went wrong with saving data!');
    }
  };

  const downloadData = async () => { 
    setLoading(true);
    const lookback = 13
    let combinedData = {}

    if (Object.keys(combinedData).length === 0 || Object.keys(combinedData).length - 1 !== lookback ) {
      combinedData = {}
      for (let i = 0; i <= lookback; i++) {
        const date = getForexFactoryFormattedDate(i);
        const data = await performFetch(date);
  
        if (!combinedData[date]) {
          combinedData[date] = data;
        }
      }
    }

    setEvents(combinedData)
    handleSaveData(combinedData)

    setLoading(false);
  }

  useEffect( () => {
    downloadData()
  }, [])

  return (

    <div>
      {
        isLoading && <h1>Loading...</h1>
      } 
      {
        !isLoading && events &&
        <div>
          <h1>Forex Factory Scraper</h1>
          <p>Downloaded data: {JSON.stringify(events)}</p>
        </div>
      }
      
    </div>
  )
}

export default FFScraper;