import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/dashboard-layout';
import { EconomicChartAccordion } from '@/components/ui/economic-chart-accordion';
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys } from '@/utils/event-names';
import { getChartData } from '@/utils/getChartData';
import { Loader } from '@/components/ui/loader';
import { monthDates, years, countryList_Iso3166 } from '@/utils/event-names';
import withSession from '@/lib/withSession';
import withSubscription from '@/lib/withSubscription';
import { upload } from '@vercel/blob/client';

export const getServerSideProps = async (context) => {
  return withSession(context, async (context, session) => {
    return withSubscription(context, session, async (context) => {
      return {
        props: {}
      };
    });
  });
};

const Inflation = () => {
  const [{ inflationData, inflationChartData }, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      
      // let dates = {};

      // years.map((year) => {
      //   dates[year] = [];
      //   Object.keys(monthDates).map((month) => {
      //     const fromDate = `${year}-${monthDates[month].first}`;
      //     const toDate = `${year}-${monthDates[month].last}`;
      //     dates[year].push({ fromDate, toDate, month });
      //   });
      // });

      // let eventsPromises = [];
      // Object.keys(dates).map((year) => {
      //   dates[year].map((date) => {
      //     countryList_Iso3166.map((country) => {
      //       const fromDate = date.fromDate;
      //       const toDate = date.toDate;

      //       try {
      //         const url = `../api/event-calendar?country=${country}&fromDate=${fromDate}&toDate=${toDate}`;
      //         eventsPromises.push(fetch(url).then((res) => res.json().then((data) => ({ country, year, month: date.month, data }))));
      //       } catch (error) {
      //         console.log(error);
      //       }
      //     });
      //   });
      // });

      // const responses = await Promise.all(eventsPromises);

      // // Organize the data into separate JSON objects by year
      // const organizedDataByYear = responses.reduce((acc, { country, year, month, data }) => {
      //   if (!acc[year]) {
      //     acc[year] = {};
      //   }
      //   if (!acc[year][country]) {
      //     acc[year][country] = {};
      //   }
      //   if (!acc[year][country][month]) {
      //     acc[year][country][month] = [];
      //   }
      //   acc[year][country][month].push(...data);
      //   return acc;
      // }, {});

      // // Ensure months are in order for each year and country
      // Object.keys(organizedDataByYear).forEach((year) => {
      //   Object.keys(organizedDataByYear[year]).forEach((country) => {
      //     organizedDataByYear[year][country] = Object.keys(monthDates).reduce((obj, month) => {
      //       obj[month] = organizedDataByYear[year][country][month] || [];
      //       return obj;
      //     }, {});
      //   });
      // });

      // // Upload each year's data separately
      // const uploadPromises = Object.keys(organizedDataByYear).map(async (year) => {
      //   const yearData = organizedDataByYear[year];
      //   console.log('yearData', yearData)
      //   const blobFile = new Blob([JSON.stringify(yearData, null, 2)], { type: 'application/json' });

      //   await upload(`organizedData_${year}.json`, JSON.stringify(yearData, null, 2), {
      //     access: 'public',
      //     handleUploadUrl: '../api/upload-vercel-blob',
      //   });
      // });

      // await Promise.all(uploadPromises);

      const inflationData = getDataSortedByTotalScore(responses.flatMap((res) => res.data), inflationKeys, null);
      const inflationChartData = getChartData(inflationData);

      setEvents({ inflationData, inflationChartData });

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDownload();
  }, []);

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
              <h1 className="text-secondary-foreground mb-8">Inflation</h1>
              <EconomicChartAccordion key={"Inflation"} data={inflationData} chartData={inflationChartData} /> 
            </div>
        }
      </DashboardLayout>
    </div>
  );
};

export default Inflation;
