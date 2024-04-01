function parseAndFormatDate(inputDate) {
  // Define month names and day names to use in formatting
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];

  // Extract the month, day, and year from the input date string

  const month = inputDate.substring(0, 3)

  const monthIndex = monthNames.indexOf(month) 

  const dayYearSplitIndex = inputDate.length - 4; 
  const day = inputDate.substring(3, dayYearSplitIndex -1) 

  const year = inputDate.substring(dayYearSplitIndex)

  // // Create a new Date object from the extracted components
  const date = new Date(year, monthIndex, day).toDateString()

 return date
}

function findMostRecentEvent(data, currency, eventName) {
  var curr = new Date; // Thu Mar 18 2024 11:44:44 GMT-0500 (Eastern Standard Time)
  curr.getDate() // 18
  curr.getDay() // 4

  var currentWeekDay = curr.getDate() - curr.getDay(); 
  var currentWeek = new Date(curr.setDate(currentWeekDay)).toDateString();

  for (const week in data) {
    const currencies = data[week];
    if (currencies[currency]) {
      for (const day in currencies[currency]) {
        const events = currencies[currency][day];
        const event = events.find(event => event.eventTitle === eventName && event.actual && event.forecast && event.previous);
        if (event) {
          // keep track of a score, if actual is higher than forecast, add 1, if actual is lower than forecast, subtract 1
          let score = 0;
          if (event.actual > event.forecast) {
            score += 1;
          } else if (event.actual < event.forecast) {
            score -= 1;
          }
          // do the same if actual is higher than previous, add 1, if actual is lower than previous, subtract 1
          if (event.actual > event.previous) {
            score += 1;
          } else if (event.actual < event.previous) {
            score -= 1;
          }

           const reportedWeek = parseAndFormatDate(week);
           console.log(reportedWeek)

          // add score to event object
          return { ...event, currentWeek, reportedWeek, day, score };
        }
      }
    }
  }
  return null; // If no matching event is found
}

export { findMostRecentEvent }