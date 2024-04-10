import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader'
import { EconomicOverviewDataTable } from '@/components/ui/economic-overview-data-table';
import { MonitorDataTable } from '@/components/ui/monitor-data-table';
import { majorForexPairs  } from '@/utils/event-names';
import { ForexPairComparisonTable } from '@/components/ui/forex-pair-comparison-table';


const Pulse = () => {
  // keep track of different arrays of events as part of one object
  const [totalScoresData , setEvents] = useState({});
  const [upcomingEvents , setUpcomingEvents] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('api/event-calendar')
      const jsonData = await data.json()

      const inflationData = getDataSortedByTotalScore(jsonData, inflationKeys, null)
      const employmentData = getDataSortedByTotalScore(jsonData, employmentKeys, null)
      const interestRateData = getDataSortedByTotalScore(jsonData, interestRatesKeys, null)
      const growthData = getDataSortedByTotalScore(jsonData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys))

      const totalScoresData = {}

      Object.keys(inflationData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }
 
        totalScoresData[key]["inflationScore"] = inflationData[key].totalScore
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
        totalScoresData[key]["employmentScore"] = employmentData[key].totalScore
      })

      Object.keys(growthData).map((key) => { 
        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }
        totalScoresData[key]["growthScore"] = growthData[key].totalScore
      })

      // add a total score for each country
      Object.keys(totalScoresData).map((key) => { 
        const country = totalScoresData[key]
        country["economicScore"] =  country.employmentScore + country.growthScore
      })

      Object.keys(totalScoresData).map((key) => { 
        const country = totalScoresData[key]
        country["totalScore"] =  (country.inflationScore + country.economicScore) / 2
      })

      // sort totalScoresData by totalScore
      const sortedKeys = Object.keys(totalScoresData).sort((a, b) => totalScoresData[b].totalScore - totalScoresData[a].totalScore)
      const sortedData = {}
      sortedKeys.map((key) => {
        sortedData[key] = totalScoresData[key]
      })

      const upcomingEventsForAllCountries = []

      Object.keys(jsonData).map((key) => {
        const country = jsonData[key]
        const upcomingEventsForCountry = country.filter((event) => event.actual === null )

        if (totalScoresData[key] === undefined) {
          totalScoresData[key] = {}
        }

        upcomingEventsForAllCountries.push(upcomingEventsForCountry)
      })

      // flat map the upcoming events for each country into one array
      const upcomingEvents = upcomingEventsForAllCountries.flat()

      // set the state with the sorted data
      setEvents(sortedData);
      setUpcomingEvents(upcomingEvents)


      if (sortedData) {
        setLoading(false);
        console.log("loading set to false")
      }
      
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [])

  const diffDays = (date1, date2) => {
    return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24)) 
  }

  const formattedDaySchedule = (date1, date2) => {
    return diffDays(date1, date2) > 1 ? `${diffDays(date1, date2)} days` : `${diffDays(date1, date2)} day`
  }
  
  const Style = {
    Wrapper : "grid grid-cols-2 gap-4 p-8",
    InternalCard: " space-y-4 p-8 "
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
      
            <div className={Style.Wrapper}>

            

              <div className='col-span-2'> 
              <EconomicOverviewDataTable key={"Overview Table"} title="Economic Overview" data={totalScoresData} />
              </div>


              {/* { upcomingEvents &&
              <Card className={Style.InternalCard}>
              <h2> Upcoming Events </h2>

              <Table>
              <TableHeader>
                <TableRow className="!border-0">
                <TableHead className="font-bold" > Event</TableHead>
                <TableHead className="font-bold" > Country</TableHead>
                  
                  <TableHead className="font-bold"> When </TableHead>
                  
                  <TableHead className="font-bold" > Forecast </TableHead>
                  <TableHead className="font-bold"> Previous </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            { 

            upcomingEvents && upcomingEvents
            .filter((event) => {
                return diffDays(new Date(event.date), Date.now()) >= 0 && majorEventsKeys.includes(event.type)
                })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event, index) => {
              return (
                      <TableRow>
                        <TableCell className=" bg-background  font-bold">{event.type} {event.comparison && `(${event.comparison})` }</TableCell>
                        <TableCell className=" bg-background  ">{event.country}</TableCell>
                        
                        <TableCell className={`bg-background ${ diffDays(new Date(event.date), Date.now()) == 1 ? `text-accent font-bold`   : `text-foreground`    }`}>{` In ${formattedDaySchedule(new Date(event.date), Date.now())}  (${new Date(event.date).toDateString()}) `}</TableCell>
                        
                        <TableCell className=" bg-background">{event.estimate}</TableCell>
                        <TableCell className=" bg-background ">{event.previous}</TableCell>
                      </TableRow>
                    )
            })

            

            

          
          
              //  totalScoresData["upcomingEvents"]
              //  .filter((event) => {
              //   return diffDays(new Date(event.date), Date.now()) >= 0 && majorEventsKeys.includes(event.type) 
              //  })
              //  .map((event, index) => { 
              //     return (
              //       <TableRow>
              //         <TableCell className=" bg-background  font-bold">{event.type} {event.comparison && `(${event.comparison})` }</TableCell>
              //         <TableCell className=" bg-background  ">{key}</TableCell>
                      
              //         <TableCell className=" bg-background  ">{` ${new Date(event.date)} (in ${diffDays(new Date(event.date), Date.now())} days)`}</TableCell>
              //         <TableCell className=" bg-background">{event.actual}</TableCell>
              //         <TableCell className=" bg-background">{event.estimate}</TableCell>
              //         <TableCell className=" bg-background ">{event.previous}</TableCell>
              //       </TableRow>
              //     )
              //       })
            
            
            } 
            
          </TableBody>
          </Table>

              </Card>
              } */}

              <MonitorDataTable 
                tableTitle="Interest Rate Monitor" 
                valueTitle={"Interest Rates"} 
                data={totalScoresData} 
                actualKey={"interestRateActual"}
                previousKey={"interestRatePrevious"} />

              <MonitorDataTable 
                tableTitle="Inflation Rate YoY Monitor" 
                valueTitle={"Inflation Rate YoY"} 
                data={totalScoresData} 
                actualKey={"inflationRateActual"}
                previousKey={"inflationRatePrevious"} />
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Pulse;