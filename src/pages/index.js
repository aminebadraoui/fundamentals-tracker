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
    return <TableCell className={`${score > 0 ? 'bg-bullish' : score  ==  0 ? 'bg-neutral' : 'bg-bearish'}  `}>
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
         <div className='flex flex-col'>

           <Card className="space-y-4 p-8 m-8">
          <h2> Economic Overview </h2>
            <Table>
              <TableHeader>
                <TableRow className="!border-0">
                  <TableHead className="bg-transparent border-0" font-bold> </TableHead>
                  <TableHead className="font-bold"  colspan = { 3 }> Scores </TableHead>
                </TableRow>

                <TableRow>
                <TableHead className="bg-transparent border-0 font-bold"> </TableHead>
                  <TableHead className="font-bold" >Inflation Score</TableHead>
                  <TableHead className="font-bold" >Economic Score</TableHead>
                  <TableHead className="font-bold" >Interest Rate Score</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {
                  Object.keys(totalScoresData).map((key) => {
                    const country = totalScoresData[key]
                    return (
                      <TableRow>
                        <TableCell className="text-primary-foreground bg-primary font-bold">{key}</TableCell>
                        
                        {getScoreCell(country.inflation.toFixed(2))}
                        {getScoreCell(country.economicScore.toFixed(2))}
                        {getScoreCell(country.interestRateScore.toFixed(2))}

                       
             
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
            </Card>


            <div className='flex flex row justify-left'>
              <Card className="space-y-4 p-8 m-8">
                  <h2> Interest Rate Monitor </h2>

                  <Table>
                  <TableHeader>
                    <TableRow className="!border-0">
                      <TableHead className="bg-transparent border-0"   > "" </TableHead>
                      <TableHead className="font-bold"  colspan={ 2 }>Interest Rates</TableHead>
                    </TableRow>

                    <TableRow>
                    <TableHead className=" border-0 bg-transparent "> </TableHead>
                      <TableHead className="font-bold" > Current</TableHead>
                      <TableHead className="font-bold"  >  Previous</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                {
                  Object.keys(totalScoresData).map((key) => {
                    const country = totalScoresData[key]
                    const cellBg = country.interestRateActual > country.interestRatePrevious ? 'bg-bullish' 
                    : country.interestRateActual < country.interestRatePrevious ?  'bg-bearish' : 'bg-neutral'
                  
                    return (
                      <TableRow>
                        <TableCell className=" bg-primary text-primary-foreground font-bold">{key}</TableCell>
                        <TableCell className={cellBg}>{ `${country.interestRateActual}` }</TableCell>
                        <TableCell className={cellBg}>{ `${country.interestRatePrevious}` }</TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
              </Table>

              </Card>

              <Card className="space-y-4 p-8 m-8">
                <h2> Inflation Rate YoY Monitor </h2>

                <Table>
                  <TableHeader>
                  <TableRow className="!border-0">
                      <TableHead className=" bg-transparent border-0"> </TableHead>
                      <TableHead colspan= { 3}> Core Inflation Rate YoY</TableHead>
                    </TableRow>

                    <TableRow>
                      <TableHead className="bg-transparent border-0"> </TableHead>
                      <TableHead className="font-bold" >Current</TableHead>
                      <TableHead className="font-bold" >Previous</TableHead>
                      <TableHead className="font-bold" >Goal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                {
                  Object.keys(totalScoresData).map((key) => {
                    const country = totalScoresData[key]
                    const cellBg = country.inflationRateActual > country.inflationRatePrevious ? 'bg-bullish' 
                    : country.inflationRateActual < country.inflationRatePrevious ?  'bg-bearish' : 'bg-neutral'
                  
                    return (
                      <TableRow>
                        <TableCell className="text-primary-foreground font-bold bg-primary">{key}</TableCell>
                        
                        <TableCell className={cellBg}>{ `${country.inflationRateActual}%` }</TableCell>
                        <TableCell className={cellBg}>{ `${country.inflationRatePrevious}%` }</TableCell>
                        <TableCell className={cellBg}>{ `2%` }</TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
              </Table>

              </Card>

            </div>

         </div>
        

          
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Pulse;