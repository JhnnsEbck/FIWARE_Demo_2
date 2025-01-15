const axios = require('axios');
const urlBuilder = require('../Services/urlBuilderService');
async function fetchData(req, divaNumber) {
    const apiUrl = urlBuilder.buildApiUrl(divaNumber);
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
