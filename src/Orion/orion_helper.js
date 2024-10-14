import fetch from 'node-fetch';

export async function fetch_data_from_orion(orion_url) {
    try {
        // Headers for NGSI-LD requests
        const headers = { "Accept": "application/ld+json" };

        // Fetch data from Orion-LD
        const response = await fetch(`${orion_url}?type=Asteroid`, {
            headers,
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch data from Orion: ${response.statusText}`);
        }

        const data = await response.json();
        const processed_data = [];

        // Process the data to extract relevant fields
        for (const item of data) {
            const coordinates = item?.location?.value?.coordinates || [];
            if (coordinates.length === 2) {
                processed_data.push({
                    name: item["https://uri.etsi.org/ngsi-ld/name"]?.value || "Unknown",
                    latitude: coordinates[1],
                    longitude: coordinates[0],
                    url: "#" // Add your URL or logic here
                });
            }
        }

        return processed_data;
    } catch (error) {
        console.error(`Error fetching data from Orion: ${error.message}`);
        return [];
    }
}