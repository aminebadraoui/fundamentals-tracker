import { assets } from '../event-names'
import { findLatestCotDataForAsset } from '../cot-data'

const getPriceChartData = (priceData, cotData, asset) => {
  const cot_data_for_Asset = findLatestCotDataForAsset(assets[asset].cotName, cotData)

  const chartData = {
    priceData: priceData,
    netPositions: mapCotDataToTimeValue(cot_data_for_Asset, assets[asset].cotType, "institutional"),
    retailPositions: mapCotDataToTimeValue(cot_data_for_Asset, assets[asset].cotType, "retail")
  }

  return chartData
}


// HELPER
const mapCotDataToTimeValue = (cotData, cotType, netType) => {

  // Map to calculate net positions for each date
  const dataWithParsedDates = cotData.map(item => {
    let long, short;
    const date = new Date(item.report_date_as_yyyy_mm_dd[0]);
    const formattedDate = date.toISOString().split('T')[0]; // Format the date as 'yyyy-mm-dd'

    if (netType === "institutional") {
      long = cotType === 'comm' ? parseInt(item.comm_positions_long_all[0]) : parseInt(item.noncomm_positions_long_all[0]);
      short = cotType === 'comm' ? parseInt(item.comm_positions_short_all[0]) : parseInt(item.noncomm_positions_short_all[0]);
    } else {
      long = parseInt(item.nonrept_positions_long_all[0]);
      short = parseInt(item.nonrept_positions_short_all[0]);
    }

    const netPositions = long - short;

    return {
      time: formattedDate,
      value: netPositions,
      timestamp: date.getTime() // Add a timestamp for sorting
    };
  });

  // Removing duplicates if any based on time
  const uniqueData = dataWithParsedDates.filter((item, index, self) =>
    index === self.findIndex((t) => t.time === item.time)
  );

  // Sort by timestamp to ensure the data is in ascending order
  uniqueData.sort((a, b) => a.timestamp - b.timestamp);


  // Return the normalized data
  return uniqueData;
};


export { getPriceChartData }