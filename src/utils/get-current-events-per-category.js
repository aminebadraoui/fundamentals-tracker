import { findMostRecentEvent } from '@/utils/find-most-recent-event';
import { inflationData, salesData, laborData, housingData } from '@/utils/event-names';


const getAllEventsForCurrency = (combinedData, currency) => {
  const currentInflationEvents = [];
  const currentSalesEvents = [];
  const currentEconomicEvents = [];
  const currentHousingEvents = [];

  for (const event of inflationData) {
    const inflationEvent = findMostRecentEvent(combinedData, currency, event);
    if (inflationEvent) {
      currentInflationEvents.push(inflationEvent);
    }
  }

  for (const event of salesData) {
    const salesEvent = findMostRecentEvent(combinedData, currency, event);
    if (salesEvent) {
      currentSalesEvents.push(salesEvent);
    }
  }

  for (const event of laborData) {
    const laborEvent = findMostRecentEvent(combinedData, currency, event);
    if (laborEvent) {
      currentEconomicEvents.push(laborEvent);
    }
  }

  for (const event of housingData) {
    const housingEvent = findMostRecentEvent(combinedData, currency, event);
    if (housingEvent) {
      currentHousingEvents.push(housingEvent);
    }
  }

  const data = {}
  return { 
    "Inflation Data": currentInflationEvents,
    "Retail Data": currentSalesEvents,
    "Economic Growth Data": currentEconomicEvents,
    "Housing Data": currentHousingEvents,  
  }

  return data
}

export {getAllEventsForCurrency}