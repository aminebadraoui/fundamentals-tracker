import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader'

import { majorForexPairs  } from '@/utils/event-names';
import { ForexPairComparisonTable } from '@/components/ui/forex-pair-comparison-table';
import { TitledCard } from '@/components/generic/titled-card';

import { getPairData } from '@/utils/pair-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/generic/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/score-colors';

import { cn } from "@/lib/utils"



const Scanner = ({pair}) => {
  const countries = majorForexPairs[pair].countries
 
  // keep track of different arrays of events as part of one object
  const [pairData , setPairData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);

    try {
      const data = await fetch(`../../api/event-calendar?countries=${countries}`)
      const jsonData = await data.json()

      const pairData_local = getPairData(pair, jsonData)


      // set the state with the sorted data
      setPairData(pairData_local);



      if (pairData_local) {
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
    Title: "flex flex-row w-full justify-between" ,
    Wrapper : " flex flex-col w-full space-y-4 p-8",
    InternalCard: " "
  }

  console.log("pairData", pairData)

  return (
    <div>
      <DashboardLayout>
        {
        isLoading ? 
          <div className='flex flex-col w-full h-dvh justify-center items-center'> 
              <Loader />
          </div>
         :  
      
            pairData && <div className={Style.Wrapper}>
              <div className={Style.Title}>
                <h1 className="text-secondary-foreground mb-8"> {pair} </h1>
                <h1 className="text-secondary-foreground mb-8"> {pairData.totalScore} </h1>
              </div>

              { [pair].map((pair) => {

             
                return (
                  pairData && <div className=' space-y-8'>

                      <TitledCard key={`${pair}_economy_card_`} className={Style.InternalCard} title="Economy">
                       <Table>
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='bg-transparent border-0 hover:bg-transparent'>  </TableHead>
                            <TableHead className='font-bold'> {pairData.country_1.name} </TableHead>
                            <TableHead className='font-bold'> {pairData.country_2.name} </TableHead>
                            <TableHead className='font-bold'> {`${pair}`}</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow>
                              <TableCell className='font-bold'> Inflation Score </TableCell>
                              <TableCell> {pairData.country_1.inflationScore.toFixed(2)} </TableCell>
                              <TableCell> {pairData.country_2.inflationScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(pairData.inflationScore)}`}> {pairData.inflationScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Interest Rate Score </TableCell>
                              <TableCell> {pairData.country_1.interestRateScore.toFixed(2)} </TableCell>
                              <TableCell> {pairData.country_2.interestRateScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(pairData.interestRateScore)}`}> {pairData.interestRateScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'>  Employement Score </TableCell>
                              <TableCell> {pairData.country_1.employmentScore.toFixed(2)} </TableCell>
                              <TableCell> {pairData.country_2.employmentScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(pairData.employmentScore)}`}> {pairData.employmentScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Housing Score </TableCell>
                              <TableCell> {pairData.country_1.housingScore.toFixed(2)} </TableCell>
                              <TableCell> {pairData.country_2.housingScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(pairData.housingScore)}`}> {pairData.housingScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Growth Score </TableCell>
                              <TableCell> {pairData.country_1.growthScore.toFixed(2)} </TableCell>
                              <TableCell> {pairData.country_2.growthScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(pairData.growthScore)}`}> {pairData.growthScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Total Average Score </TableCell>
                              <TableCell colSpan={2}>  </TableCell>
                              <TableCell className={ `${getScoreBackgroundColor(pairData.totalEconomicScore)} font-bold text-primary-foreground`}> {pairData.totalEconomicScore} </TableCell>
                            </TableRow>
                        </TableBody>
                        

                       </Table>
                        </TitledCard>
                      <TitledCard key={`${pair}_institional_Positioning_card`} className={Style.InternalCard} title="Institutional Positioning">
                        <Table> 
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='font-bold'> Net Positions Current </TableHead>
                            <TableHead className='font-bold'> Net Positions Old </TableHead>
                            <TableHead className='font-bold'> Score </TableHead>
                          </TableRow>
                        </TableHeader>
                        </Table>   
                        </TitledCard>
                   
                      <TitledCard key={`${pair}_retail_positioning_card`} className={Style.InternalCard} title="Retail Positioning">
                      <Table> 
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='font-bold'> Net Positions Current </TableHead>
                            <TableHead className='font-bold'> Net Positions Old </TableHead>
                            <TableHead className='font-bold'> Score </TableHead>
                          </TableRow>
                        </TableHeader>
                        </Table>
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