// Datenbeschaffung und Kommunikation mit Orion-LD
const dataFetcher = require('../services/dataFetcher');
const orionService = require('../Services/orionService');
const StopsModel = require('../Models/StopsModel');

async function updateData(req) {
    try {
        const res = await dataFetcher.fetchData(req);
        
        // Liste für die Entities
        const stopEntities = res.data.monitors.map(monitor => {
            return new StopsModel(monitor);
        });

        // Entities an Orion-LD
        for (const stopEntity of stopEntities) {
            await orionService.sendDataToOrion(stopEntity);
        }

        console.log("Transport data successfully updated in Orion-LD");
    } catch (error) {
        console.error("Error updating transport data:", error);
    }
}

module.exports = { updateData };

