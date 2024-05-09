import { assets  } from '@/utils/event-names';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs';
import { processAssetData } from '@/utils/pair-data';
import path from 'path';

import { getEventData } from './event-calendar';
import { getWeeklyPriceData } from './weekly-price';
import { getNewsSentimentData } from './news-sentiment';

export default async (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const asset = req.query.asset;
  const countries = assets[asset].countries;
  
  let cot_for_asset_no_dup, weekly_price_data_json, eventsForCountriesData, news_sentiment_json ;

  // COT DATA
  try {
    let fileName = assets[asset].cotFileName
    
    const cot_2024_path = path.resolve(`public/assets/cot-data/2024/${fileName}.xml`);
    const cot_2023_path = path.resolve(`public/assets/cot-data/2023/${fileName}.xml`);
    const cot_2022_path = path.resolve(`public/assets/cot-data/2022/${fileName}.xml`);
    const cot_2021_path = path.resolve(`public/assets/cot-data/2021/${fileName}.xml`);
    const cot_2020_path = path.resolve(`public/assets/cot-data/2020/${fileName}.xml`);

    const cot_2024_xml = fs.readFileSync(cot_2024_path, 'utf-8');
    const cot_2023_xml = fs.readFileSync(cot_2023_path, 'utf-8');
    const cot_2022_xml = fs.readFileSync(cot_2022_path, 'utf-8');
    const cot_2021_xml = fs.readFileSync(cot_2021_path, 'utf-8');
    const cot_2020_xml = fs.readFileSync(cot_2020_path, 'utf-8');

    const cot_2024_json = await parseCotData(cot_2024_xml);
    const cot_2023_json = await parseCotData(cot_2023_xml);
    const cot_2022_json = await parseCotData(cot_2022_xml);
    const cot_2021_json = await parseCotData(cot_2021_xml);
    const cot_2020_json = await parseCotData(cot_2020_xml);

    const cot_all_json = cot_2024_json.concat(cot_2023_json).concat(cot_2022_json).concat(cot_2021_json).concat(cot_2020_json);
    

    const cot_for_asset = findLatestCotDataForAsset(assets[asset].cotName, cot_all_json);

    cot_for_asset_no_dup = cot_for_asset.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.yyyy_report_week_ww[0] === item.yyyy_report_week_ww[0]
      ))
    )


    console.log('COT for asset:', cot_for_asset_no_dup);
  } catch (error) {
    console.error('Error parsing COT data:', error);
    //return res.status(500).json({ error: 'Failed to parse COT data', details: error.message });
  }

  // EVENTS DATA
  try {
    eventsForCountriesData = await getEventData(countries);
    
  } catch (error) {
    console.error('Error fetching event data:', error);
    //return res.status(500).json({ error: 'Failed to fetch event data', details: error.message });
  }

  // WEEKLY PRICE DATA

  try {
    weekly_price_data_json = await getWeeklyPriceData(assets[asset])
  } catch (error) {
    console.error('Error fetching weekly price data:', error);
    //return res.status(500).json({ error: 'Failed to fetch weekly price data', details: error.message });
  }

  // NEWS SENTIMENT DATA

  try {
    news_sentiment_json = await getNewsSentimentData(assets[asset].apiSymbol)
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    //return res.status(500).json({ error: 'Failed to fetch news sentiment', details: error.message });
  }

  try {
    const assetData = processAssetData(asset, eventsForCountriesData, cot_for_asset_no_dup, news_sentiment_json, weekly_price_data_json);
  
    res.status(200).json(assetData);
  } catch (error) {
    console.error('Error preparing pair data:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  }
}

