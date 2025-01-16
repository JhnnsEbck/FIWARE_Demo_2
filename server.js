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
        const database = client.db('wienerlinien');
        const stopsCollection = database.collection('stops');
        const disruptionsCollection = database.collection('disruptions');

        // Fetch all stops
        const stops = await stopsCollection.find().toArray();

        // Attach disruptions to each stop
        for (let stop of stops) {
            stop.disruptions = await disruptionsCollection
                .find({ stopName: stop.name })
                .toArray();
        }

        res.json({ stops });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
