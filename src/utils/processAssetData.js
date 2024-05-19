
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, housingKeys, assets } from '@/utils/event-names';
import { get } from 'mongoose';
import { findLatestCotDataForAsset } from './cot-data';

import { calculateCotDataScores } from './scoring/calculateCotDataScores';

import { getPriceChartData } from './chartData/priceChartData';

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



// asset, eventsForCountriesData, cot_for_asset, news_sentiment_json, weekly_price_data_json)

const processAssetData = (symbol, rawData, cotData, news_sentiment_data, weekly_price_data) => {
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

  
  const finalCOTScores = calculateCotDataScores(cotData, symbol)
  
 
  

  assetData.cot =  finalCOTScores

  const weeklyPriceData = weekly_price_data ? weekly_price_data : []

  const chartData = getPriceChartData(weeklyPriceData, cotData, symbol)

  assetData.chartData = chartData

  console.log("assetData.chartData ", assetData.chartData)

  assetData.news = {
    newsSet: [],
    score: 0
  }

  

  assetData.score = finalCOTScores.totalScore
  
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