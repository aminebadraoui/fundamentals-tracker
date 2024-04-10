import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { employmentKeys, inflationKeys, interestRatesKeys, housingKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'


const Growth = () => {
  // keep track of different arrays of events as part of one object
  const [{allData, growthData, growthChartData}, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('api/event-calendar')

      const jsonData = await data.json()

      const growthData = getDataSortedByTotalScore(jsonData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys).concat(housingKeys))
      const growthChartData = getChartData(growthData)

      console.log(growthData)

      setEvents({jsonData, growthData, growthChartData});

      setLoading(false);
      console.log("loading set to false")
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
          <EconomicChartAccordion key="Growth" title ="Growth" data={growthData} chartData={growthChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Growth;