import React from "react";
import { EventsTable } from '@/components/ui/events-table';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcn/accordion";
import { TitledCard } from "../shadcn/titled-card";

export const EconomicChartAccordion = ({ data, chartData }) => {
  const axisStyle = {
    fontWeight: 'bold',
    fill: '#ffffff',
  };

  return (
    // Removed outer padding and margin on small screens, kept it for medium and larger screens
    <div className="md:space-y-4 md:p-8 md:m-8 flex flex-col md:flex-row justify-between space-x-0 md:space-x-4">
      <div className="flex-1 mb-4 md:mb-0"> {/* Flex item with conditional bottom margin */}
        <TitledCard title="Comparative Chart">
          <CardContent className="p-0"> {/* Remove padding from CardContent */}
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart
                layout="vertical"
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Consider reducing these margins on smaller screens if necessary
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-100, 100]} tick={axisStyle} />
                <YAxis dataKey="country" type="category" tick={axisStyle} />
                <Tooltip />
                <Legend />
                <Bar dataKey="scores" fill="#f87315" barSize={30} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </TitledCard>
      </div>
      <div className="flex-1"> {/* Second card, no conditional margin */}
        <TitledCard title="Details">
          {Object.keys({...data}).map((country) => {
            const scoreColor = data[country].totalScore > 0 ? 'text-bullish' : data[country].totalScore < 0 ? 'text-bearish' : 'text-neutral';
            return (
              <Accordion key={country} type="single" collapsible>
                <AccordionItem value={country} className={`text-secondary-foreground font-bold`}>
                  <AccordionTrigger>
                    <div className="flex flex-row w-full items-center justify-between">
                      <p>{country}</p>
                      <div className={`p-2 ${scoreColor} font-bold rounded`}>
                        <p>({data[country].totalScore.toFixed(2)})</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <EventsTable events={data[country].events} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </TitledCard>
      </div>
    </div>
  );
};

