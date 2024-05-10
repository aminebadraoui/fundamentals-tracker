import { assets } from '@/utils/event-names';
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs/promises';
import { processAssetData } from '@/utils/pair-data';
import path from 'path';
import { getEventData } from './event-calendar';
import { getWeeklyPriceData } from './weekly-price';
import { getNewsSentimentData } from './news-sentiment';

const readAndParseCotData = async (filePath) => {
  const xml = await fs.readFile(filePath, 'utf-8');
  return parseCotData(xml);
};

const fetchDataWithRetry = async (fetchFunction, taskName, maxRetries = 3, retryDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      console.error(`Attempt ${attempt} for ${taskName} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error(`${taskName} failed after ${maxRetries} attempts.`);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

export default async (req, res) => {
  const asset = req.query.asset;
  const countries = assets[asset].countries;

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

    // Read and parse all COT files in parallel
    const cotDataPromises = cotPaths.map(filePath => fetchDataWithRetry(() => readAndParseCotData(filePath), `Reading and parsing COT data from ${filePath}`));
    const batchedCotData = await Promise.all(cotDataPromises);

    // Flatten the results from batchedCotData
    const cotAllJson = batchedCotData.flat();
    const cotForAsset = findLatestCotDataForAsset(assets[asset].cotName, cotAllJson);

    const cotForAssetNoDup = cotForAsset.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.yyyy_report_week_ww[0] === item.yyyy_report_week_ww[0]
      ))
    );

    // Fetch event data, weekly price data, and news sentiment in parallel
    const [eventsForCountriesData, weeklyPriceData, newsSentimentData] = await Promise.all([
      fetchDataWithRetry(() => getEventData(countries), 'Fetching event data'),
      fetchDataWithRetry(() => getWeeklyPriceData(assets[asset]), 'Fetching weekly price data'),
      fetchDataWithRetry(() => getNewsSentimentData(assets[asset].apiSymbol), 'Fetching news sentiment data'),
    ]);

    // Process the asset data once all the necessary data is fetched
    const assetData = processAssetData(asset, eventsForCountriesData, cotForAssetNoDup, newsSentimentData, weeklyPriceData);

    res.status(200).json(assetData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  }
};
