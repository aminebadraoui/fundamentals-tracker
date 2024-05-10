import { getWeeklyPriceData } from './weekly-price';
import { assets } from '@/utils/event-names';

export default async (req, res) => {
    const asset = req.query.asset;
    try {
        const weeklyPriceData = await getWeeklyPriceData(assets[asset]);
        res.status(200).json(weeklyPriceData);
    } catch (error) {
        console.error('Error fetching weekly price data:', error);
        res.status(500).json({ error: 'Failed to fetch weekly price data', details: error.message });
    }
};