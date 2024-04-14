export default async (req, res) => {
  const symbol = req.query.symbol
  const sma_period = req.query.period



  const url =` https://eodhd.com/api/technical/${symbol}?order=d&function=sma&filter=last_sma&period=${sma_period}&api_token=${process.env.EOD_TOKEN}&fmt=json`
  console.log(url)
  const sma = await fetch(url);

  const sma_json = await sma.json()

  console.log(sma_json)

  

  res.status(200).json(sma_json)
}