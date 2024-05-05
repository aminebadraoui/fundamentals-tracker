const getChartData = (data) => {
  return Object.keys(data).map(country => ({
    country: country,
    scores: [-100, data[country].totalScore ] 
  })).sort((a, b) => b.scores[1] - a.scores[1]);  // Sort based on adjusted score
};
export { getChartData }

