// Interagiert mit der Wiener Linien API, um aktuelle Daten zu laden

const axios = require('axios');
const config = require('../config/config');

async function fetchTransportData() {
    try {
        const response = await axios.get(config.wienerLinienApiUrl, {
            headers: { 'Authorization': `Bearer ${config.apiKey}` }
        });
        const transportData = response.data; // Extrahiere relevante Daten
        return transportData;
    } catch (error) {
        console.error("Error fetching data from Wiener Linien API:", error);
        throw error;
    }
}

module.exports = {
    fetchTransportData,
};
