import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { getAllEventsForCurrency } from '@/utils/get-current-events-per-category';
import { EventsTable } from '@/components/ui/events-table';
import { Heading } from '@/components/ui/heading';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

import { currencyList, eventCategoryList } from '@/utils/event-names' ;

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const ForexEvents = () => {
  
  // keep track of different arrays of events as part of one object

  const [events, setEvents] = useState({});
  const [chartData, setChartData] = useState({});
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
    
    

    eventCategoryList.map((event) => {
      temp_events[event] = {... GetEventWithScoreForCurrencies(combinedData, currencyList, event)}
    })

   // temp_events["inflation"] = {... GetEventWithScoreForCurrencies(combinedData, currencyList, "Inflation Data")}

    console.log(temp_events)

    let data = {}

    eventCategoryList.forEach((eventCategory) => {
      data[eventCategory] =  currencyList.map((currency) => {
        return {
          name: currency,
          score: temp_events[eventCategory][currency].totalScore
        }
      }
      )
  })

    console.log(data)
    
    setEvents(temp_events);
    setChartData(data)

    
    setLoading(false);
  };

  useEffect( () => {
    handleDownload()
  }, [])

 
  return (
    <div>
      <DashboardLayout>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Card className="flex flex-row flex-wrap ">
            {Object.keys(events).map((category, index) => (
              <Card key={index} className="flex flex-col w-[calc(50%-4em)] p-8 m-4 ">
                <h2>{category}</h2>

                <ResponsiveContainer
                  width="100%"
                  height={500}
                >
                <ComposedChart
                  layout="horizontal"
                  data={chartData[category]}
                  
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <YAxis type="number" />
                  <XAxis dataKey="name" type="category"  />
                  <Tooltip />
                  <Legend/>
                  <Bar dataKey="score" barSize={20} fill="#413ea0" minPointSize={3} />
                </ComposedChart>
                </ResponsiveContainer>
  
                {Object.keys(events[category]).map((currency) => (
                  <div key={currency}> 
                    <Accordion type="single" collapsible className="">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          {currency} total score: {events[category][currency].totalScore}
                        </AccordionTrigger>
                        <AccordionContent>
                          <EventsTable events={events[category][currency].events}/>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              </Card>
            ))}
          </Card>
        )}
      </DashboardLayout>
    </div>
  );
};

export default ForexEvents;