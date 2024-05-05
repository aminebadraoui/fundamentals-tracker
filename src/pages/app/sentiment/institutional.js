import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { majorForexPairs, cryptoAssets} from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';

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
  

const Institutional = (props) => {
  const [cotData, setCotData] = useState({});
  const [firstElementData, setFirstElementData] = useState({});
  const [isLoading, setLoading] = useState(false);

  const cot_2024_currencies = props.cot_2024_currencies;
  const cot_2024_bitcoin = props.cot_2024_bitcoin;


  const handleDownload = async () => {
    setLoading(true);

    const cot_data = {}

    Object.keys(majorForexPairs).map(async (pair) => {
        cot_data[pair] =  findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_2024_currencies)
      });

   Object.keys(cryptoAssets).map(async (asset) => { 
        cot_data[asset] = findLatestCotDataForAsset(cryptoAssets[asset].cotName, cot_2024_bitcoin)
      });
  
    setCotData(cot_data);

    

    setCotData(cot_data);

    // Create a new object with only the first array element of each key
    const firstElements = Object.keys(cot_data).reduce((acc, key) => {
      acc[key] = cot_data[key][0]; // assuming each key's value is an array
      return acc;
    }, {});

    setFirstElementData(firstElements);

    console.log("first elements", firstElements)
    
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
              <h1 className="text-secondary-foreground mb-8"> Institutional Positioning </h1>
              <p>
   
              </p>

              <TitledCard title="Coming Soon">
             
              {/* {JSON.stringify(firstElementData)} */}
              
              </TitledCard>
              </div>
            </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Institutional;