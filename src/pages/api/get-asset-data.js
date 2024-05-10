import { assets } from '@/utils/event-names';
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

  // Helper function to read and parse XML files
  const readAndParseCotData = async (filePath) => {
    const xml = fs.readFileSync(filePath, 'utf-8');
    return parseCotData(xml);
  };

  try {
    const fileName = assets[asset].cotFileName;
    const cotPaths = [
      path.resolve(`public/assets/cot-data/2024/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2023/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2022/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2021/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2020/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2019/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2018/${fileName}.xml`),
      path.resolve(`public/assets/cot-data/2017/${fileName}.xml`),
    ];

    // Execute all the read and parse operations in parallel
    const cotDataPromises = cotPaths.map(readAndParseCotData);

    // Execute event data, weekly price data, and news sentiment data fetch operations in parallel
    const [cotAllData, eventsForCountriesData, weeklyPriceData, newsSentimentData] = await Promise.all([
      Promise.all(cotDataPromises),
      getEventData(countries),
      getWeeklyPriceData(assets[asset]),
      getNewsSentimentData(assets[asset].apiSymbol),
    ]);

    const cotAllJson = cotAllData.flat();
    const cotForAsset = findLatestCotDataForAsset(assets[asset].cotName, cotAllJson);

    const cotForAssetNoDup = cotForAsset.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.yyyy_report_week_ww[0] === item.yyyy_report_week_ww[0]
      ))
    );

    console.log('COT for asset:', cotForAssetNoDup);

    const assetData = processAssetData(asset, eventsForCountriesData, cotForAssetNoDup, newsSentimentData, weeklyPriceData);

    res.status(200).json(assetData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  }
};
