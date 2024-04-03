import { uploadFile } from "@/utils/aws/upload"
import { getForexFactoryFormattedDate } from "@/utils/forex-factory-date-formatter"

const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'

export default async (req, res) => { 
  const historicalData = {}
  const fileName = 'events.json'
  const bucketName = 'forex-calendar-events'

  // 2 scrape new data => json
  const lookback = 0
  const date = getForexFactoryFormattedDate(lookback);
  const request = `${baseUrl}/api/forex-calendar/scrape?date=${date}`
  try {
    const response = await fetch(request);
    const data = await response.json();
    historicalData[date] = data
    const file = JSON.stringify(historicalData, null, 2)
    uploadFile(bucketName, fileName, file)

  } catch (error) {
    console.error(error)
  }
 



 

// // 1 fetch historical data from cdn if empty call scrape historical and skip 2 and 3
// const historicalData = await fetch('https://storage.googleapis.com/forex-factory-db/events.json')
//   .then(response => response.json())
//   .then(data => {
//     return data
//   })
//   .catch(error => {
//     console.error(error)
//   })

//   if (historicalData.length === 0) {
//     // scrape historical
//     const lookback = 13

//     for (let i = 0; i <= lookback; i++) {
//       const date = getForexFactoryFormattedDate(i);
//       const request = `/api/forex-calendar/scrape?date=${date}`
//       const response = await performFetch(date);

//       if (!historicalData[date]) {
//         historicalData[date] = response;
//       }
//     }

//   } else {
//     console.log('historical data already exists')


//   }

//    // 4 => save new historical data to cdn
//     const response = await fetch('https://storage.googleapis.com/forex-factory-db/events.json', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({data: historicalData}),
//     });

//   res.status(200).json({ historicalData });
}

// 1 fetch historical data from cdn if empty call scrape historical and skip 2 and 3
// 2 scrape new data => json
// 3 => update historical data with new json
// 4 => save new historical data to cdn