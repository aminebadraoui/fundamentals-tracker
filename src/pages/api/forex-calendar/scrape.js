import { scrollToBottom } from '@/utils/pupeeteer/scroller';
import { performClickAction } from '@/utils/pupeeteer/clicker';

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

export default async (req, res) => {
    const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

    console.log(req.query)

    const date = req.query["date"]

    if (date) {
      console.log(date)
    } else {
      res.status(500)
    }
    
    // Initialize Puppeteer
    const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    const browser = await  puppeteer.launch({
        args: [ '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      });
    const page = await browser.newPage();
    
    await page.setUserAgent(userAgent)
    
    const promises = [];
    const startWaitingForEvents = () => {
        promises.push(page.waitForNavigation());
    }

    startWaitingForEvents();

    await page.goto(`https://www.forexfactory.com/calendar?week=${date}`,  {waitUntil: 'networkidle0'});
    await Promise.all(promises);
    
    await performClickAction(page, ':scope >>> li.calendar__filters div', 7, 11)
    await performClickAction(page, ':scope >>> #impact_holiday_1', 6.515625, 8.3203125)
    await performClickAction(page, ':scope >>> #impact_low_1', 6.515625, 5.3203125)
    await performClickAction(page, '::-p-text(Apply Filter)', 53.1953125, 9.203125)
  
    await wait(1000)
    
    // Let's use the function
    await scrollToBottom({
        page,
        distancePx: 100,
        speedMs: 50,
        scrollTimeoutMs: 10000,
        eltToScroll: "body" 
    });
    
    // Scrape the data
    const dataByCurrency = await page.evaluate(() => { 
        // Use an object to group events by currency
        const events = {};
        const eventRows = document.querySelectorAll('tr.calendar__row'); // Rows with event data
        var lastUpdatedDate = ""
        
        eventRows.forEach(row => {
            // Only consider rows with events, not headers or empty rows
            const currencyCell = row.querySelector('td.calendar__currency');
            const eventCell = row.querySelector('td.calendar__event');
            const dateCell = row.querySelector('td.calendar__date');
            const timeCell = row.querySelector('td.calendar__time');
            
            if (currencyCell && eventCell && timeCell) {
                const currency = currencyCell.innerText.trim();
                const eventTitle = eventCell.innerText.trim();
                if (dateCell) {
                    lastUpdatedDate = dateCell.innerText.trim().replace("\n", " ")
                }
         
                // Add more details as needed from the other cells in the row
                const actual = row.querySelector('td.calendar__actual')?.innerText.trim();
                const forecast = row.querySelector('td.calendar__forecast')?.innerText.trim();
                const previous = row.querySelector('td.calendar__previous')?.innerText.trim();

                if (actual == "" && forecast == "" && previous == "") {
                  return
                }
                
                const eventDetail = {
                    eventTitle,
                    actual,
                    forecast,
                    previous
                };
                
                // Initialize the currency array if it doesn't exist
                if (!events[currency]) {
                    events[currency] = {};
                }
                
                if (!events[currency][lastUpdatedDate]) {
                    events[currency][lastUpdatedDate] = []
                }
                
                // Push the event detail into the correct currency array
                events[currency][lastUpdatedDate].push(eventDetail);
            }
        });

        return events;
    });
    
    
    // Close Puppeteer
    await browser.close();

    console.log("scraping finished")
    console.log(dataByCurrency)
    
    // Return the scraped data grouped by currency
    res.status(200).json(dataByCurrency);
};