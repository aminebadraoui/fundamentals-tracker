import { useEffect, useState } from 'react';
import {DashboardLayout} from '../../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { employmentKeys, inflationKeys, interestRatesKeys, housingKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'

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
const Growth = () => {
  // keep track of different arrays of events as part of one object
  const [{allData, growthData, growthChartData}, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await fetch('../api/event-calendar')

      const jsonData = await data.json()

      const growthData = {}
      const growthChartData = getChartData(growthData)

      setEvents({jsonData, growthData, growthChartData});

      setLoading(false);
    } catch (error) { 
      console.log(error)
    }
  };

  useEffect( () => {
    handleDownload()
  }, [])

  return (
    <div>
      <DashboardLayout>
        {
        isLoading ? 
        <div className='flex flex-col w-full h-dvh justify-center items-center '> 
          <Loader />
        </div>
         :  
         <div>
          <h1 className="text-secondary-foreground mb-8"> Growth </h1>
          <EconomicChartAccordion key="Growth" data={growthData} chartData={growthChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Growth;