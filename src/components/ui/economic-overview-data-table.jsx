import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/generic/table'

const Style = {
  Wrapper : "flex flex-row flex-wrap items-start p-8 space-x-4 space-y-4",
  InternalCard: " space-y-4 p-8 ",
  Heading: 'text-secondary-foreground'
}

const getScoreCell = (score) => {
  return <TableCell className={`${score > 0 ? 'text-bullish' : score  ==  0 ? 'text-neutral' : 'text-bearish '} `}>
   { score > 0 ? `+${score}` : score} 
  </TableCell>
}
/*  
{
  US: {
    inflationScore: 1
    EconomicScore 1
    TotalScore: 2
  },
  AU: {
    inflationScore: 1
    EconomicScore 1
    TotalScore: 2
  }
  ,...
}
*/

export const EconomicOverviewDataTable = ({data}) => {
  return (
      <Table>
        <TableHeader>
          <TableRow className="!border-0 hover:bg-transparent">
            <TableHead className="bg-transparent border-0" font-bold> </TableHead>
            <TableHead  colSpan = { 3 }> Scores </TableHead>
          </TableRow>

          <TableRow className="!border-0 hover:bg-transparent">
          <TableHead className="bg-transparent border-0"> </TableHead>
            <TableHead> Inflation Score </TableHead>
            <TableHead> Economic Score </TableHead>
            <TableHead> Total Score </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {
            Object.keys(data).map((key) => {
              const country = data[key]
              return (
                <TableRow key={key}>
                  <TableCell className="text-primary-foreground bg-primary ">{key}</TableCell>
                  
                  {getScoreCell(country.inflationScore.toFixed(2))}
                  {getScoreCell(country.economicScore.toFixed(2))}
                  {getScoreCell(  (country.totalScore).toFixed(2) / 2 ) }
                  
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
  );
}

