

const { MongoClient, ServerApiVersion } = require('mongodb');

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();

    const database = client.db('forex-factory-db'); 

    const collection = database.collection('events'); 

    const dataArray = await collection.find({}).toArray()

    if (dataArray.length === 0) {
      res.status(404).json({ message: 'No data found!' });
    } else {
      const events = dataArray[0].data;
      res.status(200).json({ ...events });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong!' });
  } finally {
    await client.close();
  }
}