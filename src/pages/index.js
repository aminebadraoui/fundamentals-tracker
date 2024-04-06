import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Card } from '@/components/ui/card'


const Pulse = () => {
  // keep track of different arrays of events as part of one object
  const [totalScoresData, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('api/event-calendar')

      const jsonData = await data.json()
      
      // if data is not empty, classify data into categories and currencies and set state
      // const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'events.json';
      // a.click();

      const totalScoresData = {}


      const inflationData = getDataSortedByTotalScore(jsonData, inflationKeys, null)
      const employmentData = getDataSortedByTotalScore(jsonData, employmentKeys, null)
      const growthData = getDataSortedByTotalScore(jsonData, null, inflationKeys.concat(employmentKeys))
   
      console.log(inflationData)

      Object.keys(inflationData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }
 
        totalScoresData[key]["inflation"] = inflationData[key].totalScore
        // find the event with the type "rate" or "decision rate" or "rba decision rate" and get the actual value from it
        const rateEvent = inflationData[key].events.find((event) => (event.type === "Inflation Rate" 
        || event.type === "Core Inflation Rate")
        && event.comparison === "yoy"
        )

        if (rateEvent) {
          totalScoresData[key]["rate"] = rateEvent.actual
        }

        totalScoresData[key]["averageRate"] = 2.0




      })

      Object.keys(employmentData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }

        totalScoresData[key]["employment"] = employmentData[key].totalScore
      })

      Object.keys(growthData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }

        totalScoresData[key]["growth"] = growthData[key].totalScore
      })

      // add a total score for each country
      Object.keys(totalScoresData).map((key) => { 
        const country = totalScoresData[key]
        country["economicScore"] =  country.employment + country.growth
      })

      // add a bullish or bearish sentiment for each country
      Object.keys(totalScoresData).map((key) => { 
        const country = totalScoresData[key]
        
       if (country.inflation > 0) {
        // inflation increasing so we need to increase interest rates
        // how is the economy doing? 
        if (country.economicScore > 0) {
          // economy is doing well, we can increase interest rates
          country["sentiment"] = "Bullish"
          country["analysis"] = "Inflation increasing and economy is doing well. Interest rates could be increased to lower inflation without hurting the economy."
        } else if (country.economicScore < 0) {
          // economy is doing poorly, we should decrease interest rates
          country["sentiment"] = "Mixed-Bullish"
          country["analysis"] = "Inflation increasing and economy is slowing down. Interest rates should be increased to lower inflation but that would hurt a slowing economy."
        } else if (country.economicScore === 0) {
          // economy is doing poorly, we should decrease interest rates
          country["sentiment"] = "Mixed-Bullish"
          country["analysis"] = "Inflation increasing and economy is stagnant. Interest rates should be increased to lower inflation but that would hurt a stagnant economy."
        }
       } 
       
       else if (country.inflation < 0) {
        // in ifflation decreasing so we can decrease interest rates
        // how is the economy doing? 
        if (country.economicScore > 0) {
          // economy is doing well, we can decrease interest rates
          country["sentiment"] = "Bearish"
          country["analysis"] = "Inflation decreasing and economy is doing well. Interest rates could continue dropping to improve the economy."
        } else if (country.economicScore < 0) {
          // economy is doing poorly, further reason to decrease interest rates
          country["sentiment"] = "Bearish"
          country["analysis"] = "Inflation decreasing and economy is slowing down. Since inflation is decreasing, interest rates could be decreased to stimulate the slow economy."
        } else if (country.economicScore === 0) {
          // economy is stagnant, further reason to decrease interest rates
          country["sentiment"] = "Mixed-Bearish"
          country["analysis"] = "Inflation decreasing and economy is stagnant. Since inflation is decreasing, interest rates could be decreased to stimulate the stagnant economy."
        }
       }  
       
       else if (country.inflation === 0) {
        // inflation is stagnant so we need to increase interest rates
        // how is the economy doing? 
        if (country.economicScore > 0) {
          // economy is doing well, we can increase interest rates
          country["sentiment"] = "Bullish"
          country["analysis"] = "Inflation stagnant and economy is doing well. Interest rates could be increased to lower inflation without hurting the economy."
        } else if (country.economicScore < 0) {
          // economy is doing poorly, we should decrease interest rates
          country["sentiment"] = "Mixed"
          country["analysis"] = "Inflation stagnant and economy is slowing down. Interest rates should be increased to lower inflation but that would hurt a slowing economy."
          
        } else if (country.economicScore === 0) {
          // economy is stagnant, we should decrease interest rates
          country["sentiment"] = "Mixed"
          country["analysis"] = "Inflation stagnant and economy is stagnant. Interest rates could go either way depending on other factors."
        }
       } 
      })



      console.log(totalScoresData)

      // sort totalScoresData by totalScore
      const sortedKeys = Object.keys(totalScoresData).sort((a, b) => totalScoresData[b].inflation - totalScoresData[a].inflation)
      const sortedData = {}
      sortedKeys.map((key) => {
        sortedData[key] = totalScoresData[key]
      })



      // set the state with the sorted data


      setEvents(sortedData);


      setLoading(false);
      console.log("loading set to false")
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [])

  return (
    <div>
      <DashboardLayout>
        {
        isLoading ? 
          <p>Loading...</p>
         :  
         <Card className="space-y-4 p-8 m-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead> </TableHead>
                  <TableHead>Current Inflation Rate</TableHead>
                  <TableHead>Average Inflation Rate</TableHead>
                  <TableHead>Inflation Score</TableHead>
                  <TableHead>Economic Score</TableHead>
                  <TableHead>Sentiment</TableHead>
                  {/* <TableHead>Analysis</TableHead> */}
                 
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {
                  Object.keys(totalScoresData).map((key) => {
                    const country = totalScoresData[key]
                    return (
                      <TableRow>
                        <TableCell>{key}</TableCell>
                        <TableCell>{ `${country.rate}%` }</TableCell>
                        <TableCell>{ `${country.averageRate}%` }</TableCell>
                        <TableCell>{country.inflation}</TableCell>
                        <TableCell>{country.economicScore}</TableCell>
                        <TableCell>{country.sentiment}</TableCell>
                        {/* <TableCell>{country.analysis}</TableCell> */}
             
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
            </Card>

          
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Pulse;