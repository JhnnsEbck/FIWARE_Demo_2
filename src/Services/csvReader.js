const fs = require('fs');
const csv = require('csv-parser');

async function readDivaNumbers(path) {
    return new Promise((resolve, reject) => {
        const divaNumbers = [];
        fs.createReadStream(path)
            .pipe(csv({ separator: ';' }))
            .on('data', (row) => {
                if (row.DIVA) {
                    divaNumbers.push(row.DIVA);
                }
            })
            .on('end', () => {
                resolve(divaNumbers);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

module.exports = {
    readDivaNumbers
};
