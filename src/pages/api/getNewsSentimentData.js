import { getNewsSentimentData } from './news-sentiment';

export default async (req, res) => {
    const assetSymbol = req.query.symbol;
    try {
        const newsSentimentData = await getNewsSentimentData(assetSymbol);
        res.status(200).json(newsSentimentData);
    } catch (error) {
        console.error('Error fetching news sentiment data:', error);
        res.status(500).json({ error: 'Failed to fetch news sentiment data', details: error.message });
    }
};