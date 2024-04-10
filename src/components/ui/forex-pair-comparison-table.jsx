import React from 'react';
import { Card } from '@/components/generic/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/generic/table'
import { TitledCard } from '../generic/titled-card';



export const ForexPairComparisonTable = ({pair, ticker1, ticker2, data}) => {

  // filter data so the keys are either ticker1 or ticker2
 

  console.log("data", data)
  console.log("ticker1", ticker1)
  console.log("ticker2", ticker2)

  const getPairScore = (score1, score2) => {
    const pairScore = score1 > score2 ? 1 : score1 < score2 ? -1 : 0
    return pairScore 
  }

  return (
    <TitledCard key={`${pair}_card`} title={pair}>
      <Table>
        <TableHeader>

        <TableRow key={`${pair}_pair-row`} className="hover:bg-transparent">
        <TableHead  className="bg-transparent hover:bg-transparent" ></TableHead>
            {
              Object.keys(data).map((key) => {
                return <TableHead  key={`${pair}${key}_head`} className="font-bold" >{key}</TableHead>
              })
            }
            <TableHead key={pair} className="font-bold" >{pair}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody key={`${pair}_table_body`}>
          <TableRow key={`${pair}_inflation_score_row`}> 
          <TableCell> Inflation Score </TableCell>

          {
            Object.keys(data).map((key) => { 
              return <TableCell key={`${pair}${key}_inflation_score_cell`}> {data[key].inflationScore.toFixed(2)} </TableCell>
             })

          }

          {
            data[ticker1] && data[ticker2] ? 
            
            <TableCell> {getPairScore(data[ticker1].inflationScore, data[ticker2].inflationScore) }</TableCell> : <TableCell> {"N/A"} </TableCell>
          }
          </TableRow>

          <TableRow key={`${pair}_economic_score_row`}> 
          <TableCell> Economic Score </TableCell>
          {
            Object.keys(data).map((key) => { 
              return <TableCell key={`${pair}${key}_economic_score_cell`}> {data[key].economicScore.toFixed(2)} </TableCell>
             })

          }
           {
            data[ticker1] && data[ticker2] ? 
            
            <TableCell> {getPairScore(data[ticker1].inflationScore, data[ticker2].inflationScore) }</TableCell> : <TableCell> {"N/A"} </TableCell>
          }
          
          </TableRow>

        
          <TableRow key={`${pair}_total_score_row`} className={'hover:bg-transparent'}>
          <TableCell key={`${pair}_total_score_blank_cell`} colspan={3} className={'bg-transparent'} >  </TableCell>
          {
            data[ticker1] && data[ticker2] ? 
            
            <TableCell> {getPairScore(data[ticker1].inflationScore, data[ticker2].inflationScore) + getPairScore(data[ticker1].economicScore, data[ticker2].economicScore)
            }</TableCell> : <TableCell> {"N/A"} </TableCell>
          }

          </TableRow>
        </TableBody>
      </Table>
      </TitledCard>
  );
}

