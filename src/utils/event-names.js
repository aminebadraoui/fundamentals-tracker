const currencyList = ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF"]
const eventCategoryList = ["Inflation", "Interest Rates", "Employment", "Growth", "Housing"]

const inflation = [
  "Advance GDP Price Index q/q",
  "Average Earnings Index 3m/y",
  "Average Hourly Earnings m/m",, 
  "CPI Flash Estimate y/y",
  "CPI m/m",
  "CPI q/q",
  "CPI y/y",
  "Common CPI y/y",
  "Core CPI Flash Estimate y/y",
  "Core CPI m/m",
  "Core PCE Price Index m/m",
  "Core PPI m/m",
  "Employment Cost Index q/q",
  "Final GDP Price Index q/q",
  "German Prelim CPI m/m",
  "Median CPI y/y",
  "National Core CPI y/y",
  "PPI m/m",
  "PPI y/y",
  "Prelim GDP Price Index q/q",
  "Spanish Flash CPI y/y",
  "Tokyo Core CPI y/y",
  "Trimmed CPI y/y",
  "Trimmed Mean CPI q/q",
  "Wage Price Index q/q"
]

const interestRates = [
  "Overnight Rate",
  "Main Refinancing Rate",
  "Cash Rate",
  "BOJ Policy Rate",
  "SNB Policy Rate",
  "Official Bank Rate",
]

const eventList = {}
eventList["Inflation"] = inflation
eventList["Interest Rates"] = interestRates




export {currencyList, eventCategoryList, eventList}