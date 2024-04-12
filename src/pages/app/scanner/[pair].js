import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader'

import { majorForexPairs  } from '@/utils/event-names';
import { ForexPairComparisonTable } from '@/components/ui/forex-pair-comparison-table';
import { TitledCard } from '@/components/generic/titled-card';


const Scanner = ({pair}) => {
  const countries = majorForexPairs[pair]
 
  // keep track of different arrays of events as part of one object
  const [eventsWithScores , setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);

    try {
      const data = await fetch(`../../api/event-calendar?countries=${countries}`)
      const jsonData = await data.json()
      console.log("jsonData", jsonData)

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

    



      // set the state with the sorted data
      setEvents(totalScoresData);



      if (totalScoresData) {
        setLoading(false);
        console.log("loading set to false")
      }
      
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [pair])

  const Style = {
    Wrapper : "grid grid-cols-2 gap-4 p-8",
    InternalCard: " space-y-4 p-8 "
  }

  console.log("eventsWithScores", eventsWithScores)

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
              <h1 className="text-secondary-foreground mb-8"> {pair} </h1>

              { [pair].map((pair) => {
                return (
                  <div className='col-span-2'>
                    <TitledCard key={`${pair}_card`} title="Economy">
                      <ForexPairComparisonTable 
                        key={pair}
                        pair={pair} 
                        ticker1={majorForexPairs[pair][0]} 
                        ticker2={majorForexPairs[pair][1]} 
                        data={eventsWithScores} />
                      </TitledCard>
                     
                  </div> 

                )  
              })
            }
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export const getStaticPaths = async () => {
  const paths = Object.keys(majorForexPairs).map((pair) => { return {
    params: {
      pair: pair
    },

  }})
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = async ({params}) => {
  console.log(params)
  return {
    props: params
  }
}






export default Scanner;