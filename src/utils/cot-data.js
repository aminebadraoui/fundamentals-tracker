
import { parseString } from "xml2js";  

// Parse cot data from xml to javascript object
const parseCotData = async (cotData) => {
  return new Promise((resolve, reject) => {
    parseString(cotData, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const sanitizedResult = results.response.row[0].row.filter((row, index) => index !== 0 && index !== 1);
        
        resolve(sanitizedResult);
      }
    });
  });
}

// filter the latest cot data
function findLatestReports(dataArray) {
  // Find the maximum date

  const latestDate = dataArray.reduce((maxDate, item) => {
    const currentDate = new Date(item.report_date_as_yyyy_mm_dd[0]);
    return currentDate > maxDate ? currentDate : maxDate;
  }, new Date(0)); // Initialize with the earliest possible date

  // Filter data to find all entries with the latest date
  return dataArray.filter(item => {
    const itemDate = new Date(item.report_date_as_yyyy_mm_dd[0]);
    return itemDate.getTime() === latestDate.getTime();
  });
}

// get the latest cot data for a specific asset
const findLatestCotDataForAsset = (cotName, cotData) => {
  const latestReports = findLatestReports(cotData);

  return latestReports.filter(report => report.contract_market_name[0] == cotName);

  

}

export { parseCotData, findLatestCotDataForAsset}

