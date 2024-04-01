import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export const EventsTable = ({events}) => {

 

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
    <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>

              <TableHead>Current Week</TableHead>
              <TableHead>Week Reported</TableHead>
              <TableHead>Day Reported </TableHead>

              <TableHead>Actual</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Forecast</TableHead>
              
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            
            {events.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{event.eventTitle}</TableCell>

                  <TableCell>{event.currentWeek }</TableCell>
                  <TableCell>{event.reportedWeek}</TableCell>
                  <TableCell>{event.day}</TableCell>

                  <TableCell>{event.actual}</TableCell>
                  <TableCell>{event.previous}</TableCell>
                  <TableCell>{event.forecast}</TableCell>
                 
                  {getScoreCell(event.score)}
                </TableRow>
              ))},
          </TableBody>
        </Table>
        </div>
  )
}