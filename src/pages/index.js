import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Card } from '@/components/ui/card'

import { Loader } from '@/components/ui/loader'


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
      const interestRateData = getDataSortedByTotalScore(jsonData, interestRatesKeys, null)
      const growthData = getDataSortedByTotalScore(jsonData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys))
   

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
          totalScoresData[key]["inflationRateActual"] = rateEvent.actual
          totalScoresData[key]["inflationRatePrevious"] = rateEvent.previous
        }

        totalScoresData[key]["averageRate"] = 2.0
      })

      Object.keys(interestRateData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }

        console.log(interestRateData)

        if(interestRateData[key]["events"][0]) {
          totalScoresData[key]["interestRateActual"] = interestRateData[key]["events"][0]["actual"]
          totalScoresData[key]["interestRatePrevious"] = interestRateData[key]["events"][0]["previous"]
          if (interestRateData[key]["events"][0]["actual"] > interestRateData[key]["events"][0]["previous"]) {
            totalScoresData[key]["interestRateScore"] = +1
          } else if (interestRateData[key]["events"][0]["actual"] < interestRateData[key]["events"][0]["previous"]) {
            totalScoresData[key]["interestRateScore"] = -1
          } else {
            totalScoresData[key]["interestRateScore"] = 0
          }
        }
        
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

  const getScoreCell = (score) => {
    return <TableCell className={`${score > 0 ? 'bg-green-500' : score  ==  0 ? 'bg-gray-500' : 'bg-red-500'} text-white font-bold`}>
     { score > 0 ? `+${score}` : score} 
    </TableCell>
  
  }

  return (
    <div>
      <DashboardLayout>
        {
        isLoading ? 
          <div className='flex flex-col w-full h-dvh justify-center items-center'> 
              <Loader />
          </div>
         :  
         <Card className="space-y-4 p-8 m-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border-l-0 border-t-0"> </TableHead>
                  <TableHead colspan={ 2 }>Interest Rates</TableHead>
                  <TableHead colspan= { 2}> Inflation</TableHead>
                  <TableHead colspan = { 3 }> Scores </TableHead>

                  
                  {/* <TableHead>Analysis</TableHead> */}
                 
                </TableRow>
                <TableRow >
                <TableHead className="border-l-0 border-t-0"> </TableHead>
                  
                  <TableHead> Current</TableHead>
                  <TableHead> Previous</TableHead>
                 
                 
                  <TableHead>Current</TableHead>
                  <TableHead>Previous</TableHead>

                  <TableHead>Interest Rate Score</TableHead>
                  <TableHead>Inflation Score</TableHead>
                  
                  <TableHead>Economic Score</TableHead>
                  <TableHead>Sentiment</TableHead>

                  
               
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {
                  Object.keys(totalScoresData).map((key) => {
                    const country = totalScoresData[key]
                    return (
                      <TableRow>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{ `${country.interestRateActual}` }</TableCell>
                        <TableCell>{ `${country.interestRatePrevious}` }</TableCell>

                        <TableCell>{ `${country.inflationRateActual}%` }</TableCell>
                        <TableCell>{ `${country.inflationRatePrevious}%` }</TableCell>

                  
                        {getScoreCell(country.interestRateScore)}
                        {getScoreCell(country.inflation)}
                        
                        {getScoreCell(country.economicScore)}
                      
                        <TableCell> Coming Soon </TableCell>
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