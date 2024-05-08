import { majorForexPairs  } from '@/utils/event-names';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { getPairData } from '@/utils/pair-data';
import path from 'path';

import { getEventData } from './event-calendar';
import { getWeeklyPriceData } from './weekly-price';
import { getNewsSentimentData } from './news-sentiment';

export default async (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const pair = req.query.pair;
  const countries = majorForexPairs[pair].countries;
  
  let jsonData, weekly_price_data_json, news_sentiment_json, cot_all_json, cot_for_pair;

  try {
    const cot_2024_path = path.resolve('public/assets/cot-data/2024/currencies.xml');
    const cot_2023_path = path.resolve('public/assets/cot-data/2023/currencies.xml');
    const cot_2022_path = path.resolve('public/assets/cot-data/2022/currencies.xml');
    const cot_2021_path = path.resolve('public/assets/cot-data/2021/currencies.xml');

    const cot_2024_xml = fs.readFileSync(cot_2024_path, 'utf-8');
    const cot_2023_xml = fs.readFileSync(cot_2023_path, 'utf-8');
    const cot_2022_xml = fs.readFileSync(cot_2022_path, 'utf-8');
    const cot_2021_xml = fs.readFileSync(cot_2021_path, 'utf-8');

    const cot_2024_json = await parseCotData(cot_2024_xml);
    const cot_2023_json = await parseCotData(cot_2023_xml);
    const cot_2022_json = await parseCotData(cot_2022_xml);
    const cot_2021_json = await parseCotData(cot_2021_xml);

    cot_all_json = cot_2024_json.concat(cot_2023_json).concat(cot_2022_json).concat(cot_2021_json);

    cot_for_pair = findLatestCotDataForAsset(majorForexPairs[pair].cotName, cot_all_json);

    console.log('COT for pair:', cot_for_pair);
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
    weekly_price_data_json = await getWeeklyPriceData(majorForexPairs[pair].apiSymbol)
  } catch (error) {
    console.error('Error fetching weekly price data:', error);
    return res.status(500).json({ error: 'Failed to fetch weekly price data', details: error.message });
  }

  try {
    news_sentiment_json = await getNewsSentimentData(majorForexPairs[pair].apiSymbol)
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    return res.status(500).json({ error: 'Failed to fetch news sentiment', details: error.message });
  }

  try {
    const pairData = getPairData(pair, jsonData, cot_for_pair, news_sentiment_json, weekly_price_data_json);
    console.log(pairData);
    res.status(200).json(pairData);
  } catch (error) {
    console.error('Error preparing pair data:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  }
}

