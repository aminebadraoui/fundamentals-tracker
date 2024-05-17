import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Loader } from '@/components/ui/loader'
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/processAssetData';
import { assets, countries } from '@/utils/event-names';

import { Card } from '@/components/shadcn/card';

import { filterByTypeAndCountries, fetchAndMergeEventCalendar, filterCommonEvents } from '@/utils/getEventCalendarForCountriesByType';

import { ChartComponent } from '@/components/ui/chart-component';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Scatter, ComposedChart} from 'recharts';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import dynamic from "next/dynamic";
import { set } from 'mongoose';
import { m } from 'framer-motion';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
    return withSubscription(context, session, async(context) => {
      const params = context.params
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : 'http://localhost:3000'
     
        return { 
          props: {
            params, 
            baseUrl
          } 
          };
      })
    })
}

const CustomScatterShape = (props) => {
  const { cx, cy, fill } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="none"
    />
  );
};


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

const fetchBondData = async (baseUrl, country) => {
  const url = `${baseUrl}/api/get-bonds`;
  const response = await fetch(`${url}?country=${country}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bond data for ${country}`);
  }
  const data = await response.json();
  return { country, data };
};

const fetchCotDataForYears = async (asset, years) => {
  const cotFileName = assets[asset].cotFileName

  const cotDataPromises = years.map(year => fetchDataWithRetry('/api/getCotDataByYear', { cotFileName, year }));
  const batchedCotData = await Promise.all(cotDataPromises);
  return batchedCotData.flat();
};

const formatInflationData = (data) => {
  const filteredYears = ['2023', '2024'];
  const orderedMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formattedData = [];

  filteredYears.forEach((year) => {
    if (data[year]) {
      const yearData = { year };
      orderedMonths.forEach((month) => {
        yearData[month] = { actual: null, estimate: null };
      });

      Object.keys(data[year]).forEach((country) => {
        Object.keys(data[year][country]).forEach((month) => {
          const events = data[year][country][month];
          if (events && events.length > 0) {
            const latestEvent = events.reduce((latest, current) => {
              return new Date(current.date) > new Date(latest.date) ? current : latest;
            });

            const date = new Date(latestEvent.date);
            const formattedMonth = date.toLocaleString('default', { month: 'long' });
            if (yearData[formattedMonth]) {
              yearData[formattedMonth][country] = {
                actual: latestEvent.actual || 0,
                estimate: latestEvent.estimate || 0,
              };
            }
          }
        });
      });

      orderedMonths.forEach((month) => {
        const monthData = { year, month: month.slice(0, 3) };
        let hasData = false;

        Object.keys(data[year]).forEach((country) => {
          monthData[country] = yearData[month][country]?.actual || 0;
          monthData[`${country}_estimate`] = yearData[month][country]?.estimate || 0;
          if (yearData[month][country]?.actual !== null) {
            hasData = true;
          }
        });

        if (hasData) {
          formattedData.push(monthData);
        }
      });
    }
  });

  return formattedData;
};

const Scanner = (props) => {
  const asset = props.params.asset;
  const baseUrl = props.baseUrl

  const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });
  // keep track of different arrays of events as part of one object
  const [assetData , setAssetData] = useState(null);
  const [institutionalChartData , setInstitutionalChartData] = useState(null);
  const [institutionalNetChartData , setInstitutionalNetChartData] = useState(null);

  const [retailChartData , setRetailChartData] = useState(null);
  const [retailNetChartData , setRetailNetChartData] = useState(null);

  const [inflationChartData, setInflationChartData] = useState([]);

  const [formattedInflationData, setFormattedInflationData] = useState([]);
  const [formattedSPMIData, setFormattedSPMIData] = useState([]);
  const [formattedMPMIData, setFormattedMPMIData] = useState([]);
  const [formattedUnemploymentData, setFormattedUnemploymentData] = useState([]);
  const [formattedGDPData, setFormattedGDPData] = useState([]);

  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]; // or any range of years you have data for

      const [cotData, weeklyPriceData, eventCalendar, bondData ] = await Promise.all([
        fetchCotDataForYears(asset, years),
        fetchDataWithRetry('/api/getWeeklyPriceData', { asset }),
        fetchAndMergeEventCalendar( baseUrl),
        Promise.all(assets[asset].countries.map(country => fetchBondData(baseUrl, country)))
      ]);

      // const inflationData = assets[asset].countries.forEach((country) => {
      //   getInflationDataForCountry(country, eventCalendar)
      // })

      // const PmiData = assets[asset].countries.forEach((country) => {
      //   getPmiDataForCountry(country, eventCalendar)
      // })

      // const UnemploymentData = assets[asset].countries.forEach((country) => {
      //   getUnemploymentDataForCountry(country, eventCalendar)
      // })

      // const GDPData = assets[asset].countries.forEach((country) => {
      //   getGDPDataForCountry(country, eventCalendar)
      // })


      console.log("bondData", bondData )

      console.log(eventCalendar)


    
 



      const inflationData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].inflationKey, asset, country);
      });
      const formattedInflationData = inflationData.map(data => formatInflationData(data));
      setFormattedInflationData(formattedInflationData);


      const sPmiData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].sPMIKey, asset, country);
  });
      const formattedSPmiData = sPmiData.map(data => formatInflationData(data));
      setFormattedSPMIData(formattedSPmiData);


      const mPmiData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].mPMIKey, asset, country);
      });
      const formattedMPmiData = mPmiData.map(data => formatInflationData(data));
      setFormattedMPMIData(formattedMPmiData);

      const unemploymentData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].unemploymentKey, asset, country);
      });
      const formattedUnemploymentData = unemploymentData.map(data => formatInflationData(data));
      setFormattedUnemploymentData(formattedUnemploymentData);

      const gdpData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].gdpGrowthRateKey, asset, country);
      });

      const formattedGDPData = gdpData.map(data => formatInflationData(data));
      setFormattedGDPData(formattedGDPData);

      console.log("unemploymentData", unemploymentData)



      console.log("Formatted Inflation Data", formattedInflationData)

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
    Title: "flex flex-row w-full justify-between items-center" ,
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
    
         assetData && <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div className='flex justify-between items-start'> 
                <h1 className="text-secondary-foreground ml-8 mb-8"> {asset} </h1>
                
                
                </div>
                
              </div>
              { [asset].map((asset) => {
                return (
                  assetData && 
                  <div className='grid grid-cols-3 gap-4 col-span-3' >
                    <div className='grid col-span-2 gap-4'> 
                    <TitledCard key="price_card" className="grid col-span-2" title="Price">
                      { assetData.chartData && <ChartComponent data={assetData.chartData}  symbol={asset} timeframe={'Weekly'}></ChartComponent>}
                    </TitledCard>

                    <TitledCard key="inflation_card" className={Style.InternalCard} title="Inflation">
                    {formattedInflationData.length > 0 && formattedInflationData.map((data, index) => (
                      <ResponsiveContainer width="100%" height={400} key={index}>
                        <ComposedChart data={data}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                            const isEstimate = countryKey.includes('_estimate');
                            const country = countryKey.replace('_estimate', '');
                            const barColor = countryIndex % 2 === 0 ? "#8884d8" : "#82ca9d";
                            const scatterColor = countryIndex % 2 === 0 ? "#ff7300" : "#387908";

                            if (isEstimate) {
                              return (
                                <Scatter
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={scatterColor}
                                  shape={<CustomScatterShape />}
                                />
                              );
                            } else {
                              return (
                                <Bar
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={barColor}
                                />
                              );
                            }
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                    ))}
                  </TitledCard>

                  <TitledCard key="sPMI_card" className={Style.InternalCard} title="Services PMI">
                    {formattedSPMIData.length > 0 && formattedSPMIData.map((data, index) => (
                      <ResponsiveContainer width="100%" height={400} key={index}>
                        <ComposedChart data={data}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                            const isEstimate = countryKey.includes('_estimate');
                            const country = countryKey.replace('_estimate', '');
                            const barColor = countryIndex % 2 === 0 ? "#8884d8" : "#82ca9d";
                            const scatterColor = countryIndex % 2 === 0 ? "#ff7300" : "#387908";

                            if (isEstimate) {
                              return (
                                <Scatter
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={scatterColor}
                                  shape={<CustomScatterShape />}
                                />
                              );
                            } else {
                              return (
                                <Bar
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={barColor}
                                />
                              );
                            }
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                    ))}
                  </TitledCard>

                  <TitledCard key="mPMI_card" className={Style.InternalCard} title="Manufacturing PMI">
                    {formattedMPMIData.length > 0 && formattedMPMIData.map((data, index) => (
                      <ResponsiveContainer width="100%" height={400} key={index}>
                        <ComposedChart data={data}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                            const isEstimate = countryKey.includes('_estimate');
                            const country = countryKey.replace('_estimate', '');
                            const barColor = countryIndex % 2 === 0 ? "#8884d8" : "#82ca9d";
                            const scatterColor = countryIndex % 2 === 0 ? "#ff7300" : "#387908";

                            if (isEstimate) {
                              return (
                                <Scatter
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={scatterColor}
                                  shape={<CustomScatterShape />}
                                />
                              );
                            } else {
                              return (
                                <Bar
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={barColor}
                                />
                              );
                            }
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                    ))}
                  </TitledCard>

                  <TitledCard key="unemployment_card" className={Style.InternalCard} title="Unemployment Rate">
                    {formattedUnemploymentData.length > 0 && formattedUnemploymentData.map((data, index) => (
                      <ResponsiveContainer width="100%" height={400} key={index}>
                        <ComposedChart data={data}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                            const isEstimate = countryKey.includes('_estimate');
                            const country = countryKey.replace('_estimate', '');
                            const barColor = countryIndex % 2 === 0 ? "#8884d8" : "#82ca9d";
                            const scatterColor = countryIndex % 2 === 0 ? "#ff7300" : "#387908";

                            if (isEstimate) {
                              return (
                                <Scatter
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={scatterColor}
                                  shape={<CustomScatterShape />}
                                />
                              );
                            } else {
                              return (
                                <Bar
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={barColor}
                                />
                              );
                            }
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                    ))}
                  </TitledCard>

                  <TitledCard key="gdp_card" className={Style.InternalCard} title="GDP Growth Rate">
                    {formattedGDPData.length > 0 && formattedGDPData.map((data, index) => (
                      <ResponsiveContainer width="100%" height={400} key={index}>
                        <ComposedChart data={data}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                            const isEstimate = countryKey.includes('_estimate');
                            const country = countryKey.replace('_estimate', '');
                            const barColor = countryIndex % 2 === 0 ? "#8884d8" : "#82ca9d";
                            const scatterColor = countryIndex % 2 === 0 ? "#ff7300" : "#387908";

                            if (isEstimate) {
                              return (
                                <Scatter
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={scatterColor}
                                  shape={<CustomScatterShape />}
                                />
                              );
                            } else {
                              return (
                                <Bar
                                  key={`${countryKey}_${index}`}
                                  dataKey={countryKey}
                                  fill={barColor}
                                />
                              );
                            }
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                    ))}
                  </TitledCard>
                    </div>
                    <div className='grid col-span-1 gap-2 '> 

                    <Card className=' flex items-center justify-center '>
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
                </Card>
                    
                    <TitledCard key={`${asset}_institional_Positioning_card`} className="" title="Institutional Positioning">
                      <div className='flex w-full'>
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
                   
               

                    </TitledCard>

                   
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