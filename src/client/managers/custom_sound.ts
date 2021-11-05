import { methods } from "../modules/methods";

export { };
const localplayer = mp.players.local;

let returnData: {[id:string]:{x:number,y:number,z:number}} = {};
mp.events.add('web:browsers:urls', (q) => {
    let url = q[3]
    soundpage = mp.browsers.new(url)
});
let soundpage: BrowserMp;
mp.events.add({
    renderHalf: () => {
        return;
        if (!soundpage) return;
        let heading = mp.game.cam.getGameplayCamRelativeHeading() + localplayer.getHeading();
        let pitch = mp.game.invoke('0x3A6867B4845BEDA2');

        let camx = -Math.sin((heading * Math.PI) / 180.0);
        let camy = Math.cos((heading * Math.PI) / 180.0);
        let camz = Math.sin((pitch * Math.PI) / 180.0);

        let len = Math.sqrt(camx * camx + camy * camy + camz * camz);
        if (len != 0) {
            camx = camx / len;
            camy = camy / len;
            camz = camz / len;
        }

        let pos = localplayer.position;

        returnData = {}
        returnData['player_' + localplayer.remoteId] = {
            x: localplayer.position.x,
            y: localplayer.position.y,
            z: localplayer.position.z,
        }
        mp.players.forEachInStreamRange((player) => {
            if (typeof player.remoteId != "number") return;
            if (typeof player.handle != "number") return;
            if(methods.distanceToPos(localplayer.position, player.position) < 100){
                returnData['player_' + player.remoteId] = {
                    x: player.position.x,
                    y: player.position.y,
                    z: player.position.z,
                }
            }
        });

        mp.vehicles.forEachInStreamRange((vehicle) => {
            if (typeof vehicle.remoteId != "number") return;
            if (typeof vehicle.handle != "number") return;
            if (methods.distanceToPos(localplayer.position, vehicle.position) < 100) {
                returnData['vehicle_' + vehicle.remoteId] = {
                    x: vehicle.position.x,
                    y: vehicle.position.y,
                    z: vehicle.position.z,
                }
            }
        });
        mp.objects.forEach((object) => {
            if (typeof object.remoteId != "number") return;
            if (typeof object.handle != "number") return;
            if(object.dimension != localplayer.dimension) return;
            if (methods.distanceToPos(localplayer.position, object.position) < 100) {
                returnData['object' + object.remoteId] = {
                    x: object.position.x,
                    y: object.position.y,
                    z: object.position.z,
                }
            }
        });
        let str = `custom_sound.setAllData(${pos.x}, ${pos.y}, ${pos.z}, ${camx}, ${camy}, ${camz}, '${JSON.stringify(returnData)}');`;
        // mp.console.logInfo(str);
        soundpage.execute(str);
    },
    playAudioAtEntity: (url, volume, dist, id) => {
        if (!soundpage) return;
        if (!returnData[id]) return;
        soundpage.execute(`custom_sound.playCustomSoundAtEntity('${url}', ${volume}, ${dist}, '${id}');`);
    },
    playAudioAtPosition: (url, volume, dist, x, y, z) => {
        if (!soundpage) return;
        soundpage.execute(`custom_sound.playCustomSound('${url}', ${volume}, ${dist}, ${x}, ${y}, ${z});`);
    },
});

