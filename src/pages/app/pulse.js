import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys, majorForexPairs } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { TitledCard } from '@/components/generic/titled-card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/generic/table';
import { parseCotData, findLatestReports, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getScoreBackgroundColor, getScoreTextColor } from '@/utils/get-score-color';

export async function getStaticProps() {
  const cot_2024_currencies_path = 'public/assets/cot-data/2024/currencies.xml';
  const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');

  try {
    const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);

    return { 
      props: {
        cot_2024_currencies: cot_2024_currencies_json ,
       } 
      };
  } catch (error) {
    console.error('Failed to parse COT data:', error);
    return { props: { error: 'Failed to load data' } };
  }
}

const Pulse = (props) => {
  const [pulseData, setPulseData] = useState({});
  const [isLoading, setLoading] = useState(false);


  const handleDownload = async () => {
    setLoading(true);
    try {
      const pulseDataPromises = Object.keys(majorForexPairs).map(async (pair) => {
        const countries = majorForexPairs[pair].countries;
 

        const dataForPair = await fetch(`../../api/event-calendar?countries=${countries}`);
        const rawPairData = await dataForPair.json();

        const inflationData = getDataSortedByTotalScore(rawPairData, inflationKeys, null);
        const employmentData = getDataSortedByTotalScore(rawPairData, employmentKeys, null);
        const growthData = getDataSortedByTotalScore(rawPairData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys));
        const interestRateData = getDataSortedByTotalScore(rawPairData, interestRatesKeys, null);
       
       

        return {
          pair: pair,
          inflationScore: calculateScore(inflationData, countries),
          employmentScore: calculateScore(employmentData, countries),
          growthScore: calculateScore(growthData, countries),
          economicScore: calculateEconomicScore(inflationData, employmentData, growthData, countries),
        
        };
      });

      const resolvedPairs = await Promise.all(pulseDataPromises);
      const updatedPulseData = resolvedPairs.reduce((acc, data) => {
        acc[data.pair] = data;
        return acc;
      }, {});

      // Add cot score and technical score to the pulse data

      Object.keys(updatedPulseData).map((pair) => { 
        updatedPulseData[pair]["institutionalPositioningScore"] = 0;
        updatedPulseData[pair]["retailPositioningScore"] = 0
        updatedPulseData[pair]["technicalScore"] = 0;
      })

      // Add total score to the pulse data

      Object.keys(updatedPulseData).map((pair) => { 
        const total = (updatedPulseData[pair]["economicScore"] + 
        updatedPulseData[pair]["institutionalPositioningScore"] + 
        updatedPulseData[pair]["retailPositioningScore"] + 
        updatedPulseData[pair]["technicalScore"]) /4

        updatedPulseData[pair]["totalScore"] = total.toFixed(2);
      })

      // Add bias to the pulse data

      Object.keys(updatedPulseData).map((pair) => { 
        const total = (updatedPulseData[pair]["economicScore"] + 
        updatedPulseData[pair]["institutionalPositioningScore"] + 
        updatedPulseData[pair]["retailPositioningScore"] +
        updatedPulseData[pair]["technicalScore"])/4

        updatedPulseData[pair]["bias"] = total > 0 ? "Bullish" : total < 0 ? "Bearish" : "Neutral";
      })


      setPulseData(updatedPulseData);
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