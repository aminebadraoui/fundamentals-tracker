
import { bonds } from "@/utils/event-names";
const fetchBondPrices = async (bond) => {
 
  const url = `https://eodhd.com/api/eod/${bond}?from=2021-01-01&api_token=${process.env.EOD_TOKEN}&fmt=json`; // Replace with the actual API endpoint
  const response = await fetch(url);
  const data = await response.json();
 
  return data;
};


export default async (req, res) => {
  const { country } = req.query;
  
  if (!country || !bonds[country]) {
    return res.status(400).json({ error: 'Invalid or missing country parameter' });
  }

  const { short, long } = bonds[country];

  try {
    const [shortBonds, longBonds] = await Promise.all([
       fetchBondPrices(short),
       fetchBondPrices(long)
    ]);

    const bondData = {
      [country]: {
        shortBonds,
        longBonds
      }
    };

    console.log(bondData)

    return res.status(200).json(bondData);
  } catch (error) {
    console.error('Error fetching bond prices:', error);
    return res.status(500).json({ error: 'Failed to fetch bond prices' });
  }
};


  



 



