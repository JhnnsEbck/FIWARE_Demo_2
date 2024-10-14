const orion = require('fiware-orion-client');
const ORION_URL = 'http://localhost:1026';

const client = new orion.Client({
    url: ORION_URL
});

async function manageEntities() {
    const entity = {
        id: 'urn:ngsi-ld:Vehicle:001',
        type: 'Vehicle',
        brandName: {
            type: 'Property',
            value: 'Toyota'
        },
        speed: {
            type: 'Property',
            value: 100
        },
        location: {
            type: 'GeoProperty',
            value: {
                type: 'Point',
                coordinates: [40.7128, -74.0060]
            }
        }
    };

    try {
        // Entity erstellen
        await client.createEntity(entity);
        console.log('Entity created');

        // Entity abrufen
        const fetchedEntity = await client.getEntity({
            id: 'urn:ngsi-ld:Vehicle:001',
            type: 'Vehicle'
        });
        console.log('Fetched entity:', fetchedEntity);

        // // Entity aktualisieren
        // await client.updateEntity({
        //     id: 'urn:ngsi-ld:Vehicle:001',
        //     data: {
        //         speed: {
        //             type: 'Property',
        //             value: 120 // Neue Geschwindigkeit
        //         }
        //     }
        // });
        // console.log('Entity updated');

        // // Entity löschen
        // await client.deleteEntity({
        //     id: 'urn:ngsi-ld:Vehicle:001',
        //     type: 'Vehicle'
        // });
        // console.log('Entity deleted');
    } catch (error) {
        console.error('Error:', error);
    }
}

manageEntities();
