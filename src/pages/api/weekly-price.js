import { data } from "autoprefixer";

export default async (req, res) => {
  const symbol = req.query.symbol

  const url =` https://eodhd.com/api/eod/${symbol}?&period=w&api_token=${process.env.EOD_TOKEN}&fmt=json`

  const weekly_price_res = await fetch(url);

  const weekly_price_json = await weekly_price_res.json()

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

  console.log("weekly price data called", formatted_weekly_price_data)

  res.status(200).json(formatted_weekly_price_data)
}