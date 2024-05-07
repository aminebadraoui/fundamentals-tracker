const getScoreTextColor = (score) => {
  return `font-bold ${score > 50 ? 'text-strongBuy' : score >= 25 ? 'text-buy' : score >= -25 ? 'text-neutral' : score >= -50 ? 'text-sell'  : 'text-strongSell' }`
}

const getScoreBackgroundColor = (score) => {
  return `font-bold ${score > 50 ? 'bg-strongBuy text-white ': score >= 25 ? 'bg-buy text-white' : score >= -25 ? 'bg-neutral text-black' : score >= -50 ? 'bg-sell text-white'  : 'bg-strongSell text-white' }`
}

export { getScoreTextColor, getScoreBackgroundColor }