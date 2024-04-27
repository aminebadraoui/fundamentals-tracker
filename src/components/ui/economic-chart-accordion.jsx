import React from "react";
import { EventsTable } from '@/components/ui/events-table';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/card';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { TitledCard } from "../shadcn/titled-card";

/*
  * EconomicChartAccordion
  *
  * This component displays a chart and a list of countries with their economic data.
  *
  * @param {Object} data - The data to be displayed in the accordion.
  * @param {Object} chartData - The data to be displayed in the chart.
  */

/* chartData example:
  [
    { country: 'USA', totalScore: 10 },
    { country: 'UK', totalScore: 5 },
    { country: 'Germany', totalScore: 7 },
    { country: 'France', totalScore: 3 },
  ]
*/

/* data example:
  {
    USA: {
      events: [
        { type: 'CPI', date: '2022-01-01', actual: 1.2, estimate: 1.1, previous: 1.0 },
        { type: 'CPI', date: '2022-02-01', actual: 1.3, estimate: 1.2, previous: 1.1 },
      ],
      totalScore: 10,
    },
    UK: {
      events: [
        { type: 'CPI', date: '2022-01-01', actual: 1.2, estimate: 1.1, previous: 1.0 },
        { type: 'CPI', date: '2022-02-01', actual: 1.3, estimate: 1.2, previous: 1.1 },
      ],
      totalScore: 5,
    },
    Germany: {
      events: [
        { type: 'CPI', date: '2022-01-01', actual: 1.2, estimate: 1.1, previous: 1.0 },
        { type: 'CPI', date: '2022-02-01', actual: 1.3, estimate: 1.2, previous: 1.1 },
      ],
      totalScore: 7,
    },
    France: {
      events: [
        { type: 'CPI', date: '2022-01-01', actual: 1.2, estimate: 1.1, previous: 1.0 },
        { type: 'CPI', date: '2022-02-01', actual: 1.3, estimate: 1.2, previous: 1.1 },
      ],
      totalScore: 3,
    },
  }
*/

export const EconomicChartAccordion = ({ data, chartData}) => {
  
  return (
            <div className="space-y-4 p-8 m-8">
              
              <TitledCard title={"Comparative Chart"} className="space-y-4 p-8 m-8">
                
                <CardContent>
                <ResponsiveContainer
                        width='100%'
                        height={500}
                        className={'bg-secondary-foreground'}
                      
                        
                      >
                      <ComposedChart
                        layout="horizontal"
                        data={ chartData }
                        barCategoryGap='40%'
                        
                      >
                      <CartesianGrid stroke="#f5f5f5" />
                      <YAxis type="number" />
                      <XAxis dataKey="country" type="category"  />
                      <Tooltip />
                      <Legend/>
                      <Bar dataKey="totalScore" fill="#414ea0" minPointSize={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  </CardContent>
              </TitledCard>

              <TitledCard title={"Details"} className="space-y-4 p-8 m-8">
                
                { 
                  Object.keys({...data}).map((country) => {
                    const scoreColor = data[country].totalScore > 0 ? 'text-bullish' : data[country].totalScore < 0 ? 'text-bearish' : 'text-neutral'
                    return (
                      <Accordion key={country} type="single"  collapsible className="">
                        <AccordionItem value={country} className={ ` `} >
                          <AccordionTrigger>
                            <div className="flex flex-row w-full items-center justify-between  ">
                              <div className=""> 
                              <p> {country} </p> 
                               </div> 
                              <div className={` p-2 ${scoreColor} rounded space` }> 
                              <p>
                              ({data[country].totalScore.toFixed(2)})
                              </p>
                               </div>
                            
                            
                            


                            </div>
                         
                          </AccordionTrigger>
                          <AccordionContent>
                          <EventsTable events={data[country].events} />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )
                    })
                }
               
              </TitledCard>
           

             

         </div>
          )
      
  
}