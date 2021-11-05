import { MarkerTypeInterface } from "./markers";

export class EuclideanProjection {
    pixelOrigin_: google.maps.Point
    offsetLng: number;
    scaleLng: number;
    pixelsPerLonDegree_: number;
    scaleLat: number;
    offsetLat: number;
    pixelsPerLonRadian_: number;
    constructor(){
        var EUCLIDEAN_RANGE = 256;
        this.pixelOrigin_ = new google.maps.Point(EUCLIDEAN_RANGE / 2, EUCLIDEAN_RANGE / 2);
        this.pixelsPerLonDegree_ = EUCLIDEAN_RANGE / 360;
        this.pixelsPerLonRadian_ = EUCLIDEAN_RANGE / (2 * Math.PI);
        this.scaleLat = 2;
        this.scaleLng = 2;
        this.offsetLat = 0;
        this.offsetLng = 0;
    }
    fromLatLngToPoint(latLng: google.maps.LatLng, opt_point: google.maps.Point) {
        var point = opt_point || new google.maps.Point(0, 0);
        var origin = this.pixelOrigin_;
        point.x = (origin.x + (latLng.lng() + this.offsetLng) * this.scaleLng * this.pixelsPerLonDegree_);
        point.y = (origin.y + (-1 * latLng.lat() + this.offsetLat) * this.scaleLat * this.pixelsPerLonDegree_);
        return point;
    }
    fromPointToLatLng(point:{x:number,y:number}) {
        var me = this;
        var origin = me.pixelOrigin_;
        var lng = (((point.x - origin.x) / me.pixelsPerLonDegree_) / this.scaleLng) - this.offsetLng;
        var lat = ((-1 * (point.y - origin.y) / me.pixelsPerLonDegree_) / this.scaleLat) - this.offsetLat;
        return new google.maps.LatLng(lat, lng, true);
    }
}



export class Coordinates {
    x: number;
    y: number;
    z: number;
    constructor(x:number,y:number,z:number){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}



export class MarkerObject {
    reference: string;
    position: Coordinates;
    type: MarkerTypeInterface;
    description: string;
    data: string;
    constructor(reference: string, position: Coordinates, type: MarkerTypeInterface, description:string, data:string){
        this.reference = reference;
        this.position = position;
        this.type = type;
        this.description = description;
        this.data = data;
    }
}


