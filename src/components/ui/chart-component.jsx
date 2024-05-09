import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

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
            zeroLineColor = '#f87315', // Orange color for the zero line
        } = {},
    } = props;

    const weeklyPrice = data.weeklyPrice;
    const netPositions = data.netPositions;

    const chartContainerRef = useRef();
    const positionsChartContainerRef = useRef();

    const [priceChartLegendText, setPriceChartLegendText] = useState('');
    const [positionChartLegendText, setPositionChartLegendText] = useState('');

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
          color: lineColor,
          lineWidth: 2,
        });

        lineSeries.setData(netPositions);

        const zeroLineSeries = positionsChart.addLineSeries({
          color: zeroLineColor, // Red color for the zero line
          lineWidth: 1,
      });

          // Create data for the zero line
          const zeroLineData = netPositions.map(point => ({
            time: point.time,
            value: 0
        }));

        zeroLineSeries.setData(zeroLineData);

        chart.timeScale().scrollToPosition(positionsChart.timeScale().scrollPosition(), false);
        positionsChart.timeScale().scrollToPosition(chart.timeScale().scrollPosition(), false);

        setPriceChartLegendText(`${symbol} - Weekly`);
        setPositionChartLegendText(`Net Positions (Longs-Shorts) - Weekly`);

       

        chart.subscribeCrosshairMove(param => {
          const dataPoint = getCrosshairDataPoint(candleSeries, param);
          syncCrosshair(positionsChart, lineSeries, dataPoint);
          
      });
      positionsChart.subscribeCrosshairMove(param => {
          const dataPoint = getCrosshairDataPoint(lineSeries, param);
          syncCrosshair(chart, candleSeries, dataPoint);
          
      });


        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            positionsChart.remove();
        };
    }, [data, backgroundColor, upColor, downColor, borderUpColor, borderDownColor, wickUpColor, wickDownColor, lineColor]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '700px' }}>
         <div style={{ position: 'relative', width: '100%', height: '700px' }}>
            <div ref={chartContainerRef} />
            <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                {priceChartLegendText}
            </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: '700px' }}>
            <div ref={positionsChartContainerRef} style={{ height: '350px', marginTop: '4px' }} />
            <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                {positionChartLegendText}
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