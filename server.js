const http = require('http');
const url = require('url');
const fs = require('fs');
const fetch = require('node-fetch');
const { fetch_data_from_orion } = require('./orion_helper.js'); // Assuming orion_helper.js exists and exports fetch_data_from_orion function

// NASA to Orion integration
const NASA_API_URL = "https://data.nasa.gov/resource/gh4g-9sfh.json";
const ORION_URL = "http://localhost:1026/ngsi-ld/v1/entities";
const NGSI_LD_CONTEXT = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld";

function fetch_nasa_data() {
    return fetch(NASA_API_URL)
        .then(response => response.json());
}

function transform_to_ngsi(nasa_data) {
    const ngsi_entities = [];
    for (const item of nasa_data) {
        if ('geolocation' in item && 'latitude' in item['geolocation'] && 'longitude' in item['geolocation']) {
            const ngsi_entity = {
                "id": `urn:ngsi-ld:Asteroid:${item['id']}`,
                "type": "Asteroid",
                "@context": NGSI_LD_CONTEXT,
                "name": {
                    "type": "Property",
                    "value": item['name'] || 'Unknown'
                },
                "mass": {
                    "type": "Property",
                    "value": item['mass'] || 'Unknown'
                },
                "fall": {
                    "type": "Property",
                    "value": item['fall'] || 'Unknown'
                },
                "year": {
                    "type": "Property",
                    "value": item['year'] || 'Unknown'
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
            };
            ngsi_entities.push(ngsi_entity);
        }
    }
    return ngsi_entities;
}

async function send_or_update_entity(entity) {
    const entity_id = entity['id'];
    const headers = { "Content-Type": "application/ld+json", "Accept": "application/ld+json" };
    try {
        const get_response = await fetch(`${ORION_URL}/${entity_id}`, { headers });

        if (get_response.status === 200) {
            const update_payload = {
                "@context": NGSI_LD_CONTEXT,
                "location": {
                    "type": "GeoProperty",
                    "value": entity["location"]["value"]
                }
            };

            if ('name' in await get_response.json()) {
                update_payload["name"] = entity["name"];
            }

            const update_headers = { "Content-Type": "application/ld+json" };
            const update_response = await fetch(`${ORION_URL}/${entity_id}/attrs`, {
                method: 'PATCH',
                body: JSON.stringify(update_payload),
                headers: update_headers
            });

            if (![204, 200].includes(update_response.status)) {
                console.error(`Error updating entity ${entity_id}: ${update_response.status}`);
                console.error(`Response: ${await update_response.text()}`);
            } else {
                console.log(`Successfully updated entity ${entity_id}`);
            }
        } else if (get_response.status === 404) {
            const create_headers = { "Content-Type": "application/ld+json" };
            const create_response = await fetch(ORION_URL, {
                method: 'POST',
                body: JSON.stringify(entity),
                headers: create_headers
            });

            if (![201, 204].includes(create_response.status)) {
                console.error(`Error creating entity ${entity_id}: ${create_response.status}`);
                console.error(`Response: ${await create_response.text()}`);
            } else {
                console.log(`Successfully created entity ${entity_id}`);
            }
        } else {
            console.error(`Unexpected status code ${get_response.status} when checking entity existence`);
            console.error(await get_response.text());
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function send_to_orion(ngsi_data) {
    for (const entity of ngsi_data) {
        await send_or_update_entity(entity);
    }
}

async function fetch_and_send_data_to_orion() {
    while (true) {
        try {
            const nasa_data = await fetch_nasa_data();
            const ngsi_data = transform_to_ngsi(nasa_data);
            await send_to_orion(ngsi_data);
            await new Promise(resolve => setTimeout(resolve, 3600000)); // Fetch data every hour, adjust as needed (3600000 milliseconds)
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

// Start the data fetching
fetch_and_send_data_to_orion().catch(error => console.error(`Error: ${error.message}`));

// HTTP server part
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('index.html').pipe(res);
    } else if (parsedUrl.pathname === '/data') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        fetch_data_from_orion(ORION_URL)
            .then(data => {
                console.log("Data fetched from Orion:", data); // Log the data
                res.end(JSON.stringify(data));
            })
            .catch(error => {
                console.error(`Error: ${error.message}`);
                res.end(JSON.stringify({ error: error.message }));
            });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(8000, () => {
    console.log('Server running at http://localhost:8000/');
});
