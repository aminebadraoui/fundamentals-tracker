import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

export const ChartComponent = props => {
    const {
        data,
        colors: {
            backgroundColor = '#fff', // Dark background for better visibility
            upColor = '#4caf50',  // Green for rising candle
            downColor = '#f44336', // Red for falling candle
            borderUpColor = '#4caf50', // Green border for rising candle
            borderDownColor = '#f44336', // Red border for falling candle
            wickUpColor = '#4caf50', // Green wick for rising candle
            wickDownColor = '#f44336', // Red wick for falling candle
        } = {},
    } = props;

    const chartContainerRef = useRef();
    const [legendText, setLegendText] = useState('');

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
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
        const candleSeries = chart.addCandlestickSeries({
            upColor: upColor,
            downColor: downColor,
            borderDownColor: borderDownColor,
            borderUpColor: borderUpColor,
            wickDownColor: wickDownColor,
            wickUpColor: wickUpColor,
        });

        candleSeries.setData(data);

        chart.subscribeCrosshairMove(param => {
            if (param && param.time && param.seriesPrices && param.seriesPrices.get(candleSeries)) {
                const price = param.seriesPrices.get(candleSeries);
                setLegendText(`${props.symbol} - ${props.timeframe}: ${price.close.toFixed(2)}`);
            } else {
                setLegendText(`${props.symbol} - ${props.timeframe}`);
            }
        });

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, upColor, downColor, borderUpColor, borderDownColor, wickUpColor, wickDownColor]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '700px' }}>
            <div ref={chartContainerRef} />
            <div style={{ position: 'absolute', left: '10px', top: '10px', color: '#000', zIndex: 10 }}>
                {legendText}
            </div>
        </div>
    );
};
