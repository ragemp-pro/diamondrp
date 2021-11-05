import { createBlip, _blips, BlipObj, blipCountMinus, _blipCount } from "./init";
import { UserMap } from "../../../../../util/mobiledata";
import { MarkerTypes } from "./markers";
import { _MAP_markerStore } from "../config";
import { convertToMapGMAP } from "./utils";
import { vipStatus } from "../../../../../util/vip";
import { map } from "./map";
import { fractionUtil } from "../../../../../util/fractions";

var queryDict:{[param:string]:string} = {}
location.search.substr(1).split("&").forEach(function (item) { queryDict[item.split("=")[0]] = item.split("=")[1] });

let players = new Map<number, number>()
let playersData = new Map<number, UserMap>()
let playersPopup = new Map<number, UserMap>()
// @ts-ignore
window.playersPopup = playersPopup;
if (queryDict.adminshow){
    $(document).ready(() => {
        setTimeout(() => {
            $("#playerListBlock").show(500);
            $("#playerListHeader").click(() => {
                $("#playerList").slideToggle(200)
            })
        }, 500)
    })
    setInterval(() => {
        fetch('/mobile/playersPosition?login=' + queryDict.login + "&token=" + queryDict.token).then(datas => {
            datas.json().then((datas: {err?:string,players:UserMap[]}) => {
                if(datas.err) return console.error(datas.err);
                let currentids:number[] = []
                datas.players.map(data => {
                    
                    let popupContent = `
                    <div class="info-window" style="color:black;font-size: 15px;">
                        <div id=info-body>
                        Игрок: (${data.id}) ${data.name}<br />
                        Измерение/Отыгранное за сутки время: ${data.d} / ${data.playedTime} ч.<br />
                        Social Club: <a href="https://ru.socialclub.rockstargames.com/member/${data.social}/" target="_blank">${data.social} <img style="width:30px;height:30px;" src="https://a.rsg.sc//n/${data.social.toLowerCase()}" /></a><br />
                        IP Текущий / IP Регистрации: <a href="https://ru.infobyip.com/ip-${data.ip}.html" target="_blank">${data.ip}</a> / <a href="https://ru.infobyip.com/ip-${data.ip_reg}.html" target="_blank">${data.ip_reg}</a><br />
                        Наличка/Банк: $${data.money} / $${data.bank} (${data.bankcard})<br />
                        VIP: ${data.vip && vipStatus.getVipStatusData(data.vip) ? vipStatus.getVipStatusData(data.vip).name : data.vip}<br />
                        Фракция: ${fractionUtil.getFractionName(data.fraction)}<br />
                        Админ/Хелпер уровень: ${data.adminLvl} / ${data.helperLvl}<br />
                        HP/AP: ${data.hp.toFixed(2)}% / ${data.ap.toFixed(2)}%<br />
                        </div>
                    </div>`
                    if(players.has(data.id)){
                        var marker = <any>_MAP_markerStore[players.get(data.id)];
                        marker.setPosition(convertToMapGMAP(data.position.x, data.position.y));
                        // marker.setIcon({ url: `https://a.rsg.sc//n/${data.social.toLowerCase()}`, scaledSize:{width:22,height:22}});
                        // marker.icon.url = `https://a.rsg.sc//n/${data.social.toLowerCase()}`;
                        marker.popup.setContent(popupContent)
                        playersPopup.set(data.id, marker.popup)
                    } else {
                        
                        players.set(data.id, createBlip({
                            pos: data.position,
                            type: 6,
                            description: "Загрузка данных",
                            name: `${data.name} (${data.id})`
                        }).markerId);
                    }
                    playersData.set(data.id, data)
                    currentids.push(data.id)
                })
                playersData.forEach(obj => {
                    if (!currentids.includes(obj.id)) {
                        clearMarker(players.get(obj.id));
                        players.delete(obj.id);
                        playersData.delete(obj.id);
                        playersPopup.delete(obj.id);
                    }
                })
                $('#playerList').html('')
                playersData.forEach(item => {
                    let itemq = $(`<span style="cursor:pointer;">(${item.id}) ${item.name}</span><br/>`)
                    itemq.click(() => {
                        let marker = <any>_MAP_markerStore[players.get(item.id)];
                        console.log(marker)
                        marker.popup.open(map, marker);
                        map.panTo(marker.getPosition());
                    })
                    $('#playerList').prepend(itemq)
                })
            })
        })
    }, 1000)
}

function getBlipIndex(blip: BlipObj) {
    if (_blips[blip.type] == null) {
        return -1;
    }

    var blipArrayForType = _blips[blip.type];

    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];

        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return parseInt(b);
        }
    }

    // Couldn't find it..
    return -1;
}

function getBlipIdByName(name: string){
    let resid = -1
    for (var type in _blips) {
        var blipArrayForType = _blips[type];
        for (var b in blipArrayForType) {
            var blp = blipArrayForType[b];

            if (blp.name == name) {
                resid = blp.markerId;
            }
        }
    }
    return resid;
}

function getBlipMarkerId(blip: BlipObj) {
    if (_blips[blip.type] == null) {
        return -1;
    }

    var blipArrayForType = _blips[blip.type];

    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];

        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return blp.markerId;
        }
    }

    // Couldn't find it..
    return -1;
}



function doesBlipExist(blip: BlipObj) {
    if (_blips[blip.type] == null) {
        return false;
    }

    var blipArrayForType = _blips[blip.type];

    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];

        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return true;
        }
    }

    return false;
}

function addBlip(blipObj: BlipObj) {
    if (doesBlipExist(blipObj)) {
        return; // Meh, it already exists.. Just don't add it
    }

    if (!blipObj.hasOwnProperty("description")) { // Doesn't have a description
        blipObj.description = "";
    }

    createBlip(blipObj);
}

function clearMarker(id:number) {
    if (_MAP_markerStore[id]) {
        _MAP_markerStore[id].setMap(null);
        _MAP_markerStore[id] = null;
        $("#marker_" + id).remove();
    }
}

function removeBlip(blipObj: BlipObj) {
    if (doesBlipExist(blipObj)) {
        // Remove it

        var markerId = getBlipMarkerId(blipObj);
        var index = getBlipIndex(blipObj);
        clearMarker(markerId);

        _blips[blipObj.type].splice(index, 1);

        if (_blips[blipObj.type].length == 0) {
            delete _blips[blipObj.type];
        }

        blipCountMinus()
        $("#blip_count").text(_blipCount);
    }
}

function updateBlip(blipObj: BlipObj) {
    if (doesBlipExist(blipObj)) {
        // Can update it
        var markerId = getBlipMarkerId(blipObj);
        var blipIndex = getBlipIndex(blipObj);

        var marker = <any>_MAP_markerStore[markerId];

        if (blipObj.hasOwnProperty("new_pos")) {
            // Blips are supposed to be static so, why this would even be fucking needed it beyond me
            // Still, better to prepare for the inevitability that someone wants this fucking feature
            marker.setPosition(convertToMapGMAP(blipObj.new_pos.x, blipObj.new_pos.y));
            blipObj.pos = blipObj.new_pos;
            delete blipObj.new_pos;
        }

        var name = "No name blip..";
        var html = "";

        if (blipObj.hasOwnProperty("name")) {
            name = blipObj.name;
        } else {
            // No name given, might as well use the default one... If it exists...
            if (MarkerTypes[blipObj.type] != undefined && MarkerTypes[blipObj.type].name != undefined) {
                name = MarkerTypes[blipObj.type].name;
            }
        }

        for (var key in blipObj) {

            if (key == "name" || key == "type") {
                continue; // Name is already shown
            }

            if (key == "pos") {
                html += '<div class="row info-body-row"><strong>Position:</strong>&nbsp;X {' + blipObj.pos.x.toFixed(2) + "} Y {" + blipObj.pos.y.toFixed(2) + "} Z {" + blipObj.pos.z.toFixed(2) + "}</div>";
            } else {
                // Make sure the first letter of the key is capitalised
                // @ts-ignore
                key[0] = key[0].toUpperCase();
                // @ts-ignore
                html += '<div class="row info-body-row"><strong>' + key + ":</strong>&nbsp;" + blipObj[key] + "</div>";
            }
        }

        var info = '<div class="info-window"><div class="info-header-box"><div class="info-header">' + name + '</div></div><div class="clear"></div><div id=info-body>' + html + "</div></div>";

        marker.popup.setContent(info);

        _blips[blipObj.type][blipIndex] = blipObj;
    }
}