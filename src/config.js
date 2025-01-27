const TEST_REQUEST = 'https://www.wienerlinien.at/ogd_realtime/monitor?diva=60200035&activateTrafficInfo=stoerunglang&monitors.lines.departures.departure.departureTime.countdown';
const NGSI_LD_CONTEXT = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld";
const ORION_BASE_URL = 'http://localhost:1026';
const CSV_INPUT_PATH = "data/wienerlinien-ogd-haltestellen.csv";
const CSV_OUTPUT_PATH = "output/response-messages.csv";
const URL_FILE_PATH = "output/urls.txt";
const LOGS_FILE_PATH = "Logs/req-logs.txt";

module.exports = {
    TEST_REQUEST,
    NGSI_LD_CONTEXT,
    ORION_BASE_URL,
    CSV_INPUT_PATH,
    URL_FILE_PATH,
    CSV_OUTPUT_PATH,
    LOGS_FILE_PATH,
};

