
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys, majorForexPairs, housingKeys } from '@/utils/event-names';

const getCountryData = (country, rawData) => {
  const inflationData = getDataSortedByTotalScore(rawData, inflationKeys, null)[country]
  const employmentData = getDataSortedByTotalScore(rawData, employmentKeys, null)[country]
  const housingData = getDataSortedByTotalScore(rawData, housingKeys, null)[country]
  const interestRateData = getDataSortedByTotalScore(rawData, interestRatesKeys, null)[country]
  const growthData = getDataSortedByTotalScore(rawData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys))[country]

  return {
    inflationData,
    employmentData,
    housingData,
    growthData,
    interestRateData,
  }
}

const getPairData = (pair, rawData) => {
  const pairData = {
    "pair": "EURUSD",

    "country_1": {
      "name": "EU",
      "inflationScore": 0,
      "employmentScore": 0,
      "housingScore": 0,
      "growthScore": 0,
      "interestRateScore": 0,
    },

    "country_2": {
      "name": "US",
      "inflationScore": 0,
      "employmentScore": 0,
      "housingScore": 0,
      "growthScore": 0,
      "interestRateScore": 0,
    },

    "inflationScore": 0,
    "employmentScore": 0,
    "housingScore": 0,
    "growthScore": 0,
    "interestRateScore": 0,

    "totalEconomicScore": 0,

    "institutional": {
      "long": 0,
      "short": 0,
      "long_old": 0,
      "short_old": 0,
      "net_positions": 0,
      "net_positions_old": 0,
      "score": 0
    },

    "retail": {
      "long": 0,
      "shot": 0,
      "long_old": 0,
      "short_old": 0,
      "net_positions": 0,
      "net_positions_old": 0,
      "score": 0
    },

    "openInterest": {
      "openIntrest": 0,
      "openIntrest_old": 0,
      "score": 0
    },
   
    "technicals": {
      "score": 0
    },

    "totalScore": 0,

    "bias": "neutral"
  }

  console.log("pair", majorForexPairs[pair].countries)

  const country1_data = getCountryData(majorForexPairs[pair].countries[0], rawData)
  const country2_data = getCountryData(majorForexPairs[pair].countries[1], rawData)

  pairData.pair = pair

  pairData.country_1.name = majorForexPairs[pair].countries[0]
  pairData.country_1.inflationScore = country1_data.inflationData.totalScore
  pairData.country_1.employmentScore = country1_data.employmentData.totalScore
  pairData.country_1.housingScore = country1_data.housingData.totalScore
  pairData.country_1.growthScore = country1_data.growthData.totalScore
  pairData.country_1.interestRateScore = country1_data.interestRateData.totalScore

  pairData.country_2.name = majorForexPairs[pair].countries[1]
  pairData.country_2.inflationScore = country2_data.inflationData.totalScore
  pairData.country_2.employmentScore = country2_data.employmentData.totalScore
  pairData.country_2.housingScore = country2_data.housingData.totalScore
  pairData.country_2.growthScore = country2_data.growthData.totalScore
  pairData.country_2.interestRateScore = country2_data.interestRateData.totalScore

  pairData.inflationScore = pairData.country_1.inflationScore > pairData.country_2.inflationScore ? 100 : pairData.country_1.inflationScore < pairData.country_2.inflationScore ? -100 : 0
  pairData.employmentScore = pairData.country_1.employmentScore > pairData.country_2.employmentScore ? 100 : pairData.country_1.employmentScore < pairData.country_2.employmentScore ? -100 : 0
  pairData.housingScore = pairData.country_1.housingScore > pairData.country_2.housingScore ? 100 : pairData.country_1.housingScore < pairData.country_2.housingScore ? -100 : 0
  pairData.growthScore = pairData.country_1.growthScore > pairData.country_2.growthScore ? 100 : pairData.country_1.growthScore < pairData.country_2.growthScore ? -100 : 0
  pairData.interestRateScore = pairData.country_1.interestRateScore > pairData.country_2.interestRateScore ? 100 : pairData.country_1.interestRateScore < pairData.country_2.interestRateScore ? -100 : 0

  pairData.totalEconomicScore = (pairData.inflationScore + pairData.employmentScore + pairData.housingScore + pairData.growthScore + pairData.interestRateScore) / 5

  pairData.totalScore = pairData.totalEconomicScore + pairData.institutional.score + pairData.retail.score  + pairData.technicals.score / 4

 return pairData
}

export { getPairData }