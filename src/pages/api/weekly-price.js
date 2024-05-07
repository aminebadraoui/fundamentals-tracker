

export default async (req, res) => {
  const symbol = req.query.symbol

  const formatted_weekly_price_data = await getWeeklyPriceData(symbol)

  res.status(200).json(formatted_weekly_price_data)
}

export const getWeeklyPriceData = async (symbol) => {
  const url =`https://eodhd.com/api/eod/${symbol}?&period=w&api_token=${process.env.EOD_TOKEN}&fmt=json`

  const weekly_price_res = await fetch(url);

  console.log("weekly_price_res", weekly_price_res)

  const weekly_price_json = await weekly_price_res.json()

  console.log("weekly_price_json", weekly_price_json)


  const formatted_weekly_price_data = weekly_price_json.map((data) => {
    return {
      time: data.date,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume
    }
  })

  return formatted_weekly_price_data
}