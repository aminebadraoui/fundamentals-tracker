import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, housingKeys } from '@/utils/event-names';
import { Loader } from '@/components/ui/loader';
import { EconomicOverviewDataTable } from '@/components/ui/economic-overview-data-table';
import { MonitorDataTable } from '@/components/ui/monitor-data-table';
import { getEconomicOverviewData } from '@/utils/get-economic-overview-data';
import { getInflationRateMonitorData } from '@/utils/get-inflation-rate-monitor-data';
import { getInterestRateMonitorData } from '@/utils/get-interest-rate-monitor-data';
import { TitledCard } from '@/components/shadcn/titled-card';

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

const EconomicOverview = () => {
  // Combining all states into one object
  const [state, setState] = useState({
    economicOverviewData: null,
    interestRateMonitorData: null,
    inflationRateMonitorData: null,
    isLoading: false
  });

  const handleDownload = async () => {
    console.log("handleDownload");
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const data = await fetch('../api/event-calendar');
      const rawData = await data.json();

      console.log("rawData", rawData)

      const inflationData = getDataSortedByTotalScore(rawData, inflationKeys, null);
      console.log("inflationData", inflationData)
      const employmentData = getDataSortedByTotalScore(rawData, employmentKeys, null);
      const housingData = getDataSortedByTotalScore(rawData, housingKeys, null)
      const growthData = {}
      const interestRateData = getDataSortedByTotalScore(rawData, interestRatesKeys, null);

      const economicOverviewData_local = getEconomicOverviewData(inflationData, employmentData, growthData, housingData);



      const interestRateMontorData_local = getInterestRateMonitorData(interestRateData);
      const inflationRateMontorData_local = getInflationRateMonitorData(inflationData);

      setState({
        economicOverviewData: economicOverviewData_local,
        interestRateMonitorData: interestRateMontorData_local,
        inflationRateMonitorData: inflationRateMontorData_local,
        isLoading: false
      });

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    handleDownload();
  }, []);

  const diffDays = (date1, date2) => {
    return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));
  };

  const formattedDaySchedule = (date1, date2) => {
    return diffDays(date1, date2) > 1 ? `${diffDays(date1, date2)} days` : `${diffDays(date1, date2)} day`;
  };

  const Style = {
    Wrapper: `
    grid 
  grid-cols-1 
  md:grid-cols-2 
  gap-4 px-4
  md:p-8`,
    InternalCard: `
    space-y-4   
    md:p-8`
  };

  return (
    <div>
      <DashboardLayout>
        {state.isLoading ? 
          <div className='flex flex-col w-full h-dvh justify-center items-center'> 
              <Loader />
          </div>
         :  
         state.economicOverviewData 
         && state.interestRateMonitorData 
         && state.inflationRateMonitorData && 
         <div className={Style.Wrapper}>
            <div className='md:col-span-2'> 
              <h1 className="text-secondary-foreground mb-8">Economic Overview</h1>
              <TitledCard title="Scores">
                <EconomicOverviewDataTable key={"Overview Table"} data={state.economicOverviewData} />
              </TitledCard>
            </div>

            <MonitorDataTable 
              tableTitle="Interest Rate Monitor" 
              valueTitle={"Interest Rates"} 
              data={state.interestRateMonitorData} />

            <MonitorDataTable 
              tableTitle="Inflation Rate YoY Monitor" 
              valueTitle={"Inflation Rate YoY"} 
              data={state.inflationRateMonitorData} />
          </div>
        }
      </DashboardLayout>
    </div>
  );
};

export default EconomicOverview;
