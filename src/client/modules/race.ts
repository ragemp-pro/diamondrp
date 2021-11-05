
/// <reference path="../../declaration/client.ts" />

import { playSound } from "./sound";
import { wait, getTime } from "../../util/methods";
import { methods } from "./methods";

export {}
const player = mp.players.local;
let racebrowser:BrowserMp;
mp.events.add("web:loadRaceBrowser", (url:string) => {
  racebrowser = mp.browsers.new(url);
})
let raceData:{
  [x:string]:any;
} = null;
let raceVehicle:VehicleMp = null;
let raceDataMy:{
  [x:string]:any;
} = null;
let checkType = {
  pitstop: 45,
  finish: 4,
  check: 2,
  start: 4,
}
let qualData:{
  [x:string]:any;
};
let raceEnded = true;
let raceFlyEnable = false;
let raceSpectate = false;

let fuelTimer = 5;
let spectCam:CameraMp;
let spectTarget:PlayerMp;

function notifyjs(text:string){
  mp.game.ui.notifications.show(text);
}

export const isInRace = () => {
  return (raceData != null)
}

// setInterval(function(){
//   let ping = 0;
//   if(player.ping) ping = player.ping;
//   if(racebrowser)racebrowser.execute(`app.myping = ${ping};`)
// }, 5000)

// setInterval(function() {
//   if (!player.vehicle) return;
//   if (!player.vehicle.getIsEngineRunning()) return;
//   if ((raceData && !raceData.pitActive) || (qualData && !qualData.pitActive)) return;
//   let multipler = 1;
//   if (raceData && raceData.fuelMultipler) multipler = raceData.fuelMultipler
//   if (qualData && qualData.fuelMultipler) multipler = qualData.fuelMultipler
//   // fuelMultipler
//   let fuelminus = 0.001

//   let vehicle = player.vehicle;
//   //let rate = vehicle.getVariable("fuelRate");


//   const rpm = vehicle.rpm;
//   const speed = vehicle.getSpeed() / 10
//   fuelminus = (((fuelminus + rpm / 100 * speed) * multipler) * fuelTimer).toFixed(3)

//   mp.events.callRemote('setMinusFuel', fuelminus);

// }, 1000 * fuelTimer)




mp.events.add("entityStreamIn", (user) => {
  if (user.type !== "player") return;
  if(user.getVariable("raceFlyEnable")){
    user.setAlpha(0);
    if(player == user) return;
    user.setNoCollision(player.handle, false);
    player.setNoCollision(user.handle, false);
    if(player.vehicle){
      user.setNoCollision(player.vehicle.handle, false);
      player.vehicle.setNoCollision(user.handle, false);
    }
  }
})
// 0x5234F9F10919EABA




mp.events.add("render", function() {
  if (!raceData) return;
  mp.game.controls.disableControlAction(0, 75, true)
  mp.game.controls.disableControlAction(25, 75, true)
  if (raceData.firstCamOnly) {
    mp.game.controls.disableControlAction(0, 26, true)
    mp.game.controls.disableControlAction(25, 26, true)
    mp.game.controls.disableControlAction(0, 79, true)
    mp.game.controls.disableControlAction(25, 79, true)
    mp.game.cam.setFollowVehicleCamViewMode(4);
  }
})

mp.events.add("render", function() {
  if (!qualData) return;
  mp.game.controls.disableControlAction(0, 75, true)
  mp.game.controls.disableControlAction(25, 75, true)
  if (qualData.firstCamOnly) {
    mp.game.controls.disableControlAction(0, 26, true)
    mp.game.controls.disableControlAction(25, 26, true)
    mp.game.controls.disableControlAction(0, 79, true)
    mp.game.controls.disableControlAction(25, 79, true)
    mp.game.cam.setFollowVehicleCamViewMode(4);
  }
})

setInterval(function(){
  if (!raceData && !qualData) return;
  let data:{user_id:number,id:number,ping:number,packetLoss:number,position:{x:number;y:number;z:number},dist:number,speed:number}[] = [];
  mp.players.forEach(user => {
    if (user.dimension == player.dimension) {
      data.push({user_id:user.getVariable('id'),id:user.remoteId,ping:user.ping,packetLoss:user.packetLoss,position:user.position,dist:mp.game.gameplay.getDistanceBetweenCoords(user.position.x, user.position.y, user.position.z, player.position.x, player.position.y, player.position.z, true),speed:user.getSpeed()})
    }
  });
  if(racebrowser)racebrowser.execute(`app.setPingData('${JSON.stringify(data)}');`);
}, 1000)


setTimeout(() => {
  mp.events.register("qualificationdata", async function(datajs,racers) {
    racebrowser.execute(`app.setUserData('${racers}');`);
    racebrowser.execute(`app.setQualificationData('${datajs}', ${player.getVariable('id')});`)
  });

  mp.events.register("qualification", async function(datajs, pos) {

    qualData = JSON.parse(datajs);
    qualData.qualpos = pos;
    raceVehicle = player.vehicle;
    let endqual = parseInt(qualData.qualificationTime);
    racebrowser.execute(`app.setQualificationEnd(${endqual});`)
    let currCheck = (qualData.checkpoints.length - 1)
    let ended = false;
    let currentCheck:CheckpointMp;
    let currentBlip:BlipMp;
    let nextBlip:BlipMp;
    let pitBlip:BlipMp;
    let pitCheck:MarkerMp;
    /*
    let intervalCollision = setInterval(function() {
      if (ended) {
        enableCollisions(true)
        clearInterval(intervalCollision);
      } else {
        enableCollisions(false)
      }
    }, 300)
    */

    //notifyjs("Квалификация начата")
    setTimeout(function(){
      racebrowser.execute(`app.qualificationShow = false;`);
      racebrowser.execute(`app.setBestLap(0)`);
      //notifyjs("Квалификация окончена")
      ended = true;
      if(currentCheck){
        currentCheck.destroy();
        currentCheck = null;
      }
      if(currentBlip){
        currentBlip.destroy();
        currentBlip = null;
      }
      if(nextBlip){
        nextBlip.destroy();
        nextBlip = null;
      }

      qualData = null;
    }, endqual * 1000 * 60)

    /*let collint = setInterval(function(){
      if(!ended) enableCollisions(false)
      else clearInterval(collint);
    }, 1000)
    */


    let pitPosition = qualData.pitstops[qualData.qualpos]
    pitPosition.x = methods.parseFloat(pitPosition.x)
    pitPosition.y = methods.parseFloat(pitPosition.y)
    pitPosition.z = methods.parseFloat(pitPosition.z)
    if (qualData.pitActive) {
      setTimeout(async function() {

        //pitPosition.r = methods.parseFloat(pitPosition.r)
        pitCheck = mp.markers.new(36, new mp.Vector3(pitPosition.x, pitPosition.y, pitPosition.z + 0.5), 3 + 0.0001, {
          direction: new mp.Vector3(0, 0, 75),
          color: [0, 255, 0, 50],
          visible: true,
          dimension: player.dimension
        });
        pitBlip = mp.blips.new(446, new mp.Vector3(pitPosition.x, pitPosition.y, pitPosition.z), {
          name: "Пит стоп",
          color: 25,
          shortRange: false,
          dimension: player.dimension
        });
        while (!ended) {
          if (mp.game.gameplay.getDistanceBetweenCoords(pitPosition.x, pitPosition.y, pitPosition.z, player.position.x, player.position.y, player.position.z, false) < 2 && raceVehicle.getSpeed() < 1) {
            raceVehicle.freezePosition(true);
            notifyjs("Обслуживаем ТС");
            await wait(5000);
            notifyjs("Заливаем топливо");
            await wait(5000);
            mp.events.callRemote("raceFixVehicle");
            await wait(500);
            raceVehicle.freezePosition(false);
            await wait(500);
            if (qualData.pitSpeed != null && qualData.pitZoneEnter != null && qualData.pitZoneExit != null) raceVehicle.setMaxSpeed(qualData.pitSpeed / 2.236936);
            while (mp.game.gameplay.getDistanceBetweenCoords(pitPosition.x, pitPosition.y, pitPosition.z, player.position.x, player.position.y, player.position.z, false) < 3) {
              await wait(1000)
            }
          } else {
            await wait(10)
          }
        }
        pitCheck.destroy();
        pitBlip.destroy();

      }, 1000)
    }


    if (qualData.pitSpeed != null && qualData.pitZoneEnter != null && qualData.pitZoneExit != null) {
      setTimeout(async function() {
        while (!ended) {
          if (mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(qualData.pitZoneEnter.x), methods.parseFloat(qualData.pitZoneEnter.y), methods.parseFloat(qualData.pitZoneEnter.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(qualData.pitZoneEnter.r) + 0.5) {
            raceVehicle.setMaxSpeed(qualData.pitSpeed / 2.236936);
            notifyjs("Скорость автоматически снижена до " + qualData.pitSpeed + " миль в час");
            //await wait(4000);
            while ((mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(qualData.pitZoneEnter.x), methods.parseFloat(qualData.pitZoneEnter.y), methods.parseFloat(qualData.pitZoneEnter.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(qualData.pitZoneEnter.r) + 0.5)) await wait(100);
          } else if (mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(qualData.pitZoneExit.x), methods.parseFloat(qualData.pitZoneExit.y), methods.parseFloat(qualData.pitZoneExit.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(qualData.pitZoneExit.r) + 0.5) {
            raceVehicle.setMaxSpeed(9999999);
            notifyjs("Скорость восстановлена");
            //await wait(4000);
            while ((mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(qualData.pitZoneExit.x), methods.parseFloat(qualData.pitZoneExit.y), methods.parseFloat(qualData.pitZoneExit.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(qualData.pitZoneExit.r) + 0.5)) await wait(100);
          }
          await wait(20);
        }
        raceVehicle.setMaxSpeed(9999999);
      }, 1000)
    }


    setTimeout(async function() {
      while (!ended) {
        if (player.vehicle != raceVehicle || player.isDead()) {
          await wait(3000);
          await raceRespawn(pitPosition.x, pitPosition.y, pitPosition.z, pitPosition.h);
          await wait(3000);
        }
        await wait(100);
      }
    }, 1000)

    setTimeout(async function() {
      let respawnTimerButton = 0;
      while (!ended) {
        if (mp.game.controls.isDisabledControlPressed(0, 75)) {
          respawnTimerButton = respawnTimerButton + 10;
          racebrowser.execute(`app.respawnLineTimer = ${(respawnTimerButton/10)};`);
          racebrowser.execute(`app.respawnLineName = 'Респавн';`);
          if (respawnTimerButton >= 1000) {
            respawnTimerButton = 0;
            racebrowser.execute(`app.respawnLineTimer = ${respawnTimerButton};`);
            await raceRespawn(pitPosition.x, pitPosition.y, pitPosition.z, pitPosition.h);
            await wait(5000);
          }
        } else {
          if (respawnTimerButton != 0) {
            respawnTimerButton = 0;
            racebrowser.execute(`app.respawnLineTimer = ${respawnTimerButton};`);
          }
          await wait(1000);
        }
        await wait(10);
      }
    }, 1000)




    while(!ended){

      let checkdata = qualData.checkpoints[currCheck];
      checkdata.x = methods.parseFloat(checkdata.x)
      checkdata.y = methods.parseFloat(checkdata.y)
      checkdata.z = methods.parseFloat(checkdata.z)
      checkdata.r = methods.parseFloat(checkdata.r)
      // CURRENT CHECK
      let checkdataNext = null;
      // NEXT CHECK PREDATA



      let currentCheckType; // Type of current check | 1 - Default, 2 - Last in circle, 3 - Finish check
      let currentCheckTypeShow = checkType.check;
      if (currCheck + 1 == qualData.checkpoints.length) {
        currentCheckType = 3;
        currentCheckTypeShow = checkType.finish;
      } else {
        currentCheckType = 1
        checkdataNext = qualData.checkpoints[currCheck + 1];
      }

      if (checkdataNext) {
        checkdataNext.x = methods.parseFloat(checkdataNext.x)
        checkdataNext.y = methods.parseFloat(checkdataNext.y)
        checkdataNext.z = methods.parseFloat(checkdataNext.z)
        checkdataNext.r = methods.parseFloat(checkdataNext.r)
      }

      currentCheck = mp.checkpoints.new(currentCheckTypeShow, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), checkdata.r + 0.0001, {
        direction: (!checkdataNext) ? new mp.Vector3(0, 0, 75) : new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z + 2),
        color: [255, 255, 0, 60],
        visible: true,
        dimension: player.dimension
      });
      currentBlip = mp.blips.new((!checkdataNext) ? 611 : 1, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), {
        name: (!checkdataNext) ? 'Финишная точка' : 'Контрольная точка',
        color: 5,
        shortRange: false,
        dimension: player.dimension
      });
      if (checkdataNext) {
        nextBlip = mp.blips.new(1, new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z), {
          name: (currCheck + 1 == qualData.checkpoints.length) ? 'Финишная точка' : 'Контрольная точка',
          color: 5,
          alpha: 60,
          shortRange: true,
          dimension: player.dimension
        });
      }



      let reached = false;

      while (!reached && !ended) {
        let distance = mp.game.gameplay.getDistanceBetweenCoords(checkdata.x, checkdata.y, checkdata.z, player.position.x, player.position.y, player.position.z, false);
        if (distance < (checkdata.r + 0.8)) {
          reached = true;
          mp.game.audio.playSound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", false, 0, true);
        } else {
          await wait(10)
        }
      }

      if(!ended){
        if(currCheck == (qualData.checkpoints.length - 1)){
          racebrowser.execute(`app.qualificationNewLap();`);
          if(qualData.startLap == null){
            // START
            qualData.startLap = getTime().full;
            qualData.bestLap = qualData.startLap + 10000000000
          } else {
            // NEW TRY
            if(getTime().full - qualData.startLap < qualData.bestLap){
              // NEW LAP TIME
              qualData.bestLap = (getTime().full - qualData.startLap);
              racebrowser.execute(`app.setBestLap(${qualData.bestLap})`);
              mp.events.callRemote('qualificationewlap', qualData.bestLap);
            }
            qualData.startLap = getTime().full;
          }
        }
        if(currentCheck){
          currentCheck.destroy();
          currentCheck = null;
        }
        if(currentBlip){
          currentBlip.destroy();
          currentBlip = null;
        }
        if(nextBlip){
          nextBlip.destroy();
          nextBlip = null;
        }

        if(currentCheckType == 1) currCheck++
        else currCheck = 0;
      }

    }

  })


  mp.events.register("racePrepare", async function(data, mydata) {
    player.vehicle.freezePosition(true);
    await wait(1000)
    player.vehicle.freezePosition(false);
    player.vehicle.setOnGroundProperly();
    player.vehicle.freezePosition(true);
    mp.vehicles.forEach(vehicle => {
      if(vehicle.handle){
        vehicle.freezePosition(true);
      }
    })
    let myd = JSON.parse(mydata);
    raceDataMy = {
      lap: 1,
      check: 0,
      checkShow: 1,
      startPosition: myd.startPosition,
      userId: player.getVariable('id')
    }
    //data = JSON.parse(data);
    raceData = JSON.parse(data);


    racebrowser.execute(`app.spectate = false;app.raceName = "${raceData.name}";
    app.raceCheckpoints = ${raceData.checkpoints.length};
    app.raceLaps = ${raceData.circleCount};
    app.vehicleName = "${myd.vehName}";
    app.me = ${myd.userid};
    app.setUserData('${JSON.stringify(raceData.racers)}');`);



  })

  mp.events.add("raceCurrentResultLong", function(a, b) {
    racebrowser.execute(`app.setUserData('${a}');`);
    racebrowser.execute(`app.race_info('${b}');`);
  })


  mp.events.register("raceTotalResult", function(datajs) {
    racebrowser.execute(`app.finalResults('${datajs}');`);
    raceEnded = true;
    mp.gui.chat.show(true)
  })


  mp.events.add({
    "exitFromRaceLobby": () => {
      mp.events.callRemote("exitFromRaceLobby", raceData.lobbyId)
      racebrowser.execute(`app.playersRaceShow = false;
      app.playersRaceResultShow = false;app.spectate = false;`);
      raceSpectate = false;
      raceData = null;
      mp.gui.chat.show(true)
    }
  });

  mp.events.register("needLeaveLobby", async function() {
    raceEnded = true;
    raceSpectate = false;
    racebrowser.execute(`app.playersRaceShow = false;
      app.playersRaceResultShow = false;app.spectate = false;`);
    raceData = null;
    mp.gui.chat.show(true)
  })

  mp.events.register("startRace", async function() {
    mp.gui.chat.show(false)
    notifyjs("Приготовьтесь")
    if(raceData.forceEnd){
      racebrowser.execute(`app.setRaceTimeEnd(${(raceData.forceEndTime * 1000 * 60 + 2000 + raceData.countDownTimer * 1000)});`)
    }
    racebrowser.execute(`app.qualificationShow = false;`);
    raceVehicle = player.vehicle
    raceVehicle.freezePosition(false);
    raceVehicle.setOnGroundProperly();
    raceVehicle.freezePosition(true);

    playSound('sounds/prerace.ogg', 0.5)
    notifyjs("3")
    await wait(1000)
    playSound('sounds/prerace.ogg', 0.5)
    notifyjs("2")
    await wait(1000)
    playSound('sounds/prerace.ogg', 0.5)
    notifyjs("1")
    await wait(raceData.countDownTimer * 1000)
    playSound('sounds/racego.ogg', 0.5)

    notifyjs("Поехали")
    raceEnded = false;
    raceVehicle.setMaxSpeed(9999999);
    raceDataMy.startTime = getTime().full;
    raceDataMy.bestLap = null;
    racebrowser.execute(`app.qualificationShow = false;
    app.startRace();`);
    raceVehicle.freezePosition(false);
    mp.vehicles.forEach(vehicle => {
      if(vehicle.handle){
        vehicle.freezePosition(false);
      }
    })
    let pitCheck;
    let pitBlip;

    /*let intervalCollision = setInterval(function() {
      if (!raceData) {
        enableCollisions(true)
        clearInterval(intervalCollision);
      } else {
        enableCollisions(raceData.collision)
      }
    }, 500)*/


    if (raceData.pitActive) {

      setTimeout(async function() {
        let pitPosition = raceData.pitstops[raceDataMy.startPosition]
        pitPosition.x = methods.parseFloat(pitPosition.x)
        pitPosition.y = methods.parseFloat(pitPosition.y)
        pitPosition.z = methods.parseFloat(pitPosition.z)
        //pitPosition.r = methods.parseFloat(pitPosition.r)
        pitCheck = mp.markers.new(36, new mp.Vector3(pitPosition.x, pitPosition.y, pitPosition.z + 0.5), 3 + 0.0001, {
          direction: new mp.Vector3(0, 0, 75),
          color: [0, 255, 0, 50],
          visible: true,
          dimension: player.dimension
        });
        pitBlip = mp.blips.new(446, new mp.Vector3(pitPosition.x, pitPosition.y, pitPosition.z), {
          name: "Пит стоп",
          color: 25,
          shortRange: false,
          dimension: player.dimension
        });
        while (!raceEnded) {
          if (mp.game.gameplay.getDistanceBetweenCoords(pitPosition.x, pitPosition.y, pitPosition.z, player.position.x, player.position.y, player.position.z, false) < 2 && raceVehicle.getSpeed() < 1) {
            raceVehicle.freezePosition(true);
            notifyjs("Обслуживаем ТС");
            await wait(5000);
            notifyjs("Заливаем топливо");
            await wait(5000);
            mp.events.callRemote("raceFixVehicle");
            await wait(500);
            raceVehicle.freezePosition(false);
            await wait(500);
            if (raceData.pitSpeed != null && raceData.pitZoneEnter != null && raceData.pitZoneExit != null) raceVehicle.setMaxSpeed(raceData.pitSpeed / 2.236936);
            while (mp.game.gameplay.getDistanceBetweenCoords(pitPosition.x, pitPosition.y, pitPosition.z, player.position.x, player.position.y, player.position.z, false) < 3) {
              await wait(1000)
            }
          } else {
            await wait(10)
          }
        }
        pitCheck.destroy();
        pitBlip.destroy();

      }, 1000)
    }


    if (raceData.pitSpeed != null && raceData.pitZoneEnter != null && raceData.pitZoneExit != null) {
      setTimeout(async function() {
        while (!raceEnded) {
          if (mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(raceData.pitZoneEnter.x), methods.parseFloat(raceData.pitZoneEnter.y), methods.parseFloat(raceData.pitZoneEnter.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(raceData.pitZoneEnter.r) + 0.5) {
            raceVehicle.setMaxSpeed(raceData.pitSpeed / 2.236936);
            notifyjs("Скорость автоматически снижена до " + raceData.pitSpeed + " миль в час");
            //await wait(4000);
            while ((mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(raceData.pitZoneEnter.x), methods.parseFloat(raceData.pitZoneEnter.y), methods.parseFloat(raceData.pitZoneEnter.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(raceData.pitZoneEnter.r) + 0.5)) await wait(100);
          } else if (mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(raceData.pitZoneExit.x), methods.parseFloat(raceData.pitZoneExit.y), methods.parseFloat(raceData.pitZoneExit.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(raceData.pitZoneExit.r) + 0.5) {
            raceVehicle.setMaxSpeed(9999999);
            notifyjs("Скорость восстановлена");
            //await wait(4000);
            while ((mp.game.gameplay.getDistanceBetweenCoords(methods.parseFloat(raceData.pitZoneExit.x), methods.parseFloat(raceData.pitZoneExit.y), methods.parseFloat(raceData.pitZoneExit.z), player.position.x, player.position.y, player.position.z, false) < methods.parseFloat(raceData.pitZoneExit.r) + 0.5)) await wait(100);
          }
          await wait(20);
        }
        raceVehicle.setMaxSpeed(9999999);
      }, 1000)
    }


    setTimeout(async function() {
      while (!raceEnded) {
        if (player.vehicle != raceVehicle || player.isDead()) {
          await wait(3000);
          await raceRespawn();
          await wait(3000);
        }
        await wait(100);
      }
    }, 1000)

    setTimeout(async function() {
      let respawnTimerButton = 0;
      while (!raceEnded) {
        if (mp.game.controls.isDisabledControlPressed(0, 75)) {
          respawnTimerButton = respawnTimerButton + 10;
          racebrowser.execute(`app.respawnLineTimer = ${(respawnTimerButton/10)};`);
          racebrowser.execute(`app.respawnLineName = 'Респавн';`);
          if (respawnTimerButton >= 1000) {
            respawnTimerButton = 0;
            racebrowser.execute(`app.respawnLineTimer = ${respawnTimerButton};`);
            await raceRespawn();
            await wait(5000);
          }
        } else {
          if (respawnTimerButton != 0) {
            respawnTimerButton = 0;
            racebrowser.execute(`app.respawnLineTimer = ${respawnTimerButton};`);
          }
          await wait(1000);
        }
        await wait(10);
      }
    }, 1000)

    setTimeout(async function() {
      let timess = getTime().full;
      let bestcheck00 = raceData.checkpoints[(raceData.checkpoints.length - 3)]
      bestcheck00.x = methods.parseFloat(bestcheck00.x)
      bestcheck00.y = methods.parseFloat(bestcheck00.y)
      bestcheck00.z = methods.parseFloat(bestcheck00.z)
      bestcheck00.r = methods.parseFloat(bestcheck00.r)

      let bestcheck0 = raceData.checkpoints[(raceData.checkpoints.length - 2)]
      bestcheck0.x = methods.parseFloat(bestcheck0.x)
      bestcheck0.y = methods.parseFloat(bestcheck0.y)
      bestcheck0.z = methods.parseFloat(bestcheck0.z)
      bestcheck0.r = methods.parseFloat(bestcheck0.r)

      let bestcheck1 = raceData.checkpoints[(raceData.checkpoints.length - 1)]
      bestcheck1.x = methods.parseFloat(bestcheck1.x)
      bestcheck1.y = methods.parseFloat(bestcheck1.y)
      bestcheck1.z = methods.parseFloat(bestcheck1.z)
      bestcheck1.r = methods.parseFloat(bestcheck1.r)

      let pitPosition = {x: 0.0, y: 0.0, z: -10.0, r: 5.0}
      if (raceData.pitActive) {
        pitPosition = raceData.pitstops[raceDataMy.startPosition]
        pitPosition.x = methods.parseFloat(pitPosition.x)
        pitPosition.y = methods.parseFloat(pitPosition.y)
        pitPosition.z = methods.parseFloat(pitPosition.z)
        pitPosition.r = 5.0
      }
      while (!raceEnded) {
        while(mp.game.gameplay.getDistanceBetweenCoords(bestcheck00.x, bestcheck00.y, bestcheck00.z, player.position.x, player.position.y, player.position.z, false) > bestcheck00.r + 3) await wait(30)
        while(mp.game.gameplay.getDistanceBetweenCoords(bestcheck0.x, bestcheck0.y, bestcheck0.z, player.position.x, player.position.y, player.position.z, false) > bestcheck0.r + 3) await wait(30)
        while(mp.game.gameplay.getDistanceBetweenCoords(bestcheck1.x, bestcheck1.y, bestcheck1.z, player.position.x, player.position.y, player.position.z, false) > (bestcheck1.r + 3) &&
        mp.game.gameplay.getDistanceBetweenCoords(pitPosition.x, pitPosition.y, pitPosition.z, player.position.x, player.position.y, player.position.z, false) > (pitPosition.r + 3)) await wait(30)
        if (!raceDataMy.bestLap || raceDataMy.bestLap > (getTime().full - timess)) {
          raceDataMy.bestLap = getTime().full - timess;
          racebrowser.execute(`app.setBestLap(${raceDataMy.bestLap})`);
        }
        timess = getTime().full;
        await wait(10000)
      }
    }, 1)

    while (!raceEnded) {

      if (raceData.ignoreLastCheck && raceDataMy.check + 1 == raceData.checkpoints.length && raceData.circleCount > raceDataMy.lap && raceData.pitActive) {
        raceDataMy.lap++;
        raceDataMy.check = 0;
        raceDataMy.checkShow++;
        //mp.events.callRemote("racePosition", raceData.lobbyId, raceDataMy.check, raceDataMy.lap, (getTime().full - raceDataMy.startTime));
      }



      if (raceDataMy.check == 0) {
        //if(raceDataMy.startLap){

        //}
        raceDataMy.startLap = getTime().full;

      }
      //notifyjs("Круг "+raceDataMy.lap+" | Чек "+(raceDataMy.check+1))
      racebrowser.execute(`app.currentCheckPoint = ${raceDataMy.check+1};app.currentLap = ${raceDataMy.lap};`);
      let checkdata = raceData.checkpoints[raceDataMy.check];
      checkdata.x = methods.parseFloat(checkdata.x)
      checkdata.y = methods.parseFloat(checkdata.y)
      checkdata.z = methods.parseFloat(checkdata.z)
      checkdata.r = methods.parseFloat(checkdata.r)
      // CURRENT CHECK
      let checkdataNext = null;
      // NEXT CHECK PREDATA



      let currentCheckType; // Type of current check | 1 - Default, 2 - Last in circle, 3 - Finish check
      let currentCheckTypeShow = checkType.check;
      if (raceDataMy.check + 1 == raceData.checkpoints.length) {
        // Last check
        currentCheckType = 2;
        if (raceData.circleCount == raceDataMy.lap) {
          // Finish
          currentCheckType = 3;
          currentCheckTypeShow = checkType.finish;
        } else {
          checkdataNext = raceData.checkpoints[0];
        }
      } else {
        currentCheckType = 1
        checkdataNext = raceData.checkpoints[raceDataMy.check + 1];
      }

      if (checkdataNext) {
        checkdataNext.x = methods.parseFloat(checkdataNext.x)
        checkdataNext.y = methods.parseFloat(checkdataNext.y)
        checkdataNext.z = methods.parseFloat(checkdataNext.z)
        checkdataNext.r = methods.parseFloat(checkdataNext.r)
      }

      let check = mp.checkpoints.new(currentCheckTypeShow, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), checkdata.r + 0.0001, {
        direction: (!checkdataNext) ? new mp.Vector3(0, 0, 75) : new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z + 2),
        color: [255, 255, 0, 60],
        visible: true,
        dimension: player.dimension
      });
      let blip = mp.blips.new((!checkdataNext) ? 611 : 1, new mp.Vector3(checkdata.x, checkdata.y, checkdata.z), {
        name: (!checkdataNext) ? 'Финишная точка' : 'Контрольная точка',
        color: 5,
        shortRange: false,
        dimension: player.dimension
      });
      let blipNext; // Маркер следующей точки если надо
      if (checkdataNext) {
        blipNext = mp.blips.new(1, new mp.Vector3(checkdataNext.x, checkdataNext.y, checkdataNext.z), {
          name: (raceDataMy.check + 1 == raceData.checkpoints.length && raceData.circleCount == raceDataMy.lap) ? 'Финишная точка' : 'Контрольная точка',
          color: 5,
          alpha: 60,
          shortRange: true,
          dimension: player.dimension
        });
      }



      let reached = false;

      while (!reached && !raceEnded) {
        let distance = mp.game.gameplay.getDistanceBetweenCoords(checkdata.x, checkdata.y, checkdata.z, player.position.x, player.position.y, player.position.z, false);
        if (distance < (checkdata.r + 0.8)) {
          reached = true;
          mp.game.audio.playSound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", false, 0, true);

        } else {
          await wait(10)
        }
      }

      if (blipNext != null) blipNext.destroy();
      check.destroy();
      blip.destroy();

      if (!raceEnded) {


        if (currentCheckType == 3) {
          raceEnded = true;
        } else {
          mp.events.callRemote("racePosition", raceData.lobbyId, raceDataMy.check, raceDataMy.lap, (getTime().full - raceDataMy.startTime));
          if (currentCheckType == 1) {
            raceDataMy.check++;
            raceDataMy.checkShow++;
          } else if (currentCheckType == 2) {
            raceDataMy.lap++;
            raceDataMy.check = 0;
            raceDataMy.checkShow++;
          }
        }
      }




    }




    racebrowser.execute(`app.freezedTimer = true`);
    if (raceData != null) mp.events.callRemote("raceFinished", raceDataMy.check, raceDataMy.lap, (getTime().full - raceDataMy.startTime), raceDataMy.bestLap);
  })

  async function raceRespawn(x:number = null, y:number = null, z:number = null, h:number = null) {
    //if(player.isDead()) return;
    let respPosition:{
      x?:number;
      y?:number;
      z?:number;
      h?:number;
      fix?:boolean;
    } = {};
    if(x == null) respPosition = getPositionForRespawn();
    else {
      respPosition.x = x;
      respPosition.y = y;
      respPosition.z = z;
      respPosition.h = h;
      respPosition.fix = false;
    }
    if (!respPosition) return;
    respPosition.x = methods.parseFloat(respPosition.x);
    respPosition.y = methods.parseFloat(respPosition.y);
    respPosition.z = methods.parseFloat(respPosition.z);
    respPosition.h = methods.parseFloat(respPosition.h);
    mp.events.callRemote("raceRespVehicle", respPosition.x, respPosition.y, respPosition.z, respPosition.h, respPosition.fix);
    await wait(3000);
    return;
  }

  mp.events.register("raceRespawn", async function() {
    raceRespawn();
  })

  mp.events.register("freezeRaceVeh", async function() {
    raceVehicle.setMaxSpeed(0);
  })

  mp.events.register("unfreezeRaceVeh", async function() {
    raceVehicle.setMaxSpeed(9999999999);
  })

  function getPositionForRespawn() {
    if (raceData == null) return;
    let position = {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      h: 0.0,
      fix: false
    }
    if (raceData.pitActive) {
      let pitPosition = raceData.pitstops[raceDataMy.startPosition]
      position.x = methods.parseFloat(pitPosition.x)
      position.y = methods.parseFloat(pitPosition.y)
      position.z = methods.parseFloat(pitPosition.z)
      position.h = methods.parseFloat(pitPosition.h)
      notifyjs("Респавн в питах")
    } else {
      let checkdataid;
      if (raceDataMy.check == 0) {
        checkdataid = raceData.checkpoints.length - 1;
        if (raceData.ignoreLastCheck) checkdataid = checkdataid - 1;
      } else {
        checkdataid = raceDataMy.check - 1;
      }
      let checkdata = raceData.checkpoints[checkdataid];
      position.x = methods.parseFloat(checkdata.x)
      position.y = methods.parseFloat(checkdata.y)
      position.z = methods.parseFloat(checkdata.z)
      position.h = methods.parseFloat(checkdata.h)
      position.fix = true
      notifyjs("Вы берёте чек " + raceDataMy.check + " мы вас шлём на " + checkdataid)
    }
    return position
  }
}, 100);

