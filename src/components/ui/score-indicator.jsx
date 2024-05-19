import React from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

const ScoreIndicator = ({ score }) => {
  const isPositive = score > 0;
  const isNegative = score < 0;
  
  return (
 score != null ? <div className={`inline-flex items-center px-4 space-x-4 py-1 rounded font-bold text-base ${score > 50 ? 'bg-strongBuy text-white' : score > 25 ? 'bg-buy text-white' : (score > -25 || score == 0) ? 'bg-neutral text-white' : score > -50 ? 'bg-sell text-white' : 'bg-strongSell text-white'} `}>
    <span className="text-3xl">{score} </span>
    {isPositive && <FaArrowTrendUp size={32} className='opacity-60'  /> } 
    { isNegative && <FaArrowTrendDown size={32} className='opacity-60'   />}
  </div> : <div></div>
  );
};

export default ScoreIndicator;
