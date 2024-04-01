import { DashboardLayout } from "@/components/ui/dashboard/dashboard-layout"
import React from "react"
import { useEffect, useState } from "react"
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,  Scatter, ComposedChart, Line } from 'recharts';

const ComparaisonCharts = () => {
    // if the combined data is not empty, then set the state to the combined data
    const [isLoading, setLoading] = useState(false);
    const [cpiEVents, setCPIEvents] = useState([]);


    let usdCPIEvents = []
    let eurCPIEvents = []
    const getCombinedData = async () => {
      const response = await fetch('/api/get-data');
      const data = await response.json();
      setLoading(false);
      return data
    }

    const handleViewLoad = async () => {
      setLoading(true);
      const combinedData = await getCombinedData()
      
      
      const getEventByCountry = (eventName, countryName ) => {
        let eventsForCountry = []
        let weeklyEvents = []
        Object.keys(combinedData).forEach( (key) => {
        const week = combinedData[key]
        const event = week[countryName]
        if (event)  {
          weeklyEvents.push(event)
        }
       
        })



        weeklyEvents.forEach(  (week) => {
        Object.keys(week).forEach( (key) => {
          const day = week[key].forEach( (event) => { if (event.eventTitle === eventName) {
            eventsForCountry.push(event)
          
          } } )
        })
      })

      // dreams is the unconscious communication with the conscious, postulate or argument?

      // parse float of the actual, forecast, and previous values of the event in the usdCPIEvents array
      const suffixedEventsForCountry = eventsForCountry.map( (event, index) => {
        const countryEvent = {}

        countryEvent[`country`] = `${countryName}`
        countryEvent[`eventTitle`] = `${ event.eventTitle} ${index+1}`
        countryEvent[`actual`] =  parseFloat(event.actual) 
        countryEvent[`forecast`] = parseFloat(event.forecast) 
        countryEvent[`previous`] = parseFloat(event.previous) 

        return countryEvent

      })

      console.log(suffixedEventsForCountry)

      return suffixedEventsForCountry
      }

    usdCPIEvents = getEventByCountry("CPI y/y", "USD")
    eurCPIEvents = getEventByCountry("Core CPI Flash Estimate y/y", "EUR")


  //   [
  //     {
  //         "country": "USD",
  //         "eventTitle": "CPI y/y 1",
  //         "actual": 3.2,
  //         "forecast": 3.1,
  //         "previous": 3.1
  //     },
  //     {
  //         "country": "USD",
  //         "eventTitle": "CPI y/y 2",
  //         "actual": 3.1,
  //         "forecast": 2.9,
  //         "previous": 3.4
  //     },
  //     {
  //         "country": "USD",
  //         "eventTitle": "CPI y/y 3",
  //         "actual": 3.4,
  //         "forecast": 3.2,
  //         "previous": 3.1
  //     },
  //     {
  //         "country": "EUR",
  //         "eventTitle": "Core CPI Flash Estimate y/y 1",
  //         "actual": 3.1,
  //         "forecast": 2.9,
  //         "previous": 3.3
  //     },
  //     {
  //         "country": "EUR",
  //         "eventTitle": "Core CPI Flash Estimate y/y 2",
  //         "actual": 3.3,
  //         "forecast": 3.2,
  //         "previous": 3.4
  //     },
  //     {
  //         "country": "EUR",
  //         "eventTitle": "Core CPI Flash Estimate y/y 3",
  //         "actual": 3.4,
  //         "forecast": 3.4,
  //         "previous": 3.6
  //     }
  // ]


  const cpiEvents = usdCPIEvents.map( (us_event, index) => {
    if (eurCPIEvents[index]) {
      const eur_event = eurCPIEvents[index]

      const cpiEvent = {}

      cpiEvent["title"] = `CPI Y/Y _ ${index+1}`
      cpiEvent["actual_us"] = us_event["actual"]
      cpiEvent["actual_eur"] = eur_event["actual"]
      cpiEvent["forecast_us"] = us_event["forecast"]
      cpiEvent["forecast_eur"] = eur_event["forecast"]
      cpiEvent["previous_us"] = us_event["previous"]
      cpiEvent["previous_eur"] = eur_event["previous"]

      return cpiEvent
    }
  })




    console.log(cpiEvents)
 
    setCPIEvents(cpiEvents)

    setLoading(false);
    }




    useEffect( () => {  
      console.log("useEffect called")
      handleViewLoad()
    }, [])
    
  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];
  
  return (
    <div>
      
        
        <DashboardLayout>
          {
            isLoading ? 
            <p>Loading...</p>
            : 
            <ComposedChart
            width={500}
            height={300}
            data={cpiEVents}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar barSize={20} dataKey="actual_us" stackId="us" fill="#8884d8" />
            <Bar barSize={20} dataKey="actual_eur" stackId="eur" fill="#A52A2A" />
            {/* <Scatter dataKey="previous_eur" stackId="eur" fill="#0000FF" />
            <Scatter dataKey="forecast_eur" stackId="eur" fill="#A52A2A" /> */}
          </ComposedChart>
          }
          {console.log(usdCPIEvents)}
      
      </DashboardLayout>
      
     
    </div>
  )
}
export default ComparaisonCharts