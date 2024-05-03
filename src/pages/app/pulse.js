import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys, majorForexPairs, cryptoAssets} from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/shadcn/table';
import { parseCotData, findLatestReports, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { getPairData } from '@/utils/pair-data';
import { getCryptoData } from '@/utils/crypto-data';

import path from 'path';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
   return withSubscription(context, session, async(context) => {

    const cot_2024_currencies_path = path.join(process.cwd(), 'public/assets/cot-data/2024/currencies.xml');
    const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');
  
    const cot_2024_bitcoin_path = path.join(process.cwd(), 'public/assets/cot-data/2024/bitcoin.xml');
    const cot_2024_bitcoin_xml = fs.readFileSync(cot_2024_bitcoin_path, 'utf-8');

  try {
    const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);
    const cot_2024_bitcoin_json = await parseCotData(cot_2024_bitcoin_xml);
  
    return { 
      props: {
        cot_2024_currencies: cot_2024_currencies_json ,
        cot_2024_bitcoin: cot_2024_bitcoin_json
        } 
      };
    }  catch (error) {
        console.error('Failed to parse COT data:', error);
        return { props: { error: 'Failed to load data' } };
      }
    })
  })
}
  

const Pulse = (props) => {
  const [pulseData, setPulseData] = useState({});
  const [isLoading, setLoading] = useState(false);

  const cot_2024_currencies = props.cot_2024_currencies;
  const cot_2024_bitcoin = props.cot_2024_bitcoin;


  const handleDownload = async () => {
    setLoading(true);
    try {
      const forexDataPromises = Object.keys(majorForexPairs).map(async (pair) => {
        const countries = majorForexPairs[pair].countries;
       
        const dataForPair = await fetch(`../../api/event-calendar?countries=${countries}`);
        const rawPairData = await dataForPair.json();
        const last_sma20 = await fetch(`../../api/technical-sma?symbol=${pair}.FOREX&period=20`)
        const last_sma20_json = await last_sma20.json()

        const last_sma_50 = await fetch(`../../api/technical-sma?symbol=${pair}.FOREX&period=50`)
        const last_sma50_json = await last_sma_50.json()

        const last_close = await fetch(`../../api/last-close?symbol=${pair}.FOREX`)
        const last_close_json = await last_close.json()

        const technical_data_for_pair = {
          last_sma_50: last_sma20_json,
          last_sma_200: last_sma50_json,
          last_close: last_close_json
        }

        const news_sentiment = await fetch(`../../api/news-sentiment?symbol=${pair}.FOREX`)
        const news_sentiment_json = await news_sentiment.json()

        const news_data_for_pair = {
          news_sentiment: news_sentiment_json
        }

 

        const cot_for_pair = findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_2024_currencies)

        const pairData_local = getPairData(pair, rawPairData, cot_for_pair, technical_data_for_pair, news_data_for_pair)
       
        return pairData_local
        
      });

      const cryptoDataPromises = Object.keys(cryptoAssets).map(async (asset) => { 
        const countries = cryptoAssets[asset].countries;
        const apiSymbol = cryptoAssets[asset].apiSymbol;
        const cotName = cryptoAssets[asset].cotName;
       
        const dataForPair = await fetch(`../../api/event-calendar?countries=${countries}`);
        const rawPairData = await dataForPair.json();
        const last_sma50 = await fetch(`../../api/technical-sma?symbol=${apiSymbol}&period=50`)
        const last_sma50_json = await last_sma50.json()

        const last_sma_200 = await fetch(`../../api/technical-sma?symbol=${apiSymbol}&period=200`)
        const last_sma200_json = await last_sma_200.json()

        const last_close = await fetch(`../../api/last-close?symbol=${apiSymbol}`)
        const last_close_json = await last_close.json()

        const technical_data_for_pair = {
          last_sma_50: last_sma50_json,
          last_sma_200: last_sma200_json,
          last_close: last_close_json
        }

        const news_sentiment = await fetch(`../../api/news-sentiment?symbol=${apiSymbol}`)
        const news_sentiment_json = await news_sentiment.json()

        const news_data_for_pair = {
          news_sentiment: news_sentiment_json
        }

     

        const cot_for_pair = findLatestCotDataForAsset(cotName, cot_2024_bitcoin)

        const pairData_local = getCryptoData(asset, rawPairData, cot_for_pair, technical_data_for_pair, news_data_for_pair)
       
        return pairData_local
        
      });


      const pulseDataPromises = forexDataPromises.concat(cryptoDataPromises);

      const resolvedPairs = await Promise.all(pulseDataPromises);

      const dataForAllPairs = resolvedPairs.reduce((acc, data) => {
        acc[data.pair] = data;
        return acc;
      }, {});

      

      // sort dataForAllPairs by total score in descending order
      const sortedDataForAllPairs = Object.keys(dataForAllPairs).sort((a, b) => dataForAllPairs[b].totalScore - dataForAllPairs[a].totalScore).reduce((acc, key) => {
        acc[key] = dataForAllPairs[key];
        return acc;
      }
      , {});

      
      setPulseData(sortedDataForAllPairs);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleDownload();
  }, []);

  const calculateScore = (data, countries) => {
    if (data[countries[0]] && data[countries[1]]) {
      return data[countries[0]].totalScore > data[countries[1]].totalScore ? 100 : data[countries[0]].totalScore < data[countries[1]].totalScore ? -100 : 0;
    }
    return 0;
  };

  const calculateEconomicScore = (inflationData, employmentData, growthData, countries) => {
    const scores = [calculateScore(inflationData, countries), calculateScore(employmentData, countries), calculateScore(growthData, countries)];
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
  };

  const Style = {
    Wrapper : "grid grid-cols-2 gap-4 p-8",
    InternalCard: " space-y-4 p-8 "
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
      
            <div className={Style.Wrapper}>
              <div className='col-span-2'> 
              <h1 className="text-secondary-foreground mb-8"> The Pulse </h1>
              <p>
   
              </p>

              <TitledCard title="Scores">
                <Table>
                  <TableHeader>
                    <TableRow className="!border-0 hover:bg-transparent">
                  
                      <TableHead className="font-bold" >Asset</TableHead>

                      <TableHead className="font-bold" >Bias</TableHead>
                      <TableHead className="font-bold" > Score</TableHead>

                    </TableRow>
                  </TableHeader>

                  {pulseData && Object.keys(pulseData).map((pair) => {
                    return (
                      <TableRow className="!border-0 hover:bg-transparent">

                        <TableCell className="bg-primary text-primary-foreground font-bold">{pair}</TableCell>
                        <TableCell className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(pulseData[pair].totalScore)}`}> {pulseData[pair].bias}  </TableCell>
                        <TableCell className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(pulseData[pair].totalScore)}`}>{pulseData[pair].totalScore}  </TableCell>
                      </TableRow>
                    )
                  })}

                  
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