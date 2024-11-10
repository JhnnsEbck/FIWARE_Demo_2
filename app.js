const axios = require('axios');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function fetchDataAndStore() {
    try {
        await client.connect();
        const database = client.db('wienerlinien');
        const stopsCollection = database.collection('stops');
        const disruptionsCollection = database.collection('disruptions');

        const response = await axios.get('https://www.wienerlinien.at/ogd_realtime/monitor?rbl=256');
        const response2 = await axios.get('https://www.wienerlinien.at/ogd_realtime/monitor?rbl=253');
        const data = response.data;
        const data2 = response2.data;

        // Stop 1 data
        const stop = {
            name: data.data.monitors[0].locationStop.properties.title,
            coordinates: data.data.monitors[0].locationStop.geometry.coordinates,
        };
        const disruptions = data.data.monitors[0].lines.map(line => ({
            stopName: stop.name,  // Add stop name to link disruptions
            lineName: line.name,
            towards: line.towards,
            type: line.type,
            departures: line.departures.departure.map(departure => ({
                timePlanned: departure.departureTime.timePlanned,
                timeReal: departure.departureTime.timeReal,
                countdown: departure.departureTime.countdown,
            }))
        }));

        // Stop 2 data
        const stop2 = {
            name: data2.data.monitors[0].locationStop.properties.title,
            coordinates: data2.data.monitors[0].locationStop.geometry.coordinates,
        };
        const disruptions2 = data2.data.monitors[0].lines.map(line => ({
            stopName: stop2.name,  // Add stop name to link disruptions
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

        // Insert stop and disruption data
        await stopsCollection.insertOne(stop);
        await disruptionsCollection.insertMany(disruptions);
        await stopsCollection.insertOne(stop2);
        await disruptionsCollection.insertMany(disruptions2);

        console.log("Data successfully stored in MongoDB");
    } catch (error) {
        console.error("Error fetching or storing data:", error);
    } finally {
        await client.close();
    }
}

fetchDataAndStore();
