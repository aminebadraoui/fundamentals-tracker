import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { getAllEventsForCurrency } from '@/utils/get-current-events-per-category';
import { EventsTable } from '@/components/ui/events-table';
import { Heading } from '@/components/ui/heading';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const ForexEvents = () => {
  
  // keep track of different arrays of events as part of one object

  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

   // get the combined data from the mongodb database
    // if the combined data is not empty, then set the state to the combined data
    const getCombinedData = async () => {
      const response = await fetch('/api/get-data');
      const data = await response.json();
      console.log(data)
      return data
    }

    const GetEventWithScoreForCurrencies = (combinedData, currencies, eventType) => {
      const inflation = {}

      currencies.forEach((currency) => {
        if (!inflation[currency]) {
          inflation[currency] = {}
        }

        inflation[currency]["events"] = getAllEventsForCurrency(combinedData, currency)[eventType];
        inflation[currency]["totalScore"] = getAllEventsForCurrency(combinedData, currency)[eventType].reduce((acc, event) => acc + event.score, 0)
      })

      return inflation
    }
  
  const handleDownload = async () => {
    setLoading(true);
    const combinedData = await getCombinedData()
    
    const temp_events = {}
    
    

    temp_events["inflation"] = {... GetEventWithScoreForCurrencies(combinedData, ["USD", "EUR", "GBP"], "Inflation Data")}

    // get total score from inflation data of each currency


   
    setEvents(temp_events);

    console.log(temp_events)
    
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
       <div>
          <h2> Inflation </h2>
          {
            events.inflation && Object.keys(events.inflation).map((currency) => [
              <div> 
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                  <AccordionTrigger>{ <p> {currency} total score: {events.inflation[currency].totalScore}  </p>}</AccordionTrigger>
                    <AccordionContent>
                    <EventsTable events={events.inflation[currency].events}/>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </div>
          ])
          }
          
       </div> 
}
      </DashboardLayout>
    </div>
  );
};

export default ForexEvents;