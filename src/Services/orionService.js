const axios = require('axios');
const config = require('../config');

// Prüfen, ob eine Entität existiert
async function getEntity(entityId) {
    try {
        const response = await axios.get(`${config.ORION_BASE_URL}/ngsi-ld/v1/entities/${entityId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // Entity existiert nicht
        }
        throw error;
    }
}

// Aktualisieren einer Entität
async function updateEntity(entityId, updatedAttributes) {
    try {
        const response = await axios.patch(`${config.ORION_BASE_URL}/ngsi-ld/v1/entities/${entityId}/attrs`, updatedAttributes, {
            headers: {
                'Content-Type': 'application/ld+json'
            }
        });
        console.log(`Entity ${entityId} updated in Orion-LD. Response: ${response.status}`);
    } catch (error) {
        console.error(`Error updating entity ${entityId} in Orion-LD:`, error.response ? error.response.data : error);
    }
}

// Neue Entität erstellen
async function sendDataToOrion(entity) {
    try {
        const response = await axios.post(`${config.ORION_BASE_URL}/ngsi-ld/v1/entities/`, entity, {
            headers: {
                'Content-Type': 'application/ld+json'
            }
        });
        console.log(`Entity ${entity.id} created in Orion-LD. Response: ${response.status}`);
    } catch (error) {
        console.error(`Error sending entity ${entity.id} to Orion-LD:`, error.response ? error.response.data : error);
    }
}

module.exports = {
    getEntity,
    updateEntity,
    sendDataToOrion
};
