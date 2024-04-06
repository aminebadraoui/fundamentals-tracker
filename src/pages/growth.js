import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { employmentKeys, inflationKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';


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

      const growthData = getDataSortedByTotalScore(jsonData, null, inflationKeys.concat(employmentKeys))
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
          <p>Loading...</p>
         :  
         <div>
          <EconomicChartAccordion title ="Growth" data={growthData} chartData={growthChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Growth;