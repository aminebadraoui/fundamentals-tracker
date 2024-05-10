import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { assets} from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/shadcn/table';


import { getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/pair-data';


import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
   return withSubscription(context, session, async(context) => {


    return { 
      props: {} 
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


const Pulse = (props) => {
  const [pulseData, setPulseData] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const years = [2024];
      const assetPromises = Object.keys(assets).map(asset => 
        Promise.all([
          fetchCotDataForYears(asset, years),
          fetchDataWithRetry('/api/getEventData', { countries: assets[asset].countries.join(',') }),
          fetchDataWithRetry('/api/getWeeklyPriceData', { asset }),
          fetchDataWithRetry('/api/getNewsSentimentData', { symbol: assets[asset].apiSymbol })
        ]).then(([cotData, eventData, weeklyPriceData, newsSentimentData]) => {
          return processAssetData(asset, eventData, cotData, newsSentimentData, weeklyPriceData);
        })
      );

      const assetDataArray = await Promise.all(assetPromises);

      const sortedDataForAllPairs = assetDataArray.sort((a, b) => b.score - a.score);

      setPulseData(sortedDataForAllPairs);
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
         
              <TitledCard title="Scores">
                <Table>
                  <TableHeader>
                    <TableRow className="!border-0 hover:bg-transparent">
                      <TableHead className="font-bold" >Asset</TableHead>
                      <TableHead className="font-bold" >Bias</TableHead>
                      <TableHead className="font-bold" >Score</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                  {pulseData && Object.keys(pulseData).map((asset) => {
                    return (
                      <TableRow key={pulseData[asset].pair} className="!border-0 hover:bg-transparent">
                        <TableCell className="bg-primary text-primary-foreground font-bold">{pulseData[asset].pair}</TableCell>
                        <TableCell className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(pulseData[asset].score)}`}> {pulseData[asset].bias}  </TableCell>
                        <TableCell className={`bg-primary text-primary-foreground font-bold ${getScoreTextColor(pulseData[asset].score)}`}>{pulseData[asset].score.toFixed(2)}  </TableCell>
                      </TableRow>
                    )
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