export default async (req, res) => {
  const symbol = req.query.symbol

  const url =` https://eodhd.com/api/sentiments/?s=${symbol}&api_token=${process.env.EOD_TOKEN}&fmt=json`

  const sentiment_res = await fetch(url);

  const sentiment_json = await sentiment_res.json()
  

  res.status(200).json(sentiment_json)
}