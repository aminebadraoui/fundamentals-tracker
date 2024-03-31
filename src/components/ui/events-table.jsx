import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export const EventsTable = ({events}) => {

  const getTotalScore = (events) => { 
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
                <TableCell className={`${getTotalScore(events) > 0 ? 'bg-green-500' : getTotalScore(events) == 0 ? 'bg-gray-500' : 'bg-red-500'} text-white font-bold `}>
                  {getTotalScore(events)}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
  )
}