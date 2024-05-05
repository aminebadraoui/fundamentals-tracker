import React from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

const ScoreIndicator = ({ score }) => {
  const isPositive = score >= 0;
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded font-bold text-base ${isPositive ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      <span className="m-4 text-3xl">{score} </span>
      {isPositive ? <FaArrowTrendUp size={32}  /> : <FaArrowTrendDown size={32}  />}
      
    </div>
  );
};

export default ScoreIndicator;
