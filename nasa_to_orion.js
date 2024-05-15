const fetch = require('node-fetch');
const schedule = require('node-schedule');

const NASA_API_URL = "https://data.nasa.gov/resource/gh4g-9sfh.json";
const ORION_URL = "http://localhost:1026/v2/entities";

async function fetch_nasa_data() {
    try {
        const response = await fetch(NASA_API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from NASA API: ${error.message}`);
        return [];
    }
}

function transform_to_ngsi(nasa_data) {
    return nasa_data.map(item => ({
        "id": "urn:ngsi-ld:Asteroid:" + item['id'],
        "type": "Asteroid",
        "name": {
            "type": "Text",
            "value": item['name'] || 'Unknown'
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [
                    parseFloat(item['geolocation']['longitude']),
                    parseFloat(item['geolocation']['latitude'])
                ]
            }
        }
    }));
}

async function send_to_orion(ngsi_data) {
    const headers = { "Content-Type": "application/json" };
    for (const entity of ngsi_data) {
        try {
            const response = await fetch(ORION_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(entity)
            });
            if (![200, 201, 204].includes(response.status)) {
                console.error(`Error sending data to Orion: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error sending data to Orion: ${error.message}`);
        }
    }
}

async function job() {
    try {
        console.log("Fetching data from NASA API...");
        const nasa_data = await fetch_nasa_data();
        console.log(`Received ${nasa_data.length} records from NASA.`);

        console.log("Transforming data to NGSI format...");
        const ngsi_data = transform_to_ngsi(nasa_data);

        console.log("Sending data to Orion Context Broker...");
        await send_to_orion(ngsi_data);
        console.log("Data sent to Orion.");
    } catch (error) {
        console.error(`Error in job: ${error.message}`);
    }
}

// Schedule the job every hour (you can adjust the interval)
schedule.scheduleJob('0 * * * *', job);
