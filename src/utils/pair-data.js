
import { getDataSortedByTotalScore } from '@/utils/getDataSortedByTotalScore';
import { inflationKeys, employmentKeys, interestRatesKeys, majorEventsKeys, majorForexPairs, housingKeys, assets } from '@/utils/event-names';
import { get } from 'mongoose';

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


const mapCotDataToTimeValue = (cotData, cotType) => {
  const dataWithParsedDates = cotData.map(item => {
    const date = new Date(item.report_date_as_yyyy_mm_dd[0]);
    const formattedDate = date.toISOString().split('T')[0]; // Format the date as 'yyyy-mm-dd'

    const long = cotType === 'comm' ? parseInt(item.comm_positions_long_all[0]) : parseInt(item.noncomm_positions_long_all[0]);
    const short = cotType === 'comm' ? parseInt(item.comm_positions_short_all[0]) : parseInt(item.noncomm_positions_short_all[0]);




    const netPositions = long - short;

    return {
      time: formattedDate,
      value: netPositions,
      timestamp: date.getTime() // Add a timestamp for sorting
    };
  });

  const dataWithParsedDatesWithoutDuplicates = dataWithParsedDates.filter((item, index, self) => {
    return index === self.findIndex((t) => (
      t.time === item.time
    ));
  }
  );


  // Sort by timestamp to ensure the data is in ascending order
  dataWithParsedDatesWithoutDuplicates.sort((a, b) => a.timestamp - b.timestamp);

  // Return data formatted for the chart, removing the extra 'timestamp' property
  return dataWithParsedDatesWithoutDuplicates.map(({ time, value }) => ({ time, value }));
};

const getCountryData = (country, rawData) => {
  const inflationData = getDataSortedByTotalScore(rawData, inflationKeys, null)[country]
  const employmentData = getDataSortedByTotalScore(rawData, employmentKeys, null)[country]
  const housingData = getDataSortedByTotalScore(rawData, housingKeys, null)[country]
  const interestRateData = getDataSortedByTotalScore(rawData, interestRatesKeys, null)[country]
  const growthData = getDataSortedByTotalScore(rawData, null, inflationKeys.concat(employmentKeys).concat(interestRatesKeys))[country]

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
  
  // const assetData = {
  //   "symbol": "EURUSD",
  //   "score": 0,
  //   "countries": ["EU", "US"],
  //   "bias": "neutral",
  //   "chartData": {
  //     "weeklyPrice": [],
  //     "netPositions": []
  //   },
  //   "economics": {
  //     "score": 0,
  //     "inflation": {
  //       "data": [],
  //       "score": 0
  //     },
  //     "inflation": {
  //       "data": [],
  //       "score": 0
  //     },
  //     "employment": {
  //       "data": [],
  //       "score": 0
  //     },
  //     "housing": {
  //       "data": [],
  //       "score": 0
  //     },
  //     "growth": {
  //       "data": [],
  //       "score": 0
  //     },
  //   },
  //   "cot": {
  //     "cotData": [],
  //     "institutional": {
  //       "long": 0,
  //       "short": 0,
  //       "net": 0,
  //       "score": 0
  //     },
  //     "retail": {
  //       "long": 0,
  //       "short": 0,
  //       "net": 0,
  //       "score": 0
  //     }
  //   },
  //   "news": {},
  // }


  assetData.pair = symbol
  assetData.countries = assets[symbol].countries
  
  const countriesEconomics = assets[symbol].countries.map((country) => {
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

  const institutionalLong = assets[symbol].cotType === 'comm' ? parseInt(cotData[0].comm_positions_long_all[0]) : parseInt(cotData[0].noncomm_positions_long_all[0])
  const institutionalShort = assets[symbol].cotType === 'comm' ? parseInt(cotData[0].comm_positions_short_all[0]) : parseInt(cotData[0].noncomm_positions_short_all[0])
  const institutionalNet = institutionalLong - institutionalShort

  const institutionalLongOld = assets[symbol].cotType === 'comm' ? parseInt(cotData[1].comm_positions_long_old[0]) : parseInt(cotData[1].noncomm_positions_long_old[0])
  const institutionalShortOld = assets[symbol].cotType === 'comm' ? parseInt(cotData[1].comm_positions_short_old[0]) : parseInt(cotData[1].noncomm_positions_short_old[0])
  const institutionalNetOld = institutionalLongOld - institutionalShortOld

  const institutionalNetScore = (institutionalNet > 0 ? 100 : institutionalNet < 0 ? -100 : 0)
  const institutionalLongScore = (institutionalLong > institutionalLongOld ? 100 : institutionalLong < institutionalLongOld ? -100 : 0)
  const institutionalShortScore = (institutionalShort > institutionalShortOld ? -100 : institutionalShort < institutionalShortOld ? 100 : 0)

  const institutionalScore = (institutionalNetScore + institutionalLongScore + institutionalShortScore) / 3

  const retailLong = parseInt(cotData[0].nonrept_positions_long_all[0])
  const retailShort = parseInt(cotData[0].nonrept_positions_short_all[0])
  const retailNet = retailLong - retailShort

  const retailLongOld = parseInt(cotData[1].nonrept_positions_long_old[0])
  const retailShortOld = parseInt(cotData[1].nonrept_positions_short_old[0])
  const retailNetOld = retailLongOld - retailShortOld

  const retailNetScore = (retailNet > 0 ? -100 : retailNet < 0 ? 100 : 0)
  const retailLongScore = (retailLong > retailLongOld ? -100 : retailLong < retailLongOld ? 100 : 0)
  const retailShortScore = (retailShort > retailShortOld ? 100 : retailShort < retailShortOld ? -100 : 0)

  const retailScore = (retailNetScore + retailLongScore + retailShortScore) / 3

  



  assetData.cot = {
    cotData: cotData,
    institutional: {
      long: institutionalLong,
      short: institutionalShort,
      net: institutionalNet,
      longOld: institutionalLongOld,
      shortOld: institutionalShortOld,
      netOld: institutionalNetOld,

      netScore: institutionalNetScore,
      longScore: institutionalLongScore,
      shortScore: institutionalShortScore,
      score: institutionalScore

     
    },
    retail: {
      long: retailLong,
      short: retailShort,
      net: retailNet,
      longOld: retailLongOld,
      shortOld: retailShortOld,
      netOld: retailNetOld,

      netScore: retailNetScore,
      longScore: retailLongScore,
      shortScore: retailShortScore,
      score: retailScore

    }
  }

  assetData.chartData = {
    weeklyPrice: weekly_price_data,
    netPositions: mapCotDataToTimeValue(cotData, assets[symbol].cotType)
  }

  assetData.news = {
    newsSet: [],
    score: 0
  }

  if (news_sentiment_data[`${assets[symbol].apiSymbol}`]) {
    news_sentiment_data[`${assets[symbol].apiSymbol}`].slice(0, 7).map((news) => {
      assetData.news.newsSet.push({ date: news.date, count: news.count, score: (news.normalized * 100) })
    })

    assetData.news.avgScore = assetData.news.newsSet.reduce((acc, news) => acc + news.score, 0) / assetData.news.newsSet.length
    assetData.news.score = assetData.news.avgScore > 0 ? 100 : assetData.news.avgScore < 0 ? -100 : 0
  }

  assetData.score = (economicScore + assetData.cot.institutional.score + assetData.news.score) / 3

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


  console.log(assetData)




  // assetData.country_1.name = assets[symbol].countries[0]
  // assetData.country_1.inflationScore = country1_data.inflationData.totalScore
  // assetData.country_1.employmentScore = country1_data.employmentData.totalScore
  // assetData.country_1.housingScore = country1_data.housingData.totalScore
  // assetData.country_1.growthScore = country1_data.growthData.totalScore
  // assetData.country_1.interestRateScore = country1_data.interestRateData.totalScore

  // assetData.country_2.name = assets[symbol].countries[1]
  // assetData.country_2.inflationScore = country2_data.inflationData.totalScore
  // assetData.country_2.employmentScore = country2_data.employmentData.totalScore
  // assetData.country_2.housingScore = country2_data.housingData.totalScore
  // assetData.country_2.growthScore = country2_data.growthData.totalScore
  // assetData.country_2.interestRateScore = country2_data.interestRateData.totalScore

  // assetData.inflationScore = assetData.country_1.inflationScore > assetData.country_2.inflationScore ? 100 : assetData.country_1.inflationScore < assetData.country_2.inflationScore ? -100 : 0
  // assetData.employmentScore = assetData.country_1.employmentScore > assetData.country_2.employmentScore ? 100 : assetData.country_1.employmentScore < assetData.country_2.employmentScore ? -100 : 0
  // assetData.housingScore = assetData.country_1.housingScore > assetData.country_2.housingScore ? 100 : assetData.country_1.housingScore < assetData.country_2.housingScore ? -100 : 0
  // assetData.growthScore = assetData.country_1.growthScore > assetData.country_2.growthScore ? 100 : assetData.country_1.growthScore < assetData.country_2.growthScore ? -100 : 0
  // assetData.interestRateScore = assetData.country_1.interestRateScore > assetData.country_2.interestRateScore ? 100 : assetData.country_1.interestRateScore < assetData.country_2.interestRateScore ? -100 : 0

  // assetData.totalEconomicScore = (assetData.inflationScore + assetData.employmentScore + assetData.housingScore + assetData.growthScore + assetData.interestRateScore) / 5

//   assetData.cotData = cotData

//   assetData.cotPositions = mapCotDataToTimeValue(cotData)

//   assetData.institutional.long = parseInt(cotData[0].comm_positions_long_all[0])
//   assetData.institutional.short = parseInt(cotData[0].comm_positions_short_all[0])
//   assetData.institutional.long_old = parseInt(cotData[1].comm_positions_long_old[0])
//   assetData.institutional.short_old = parseInt(cotData[1].comm_positions_short_old[0])
//   assetData.institutional.net_positions = parseInt(cotData[0].comm_positions_long_all) - parseInt(cotData[0].comm_positions_short_all)
//   assetData.institutional.net_positions_old = parseInt(cotData[1].comm_positions_long_old) - parseInt(cotData[1].comm_positions_short_old)
//   let institutionalScore = 0
//   if (assetData.institutional.net_positions > 0) {
//     institutionalScore += 100
//   } else if (assetData.institutional.net_positions < 0) {
//     institutionalScore -= 100
//   } else {
//     institutionalScore += 0
//   }

//   if ( assetData.institutional.net_positions > assetData.institutional.net_positions_old) {
//     institutionalScore += 100
//   } else if ( assetData.institutional.net_positions < assetData.institutional.net_positions_old) {
//     institutionalScore -= 100
//   } else {
//     institutionalScore += 0
//   }

//   assetData.institutional.score = institutionalScore / 2

//   assetData.retail.long = parseInt(cotData[0].nonrept_positions_long_all[0])
//   assetData.retail.short = parseInt(cotData[0].nonrept_positions_short_all[0])

//   assetData.retail.long_old = parseInt(cotData[1].nonrept_positions_long_old[0])
//   assetData.retail.short_old = parseInt(cotData[1].nonrept_positions_short_old[0])

//   assetData.retail.net_positions = parseInt(cotData[0].nonrept_positions_long_all[0]) - parseInt(cotData[0].nonrept_positions_short_all[0])
//   assetData.retail.net_positions_old = parseInt(cotData[1].nonrept_positions_long_all[0]) - parseInt(cotData[1].nonrept_positions_short_all[0])

//   let retailScore = 0
//   // Contrarian Signal

//   if (assetData.retail.net_positions > 0) {
//     retailScore -= 100
//   } else if (assetData.retail.net_positions < 0) {
//     retailScore += 100
//   } else {
//     retailScore += 0
//   }

//   if ( assetData.retail.net_positions > assetData.retail.net_positions_old) {
//     retailScore -= 100
//   } else if ( assetData.retail.net_positions < assetData.retail.net_positions_old) {
//     retailScore += 100
//   } else {
//     retailScore += 0
//   }

//   assetData.retail.score = retailScore / 2

//   // News
//   assetData.news.news_set = []

//   console.log("news_sentiment_data", news_sentiment_data)

//   if (news_sentiment_data[`${symbol}.FOREX`]) {
//     news_sentiment_data[`${symbol}.FOREX`].slice(0,7).map((news) => {
//       assetData.news.news_set.push({date: news.date, count: news.count, score: (news.normalized * 100)})
//     })
  
//     assetData.news.avg_score = assetData.news.news_set.reduce((acc, news) => acc + news.score, 0) / assetData.news.news_set.length 
//     assetData.news.total_news_score = assetData.news.avg_score > 0 ? 100 : assetData.news.avg_score < 0 ? -100 : 0

//   } else {
//     assetData.news.news_set = []
//     assetData.news.avg_score = 0
//     assetData.news.total_news_score = 0
//   }

//   assetData.weekly_price_data = weekly_price_data
  
//   assetData.totalScore = (assetData.totalEconomicScore + assetData.institutional.score + assetData.retail.score  + assetData.news.total_news_score) / 4

  
//  // if total score is between -100 and -50 bias is very bearish, if between -50 and -25 bias is bearish, if between 0 and 25 bias is neutral, if between 25 and 50 bias is bullish, if between 50 and 100 bias is very bullish
//   if (assetData.totalScore >= 50) {
//     assetData.bias = "Strong Buy"
//   } else if (assetData.totalScore >= 25) {
//     assetData.bias = "Buy"
//   } else if (assetData.totalScore >= -25) {
//     assetData.bias = "Neutral"
//   } else if (assetData.totalScore >= -50) {
//     assetData.bias = "Sell"
//   } else {
//     assetData.bias = "Strong Sell"
//   }

 return assetData
}

export { processAssetData }