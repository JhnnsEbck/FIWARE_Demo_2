const config = require('../config.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const csvWriter = createCsvWriter({
    path: path.resolve(config.CSV_OUTPUT_PATH),
    header: [
        { id: 'DIVA', title: 'DIVA' },
        { id: 'messageValue', title: 'MessageValue' },
        { id: 'messageCode', title: 'MessageCode' }
    ]
});

/**
 * @param {Array} messages
 */
async function writeMessagesToCsv(messages) {
    console.log(csvWriter.path);
    try {
        await csvWriter.writeRecords(messages);
        console.info(`Messages wurden erfolgreich in die CSV-Datei geschrieben: ${csvWriter.path}`);
    } catch (error) {
        console.error('Fehler beim Schreiben der CSV-Datei:', error);
    }
}

module.exports = {
    writeMessagesToCsv
};
