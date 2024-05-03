export default async (req, res) => {
  const symbol = req.query.symbol
  const sma_period = req.query.period

  const url =` https://eodhd.com/api/technical/${symbol}?function=sma&filter=last_sma&&period=${sma_period}&api_token=${process.env.EOD_TOKEN}&fmt=json`

  const sma = await fetch(url);

  const sma_json = await sma.json()



  res.status(200).json(sma_json)
}