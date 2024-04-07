import { countryList_Iso3166, eventCategoryList, inflationKeys, flippedScoringKeys } from '@/utils/event-names';

const getScore = (event) => {
  let score = 0
  if (flippedScoringKeys.includes(event.type)) {
    if (event.actual > event.estimate) {
      score -= 1
    }
    if (event.actual < event.estimate) {
      score += 1
    }
    if (event.actual > event.previous) {
      score -= 1
    }
    if (event.actual < event.previous) {
      score += 1
    }
  } else {
    if (event.actual > event.estimate) {
      score += 1
    }
    if (event.actual < event.estimate) {
      score -= 1
    }
    if (event.actual > event.previous) {
      score += 1
    }
    if (event.actual < event.previous) {
      score -= 1
    }
  }
  return score
 }

const getDataSortedByTotalScore = (rawData, filter, antifilter) => {
  let finalData = {}

  // The keys are the country codes
  Object.keys(rawData).map((key) => { 
      const eventArray = rawData[key] // The value is an array of events

      // Some preparation
      finalData[key] = {}
      finalData[key]["events"] = []
      finalData[key]["totalScore"] = 0

      // Filter the events
      Object.keys(eventArray).map((eventIndex) => { 
        const event = eventArray[eventIndex]

        if (filter && filter.includes(event.type) || antifilter && !antifilter.includes(event.type)) {
            finalData[key]["events"].push(event)
        }
      })

      // if there are duplicates in inflation[key], keep only the most recent event based on their date property's value
      const uniqueEvents = []
      finalData[key].events.map((event) => {
        const existingEvent = uniqueEvents.find((uniqueEvent) => uniqueEvent.type === event.type && uniqueEvent.comparison === event.comparison)
        if (existingEvent) {
          if (existingEvent.date < event.date) {
            uniqueEvents[uniqueEvents.indexOf(existingEvent)] = event
          }
        } else {
          uniqueEvents.push(event)
        }
      })

      // calculate the score for each event
      uniqueEvents.map((event) => {
        event.score = getScore(event)
      })

      // calculate the total score for the country's event category
      finalData[key]['events'] = uniqueEvents
      const score = uniqueEvents.reduce((acc, event) => acc + event.score, 0) / uniqueEvents.length;
      finalData[key]['totalScore'] = score ? score : 0  
      
     
      // round to 2 decimal places without using math.round or math.floor 





      

      // sort the countries by totalScore
      const sortedKeys = Object.keys(finalData).sort((a, b) => finalData[b].totalScore - finalData[a].totalScore)
      const sortedData = {}
      sortedKeys.map((key) => {
        sortedData[key] = finalData[key]
      })

      // set the state with the sorted data
      finalData = sortedData

      
  })

  return finalData
}

export { getDataSortedByTotalScore }