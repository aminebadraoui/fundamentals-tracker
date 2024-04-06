const getChartData = (data) => {  
  const chartData = []

  Object.keys(data).map((country) => {
    chartData.push({
      country: country,
      totalScore: data[country].totalScore
    })
  })
  return chartData
}

export { getChartData }