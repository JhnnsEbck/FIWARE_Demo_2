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
        throw error; // Anderen Fehler weiterwerfen
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
async function createEntity(entity) {
    try {
        const response = await axios.post(`${config.ORION_BASE_URL}/ngsi-ld/v1/entities/`, entity, {
            headers: {
                'Content-Type': 'application/ld+json'
            }
        });
        console.log(`Entity ${entity.id} created in Orion-LD. Response: ${response.status}`);
    } catch (error) {
        console.error(`Error creating entity ${entity.id} in Orion-LD:`, error.response ? error.response.data : error);
    }
}

// Upsert-Logik: Prüfen, ob eine Entität existiert, und entsprechend handeln
async function sendDataToOrion(entity) {
    try {
        // Prüfen, ob die Entität existiert
        const existingEntity = await getEntity(entity.id);

        if (existingEntity) {
            // Wenn die Entität existiert, Attribute aktualisieren
            const updatedAttributes = { ...entity }; // Optional: Anpassung der zu aktualisierenden Attribute
            delete updatedAttributes.id; // ID sollte nicht bei einem Update enthalten sein
            delete updatedAttributes.type; // Typ sollte ebenfalls nicht enthalten sein
            await updateEntity(entity.id, updatedAttributes);
        } else {
            // Wenn die Entität nicht existiert, erstellen
            await createEntity(entity);
        }
    } catch (error) {
        console.error(`Error in sendDataToOrion for entity ${entity.id}:`, error.message);
    }
}

module.exports = {
    getEntity,
    updateEntity,
    createEntity,
    sendDataToOrion
};