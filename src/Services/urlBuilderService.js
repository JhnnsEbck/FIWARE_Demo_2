function buildApiUrl(divaNumber) {
    const baseUrl = 'https://www.wienerlinien.at/ogd_realtime/monitor';
    const params = new URLSearchParams({
        diva: divaNumber,
        activateTrafficInfo: 'stoerunglang'
    });
    return `${baseUrl}?${params.toString()}`;
}

module.exports = {
    buildApiUrl
};
