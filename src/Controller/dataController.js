// Datenbeschaffung und Kommunikation mit Orion-LD

const dataFetcher = require('../services/dataFetcher');
const orionService = require('../services/orionService');
const TransportData = require('../models/transportData');

async function updateTransportData(req, res) {
    try {
        const fetchedData = await dataFetcher.fetchTransportData();

        // Beispiel: Durchlaufe alle Stationen im API-Response und erstelle TransportData-Objekte
        const transportEntities = fetchedData.map(station => {
            return new TransportData(
                station.id,
                station.name,
                station.location.latitude,
                station.location.longitude,
                station.type,
                station.status
            );
        });

        // Sende die Daten an Orion
        await Promise.all(
            transportEntities.map(entity => orionService.sendDataToOrion(entity))
        );

        res.status(200).json({ message: "Transport data successfully updated in Orion-LD" });
    } catch (error) {
        console.error("Error updating transport data:", error);
        res.status(500).json({ error: "Failed to update transport data" });
    }
}

module.exports = {
    updateTransportData,
};
