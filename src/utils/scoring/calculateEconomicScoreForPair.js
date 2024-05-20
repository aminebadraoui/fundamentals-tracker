import { assets } from '../event-names'

const calculateEconomicScoreForPair = (economicData, asset, isFlipped=false) => {
  const individualEconomicScores = economicData.map(data => calculateIndividualEconomicScore(data, isFlipped));
      console.log("individualInflationScores", individualEconomicScores)

      let totalScore;
      if (individualEconomicScores.length > 1) {
       
        const countryKeys = Object.keys(individualEconomicScores[0]).concat(Object.keys(individualEconomicScores[1]));
        totalScore = (individualEconomicScores[0][countryKeys[0]] - individualEconomicScores[1][countryKeys[1]]) / 2;

        console.log("countryKeys", countryKeys)
      } else {
        
        const countryKeys = Object.keys(individualEconomicScores[0])
        totalScore = individualEconomicScores[0][countryKeys[0]];

        if (assets[asset].isAgainstUS) {
          totalScore = -totalScore;
        }

        console.log("countryKeys", countryKeys)
      }

      const inflationScore = {
        individualScores: individualEconomicScores,
        totalScore: totalScore
      };

      return inflationScore;
  }


// Helper
const calculateIndividualEconomicScore = (inflationData, isFlipped) => {
  const scores = {};
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Object.keys(inflationData).sort((a, b) => b - a); // Sort years in descending order

  for (const countryCode in inflationData[years[0]]) {
    let lastAvailableData = null;
    let previousData = null;

    const latestYear = years[0];

    for (let month of months.slice().reverse()) { // Sort months in descending order
      const monthData = inflationData[latestYear][countryCode][month];
      if (monthData && monthData.length > 0 && monthData[0].actual !== null) {
        if (!lastAvailableData) {
          lastAvailableData = monthData[0];
        } else {
          previousData = monthData[0];
          break;
        }
      }
    }

    if (!lastAvailableData) {
      scores[countryCode] = 0; // No actual data available for this country
      continue;
    }

    const currentEstimate = lastAvailableData.estimate;
    const actual = lastAvailableData.actual;

    let previousEstimate = currentEstimate;
    let previousActual = actual;

    if (previousData) {
      previousEstimate = previousData.estimate || currentEstimate;
      previousActual = previousData.actual || actual;
    }

    console.log("lastAvailableData", lastAvailableData)
    console.log("previousData", previousData)

    // Calculate the scores based on simple discretionary rules
    let score = 0;

    if (actual > currentEstimate) {
      score += !isFlipped ? 100 : -100;
    } else if (actual < currentEstimate) {
      score -= !isFlipped ? 100 : -100;
    }

    // if (currentEstimate > previousEstimate) {
    //   score += !isFlipped ? 50 : -50;
    // } else if (currentEstimate < previousEstimate) {
    //   score -= !isFlipped ? 50 : -50;
    // }

    // if (actual > previousActual) {
    //   score += !isFlipped ? 50 : -50;
    // } else if (actual < previousActual) {
    //   score -= !isFlipped ? 50 : -50;
    // }

    // Ensure the score is within the range of -100 to 100
    score = Math.max(-100, Math.min(100, score));

    scores[countryCode] = score;
  }

  return scores;
};
  
export { calculateEconomicScoreForPair }