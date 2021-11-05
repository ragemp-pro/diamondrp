import { gui } from './modules/gui';
import { user } from './user';
import { methods } from './modules/methods';
import { gangWarTerData } from '../declaration/gangwar';
import { fractionUtil } from '../util/fractions';
import { testDriveMode } from './business/autosalon';

var bigmap = {
  status: 0,
  timer: <number> null
};

bigmap.status = 0;
bigmap.timer = null;

mp.game.ui.setRadarZoom(1.0);
mp.game.ui.setRadarBigmapEnabled(false, false);


let gangWarPos: { x: number, y: number, z: number, d: number };
let gangWarData: gangWarTerData[];
let ingangWarZone = false
mp.events.add('gangWarPos', (pos:string) => {
  gangWarPos = JSON.parse(pos);
})
mp.events.add('gangWarStop', () => {
  gangWarPos = null
})

mp.events.add('gangTerData', (data: string) => {
  gangWarData = JSON.parse(data);
})


setInterval(() => {
  if(!user.isLogin()) return;
  if (gangWarData) {
    let fnd = false;
    gangWarData.forEach(item => {
      let polygon: [number, number][] = [];

      const r = (item.position.d / 2)
      polygon.push(
        [item.position.x - r, item.position.y - r],
        [item.position.x - r, item.position.y + r],
        [item.position.x + r, item.position.y - r],
        [item.position.x + r, item.position.y + r],
      )

      let ins = methods.pointInBox([mp.players.local.position.x, mp.players.local.position.y], polygon)

      
      if (ins) {
        fnd = true
        gui.browser.execute(`CEF.hud.setGangZone("${item.name}", "${fractionUtil.getFractionColor(item.ownerid)}", "${fractionUtil.getFractionName(item.ownerid)}");`);
      }
    })
    if (!fnd) gui.browser.execute(`CEF.hud.setGangZone(null, null, null)`);
  }
  if (!gangWarPos){
    if (ingangWarZone) {
      gui.browser.execute(`CEF.hud.setGangWar(false)`);
      ingangWarZone = false;
    }
    return;
  }
  if (methods.distanceToPos(mp.players.local.position, new mp.Vector3(gangWarPos.x, gangWarPos.y, gangWarPos.z)) < 150){
    if (!ingangWarZone) {
      gui.browser.execute(`CEF.hud.setGangWar(true)`);
      ingangWarZone = true;
    }
  } else {
    if (ingangWarZone){
      gui.browser.execute(`CEF.hud.setGangWar(false)`);
      ingangWarZone = false;
    }
  }
}, 1000)


mp.events.add("render", () => {
  if(mp.game.controls.isControlJustPressed(0, 48)){
    bigmap.status++;
    if(bigmap.status == 1){
      setTimeout(() => {
        if(bigmap.status == 1) bigmap.status = 0;
      }, 2000)
    }
    if(bigmap.status == 3) bigmap.status = 0;

    if(bigmap.status >= 2){
      toggleBigMap = true;
    } else {
      toggleBigMap = false;
    }
    updateSavezone();
    setHudInfoLinePos();
  }
  if(bigmap.status == 2){
    mp.game.ui.setRadarBigmapEnabled(true, false);
    mp.game.ui.setRadarZoom(0.0);
  } else {
    mp.game.ui.setRadarBigmapEnabled(false, false);
  }
});


let toggleBigMap = false;
const GetMinimapAnchor = () => {
  let safezone = mp.game.graphics.getSafeZoneSize();
  let safezone_x = 1.0 / 20.0;
  let safezone_y = 1.0 / 20.0;

  let aspect_ratio = mp.game.graphics.getScreenAspectRatio(false);
  let objectRes = mp.game.graphics.getScreenActiveResolution(1, 1);
  let res_x = objectRes.x;
  let res_y = objectRes.y;
  let xscale = 1.0 / res_x;
  let yscale = 1.0 / res_y;
  let bigMapMultipler = 1;
  //let bigMapMultipler = 2.3
  if (toggleBigMap) xscale = xscale * 1.45, bigMapMultipler = 2.3;

  let left_x = xscale * (res_x * (safezone_x * ((Math.abs(safezone - 1.0)) * 10)));
  let bottom_y = yscale * (res_y * (safezone_y * ((Math.abs(safezone - 1.0)) * 10)));
  let height = yscale * (res_y / 5.674) * bigMapMultipler;
  let width = xscale * (res_x / (4 * aspect_ratio));

  let height_px = height * res_y;
  let width_px = width * res_x;

  let left_px = left_x * res_x;
  let bottom_px = bottom_y * res_y;

  let Minimap = {
    width: width,
    height: yscale * (res_y / 5.674),  
    left_x: left_x,
    bottom_y: bottom_y,
    right_x: left_x + width,
    top_y: bottom_y - height,
    x: left_x,
    y: bottom_y - height,
    xunit: xscale,
    yunit: yscale,
    res_x: res_x,
    res_y: res_y,
    height_px,
    width_px,
    left_px,
    bottom_px,
  };
  return Minimap;
};

export let saveZone = GetMinimapAnchor();

const updateSavezone = () => {
  saveZone = GetMinimapAnchor();
  if (gui.browser) {
    const { width_px, height_px, left_px, bottom_px } = saveZone;
    // mp.console.logInfo(width_px);
    gui.browser.execute(`CEF.alert.setSafezoneInfo(${width_px}, ${height_px}, ${left_px}, ${bottom_px})`);
  }
}
setInterval(updateSavezone, 3000);
updateSavezone();
const setHudInfoLinePos = () => {
  const { width_px, left_px, bottom_px } = saveZone;
  if(user.isLogin())gui.browser.execute(`CEF.hud.setInfoLinePos(${left_px + width_px}, ${bottom_px})`);
  setTimeout(setHudInfoLinePos, 5000);
}

mp.events.add('client:hud:load', () => {
  gui.hudLoaded = true;
  gui.browser.execute(`CEF.hud.setMoney(${user.get('money')});
  CEF.hud.setHasBankCard(${!!(user.get('bank_prefix') > 0)});
  CEF.hud.setMoneyBank(${user.get('money_bank')});
  CEF.hud.setHasWatch(${!!user.get('item_clock')});
  CEF.hud.updateHelpToggle(${!!mp.storage.data.help_toggle})`);
  setHudInfoLinePos();
});


mp.events.add('client:hud:updateHelpToggle', (toggle: boolean) => {
  mp.storage.data.help_toggle = toggle;
  mp.storage.flush();
});

const bmxhash = mp.game.joaat("bmx")
let lowFuelNotify = false;

mp.events.add('renderHalf', () => {
  if (gui.hudLoaded && user.isLogin()) {
    if (mp.players.local.vehicle && !mp.players.local.isDead() && mp.players.local.vehicle.model != bmxhash) {
      const vehicle = mp.players.local.vehicle;
      if (vehicle.getPedInSeat(-1) == mp.players.local.handle) {
        if (!gui.showSpeedometer) {
          gui.showSpeedometer = true;
          if(gui.browser)gui.browser.execute(`CEF.speedometer.setSpeedometer(true)`);
        }
        const vehInfo = methods.getVehicleInfo(vehicle.model);
        let fuel = -1;
        if (vehInfo.fuel_full > 1){
          if (!testDriveMode){
            fuel = methods.parseInt(vehicle.getVariable('fuel'));
  
            if(!lowFuelNotify){
              if(vehicle.getIsEngineRunning()){
                if((vehInfo.fuel_full / 20) >= fuel){
                  mp.game.ui.notifications.show('~r~Осталось менее 5% топлива');
                } else if((vehInfo.fuel_full / 10) >= fuel){
                  mp.game.ui.notifications.show('~r~Осталось менее 10% топлива');
                }
                lowFuelNotify = true;
                setTimeout(() => {
                  lowFuelNotify = false;
                }, 60000)
              }
            }
          }

        }
        let lightState = vehicle.getLightsState(1, 1);
        if(gui.browser)gui.browser.execute(`CEF.speedometer.setSpeed(${methods.getCurrentSpeed()});
        CEF.speedometer.setFuel(${fuel});
        CEF.speedometer.setLights(${lightState.lightsOn || lightState.highbeamsOn});
        CEF.speedometer.setEngine(${vehicle.getIsEngineRunning() ? 'true' : 'false'});
        `);
      }
    } else if (gui.showSpeedometer) {
      gui.showSpeedometer = false;
      if(gui.browser)gui.browser.execute(`CEF.speedometer.setSpeedometer(false)`);
    }
  }
});