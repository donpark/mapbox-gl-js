
mapboxgl.accessToken = getAccessToken();

var map = new mapboxgl.Map({
    container: 'map',
    minZoom: 13.0,
    maxZoom: 22.0,
    zoom: 13.5,
    center: [45.4385, 12.3338],
    style: '/debug/style.json',
    hash: true,
    maxBounds: [[45.416, 12.300547], [45.462, 12.3685]]
});

map.addControl(new mapboxgl.Navigation());

// map.addSource('geojson', new mapboxgl.GeoJSONSource({data: '/debug/route.json'}));
map.addSource('geojson', new mapboxgl.GeoJSONSource());

// keyboard shortcut for comparing rendering with Mapbox GL native
document.onkeypress = function(e) {
    if (e.charCode === 111 && !e.shiftKey && !e.metaKey && !e.altKey) {
        var center = map.getCenter();
        location.href = "mapboxgl://?center=" + center.lat + "," + center.lng + "&zoom=" + map.getZoom() + "&bearing=" + map.getBearing();
        return false;
    }
};

function getAccessToken() {
    var match = location.search.match(/access_token=([^&\/]*)/);
    var accessToken = match && match[1];

    if (accessToken) {
        localStorage.accessToken = accessToken;
    } else {
        accessToken = localStorage.accessToken;
    }

    return accessToken;
}
