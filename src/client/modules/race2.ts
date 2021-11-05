/// <reference path="../../declaration/client.ts" />
export { }

import { wait } from "../../util/methods"
import { methods } from "./methods";
import { user } from "../user";
import { blockSpeedMax } from "./events";
import { gui, progressbar } from "./gui";


/** Конец гонки */
let inRace = false;

/** Текущий чекпоинт, который системный */
let currentCheckpoint = 0;
/** Текущий чекпоинт, который мы рисуем */
let currentCheckpointDraw = 1;
/** Текущий круг, на котором едем */
let currentLap = 1;
/** Количество кругов в гонке */
let raceLap = 0;
/** Режим камеры от первого лица */
let firstCam = false;
/** Гонщики */
let racers: Map<number, { lap: number, checkpoint: number, position: number, blip: BlipMp }> = new Map();
/** Позиция */
let racePosition = 0;
/** Блокирование поворотов руля при старте */
let blockLeftRight = false

let checkdata: {
    x: number;
    y: number;
    z: number;
    r: number;
    h: number;
} = null;
let checkpoints: { x: number; y: number; z: number; r: number; h: number }[] = [];


mp.events.add("race:kick", () => {
    inRace = false;
})

mp.events.add("render", () => {
    if (blockLeftRight) {
        mp.game.controls.disableControlAction(0, 60, true)
        mp.game.controls.disableControlAction(0, 61, true)
        mp.game.controls.disableControlAction(2, 59, true)
        mp.game.controls.disableControlAction(2, 60, true)
    }
    if (!inRace) return;
    mp.game.controls.disableControlAction(0, 75, true)
    mp.game.controls.disableControlAction(25, 75, true)
    if (firstCam) {
        mp.game.controls.disableControlAction(0, 26, true)
        mp.game.controls.disableControlAction(25, 26, true)
        mp.game.controls.disableControlAction(0, 79, true)
        mp.game.controls.disableControlAction(25, 79, true)
        mp.game.cam.setFollowVehicleCamViewMode(4);
    }
})

function notify(text: string) {
    mp.game.ui.notifications.show(text);
}


let check: CheckpointMp;
let blip: BlipMp;
let blipNext: BlipMp;

let checkType = {
    pitstop: 45,
    finish: 4,
    check: 2,
    start: 4,
}



mp.events.add("race:checkpointData", (id: number, lap: number, checkpoint: number) => {
    if (!racers.has(id)) return;
    racers.get(id).lap = lap;
    racers.get(id).checkpoint = checkpoint;
})

mp.events.add("startRace", async (timer: number, checks: string, laps: number, racerd: string, vehicleNames: string, spawnJS: string, vehid:number) => {
    let player = mp.players.local
    blockLeftRight = true;
    let spawn = JSON.parse(spawnJS);
    const seat = () => {
        let vehicle = mp.vehicles.atRemoteId(vehid);
        if(vehicle){
            let distance = mp.game.gameplay.getDistanceBetweenCoords(spawn.x, spawn.y, spawn.z, vehicle.position.x, vehicle.position.y, vehicle.position.z, true);
            if(distance > 1.5){
                vehicle.setCoordsNoOffset(
                    methods.parseFloat(spawn.x),
                    methods.parseFloat(spawn.y),
                    methods.parseFloat(spawn.z + 0.7),
                    false,
                    false,
                    false
                )
                vehicle.setHeading(methods.parseFloat(spawn.h))
                vehicle.setOnGroundProperly();
            }
            if(vehicle.getHeading() - methods.parseFloat(spawn.h) < -3 || vehicle.getHeading() - methods.parseFloat(spawn.h) > 3) vehicle.setHeading(methods.parseFloat(spawn.h))
            if(player.vehicle != vehicle) player.taskEnterVehicle(vehicle.handle, 10000, -1, 1, 16, 0);
            else vehicle.resetAlpha();
            vehicle.setHandbrake(true);
        }
    }
    setTimeout(() => {
        seat();
    }, 1000)


    raceLap = laps;
    let qracers = JSON.parse(racerd);
    racers = new Map();
    qracers.forEach((i: number) => {
        racers.set(i, { lap: 0, checkpoint: 0, position: 0, blip: null });
    })
    
    currentCheckpoint = 0;
    currentCheckpointDraw = 1;
    currentLap = 1;
    checkdata = null;
    checkpoints = JSON.parse(checks);
    inRace = true;
    notify("Приготовьтесь")
    await wait(3000)
    seat();
    notify("3")
    await wait(1000)
    seat();
    notify("2")
    await wait(1000)
    seat();
    notify("1")
    await wait(timer * 1000)
    seat();
    let distance = mp.game.gameplay.getDistanceBetweenCoords(spawn.x, spawn.y, spawn.z, player.position.x, player.position.y, player.position.z, true);
    if (distance > 3) return mp.events.callRemote("race:cheat")
    player.vehicle.setHandbrake(false);
    notify("Поехали")
    blockLeftRight = false;

    setTimeout(async () => {
        while (inRace) {
            if (player.vehicle && !blockLeftRight) {
                let check = false;
                if (player.vehicle.getSpeed() < 3) check = true, await wait(1000);
                if (player.vehicle.getSpeed() < 3) check = true
                else check = false;
                if(check) notify("~r~Зажмите [F] для респавна ТС"), await wait(5000);
            }
            await wait(5000);
        }
    }, 1000)
    setTimeout(async () => {
        while (inRace) {
            racers.forEach((data, id) => {
                if (id != player.remoteId && inRace) {
                    let target = mp.players.atRemoteId(id);
                    if (target && target.handle) {
                        let pos = target.position
                        if (pos) {
                            if (!data.blip) {
                                data.blip = mp.blips.new(1, pos, {
                                    name: 'Гонщик',
                                    color: 1,
                                    shortRange: false,
                                    dimension: player.dimension
                                })
                            } else {
                                data.blip.setPosition(pos.x, pos.y, pos.z)
                            }
                        }
                    } else if (data.blip) {
                        data.blip.destroy();
                        data.blip = null
                    }
                }
            })
            await wait(100);
        }
    }, 1000)
    setTimeout(async () => {
        while (inRace) {
            let arr = [...racers];
            if (arr.length == 0) return;
            arr.sort((a, b) => {
                let user1 = a[0];
                let lap1 = a[1].lap;
                let check1 = a[1].checkpoint;
                let user2 = b[0];
                let lap2 = b[1].lap;
                let check2 = b[1].checkpoint;
                if (lap1 < lap2) return -1;
                if (lap1 > lap2) return 1;
                if (check1 < check2) return -1;
                if (check1 > check2) return 1;
                let target1 = mp.players.atRemoteId(user1)
                let target2 = mp.players.atRemoteId(user2)
                if (target1 && target2 && target1.handle && target2.handle && target1.position && target2.position) {
                    let checkpoint = checkpoints[check1];
                    if (!checkpoint) return 0;
                    checkdata.x = methods.parseFloat(checkdata.x)
                    checkdata.y = methods.parseFloat(checkdata.y)
                    checkdata.z = methods.parseFloat(checkdata.z)
                    checkdata.r = methods.parseFloat(checkdata.r)
                    let dist1 = mp.game.gameplay.getDistanceBetweenCoords(target1.position.x, target1.position.y, target1.position.z, checkpoint.x, checkpoint.y, checkpoint.z, true);
                    let dist2 = mp.game.gameplay.getDistanceBetweenCoords(target2.position.x, target2.position.y, target2.position.z, checkpoint.x, checkpoint.y, checkpoint.z, true);
                    if (dist1 < dist2) return 1;
                    if (dist1 > dist2) return -1;
                }
                return 0;
            })
    
            arr.reverse();
    
            racers = new Map();
            arr.forEach(([u, c], index) => {
                racers.set(u, c);
                if (u == player.remoteId) racePosition = (index + 1)
            })
            if(inRace) gui.browser.execute(`CEF.hud.raceData(${racePosition}, ${currentLap}, ${raceLap}, ${arr.length})`);
            await wait(1000);
        }
    }, 1000)



    setTimeout(async () => {
        while (inRace) {
            if (player.isDead()) {
                mp.events.callRemote("race:dead")
                await wait(10000)
            } else if (!player.vehicle) {
                respawn();
                await wait(10000)
            }
            await wait(100);
        }
    }, 1000)

    setTimeout(async function() {
        let respawnTimerButton = 0;
        let isShowBar = false;
        while (inRace) {
            if (mp.game.controls.isDisabledControlPressed(0, 75)) {
                respawnTimerButton = respawnTimerButton + 10;
                if (!isShowBar) {
                    progressbar.show('Удерживайте [F]');
                    isShowBar = true;
                }
                progressbar.update(respawnTimerButton / 10);
                if (respawnTimerButton >= 1000) {
                    respawnTimerButton = 0;
                    respawn();
                    progressbar.hide();
                    isShowBar = false;
                    await wait(5000);
                }
            } else {
                if (respawnTimerButton != 0) {
                    respawnTimerButton = 0;
                    progressbar.hide();
                    isShowBar = false;
                }
                await wait(1000);
            }
            await wait(10);
        }
    }, 1000)

    while (inRace) {
        if (currentLap == laps && laps != 1 && currentCheckpoint == 0) notify("Последний круг");
        checkdata = checkpoints[currentCheckpoint];
        let checkdataNext: {
            x: number;
            y: number;
            z: number;
            r: number;
            h: number;
        } = null;
        checkdata.x = methods.parseFloat(checkdata.x)
        checkdata.y = methods.parseFloat(checkdata.y)
        checkdata.z = methods.parseFloat(checkdata.z)
        checkdata.r = methods.parseFloat(checkdata.r)

        if (check) check.destroy(), check = null;
        if (blip) blip.destroy(), blip = null;
        if (blipNext) blipNext.destroy(), blipNext = null;

        let currentCheckType; // Type of current check | 1 - Default, 2 - Last in circle, 3 - Finish check
        let currentCheckTypeShow = checkType.check;
        if (currentCheckpoint + 1 == checkpoints.length) {
            // Last check
            currentCheckType = 2;
            if (laps == currentLap) {
                // Finish
                currentCheckType = 3;
                currentCheckTypeShow = checkType.finish;
            } else {
                checkdataNext = checkpoints[0];
            }
        } else {
            currentCheckType = 1
            checkdataNext = checkpoints[currentCheckpoint + 1];
        }

        check = mp.checkpoints.new(currentCheckTypeShow, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), checkdata.r + 0.0001, {
            direction: (!checkdataNext) ? new mp.Vector3(0, 0, 75) : new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z + 2),
            color: [255, 255, 0, 60],
            visible: true,
            dimension: player.dimension
        });
        blip = mp.blips.new((!checkdataNext) ? 611 : 1, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), {
            name: (!checkdataNext) ? 'Финишная точка' : 'Контрольная точка',
            color: 5,
            shortRange: false,
            dimension: player.dimension
        });
        blip.setRoute(true);
        if (checkdataNext) {
            blipNext = mp.blips.new(1, new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z), {
                name: (currentCheckpoint + 1 == checkpoints.length && laps == currentLap) ? 'Финишная точка' : 'Контрольная точка',
                color: 5,
                alpha: 60,
                shortRange: true,
                dimension: player.dimension
            });
        }

        let reached = false;

        while (!reached && inRace) {
            let distance = mp.game.gameplay.getDistanceBetweenCoords(checkdata.x, checkdata.y, checkdata.z, player.position.x, player.position.y, player.position.z, false);
            if (distance < (checkdata.r + 0.8) && player.vehicle) {
                reached = true;
                mp.game.audio.playSound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", false, 0, true);

            } else {
                await wait(10)
            }
        }

        if (check) check.destroy(), check = null;
        if (blip) blip.destroy(), blip = null;
        if (blipNext) blipNext.destroy(), blipNext = null;

        if (inRace) {


            if (currentCheckType == 3) {
                inRace = false;
                mp.events.callRemote("race:finished")
                notify("Финиш")
                user.setData('raceCheckpoint', 0);
            } else {
                currentCheckpointDraw++;
                if (currentCheckType == 1) {
                    currentCheckpoint++;
                } else if (currentCheckType == 2) {
                    currentLap++;
                    currentCheckpoint = 0;
                }
                if (racers.has(player.remoteId)) {
                    racers.get(player.remoteId).lap = currentLap;
                    racers.get(player.remoteId).checkpoint = currentCheckpoint;
                }
                mp.events.callRemote("race:checkpoint", currentLap, currentCheckpoint);
            }
        }

    }
    racers.forEach((data, id) => {
        if (data.blip) {
            data.blip.destroy();
            data.blip = null;
        }
        racers.delete(id);
    })
    gui.browser.execute(`CEF.hud.disableRace()`);
});

function respawn() {
    if (!checkpoints) return;
    if (!inRace) return;
    let pos = (currentCheckpoint == 0) ? checkpoints[checkpoints.length - 1] : checkpoints[currentCheckpoint - 1];
    if (pos) mp.events.callRemote("race:respawn", pos.x, pos.y, pos.z, pos.h);
}

mp.events.add("race:vehground", () => {
    if(mp.players.local.vehicle) mp.players.local.vehicle.setOnGroundProperly();
})