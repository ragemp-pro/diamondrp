import { methods } from './modules/methods';
import { user } from './user';
import { checkpoint } from './managers/checkpoint';
import { gui } from './modules/gui';
import { spawn } from './managers/spawn';
import { ui } from './modules/ui';
import { timer } from './modules/timer';
import { skills } from './skills';
import { taxi } from './jobs/taxi';
import { jail } from './managers/jail';
import { weather } from './managers/weather';
import { enums } from './enums';
import { cloth } from './business/cloth';
import { teleportProtection } from './modules/ach';
import { sleep } from '../util/methods';
// import voice from './voice';
const player = mp.players.local;
let personageCam: CameraMp = null;
let currentCamCoords = null;
let currentCamDist = 0.2;
let currentCamRot = -2;




let pos:[number, number, number, number][] = [
  [-1037.20, -2728.15, 20.08, 239.87],
  // [-935.83, -1804.24, 19.76, 313.09],
  // [-732.49, -1157.45, 10.61, 35.26],
  // [-630.72, -849.96, 24.96, 349.18],
  [-444.81, -243.59, 36.06, 118.25],
]

const startBusPosEnd = new mp.Vector3(-515.74, -263.49, 35.38)
const startBusHeadingEnd = 112.27;
export let registerDrawNow = false;
async function registerDraw(){
  // registerDrawNow = true;
  // let veh = mp.vehicles.new(mp.game.joaat('BUS'), new mp.Vector3(pos[0][0], pos[0][1], pos[0][2]), {
  //   heading: pos[0][3],
  //   dimension: player.dimension
  // })
  // veh.setHeading(pos[0][3])
  // veh.setOnGroundProperly()
  // await sleep(100);
  // veh.engine = true;
  // veh.setEngineOn(true, true, true)
  // let driver = mp.peds.new(mp.game.joaat('a_m_m_farmer_01'), new mp.Vector3(pos[0][0] + 2, pos[0][1], pos[0][2]), 0, mp.players.local.dimension);
  // driver.freezePosition(false);
  // await sleep(500);
  // mp.game.invoke("0xC20E50AA46D09CA8", driver.handle, veh.handle, 1, -1, 1.0, 16, 0);
  // await sleep(500);
  // user.hideLoadDisplay(500);
  // player.taskEnterVehicle(veh.handle, 10000, 0, 1.0, 1, 0);
  // while(!player.isInVehicle(veh.handle, false)) await sleep(500);
  // await sleep(1000);
  // mp.game.invoke("0xE1EF3C1216AFF2CD", driver.handle);
  // mp.game.invoke("0x158BB33F920D360C", driver.handle, veh.handle, startBusPosEnd.x, startBusPosEnd.y, startBusPosEnd.z, 20 / 2.2, 786603, 20.0);
  // await sleep(5000);


  // user.showLoadDisplay(500)
  // await sleep(1000);
  // mp.game.invoke("0xE1EF3C1216AFF2CD", driver.handle);
  // veh.freezePosition(true);
  // veh.setCoordsNoOffset(startBusPosEnd.x, startBusPosEnd.y, startBusPosEnd.z, true, true, true)
  // veh.setHeading(startBusHeadingEnd)
  // await sleep(1000);
  // user.hideLoadDisplay(500)
  // await sleep(100);
  // // veh.setOnGroundProperly();
  // player.taskLeaveVehicle(veh.handle, 0);
  // await sleep(5000);
  // user.showLoadDisplay(500)
  // await sleep(1000);
  // driver.destroy();
  // veh.destroy();
  player.position = new mp.Vector3(-520.84, -256.94, 35.63)
  player.setCoordsNoOffset(-520.84, -256.94, 35.63, true, true, true)
  player.setHeading(29.87)
  // await sleep(100);
  // user.hideLoadDisplay(500)
  user.setVirtualWorld(0);
  // registerDrawNow = false;
}




mp.events.add({
  'render': () => {
    if (!registerDrawNow) return;
    mp.game.controls.disableAllControlActions(0);
    mp.game.controls.disableAllControlActions(1);
  },
  'regtest': async () => {
    registerDraw();
  },
  'client:player:init': async (data) => {
    await methods.sleep(1000);
    mp.events.register('client:auth:change_spawn', ([x, y, z]) => {
      spawn.changeCamPos(x, y, z);
    });
    if (data) {
      data = data.map((player: { rp_name: string; spawns: any[] }) => {
        return { name: player.rp_name, spawnPos: player.spawns };
      });
    }
    methods.debug('Event: client:player:init');
    user.showLoadDisplay();
    checkpoint.checkPosition();
    mp.nametags.enabled = false;
    mp.discord.update('Diamond RolePlay', 'gta-5.ru');
    mp.players.local.freezePosition(true);
    mp.game.ui.displayRadar(false);
    mp.players.local.setVisible(false, false);
    mp.players.local.position = new mp.Vector3(-306.342, 202.8106, 190.4903);
    mp.players.local.heading = 0;
    
    if (data) {
      gui.setGui('login');
      mp.events.triggerBrowser('cef:login:setData', data);
      const [_, x, y, z] = data[0].spawnPos[0];
      spawn.setSpawnCam(x, y, z);
    } else {
      gui.setGui('reg');
    }

    await methods.sleep();
    user.clearChat();
    methods.requestIpls();
    methods.loadAllPeds();

    user.hideLoadDisplay();
  },
  'client:user:login:success': async (x, y, z, rot, data, is_reg) => {
    let cacheData = new Map(data);
    user.setCacheData(cacheData);
    mp.game.ui.displayRadar(true);

    // voice.setSettings('voiceVolume', user.get('voiceVolume'));
    // voice.setSettings('radioBalance', user.get('s_radio_bal'));
    // voice.setSettings('radioVolume', user.get('s_radio_vol'));

    if (is_reg) {
      mp.storage.data.help_toggle = true;
      mp.storage.flush();
    }

    methods.debug('Event: client:user:login:success');

    ui.create();
    //user.showLoadDisplay();
    await methods.sleep(500);
    spawn.destroy();

    mp.players.local.heading = rot;

    mp.players.local.freezePosition(false);
    mp.players.local.setVisible(true, false);
    methods.disableAllControls(false);

    timer.loadAll();
    skills.execute();
    taxi.execute();

    if (user.get('jail_time') > 0) jail.jailPlayer(user.get('jail_time'), (user.get('jailed_admin') == 1));
    else user.teleport(x, y, z);

    //await methods.sleep(900);
    gui.browser.execute('CEF.hud.setHud(true)');

    user.setIsLogin(true);

    jail.timer();
    mp.gui.cursor.show(false, false);
    if (is_reg){
      registerDraw();
    }
  },
  'client:user:personage:start': async () => {
    user.isTeleport = true;

    const skin = {
      SEX: 0,
      GTAO_SHAPE_THRID_ID: 0,
      GTAO_SKIN_THRID_ID: 0,
      GTAO_SHAPE_SECOND_ID: 0,
      GTAO_SKIN_SECOND_ID: 0,
      GTAO_SHAPE_MIX: 0,
      GTAO_SKIN_MIX: 0,
      GTAO_HAIR: 0,
      GTAO_HAIR_COLOR: 1,
      GTAO_HAIR_COLOR2: 1,
      GTAO_EYE_COLOR: 0,
      GTAO_EYEBROWS: 0,
      GTAO_EYEBROWS_COLOR: 1,
      GTAO_OVERLAY: 0,
      GTAO_OVERLAY_COLOR: 1,
      GTAO_OVERLAY9: 0,
      GTAO_OVERLAY9_COLOR: 1,
      GTAO_OVERLAY8: -1,
      GTAO_OVERLAY8_COLOR: 1,
      GTAO_OVERLAY5: -1,
      GTAO_OVERLAY5_COLOR: 1,
      GTAO_OVERLAY4: -1,
      GTAO_OVERLAY4_COLOR: 1,
      GTAO_OVERLAY10: -1,
      GTAO_OVERLAY10_COLOR: 1,
      GTAO_FACE_SPECIFICATIONS:
        '[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]',
    };

    Object.entries(skin).map(([key, value]) => {
      user.setData(key, value);
    });

    user.clearAllProp()
    user.showLoadDisplay();
    await methods.sleep(500);
    user.hideLoadDisplay();

    personageCam = mp.cameras.new(
      'customization',
      new mp.Vector3(8.243752, 527.4373, 171.6173),
      new mp.Vector3(0, 0, 0),
      20
    );
    personageCam.pointAtCoord(9.66692, 528.34783, 171.2);
    personageCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, false, false);

    user.setVirtualWorld(mp.players.local.remoteId);
    ui.hideHud();
    ui.hideHud();
    mp.gui.chat.activate(false);
    mp.gui.chat.show(false);
    mp.gui.cursor.show(true, true);
    mp.game.ui.displayRadar(false);

    
    gui.setGui('personage');
    teleportProtection()
    user.setVirtualWorld(mp.players.local.remoteId + 1);
    mp.players.local.position = new mp.Vector3(9.66692, 528.34783, 170.63504);
    mp.players.local.setCoordsNoOffset(9.66692, 528.34783, 170.63504, true, true, true)
    mp.players.local.setRotation(0, 0, 123.53768, 0, true);
    mp.players.local.freezePosition(true);
    mp.players.local.setVisible(true, false);
    mp.players.local.taskPlayAnim(
      'amb@world_human_guard_patrol@male@base',
      'base',
      8.0,
      -8,
      -1,
      9,
      0,
      false,
      false,
      false
    );
    await methods.sleep(1000);
    user.isTeleport = false;
  },
  'client:user:personage:eventManager': async (type, value) => {
    switch (type) {
      case 'save':
        personageCam.destroy();

        gui.setGui(null);
        ui.showHud();
        mp.gui.chat.show(true);
        personageCam = null;
        // currentCamDist = 0.2;
        // currentCamRot = -2;
        // currentCamCoords = null;
        mp.players.local.freezePosition(false);
        mp.gui.cursor.show(false, false);
        mp.game.ui.displayRadar(true);

        mp.game.cam.renderScriptCams(false, true, 500, true, true);

        // user.setVirtualWorld(0);

        if (!mp.players.local.getVariable('fixPersonage')) {
          let clothList =
          user.getSex() == 1 ? enums.get('clothF') : enums.get('clothM');
          let listTorso = [];
          let listLeg = [];
          let listFoot = [];

          for (let i = 0; i < clothList.length; i++) {
            if (clothList[i][1] != 11) continue;
            if (clothList[i][0] != 0) continue;
            if (clothList[i][10] > weather.getWeatherTemp() + 5) continue;
            listTorso.push(i);
          }
          for (let i = 0; i < clothList.length; i++) {
            if (clothList[i][1] != 4) continue;
            if (clothList[i][0] != 0) continue;
            if (clothList[i][10] > weather.getWeatherTemp() + 5) continue;
            listLeg.push(i);
          }

          for (let i = 0; i < clothList.length; i++) {
            if (clothList[i][1] != 6) continue;
            if (clothList[i][0] != 0) continue;
            if (clothList[i][10] > weather.getWeatherTemp() + 5) continue;
            listFoot.push(i);
          }

          let idTorso = listTorso[methods.getRandomInt(0, listTorso.length - 1)];
          let idLeg = listLeg[methods.getRandomInt(0, listLeg.length - 1)];
          let idFoot = listFoot[methods.getRandomInt(0, listFoot.length - 1)];

          let cl1 = methods.getRandomInt(0, clothList[idTorso][3] - 1);
          let cl2 = methods.getRandomInt(0, clothList[idLeg][3] - 1);
          let cl3 = methods.getRandomInt(0, clothList[idFoot][3] - 1);

          if (idTorso >= 0)
            cloth.buy(
              10,
              clothList[idTorso][1],
              clothList[idTorso][2],
              cl1 < 0 ? 0 : cl1,
              clothList[idTorso][4],
              clothList[idTorso][5],
              clothList[idTorso][6],
              clothList[idTorso][7],
              0,
              true
            );

          if (idLeg >= 0)
            cloth.buy(
              10,
              clothList[idLeg][1],
              clothList[idLeg][2],
              cl2 < 0 ? 0 : cl2,
              clothList[idLeg][4],
              clothList[idLeg][5],
              clothList[idLeg][6],
              clothList[idLeg][7],
              0,
              true
            );

          if (idFoot >= 0)
            cloth.buy(
              10,
              clothList[idFoot][1],
              clothList[idFoot][2],
              cl3 < 0 ? 0 : cl3,
              clothList[idFoot][4],
              clothList[idFoot][5],
              clothList[idFoot][6],
              clothList[idFoot][7],
              0,
              true
            );
        }
        
        mp.events.callSocket('server:user:personage:done');
        break;

      case 'features':
        user.setData('GTAO_FACE_SPECIFICATIONS', value);
        break;

      case 'floor':
        user.showLoadDisplay(500);
        await methods.sleep(500);
        user.setData('SEX', value);
        user.setPlayerModel(!value ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
        setTimeout(() => user.updateCharacterFace(true));
        mp.players.local.taskPlayAnim(
          'amb@world_human_guard_patrol@male@base',
          'base',
          8.0,
          -8,
          -1,
          9,
          0,
          false,
          false,
          false
        );
        await methods.sleep(500);
        user.updateCharacterFace(true);
        user.hideLoadDisplay();
        break;

      case 'mother':
        user.setData('GTAO_SHAPE_THRID_ID', value);
        user.setData('GTAO_SKIN_THRID_ID', value);
        break;

      case 'father':
        user.setData('GTAO_SHAPE_SECOND_ID', value);
        user.setData('GTAO_SKIN_SECOND_ID', value);
        break;

      case 'heredity':
        user.setData('GTAO_SHAPE_MIX', value);
        break;

      case 'skin':
        user.setData('GTAO_SKIN_MIX', value);
        break;

      case 'hair':
        user.setData('GTAO_HAIR', value);
        break;

      case 'hairColor':
        user.setData('GTAO_HAIR_COLOR', value);
        break;

      case 'eyeColor':
        user.setData('GTAO_EYE_COLOR', value);
        break;

      case 'eyebrows':
        user.setData('GTAO_EYEBROWS', value);
        break;

      case 'eyebrowsColor':
        user.setData('GTAO_EYEBROWS_COLOR', value);
        break;

      case 'beard':
        user.setData('GTAO_OVERLAY', value - 1);
        break;

      case 'beardColor':
        user.setData('GTAO_OVERLAY_COLOR', value);
        break;

      case 'freckles':
        user.setData('GTAO_OVERLAY9', value - 1);
        break;
    }
    if (type != 'rotate' && type != 'height' && type != 'depth') user.updateCharacterFace(true);

    if (type == 'rotate') {
      try {
        let coords = new mp.Vector3(9.66692, 528.34783, 171.3);
        currentCamRot = (value / 180) * -2;
        let newCoords = new mp.Vector3(
          (1 + currentCamDist) * Math.sin(currentCamRot) + coords.x,
          (1 + currentCamDist) * Math.cos(currentCamRot) + coords.y,
          coords.z
        );
        personageCam.setCoord(newCoords.x, newCoords.y, newCoords.z);
      } catch (e) {
        methods.debug(e);
      }

    }
    if (type == 'height') {
      personageCam.pointAtCoord(9.66692, 528.34783, 171.2 + value);
    }
    if (type == 'depth') {
      currentCamDist = value;

      let coords = new mp.Vector3(9.66692, 528.34783, 171.3);
      let newCoords = new mp.Vector3(
        (1 + currentCamDist) * Math.sin(currentCamRot) + coords.x,
        (1 + currentCamDist) * Math.cos(currentCamRot) + coords.y,
        coords.z
      );
      personageCam.setCoord(newCoords.x, newCoords.y, newCoords.z);
    }
  },
});
