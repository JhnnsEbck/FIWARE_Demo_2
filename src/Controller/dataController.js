// Datenbeschaffung und Kommunikation mit Orion-LD
const dataFetcher = require('../services/dataFetcher');
const orionService = require('../services/orionService');
const StopsModel = require('../Models/StopsModel');

async function updateData(req) {
    try {
        const responseData = await dataFetcher.fetchData(req);
        const monitors = responseData.data.monitors;

        // Array für die Entities
        const stopEntities = [];

        // Vorbereiten der Entities mit den Daten aus der Response
        for (const monitor of monitors) {
            const locationStop = monitor.locationStop;
            const lines = monitor.lines;

            for (const line of lines) {
                const departures = line.departures.departure;

                for (const departure of departures) {
                    const entity = new StopsModel(
                        locationStop.properties.name, // ID der Station
                        locationStop.properties.title, // Name der Station
                        locationStop.geometry.coordinates[1], // Breitengrad (Latitude)
                        locationStop.geometry.coordinates[0], // Längengrad (Longitude)
                        line.name, // Linienname
                        line.towards, // Fahrtrichtung
                        departure.departureTime.countdown // Countdown bis zur Abfahrt
                    );

                    stopEntities.push(entity);
                }
            }
        }

        for (const entity of stopEntities) {
            await orionService.sendDataToOrion(entity);
        }

        console.log("Transport data successfully updated in Orion-LD");
    } catch (error) {
        console.error("Error updating transport data:", error);
    }
}

module.exports = {
    updateData,
};
