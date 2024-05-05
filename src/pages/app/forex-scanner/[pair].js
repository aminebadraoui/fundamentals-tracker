import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader'

import { majorForexPairs  } from '@/utils/event-names';
import { ForexPairComparisonTable } from '@/components/ui/forex-pair-comparison-table';
import { TitledCard } from '@/components/shadcn/titled-card';

import { getPairData } from '@/utils/pair-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import fs from 'fs';
import ScoreIndicator from '@/components/ui/score-indicator';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
    return withSubscription(context, session, async(context) => {
      const params = context.params
      console.log('params', params)
      const cot_2024_currencies_path = 'public/assets/cot-data/2024/currencies.xml';
      const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');

      try {
        const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);

        return { 
          props: {
            params,
            cot_2024_currencies: cot_2024_currencies_json ,
            } 
          };
      } catch (error) {
        console.error('Failed to parse COT data:', error);
        return { props: { error: 'Failed to load data' } };
      }
      })
    })
}

const Scanner = (props) => {
  const pair = props.params.pair;
  const cot_2024_currencies = props.cot_2024_currencies;
  const countries = majorForexPairs[pair].countries

  const cot_for_pair = findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_2024_currencies)

  
 
  // keep track of different arrays of events as part of one object
  const [pairData , setPairData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const data = await fetch(`../../api/event-calendar?countries=${countries}`)
      const jsonData = await data.json()

      const last_sma50 = await fetch(`../../api/technical-sma?symbol=${pair}.FOREX&period=20`)
      const last_sma50_json = await last_sma50.json()

      const last_sma_200 = await fetch(`../../api/technical-sma?symbol=${pair}.FOREX&period=50`)
      const last_sma200_json = await last_sma_200.json()

      const last_close = await fetch(`../../api/last-close?symbol=${pair}.FOREX`)
      const last_close_json = await last_close.json()

      const news_sentiment = await fetch(`../../api/news-sentiment?symbol=${pair}.FOREX`)
      const news_sentiment_json = await news_sentiment.json()

      const technical_data_for_pair = {
        last_sma_50: last_sma50_json,
        last_sma_200: last_sma200_json,
        last_close: last_close_json
      }

      const news_data_for_pair = {
        news_sentiment: news_sentiment_json
      }

      const pairData_local = getPairData(pair, jsonData, cot_for_pair, technical_data_for_pair, news_data_for_pair)
      console.log(pairData_local)

      // set the state with the sorted data
      setPairData(pairData_local);

      if (pairData_local) {
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
    Title: "flex flex-row w-full justify-between" ,
    Wrapper : " flex flex-col w-full space-y-4 p-8",
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
                <ScoreIndicator score={pairData.totalScore} />
              
              </div>

              { [pair].map((pair) => {
                return (
                  pairData && <div className=' space-y-8'>
                    {console.log("news section", pairData.news)}

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
                            <TableHead className='font-bold'> Final Score </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell> {pairData.institutional.net_positions} </TableCell>
                            <TableCell> {pairData.institutional.net_positions_old} </TableCell>
                            <TableCell className={ `${getScoreBackgroundColor(pairData.institutional.score)} font-bold text-primary-foreground`}> {pairData.institutional.score} </TableCell>
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
                            <TableCell className={ `${getScoreBackgroundColor(pairData.retail.score)} font-bold text-primary-foreground`}>  {pairData.retail.score} </TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                        </TitledCard>

                        <TitledCard key={`${pair}_technicals_card`} className={Style.InternalCard} title="Technicals">
                          <Table> 
                            <TableHeader>
                              <TableRow className='hover:bg-transparent'>
                                <TableHead className='font-bold'> Last Close Price</TableHead>
                                <TableHead className='font-bold'> 20 Daily Moving Average </TableHead>
                                <TableHead className='font-bold'> 50 Daily Moving Average </TableHead>
                                <TableHead className='font-bold'> Final Score </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell> {pairData.technicals.last_close} </TableCell>
                                <TableCell> {pairData.technicals.last_sma_50} </TableCell>
                                <TableCell> {pairData.technicals.last_sma_200} </TableCell>
                                <TableCell className={ `${getScoreBackgroundColor(pairData.technicals.sma_score)} font-bold text-primary-foreground`}>  {pairData.technicals.sma_score} </TableCell>
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
                           
                                <TableCell className={ `${getScoreBackgroundColor(pairData.news.total_news_score)} font-bold text-primary-foreground`}> {pairData.news.total_news_score} </TableCell>
                              </TableRow>
                            </TableBody>
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



export default Scanner;