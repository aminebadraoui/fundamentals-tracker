import React from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

const ScoreIndicator = ({ score }) => {
  const isPositive = score >= 0;
  
  return (
    <div className={`inline-flex items-center px-4 space-x-4 py-1 rounded font-bold text-base ${score > 0 ? 'bg-bullish' : score < 0 ? 'bg-bearish' : 'bg-neutral'} text-white`}>
      <span className="text-3xl">{score} </span>
      {isPositive ? <FaArrowTrendUp size={32} className='opacity-60'  /> : <FaArrowTrendDown size={32} className='opacity-60'   />}
      
    </div>
  );
};

export default ScoreIndicator;
