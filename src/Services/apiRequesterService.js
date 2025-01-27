const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cliProgress = require('cli-progress');
const config = require('../config.js');
const csvWriterService = require('./csvWriterService');

/**
 * Verzögert die Ausführung um die angegebene Zeit.
 * @param {number} ms 
 * @returns {Promise} 
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extrahiert die DIVA-Nummer aus der URL.
 * @param {string} url
 * @returns {string|null}
 */
function extractDivaNumber(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('diva');
    } catch (error) {
        console.error(`Ungültige URL: ${url}`);
        return null;
    }
}

async function processUrls() {
    try {
        const urlsFilePath = config.URL_FILE_PATH;
        const urlsData = fs.readFileSync(urlsFilePath, 'utf-8');
        const urls = urlsData.split('\n').filter(line => line.trim() !== '');

        console.log(`Anzahl der zu verarbeitenden URLs: ${urls.length}`);

        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(urls.length, 0);

        const messages = [];

        for (const url of urls) {
            const diva = extractDivaNumber(url);

            if (!diva) {
                console.warn(`DIVA-Nummer konnte nicht aus der URL extrahiert werden: ${url}`);
                progressBar.increment();
                await delay(2000);
                continue;
            }

            try {
                const response = await axios.get(url, { timeout: 10000 });
                const data = response.data;

                let messageValue = '';
                let messageCode = '';

                if (data.message) {
                    messageValue = data.message.value || '';
                    messageCode = data.message.messageCode || '';
                }

                messages.push({
                    DIVA: diva,
                    messageValue,
                    messageCode
                });
            } catch (error) {
                console.error(`Fehler bei der Anfrage für DIVA ${diva}: ${error.message}`);

                let messageValue = '';
                let messageCode = '';

                if (error.response && error.response.data && error.response.data.message) {
                    messageValue = error.response.data.message.value || '';
                    messageCode = error.response.data.message.messageCode || '';
                } else {
                    messageValue = error.message;
                }

                messages.push({
                    DIVA: diva,
                    messageValue,
                    messageCode
                });
            } finally {
                progressBar.increment();
                await delay(2000);
            }
        }

        progressBar.stop();
        await csvWriterService.writeMessagesToCsv(messages);
    } catch (error) {
        fs.appendFileSync(config.LOGS_FILE_PATH, `Fehler beim Verarbeiten der URLs: ${error.message}\n`);
        //vvccccteenebbhbbdjfvunrvirlidgkukhjcvbcknegb
        console.error(`Fehler beim Verarbeiten der URLs: ${error.message}`);
        throw error;
    }
}

module.exports = {
    processUrls
};
