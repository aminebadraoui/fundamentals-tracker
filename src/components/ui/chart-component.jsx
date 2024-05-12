import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { Switch } from "@/components/shadcn/switch";

function calculateMovingAverage(data, period) {
  const movingAverageData = [];
  for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
          movingAverageData.push({ time: data[i].time, value: 0 });
          continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) {
          sum += data[i - j].value;
      }
      const avg = sum / period;
      movingAverageData.push({ time: data[i].time, value: avg });
  }
  return movingAverageData;
}

function calculateZScore(data, period = 26) {
  const zScoreData = [];
  for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
          zScoreData.push({ time: data[i].time, value: 0 });
          continue;
      }
      let sum = 0;
      let sumSquares = 0;
      for (let j = 0; j < period; j++) {
          sum += data[i - j].value;
          sumSquares += Math.pow(data[i - j].value, 2);
      }
      const mean = sum / period;
      const variance = (sumSquares / period) - Math.pow(mean, 2);
      const stdDev = Math.sqrt(variance);
      const zScore = (data[i].value - mean) / stdDev;
      zScoreData.push({ time: data[i].time, value: zScore });
  }
  return zScoreData;
}


export const ChartComponent = props => {
    const {
        data,
        symbol,
        colors: {
            backgroundColor = '#fff', // Dark background for better visibility
            upColor = '#4caf50',  // Green for rising candle
            downColor = '#f44336', // Red for falling candle
            borderUpColor = '#4caf50', // Green border for rising candle
            borderDownColor = '#f44336', // Red border for falling candle
            wickUpColor = '#4caf50', // Green wick for rising candle
            wickDownColor = '#f44336', // Red wick for falling candle
            lineColor = '#2196f3', // Color for the line chart
            retailLineColor = '#ff0000',
            zeroLineColor = '#f87315', // Orange color for the zero line
            sixMonthmovingAverageColor = '#ff0000', // Orange color for the moving average line
            oneYearMovingAverageColor = '#a717d3', // Red color for the moving average line
            zScoreColor = '#0000ff', // Blue color for the Z-score line
            zScoreColor6M = '#ffa500', // Purple color for the 6-month z-score line
            zScoreColor1Y =  '#008000', // Orange color for the 1-year z-score line
            zScoreColor3Y = '#800080', // Green color for the 3-year z-score line
            inactiveColor = '#808080', // Grey color for inactive elements
        } = {},
    } = props;

    const weeklyPrice = data.weeklyPrice;
    const netPositions = data.netPositions;
    const retailNetPositions = data.retailPositions;

    const chartContainerRef = useRef();
    const positionsChartContainerRef = useRef();
    const zScoreChartContainerRef = useRef();

    const [showRetail, setShowRetail] = useState(false);
    const [priceChartLegendText, setPriceChartLegendText] = useState('');
    const [sixMonthMAText, setSixMonthMAText] = useState('');
    const [oneYearMAText, setThreeYearsMAText] = useState('');
    const [positionChartLegendText, setPositionChartLegendText] = useState('');
    const [retailPositionChartLegendText, setRetailPositionChartLegendText] = useState('');
    const [zScore6MLegendText, setZScore6MLegendText] = useState('');
    const [zScore1YLegendText, setZScore1YLegendText] = useState('');
    const [zScore3YLegendText, setZScore3YLegendText] = useState('');

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            positionsChart.applyOptions({ width: positionsChartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor: '#000',  // Light grey text for readability
            },
            width: chartContainerRef.current.clientWidth,
            height: 700,
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            priceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
        });

        const positionsChart = createChart(positionsChartContainerRef.current, {
          width: positionsChartContainerRef.current.clientWidth,
          height: 350,
          layout: {
              background: { type: ColorType.Solid, color: backgroundColor },
              textColor: '#000',
          },
          crosshair: {
              mode: CrosshairMode.Normal,
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
          },
      });

      const zScoreChart = createChart(zScoreChartContainerRef.current, {
        width: zScoreChartContainerRef.current.clientWidth,
        height: 350,
        layout: {
            background: { type: ColorType.Solid, color: backgroundColor },
            textColor: '#000',
        },
        crosshair: {
            mode: CrosshairMode.Normal,
        },
        timeScale: {
            borderColor: `rgba(197, 203, 206, 0.8)`,
        },
    });

        const candleSeries = chart.addCandlestickSeries({
            upColor: upColor,
            downColor: downColor,
            borderDownColor: borderDownColor,
            borderUpColor: borderUpColor,
            wickDownColor: wickDownColor,
            wickUpColor: wickUpColor,
        });

        console.log("weeklyPrice", weeklyPrice);
        weeklyPrice && candleSeries.setData(weeklyPrice);

        const lineSeries = positionsChart.addLineSeries({
          color: showRetail ? inactiveColor : lineColor,
          lineWidth: 2,
        });

        lineSeries.setData(netPositions);

        const retailLineSeries = positionsChart.addLineSeries({
            color: showRetail ? retailLineColor : inactiveColor,
            lineWidth: 2,
          });
      
        retailLineSeries.setData(retailNetPositions);

        const zScoreSeries6M = zScoreChart.addLineSeries({
          color: zScoreColor6M,
          lineWidth: 2,
      });

        const zScoreSeries1Y = zScoreChart.addLineSeries({
            color: zScoreColor1Y,
            lineWidth: 2,
        });

        const zScoreSeries3Y = zScoreChart.addLineSeries({
            color: zScoreColor3Y,
            lineWidth: 2,
        });

        // Calculate and add the Z-scores

        const zScoreData6M = calculateZScore(showRetail ? retailNetPositions: netPositions, 26);
        const zScoreData1Y = calculateZScore(showRetail ? retailNetPositions: netPositions, 52);
        const zScoreData3Y = calculateZScore(showRetail ? retailNetPositions: netPositions, 156);

        zScoreSeries6M.setData(zScoreData6M);
        zScoreSeries1Y.setData(zScoreData1Y);
        zScoreSeries3Y.setData(zScoreData3Y);

        const zeroLineSeries = positionsChart.addLineSeries({
          color: zeroLineColor, 
          lineWidth: 1,
          });

        // Create data for the zero line
        const zeroLineData = netPositions.map(point => ({
          time: point.time,
          value: 0
          }));

          zeroLineSeries.setData(zeroLineData);

        // // Calculate and add the 26-period moving average
        // const sixMonthsMovingAverageData = calculateMovingAverage(netPositions, 26);

        // const sixMonthsMovingAverageSeries = positionsChart.addLineSeries({
        //     color: sixMonthmovingAverageColor,
        //     lineWidth: 1,
        // });
        // sixMonthsMovingAverageSeries.setData(sixMonthsMovingAverageData);

        // const oneYearMovingAverageData = calculateMovingAverage(netPositions, 52);

        // const oneYearMovingAverageSeries = positionsChart.addLineSeries({
        //     color: oneYearMovingAverageColor,
        //     lineWidth: 1,
        // });
        // oneYearMovingAverageSeries.setData(oneYearMovingAverageData);

        chart.timeScale().scrollToPosition(positionsChart.timeScale().scrollPosition(), false);
        positionsChart.timeScale().scrollToPosition(chart.timeScale().scrollPosition(), false);
        zScoreChart.timeScale().scrollToPosition(chart.timeScale().scrollPosition(), false);

        setPriceChartLegendText(`${symbol} - Weekly`);
      
        setPositionChartLegendText(`Weekly Net Positions (Longs-Shorts)`);
        setRetailPositionChartLegendText(`Retail Net Positions`);
        // setSixMonthMAText(`6-Month Average`);
        // setThreeYearsMAText(`1-Year Average `);

        setZScore6MLegendText(`6-Month Z-Score`);
        setZScore1YLegendText(`1-Year Z-Score`);
        setZScore3YLegendText(`3-Year Z-Score`);


       

        chart.subscribeCrosshairMove(param => {
            const dataPoint = getCrosshairDataPoint(candleSeries, param);
            syncCrosshair(positionsChart, lineSeries, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries6M, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries1Y, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries3Y, dataPoint);
            
        });
        positionsChart.subscribeCrosshairMove(param => {
            const dataPoint = getCrosshairDataPoint(lineSeries, param);
            syncCrosshair(chart, candleSeries, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries6M, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries1Y, dataPoint);
            syncCrosshair(zScoreChart, zScoreSeries3Y, dataPoint);
            
        });
        
        zScoreChart.subscribeCrosshairMove(param => {
          const dataPoint = getCrosshairDataPoint(zScoreSeries6M, param);
          syncCrosshair(chart, candleSeries, dataPoint);
          syncCrosshair(positionsChart, lineSeries, dataPoint);
      });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            positionsChart.remove();
            zScoreChart.remove();
        };
    }, [data, showRetail, backgroundColor, upColor, downColor, borderUpColor, borderDownColor, wickUpColor, wickDownColor, lineColor, retailLineColor, zeroLineColor, sixMonthmovingAverageColor, oneYearMovingAverageColor, zScoreColor, zScoreColor6M, zScoreColor1Y, zScoreColor3Y, inactiveColor, symbol]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
         <div style={{ position: 'relative', width: '100%', height: '700px', marginBottom: `4px` }}>
            <div ref={chartContainerRef} />
            <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                {priceChartLegendText}
            </div>
          </div>

          <div className="flex items-center justify-left py-8">
                <span className={`text-lg font-medium ${!showRetail ? 'text-orange-600' : 'text-gray-400'}`}>
                  Institutional Net Positions</span>
                <Switch
                    checked={showRetail}
                    onCheckedChange={setShowRetail}
                    className="mx-3"
                />
                <span className={`text-lg font-medium ${showRetail ? 'text-orange-600' : 'text-gray-400'}`}>Retail Net Positions</span>
            </div>

          <div style={{ position: 'relative', width: '100%', height: '350px' }}>
              <div ref={positionsChartContainerRef} style={{ position: 'relative', width: '100%', height: '350px', marginTop: '4px' }} />
              <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                  <div className='flex flex-col'>
                    <div  style={{ color: `${!showRetail ? lineColor : inactiveColor}`}}>
                        {positionChartLegendText}
                    </div>
                    <div style={{ color: `${showRetail ? retailLineColor : inactiveColor}` }}>{retailPositionChartLegendText}</div>
                    <div  style={{ color: `${sixMonthmovingAverageColor}`}}>
                        {sixMonthMAText}
                    </div>
                    <div  style={{ color: `${oneYearMovingAverageColor}`}}>
                        {oneYearMAText}
                    </div>
                  </div>
              </div>
            </div>

        <div style={{ position: 'relative', width: '100%', height: '350px' }}>
              <div ref={zScoreChartContainerRef} style={{ height: '350px', marginTop: '4px' }} />

              <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                <div className='flex flex-col'>
                      <div  style={{ color: `${zScoreColor6M}`}}>
                          {zScore6MLegendText}
                      </div>
                      <div  style={{ color: `${zScoreColor1Y}`}}>
                          {zScore1YLegendText}
                      </div>
                      <div  style={{ color: `${zScoreColor3Y}`}}>
                          {zScore3YLegendText}
                      </div>
                  </div>
              </div>
              
            </div>
      </div>
       
        
        
    );
};







// import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
// import React, { useEffect, useRef } from 'react';

// export const ChartComponent = props => {
//     const {
//         data,
//         positionsData
//     } = props;

//     const colors = {
//         backgroundColor: '#ffffff',
//         textColor: '#000000',
//         timeScaleBorderColor: 'rgba(197, 203, 206, 0.8)',
//         upColor: '#4caf50',
//         downColor: '#f44336',
//         borderUpColor: '#4caf50',
//         borderDownColor: '#f44336',
//         wickUpColor: '#4caf50',
//         wickDownColor: '#f44336',
//         lineColor: '#2196f3'
//     };

//     const chartContainerRef = useRef();
//     const positionsChartContainerRef = useRef();

//     useEffect(() => {
//         if (chartContainerRef.current && positionsChartContainerRef.current) {
//             const chart = createChart(chartContainerRef.current, {
//                 width: chartContainerRef.current.clientWidth,
//                 height: 350,
//                 layout: {
//                     background: { type: ColorType.Solid, color: colors.backgroundColor },
//                     textColor: colors.textColor,
//                 },
//                 crosshair: {
//                     mode: CrosshairMode.Normal,
//                 },
//                 timeScale: {
//                     borderColor: colors.timeScaleBorderColor,
//                 },
//             });

//             const positionsChart = createChart(positionsChartContainerRef.current, {
//                 width: positionsChartContainerRef.current.clientWidth,
//                 height: 350,
//                 layout: {
//                     background: { type: ColorType.Solid, color: colors.backgroundColor },
//                     textColor: colors.textColor,
//                 },
//                 crosshair: {
//                     mode: CrosshairMode.Normal,
//                 },
//                 timeScale: {
//                     borderColor: colors.timeScaleBorderColor,
//                 },
//             });

//             const candleSeries = chart.addCandlestickSeries({
//                 upColor: colors.upColor,
//                 downColor: colors.downColor,
//                 borderDownColor: colors.borderDownColor,
//                 borderUpColor: colors.borderUpColor,
//                 wickDownColor: colors.wickDownColor,
//                 wickUpColor: colors.wickUpColor,
//             });

//             const lineSeries = positionsChart.addLineSeries({
//                 color: colors.lineColor,
//                 lineWidth: 2,
//             });

//             candleSeries.setData(data);
//             lineSeries.setData(positionsData);

//             // Syncing the crosshairs
//             syncCrosshair(chart, positionsChart);
//             syncCrosshair(positionsChart, chart);

//             window.addEventListener('resize', () => {
//                 chart.applyOptions({ width: chartContainerRef.current.clientWidth });
//                 positionsChart.applyOptions({ width: positionsChartContainerRef.current.clientWidth });
//             });

//             console.log('Charts initialized.');

//             return () => {
//                 window.removeEventListener('resize', () => {
//                     chart.applyOptions({ width: chartContainerRef.current.clientWidth });
//                     positionsChart.applyOptions({ width: positionsChartContainerRef.current.clientWidth });
//                 });
//                 chart.remove();
//                 positionsChart.remove();
//             };
//         } else {
//             console.log('Ref not attached');
//         }
//     }, [data, positionsData]); // Ensure dependencies are correct here

//     return (
//         <div>
//             <div ref={chartContainerRef} style={{ height: '350px' }} />
//             <div ref={positionsChartContainerRef} style={{ height: '350px', marginTop: '20px' }} />
//         </div>
//     );
// };

function syncCrosshair(chart, series, dataPoint) {
  if (dataPoint) {
      chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
      return;
  }
  chart.clearCrosshairPosition();
}

function getCrosshairDataPoint(series, param) {
  if (!param.time) {
      return null;
  }
  const dataPoint = param.seriesData.get(series);
  return dataPoint || null;
}