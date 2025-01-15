function buildApiUrl(divaNumber) {
    const baseUrl = 'https://www.wienerlinien.at/ogd_realtime/monitor';
    const params = new URLSearchParams({
        diva: divaNumber,
        activateTrafficInfo: 'stoerunglang'
    });
    const url = `${baseUrl}?${params.toString()}`;
    console.log(`Generated API URL: ${url}`); // Debug-Ausgabe
    console.log(typeof url); // Debug-Ausgabe
    return url;

}

module.exports = {
    buildApiUrl
};
