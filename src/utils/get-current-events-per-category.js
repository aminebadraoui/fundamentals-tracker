import { findMostRecentEvent } from '@/utils/find-most-recent-event';
import { eventNames, eventCategoryList, eventList } from '@/utils/event-names';


const getAllEventsForCurrency = (combinedData, currency) => {
  const data = {}

  eventCategoryList.map((category) => {
    let eventCategoryArray = []

    eventList[category] && eventList[category].map((event) => {
      const currentEvent = findMostRecentEvent(combinedData, currency, event);
      if (currentEvent) {
        eventCategoryArray.push(currentEvent)
      }
    })

    data[category] = eventCategoryArray
  });
 
  return data
}

export {getAllEventsForCurrency}