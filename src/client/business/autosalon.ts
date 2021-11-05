import { gui } from '../modules/gui';
import { user } from '../user';
import { methods } from '../modules/methods';
import { mouseMove } from '../control';
import { sleep } from '../../util/methods';

export {};
const player = mp.players.local;
let camera: CameraMp = null;
let vehicle: VehicleMp = null;
let carsData: any[] = null;
let carId = 0;
let colors: [number, string][] = [[42, '#FFC016'], [27, '#B4131A'], [23, '#999C94'], [0, '#000000']];
let colorId = 0;
let type = '';
let exitPos: Vector3Mp;
let newRot = 132.0;

let showType: string;
let showPos: [number, number, number];
let testPos: [number, number, number, number];
let showOffset: [number, number, number] = [1.23276901245117, -10.93903710937500, 2.160024642944336];
let showHeading: number;
export let testDriveMode = false;


mouseMove((right, down, leftKey) => {
  if (!leftKey) return;
  if (!vehicle) return;
  if (!vehicle.handle) return;
  if (testDriveMode) return;
  vehicle.setHeading(vehicle.getHeading()+(right/1.5));
})

function focusCamera(){
  const _colors = colors.map((item) => item[0]);
  if (mp.vehicles.exists(vehicle)) {
    vehicle.position = new mp.Vector3(...showPos)
    vehicle.setHeading(showHeading);
    // vehicle.freezePosition(true);
    vehicle.setColours(_colors[colorId], _colors[colorId]);
    if (showType == 'auto' || showType == 'technical') {
      // startRotateVehicle();
    }
    vehicle.setFixed()
  }
  mp.game.streaming.requestCollisionAtCoord(...showPos);
  mp.game.streaming.setFocusArea(
    showPos[0],
    showPos[1],
    showPos[2],
    0.0,
    0.0,
    0.0
  );
  player.freezePosition(true);
  player.position = new mp.Vector3(showPos[0], showPos[1], showPos[2] + 50);
  !camera
    ? ((camera = mp.cameras.new('car_dealing')),
      mp.game.cam.renderScriptCams(true, false, 0, true, false),
      camera.setFov(30))
    : true;

  camera.setCoord(showPos[0] + showOffset[0], showPos[1] + showOffset[1], showPos[2] + showOffset[2]);
  if (mp.vehicles.exists(vehicle)) {
    camera.pointAtCoord(vehicle.position.x, vehicle.position.y, vehicle.position.z);
  }
  mp.game.cam.renderScriptCams(true, true, 1500, true, false);
  mp.game.ui.displayRadar(false);

  gui.setGui('autosalon');
  gui.browser.executeAll([
    `CEF.buycar.allowTestDrive()`,
    `CEF.buycar.setType('${type}')`,
    `CEF.buycar.setCars('${JSON.stringify(carsData)}')`,
    `CEF.buycar.setCar(${carId})`,
    `CEF.buycar.setColors('${JSON.stringify(colors.map((item) => item[1]))}')`,
  ]);
  user.hideLoadDisplay(500, false);
}


mp.events.add({
  'client:autosalon:startBuyCar': (_carsData, colorsData, _type, _showType) => {
    carId = 0;
    gui.browser.execute('CEF.hud.showHud(false)');
    gui.browser.execute('window.chatAPI.show(false)');
    if (vehicle) {
      vehicle.destroy();
      vehicle = null;
    }
    exitPos = player.position;
    carsData = _carsData;
    colors = colorsData;
    type = _type;
    

    showType = _showType;
    switch(showType) {
      case 'auto':
        showPos = [-43.07925796508789, -1094.6630859375, 25.762327194213867];
        testPos = [-47.19, -1112.14, 26.44, 70.43]
        showOffset= [1.23276901245117, -10.93903710937500, 2.160024642944336];
        showHeading = 132;
        break;
      case 'boat':
        showPos = [-833.9078369140625, -1440.7279052734375, -0.4744686484336853];
        testPos = [-841.29, -1440.42, -0.47, -177.05]
        showOffset= [11.23276901245117, -10.93903710937500, 6.160024642944336];
        showHeading = 182;
        break;
      case 'plane':
        showPos = [-1442.887451171875, -2661.849365234375, 13.94493579864502];
        testPos = [-921.96, -3188.10, 13.95, 55.90]
        showOffset= [21.23276901245117, -10.93903710937500, 16.160024642944336];
        showHeading = 182;
        break;  
      case 'technical':
        showPos = [778.1519165039062, -2970.34716796875, 5.800717353820801];
        testPos = [870.61, -2956.15, 5.90, -92.45]
        showOffset= [4.23276901245117, -10.93903710937500, 4.160024642944336];
        showHeading = 132;
        break;  
    }

    vehicle = mp.vehicles.new(
      mp.game.joaat(carsData[carId].model),
      new mp.Vector3(...showPos),
      {
        dimension: player.dimension,
        heading: showHeading
      }
    );

    focusCamera();
  },
  'client:autosalon:changeCar': async (id) => {


    if (vehicle && mp.vehicles.exists(vehicle)) {
      vehicle.destroy();
    }
    carId = id;
    vehicle = mp.vehicles.new(
      mp.game.joaat(carsData[carId].model),
      new mp.Vector3(showPos[0], showPos[1], showPos[2]),
      {
        dimension: mp.players.local.dimension,
        heading: showHeading
      }
    );
    mp.game.streaming.setModelAsNoLongerNeeded(mp.game.joaat(carsData[carId].model));
    if (mp.vehicles.exists(vehicle)) {
      vehicle.setHeading(showHeading);
      const _colors = colors.map((item) => item[0]);
      vehicle.setColours(_colors[colorId], _colors[colorId]);
      if (showType == 'auto' || showType == 'technical') {
        // startRotateVehicle();
      }
    }
  },
  'client:autosalon:changeColor': (id) => {
    if (vehicle && mp.vehicles.exists(vehicle)) {
      colorId = id;
      const _colors = colors.map((item) => item[0]);
      vehicle.setColours(_colors[colorId], _colors[colorId]);
    }
  },
  'client:autosalon:stopBuyCar': () => {
    gui.browser.execute('CEF.gui.setGui(null)');
    gui.browser.execute('CEF.hud.showHud(true)');
    gui.browser.execute('window.chatAPI.show(true)');


    if (vehicle && mp.vehicles.exists(vehicle)) {
      vehicle.destroy();
      vehicle = null;
    }

    carId = 0;
    colorId = 0;

    if (camera) {
      camera.destroy(true);
      camera = null;
    }
    //currentWeaponPos = null;
    mp.game.cam.renderScriptCams(false, false, 0, false, false);
    player.position = exitPos;
    player.freezePosition(false);
    mp.game.invoke('0x198F77705FA0931D', player.handle);
    mp.game.ui.displayRadar(true);

    mp.game.cam.setGameplayCamRelativeHeading(0);

    user.hideLoadDisplay(500, false);
  },
  'client:autosalon:rentCar': (id: number, colorId: number) => {
    mp.events.callRemote('server:autosalon:rentCar', id, colorId);
  },
  'client:autosalon:testDrive': async () => {
    if(!vehicle) return;
    testDriveMode = true;
    vehicle.position = new mp.Vector3(testPos[0], testPos[1], testPos[2])
    vehicle.setHeading(testPos[3]);
    


    user.showLoadDisplay(500)
    await sleep(1000);
    gui.browser.execute('CEF.gui.setGui(null)');
    gui.browser.execute('CEF.hud.showHud(true)');
    gui.browser.execute('window.chatAPI.show(true)');


    mp.game.invoke("0xC20E50AA46D09CA8", player.handle, vehicle.handle, 1, -1, 1.0, 16, 0);


    if (camera) {
      camera.destroy(true);
      camera = null;
    }
    //currentWeaponPos = null;
    mp.game.cam.renderScriptCams(false, false, 0, false, false);
    player.freezePosition(false);
    mp.game.invoke('0x198F77705FA0931D', player.handle);
    mp.game.ui.displayRadar(true);

    mp.game.cam.setGameplayCamRelativeHeading(0);

    user.hideLoadDisplay(500, false);
    user.notify('У вас 60 секунд на тестирование транспорта');
    vehicle.engine = true;
    vehicle.setEngineOn(true, true, true)

    vehicle.setFixed()
    let timeend = false;
    setTimeout(() => {
      timeend = true;
    }, 60000)
    await sleep(5000);
    while (player.isInVehicle(vehicle.handle, false) && !timeend) await sleep(500);
    user.notify('~r~Тестирование завершено');
    user.showLoadDisplay(500)
    await sleep(1000);
    focusCamera()
    testDriveMode = false;
  },
  'client:autosalon:buyCar': (id: number, colorId: number) => {
    mp.events.callRemote('server:autosalon:buyCar', id, colorId);
  },
 });
