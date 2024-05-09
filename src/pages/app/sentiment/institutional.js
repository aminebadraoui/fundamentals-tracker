import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { assets } from '@/utils/event-names';
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

      const cot_2024_bitcoin_path = path.join(process.cwd(), 'public/assets/cot-data/2024/crypto.xml');
      const cot_2024_bitcoin_xml = fs.readFileSync(cot_2024_bitcoin_path, 'utf-8');

      const cot_2024_gold_path = path.join(process.cwd(), 'public/assets/cot-data/2024/precious-metals.xml');
      const cot_2024_gold_xml = fs.readFileSync(cot_2024_gold_path, 'utf-8');

      const cot_2024_silver_path = path.join(process.cwd(), 'public/assets/cot-data/2024/precious-metals.xml');
      const cot_2024_silver_xml = fs.readFileSync(cot_2024_silver_path, 'utf-8');

      const cot_2024_oil_path = path.join(process.cwd(), 'public/assets/cot-data/2024/precious-metals.xml');
      const cot_2024_oil_xml = fs.readFileSync(cot_2024_oil_path, 'utf-8');

      try {
        const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);
        const cot_2024_bitcoin_json = await parseCotData(cot_2024_bitcoin_xml);
        const cot_2024_gold_json = await parseCotData(cot_2024_gold_xml);
        const cot_2024_silver_json = await parseCotData(cot_2024_silver_xml);
        const cot_2024_oil_json = await parseCotData(cot_2024_oil_xml);

        return {
          props: {
            cot_2024_currencies: cot_2024_currencies_json,
            cot_2024_bitcoin: cot_2024_bitcoin_json,
            cot_2024_gold: cot_2024_gold_json,
            cot_2024_silver: cot_2024_silver_json,
            cot_2024_oil: cot_2024_oil_json,

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
  
  const [forexData, setForexData] = useState({});
  const [cryptoData, setCryptoData] = useState({});
  const [commodityData, setCommodityData] = useState({});
  const [isLoading, setLoading] = useState(true);

  const handleDownload = async () => {
    setLoading(true);

    const forex_cot_data = {};
    const crypto_cot_data = {};
    const commodities_cot_data = {};
  
    // Assuming findLatestCotDataForAsset is synchronous or properly awaited if asynchronous
    Object.keys(assets).forEach(asset => {
      if (assets[asset].cotFileName === 'currencies') {
      forex_cot_data[asset] = findLatestCotDataForAsset(assets[asset].cotName, props.cot_2024_currencies);
      }
    });
  
    Object.keys(assets).forEach(asset => {
      if (assets[asset].cotFileName === 'crypto') {
      crypto_cot_data[asset] = findLatestCotDataForAsset(assets[asset].cotName, props.cot_2024_bitcoin);
      }
    });

    Object.keys(assets).forEach(asset => {
      if (assets[asset].cotFileName === 'precious-metals') {
        let commodityCotData = {}

        if (asset === 'GOLD') { 
          commodityCotData = props.cot_2024_gold;
        } else if (asset === 'SILVER') {
          commodityCotData = props.cot_2024_silver;
        }
        else if (asset === 'OIL') {
          commodityCotData = props.cot_2024_oil;
        }

        commodities_cot_data[asset] = findLatestCotDataForAsset(assets[asset].cotName, commodityCotData);
    }
    });

    console.log(forex_cot_data)
    console.log(crypto_cot_data)
    console.log(commodities_cot_data)

  
    // Create a new object with only the first array element of each key and keep only the two specified properties
    const forexFirstElements = Object.keys(forex_cot_data).reduce((acc, key) => {
      const firstElement = forex_cot_data[key][0]; // assuming each key's value is an array
      const longs = parseFloat(firstElement.noncomm_positions_long_all[0]);
      const shorts = parseFloat(firstElement.noncomm_positions_short_all[0]);
      const totalPositions = longs + shorts;
      acc[key] = {
        name: key, // Adding name for easier chart data integration
        comm_positions_long_all: (longs/totalPositions*100).toFixed(2),
        comm_positions_short_all: (shorts/totalPositions*100).toFixed(2),
      };
      return acc;
    }, []);
  
    // Sort the array based on the ratio in descending order
    const sortedForexFirstElements = Object.values(forexFirstElements).sort((a, b) => b.comm_positions_long_all - a.comm_positions_long_all);

     // Create a new object with only the first array element of each key and keep only the two specified properties
     const cryptoFirstElements = Object.keys(crypto_cot_data).reduce((acc, key) => {
      const firstElement = crypto_cot_data[key][0]; // assuming each key's value is an array
      const longs = parseFloat(firstElement.noncomm_positions_long_all[0]);
      const shorts = parseFloat(firstElement.noncomm_positions_short_all[0]);
      const totalPositions = longs + shorts;
      acc[key] = {
        name: key, // Adding name for easier chart data integration
        comm_positions_long_all: (longs/totalPositions*100).toFixed(2),
        comm_positions_short_all: (shorts/totalPositions*100).toFixed(2),
      };
      return acc;
    }, []);
  
    // Sort the array based on the ratio in descending order
    const sortedCryptoFirstElements = Object.values(cryptoFirstElements).sort((a, b) => b.comm_positions_long_all - a.comm_positions_long_all);

       // Create a new object with only the first array element of each key and keep only the two specified properties
       const commoditiesFirstElements = Object.keys(commodities_cot_data).reduce((acc, key) => {
        const firstElement = commodities_cot_data[key][0]; // assuming each key's value is an array
        const longs = parseFloat(firstElement.comm_positions_long_all[0]);
        const shorts = parseFloat(firstElement.comm_positions_short_all[0]);
        const totalPositions = longs + shorts;
        acc[key] = {
          name: key, // Adding name for easier chart data integration
          noncomm_positions_long_all: (longs/totalPositions*100).toFixed(2),
          noncomm_positions_short_all: (shorts/totalPositions*100).toFixed(2),
        };
        return acc;
      }, []);
    
      // Sort the array based on the ratio in descending order
      const sortedCommoditiesElements = Object.values(commoditiesFirstElements).sort((a, b) => b.noncomm_positions_long_all - a.noncomm_positions_long_all);
  
    setForexData(sortedForexFirstElements);
    setCryptoData(sortedCryptoFirstElements);
    setCommodityData(sortedCommoditiesElements)

    console.log(sortedForexFirstElements);
  
    setLoading(false);
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
      <Loader />
    ) : (
      <div className="flex flex-col space-y-4 p-8">
        <h1 className="text-secondary-foreground mb-8">Institutional Positioning</h1>
        {/* Forex Chart */}
        <TitledCard title="Forex">
          <ResponsiveContainer  height={400}>
            <BarChart data={forexData} barCategoryGap={20} >
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="comm_positions_long_all" name="Total Longs" stackId="a" fill="#009900"   />
              <Bar dataKey="comm_positions_short_all" name="Total Shorts" stackId="a" fill="#c20b0a" />
            </BarChart>
          </ResponsiveContainer>
        </TitledCard>
        {/* Crypto Chart */}
        <TitledCard title="Crypto">
        <ResponsiveContainer  width="25%" height={400}>
            <BarChart data={cryptoData} barCategoryGap={20} >
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="comm_positions_long_all" name="Total Longs" stackId="a" fill="#009900"   />
              <Bar dataKey="comm_positions_short_all" name="Total Shorts" stackId="a" fill="#c20b0a" />
            </BarChart>
          </ResponsiveContainer>
        </TitledCard>
        {/* Commodities Chart */}
        <TitledCard title="Commodities">
          <ResponsiveContainer width="50%" height={400}>
            <BarChart data={commodityData}  barCategoryGap={20} >
              <XAxis dataKey="name"   tick={{ fill: 'white' }}/>
              <YAxis domain={[0, 100]}   />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="noncomm_positions_long_all" name="Total Longs"  stackId="a" fill="#009900"  />
              <Bar dataKey="noncomm_positions_short_all" name="Total Shorts" stackId="a" fill="#c20b0a"  />
            </BarChart>
          </ResponsiveContainer>
        </TitledCard>
      </div>
    )}
  </DashboardLayout>
);
};

export default Institutional;




