const getScoreTextColor = (score) => {
  return `${score > 0 ? 'text-bullish' : score  ==  0 ? 'text-neutral' : 'text-bearish' }`
}

const getScoreBackgroundColor = (score) => {
  return `${score > 0 ? 'bg-bullish' : score  ==  0 ? 'bg-neutral' : 'bg-bearish' }`
}

export { getScoreTextColor, getScoreBackgroundColor }