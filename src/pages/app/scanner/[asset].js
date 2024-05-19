import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Loader } from '@/components/ui/loader'
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';

import { assets, countries } from '@/utils/event-names';

import { Card } from '@/components/shadcn/card';

import { filterByTypeAndCountries, fetchAndMergeEventCalendar, filterCommonEvents } from '@/utils/getEventCalendarForCountriesByType';

import { ChartComponent } from '@/components/ui/chart-component';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Scatter, ComposedChart, LineChart, Line} from 'recharts';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import dynamic from "next/dynamic";
import { set } from 'mongoose';
import { m } from 'framer-motion';

import { calculateEconomicScoreForPair } from '@/utils/scoring/calculateEconomicScoreForPair';
import { calculateBondScoreForPair } from '@/utils/scoring/calculateBondScoreForPair';
import { calculateCotDataScores } from '@/utils/scoring/calculateCotDataScores';
import { getPriceChartData } from '@/utils/chartData/priceChartData';

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

const mapBondDataToChartData = (bondData) => {
  return bondData.map((data) => {
    const country = data.country;
    const shortBonds = data.data[country].shortBonds.map((bond) => ({
      date: bond.date,
      shortBondsClose: bond.close
    }));
    const longBonds = data.data[country].longBonds.map((bond) => ({
      date: bond.date,
      longBondsClose: bond.close
    }));

    // Merge short and long bond data based on date
    const mergedData = shortBonds.map((shortBond) => {
      const longBond = longBonds.find((lb) => lb.date === shortBond.date);
      return {
        date: shortBond.date,
        shortBondsClose: shortBond.shortBondsClose,
        longBondsClose: longBond ? longBond.longBondsClose : null
      };
    });

    return { country, data: mergedData };
  });
};


const convertCalendarDataToChartData = (data) => {
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

  const [priceChartData , setPriceChartData] = useState(null);
  const [institutionalChartData , setInstitutionalChartData] = useState(null);
  const [institutionalNetChartData , setInstitutionalNetChartData] = useState(null);
  const [retailChartData , setRetailChartData] = useState(null);
  const [retailNetChartData , setRetailNetChartData] = useState(null);
  const [inflationChartData, setChartInflationData] = useState([]);
  const [sPMIChartData, setChartSPmiData] = useState([]);
  const [mPMIChartData, setChartMPmiData] = useState([]);
  const [unemploymentChartData, setChartUnemploymentData] = useState([]);
  const [gdpChartData, setChartGDPData] = useState([]);
  const [bondChartData, setChartBondData] = useState([]);

  const [cotScore, setCotScore] = useState(null);
  const [inflationScore, setInflationScore] = useState(null);
  const [sPMIScores, setSPMIScores] = useState(null);
  const [mPMIScores, setMPMIScores] = useState(null);
  const [unemploymentScores, setUnemploymentScores] = useState(null);
  const [gdpScores, setGDPScores] = useState(null);
  const [bondScores, setBondScores] = useState(null);


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

      // Data 
      const inflationData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].inflationKey, asset, country);
      });
      const sPmiData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].sPMIKey, asset, country);
      });
      const mPmiData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].mPMIKey, asset, country);
      });
      const unemploymentData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].unemploymentKey, asset, country);
      });
      const gdpData = assets[asset].countries.map(country => {
        return filterByTypeAndCountries(eventCalendar, countries[country].gdpGrowthRateKey, asset, country);
      });

      // Scores
      const cotScore = calculateCotDataScores(cotData, asset)
      const inflationScore = calculateEconomicScoreForPair(inflationData)
      const sPMIScores = calculateEconomicScoreForPair(sPmiData)
      const mPMIScores = calculateEconomicScoreForPair(mPmiData)
      const unemploymentScores = calculateEconomicScoreForPair(unemploymentData,true)
      const gdpScores = calculateEconomicScoreForPair(gdpData)
      const bondScores = calculateBondScoreForPair(bondData)

      setCotScore(cotScore)
      setInflationScore(inflationScore) 
      setSPMIScores(sPMIScores)
      setMPMIScores(mPMIScores)
      setUnemploymentScores(unemploymentScores)
      setGDPScores(gdpScores)
      setBondScores(bondScores)

      console.log("inflationScore", inflationScore)
      console.log("sPMIScores", sPMIScores)
      console.log("mPMIScores", mPMIScores)
      console.log("unemploymentScores", unemploymentScores)
      console.log("gdpScores", gdpScores)

       // Charts Data
      const priceChartData = getPriceChartData(weeklyPriceData, cotData, asset);
      const institutionalChartData =  [{
        name: asset,
        long: cotScore.institutional.long,
        short: cotScore.institutional.short
      }]

      const institutionalNetChartData = [
        { 
          name: "Longs",
          current: cotScore.institutional.long,
          previous: cotScore.institutional.longOld,
        },
        {
          name: "Shorts",
          current: cotScore.institutional.short,
          previous: cotScore.institutional.shortOld,
        }
      ];

      const retailChartData =  [{
        name: asset,
        long: cotScore.retail.long,
        short: cotScore.retail.short
      }]

      const retailNetChartData = [
        { 
          name: "Longs",
          current: cotScore.retail.long,
          previous: cotScore.retail.longOld,
        },
        {
          name: "Shorts",
          current: cotScore.retail.short,
          previous: cotScore.retail.shortOld,
        }
      ];

      const inflationChartData = inflationData.map(data => convertCalendarDataToChartData(data));
      const sPMIChartData = sPmiData.map(data => convertCalendarDataToChartData(data));
      const mPMIChartData = mPmiData.map(data => convertCalendarDataToChartData(data));
      const unemploymentChartData = unemploymentData.map(data => convertCalendarDataToChartData(data));
      const gdpChartData = gdpData.map(data => convertCalendarDataToChartData(data));
      const bondChartData = mapBondDataToChartData(bondData);
      
      setPriceChartData(priceChartData);
      setInstitutionalChartData(institutionalChartData);
      setInstitutionalNetChartData(institutionalNetChartData);
      setRetailChartData(retailChartData);
      setRetailNetChartData(retailNetChartData);
      setChartInflationData(inflationChartData);
      setChartSPmiData(sPMIChartData);
      setChartMPmiData(mPMIChartData);
      setChartUnemploymentData(unemploymentChartData);
      setChartGDPData(gdpChartData);
      setChartBondData(bondChartData);

      if (priceChartData && institutionalChartData && institutionalNetChartData && retailChartData && retailNetChartData && inflationChartData && sPMIChartData && mPMIChartData && unemploymentChartData && gdpChartData && bondChartData) {
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
    
         priceChartData && <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div className='flex justify-between items-start'> 
                <h1 className="text-secondary-foreground ml-8 mb-8"> {asset} </h1>
                </div>
                
              </div>
              { [asset].map((asset) => {
                return (
                  priceChartData && 
                  <div className='grid grid-cols-3 gap-4 col-span-3' >
                    <div className='grid col-span-2 gap-4'> 
                      <TitledCard key="price_card" className="grid col-span-2" title="Price and Positions">
                        { priceChartData && <ChartComponent data={priceChartData}  symbol={asset} timeframe={'Weekly'}></ChartComponent>}
                      </TitledCard>

                      <TitledCard key={`${asset}_institional_Positioning_card`} className="" title="Institutional Positioning" score={cotScore.institutional.score.toFixed(2)}>
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

                      <TitledCard key={`${asset}_retail_Positioning_card`} className={Style.InternalCard} title="Retail Sentiment" score={cotScore.retail.score.toFixed(2)}>
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

                      <TitledCard key="inflation_card" className={Style.InternalCard} title="Inflation" score={inflationScore.totalScore}>
                      {inflationChartData.length > 0 && inflationChartData.map((data, index) => (
                        <ResponsiveContainer width="100%" height={400} key={index}>
                          <ComposedChart data={data}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                              const isEstimate = countryKey.includes('_estimate');
                              const country = countryKey.replace('_estimate', '');
                              const barColor = index % 2 === 0 ? "#8884d8" : "#a717d3";
                              const scatterColor = "#f87315" 


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

                      <TitledCard key="sPMI_card" className={Style.InternalCard} title="Services PMI" score={sPMIScores.totalScore}>
                        {sPMIChartData.length > 0 && sPMIChartData.map((data, index) => (
                          <ResponsiveContainer width="100%" height={400} key={index}>
                            <ComposedChart data={data}>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                                const isEstimate = countryKey.includes('_estimate');
                                const country = countryKey.replace('_estimate', '');
                                const barColor = index % 2 === 0 ? "#8884d8" : "#a717d3";
                                const scatterColor = "#f87315" 

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

                      <TitledCard key="mPMI_card" className={Style.InternalCard} title="Manufacturing PMI" score={mPMIScores.totalScore}>
                        {mPMIChartData.length > 0 && mPMIChartData.map((data, index) => (
                          <ResponsiveContainer width="100%" height={400} key={index}>
                            <ComposedChart data={data}>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                                const isEstimate = countryKey.includes('_estimate');
                                const country = countryKey.replace('_estimate', '');
                                const barColor = index % 2 === 0 ? "#8884d8" : "#a717d3";
                                const scatterColor = "#f87315" 

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

                      <TitledCard key="unemployment_card" className={Style.InternalCard} title="Unemployment Rate" score={unemploymentScores.totalScore}>
                        {unemploymentChartData.length > 0 && unemploymentChartData.map((data, index) => (
                          <ResponsiveContainer width="100%" height={400} key={index}>
                            <ComposedChart data={data}>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                                const isEstimate = countryKey.includes('_estimate');
                                const country = countryKey.replace('_estimate', '');
                                const barColor = index % 2 === 0 ? "#8884d8" : "#a717d3";
                                const scatterColor = "#f87315" 


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

                      <TitledCard key="gdp_card" className={Style.InternalCard} title="GDP Growth Rate" score={gdpScores.totalScore}>
                        {gdpChartData.length > 0 && gdpChartData.map((data, index) => (
                          <ResponsiveContainer width="100%" height={400} key={index}>
                            <ComposedChart data={data}>
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {Object.keys(data[0]).filter(key => !['year', 'month'].includes(key)).map((countryKey, countryIndex) => {
                                const isEstimate = countryKey.includes('_estimate');
                                const country = countryKey.replace('_estimate', '');
                                const barColor = index % 2 === 0 ? "#8884d8" : "#a717d3";
                                const scatterColor = "#f87315" 


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

                      <TitledCard key="bonds_card" className={Style.InternalCard} title="Bonds Data" score={bondScores.totalScore}>
                            {bondChartData.length > 0 && bondChartData.map((data, index) => (
                              <ResponsiveContainer width="100%" height={400} key={index}>
                                <LineChart data={data.data}>
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="shortBondsClose" name={
                                    `${data.country} ` + `Short-Term Yield `} dot={false} stroke="#f87315" />
                                
                                  <Line type="monotone" dataKey="longBondsClose" name={ `${data.country} ` + `Long-Term Yield`} dot={false} stroke="#8884d8" />
                                </LineChart>
                              </ResponsiveContainer>
                            ))}
                      </TitledCard>
                    </div>

                    <div className='grid col-span-1 gap-2 '> 
                      <div className='flex flex-col space-y-2'> 
                      <Card className=' flex items-start justify-center'>
                          <GaugeComponent
                                    value={cotScore.institutional.score}  
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

                        <TitledCard key="news_card" className="" title="Latest News">
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