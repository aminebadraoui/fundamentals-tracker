import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../shadcn/table";


export const EventsTable = ({events}) => {
  return (
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
                  <TableCell className={`font-bold`}> {event.type} </TableCell>
                  <TableCell> {event.comparison } </TableCell>
                  <TableCell> {event.date  } </TableCell>
                  <TableCell> {event.actual} </TableCell>
                  <TableCell> {event.previous} </TableCell>
                  <TableCell> {event.estimate} </TableCell>
                  <TableCell className={`font-bold ${event.score > 50 ? `text-strongBuy` : event.score > 25 ? `text-buy` : event.score > -25 ? `text-neutral` : event.score > -50 ? `text-sell` :  `text-strongSell`}`} > {event.score} </TableCell>
                 
              
                </TableRow>
              ))}
          </TableBody>
        </Table> 
  )
}