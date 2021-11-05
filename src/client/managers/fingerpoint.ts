//Fingerpointing

import { user } from "../user";
import { gui } from "../modules/gui";
import { pressVoice } from "../ragevoice";

let pointing = {
    active: false,
    interval: <number>null,
    lastSent: 0,
    start: function () {
        if (!pointing.active) {
            pointing.active = true;

            mp.game.streaming.requestAnimDict("anim@mp_point");

            while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                mp.game.wait(0);
            }
            mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1);
            mp.players.local.setConfigFlag(36, true)
            mp.players.local.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
            mp.game.streaming.removeAnimDict("anim@mp_point");

            pointing.interval = setInterval(pointing.process.bind(this), 0);
        }
    },

    stop: function () {
        if (pointing.active) {
            clearInterval(pointing.interval);
            pointing.interval = null;
            
            pointing.active = false;
            
            
            
            mp.game.invoke("0xd01015c7316ae176", mp.players.local.handle, "Stop");
            if (!mp.players.local.isInAnyVehicle(true)) {
                mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 1, 1, 1, 1);
            }
            mp.players.local.setConfigFlag(36, false);
            // mp.players.local.clearSecondaryTask();

            user.stopAllAnimation()
            // setTimeout(function () {
            //     mp.players.local.taskPlayAnim('random@mugging3', "handsup_standing_base", 3.0001, -2.5001, -1, 49, 0, false, false, false);
            //     setTimeout(function () {
            //         mp.players.local.stopAnimTask('random@mugging3', "handsup_standing_base", 3.0001)
            //         mp.players.local.clearSecondaryTask();
            //         mp.players.local.clearTasks();
            //     }, 100)
            // }, 1000)


        } else {
            mp.console.logInfo("NO ACTIVE POINTING")
        }
    },

    gameplayCam: mp.cameras.new("gameplay"),
    lastSync: 0,

    getRelativePitch: function () {
        let camRot = pointing.gameplayCam.getRot(2);

        return camRot.x - mp.players.local.getPitch();
    },

    process: function () {
        if (pointing.active) {
            mp.game.invoke("0x921ce12c489c4c41", mp.players.local.handle);

            let camPitch = pointing.getRelativePitch();

            if (camPitch < -70.0) {
                camPitch = -70.0;
            } else if (camPitch > 42.0) {
                camPitch = 42.0;
            }
            camPitch = (camPitch + 70.0) / 112.0;

            let camHeading = mp.game.cam.getGameplayCamRelativeHeading();

            let cosCamHeading = mp.game.system.cos(camHeading);
            let sinCamHeading = mp.game.system.sin(camHeading);

            if (camHeading < -180.0) {
                camHeading = -180.0;
            } else if (camHeading > 180.0) {
                camHeading = 180.0;
            }
            camHeading = (camHeading + 180.0) / 360.0;

            let coords = mp.players.local.getOffsetFromGivenWorldCoords((cosCamHeading * -0.2) - (sinCamHeading * (0.4 * camHeading + 0.3)), (sinCamHeading * -0.2) + (cosCamHeading * (0.4 * camHeading + 0.3)), 0.6);
            let blocked = (typeof mp.raycasting.testPointToPoint(new mp.Vector3(coords.x, coords.y, coords.z - 0.2), new mp.Vector3(coords.x, coords.y, coords.z + 0.2), mp.players.local.handle, 7) !== 'undefined');

            mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Pitch", camPitch)
            mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Heading", camHeading * -1.0 + 1.0)
            mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isBlocked", blocked)
            mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isFirstPerson", mp.game.invoke('0xee778f8c7e1142e2', mp.game.invoke('0x19cafa3c87f7c2ff')) == 4)

            if ((Date.now() - pointing.lastSent) > 100) {
                pointing.lastSent = Date.now();
                mp.events.callRemote("fpsync.update", camPitch, camHeading);
            }
        }
    }
}

mp.events.add("fpsync.stop", (id) => {
    setTimeout(() => {
        let netPlayer = getPlayerByRemoteId(parseInt(id));
        if (netPlayer == null) return;
        netPlayer.clearSecondaryTask();
        netPlayer.lastReceivedPointing = undefined;
        netPlayer.pointingInterval = undefined;
    
        mp.game.invoke("0xd01015c7316ae176", netPlayer.handle, "Stop");
    
    
        if (!netPlayer.isInAnyVehicle(true)) {
            mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 1, 1, 1, 1);
        }
        netPlayer.setConfigFlag(36, false);
        netPlayer.clearSecondaryTask();
        mp.gui.chat.push("fpsync.stop")
        // netPlayer.clearTasks();
        // netPlayer.stopAnimTask('anim@mp_point', "task_mp_pointing", 3.0001)
        // netPlayer.clearTasksImmediately()
    }, 300)
    
})

mp.events.add("fpsync.update", (id, camPitch, camHeading) => {
    let netPlayer = getPlayerByRemoteId(parseInt(id));
    if (netPlayer != null) {
        if (netPlayer != mp.players.local) {
            netPlayer.lastReceivedPointing = Date.now();

            if (!netPlayer.pointingInterval) {
                netPlayer.pointingInterval = setInterval((function () {
                    if ((Date.now() - netPlayer.lastReceivedPointing) > 1000) {
                        clearInterval(netPlayer.pointingInterval);

                        netPlayer.lastReceivedPointing = undefined;
                        netPlayer.pointingInterval = undefined;

                        mp.game.invoke("0xd01015c7316ae176", netPlayer.handle, "Stop");


                        if (!netPlayer.isInAnyVehicle(true)) {
                            mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 1, 1, 1, 1);
                        }
                        netPlayer.setConfigFlag(36, false);

                    }
                }).bind(netPlayer), 500);

                mp.game.streaming.requestAnimDict("anim@mp_point");

                while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                    mp.game.wait(0);
                }



                mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 0, 1, 1, 1);
                netPlayer.setConfigFlag(36, true)
                netPlayer.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
                mp.game.streaming.removeAnimDict("anim@mp_point");
            }

            mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Pitch", camPitch)
            mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Heading", camHeading * -1.0 + 1.0)
            mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isBlocked", 0);
            mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isFirstPerson", 0);
        }
    }
});

export let pressFinger = false;

mp.keys.bind(0x42, true, () => {
    if(!user.isLogin()) return;
    if(gui.isActionGui()) return;
    if(user.isCuff()) return;
    if(user.isDead()) return;
    if(mp.players.local.vehicle) return;
    if (pressVoice) return;
    if (pressFinger) return;
    if (!mp.gui.cursor.visible) {
        pressFinger = true;
        setTimeout(() => {
            pressFinger = false;
        }, 300)
        pointing.start();
    }
});

mp.keys.bind(0x42, false, () => {
    pointing.stop();

});

function getPlayerByRemoteId(remoteId:number) {
    let pla = mp.players.atRemoteId(remoteId);
    if (pla == undefined || pla == null) {
        return null;
    }
    return pla;
}