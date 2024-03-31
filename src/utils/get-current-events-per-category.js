import { findMostRecentEvent } from '@/utils/find-most-recent-event';
import { inflationData, salesData, laborData, housingData } from '@/utils/event-names';


const getCurrentEventsPerCategory = (combinedData) => {
  const currentInflationEvents = [];
  const currentSalesEvents = [];
  const currentEconomicEvents = [];
  const currentHousingEvents = [];

  for (const event of inflationData) {
    const inflationEvent = findMostRecentEvent(combinedData, event);
    if (inflationEvent) {
      currentInflationEvents.push(inflationEvent);
    }
  }

  for (const event of salesData) {
    const salesEvent = findMostRecentEvent(combinedData, event);
    if (salesEvent) {
      currentSalesEvents.push(salesEvent);
    }
  }

  for (const event of laborData) {
    const laborEvent = findMostRecentEvent(combinedData, event);
    if (laborEvent) {
      currentEconomicEvents.push(laborEvent);
    }
  }

  for (const event of housingData) {
    const housingEvent = findMostRecentEvent(combinedData, event);
    if (housingEvent) {
      currentHousingEvents.push(housingEvent);
    }
  }

  return {
    "Inflation Data": currentInflationEvents,
    "Retail Data": currentSalesEvents,
    "Economic Growth Data": currentEconomicEvents,
    "Housing Data": currentHousingEvents,
  };
}

export {getCurrentEventsPerCategory}