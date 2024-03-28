import { useState } from 'react';

const ForexEvents = () => {
  const [events, setEvents] = useState({});
  const [isLoading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forex-events');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Create a Blob from the JSON data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      // Create a link element, use it to download the blob, and then remove the link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'forex-events.json'; // The file name for download
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link);
      
      setEvents(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <button onClick={handleDownload}>Download Forex Events</button>
          <pre>{JSON.stringify(events, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ForexEvents;