const countryList_Iso3166 = ["US", "EU", "CA", "AU", "NZ", "JP", "CH", "MX", "UK"]
const eventCategoryList = ["Inflation", "Interest Rates", "Econmic Growth"]

const inflationKeys = [
  "Inflation Rate",
  "Core Inflation Rate",
  "CPI",
  "Core PCE Price Index",
  "PCE Price Index",
  "Core PCE Prices",
  "PCE Prices",
  "Core PPI",
  "PPI",
  "CPI Trimmed-Mean",
  "CPI Median",
  "Monthly CPI Indicator",
  "RBA Interest Rate Decision",
  "RBA Weighted Median CPI",
  "RBA Trimmed Mean CPI",
  "PPI Output",
  "PPI Input",
  "Tokyo Core CPI",
  "Mid-month Inflation Rate",
  "Mid-month Core Inflation Rate",
  "Core PCE Prices QoQ Adv",
  "Tokyo CPI",
  "PPI Core Output",
  "PPI Core Output"

]

const interestRatesKeys = [
  "Fed Interest Rate Decision",
  "ECB Interest Rate Decision",
  "RBA Interest Rate Decision",
  "RBNZ Interest Rate Decision", 
  "BoJ Interest Rate Decision",
  "SNB Interest Rate Decision",
  "BoC Interest Rate Decision",
  "BoJ Interest Rate Decision",
  "Interest Rate Decision",
  "SNB Interest Rate Decison",
  "BoE Interest Rate Decision"
]

const employmentKeys = [
  "Unemployment Rate",
 "Employment Change",
 "Nonfarm Payrolls Private",
 "Average Hourly Earnings",
 "Non Farm Payrolls",
 "Average Weekly Hours",
 "Initial Jobless Claims",
 "ADP Employment Change",
 "JOLTs Job Openings",
 "Continuing Jobless Claims",
 "Nonfarm Productivity",
 "Jobs/applications ratio",
 "Wage Price Index",
 "Average Cash Earnings",
 "Wage Growth",
 "Labour Cost Index",
 "Part Time Employment Chg",
 "Full Time Employment Chg",
 "Labour Costs Index",
 "Unit Labour Costs",
 "Manufacturing Payrolls",
 "Employment Cost Index",
]

const flippedScoringKeys = [
  "Initial Jobless Claims",
  "Continuing Jobless Claims",
  "Unemployment Rate",
]

const housingKeys = [
"Private House Approvals",
"Home Loans",
"Housing Starts",
"New Housing Price Index",
"Loans to Households",
"Pending Home Sales",
"S&P/Case-Shiller Home Price",
"New Home Sales",
"Existing Home Sales",

]

const majorEventsKeys = [ 
  "PPI",
  "CPI",
  "Initial Jobless Claims",
  "PMI",
  "Non Farm Payrolls",
  "Fed Interest Rate Decision",
  "Inflation Rate",
  ...interestRatesKeys,
  "Core Inflation Rate (yoy)",
  "FOMC Minutes",
]

const majorForexPairs =  {
  'EURUSD': {
    countries: ["EU", "US"],
    cotName: "EURO FX",
    apiSymbol: 'EURUSD.FOREX'
  },
  
  'GBPUSD': {
    countries: ["UK", "US"],
    cotName: "BRITISH POUND",
    apiSymbol: 'GBPUSD.FOREX'
  },

  'AUDUSD': {
    countries: ["AU", "US"],
    cotName: "AUSTRALIAN DOLLAR",
    apiSymbol: 'AUDUSD.FOREX'
  },

  'NZDUSD': {
    countries: ["NZ", "US"],
    cotName: "NZ DOLLAR",
    apiSymbol: 'NZDUSD.FOREX'
  },

  'USDCHF': {
    countries: ["US", "CH"],
    cotName: "SWISS FRANC",
    apiSymbol: 'USDCHF.FOREX'
  },

  'USDJPY': {
    countries: ["US", "JP"],
    cotName: "JAPANESE YEN",
    apiSymbol: 'USDJPY.FOREX'
  },

  'USDCAD': {
    countries: ["US", "CA"],
    cotName: "CANADIAN DOLLAR",
    apiSymbol: 'USDCAD.FOREX'
  },
}

const cryptoAssets = {
  'BITCOIN': {
    countries: ["US"],
    cotName: "BITCOIN",
    apiSymbol: 'BTC-USD.CC'
  },
}

const commodities = {
  'GOLD': {
    countries: ["US"],
    cotName: "GOLD",
    apiSymbol: ''
  },
  'SILVER': {
    countries: ["US"],
    cotName: "SILVER",
    apiSymbol: ''
  },
  'OIL': {
    countries: ["US"],
    cotName: "WTI FINANCIAL CRUDE OIL",
    apiSymbol: ''
  },
}
 
export {inflationKeys,
  eventCategoryList, 
  countryList_Iso3166, 
  interestRatesKeys, 
  employmentKeys, 
  housingKeys, 
  flippedScoringKeys,
  majorEventsKeys,
  majorForexPairs,
  cryptoAssets,
  commodities
}