const performFetch = async (date) => {
  try {
    const request = `/api/forex-calendar/scrape?date=${date}`
    const response = await fetch(request);
    
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    return data

    //   // Send the data to the server for storage
    // const saveResponse = await fetch('/api/storeData', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // });

    // if (!saveResponse.ok) throw new Error('Failed to save data on the server');
    // console.log('Data stored successfully on the server');
    
    // // Create a Blob from the JSON data
    // const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    // // Create a link element, use it to download the blob, and then remove the link
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = `forex-events-${date}.json`; // The file name for download
    // document.body.appendChild(link); // Required for Firefox
    // link.click();
    // document.body.removeChild(link);
    
    
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

export { performFetch }