import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { assets } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { fetchCotData } from '@/utils/getCotData';
import { processAssetData } from '@/utils/pair-data';



export const getServerSideProps = async (context) => {
  return withSession(context, async (context, session) => {
    return withSubscription(context, session, async (context) => {
     
      return {
        props: {
          
        }
      };
    });
  });
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
const fetchCotDataForYears = async (asset, years) => {
  const cotFileName = assets[asset].cotFileName

  const cotDataPromises = years.map(year => fetchDataWithRetry('/api/getCotDataByYear', { cotFileName, year }));
  const batchedCotData = await Promise.all(cotDataPromises);
  return batchedCotData.flat();
};


const Institutional = (props) => {
  
  const [institutionalChartData, setInstitutionalChartData] = useState({});
  const [retailChartData, setRetailChartData] = useState({});
  const [isLoading, setLoading] = useState(true);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const years = [2024]; // or any range of years you have data for
      
      const assetPromises = Object.keys(assets).map(asset => 
        Promise.all([
          fetchCotDataForYears(asset, years),
        ]).then(([cotData]) => {
          return processAssetData(asset, null, cotData, null, null);
        })
      );

      const assetDataArray = await Promise.all(assetPromises);

      const institutionalChartDataArray = assetDataArray.map((data, index) => {
        const asset = Object.keys(assets)[index];
        const assetLongs = data.cot.institutional.long;
        const assetShorts = data.cot.institutional.short;
        const totalPositions = assetLongs + assetShorts;

        const net = (assetLongs - assetShorts).toFixed(2);

        const longs = (assetLongs / totalPositions * 100).toFixed(2);
        const shorts = (assetShorts / totalPositions * 100).toFixed(2);
        return {
          name: asset,
          longs: longs,
          shorts: shorts,
          net: net
        };
      }).sort((a, b) => b.longs - a.longs);

      setInstitutionalChartData(institutionalChartDataArray);

      const retailChartDataArray = assetDataArray.map((data, index) => {
        const asset = Object.keys(assets)[index];
        const assetLongs = data.cot.retail.long;
        const assetShorts = data.cot.retail.short;
        const totalPositions = assetLongs + assetShorts;

        const net = (assetLongs - assetShorts).toFixed(2);

        const longs = (assetLongs / totalPositions * 100).toFixed(2);
        const shorts = (assetShorts / totalPositions * 100).toFixed(2);
        return {
          name: asset,
          longs: longs,
          shorts: shorts,
          net: net
        };
      })

      // Create a map for the institutional sorting order
      const institutionalOrder = institutionalChartDataArray.reduce((acc, curr, index) => {
      acc[curr.name] = index;
      return acc;
      }, {});

      // Sort the retailChartDataArray based on the institutional order
      retailChartDataArray.sort((a, b) => {
      return institutionalOrder[a.name] - institutionalOrder[b.name];
      });

      setRetailChartData(retailChartDataArray);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDownload();
  }, []);

  
// Function to dynamically adjust bar size based on the number of items
const calculateBarSize = (data) => {
  return data.length > 1 ? 50 : 100; // Smaller bar size for multiple items, larger for single
};

return (
  <DashboardLayout>
    {isLoading ? (
      <div className='flex flex-col w-full h-dvh justify-center items-center'> 
        <Loader />
      </div>
    ) : (
      <div className="flex flex-col space-y-4 p-8">
        <h1 className="text-secondary-foreground mb-8">Latest COT Positions</h1>
        <TitledCard title="Institutional">
          <ResponsiveContainer  height={400}>
            <BarChart data={institutionalChartData} barCategoryGap={20} >
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="longs" name="Total Longs" stackId="a" fill="#009900"   />
              <Bar dataKey="shorts" name="Total Shorts" stackId="a" fill="#c20b0a" />
            </BarChart>
          </ResponsiveContainer>
        </TitledCard>

        <TitledCard title="Retail">
          <ResponsiveContainer  height={400}>
            <BarChart data={retailChartData} barCategoryGap={20} >
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="longs" name="Total Longs" stackId="a" fill="#009900"   />
              <Bar dataKey="shorts" name="Total Shorts" stackId="a" fill="#c20b0a" />
            </BarChart>
          </ResponsiveContainer>
        </TitledCard>
      </div>
    )}
  </DashboardLayout>
);
};

export default Institutional;




