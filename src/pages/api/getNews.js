import { assets } from "@/utils/event-names";

export default async (req, res) => {
  const asset = req.query.asset

  const symbol = assets[asset].apiSymbol

  const today = new Date();
  const yesterday = new Date(today.setDate(today.getDate() - 1));
  const formattedYesterday = yesterday.toISOString().split('T')[0];

  const url =` https://eodhd.com/api/news?s=${symbol}&api_token=${process.env.EOD_TOKEN}&from=${formattedYesterday}&limit=100&fmt=json`

  try {
    const news_res = await fetch(url);
    const json = await news_res.json()
    res.status(200).json(json)

  } catch {
      res.status(200).json([])
  }
 
}