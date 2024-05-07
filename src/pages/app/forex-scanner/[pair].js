import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Loader } from '@/components/ui/loader'
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';

import { ChartComponent } from '@/components/ui/chart-component';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import dynamic from "next/dynamic";

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
    return withSubscription(context, session, async(context) => {
      const params = context.params
     
        return { 
          props: {
            params, 
          } 
          };
      })
    })
}

const Scanner = (props) => {
  const pair = props.params.pair;
  const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });
  // keep track of different arrays of events as part of one object
  const [pairData , setPairData] = useState(null);
  const [isLoading, setLoading] = useState(false);


    const candlestickData = [
      { time: '2018-12-22', open: 32.51, high: 34.10, low: 32.10, close: 33.98 },
      { time: '2018-12-23', open: 33.98, high: 34.50, low: 33.11, close: 33.82 },
      // Add more data points similarly
  ];


  const handleDownload = async () => {
    setLoading(true);

    try {
      const pairData_local = await fetch(`../../api/forex-pair-data?pair=${pair}`)

      const pairData_local_json = await pairData_local.json()

      // set the state with the sorted data
      setPairData(pairData_local_json);

      console.log("pairData_local_json", pairData_local_json)

      if (pairData_local_json) {
        setLoading(false);
      }
      
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [pair])

  const Style = {
    Title: "flex flex-row w-full justify-between items-start" ,
    Wrapper : " flex flex-col w-full  ",
    InternalCard: " "
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
      
            pairData && <div className={Style.Wrapper}>
              <div className={Style.Title}>
                <h1 className="text-secondary-foreground mb-8"> {pair} </h1>
                <GaugeComponent
                                value={pairData.totalScore} 
                                type="radial"
                                labels={{
                                  valueLabel: {
                                    matchColorWithArc: true,
                                  },
                                  tickLabels: {
                                    type: "inner",
                                    ticks: [
                                      { value: -100 },
                                      { value: -50 },
                                      { value: -25 },
                                      { value: 0 },
                                      { value: 25 },
                                      { value: 50 },
                                      { value: 100 },
                                    ]
                                  }
                                }}
                                arc={{
                                  colorArray: ['#c20b0a','#009900'],
                                  subArcs: [{limit: -50}, {limit: -25}, {limit: 25}, {limit: 50}, {}],
                                  padding: 0.02,
                                  width: 0.3
                                }}
                                minValue={-100}
                                maxValue={100}
                                pointer={{
                                  elastic: true,
                                  animationDelay: 0
                                }}/>
              
              </div>

              { [pair].map((pair) => {
                return (
                  pairData && <div className=' space-y-8'>
                    {console.log("news section", pairData.news)}

                    <div className='flex space-x-8'>
                      
                      <ChartComponent data={pairData.weekly_price_data} symbol={pair} timeframe={'Weekly'}></ChartComponent>
                    
                      <div className='flex flex-col space-y-4'>
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
                                <TableCell colSpan={3} className='font-bold'> Final Score </TableCell>
                            
                                <TableCell className={ `${getScoreBackgroundColor(pairData.totalEconomicScore)} font-bold `}> {pairData.totalEconomicScore} </TableCell>
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
                              <TableHead className='font-bold'> Final Score </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell> {pairData.institutional.net_positions} </TableCell>
                              <TableCell> {pairData.institutional.net_positions_old} </TableCell>
                              <TableCell className={ `${getScoreBackgroundColor(pairData.institutional.score)} font-bold `}> {pairData.institutional.score} </TableCell>
                              </TableRow>
                          </TableBody>
                          </Table>   
                          </TitledCard>
                      
                        <TitledCard key={`${pair}_retail_positioning_card`} className={Style.InternalCard} title="Retail Positioning">
                        <Table> 
                          <TableHeader>
                            <TableRow className='hover:bg-transparent'>
                              <TableHead className='font-bold'> Net Positions Current </TableHead>
                              <TableHead className='font-bold'> Net Positions Old </TableHead>
                              <TableHead className='font-bold'> Final Score </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell> {pairData.retail.net_positions} </TableCell>
                              <TableCell> {pairData.retail.net_positions_old} </TableCell>
                              <TableCell className={ `${getScoreBackgroundColor(pairData.retail.score)} font-bold `}>  {pairData.retail.score} </TableCell>
                              </TableRow>
                          </TableBody>
                          </Table>
                          </TitledCard>

                      

                          <TitledCard key={`${pair}_news_sentiment_card`} className={Style.InternalCard} title="News Sentiment">
                            <Table> 
                              <TableHeader>
                                {
                                    pairData.news.news_set.length > 0 && 
                                    <TableRow className='hover:bg-transparent'>
                                    <TableHead className='font-bold'> Date</TableHead>
                                    <TableHead className='font-bold'> Count </TableHead>
                                  <TableHead className='font-bold'> Score </TableHead>
                                </TableRow>}
                              </TableHeader>
                              
                              <TableBody>
                              {
                                pairData.news.news_set.length > 0 && pairData.news.news_set.map((news) => {
                                    return (
                                      <TableRow>
                                        <TableCell> {news.date} </TableCell>
                                        <TableCell> {news.count} </TableCell>
                                        <TableCell>  {news.score.toFixed(2)} </TableCell>
                                      </TableRow>
                                    )
                                  })
                                }

                              {
                                pairData.news.news_set.length > 0 && 
                                <TableRow>
                                  <TableCell colSpan={2} className='font-bold'> 7-Day Average Score </TableCell>
                                  <TableCell > {pairData.news.avg_score.toFixed(2)} </TableCell>
                                </TableRow>
                              }

                              {
                                pairData.news.news_set.length == 0 &&
                                <TableRow>
                                  <TableCell colSpan={3}> No News Available </TableCell>
                                </TableRow>

                              }
                                <TableRow>
                                  <TableCell colSpan={2} className='font-bold'> Final Score </TableCell>
                              
                                  <TableCell className={ `${getScoreBackgroundColor(pairData.news.total_news_score)} font-bold `}> {pairData.news.total_news_score} </TableCell>
                                </TableRow>
                              </TableBody>
                              </Table>
                          </TitledCard>
                      </div>
                    </div>

                    

                     
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



export default Scanner;