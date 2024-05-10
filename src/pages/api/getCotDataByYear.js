// pages/api/getCotDataByYear.js
import { parseCotData, findLatestCotDataForAsset } from '@/utils/cot-data';
import fs from 'fs/promises';
import path from 'path';

const readAndParseCotData = async (filePath) => {
    const xml = await fs.readFile(filePath, 'utf-8');
    return parseCotData(xml);
};

export default async (req, res) => {
    const { cotFileName, year } = req.query;
    console.log(`Fetching COT data for ${cotFileName} in year ${year}`);
    try {
        const filePath = path.resolve(`public/assets/cot-data/${year}/${cotFileName}.xml`);
        const cotData = await readAndParseCotData(filePath);
        res.status(200).json(cotData);
    } catch (error) {
        console.error(`Error fetching COT data for year ${year}:`, error);
        res.status(500).json({ error: `Failed to fetch COT data for year ${year}`, details: error.message });
    }
};