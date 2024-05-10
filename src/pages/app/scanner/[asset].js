import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Loader } from '@/components/ui/loader'
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/pair-data';
import { assets } from '@/utils/event-names';

import { ChartComponent } from '@/components/ui/chart-component';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import { fetchCotData } from '@/utils/getCotData';

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

const fetchData = async (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${url}?${queryString}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};


const Scanner = (props) => {
  const asset = props.params.asset;
  const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });
  // keep track of different arrays of events as part of one object
  const [assetData , setAssetData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const [cotData, eventData, weeklyPriceData, newsSentimentData] = await Promise.all([
        fetchCotData(asset),,
        fetchData('/api/getEventData', { countries: assets[asset].countries.join(',') }),
        fetchData('/api/getWeeklyPriceData', { asset }),
        fetchData('/api/getNewsSentimentData', { symbol: assets[asset].apiSymbol })
      ]);

      const assetDataJson = processAssetData(asset, eventData, cotData, newsSentimentData, weeklyPriceData);

      // set the state with the sorted data
      setAssetData(assetDataJson);

      console.log("assetDataJson", assetDataJson)

      if (assetDataJson) {
        setLoading(false);
      }
      
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [asset])

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
    
         assetData && <div className={Style.Wrapper}>
              <div className={Style.Title}>
                <h1 className="text-secondary-foreground mb-8"> {asset} </h1>
              </div>

              <div className='flex space-x-4' >
              { assetData.chartData && <ChartComponent data={assetData.chartData}  symbol={asset} timeframe={'Weekly'}></ChartComponent>}
             
              { [asset].map((asset) => {
                return (
                  assetData && 
                  <div className='flex flex-col space-y-4'>
                    <GaugeComponent
                              value={assetData.score}  
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

                    <TitledCard key={`${asset}_economy_card_`} className={Style.InternalCard} title="Economy">
                        
                        { assetData.countries.length == 2 ? <Table>
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='bg-transparent border-0 hover:bg-transparent'>  </TableHead>
                            <TableHead className='font-bold'> {assetData.economics.countriesEvents[0].country} </TableHead>
                            <TableHead className='font-bold'> {assetData.economics.countriesEvents[1].country} </TableHead>
                            <TableHead className='font-bold'> {`${asset}`}</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow>
                              <TableCell className='font-bold'> Inflation Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].inflationData.totalScore.toFixed(2)} </TableCell>
                              <TableCell>  {assetData.economics.countriesEvents[1].inflationData.totalScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(assetData.economics.inflationScore)}`}> {assetData.economics.inflationScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Interest Rate Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].interestRateData.totalScore.toFixed(2)} </TableCell>
                              <TableCell>  {assetData.economics.countriesEvents[1].interestRateData.totalScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(assetData.economics.interestRateScore)}`}> {assetData.economics.interestRateScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'>  Employement Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].employmentData.totalScore.toFixed(2)} </TableCell>
                              <TableCell>  {assetData.economics.countriesEvents[1].employmentData.totalScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(assetData.economics.employmentScore)}`}> {assetData.economics.employmentScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Housing Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].housingData.totalScore.toFixed(2)} </TableCell>
                              <TableCell>  {assetData.economics.countriesEvents[1].housingData.totalScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(assetData.economics.housingScore)}`}> {assetData.economics.housingScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Growth Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].growthData.totalScore.toFixed(2)} </TableCell>
                              <TableCell>  {assetData.economics.countriesEvents[1].growthData.totalScore.toFixed(2)} </TableCell>
                              <TableCell className={ `${getScoreTextColor(assetData.economics.growthScore)}`}> {assetData.economics.growthScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} className='font-bold'> Final Score </TableCell>
                          
                              <TableCell className={ `${getScoreBackgroundColor(assetData.economics.score)} font-bold `}> {assetData.economics.score} </TableCell>
                            </TableRow>
                        </TableBody>
                        
                        </Table>  
                        
                        : <div></div>}
                    </TitledCard>

                    <TitledCard key={`${asset}_institional_Positioning_card`} className={Style.InternalCard} title="Institutional Positioning">
                      <Table> 
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='font-bold'> Longs </TableHead>
                          <TableHead className='font-bold'> Shorts </TableHead>
                          <TableHead className='font-bold'> Final Score </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell> {assetData.cot.institutional.long} </TableCell>
                          <TableCell> {assetData.cot.institutional.short} </TableCell>
                          <TableCell className={ `${getScoreBackgroundColor(assetData.cot.institutional.netScore)} font-bold `}> {assetData.cot.institutional.netScore} </TableCell>
                          </TableRow>
                      </TableBody>
                      </Table>   

                      <Table> 
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='font-bold'> Longs </TableHead>
                          <TableHead className='font-bold'> Longs Previous </TableHead>
                          <TableHead className='font-bold'> Final Score </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell> {assetData.cot.institutional.long} </TableCell>
                          <TableCell> {assetData.cot.institutional.longOld} </TableCell>
                          <TableCell className={ `${getScoreBackgroundColor(assetData.cot.institutional.longScore)} font-bold `}> {assetData.cot.institutional.longScore} </TableCell>
                          </TableRow>
                      </TableBody>
                      </Table>   

                      <Table> 
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='font-bold'> Shorts </TableHead>
                          <TableHead className='font-bold'> Shorts Previous </TableHead>
                          <TableHead className='font-bold'> Final Score </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell> {assetData.cot.institutional.short} </TableCell>
                          <TableCell> {assetData.cot.institutional.shortOld} </TableCell>
                          <TableCell className={ `${getScoreBackgroundColor(assetData.cot.institutional.shortScore)} font-bold `}> {assetData.cot.institutional.shortScore} </TableCell>
                          </TableRow>
                      </TableBody>
                      </Table>   
                    </TitledCard>
                    
                    {/* <TitledCard key={`${asset}_retail_positioning_card`} className={Style.InternalCard} title="Retail Positioning">
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
                          <TableCell> {assetData.retail.net_positions} </TableCell>
                          <TableCell> {assetData.retail.net_positions_old} </TableCell>
                          <TableCell className={ `${getScoreBackgroundColor(assetData.retail.score)} font-bold `}>  {assetData.retail.score} </TableCell>
                          </TableRow>
                      </TableBody>
                      </Table>
                    </TitledCard> */}

                    <TitledCard key={`${asset}_news_sentiment_card`} className={Style.InternalCard} title="News Sentiment">
                      <Table> 
                        <TableHeader>
                          {
                              assetData.news.newsSet && assetData.news.newsSet.length > 0 && 
                              <TableRow className='hover:bg-transparent'>
                              <TableHead className='font-bold'> Date</TableHead>
                              <TableHead className='font-bold'> Count </TableHead>
                            <TableHead className='font-bold'> Score </TableHead>
                          </TableRow>}
                        </TableHeader>
                        
                        <TableBody>
                        {
                          assetData.news.newsSet &&  assetData.news.newsSet.length > 0 && assetData.news.newsSet.map((news) => {
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
                          assetData.news.newsSet &&  assetData.news.newsSet.length > 0 && 
                          <TableRow>
                            <TableCell colSpan={2} className='font-bold'> 7-Day Average Score </TableCell>
                            <TableCell > {assetData.news.avgScore.toFixed(2)} </TableCell>
                          </TableRow>
                        }

                        {
                          assetData.news.newsSet &&  assetData.news.newsSet.length == 0 &&
                          <TableRow>
                            <TableCell colSpan={3}> No News Available </TableCell>
                          </TableRow>

                        }
                          <TableRow>
                            <TableCell colSpan={2} className='font-bold'> Final Score </TableCell>
                        
                            <TableCell className={ `${getScoreBackgroundColor(assetData.news.score)} font-bold `}> {assetData.news.score} </TableCell>
                          </TableRow>
                        </TableBody>
                        </Table>
                    </TitledCard>
                  </div>
                )  
              })
            }

              </div>
            

           
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};



export default Scanner;