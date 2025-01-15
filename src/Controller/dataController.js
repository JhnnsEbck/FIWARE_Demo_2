const config = require('../config.js');
const dataFetcher = require('../Services/dataFetcherService.js');
const orionService = require('../Services/orionService');
const csvReader = require('../Services/csvReaderService.js');
const StopsModel = require('../Models/StopsModel');
const urlBuilder = require('../Services/urlBuilderService');
const apiRequesterService = require('../Services/apiRequesterService');

const fs = require('fs');
const path = require('path');

async function requestAll(){
    const divaNumbers = await csvReader.readDivaNumbers(config.CSV_INPUT_PATH);
    console.log("DIVA-Nummern:", divaNumbers);
    console.log(`Anzahl der gefundenen DIVA-Nummern: ${divaNumbers.length}`);
    const outputFilePath = config.URL_FILE_PATH;

    fs.writeFileSync(outputFilePath, '');

    for (const diva of divaNumbers) {
        const apiUrl = urlBuilder.buildApiUrl(diva);
        console.log(`API-URL für DIVA ${diva}: ${apiUrl}`);
        fs.appendFileSync(outputFilePath, `${apiUrl}\n`);
    }

    console.log(`Alle API-URLs wurden in die Datei geschrieben: ${outputFilePath}`);
    await apiRequesterService.processUrls();
}

async function fetchStopData(req, divaNumber) {
    console.log("Fetching data from:", req);
    const res = await dataFetcher.fetchData(req, divaNumber);

    if (!res.data.monitors) {
        console.log("No data found");
        return;
    }
    console.log("Data fetched successfully");
    console.log("Data:", res);
                    
    var messageCode = res.message.messageCode;

    if(messageCode != 1) throw new Error(`Unexpected Message Code: ${res.message.messageCode}`);
    else console.log("Message Code: 1 - OK");
    
    return res;
}

function groupMonitorsByStopId(monitors) {
    const grouped = monitors.reduce((acc, monitor) => {
        const stopId = monitor.locationStop.properties.attributes.rbl;

        if (!acc[stopId]) {
            acc[stopId] = [];
        }

        acc[stopId].push(monitor);
        return acc;
    }, {});

    return grouped;
}

async function updateData(req, divaNumber) {
    try {
        //await requestAll();
        
        const res = await fetchStopData(req, divaNumber);
        const groupedMonitors = groupMonitorsByStopId(res.data.monitors);

        const stopEntities = Object.entries(groupedMonitors).map(([stopId, monitors]) => {
            return new StopsModel(monitors, divaNumber);
        });

        // Entities an Orion-LD
        for (const stopEntity of stopEntities) {
            await orionService.sendDataToOrion(stopEntity);
        }

    } catch (error) {
        console.error("Error updating transport data:", error);
    }
}

module.exports = { updateData };

