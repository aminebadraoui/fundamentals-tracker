import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Loader } from '@/components/ui/loader'
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/processAssetData';
import { assets } from '@/utils/event-names';

import { ChartComponent } from '@/components/ui/chart-component';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell} from 'recharts';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import dynamic from "next/dynamic";
import { set } from 'mongoose';

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


const fetchDataWithRetry = async (url, params = {}, taskName, maxRetries = 3, retryDelay = 1000) => {
  const queryString = new URLSearchParams(params).toString();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${url}?${queryString}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} for ${taskName} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error(`${taskName} failed after ${maxRetries} attempts.`);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

const fetchCotDataForYears = async (asset, years) => {
  const cotFileName = assets[asset].cotFileName

  const cotDataPromises = years.map(year => fetchDataWithRetry('/api/getCotDataByYear', { cotFileName, year }));
  const batchedCotData = await Promise.all(cotDataPromises);
  return batchedCotData.flat();
};


const Scanner = (props) => {
  const asset = props.params.asset;
  const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });
  // keep track of different arrays of events as part of one object
  const [assetData , setAssetData] = useState(null);
  const [institutionalChartData , setInstitutionalChartData] = useState(null);
  const [institutionalNetChartData , setInstitutionalNetChartData] = useState(null);

  const [retailChartData , setRetailChartData] = useState(null);
  const [retailNetChartData , setRetailNetChartData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]; // or any range of years you have data for

      const [cotData, weeklyPriceData] = await Promise.all([
        fetchCotDataForYears(asset, years),
        fetchDataWithRetry('/api/getWeeklyPriceData', { asset }),
      ]);

      const assetDataJson = processAssetData(asset, null, cotData, null, weeklyPriceData);

      const institutionalChartData_local =  [{
          name: asset,
          long: assetDataJson.cot.institutional.long,
          short: assetDataJson.cot.institutional.short
        }]

        const institutionalNetChartData_local = [
          { 
            name: "Longs",
            current: assetDataJson.cot.institutional.long,
            previous: assetDataJson.cot.institutional.longOld,
          },
          {
            name: "Shorts",
            current: assetDataJson.cot.institutional.short,
            previous: assetDataJson.cot.institutional.shortOld,
          }
        ];

        const retailChartData_local =  [{
          name: asset,
          long: assetDataJson.cot.retail.long,
          short: assetDataJson.cot.retail.short
        }]

        const retailNetChartData_local = [
          { 
            name: "Longs",
            current: assetDataJson.cot.retail.long,
            previous: assetDataJson.cot.retail.longOld,
          },
          {
            name: "Shorts",
            current: assetDataJson.cot.retail.short,
            previous: assetDataJson.cot.retail.shortOld,
          }
        ];
  

      // set the state with the sorted data
      setAssetData(assetDataJson);
      setInstitutionalChartData(institutionalChartData_local);
      setInstitutionalNetChartData(institutionalNetChartData_local);

      setRetailChartData(retailChartData_local);
      setRetailNetChartData(retailNetChartData_local);

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
                  <div className='flex w-1/2 flex-col space-y-4'>
                    <div className='flex justify-center items-center'>
                      <GaugeComponent
                                value={assetData.score}  
                                style={{  width: '75%' }}
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
                                  animationDelay: 0,
                                  color: '#9ea7c6',
                                }}/>
                      </div>
                

                    {/* <TitledCard key={`${asset}_economy_card_`} className={Style.InternalCard} title="Economy">
                        
                        { assetData.countries.length == 2 ? 
                        <Table>
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
                        :  <Table>
                        <TableHeader>
                          <TableRow className='hover:bg-transparent'>
                            <TableHead className='bg-transparent border-0 hover:bg-transparent'>  </TableHead>
                            <TableHead className='font-bold'> {assetData.economics.countriesEvents[0].country} </TableHead>
                           
                            <TableHead className='font-bold'> {`${asset}`}</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow>
                              <TableCell className='font-bold'> Inflation Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].inflationData.totalScore.toFixed(2)} </TableCell>
                             
                              <TableCell className={ `${getScoreTextColor(-assetData.economics.inflationScore)}`}> {-assetData.economics.inflationScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Interest Rate Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].interestRateData.totalScore.toFixed(2)} </TableCell>
                              
                              <TableCell className={ `${getScoreTextColor(-assetData.economics.interestRateScore)}`}> {-assetData.economics.interestRateScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'>  Employement Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].employmentData.totalScore.toFixed(2)} </TableCell>
                              
                              <TableCell className={ `${getScoreTextColor(-assetData.economics.employmentScore)}`}> {-assetData.economics.employmentScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Housing Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].housingData.totalScore.toFixed(2)} </TableCell>
                
                              <TableCell className={ `${getScoreTextColor(-assetData.economics.housingScore)}`}> {-assetData.economics.housingScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className='font-bold'> Growth Score </TableCell>
                              <TableCell> {assetData.economics.countriesEvents[0].growthData.totalScore.toFixed(2)} </TableCell>
                      
                              <TableCell className={ `${getScoreTextColor(-assetData.economics.growthScore)}`}> {-assetData.economics.growthScore} </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2} className='font-bold'> Final Score </TableCell>
                          
                              <TableCell className={ `${getScoreBackgroundColor(-assetData.economics.score)} font-bold `}> {-assetData.economics.score} </TableCell>
                            </TableRow>
                        </TableBody>
                        
                        </Table>  }
                    </TitledCard> */}

                    <TitledCard key={`${asset}_institional_Positioning_card`} className={Style.InternalCard} title="Institutional Positioning">
                      <div className='flex'>
                      <ResponsiveContainer  height={400}>
                      <BarChart data={institutionalChartData} barCategoryGap={20} >
                        <XAxis dataKey="name" tick={{ fill: 'white' }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        
                        <Bar dataKey="long" name="Total Longs"  fill="#009900"   />
                        <Bar dataKey="short" name="Total Shorts"  fill="#c20b0a" />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer height={400}>
                      <BarChart data={institutionalNetChartData} barCategoryGap={20} barGap={3}>
                        
                        <XAxis dataKey="name" tick={{ fill: 'white' }} />
                        <YAxis />
                        <Tooltip cursor={{fill: 'transparent'}} />
                       
                        <Bar dataKey="current" name="Current" fill="#009900" stackId="a">
                          {institutionalNetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#009900' : '#c20b0a'} />
                          ))}
                        </Bar>
                        <Bar dataKey="previous" name="Previous" fill="#006600" stackId="b">
                          {institutionalNetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#006600' : '#8b0000'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                        
                    </div>
                   
                      
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
                          <TableCell className={ `${getScoreBackgroundColor(assetData.cot.institutional.score)} font-bold `}> {assetData.cot.institutional.score} </TableCell>
                          </TableRow>
                      </TableBody>
                      </Table>   

                    </TitledCard>

                    <TitledCard key={`${asset}_retail_Positioning_card`} className={Style.InternalCard} title="Retail Sentiment">
                      <div className='flex'>
                      <ResponsiveContainer  height={400}>
                      <BarChart data={retailChartData} barCategoryGap={20} >
                        <XAxis dataKey="name" tick={{ fill: 'white' }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        
                        <Bar dataKey="long" name="Total Longs"  fill="#009900"   />
                        <Bar dataKey="short" name="Total Shorts"  fill="#c20b0a" />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer height={400}>
                      <BarChart data={retailNetChartData} barCategoryGap={20} barGap={3}>
                        
                        <XAxis dataKey="name" tick={{ fill: 'white' }} />
                        <YAxis />
                        <Tooltip cursor={{fill: 'transparent'}} />
                       
                        <Bar dataKey="current" name="Current" fill="#009900" stackId="a">
                          {retailNetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#009900' : '#c20b0a'} />
                          ))}
                        </Bar>
                        <Bar dataKey="previous" name="Previous" fill="#006600" stackId="b">
                          {retailNetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#006600' : '#8b0000'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                        
                    </div>
                   
                      
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
                          <TableCell> {assetData.cot.retail.long} </TableCell>
                          <TableCell> {assetData.cot.retail.short} </TableCell>
                          <TableCell className={ `${getScoreBackgroundColor(assetData.cot.retail.score)} font-bold `}> {assetData.cot.retail.score} </TableCell>
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

                    {/* <TitledCard key={`${asset}_news_sentiment_card`} className={Style.InternalCard} title="News Sentiment">
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
                    </TitledCard> */}
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