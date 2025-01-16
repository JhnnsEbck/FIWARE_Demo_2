const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/stops', async (req, res) => {
    try {
        await client.connect();
    
        const db = client.db("orion");
        const collection = db.collection("entities");

        const docs = await collection.find().toArray();
    
        //transform documents into the shape we need
        const stops = docs.map(doc => {
          // get name
          const name = doc.attrs?.['https://uri=etsi=org/ngsi-ld/name']?.value || null;
    
          // get coordinates
          const coordinates = doc.attrs?.location?.value?.coordinates || null;
    
          // get lines attribute, then handle single vs array
          const linesAttr = doc.attrs?.['https://uri=etsi=org/ngsi-ld/default-context/lines'];
          const linesValue = linesAttr?.value;

          const linesArray = Array.isArray(linesValue)
            ? linesValue
            : linesValue
            ? [linesValue]
            : [];
    
          // map over each line object
          const lines = linesArray.map(lineObj => {
            const lineName = lineObj?.name || null;
            const direction = lineObj?.towards || null;
    
            // departures is an array of departure objects
            const departures = (lineObj?.departures || []).map(dep => {
              const timePlanned = dep?.departureTime?.value?.timePlanned || null;
              const timeReal = dep?.departureTime?.value?.timeReal || null;
    
              return { timePlanned, timeReal };
            });
    
            return { name: lineName, direction, departures };
          });
    
          // Return the final shape for each stop
          return { name, coordinates, lines };
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
