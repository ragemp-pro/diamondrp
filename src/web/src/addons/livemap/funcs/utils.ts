

export function isNumeric(n:number) {
	return !isNaN(parseFloat(n)) && isFinite(n)
}
export var game_1_x = 1972.606;
export var game_1_y = 3817.044;
export var map_1_lng = -60.8258056640625;
export var map_1_lat = 72.06379257078102;
export var game_2_x = -1154.11;
export var game_2_y = -2715.203;
export var map_2_lng = -72.1417236328125;
export var map_2_lat = 48.41572128171852;

export function convertToGame(lat:number, lng:number) {
    var rX = game_1_x + (lng - map_1_lng) * (game_1_x - game_2_x) / (map_1_lng - map_2_lng);
    var rY = game_1_y + (lat - map_1_lat) * (game_1_y - game_2_y) / (map_1_lat - map_2_lat);
    return {
        x: rX,
        y: rY
    };
}

export function convertToGameCoord(lat:number, lng:number) {
    var rX = game_1_x + (lng - map_1_lng) * (game_1_x - game_2_x) / (map_1_lng - map_2_lng);
    var rY = game_1_y + (lat - map_1_lat) * (game_1_y - game_2_y) / (map_1_lat - map_2_lat);
    return {
        x: rX,
        y: rY,
        z: 0
    };
}

export function convertToMap(x:number, y:number) {
    var rLng = map_1_lng + (x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return {
        lat: rLat,
        lng: rLng
    };
}

export function convertToMapGMAP(x:number, y:number) {
    var rLng = map_1_lng + (x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return new google.maps.LatLng(rLat, rLng);
}

export function convertToMapGMAPcoord(coord:{x:number, y:number}) {
    var rLng = map_1_lng + (coord.x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (coord.y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return new google.maps.LatLng(rLat, rLng);
}

export function stringCoordToFloat(coord: { x: number, y: number, z:number }) {
    return {
        x: parseFloat(coord.x),
        y: parseFloat(coord.y),
        z: parseFloat(coord.z),
    };
};
