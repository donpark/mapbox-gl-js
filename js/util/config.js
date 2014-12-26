'use strict';

if (typeof window !== 'undefined' && typeof window.mapboxglConfig === 'object') {
    module.exports = window.mapboxglConfig;
} else {
    module.exports = {
        HTTP_URL: 'http://a.tiles.mapbox.com/v4',
        HTTPS_URL: 'https://a.tiles.mapbox.com/v4',
        FORCE_HTTPS: false,
        REQUIRE_ACCESS_TOKEN: true
    };
}
