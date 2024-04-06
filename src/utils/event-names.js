const countryList_Iso3166 = ["US", "EU", "CA", "AU", "NZ", "JP", "CH", "MX"]
const eventCategoryList = ["Inflation", "Interest Rates", "Econmic Growth"]

const inflationKeys = [
  "Inflation Rate",
  "Core Inflation Rate",
  "CPI",
  "Core PCE Price Index",
  "PCE Price Index",
  "Core PCE Prices",
  "PCE Prices",
  "Fed Interest Rate Decision",
  "Core PPI",
  "PPI",
  "ECB Interest Rate Decision",
  "BoC Interest Rate Decision",
  "CPI Trimmed-Mean",
  "CPI Median",
  "Monthly CPI Indicator",
  "RBA Interest Rate Decision",
  "RBA Weighted Median CPI",
  "RBA Trimmed Mean CPI",
  "RBNZ Interest Rate Decision",
  "PPI Output",
  "PPI Input",
  "Tokyo Core CPI",
  "BoJ Interest Rate Decision",
  "SNB Interest Rate Decision",
  "Mid-month Inflation Rate",
  "Mid-month Core Inflation Rate",
  "Interest Rate Decision",
  "Core PCE Prices QoQ Adv",
]

const interestRatesKeys = [
  "Fed Interest Rate Decision",
  "ECB Interest Rate Decision",
  "RBA Interest Rate Decision",
  "RBNZ Interest Rate Decision", 
  "BoJ Interest Rate Decision",
  "SNB Interest Rate Decision",
  "Interest Rate Decision"
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
 "Average Cash Earnings"
]

const flippedScoringKeys = [
  "Initial Jobless Claims",
  "Continuing Jobless Claims",
  "Unemployment Rate",
]






export {inflationKeys, eventCategoryList, countryList_Iso3166, interestRatesKeys, employmentKeys, flippedScoringKeys}