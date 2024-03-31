import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { getCurrentEventsPerCategory } from '@/utils/get-current-events-per-category';
import { EventsTable } from '@/components/ui/events-table';
import { Heading } from '@/components/ui/heading';

const ForexEvents = () => {
  
  // keep track of different arrays of events as part of one object

  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

   // get the combined data from the mongodb database
    // if the combined data is not empty, then set the state to the combined data
    const getCombinedData = async () => {
      setLoading(true);
      const response = await fetch('/api/get-data');
      const data = await response.json();
      console.log(data)
      return data
    }
  
  const handleDownload = async () => {
    const combinedData = await getCombinedData()
    const currentEventsPerCategory = getCurrentEventsPerCategory(combinedData)

    const temp_events = {}

    temp_events["Inflation Data"] = currentEventsPerCategory["Inflation Data"];
    temp_events["Retail Data"] = currentEventsPerCategory["Retail Data"];
    temp_events["Economic Growth Data"] = currentEventsPerCategory["Economic Growth Data"];
    temp_events["Housing Data"] = currentEventsPerCategory["Housing Data"];
   
    setEvents(temp_events);
    
    setLoading(false);
  };

  useEffect( () => {
    handleDownload()
  }, [])

  return (
    <div>
       <DashboardLayout>
      {isLoading ? 
        <p>Loading...</p>
       : 
      <EventsTable events={events} />
}
      </DashboardLayout>
    </div>
  );
};

export default ForexEvents;