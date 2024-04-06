import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

const getScoreCell = (score) => {
  return <TableCell className={`${score > 0 ? 'bg-green-500' : score  ==  0 ? 'bg-gray-500' : 'bg-red-500'} text-white font-bold`}>
    {score}
  </TableCell>

}

const createSeparatorRow = () => (  
  <TableRow>
    <TableCell colSpan="8" className="text-left font-bold bg-transparent"></TableCell>
  </TableRow>
)

export const EventsTable = ({events}) => {


  return (
    <div>
         { console.log (events)}
    <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Comparison</TableHead>
              <TableHead>date</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Forecast</TableHead>
              
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
           
            {events.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{event.comparison }</TableCell>
                  <TableCell>{event.date }</TableCell>
                  <TableCell>{event.actual}</TableCell>
                  <TableCell>{event.previous}</TableCell>
                  <TableCell>{event.estimate}</TableCell>
                 
                  {getScoreCell(event.score)}
                </TableRow>
              ))},
          </TableBody>
        </Table>
        </div>
  )
}