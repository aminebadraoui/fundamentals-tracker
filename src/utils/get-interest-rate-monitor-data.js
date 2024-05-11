const getInterestRateMonitorData = (interestRateData) => {
  const data = {}

  Object.keys(interestRateData).map((key) => { 
    

    if (data[key] === undefined) {
      data[key] = {}
    }

    if(interestRateData[key]["events"][0]) {
      data[key]["actual"] = interestRateData[key]["events"][0]["actual"]
      data[key]["previous"] = interestRateData[key]["events"][0]["previous"]

      if (interestRateData[key]["events"][0]["actual"] > interestRateData[key]["events"][0]["previous"]) {
        data[key]["score"] = +1
      } else if (interestRateData[key]["events"][0]["actual"] < interestRateData[key]["events"][0]["previous"]) {
        data[key]["score"] = -1
      } else {
        data[key]["score"] = 0
      }
    }
    
  })

  // sort data by actual
  const data_sorted_keys = Object.keys(data).sort((a, b) => (data[b].actual-data[b].previous) - (data[a].actual - data[a].previous)) 
  const data_sorted = {}

  data_sorted_keys.map((key) => {
    data_sorted[key] = data[key]
})


  return data_sorted
}

export {getInterestRateMonitorData}