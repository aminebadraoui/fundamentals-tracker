const getScoreTextColor = (score) => {
  return `${score > 25 ? 'text-bullish' : score  < -25 ? 'text-bearish' : 'text-neutral' }`
}

const getScoreBackgroundColor = (score) => {
  return `${score > 25 ? 'bg-bullish' : score  < -25 ? 'bg-bearish' : 'bg-neutral' }`
}

export { getScoreTextColor, getScoreBackgroundColor }