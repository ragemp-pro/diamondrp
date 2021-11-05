import { mapInit, createMarker, map } from "./map";
import { MarkerObject, Coordinates } from "./objects";
import { MarkerTypes } from "./markers";
import { _MAP_currentMarker, setCurrentMarker, pushMarkerStore } from "../config";
import { convertToMapGMAP, convertToGameCoord } from "./utils";
import { gangWarTerData, GangPosition } from "../../../../../declaration/gangwar";
import { fractionUtil } from "../../../../../util/fractions";

var _invervalId;
var _isLive = false;

export interface BlipObj {
    new_pos?: { x: number; y: number; z: number; };
    markerId?: number;
    pos: {
        x: number;
        y: number;
        z: number;
    };
    type: number;
    description: string;
    name: string;
}



export var _blips: {
    [type: number]: BlipObj[]} = {};
export var _blipCount = 0;
export const blipCountPlus = () => {
    _blipCount++;
}
export const blipCountMinus = () => {
    _blipCount--;
}
var _showBlips = true;
var _isConnected = false;
var _trackPlayer = null;
var playerCount = 0;
var _overlays:any[] = [];
export var _disabledBlips:number[] = [];

export function globalInit() {
    mapInit("map-canvas");
    initPage();
    // initBlips();

    for (var i = 0; i < _overlays.length; i++) {
        var o = _overlays[i];
        $("#overlaySelect").append(`<option value="${i}">${o.name}</option>`);
    }

    fetch('http://' + location.hostname + ':3400/warzones').then(datas => {
        datas.json().then((dataq: gangWarTerData[]) => {
            console.log(dataq)
            dataq.map(data => {
                drawWarZone({ 
                    pos: data.position,
                    name: data.name,
                    desc: data.ownername,
                    attack: data.attack,
                    color: data.color
                })
            })
        })
    })
    fetch('http://' + location.hostname + ':3400/resps').then(datas => {
        datas.json().then((dataq: GangPosition[]) => {
            console.log(dataq)
            dataq.map(data => {
                createBlip({ 
                    pos: {x: data.x, y: data.y, z: data.z},
                    name: fractionUtil.getFractionName(data.fractionid),
                    type: 84,
                    description: ""
                })
            })
        })
    })
}
// window.createBlip = createBlip;

function initPage() {
    $(window).on("load resize", function () {
        $(".map-tab-content").height((($("#tab-content").height() - $(".page-title-1").height()) - ($("#map-overlay-global-controls").height() * 4.2)));
    });

    var $myGroup = $('#control-wrapper');
    $myGroup.on('show.bs.collapse', '.collapse', function () {
        console.log("hidding?");
        // @ts-ignore
        $myGroup.find('.collapse.show').collapse('hide');
    });

}




export function createBlip(blip: { markerId?:number,pos: { x: number, y: number, z: number }, type: number, description: string, name: string }) {


    let obj = new MarkerObject(blip.name, new Coordinates(blip.pos.x, blip.pos.y, blip.pos.z), MarkerTypes[blip.type], blip.description, "");

    if (_blips[blip.type] == null) {
        _blips[blip.type] = [];
    }

    // @ts-ignore
    blip.markerId = createMarker(false, false, obj) - 1;

    _blips[blip.type].push(blip);
    _blipCount++;
    return blip;
}


function hexToRgbA(hex:string) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        // @ts-ignore
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
    }
    throw new Error('Bad Hex');
}


export function drawWarZone(item: { pos: { x: number, y: number, z: number, d: number }, desc?: string, name?: string, attack?: boolean, color: string, drag?:boolean }) {
    // console.log(convertToMap(item.pos.x, item.pos.y));
    let north = convertToMapGMAP(item.pos.x - (item.pos.d / 2), item.pos.y + (item.pos.d / 2));
    let south = convertToMapGMAP(item.pos.x + (item.pos.d / 2), item.pos.y + (item.pos.d / 2));
    let east = convertToMapGMAP(item.pos.x - (item.pos.d / 2), item.pos.y - (item.pos.d / 2));
    let west = convertToMapGMAP(item.pos.x + (item.pos.d / 2), item.pos.y - (item.pos.d / 2));


    let html = '';

    if (item.desc) {
        html += '<div class="row info-body-row">' + item.desc + "</div>";
    }
    let infoContent = '<div class="info-window"><div class="info-header-box"><div class="info-header">' + item.name + '</div></div><div class="clear"></div><div id=info-body>' + html + "</div></div>";
    let infoBox = new google.maps.InfoWindow({
        content: infoContent
    });
    const baseColor = hexToRgbA(item.color)
    let marker = new google.maps.Polygon({
        strokeColor: '#FFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 0.0,
        fillColor: 'rgba(' + baseColor +',1)',
        fillOpacity: 0.5,
        map,
        draggable: !!item.drag,
        paths: [
            north,
            south,
            west,
            east,
        ], 
        // @ts-ignore
        popup: infoBox,
    });
    if (item.attack){
        setInterval(() => {
            marker.setOptions({ fillColor: marker.get("fillColor") == 'rgba(' + baseColor + ',0.5)' ? 'rgba(' + baseColor + ',1)' : 'rgba(' + baseColor +',0.5)'})
        }, 1000)
    }
    // createBlip({type:84,pos:item.pos,name:"Территория",description:"Контроллирует: Хуй"})
    let infowindow = new google.maps.InfoWindow({
        content: ``
    });
    pushMarkerStore(marker)
    google.maps.event.addListener(marker, 'click', function (event) {
        if (_MAP_currentMarker) {
            _MAP_currentMarker.popup.close();
        }
        
        infowindow.setContent(`<div class="info-window" style="color:black;font-size: 20px;">
        <div id=info-body>
            <b>Название</b>: ${item.name}<br/>
            <b>Контроллирует</b>: ${item.desc}<br/>
        </div>
        </div>`);
        
        infowindow.setPosition(event.latLng);
        infowindow.open(map, marker);
        // @ts-ignore
        setCurrentMarker({popup: infowindow})
    });

    
    
    return marker
}

let list: { id: number, x: number, y: number, d:number}[] = [];

function drawWarZoneTest(id:number,x:number,y:number,z:number,d:number){
    if(list.find(item => item.id == id)) return console.error('Данный ID уже есть');
    let marker = drawWarZone({ pos: { x, y, z, d }, desc: "Точка " + id, name: "Точка " + id, color: "#fc0317", drag: true });
    list.push({id,x,y,d});
    google.maps.event.addListener(marker, 'drag', function (event) {
        // console.log(event);
        // console.log(marker.dg.bounds);
        let crd = convertToGameCoord(marker.dg.bounds.Ka, marker.dg.bounds.Ia)
        crd.x+=(d/2)
        crd.y+=(d/2)
        // console.log(crd);
        // console.log('++++++++++++++++++++++++++++++++++++++++')
        // console.log(convertToGameCoord(event.latLng.lat(), event.latLng.lng()))
        let q = list.find(item => item.id == id)
        q.x = crd.x;
        q.y = crd.y;
        marker.setOptions({ fillColor: 'rgba(0, 0, 0 ,1)' })
    });
}

function saveTestData(){
    console.log(JSON.stringify(list))
}
function loadTestData(data:any){
    let q = typeof data == "string" ? JSON.parse(data) : data
    q.map((item:any) => {
        drawWarZoneTest(item.id, item.x, item.y, item.z, item.d)
    })
}



window.drawWarZoneTest = drawWarZoneTest
window.saveTestData = saveTestData
window.loadTestData = loadTestData