import { methods } from "./methods";
import { vipStatus, BASE_AFK_TIME } from "../../util/vip";
import { user } from "../user";

let afktime = 0;

let voiceCount = 0;
let positionCount = 0;
let headingCount = 0;
let headingCamCount = 0;
let forvardCount = 0;
let keyPressCount = 0;
let cameraMoveCount = 0;
let lastKeyPressed:number[] = []
let lastPosition:Vector3Mp = new mp.Vector3(0,0,0);
let lastForvard:Vector3Mp = new mp.Vector3(0,0,0);
let lastCamera:Vector3Mp = new mp.Vector3(0,0,0);
let lastHeading:number = 0;
let lastHeadingCam:number = 0;

const pointForAfk = 100;

const player = mp.players.local;
const gameplayCam = mp.cameras.new('gameplay');

function unique<T>(arr: T[]):T[] {
    let result: T[] = [];

    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }

    return result;
}
setInterval(() => {
    if (!user.isLogin()) return;
    let currentPosition: Vector3Mp = player.position
    let currentForvard: Vector3Mp = player.getForwardVector()
    currentForvard.x = methods.parseInt(currentForvard.x);
    currentForvard.y = methods.parseInt(currentForvard.y);
    currentForvard.z = methods.parseInt(currentForvard.z);
    let currentCamera: Vector3Mp = gameplayCam.getRot(2);
    currentCamera.x = methods.parseInt(currentCamera.x);
    currentCamera.y = methods.parseInt(currentCamera.y);
    currentCamera.z = methods.parseInt(currentCamera.z);
    let currentHeading: number = player.getHeading(); 
    if (mp.game.cam.getGameplayCamRelativeHeading() - lastHeadingCam > -2 && mp.game.cam.getGameplayCamRelativeHeading() - lastHeadingCam < 2) headingCamCount++;
    else {
        lastHeadingCam = mp.game.cam.getGameplayCamRelativeHeading();
        headingCamCount = 0;
    }
    if (methods.distanceToPos(lastPosition, currentPosition) < 1) positionCount++;
    else {
        lastPosition = currentPosition;
        positionCount = 0;
    }
    if (currentHeading < lastHeading + 1 && currentHeading > lastHeading - 1) headingCount++;
    else {
        lastHeading = currentHeading;
        headingCount = 0;
    }
    if (JSON.stringify(currentForvard) == JSON.stringify(lastForvard)) forvardCount++;
    else {
        lastForvard = currentForvard;
        forvardCount = 0;
    }
    if (JSON.stringify(currentCamera) == JSON.stringify(lastCamera)) cameraMoveCount++;
    else {
        lastCamera = currentCamera;
        cameraMoveCount = 0;
    }
    if (mp.voiceChat.muted) voiceCount++;
    else voiceCount = 0

    if (chanceIsAfk() < pointForAfk) afktime = 0;
}, 1000)

setInterval(() => {
    if (chanceIsAfk() >= pointForAfk) afktime++;
}, 60000)



setInterval(() => {
    if(!user.isLogin()) return;
    // mp.gui.chat.push(`voiceCount ${voiceCount}`)
    // mp.gui.chat.push(`positionCount ${positionCount}`)
    // mp.gui.chat.push(`headingCount ${headingCount}`)
    // mp.gui.chat.push(`forvardCount ${forvardCount}`)
    // mp.gui.chat.push(`cameraMoveCount ${cameraMoveCount}`)
    // mp.gui.chat.push(`headingCamCount ${headingCamCount}`)
    // mp.gui.chat.push(`keys ${unique(lastKeyPressed).length}`)
    // mp.gui.chat.push(`chanceIsAfk ${chanceIsAfk()}%`)
    // mp.gui.chat.push(`afktime ${afktime}`)
    // mp.gui.chat.push(`=========================`)
    let canBeAfk = BASE_AFK_TIME;
    let vipConf = vipStatus.getVipStatusData(user.get('vip_status'));
    if (vipConf) canBeAfk = vipConf.afkminutes > 10 ? vipConf.afkminutes : 10

    if(afktime > canBeAfk){
        if (!mp.players.local.getVariable('isAfk')) user.setVariable('isAfk', true);
    } else {
        if (mp.players.local.getVariable('isAfk')) user.setVariable('isAfk', false);
    }
}, 1000)



function unicKeys() {
    return unique(lastKeyPressed).length
}

function chanceIsAfk() {
    if (mp.game.ui.isPauseMenuActive()) return 100;
    let chance = 0;
    let voiceChance = voiceCount / 100;
    if(voiceChance > 30) voiceChance = 30;
    chance += voiceChance
    chance += positionCount / 50
    chance += headingCount / 50
    chance += forvardCount / 50
    chance += cameraMoveCount
    let keychance = 100 - unicKeys() * 20
    if (keychance < 0) keychance = 0;
    chance += keychance

    if (chance > 100) chance = 100;

    return chance
}


for(let id = 1; id < 120; id++){
    mp.keys.bind(id, true, function () {
        if (lastKeyPressed.length >= 100) lastKeyPressed.splice(0,1);
        lastKeyPressed.push(id)
    });
}

setInterval(() => {
    if (!user.isLogin()) return;
    lastKeyPressed = []
}, 60000)