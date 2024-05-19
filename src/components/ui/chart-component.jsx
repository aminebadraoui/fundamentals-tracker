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
      zScoreColor1Y = '#008000', // Orange color for the 1-year z-score line
      zScoreColor3Y = '#800080', // Green color for the 3-year z-score line
      inactiveColor = '#808080', // Grey color for inactive elements
    } = {},
  } = props;

  const weeklyPrice = data.priceData;
  const netPositions = data.netPositions;
  const retailNetPositions = data.retailPositions;

  const chartContainerRef = useRef();
  const positionsChartContainerRef = useRef();
  const zScoreChartContainerRef = useRef();

  const [showRetail, setShowRetail] = useState(false);
  const [priceChartLegendText, setPriceChartLegendText] = useState('');
  const [sixMonthMAText, setSixMonthMAText] = useState('');
  const [oneYearMAText, setOneYearMAText] = useState('');
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
      height: 500,
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
      height: 200,
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
      rightPriceScale: {
        visible: true,
    },
    leftPriceScale: {
        visible: true,
    },
    });

    const zScoreChart = createChart(zScoreChartContainerRef.current, {
      width: zScoreChartContainerRef.current.clientWidth,
      height: 200,
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

    weeklyPrice && candleSeries.setData(weeklyPrice);

    const lineSeries = positionsChart.addLineSeries({
      color: showRetail ? inactiveColor : lineColor,
      lineWidth: 2,
      priceScaleId: 'right',
      visible: true
    });

    lineSeries.setData(netPositions);

    const retailLineSeries = positionsChart.addLineSeries({
      color: showRetail ? retailLineColor : inactiveColor,
      lineWidth: 2,
      priceScaleId: 'left', // Use a separate price scale
      visible: true
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

    const zScoreData6M = calculateZScore(showRetail ? retailNetPositions : netPositions, 26);
    const zScoreData1Y = calculateZScore(showRetail ? retailNetPositions : netPositions, 52);
    const zScoreData3Y = calculateZScore(showRetail ? retailNetPositions : netPositions, 156);

    zScoreSeries6M.setData(zScoreData6M);
    zScoreSeries1Y.setData(zScoreData1Y);
    zScoreSeries3Y.setData(zScoreData3Y);

    const zeroLineSeries = positionsChart.addLineSeries({
      color: zeroLineColor,
      lineWidth: 1,
    });

    const zeroLineData = netPositions.map(point => ({
      time: point.time,
      value: 0,
    }));

    zeroLineSeries.setData(zeroLineData);

    setPriceChartLegendText(`${symbol} - Weekly`);
    setPositionChartLegendText(`Weekly Net Positions (Longs-Shorts)`);
    setRetailPositionChartLegendText(`Retail Net Positions`);
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

    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      positionsChart.timeScale().setVisibleRange(chart.timeScale().getVisibleRange());
      zScoreChart.timeScale().setVisibleRange(chart.timeScale().getVisibleRange());
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
    

      <div style={{ position: 'relative', width: '100%', height: '100%', marginBottom: `4px` }}>
        <div ref={chartContainerRef} />
        <div className="flex items-center justify-left pt-8 pb-2">
            <span className={`text-lg font-medium ${!showRetail ? 'text-orange-600' : 'text-gray-400'}`}>
                Institutional Net Positions</span>
            <Switch
            checked={showRetail}
            onCheckedChange={setShowRetail}
            className="mx-3"
            />
            <span className={`text-lg font-medium ${showRetail ? 'text-orange-600' : 'text-gray-400'}`}>Retail Net Positions</span>
        </div>

        <div ref={positionsChartContainerRef}  />
        
        <div ref={zScoreChartContainerRef} style={{ marginTop: '4px' }} />
      </div>
  
  );
};

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
