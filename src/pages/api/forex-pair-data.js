import { majorForexPairs  } from '@/utils/event-names';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getPairData } from '@/utils/pair-data';
import path from 'path';

import { getEventData } from './event-calendar';

export default async (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const pair = req.query.pair;
  const countries = majorForexPairs[pair].countries;
  
  let jsonData, weekly_price_data_json, news_sentiment_json, cot_2024_currencies_json, cot_for_pair;

  try {
    const cot_2024_currencies_path = path.resolve('public/assets/cot-data/2024/currencies.xml');
    const cot_2024_currencies_xml = fs.readFileSync(cot_2024_currencies_path, 'utf-8');
    cot_2024_currencies_json = await parseCotData(cot_2024_currencies_xml);
    cot_for_pair = findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_2024_currencies_json);
  } catch (error) {
    console.error('Error parsing COT data:', error);
    return res.status(500).json({ error: 'Failed to parse COT data', details: error.message });
  }

  try {
    jsonData = await getEventData(countries);
    
  } catch (error) {
    console.error('Error fetching event data:', error);
    return res.status(500).json({ error: 'Failed to fetch event data', details: error.message });
  }

  try {
    const weekly_price_data = await fetch(`${baseUrl}/api/weekly-price?symbol=${pair}.FOREX`);
    weekly_price_data_json = await weekly_price_data.json();
  } catch (error) {
    console.error('Error fetching weekly price data:', error);
    return res.status(500).json({ error: 'Failed to fetch weekly price data', details: error.message });
  }

  try {
    const news_sentiment = await fetch(`${baseUrl}/api/news-sentiment?symbol=${pair}.FOREX`);
    news_sentiment_json = await news_sentiment.json();
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    return res.status(500).json({ error: 'Failed to fetch news sentiment', details: error.message });
  }

  try {
    const pairData = getPairData(pair, jsonData, cot_for_pair, {
      news_sentiment: news_sentiment_json,
      weekly_price_data: weekly_price_data_json
    });
    console.log(pairData);
    res.status(200).json(pairData);
  } catch (error) {
    console.error('Error preparing pair data:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  }
}

