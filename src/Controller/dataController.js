const config = require('../config.js');
const dataFetcher = require('../services/dataFetcher');
const orionService = require('../Services/orionService');
const csvReader = require('../Services/csvReader');
const StopsModel = require('../Models/StopsModel');
const urlBuilder = require('../Services/urlBuilder');

const pLimit = require('p-limit');

async function updateData(req) {
    try {
        const divaNumbers = await csvReader.readDivaNumbers(config.CSV_PATH);
        const limit = pLimit(5);
        const promises = divaNumbers.map(diva => limit(async () => {
            const apiUrl = urlBuilder.buildApiUrl(diva);

            console.log(`API-URL für DIVA ${diva}: ${apiUrl}`);

            // try {
            //     const res = await dataFetcher.fetchData(apiUrl);

            //     const stopEntities = res.data.monitors.map(monitor => {
            //         return new StopsModel(monitor);
            //     });

            //     for (const stopEntity of stopEntities) {
            //         await orionService.sendDataToOrion(stopEntity);
            //     }
            // } catch (error) {
            //     console.error(`Error processing DIVA ${diva}:`, error);
            // }
        }));

        await Promise.all(promises);

        //const res = await dataFetcher.fetchData(req);

        // // Liste für die Entities
        // const stopEntities = res.data.monitors.map(monitor => {
        //     return new StopsModel(monitor);
        // });

        // // Entities an Orion-LD
        // for (const stopEntity of stopEntities) {
        //     await orionService.sendDataToOrion(stopEntity);
        // }

        // console.log("Stops successfully created in Orion-LD");
    } catch (error) {
        console.error("Error updating transport data:", error);
    }
}

module.exports = { updateData };

