import { useEffect, useState } from 'react';
import {DashboardLayout} from '../../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { housingKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'

const Housing = () => {
  // keep track of different arrays of events as part of one object
  const [{allData, housingData, housingChartData}, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    console.log("loading set to true")
    setLoading(true);
    try {
      console.log("fetching data")
      const data = await fetch('../api/event-calendar')

      const jsonData = await data.json()
      
      // if data is not empty, classify data into categories and currencies and set state
      // const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'events.json';
      // a.click();

      const housingData = getDataSortedByTotalScore(jsonData, housingKeys, null)
      const housingChartData = getChartData(housingData)

      console.log(housingData)

      setEvents({jsonData, housingData, housingChartData});

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
          <h1 className="text-secondary-foreground mb-8"> Housing </h1>
          <EconomicChartAccordion key={"Housing"} data={housingData} chartData={housingChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Housing;