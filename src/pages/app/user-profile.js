import { useEffect, useState } from 'react';
import {DashboardLayout} from '../../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { housingKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
    return { 
      props: {} 
      };
  })
}

const UserProfile = () => {
  useEffect( () => {
  }, [])

  return (
    <div>
      <DashboardLayout>
        {
         <div>
          <h1 className="text-secondary-foreground mb-8"> User </h1>
         
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default UserProfile;