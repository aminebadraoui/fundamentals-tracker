import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'

import { Loader } from '@/components/ui/loader'

import {  cryptoAssets  } from '@/utils/event-names';

import { TitledCard } from '@/components/shadcn/titled-card';

import { getCryptoData } from '@/utils/crypto-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import dynamic from "next/dynamic";

import fs from 'fs';


export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
    return withSubscription(context, session, async(context) => {
      const params = context.params;
      const cot_2024_bitcoin_path = 'public/assets/cot-data/2024/bitcoin.xml';
      const cot_2024_bitcoin_xml = fs.readFileSync(cot_2024_bitcoin_path, 'utf-8');

      try {
        const cot_2024_bitcoin_json = await parseCotData(cot_2024_bitcoin_xml);

        return { 
          props: {
          params,
          cot_2024_bitcoin: cot_2024_bitcoin_json 
          } 
          };
      } catch (error) {
        console.error('Failed to parse COT data:', error);
        return { props: { error: 'Failed to load data' } };
      }
    })
  })
}

const CryptoScanner = (props) => {

  console.log("props", props.params)

  const pair = props.params.crypto;
  const cot_2024_bitcoin = props.cot_2024_bitcoin;
  const countries = cryptoAssets[pair].countries

  const cot_for_pair = findLatestCotDataForAsset(cryptoAssets[pair].cotName, cot_2024_bitcoin)
  const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });


  // keep track of different arrays of events as part of one object
  const [pairData , setPairData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const data = await fetch(`../../api/event-calendar?countries=${countries}`)
      const jsonData = await data.json()

      const last_sma50 = await fetch(`../../api/technical-sma?symbol=${cryptoAssets[pair].apiSymbol}&period=20`)
      const last_sma50_json = await last_sma50.json()

      const last_sma_200 = await fetch(`../../api/technical-sma?symbol=${cryptoAssets[pair].apiSymbol}&period=50`)
      const last_sma200_json = await last_sma_200.json()

      const last_close = await fetch(`../../api/last-close?symbol=${cryptoAssets[pair].apiSymbol}`)
      const last_close_json = await last_close.json()

      const news_sentiment = await fetch(`../../api/news-sentiment?symbol=${cryptoAssets[pair].apiSymbol}`)
      const news_sentiment_json = await news_sentiment.json()

     

      const technical_data_for_pair = {
        last_sma_50: last_sma50_json,
        last_sma_200: last_sma200_json,
        last_close: last_close_json
      }

      const news_data_for_pair = {
        news_sentiment: news_sentiment_json
      }

      console.log("news_data_for_pair", news_data_for_pair)

      const pairData_local = getCryptoData(pair, jsonData, cot_for_pair, technical_data_for_pair, news_data_for_pair)
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
  }, [])

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

                      <TitledCard key={`${pair}_economy_card_`} className={Style.InternalCard} title="US Economy">
                       <Table>
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='bg-transparent border-0 hover:bg-transparent'>  </TableHead>
                            <TableHead className='font-bold'> {pairData.country_1.name} </TableHead>
                            <TableHead className='font-bold'> {`${pair}`}</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow>
                              <TableCell className='font-bold'> Inflation Score </TableCell>
                              <TableCell> {pairData.country_1.inflationScore.toFixed(2)} </TableCell>
                              
                              <TableCell className={ `${getScoreTextColor(pairData.inflationScore)}`}> {pairData.inflationScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Interest Rate Score </TableCell>
                              <TableCell> {pairData.country_1.interestRateScore.toFixed(2)} </TableCell>
                              
                              <TableCell className={ `${getScoreTextColor(pairData.interestRateScore)}`}> {pairData.interestRateScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'>  Employement Score </TableCell>
                              <TableCell> {pairData.country_1.employmentScore.toFixed(2)} </TableCell>
                             
                              <TableCell className={ `${getScoreTextColor(pairData.employmentScore)}`}> {pairData.employmentScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Housing Score </TableCell>
                              <TableCell> {pairData.country_1.housingScore.toFixed(2)} </TableCell>
                             
                              <TableCell className={ `${getScoreTextColor(pairData.housingScore)}`}> {pairData.housingScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Growth Score </TableCell>
                              <TableCell> {pairData.country_1.growthScore.toFixed(2)} </TableCell>
                             
                              <TableCell className={ `${getScoreTextColor(pairData.growthScore)}`}> {pairData.growthScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2} className='font-bold'> Final Score </TableCell>
                          
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
                  

                  

                )  
              })
            }
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};


export default CryptoScanner;