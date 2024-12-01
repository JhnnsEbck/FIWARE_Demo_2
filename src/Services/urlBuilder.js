function buildApiUrl(divaNumber) {
    const baseUrl = 'https://www.wienerlinien.at/ogd_realtime/monitor';
    const params = new URLSearchParams({
        diva: divaNumber,
        activateTrafficInfo: 'stoerunglang',
        'monitors.lines.departures.departure.departureTime.countdown': ''
    });
    return `${baseUrl}?${params.toString()}`;
}

module.exports = {
    buildApiUrl
};
