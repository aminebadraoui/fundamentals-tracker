const getEconomicOverviewData = (inflationData, employmentData, growthData) => {
  const data = {}

      Object.keys(inflationData).map((key) => { 
        if (data[key] === undefined) {
          data[key] = {}
        }
        data[key]["inflationScore"] = inflationData[key].totalScore
      })

      Object.keys(employmentData).map((key) => { 
        if (data[key] === undefined) {
          data[key] = {}
        }
        data[key]["employmentScore"] = employmentData[key].totalScore
      })

      Object.keys(growthData).map((key) => { 
        if (data[key] === undefined) {
          data[key] = {}
        }
        data[key]["growthScore"] = growthData[key].totalScore
      })

      Object.keys(data).map((key) => { 
        data[key]["economicScore"] =  (data[key].employmentScore + data[key].growthScore ) / 2
      })

      Object.keys(data).map((key) => { 
        data[key]["totalScore"] =  (data[key].inflationScore + data[key].economicScore) / 2
      })

      // sort totalScoresData by totalScore
      const data_sorted_keys = Object.keys(data).sort((a, b) => data[b].totalScore - data[a].totalScore)
      const data_sorted = {}

      data_sorted_keys.map((key) => {
        data_sorted[key] = data[key]
      })

      return data_sorted
}

export {getEconomicOverviewData}