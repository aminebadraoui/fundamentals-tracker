import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { majorForexPairs, cryptoAssets } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import path from 'path';
import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const getServerSideProps = async (context) => {
  return withSession(context, async (context, session) => {
    return withSubscription(context, session, async (context) => {
      const cot_2024_currencies_path = path.join(process.cwd(), 'public/assets/cot-data/2024/currencies.xml');
      const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');
      const cot_2024_bitcoin_path = path.join(process.cwd(), 'public/assets/cot-data/2024/bitcoin.xml');
      const cot_2024_bitcoin_xml = fs.readFileSync(cot_2024_bitcoin_path, 'utf-8');

      try {
        const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);
        const cot_2024_bitcoin_json = await parseCotData(cot_2024_bitcoin_xml);

        return {
          props: {
            cot_2024_currencies: cot_2024_currencies_json,
            cot_2024_bitcoin: cot_2024_bitcoin_json
          }
        };
      } catch (error) {
        console.error('Failed to parse COT data:', error);
        return { props: { error: 'Failed to load data' } };
      }
    });
  });
};

const Institutional = (props) => {
  const [cotData, setCotData] = useState({});
  const [firstElementData, setFirstElementData] = useState({});
  const [isLoading, setLoading] = useState(true);

  const handleDownload = async () => {
    setLoading(true);

    const cot_data = {};
  
    // Assuming findLatestCotDataForAsset is synchronous or properly awaited if asynchronous
    Object.keys(majorForexPairs).forEach(pair => {
      cot_data[pair] = findLatestCotDataForAsset(majorForexPairs[pair].cotName, props.cot_2024_currencies);
    });
  
    Object.keys(cryptoAssets).forEach(asset => {
      cot_data[asset] = findLatestCotDataForAsset(cryptoAssets[asset].cotName, props.cot_2024_bitcoin);
    });
  
    // Create a new object with only the first array element of each key and keep only the two specified properties
    const firstElements = Object.keys(cot_data).reduce((acc, key) => {
      const firstElement = cot_data[key][0]; // assuming each key's value is an array
      const longs = parseFloat(firstElement.comm_positions_long_all[0]);
      const shorts = parseFloat(firstElement.comm_positions_short_all[0]);
      const totalPositions = longs + shorts;
      acc[key] = {
        name: key, // Adding name for easier chart data integration
        comm_positions_long_all: (longs/totalPositions*100).toFixed(2),
        comm_positions_short_all: (shorts/totalPositions*100).toFixed(2),
       

      };
      return acc;
    }, []);
  
    // Sort the array based on the ratio in descending order
    const sortedFirstElements = Object.values(firstElements).sort((a, b) => b.comm_positions_long_all - a.comm_positions_long_all);
  
    setFirstElementData(sortedFirstElements);

    console.log(sortedFirstElements);
  
    setLoading(false);
  };

  useEffect(() => {
    handleDownload();
  }, []);

  return (
    <DashboardLayout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="p-8">
          <h1 className="text-secondary-foreground mb-8">Institutional Positioning</h1>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={firstElementData}>
              
              <XAxis dataKey="name"  tick={{ fill: 'white' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="comm_positions_long_all" stackId="a" fill="#009900" name="Long Positions" 
                 onMouseEnter={() => {}}
                 onMouseLeave={() => {}} />
              <Bar dataKey="comm_positions_short_all" stackId="a" fill="#c20b0a" name="Short Positions"
                 onMouseEnter={() => {}}
                 onMouseLeave={() => {}} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Institutional;
