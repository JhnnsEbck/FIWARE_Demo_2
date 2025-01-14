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

async function updateData(req) {
    try {
        //await requestAll();

        //----------------------------------------------
        
        console.log("Fetching data from:", req);
        const res = await dataFetcher.fetchData(req);

        if (!res.data.monitors) {
            console.log("No data found");
            return;
        }

        console.log("Data fetched successfully");
        console.log("Data:", res);
        
        var messageCode = res.message.messageCode;
        if(messageCode != 1) throw new Error(`Unexpected Message Code: ${res.message.messageCode}`);
        else console.log("Message Code: 1 - OK");


        for (const monitor of res.data.monitors) {
            const stopEntity = new StopsModel(monitor);

            // Prüfen, ob die Entität bereits existiert
            const existingEntity = await orionService.getEntity(stopEntity.id);

            if (existingEntity) {
                // Linien zusammenführen, wenn die Entität existiert
                const updatedEntity = StopsModel.mergeEntities(existingEntity, monitor);
                await orionService.updateEntity(updatedEntity);
            } else {
                // Neue Entität erstellen
                await orionService.sendDataToOrion(stopEntity);
            }
        }


        console.log("Stops successfully created in Orion-LD");
    } catch (error) {
        console.error("Error updating transport data:", error);
    }
}

module.exports = { updateData };

