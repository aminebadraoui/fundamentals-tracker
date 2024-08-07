import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { assets, countries} from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/shadcn/table';
import Link from 'next/link';


import { getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/processAssetData';

import { fetchAndMergeEventCalendar, filterByTypeAndCountries } from '@/utils/getEventCalendarForCountriesByType';

import { calculateEconomicScoreForPair } from '@/utils/scoring/calculateEconomicScoreForPair';
import { calculateBondScoreForPair } from '@/utils/scoring/calculateBondScoreForPair';
import { calculateCotDataScores } from '@/utils/scoring/calculateCotDataScores';

import { calculateEMA } from '@/utils/calculateEMA';





import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
   return withSubscription(context, session, async(context) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : 'http://localhost:3000'


    return { 
      props: {
        baseUrl
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

// Function to sort assetDataArray by cotScore
const sortByCotScore = (dataArray) => {
  return dataArray.sort((a, b) => {
    const assetKeyA = Object.keys(a)[0];
    const assetKeyB = Object.keys(b)[0];
    const cotScoreA = a[assetKeyA].cotScore.totalScore;
    const cotScoreB = b[assetKeyB].cotScore.totalScore;
    return cotScoreB - cotScoreA; // Sort in descending order
  });
};


const Pulse = (props) => {
  const baseUrl = props.baseUrl;

  const [pulseData, setPulseData] = useState([]);
  const [normalCurrencyData, setNormalCurrencyData] = useState([])
  const [flippedCurrencyData, setFlippedCurrencyData] = useState([])
  const [preciousMetalData, setPreciousMetalData] = useState([])
  const [commodityData, setCommodityData] = useState([])
  const [cryptoData, setCryptoData] = useState([])
  const [indexData, setIndexData] = useState([])

  
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const years = [2024];
      // get 30 days minus current date in the format YYYY-MM-DD
      const today = new Date();
      const last30Days = new Date(today.setDate(today.getDate() - 30));
      const last30DaysFormatted = last30Days.toISOString().split('T')[0];

      const eventCalendarPromise = fetchAndMergeEventCalendar(baseUrl);

      const assetPromises = Object.keys(assets).map(asset => 
        Promise.all([
          fetchCotDataForYears(asset, years),
          fetchDataWithRetry('/api/getWeeklyPriceData', { asset, startDate: last30DaysFormatted}),
          Promise.all(assets[asset].countries.map(country => fetchBondData(baseUrl, country)))
        ]).then(([cotData, dailyPriceData, bondData]) => {
          return { 
            [asset]: {
              cotData, dailyPriceData, bondData
            }
          }
        })
      );

      // Wait for both the event calendar and asset promises to resolve
    const [eventCalendar, assetDataArray] = await Promise.all([
      eventCalendarPromise,
      Promise.all(assetPromises)
    ]);

      console.log("assetDataArray", assetDataArray)

      assetDataArray.map(assetData => { 
        const asset = Object.keys(assetData)[0];
        const { cotData, dailyPriceData, bondData } = assetData[asset];

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

      const sortedLast30Prices = dailyPriceData.slice().sort((a, b) => new Date(b.time) - new Date(a.time))
      console.log("sortedLast30Prices", sortedLast30Prices)
      const ema = calculateEMA(sortedLast30Prices, 9);

      const mostRecentPrice = sortedLast30Prices[0];
      const mostRecentEma = ema[0];

      console.log("mostRecentPrice", mostRecentPrice)
      console.log("mostRecentEma", mostRecentEma)

      const maScore = mostRecentPrice.close > mostRecentEma ? 100 : mostRecentPrice.close < mostRecentEma ? -100 : 0;

      // Scores
      const cotScore = calculateCotDataScores(cotData, asset)
      const inflationScore = calculateEconomicScoreForPair(inflationData, asset)
      const sPMIScores = calculateEconomicScoreForPair(sPmiData, asset)
      const mPMIScores = calculateEconomicScoreForPair(mPmiData, asset)
      const unemploymentScores = calculateEconomicScoreForPair(unemploymentData,asset, true)
      const gdpScores = calculateEconomicScoreForPair(gdpData, asset)
      const bondScores = calculateBondScoreForPair(bondData, asset)
      

      assetData[asset].cotScore = cotScore
      assetData[asset].inflationScore = inflationScore
      assetData[asset].sPMIScores = sPMIScores
      assetData[asset].mPMIScores = mPMIScores
      assetData[asset].unemploymentScores = unemploymentScores
      assetData[asset].gdpScores = gdpScores
      assetData[asset].bondScores = bondScores
      assetData[asset].maScore = maScore

    })

    const normalCurrenciesArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "normalCurrency")
    const flippedCurrenciesArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "flippedCurrency")
    const preciousMetalsArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "preciousMetal")
    const commoditiesArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "commodity")
    const cryptocurrenciesArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "crypto")
    const indicesArray = assetDataArray.filter(assetData => assets[Object.keys(assetData)[0]].assetType == "index")

    console.log("normalCurrenciesArray", normalCurrenciesArray)
    console.log("flippedCurrenciesArray", flippedCurrenciesArray)
    console.log("preciousMetalsArray", preciousMetalsArray)
    console.log("commoditiesArray", commoditiesArray)
    console.log("cryptocurrenciesArray", cryptocurrenciesArray)
    console.log("indicesArray", indicesArray)

    const sortedNormalCurrencies = sortByCotScore(normalCurrenciesArray)
    const sortedFlippedCurrencies = sortByCotScore(flippedCurrenciesArray)
    const sortedPreciousMetals = sortByCotScore(preciousMetalsArray)
    const sortedCommodities = sortByCotScore(commoditiesArray)
    const sortedCryptocurrencies = sortByCotScore(cryptocurrenciesArray)
    const sortedIndices = sortByCotScore(indicesArray)

    setNormalCurrencyData(sortedNormalCurrencies)
    setFlippedCurrencyData(sortedFlippedCurrencies)
    setPreciousMetalData(sortedPreciousMetals)
    setCommodityData(sortedCommodities)
    setCryptoData(sortedCryptocurrencies)
    setIndexData(sortedIndices)





    console.log("assetDataArray withScores", assetDataArray)

    const sortedData = sortByCotScore(assetDataArray)

      setPulseData(sortedData);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleDownload();
  }, []);


  const Style = {
    Wrapper : "grid grid-cols-2 gap-4 p-8",
    InternalCard: " space-y-4 p-8 "
  }

  const columns = ["Asset", "Positioning", "Inflation", "Manufacturing PMI", "Services PMI", "Unemployment Rate", "GDP", "Bonds", "9-Day MA"];

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
              <div className='col-span-2 grid gap-4'> 
              <h1 className="text-secondary-foreground mb-8"> The Pulse </h1>
         
              <TitledCard title="XUSD Forex Pairs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {normalCurrencyData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>
      
       

              </TitledCard>

              <TitledCard title="USDX Forex Pairs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {flippedCurrencyData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>

              

              </TitledCard>

              <TitledCard title="Cryptocurrencies">
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {cryptoData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>

       

              </TitledCard>

              <TitledCard title="Indices">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {indexData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>

       

              </TitledCard>

              <TitledCard title="Precious Metals">
            
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {preciousMetalData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>



              </TitledCard>

              <TitledCard title="Commodities">
           
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead key={index}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {commodityData.map((assetData, index) => {
                      const assetKey = Object.keys(assetData)[0];
                      const scores = assetData[assetKey];

                     
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-primary-foreground font-bold">{
                            <Link href={`/app/scanner/${assetKey}`}>
                              {assetKey}
                            </Link>
                          }</TableCell>
                
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.cotScore.totalScore)}`}>{scores.cotScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.inflationScore.totalScore)}`}>{scores.inflationScore.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.mPMIScores.totalScore)}`}>{scores.mPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.sPMIScores.totalScore)}`}>{scores.sPMIScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.unemploymentScores.totalScore)}`}>{scores.unemploymentScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.gdpScores.totalScore)}`}>{scores.gdpScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.bondScores.totalScore)}`}>{scores.bondScores.totalScore.toFixed(2)}</TableCell>
                          <TableCell  className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(scores.maScore)}`}>{scores.maScore.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  

                  
                  <TableBody>
                   
                  </TableBody>
                </Table>

           

              </TitledCard>
              </div>
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Pulse;