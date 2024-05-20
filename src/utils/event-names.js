const countryList_Iso3166 = ["US", "EU", "CA", "AU", "NZ", "JP", "CH", "MX", "UK"]
const eventCategoryList = ["Inflation", "Interest Rates", "Econmic Growth"]

// write array of all first day of the month and last day of the month for the last 12 months in the format of "MM-DD" in ascending order starting from january with an object key of the month name and first and last keys

const countries = {
  "US": {
    inflationKey: "Inflation Rate",
    mPMIKey: "ISM Manufacturing PMI",
    sPMIKey: "ISM Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "EU": {
    inflationKey: "Inflation Rate",
    mPMIKey: "HCOB Manufacturing PMI",
    sPMIKey: "HCOB Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  

  },
  "CA": {
    inflationKey: "Inflation Rate",
    mPMIKey: "Ivey PMI s.a",
    sPMIKey: "Ivey PMI s.a",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "AU": {
    inflationKey: "Inflation Rate",
    mPMIKey: "Judo Bank Manufacturing PMI",
    sPMIKey: "Judo Bank Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "NZ": {
    inflationKey: "Inflation Rate",
    mPMIKey: null,
    sPMIKey: "Business NZ PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "JP": {
    inflationKey: "Inflation Rate",
    mPMIKey: "Jibun Bank Manufacturing PMI",
    sPMIKey: "Jibun Bank Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "CH": {
    inflationKey: "Inflation Rate",
    mPMIKey: "procure.ch Manufacturing PMI",
    sPMIKey: "procure.ch Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "MX": {
    inflationKey: "Inflation Rate",
    mPMIKey: null,
    sPMIKey: null,
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  },
  "UK": {
    inflationKey: "Inflation Rate",
    mPMIKey: "S&P Global/CIPS Manufacturing PMI",
    sPMIKey: "S&P Global/CIPS UK Services PMI",
    unemploymentKey: "Unemployment Rate",
    gdpGrowthRateKey: "GDP Growth Rate",  
  }
}

const monthDates = { 
  "January": {first: "01-01", last: "01-31"},
  "February": {first: "02-01", last: "02-28"},
  "March": {first: "03-01", last: "03-31"},
  "April": {first: "04-01", last: "04-30"},
  "May": {first: "05-01", last: "05-31"},
  "June": {first: "06-01", last: "06-30"},
  "July": {first: "07-01", last: "07-31"},
  "August": {first: "08-01", last: "08-31"},
  "September": {first: "09-01", last: "09-30"},
  "October": {first: "10-01", last: "10-31"},
  "November": {first: "11-01", last: "11-30"},
  "December": {first: "12-01", last: "12-31"},
}
const years = ["2020", "2021", "2022", "2023", "2024"]

const inflationKeys = {
  "US": ["Inflation Rate"],
  "EU": ["Inflation Rate"],
  "CA": ["Inflation Rate"],
  "AU": ["Inflation Rate"],
  "NZ": ["Inflation Rate"],
  "JP": ["Inflation Rate" ],
  "CH": ["Inflation Rate"], 
  "MX": ["Inflation Rate"],
  "UK": ["Inflation Rate"]
}

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

const bonds = {
  "US": {
    short: "US2Y.GBOND",
    long: "US10Y.GBOND"
  },
  "EU": {
    short: "EURIBOR3M.MONEY",
    long: "EURIBOR12M.MONEY"
  },
  "UK": {
    short: "UK2Y.GBOND",
    long: "UK10Y.GBOND"
  },
  "AU": {
    short: "AU2Y.GBOND",
    long: "AU10Y.GBOND"
  },
  "NZ": {
    short: "NZ2Y.GBOND",
    long: "NZ10Y.GBOND"
  },
  "CH": {
    short: "CH10Y.GBOND",
    long: "CH10Y.GBOND"
  },
  "JP": {
    short: "JP2Y.GBOND",
    long: "JP10Y.GBOND"
  },
  "CA": {
    short: "CA2Y.GBOND",
    long: "CA10Y.GBOND"
  },
}

const assets =  {
  'EURUSD': {
    countries: ["EU", "US"],
    cotName: "EURO FX",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'EURUSD.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "normalCurrency"
  },
  
  'GBPUSD': {
    countries: ["UK", "US"],
    cotName: "BRITISH POUND",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'GBPUSD.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "normalCurrency"
  },

  'AUDUSD': {
    countries: ["AU", "US"],
    cotName: "AUSTRALIAN DOLLAR",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'AUDUSD.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "normalCurrency"
  },

  'NZDUSD': {
    countries: ["NZ", "US"],
    cotName: "NZ DOLLAR",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'NZDUSD.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "normalCurrency"
  },

  'USDCHF': {
    countries: ["US", "CH"],
    cotName: "SWISS FRANC",
    cotFileName: 'currencies',
    ccotType: 'nonComm',
    apiSymbol: 'USDCHF.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: true,
    isAgainstUS: false,
    isAgainstUSBond: false,
    assetType: "flippedCurrency"
  },

  'USDJPY': {
    countries: ["US", "JP"],
    cotName: "JAPANESE YEN",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'USDJPY.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: true,
    isAgainstUS: false,
    isAgainstUSBond: false,
    assetType: "flippedCurrency"
  },

  'USDCAD': {
    countries: ["US", "CA"],
    cotName: "CANADIAN DOLLAR",
    cotFileName: 'currencies',
    cotType: 'nonComm',
    apiSymbol: 'USDCAD.FOREX',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: true,
    isAgainstUS: false,
    isAgainstUSBond: false,
    assetType: "flippedCurrency"
  },
  'BITCOIN': {
    countries: ["US"],
    cotName: "BITCOIN",
    cotFileName: 'crypto',
    cotType: 'nonComm',
    apiSymbol: 'BTC-USD.CC',
    apiType: 'eod',
    twelveDataSymbol: ``,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "crypto"
  },
  'GOLD': {
    countries: ["US"],
    cotName: "GOLD",
    cotFileName: 'precious-metals',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: 'openExchange',
    twelveDataSymbol: `XAU/USD`,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "preciousMetal"
  },
  'SILVER': {
    countries: ["US"],
    cotName: "SILVER",
    cotFileName: 'precious-metals',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: 'openExchange',
    twelveDataSymbol: `XAG/USD`,
    isFlipped: false,
    isAgainstUS: true,
    isAgainstUSBond: true,
    assetType: "preciousMetal"
  },
  'OIL': {
    countries: ["US"],
    cotName: "WTI FINANCIAL CRUDE OIL",
    cotFileName: 'commodities',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: '',
    twelveDataSymbol: `WTI/USD`,
    isFlipped: false,
    isAgainstUS: false,
    isAgainstUSBond: true,
    assetType: "commodity"
  },
  'NAS100': {
    countries: ["US"],
    cotName: "NASDAQ-100 Consolidated",
    cotFileName: 'indices',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: '',
    twelveDataSymbol: `NDX`,
    isFlipped: false,
    isAgainstUS: false,
    isAgainstUSBond: true,
    assetType: "index"
  },
  'US30': {
    countries: ["US"],
    cotName: "DJIA Consolidated",
    cotFileName: 'indices',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: '',
    twelveDataSymbol: `DJI`,
    isFlipped: false,
    isAgainstUS: false,
    isAgainstUSBond: true,
    assetType: "index"
  },
  'SP500': {
    countries: ["US"],
    cotName: "SP 500 Consolidated",
    cotFileName: 'indices',
    cotType: 'noncomm',
    apiSymbol: '',
    apiType: '',
    twelveDataSymbol: `SPX`,
    isFlipped: false,
    isAgainstUS: false,
    isAgainstUSBond: true,
    assetType: "index"
  },
}

export {
  inflationKeys,
  eventCategoryList, 
  countryList_Iso3166, 
  interestRatesKeys, 
  employmentKeys, 
  housingKeys, 
  flippedScoringKeys,
  majorEventsKeys,
  assets,
  monthDates,
  years,
  bonds,
  countries
}