import { majorForexPairs  } from '@/utils/event-names';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getPairData } from '@/utils/pair-data';


export default async (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'

  console.log("forex pair data called")
  const pair = req.query.pair
  const countries = majorForexPairs[pair].countries

  const cot_2024_currencies_path = 'public/assets/cot-data/2024/currencies.xml';
  const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');

  const cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);

  const cot_for_pair = findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_2024_currencies_json)

  const data = await fetch(`${baseUrl}/api/event-calendar?countries=${countries}`)
  const jsonData = await data.json()

  const last_sma50 = await fetch(`${baseUrl}/api/technical-sma?symbol=${pair}.FOREX&period=20`)
  const last_sma50_json = await last_sma50.json()

  const last_sma_200 = await fetch(`${baseUrl}/api/technical-sma?symbol=${pair}.FOREX&period=50`)
  const last_sma200_json = await last_sma_200.json()

  const last_close = await fetch(`${baseUrl}/api/last-close?symbol=${pair}.FOREX`)
  const last_close_json = await last_close.json()

  const weekly_price_data = await fetch(`${baseUrl}/api/weekly-price?symbol=${pair}.FOREX`)
  const weekly_price_data_json = await weekly_price_data.json()

  const news_sentiment = await fetch(`${baseUrl}/api/news-sentiment?symbol=${pair}.FOREX`)
  const news_sentiment_json = await news_sentiment.json()

  const technical_data_for_pair = {
        last_sma_50: last_sma50_json,
        last_sma_200: last_sma200_json,
        last_close: last_close_json
      }

  const weekly_price_data_for_pair = {
        weekly_price_data: weekly_price_data_json
  }

  const news_data_for_pair = {
        news_sentiment: news_sentiment_json
      }

  const pairData_local = getPairData(pair, jsonData, cot_for_pair, technical_data_for_pair, news_data_for_pair, weekly_price_data_for_pair)
  console.log(pairData_local)

  res.status(200).json(pairData_local)
}