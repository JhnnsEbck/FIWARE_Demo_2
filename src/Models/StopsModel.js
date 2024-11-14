// models/StopsModel.js

class StopsModel {
    constructor(monitor) {
        // console.log(monitor.lines[0].departures.departure[0].vehicle.name);
        const ID = monitor.locationStop.properties.attributes.rbl;

        this["@context"] = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld";
        this.id = `Stop:${ID}`;
        this.type = "Stop";
        this.name = {
            type: "Property",
            value: monitor.locationStop.properties.title
        };
        this.location = {
            type: "GeoProperty",
            value: {
                type: "Point",
                coordinates: [
                    monitor.locationStop.geometry.coordinates[0],
                    monitor.locationStop.geometry.coordinates[1]
                ]
            }
        };
        this.lines = {
            type: "Property",
            value: this.processLines(monitor.lines)
        };
    }

    processLines(lines) {
        return lines.map(line => ({
            name: line.name,
            towards: line.towards,
            departures: this.processDepartures(line.departures.departure)
        }));
    }

    processDepartures(departures) {
        return departures.map(departure => ({
            departureTime: {
                type: "Property",
                value: {
                    timePlanned: departure.departureTime.timePlanned,
                    timeReal: departure.departureTime.timeReal,
                    countdown: departure.departureTime.countdown
                }
            },
            vehicle: {
                type: "Property",
                value: {
                    name: departure.vehicle.name,
                    type: departure.vehicle.type,
                    direction: departure.vehicle.direction,
                    barrierFree: departure.vehicle.barrierFree,
                    foldingRamp: departure.vehicle.foldingRamp,
                    trafficjam: departure.vehicle.trafficjam,                    
                    linienId: departure.vehicle.linienId
                }
            }
        }));
    }
}

module.exports = StopsModel;
