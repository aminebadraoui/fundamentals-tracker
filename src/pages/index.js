import { useEffect, useState } from 'react';
import {DashboardLayout} from '../components/ui/dashboard/dashboard-layout';
import { getCurrentEventsPerCategory } from '@/utils/get-current-events-per-category';


import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import dashboardLayout from '../components/ui/dashboard/dashboard-layout';

const ForexEvents = () => {
  
  // keep track of different arrays of events as part of one object

  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

   // get the combined data from the mongodb database
    // if the combined data is not empty, then set the state to the combined data
    const getCombinedData = async () => {
      setLoading(true);
      const response = await fetch('/api/get-data');
      const data = await response.json();
      console.log(data)
      return data
    }
  

  const handleDownload = async () => {

    const combinedData = await getCombinedData()
    const currentEventsPerCategory = getCurrentEventsPerCategory(combinedData)

    const temp_events = {}

    temp_events["Inflation Data"] = currentEventsPerCategory["Inflation Data"];
    temp_events["Retail Data"] = currentEventsPerCategory["Retail Data"];
    temp_events["Economic Growth Data"] = currentEventsPerCategory["Economic Growth Data"];
    temp_events["Housing Data"] = currentEventsPerCategory["Housing Data"];
   
    setEvents(temp_events);
    
    setLoading(false);
  };

  useEffect( () => {
    handleDownload()
  }, [])

  const getTotalScore = () => { 
    let totalScore = 0;
    for (const category in events) {
      for (const event of events[category]) {
        totalScore += event.score;
      }
    }
    return totalScore;
  };

  const getCategoryTotalScore = (categoryEvents) => { 
    let totalScore = 0;
    for (const event of categoryEvents) {
      totalScore += event.score;
    }
    return totalScore;
  };


  const getCategoryHeader = (category) => (
    <TableRow className="bg-blue-100">
      <TableCell colSpan="8" className="text-center font-bold">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </TableCell>
    </TableRow>
  );

  const getScoreCell = (score) => (
    <TableCell className={`${score > 0 ? 'bg-green-500' : score  ==  0 ? 'bg-gray-500' : 'bg-red-500'} text-white font-bold`}>
      {score}
    </TableCell>
  );

  const createSeparatorRow = () => (  
    <TableRow>
                <TableCell colSpan="8" className="text-left font-bold bg-transparent"></TableCell>
              </TableRow>
  )

  return (
   
    <div>
       <DashboardLayout>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Current Week</TableHead>
              <TableHead>Week Reported</TableHead>
              <TableHead>Day Reported </TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Forecast</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(events).map((category) => [
              getCategoryHeader(category),
              events[category].map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{event.eventTitle}</TableCell>
                  <TableCell>{event.currentWeek }</TableCell>
                  <TableCell>{event.week}</TableCell>
                  <TableCell>{event.day}</TableCell>
                  <TableCell>{event.forecast}</TableCell>
                  <TableCell>{event.previous}</TableCell>
                  <TableCell>{event.actual}</TableCell>
                  {getScoreCell(event.score)}
                </TableRow>
              )),
              <TableRow>
                <TableCell colSpan="7" className="text-left font-bold bg-slate-100">Total Category Score for { category }</TableCell>
                  <TableCell className={`${getCategoryTotalScore(events[category]) > 0 ? 'bg-green-500' : getCategoryTotalScore(events[category]) == 0 ? 'bg-gray-500' :  'bg-red-500' } text-white font-bold `}>
                  { getCategoryTotalScore(events[category]) }
                </TableCell>
              </TableRow>,
              createSeparatorRow()
              
             
            ])}
            { createSeparatorRow() }
              

            { // add table row that aggregates the scores of all events from all categories and displays the total score wkth a different color based on the total score value 
            
              <TableRow>
                <TableCell colSpan="7" className="text-left font-bold bg-slate-100">Total Score</TableCell>

                <TableCell className={`${getTotalScore() > 0 ? 'bg-green-500' : 'bg-red-500'} text-white font-bold `}>
                  {getTotalScore()}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      )}
      </DashboardLayout>
    </div>
    
   
  );
};

export default ForexEvents;