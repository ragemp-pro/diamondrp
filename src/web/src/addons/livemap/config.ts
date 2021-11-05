export const _MAP_tileURL = "livemap/images/map/";
export const _MAP_iconURL = "livemap/images/icons/";
export const _MAP_currentUri = location.pathname + location.search; 
export var _MAP_currentMarker: Marker;
export var _MAP_markerStore: (google.maps.Polygon | google.maps.Marker)[];

interface Marker extends google.maps.Marker {
    popup: google.maps.InfoWindow
}

export const setMarkerStore = (data: (google.maps.Polygon | google.maps.Marker)[]) => {
    _MAP_markerStore = data
}
export const pushMarkerStore = (data: google.maps.Polygon | google.maps.Marker) => {
    _MAP_markerStore.push(data)
}
export const setCurrentMarker = (item: Marker) => {
    _MAP_currentMarker = item
}