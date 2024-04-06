import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { employmentKeys, inflationKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'

const Employment = () => {
  // keep track of different arrays of events as part of one object
  const [{allData, employmentData, employmentChartData}, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('api/event-calendar')

      const jsonData = await data.json()
      
      // if data is not empty, classify data into categories and currencies and set state
      // const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'events.json';
      // a.click();

      const employmentData = getDataSortedByTotalScore(jsonData, employmentKeys, null)
      const employmentChartData = getChartData(employmentData)

      console.log(employmentData)

      setEvents({jsonData, employmentData, employmentChartData});

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
          <EconomicChartAccordion title ="Employment" data={employmentData} chartData={employmentChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Employment;