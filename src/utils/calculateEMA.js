const calculateEMA = (prices, period = 9) => {
  if (prices.length < period) {
    throw new Error("Not enough data to calculate EMA");
  }

  const ema = [];
  const k = 2 / (period + 1);

  // Calculate the initial SMA for the first 'period' days
  let sma = prices.slice(0, period).reduce((sum, price) => sum + price.close, 0) / period;
  ema.push(sma);

  // Calculate the EMA for the remaining days
  for (let i = period; i < prices.length; i++) {
    const close = prices[i].close;
    const prevEma = ema[ema.length - 1];
    const newEma = close * k + prevEma * (1 - k);
    ema.push(newEma);
  }

  return ema;
};


export { calculateEMA };