import React from 'react';
import { Card } from '@/components/shadcn/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table'
import { TitledCard } from '../shadcn/titled-card';
import { getScoreTextColor } from '@/utils/get-score-color';

const Style = {
  Wrapper : "flex flex-row flex-wrap items-start p-8 space-x-4 space-y-4",
  InternalCard: " space-y-4 p-8 ",
  Heading: 'text-primary-foreground'
}

export const MonitorDataTable = ({tableTitle, valueTitle,  data}) => {
  return (
    <TitledCard title={tableTitle}>
    <Table>
    <TableHeader>
     

      <TableRow className="!border-0 hover:bg-transparent">
      <TableHead className=" border-0 bg-transparent hover:bg-transparent"> </TableHead>
        <TableHead className="font-bold"  > Current</TableHead>
        <TableHead className="font-bold "  >  Previous</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>

  {
    Object.keys(data).map((key) => {
      const country = data[key]
      const cellBg = country.actual > country.previous ? 'text-strongBuy' 
      : country.actual < country.previous ?  'text-strongSell' : 'text-primary-foreground'
    
      return (
        <TableRow key={key}>
          <TableCell className=" bg-primary text-primary-foreground font-bold ">{key}</TableCell>
          <TableCell className= {`${cellBg} font-medium `}   >{ `${country.actual}` }</TableCell>
          <TableCell className={`${cellBg} font-medium`} >{ `${country.previous}` }</TableCell>
        </TableRow>
      )
    })
  }
</TableBody>
</Table>

</TitledCard>
  )}