const axios = require('axios');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function fetchDataAndStore() {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('wienerlinien');
        const stopsCollection = database.collection('stops');
        const disruptionsCollection = database.collection('disruptions');

        // Fetch data from Wiener Linien API
        const response = await axios.get('https://www.wienerlinien.at/ogd_realtime/monitor?rbl=253');
        const data = response.data;

        // Extract stop and disruption data
        const stop = {
            name: data.data.monitors[0].locationStop.properties.title,
            coordinates: data.data.monitors[0].locationStop.geometry.coordinates,
        };
        const disruptions = data.data.monitors[0].lines.map(line => ({
            lineName: line.name,
            towards: line.towards,
            type: line.type,
            departures: line.departures.departure.map(departure => ({
                timePlanned: departure.departureTime.timePlanned,
                timeReal: departure.departureTime.timeReal,
                countdown: departure.departureTime.countdown,
            }))
        }));

        // Clear old data
        await stopsCollection.deleteMany({});
        await disruptionsCollection.deleteMany({});

        // Store data in MongoDB
        await stopsCollection.insertOne(stop);
        await disruptionsCollection.insertMany(disruptions);

        console.log("Data successfully stored in MongoDB");
    } catch (error) {
        console.error("Error fetching or storing data:", error);
    } finally {
        await client.close();
    }
}

fetchDataAndStore();
