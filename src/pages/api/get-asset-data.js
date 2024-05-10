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
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

export default async (req, res) => {
  console.time("Total API Request Time");
  const asset = req.query.asset;
  const countries = assets[asset].countries;

  try {
    const fileName = assets[asset].cotFileName;
    const cotPaths = [
      path.resolve(`public/assets/cot-data/2024/${fileName}.xml`),
      // Other paths omitted for brevity
    ];

    const cotDataPromises = cotPaths.map(filePath => fetchDataWithRetry(() => readAndParseCotData(filePath), `Reading and parsing COT data from ${filePath}`));
    const cotAllJson = await Promise.all(cotDataPromises).then(results => results.flat());

    const cotForAsset = findLatestCotDataForAsset(assets[asset].cotName, cotAllJson);
    const cotForAssetNoDup = cotForAsset.filter((item, index, self) => index === self.findIndex((t) => t.yyyy_report_week_ww[0] === item.yyyy_report_week_ww[0]));

    const [eventsForCountriesData, weeklyPriceData, newsSentimentData] = await Promise.all([
      fetchDataWithRetry(() => getEventData(countries), 'Fetching event data'),
      fetchDataWithRetry(() => getWeeklyPriceData(assets[asset]), 'Fetching weekly price data'),
      fetchDataWithRetry(() => getNewsSentimentData(assets[asset].apiSymbol), 'Fetching news sentiment data'),
    ]);

    const assetData = processAssetData(asset, eventsForCountriesData, cotForAssetNoDup, newsSentimentData, weeklyPriceData);

    res.status(200).json(assetData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to prepare pair data', details: error.message });
  } finally {
    console.timeEnd("Total API Request Time");
  }
};
