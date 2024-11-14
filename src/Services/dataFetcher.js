const axios = require('axios');

async function fetchData(req) {
    try {
        const response = await axios.get(req);
        return response.data;
    } catch (error) {
        console.error("Error fetching data from Wiener Linien API:", error);
        throw error;
    }
}

module.exports = {
    fetchData,
};
