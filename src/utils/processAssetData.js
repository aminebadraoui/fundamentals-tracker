
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, housingKeys, assets } from '@/utils/event-names';
import { get } from 'mongoose';
import { findLatestCotDataForAsset } from './cot-data';

// HELPERS 

const getInflationScore = (countriesEconomics) => {
  if (countriesEconomics.length > 1) {
    return countriesEconomics[0].inflationData.totalScore > countriesEconomics[1].inflationData.totalScore ? 100 
    : countriesEconomics[0].inflationData.totalScore < countriesEconomics[1].inflationData.totalScore ? -100 : 0
  } else if (countriesEconomics.length === 1) {
    return countriesEconomics[0].inflationData.totalScore > 0 ? 100 : countriesEconomics[0].inflationData.totalScore < 0 ? -100 : 0
  }
}

const getEmploymentScore = (countriesEconomics) => {
  if (countriesEconomics.length > 1) {
    return countriesEconomics[0].employmentData.totalScore > countriesEconomics[1].employmentData.totalScore ? 100 
    : countriesEconomics[0].employmentData.totalScore < countriesEconomics[1].employmentData.totalScore ? -100 : 0
  } else if (countriesEconomics.length === 1) {
    return countriesEconomics[0].employmentData.totalScore > 0 ? 100 : countriesEconomics[0].employmentData.totalScore < 0 ? -100 : 0
  }
}

const getHousingScore = (countriesEconomics) => {
  if (countriesEconomics.length > 1) {
    return countriesEconomics[0].housingData.totalScore > countriesEconomics[1].housingData.totalScore ? 100 
    : countriesEconomics[0].housingData.totalScore < countriesEconomics[1].housingData.totalScore ? -100 : 0
  } else if (countriesEconomics.length === 1) {
    return countriesEconomics[0].housingData.totalScore > 0 ? 100 : countriesEconomics[0].housingData.totalScore < 0 ? -100 : 0
  }
}


const getGrowthScore = (countriesEconomics) => {
  if (countriesEconomics.length > 1) {
    return countriesEconomics[0].growthData.totalScore > countriesEconomics[1].growthData.totalScore ? 100 
    : countriesEconomics[0].growthData.totalScore < countriesEconomics[1].growthData.totalScore ? -100 : 0
  } else if (countriesEconomics.length === 1) {
    return countriesEconomics[0].growthData.totalScore > 0 ? 100 : countriesEconomics[0].growthData.totalScore < 0 ? -100 : 0
  }
}

const getInterestRateScore = (countriesEconomics) => {
  if (countriesEconomics.length > 1) {
    return countriesEconomics[0].interestRateData.totalScore > countriesEconomics[1].interestRateData.totalScore ? 100 
    : countriesEconomics[0].interestRateData.totalScore < countriesEconomics[1].interestRateData.totalScore ? -100 : 0
  } else if (countriesEconomics.length === 1) {
    return countriesEconomics[0].interestRateData.totalScore > 0 ? 100 : countriesEconomics[0].interestRateData.totalScore < 0 ? -100 : 0
  }
}


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



const getCountryData = (country, rawData) => {
  const inflationData = getDataSortedByTotalScore(rawData, inflationKeys, null)[country]
  const employmentData = getDataSortedByTotalScore(rawData, employmentKeys, null)[country]
  const housingData = getDataSortedByTotalScore(rawData, housingKeys, null)[country]
  const interestRateData = getDataSortedByTotalScore(rawData, interestRatesKeys, null)[country]
  const growthData = {}

  return {
    country,
    inflationData,
    employmentData,
    housingData,
    growthData,
    interestRateData,
  }
}

const computeInstitutionalScore = (longs, shorts) => {
  const totalPositions = longs + shorts;
  if (totalPositions === 0) {
    return 0; // Handle division by zero case
  }
  const longPercentage = (longs / totalPositions) * 100;
  const shortPercentage = (shorts / totalPositions) * 100;

  // The score is long percentage minus short percentage, normalized to be between -100 and 100
  return longPercentage - shortPercentage;
};


// asset, eventsForCountriesData, cot_for_asset, news_sentiment_json, weekly_price_data_json)

const processAssetData = (symbol, rawData, cotData, news_sentiment_data, weekly_price_data) => {

  console.log("weekly_price_data ", weekly_price_data)
  const assetData = {
    
  }
  
  assetData.pair = symbol
  assetData.countries = assets[symbol].countries
  
  if (rawData) {
    const countriesEconomics = rawData && assets[symbol].countries.map((country) => {
      return getCountryData(country, rawData)
    })
  
    let inflationScore, employmentScore, housingScore, growthScore, interestRateScore, economicScore
  
    inflationScore = getInflationScore(countriesEconomics)
    employmentScore = getEmploymentScore(countriesEconomics)
    housingScore = getHousingScore(countriesEconomics)
    growthScore = getGrowthScore(countriesEconomics)
    interestRateScore = getInterestRateScore(countriesEconomics)
  
    economicScore = (inflationScore + employmentScore + housingScore + growthScore + interestRateScore) / 5
  
    assetData.economics = {
      countriesEvents: countriesEconomics,
  
      inflationScore,
      employmentScore,
      housingScore,
      growthScore,
      interestRateScore,
  
      score: economicScore
    }

  } else {
    assetData.economics = {
      countriesEvents: [],
  
      inflationScore: 0,
      employmentScore: 0,
      housingScore: 0,
      growthScore: 0,
      interestRateScore: 0,
  
      score: 0
    }
  }
 
  const cot_data_for_Asset = findLatestCotDataForAsset(assets[symbol].cotName, cotData)

  const institutionalLong = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[0].comm_positions_long_all[0]) 
  : parseInt(cot_data_for_Asset[0].noncomm_positions_long_all[0]);

const institutionalShort = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[0].comm_positions_short_all[0]) 
  : parseInt(cot_data_for_Asset[0].noncomm_positions_short_all[0]);

const institutionalLong_final = (assets[symbol].isFlipped === true) 
  ? institutionalShort 
  : institutionalLong;

const institutionalShort_final = (assets[symbol].isFlipped === true) 
  ? institutionalLong 
  : institutionalShort;

  const institutionalNet = institutionalLong_final - institutionalShort_final;

 const institutionalScore = computeInstitutionalScore(institutionalLong_final, institutionalShort_final);

const institutionalLongOld = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[1].comm_positions_long_old[0]) 
  : parseInt(cot_data_for_Asset[1].noncomm_positions_long_old[0]);

const institutionalShortOld = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[1].comm_positions_short_old[0]) 
  : parseInt(cot_data_for_Asset[1].noncomm_positions_short_old[0]);

const institutionalLongOld_final = (assets[symbol].isFlipped === true) 
  ? institutionalShortOld 
  : institutionalLongOld;

const institutionalShortOld_final = (assets[symbol].isFlipped === true) 
  ? institutionalLongOld 
  : institutionalShortOld;

 const institutionalNetOld = institutionalLongOld_final - institutionalShortOld_final;


  const retailLong = parseInt(cot_data_for_Asset[0].nonrept_positions_long_all[0])
  const retailShort = parseInt(cot_data_for_Asset[0].nonrept_positions_short_all[0])

  const retail_final_long = (assets[symbol].isFlipped === true ) ? retailShort : retailLong
  const retail_final_short = (assets[symbol].isFlipped === true ) ? retailLong : retailShort

  const retailNet = retail_final_long - retail_final_short

  const retailLongOld = parseInt(cot_data_for_Asset[1].nonrept_positions_long_old[0])
  const retailShortOld = parseInt(cot_data_for_Asset[1].nonrept_positions_short_old[0])

  const retail_final_long_old = (assets[symbol].isFlipped === true ) ? retailShortOld : retailLongOld
  const retail_final_short_old = (assets[symbol].isFlipped === true ) ? retailLongOld : retailShortOld

  const retailNetOld = retail_final_long_old - retail_final_short_old

  const isDivergent = institutionalNet > 0 && retailNet < 0 || institutionalNet < 0 && retailNet > 0
  const retailScore =  computeInstitutionalScore(retail_final_short, retail_final_long)


  assetData.cot = {
    cotData: cot_data_for_Asset,
    institutional: {
      long: institutionalLong_final,
      short: institutionalShort_final,
      net: institutionalNet,
      longOld: institutionalLongOld_final,
      shortOld: institutionalShortOld_final,
      netOld: institutionalNetOld,
      score: institutionalScore
    },
    retail: {
      long: retail_final_long,
      short: retail_final_short,
      net: retailNet,
      longOld: retail_final_long_old,
      shortOld: retail_final_short_old,
      netOld: retailNetOld,
      score: isDivergent ? retailScore : 0
    }
  }

  const weeklyPriceData = weekly_price_data ? weekly_price_data : []

  assetData.chartData = {
    weeklyPrice: weeklyPriceData,
    netPositions: mapCotDataToTimeValue(cot_data_for_Asset, assets[symbol].cotType, "institutional"),
    retailPositions: mapCotDataToTimeValue(cot_data_for_Asset, assets[symbol].cotType, "retail")
  }

  console.log("assetData.chartData ", assetData.chartData)

  assetData.news = {
    newsSet: [],
    score: 0
  }

  let scores = []

  scores.push(assetData.cot.institutional.score)

  if (isDivergent) {
    scores.push(assetData.cot.retail.score)
  }

  assetData.score = scores.reduce((acc, score) => acc + score, 0) / scores.length

  if (assetData.score >= 50) {
    assetData.bias = "Strong Buy"
  }
  else if (assetData.score >= 25) {
    assetData.bias = "Buy"
  }
  else if (assetData.score >= -25) {
    assetData.bias = "Neutral"
  }
  else if (assetData.score >= -50) {
    assetData.bias = "Sell"
  }
  else {
    assetData.bias = "Strong Sell"
  }

 return assetData
}

export { processAssetData }