import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys, assets} from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/shadcn/titled-card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/shadcn/table';
import { parseCotData, findLatestReports, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';
import { processAssetData } from '@/utils/pair-data';
import { getCryptoData } from '@/utils/crypto-data';

import path from 'path';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
   return withSubscription(context, session, async(context) => {

    const cot_2024_currencies_path = path.join(process.cwd(), 'public/assets/cot-data/2024/currencies.xml');
    const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');
  
    const cot_2024_bitcoin_path = path.join(process.cwd(), 'public/assets/cot-data/2024/crypto.xml');
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

const fetchAssetData = async (asset) => {
  const response = await fetch(`/api/get-asset-data?asset=${asset}`);
  return response.json();
};
  

const Pulse = (props) => {
  const [pulseData, setPulseData] = useState({});
  const [isLoading, setLoading] = useState(false);

  const cot_2024_currencies = props.cot_2024_currencies;
  const cot_2024_bitcoin = props.cot_2024_bitcoin;


  const handleDownload = async () => {
    setLoading(true);
    try {
      const assetPromises = Object.keys(assets).map(asset => fetchAssetData(asset));
      const assetDataArray = await Promise.all(assetPromises);

      const sortedDataForAllPairs = assetDataArray.sort((a, b) => b.score - a.score);

      console.log("assetDataArray", sortedDataForAllPairs)

   
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