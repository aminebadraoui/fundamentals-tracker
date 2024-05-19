


export const getWeeklyPriceData = async (asset, startDate=null) => {
  let url, formatted_weekly_price_data;
  const apiType = asset.apiType

  console.log("startDate getWeeklyPriceData ", startDate)

  const start_date = startDate ? startDate : "2016-01-01"

  
  if (apiType === "eod") {
    const symbol = asset.apiSymbol
    url = `https://eodhd.com/api/eod/${symbol}?&period=d&from=${start_date}&api_token=${process.env.EOD_TOKEN}&fmt=json`
    const weekly_price_res = await fetch(url);
    

    const weekly_price_json = await weekly_price_res.json()

  formatted_weekly_price_data = weekly_price_json.map((data) => {
      return {
        time: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume
      }
    })

  } else {
    const symbol = asset.twelveDataSymbol
    url = `https://api.twelvedata.com/time_series?apikey=${process.env.TWELVEDATA_API_KEY}&interval=1day&symbol=${symbol}&format=JSON&start_date=${start_date} 00:00:00`
    const weekly_price_res = await fetch(url);
    

    const weekly_price_json = await weekly_price_res.json()

    const formatted_weekly_price_data_desc = weekly_price_json.values.map((data) => {
      return {
        time: data.datetime,
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        close: parseFloat(data.close),
      }
    })

    // remove duplicates where time is the same
    const formatted_weekly_price_data_filtered = formatted_weekly_price_data_desc.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.time === value.time
      ))
    )

    // sort formatted_weekly_price_data by time in ascending order by converting time to date object
    formatted_weekly_price_data = formatted_weekly_price_data_filtered.sort((a, b) => {
      return new Date(a.time) - new Date(b.time)
    })
    

    
  }


  
  // const url =`https://eodhd.com/api/eod/${symbol}?&period=w&api_token=${process.env.EOD_TOKEN}&fmt=json`

 

  
  return formatted_weekly_price_data
}