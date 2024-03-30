function findMostRecentEvent(data, eventName) {
  var curr = new Date; // Thu Mar 18 2024 11:44:44 GMT-0500 (Eastern Standard Time)
  curr.getDate() // 18
  curr.getDay() // 4

  var currentWeekDay = curr.getDate() - curr.getDay(); 
  var currentWeek = new Date(curr.setDate(currentWeekDay)).toDateString();


  for (const week in data) {
    const currencies = data[week];
    if (currencies["USD"]) {
      for (const day in currencies["USD"]) {
        const events = currencies["USD"][day];
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

          // add score to event object
          return { ...event, currentWeek, week, day, score };
        }
      }
    }
  }
  return null; // If no matching event is found
}

export { findMostRecentEvent }