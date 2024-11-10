const axios = require('axios');
const config = require('../config');

async function sendDataToOrion(entity) {
    try {
        const response = await axios.post(`${config.ORION_BASE_URL}/ngsi-ld/v1/entities/`, entity, {
            headers: {
                'Content-Type': 'application/ld+json'
            },
            
        });
        console.log(`Entity ${entity.id} created in Orion-LD. Response: ${response.status}`);
    } catch (error) {
        console.error(`Error sending entity ${entity.id} to Orion-LD:`, error.response ? error.response.data : error);
    }
}

module.exports = {
    sendDataToOrion,
};
