import { useEffect, useState } from 'react';
import {DashboardLayout} from '../../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader'

import { monthDates, years, countryList_Iso3166 } from '@/utils/event-names';

import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';

import { upload } from '@vercel/blob/client';

export const getServerSideProps = async (context) => {
  return withSession(context, async(context, session) => {
   return withSubscription(context, session, async(context) => {
    return { 
      props: {} 
      };
    })
  })
}

const Inflation = () => {
  // keep track of different arrays of events as part of one object
  const [{allData, inflationData, inflationChartData}, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // loop through all the years and months first and last keys to construct the from date and to date in YYYY-MM-DD for the api call

      let dates = {};

      years.map((year) => {
        dates[year] = [];
        Object.keys(monthDates).map((month) => {
          const fromDate = `${year}-${monthDates[month].first}`;
          const toDate = `${year}-${monthDates[month].last}`;
          dates[year].push({ fromDate, toDate, month });
        });
      });

      let eventsPromises = [];
      countryList_Iso3166.map((country) => {
        Object.keys(dates).map((year) => {
          dates[year].map((date) => {
            const fromDate = date.fromDate;
            const toDate = date.toDate;

            try {
              const url = `../api/event-calendar?country=${country}&fromDate=${fromDate}&toDate=${toDate}`;
            

              eventsPromises.push(fetch(url).then((res) => res.json().then((data) => ({ country, year, month: date.month, data }))));
            } catch (error) {
              console.log(error);
            }
          });
        });
      });

      const responses = await Promise.all(eventsPromises);

      console.log(responses);

      // Organize the data into the desired format
      const organizedData = responses.reduce((acc, { country, year, month, data }) => {
        if (!acc[country]) {
          acc[country] = {};
        }
        if (!acc[country][year]) {
          acc[country][year] = {};
        }
        if (!acc[country][year][month]) {
          acc[country][year][month] = [];
        }
        acc[country][year][month].push(...data);
        return acc;
      }, {});

      // Ensure months are in order for each country and year
      Object.keys(organizedData).forEach((country) => {
        Object.keys(organizedData[country]).forEach((year) => {
          organizedData[country][year] = Object.keys(monthDates).reduce((obj, month) => {
            obj[month] = organizedData[country][year][month] || [];
            return obj;
          }, {});
        });
      });

      console.log(organizedData);

      const blobFile = new Blob([JSON.stringify(organizedData, null, 2)], { type: 'application/json' });

      const newBlob = await upload("organizedData.json", blobFile, {
        access: 'public',
        handleUploadUrl: '../api/upload-vercel-blob',
      });

      // // Create a JSON file and trigger download
      
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'organizedData.json';
      // a.click();
      // URL.revokeObjectURL(url);

      const inflationData = getDataSortedByTotalScore(responses.flatMap((res) => res.data), inflationKeys, null);

      const inflationChartData = getChartData(inflationData);

      setEvents({ jsonData: organizedData, inflationData, inflationChartData });

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
          <h1 className="text-secondary-foreground mb-8"> Inflation </h1>
          <EconomicChartAccordion key={"Inflation"} data={inflationData} chartData={inflationChartData} /> 
          </div>
        }
  
      </DashboardLayout>
    </div>
  );
};

export default Inflation;