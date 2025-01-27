const fs = require('fs');
const csv = require('csv-parser');

async function readDivaNumbers(csvFilePath) {
    return new Promise((resolve, reject) => {
        const divaNumbers = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv({ separator: ';' })) // Passe das Trennzeichen an, falls nötig
            .on('data', (row) => {
                if (row.DIVA) {
                    divaNumbers.push(row.DIVA);
                } else {
                    console.warn("Keine DIVA-Nummer in Zeile gefunden:", row);
                }
            })
            .on('end', () => {
                console.log("CSV-Datei wurde erfolgreich gelesen.");
                resolve(divaNumbers);
            })
            .on('error', (error) => {
                console.error("Fehler beim Lesen der CSV-Datei:", error);
                reject(error);
            });
    });
}

module.exports = {
    readDivaNumbers
};
