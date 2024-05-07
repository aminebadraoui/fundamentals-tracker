import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

import React, { useEffect, useRef } from 'react';

export const ChartComponent = props => {
    const {
        data,
        colors: {
            backgroundColor = '#fff', // Default to a darker background for visibility
            upColor = '#4caf50',  // Green for rising candle
            downColor = '#f44336', // Red for falling candle
            borderUpColor = '#4caf50', // Green border for rising candle
            borderDownColor = '#f44336', // Red border for falling candle
            wickUpColor = '#4caf50', // Green wick for rising candle
            wickDownColor = '#f44336', // Red wick for falling candle
        } = {},
    } = props;

    const chartContainerRef = useRef();

    useEffect(
        () => {
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            };

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
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
            const candleSeries = chart.addCandlestickSeries({
                upColor: upColor,
                downColor: downColor,
                borderDownColor: borderDownColor,
                borderUpColor: borderUpColor,
                wickDownColor: wickDownColor,
                wickUpColor: wickUpColor,
            });

            console.log(data)

            candleSeries.setData(data);

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        },
        [data, backgroundColor, upColor, downColor, borderUpColor, borderDownColor, wickUpColor, wickDownColor]
    );

    return (
        <div
            ref={chartContainerRef}
            style={{ width: '100%', height: '700px' }}
        />
    );
};
