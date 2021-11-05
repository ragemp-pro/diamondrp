import { methods } from "./methods";

export const gis = {
  /**
  * All coordinates expected EPSG:4326
  * @param {Array} start Expected [lon, lat]
  * @param {Array} end Expected [lon, lat]
  * @return {number} Distance - meter.
  */
  calculateDistance: function(start:number[], end:number[]) {
    let lat1 = methods.parseFloat(start[1]),
        lon1 = methods.parseFloat(start[0]),
        lat2 = methods.parseFloat(end[1]),
        lon2 = methods.parseFloat(end[0]);

    return gis.sphericalCosinus(lat1, lon1, lat2, lon2);
  },

  /**
  * All coordinates expected EPSG:4326
  * @param {number} lat1 Start Latitude
  * @param {number} lon1 Start Longitude
  * @param {number} lat2 End Latitude
  * @param {number} lon2 End Longitude
  * @return {number} Distance - meters.
  */
  sphericalCosinus: function(lat1:number, lon1:number, lat2:number, lon2:number) {
    let radius = 6371e3; // meters
    let dLon = gis.toRad(lon2 - lon1);
        lat1 = gis.toRad(lat1);
        lat2 = gis.toRad(lat2);
    let distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)) * radius;

    return distance;
  },

  /**
  * @param {Array} coord Expected [lon, lat] EPSG:4326
  * @param {number} bearing Bearing in degrees
  * @param {number} distance Distance in meters
  * @return {Array} Lon-lat coordinate.
  */
  createCoord: function(coord:number[], bearing:number, distance:number) {
    /** http://www.movable-type.co.uk/scripts/latlong.html
    * φ is latitude, λ is longitude, 
    * θ is the bearing (clockwise from north), 
    * δ is the angular distance d/R; 
    * d being the distance travelled, R the earth’s radius*
    **/
    let 
      radius = 6371e3, // meters
      δ = Number(distance) / radius, // angular distance in radians
      θ = gis.toRad(Number(bearing));
    let
      φ1 = gis.toRad(coord[1]),
      λ1 = gis.toRad(coord[0]);

    let φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + 
      Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));

    let λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ)*Math.cos(φ1),
      Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
    // normalise to -180..+180°
    λ2 = (λ2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; 

    return [gis.toDeg(λ2), gis.toDeg(φ2)];
  },
  /**
   * All coordinates expected EPSG:4326
   * @param {Array} start Expected [lon, lat]
   * @param {Array} end Expected [lon, lat]
   * @return {number} Bearing in degrees.
   */
  getBearing: function(start:number[], end:number[]){
    var
      startLat = gis.toRad(start[1]),
      startLong = gis.toRad(start[0]),
      endLat = gis.toRad(end[1]),
      endLong = gis.toRad(end[0]),
      dLong = endLong - startLong;

    let dPhi = Math.log(Math.tan(endLat/2.0 + Math.PI/4.0) / 
      Math.tan(startLat/2.0 + Math.PI/4.0));

    if (Math.abs(dLong) > Math.PI) {
      dLong = (dLong > 0.0) ? -(2.0 * Math.PI - dLong) : (2.0 * Math.PI + dLong);
    }

    return (gis.toDeg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
  },
  toDeg: function(n:number) { return n * 180 / Math.PI; },
  toRad: function(n:number) { return n * Math.PI / 180; }
};