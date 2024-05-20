import { assets } from "../event-names";

const calculateBondScoreForPair = (bondData, asset) => {
  const bondScores = bondData.map((data) => {
    const { country, data: bondDetails } = data;
    const shortBonds = bondDetails[country].shortBonds;
    const longBonds = bondDetails[country].longBonds;

    const lastShortBondValue = shortBonds[shortBonds.length - 1].close;
    const lastLongBondValue = longBonds[longBonds.length - 1].close;

    let score = 0;

    if (lastShortBondValue > lastLongBondValue) {
      score = 100;
    } else if (lastShortBondValue < lastLongBondValue) {
      score = -100;
    }

    return { country, score };
  });

  let totalScore = 0

  if (bondScores.length == 2) {
    totalScore = (bondScores[0].score - bondScores[1].score) / 2
    } else if (bondScores.length == 1) {

      if (assets[asset].isAgainstUSBond) {
        totalScore = -bondScores[0].score 
      } else {
        totalScore = bondScores[0].score
      }
  }

  

  const score = {
    bondScores,
    totalScore
  }

  console.log("bondScores", score)

  return score
};

export {calculateBondScoreForPair};