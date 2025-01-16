const axios = require('axios');
const urlBuilder = require('../Services/urlBuilderService');

async function fetchData(divaNumber) {
    const apiUrl = urlBuilder.buildApiUrl(divaNumber);
    console.log("Fetching data from:", apiUrl);
    
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching data from Wiener Linien API:", error);
        throw error;
    }
}

module.exports = {
    fetchData,
};
