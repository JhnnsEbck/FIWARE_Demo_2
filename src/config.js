// Beinhaltet Orion-LD URL, API-Schlüssel, MongoDB-Konfiguration und andere Umgebungsvariablen

const TEST_REQUEST = 'https://www.wienerlinien.at/ogd_realtime/monitor?diva=60200056&activateTrafficInfo=stoerunglang&monitors.lines.departures.departure.departureTime.countdown';
const NGSI_LD_CONTEXT = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld";
const ORION_BASE_URL = 'http://localhost:1026';
const CSV_PATH = "csv_data/wienerlinien-ogd-haltestellen.csv";

module.exports = {
    TEST_REQUEST,
    NGSI_LD_CONTEXT,
    ORION_BASE_URL,
    CSV_PATH,
};

