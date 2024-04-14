const getInflationRateMonitorData = (inflationRateData) => {
  const data = {}

  Object.keys(inflationRateData).map((key) => { 
    if (data[key] === undefined) {
      data[key] = {}
    }

    // find the main yoy inflation rate
    const rateEvent = inflationRateData[key].events.find((event) => (event.type === "Inflation Rate" 
    || event.type === "Core Inflation Rate")
    && event.comparison === "yoy"
    )


    console.log("rateEvent", rateEvent)
    if (rateEvent) {
      data[key]["actual"] = rateEvent.actual
      data[key]["previous"] = rateEvent.previous

      if (rateEvent.actual > rateEvent.previous) {
        data[key]["score"] = +1
      } else if (rateEvent.actual < rateEvent.previous) {
        data[key]["score"] = -1
      } else {
        data[key]["score"] = 0
      }
    }
  })

  // sort data by actual
  const data_sorted_keys = Object.keys(data).sort((a, b) => data[b].actual - data[a].actual)
  
  const data_sorted = {}

  data_sorted_keys.map((key) => {
    data_sorted[key] = data[key]
  })

  console.log(data_sorted)


  return data_sorted
}

export { getInflationRateMonitorData }