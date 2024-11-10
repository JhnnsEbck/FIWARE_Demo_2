// Definiert das Modell für die Daten der Verkehrsmittel und Haltestellen.

class TransportData {
    constructor(id, name, latitude, longitude, transportType, status) {
        this.id = id;
        this.type = "TransportStation"; // Orion-LD Entity Type
        this.name = { value: name, type: "Text" };
        this.location = {
            type: "GeoProperty",
            value: {
                type: "Point",
                coordinates: [longitude, latitude],
            },
        };
        this.transportType = { value: transportType, type: "Text" };
        this.status = { value: status, type: "Text" };
    }
}

module.exports = TransportData;
