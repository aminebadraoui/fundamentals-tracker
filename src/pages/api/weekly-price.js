

export default async (req, res) => {
  const symbol = req.query.symbol

  const formatted_weekly_price_data = await getWeeklyPriceData(symbol)

  res.status(200).json(formatted_weekly_price_data)
}

export const getWeeklyPriceData = async (asset) => {
  let url, formatted_weekly_price_data;
  const apiType = asset.apiType

  
  if (apiType === "eod") {
    const symbol = asset.apiSymbol
    url = `https://eodhd.com/api/eod/${symbol}?&period=w&api_token=${process.env.EOD_TOKEN}&fmt=json`
    const weekly_price_res = await fetch(url);
    console.log("Weekly Price Response", weekly_price_res)

    const weekly_price_json = await weekly_price_res.json()

    console.log("Weekly Price Data", weekly_price_json)


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
    url = `https://api.twelvedata.com/time_series?apikey=${process.env.TWELVEDATA_API_KEY}&interval=1week&symbol=${symbol}&format=JSON&start_date=2020-01-01 10:42:00`
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

    // sort formatted_weekly_price_data by time in ascending order by converting time to date object
    formatted_weekly_price_data = formatted_weekly_price_data_desc.sort((a, b) => {
      return new Date(a.time) - new Date(b.time)
    })
    

    console.log("Weekly Price Data", formatted_weekly_price_data)
  }


  
  // const url =`https://eodhd.com/api/eod/${symbol}?&period=w&api_token=${process.env.EOD_TOKEN}&fmt=json`

 

  
  return formatted_weekly_price_data
}