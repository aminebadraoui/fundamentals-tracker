import React from 'react';
import { Card } from '@/components/generic/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/generic/table'
import { TitledCard } from '../generic/titled-card';

const Style = {
  Wrapper : "flex flex-row flex-wrap items-start p-8 space-x-4 space-y-4",
  InternalCard: " space-y-4 p-8 ",
  Heading: 'text-primary-foreground'
}

export const MonitorDataTable = ({tableTitle, valueTitle,  data, actualKey, previousKey}) => {
  return (
    <TitledCard title={tableTitle}>
    <Table>
    <TableHeader>
      <TableRow className="!border-0 hover:bg-transparent">
        <TableHead className="bg-transparent border-0" > </TableHead>
        <TableHead className="font-bold"  colspan={ 2 }>{valueTitle}</TableHead>
      </TableRow>

      <TableRow className="!border-0 hover:bg-transparent">
      <TableHead className=" border-0 bg-transparent hover:bg-transparent"> </TableHead>
        <TableHead className="font-bold" > Current</TableHead>
        <TableHead className="font-bold"  >  Previous</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>

  {
    Object.keys(data).map((key) => {
      const country = data[key]
      const cellBg = country.actual > country.previous ? '' 
      : country.actual < country.previous ?  '' : ''
    
      return (
        <TableRow>
          <TableCell className=" bg-primary text-primary-foreground font-bold">{key}</TableCell>
          <TableCell className= {`${cellBg} text-primary-foreground`}   >{ `${country.actual}` }</TableCell>
          <TableCell className={`${cellBg} text-primary-foreground`}  >{ `${country.previous}` }</TableCell>
        </TableRow>
      )
    })
  }
</TableBody>
</Table>

</TitledCard>
  )}