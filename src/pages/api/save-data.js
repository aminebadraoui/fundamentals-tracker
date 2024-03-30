// pages/api/saveData.js
const { MongoClient, ServerApiVersion } = require('mongodb');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { data } = req.body;

    console.log(req.body)

    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    try {
      await client.connect();

      const database = client.db('forex-factory-db'); // Choose a name for your database

      const collection = database.collection('events'); // Choose a name for your collection

      await collection.insertOne({ data });

      res.status(201).json({ message: 'Data saved successfully!' });
    } catch (error) {

      console.log(error)
      res.status(500).json({ message: 'Something went wrong!' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed!' });
  }
}