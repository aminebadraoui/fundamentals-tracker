export default async (req, res) => {
  const symbol = req.query.symbol

  const url =` https://eodhd.com/api/eod/${symbol}?order=d&filter=last_close&api_token=${process.env.EOD_TOKEN}&fmt=json`

  const last_close_res = await fetch(url);

  const last_close_json = await last_close_res.json()

  res.status(200).json(last_close_json)
}