import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table'

const Style = {
  Wrapper : "flex flex-row flex-wrap items-start p-8 space-x-4 space-y-4",
  InternalCard: " space-y-4 p-8 ",
  Heading: 'text-secondary-foreground'
}

const getScoreCell = (score) => {
  return <TableCell className={`font-bold ${score > 50 ? 'text-strongBuy' : score > 25 ? 'text-buy' : score > -25 ? 'text-neutral' : score  > -50 ? 'text-sell' : 'text-strongSell '} `}>
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
          <TableHead className="bg-transparent border-0"> </TableHead>
          <TableHead className=""> Total Score </TableHead>
            <TableHead className=""> Inflation </TableHead>
            <TableHead className=""> Employment </TableHead>
            <TableHead className=""> Housing </TableHead>
            <TableHead className=""> Growth </TableHead>
            
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {
            Object.keys(data).map((key) => {
              const country = data[key]
              return (
                <TableRow key={key}>
                  <TableCell className="font-bold bg-primary ">{key}</TableCell>
                  {getScoreCell(  (country.totalScore).toFixed(2)  ) }

                  <TableCell className=" text-primary-foreground bg-primary ">{ country.inflationScore.toFixed(2) }</TableCell>
                  <TableCell className=" text-primary-foreground bg-primary ">{ country.employmentScore.toFixed(2) }</TableCell>
                  <TableCell className="text-primary-foreground bg-primary ">{ country.housingScore.toFixed(2) }</TableCell>
                  <TableCell className=" text-primary-foreground bg-primary ">{ country.growthScore.toFixed(2) }</TableCell>

                  
                 
                  
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
  );
}

