import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';

const GaugeChart = ({ score }) => {
  const colors = ['#ff6347', '#ff8c00', '#ddd', '#90ee90', '#32cd32']; // Colors for Strong Sell, Sell, Neutral, Buy, Strong Buy
  const data = [
    { name: "Strong Sell", value: 25, color: colors[0] },
    { name: "Sell", value: 25, color: colors[1] },
    { name: "Neutral", value: 50, color: colors[2] },
    { name: "Buy", value: 25, color: colors[3] },
    { name: "Strong Buy", value: 25, color: colors[4] }
  ];

  const getActiveIndex = () => {
    if (score <= -50) return 0;
    if (score <= -25) return 1;
    if (score <= 25) return 2;
    if (score <= 50) return 3;
    return 4;
  };

  const activeIndex = getActiveIndex();

  // Customized label to display
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = index === 2 ? outerRadius - 20 : outerRadius + 20; // Pull 'Neutral' inward slightly for better centering
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const alignment = index === 2 ? 'middle' : (x > cx ? 'start' : 'end'); // Center alignment for Neutral

    return (
      <Text 
        x={x} 
        y={y} 
        fill={data[index].color} 
        textAnchor={alignment} 
        dominantBaseline="central"
        style={{ fontWeight: 'bold' }}
      >
        {data[index].name}
      </Text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          label={renderCustomizedLabel}
          labelLine={false}
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart;
