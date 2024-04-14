import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader'
import { EconomicOverviewDataTable } from '@/components/ui/economic-overview-data-table';
import { MonitorDataTable } from '@/components/ui/monitor-data-table';

import { ForexPairComparisonTable } from '@/components/ui/forex-pair-comparison-table';

import { getEconomicOverviewData } from '@/utils/get-economic-overview-data';
import { getInflationRateMonitorData } from '@/utils/get-inflation-rate-monitor-data';
import { getInterestRateMonitorData } from '@/utils/get-interest-rate-monitor-data';
import { TitledCard } from '@/components/generic/titled-card';

const EconomicOverview = () => {
  // keep track of different arrays of events as part of one object
  const [economicOverviewData , setEconomicOverview] = useState(null);
  const [interestRateMonitorData , setInterestRateMonitorData] = useState(null);
  const [inflationRateMonitorData , setInflationtRateMonitorData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('../api/event-calendar')
      const rawData = await data.json()

      console.log("rawData", rawData)

      const inflationData = getDataSortedByTotalScore(rawData, inflationKeys, null)
      const employmentData = getDataSortedByTotalScore(rawData, employmentKeys, null)
      const growthData = getDataSortedByTotalScore(rawData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys))
      const interestRateData = getDataSortedByTotalScore(rawData, interestRatesKeys, null)

      const economicOverviewData_local = getEconomicOverviewData(inflationData, employmentData, growthData)
      setEconomicOverview(economicOverviewData_local)

      const interestRateMontorData_local = getInterestRateMonitorData(interestRateData)
      setInterestRateMonitorData(interestRateMontorData_local)

      const inflationRateMontorData_local = getInflationRateMonitorData(inflationData)
      setInflationtRateMonitorData(inflationRateMontorData_local)

      // const upcomingEventsForAllCountries = []

      // Object.keys(jsonData).map((key) => {
      //   const country = jsonData[key]
      //   const upcomingEventsForCountry = country.filter((event) => event.actual === null )

      //   if (totalScoresData[key] === undefined) {
      //     totalScoresData[key] = {}
      //   }

      //   upcomingEventsForAllCountries.push(upcomingEventsForCountry)
      // })

      // // flat map the upcoming events for each country into one array
      // const upcomingEvents = upcomingEventsForAllCountries.flat()

      // set the state with the sorted data
      // setEvents(sortedData);
      // setUpcomingEvents(upcomingEvents)


      if (economicOverviewData 
        && interestRateMonitorData 
        && inflationRateMonitorData) {
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
      
         economicOverviewData 
         && interestRateMonitorData 
         && inflationRateMonitorData && <div className={Style.Wrapper}>
              <div className='col-span-2'> 
                <h1 className="text-secondary-foreground mb-8"> Economic Overview </h1>
                
                <TitledCard title="Scores">
                  <EconomicOverviewDataTable key={"Overview Table"}  data={economicOverviewData} />
                </TitledCard>
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
                data={interestRateMonitorData}  />

              <MonitorDataTable 
                tableTitle="Inflation Rate YoY Monitor" 
                valueTitle={"Inflation Rate YoY"} 
                data={inflationRateMonitorData}  />
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default EconomicOverview;