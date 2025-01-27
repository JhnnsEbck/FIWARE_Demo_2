const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

// This is the file that runs dataController.updateData(diva).
// Adjust the path if your `app.js` is somewhere else.
const dataUpdater = require('./src/app.js'); 

const app = express();
const port = 3000;

// Parse JSON bodies (needed for POST /update to parse { diva })
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * GET /stops
 * Return all stops with name, coordinates, diva, lines (and departures).
 */
app.get('/stops', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("orion");
    const collection = db.collection("entities");

    const docs = await collection.find().toArray();

    // Transform documents into the shape we need
    const stops = docs.map(doc => {
      const name = doc.attrs?.['https://uri=etsi=org/ngsi-ld/name']?.value || null;
      const coordinates = doc.attrs?.location?.value?.coordinates || null;
      const diva = doc.attrs?.['https://uri=etsi=org/ngsi-ld/default-context/divaNumber']?.value || null;

      const linesAttr = doc.attrs?.['https://uri=etsi=org/ngsi-ld/default-context/lines'];
      const linesValue = linesAttr?.value;
      const linesArray = Array.isArray(linesValue)
        ? linesValue
        : linesValue
        ? [linesValue]
        : [];

      const lines = linesArray.map(lineObj => {
        const lineName = lineObj?.name || null;
        const direction = lineObj?.towards || null;

        const departures = (lineObj?.departures || []).map(dep => {
          const timePlanned = dep?.departureTime?.value?.timePlanned || null;
          const timeReal = dep?.departureTime?.value?.timeReal || null;
          return { timePlanned, timeReal };
        });

        return { name: lineName, direction, departures };
      });

      return { name, coordinates, diva, lines };
    });

    res.json({ stops });
  } catch (err) {
    console.error('Error fetching stops:', err);
    res.status(500).send('Error retrieving stops');
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * POST /update
 * Receives { diva } in the body, calls app.js to run dataController.updateData(diva).
 */
app.post('/update', (req, res) => {
  try {
    const { diva } = req.body;
    if (!diva) {
      return res.status(400).json({ error: 'No diva provided' });
    }

    // Call your script (which calls dataController.updateData(diva))
    dataUpdater.updateData(diva);

    // Respond success
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Could not update data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});