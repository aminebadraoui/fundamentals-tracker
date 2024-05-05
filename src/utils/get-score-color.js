const getScoreTextColor = (score) => {
  return `font-bold ${score > 25 ? 'text-bullish' : score  < -25 ? 'text-bearish' : 'text-primary-foreground' }`
}

const getScoreBackgroundColor = (score) => {
  return `font-bold ${score > 25 ? 'bg-bullish' : score  < -25 ? 'bg-bearish' : 'bg-neutral' }`
}

export { getScoreTextColor, getScoreBackgroundColor }