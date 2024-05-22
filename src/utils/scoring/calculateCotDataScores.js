import { assets }  from '../event-names';
import { findLatestCotDataForAsset } from '../cot-data';

const calculateCotDataScores = (cotData, symbol) => {
  const cot_data_for_Asset = findLatestCotDataForAsset(assets[symbol].cotName, cotData)

  const institutionalLong = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[0].comm_positions_long_all[0]) 
  : parseInt(cot_data_for_Asset[0].noncomm_positions_long_all[0]);

const institutionalShort = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[0].comm_positions_short_all[0]) 
  : parseInt(cot_data_for_Asset[0].noncomm_positions_short_all[0]);

const institutionalLong_final = (assets[symbol].isFlipped === true) 
  ? institutionalShort 
  : institutionalLong;

const institutionalShort_final = (assets[symbol].isFlipped === true) 
  ? institutionalLong 
  : institutionalShort;

  const institutionalNet = institutionalLong_final - institutionalShort_final;

 const institutionalScore = computeInstitutionalScore(institutionalLong_final, institutionalShort_final);

const institutionalLongOld = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[1].comm_positions_long_old[0]) 
  : parseInt(cot_data_for_Asset[1].noncomm_positions_long_old[0]);

const institutionalShortOld = assets[symbol].cotType === 'comm' 
  ? parseInt(cot_data_for_Asset[1].comm_positions_short_old[0]) 
  : parseInt(cot_data_for_Asset[1].noncomm_positions_short_old[0]);

const institutionalLongOld_final = (assets[symbol].isFlipped === true) 
  ? institutionalShortOld 
  : institutionalLongOld;

const institutionalShortOld_final = (assets[symbol].isFlipped === true) 
  ? institutionalLongOld 
  : institutionalShortOld;

 const institutionalNetOld = institutionalLongOld_final - institutionalShortOld_final;


  const retailLong = parseInt(cot_data_for_Asset[0].nonrept_positions_long_all[0])
  const retailShort = parseInt(cot_data_for_Asset[0].nonrept_positions_short_all[0])

  const retail_final_long = (assets[symbol].isFlipped === true ) ? retailShort : retailLong
  const retail_final_short = (assets[symbol].isFlipped === true ) ? retailLong : retailShort

  const retailNet = retail_final_long - retail_final_short

  const retailLongOld = parseInt(cot_data_for_Asset[1].nonrept_positions_long_old[0])
  const retailShortOld = parseInt(cot_data_for_Asset[1].nonrept_positions_short_old[0])

  const retail_final_long_old = (assets[symbol].isFlipped === true ) ? retailShortOld : retailLongOld
  const retail_final_short_old = (assets[symbol].isFlipped === true ) ? retailLongOld : retailShortOld

  const retailNetOld = retail_final_long_old - retail_final_short_old

  const isDivergent = institutionalNet > 0 && retailNet < 0 || institutionalNet < 0 && retailNet > 0
  const retailScore =  computeInstitutionalScore(retail_final_short, retail_final_long)

  let scores = []

  scores.push(institutionalScore)

  if (isDivergent) {
    scores.push(retailScore)
  }

  const totalScore = scores.reduce((acc, score) => acc + score, 0) / scores.length

  const finalScores = {
    cotData: cot_data_for_Asset,
    institutional: {
      long: institutionalLong_final,
      short: institutionalShort_final,
      net: institutionalNet,
      longOld: institutionalLongOld_final,
      shortOld: institutionalShortOld_final,
      netOld: institutionalNetOld,
      score: institutionalScore
    },
    retail: {
      long: retail_final_long,
      short: retail_final_short,
      net: retailNet,
      longOld: retail_final_long_old,
      shortOld: retail_final_short_old,
      netOld: retailNetOld,
      score: isDivergent ? retailScore : 0
    },

    openInterest: parseInt(cot_data_for_Asset[0].open_interest_all[0]),

    totalScore: totalScore
  }

  return finalScores

}


// HELPER

const computeInstitutionalScore = (longs, shorts) => {
  const totalPositions = longs + shorts;
  if (totalPositions === 0) {
    return 0; // Handle division by zero case
  }
  const longPercentage = (longs / totalPositions) * 100;
  const shortPercentage = (shorts / totalPositions) * 100;

  // The score is long percentage minus short percentage, normalized to be between -100 and 100
  return longPercentage - shortPercentage;
};


export { calculateCotDataScores }