import { getEventData } from './event-calendar';

export default async (req, res) => {
    const countries = req.query.countries ? req.query.countries.split(',') : [];
    try {
        const fromDate = new Date(2021, 2, 1);
        const toDate = new Date(2021, 2, 31);

        const eventData = await getEventData(countries, 1000, fromDate, toDate);
        // console.log("eventData", eventData)
        res.status(200).json(eventData);
    } catch (error) {
        console.error('Error fetching event data:', error);
        res.status(500).json({ error: 'Failed to fetch event data', details: error.message });
    }
};