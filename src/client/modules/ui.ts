import { user } from '../user';
import { methods } from './methods';
import { weather } from '../managers/weather';
import { gui } from './gui';
import { RAGE_BETA } from '../../util/newrage';

let _zone = 'Подключение к сети GPS';
let _street = '...';

let menuBrowser: BrowserMp = null;
let chatBox: BrowserMp = null;

let showRadar = true;
let showHud = true;
let showMenu = false;

const maxStringLength = 99;

if(RAGE_BETA){
  Object.defineProperty(mp.gui.chat, "push", {
    writable: true
  })
  mp.gui.chat.push = (text) => mp.events.triggerBrowser('outputChatBox', text)
}

let menuBrowserUrl: string;
mp.events.add('web:browsers:urls', (q) => {
  menuBrowserUrl = q[1];
});

let ui = {
  ColorTransparent: [0, 0, 0, 0],
  ColorRed: [244, 67, 54, 255],
  ColorRed900: [183, 28, 28, 255],
  ColorWhite: [255, 255, 255, 255],
  ColorBlue: [33, 150, 243, 255],
  ColorGreen: [76, 175, 80, 255],
  ColorAmber: [255, 193, 7],
  ColorDeepOrange: [255, 87, 34, 255],

  MarkerRed: [244, 67, 54, 100],
  MarkerGreen: [139, 195, 74, 100],
  MarkerBlue: [33, 150, 243, 100],
  MarkerYellow: [255, 235, 59, 100],
  MarkerBlue100: [187, 222, 251, 100],
  MarkerWhite: [255, 255, 255, 100],

  DisableMouseControl: false,

  showOrHideRadar: () => {
    showRadar = !showRadar;
    mp.game.ui.displayRadar(showRadar);
    if (!showRadar) ui.hideHud();
    else ui.showHud();
  },

  isShowRadar: () => {
    return showRadar;
  },

  showOrHideHud: () => {
    showHud = !showHud;
    mp.game.ui.displayHud(showHud);
  },

  isShowHud: () => {
    return showHud;
  },

  create: () => {
    menuBrowser = mp.browsers.new(menuBrowserUrl);
  },

  init: () => {
    // chatBox = mp.browsers.new('package://chatUI/index.html');
    // chatBox.markAsChat();
  },

  showOrHideMenu: () => {
    if (!showMenu) ui.showMenu();
    else ui.hideMenu();
  },

  showMenu: () => {
    if (menuBrowser) {
      try {
        menuBrowser.execute(`eventSend(${JSON.stringify({ type: 'show' })});`);
        showMenu = true;
        mp.gui.cursor.show(false, true);
      } catch (e) {
        methods.debug(e);
      }
    }
  },

  showMenuIds: (list: any) => {
    if (menuBrowser) {
      try {
        menuBrowser.execute(
          `eventSend(${JSON.stringify({ type: 'showIdsMenu', menuList: list })});`
        );
        showMenu = true;
        mp.gui.cursor.show(false, true);
      } catch (e) {
        methods.debug(e);
      }
    }
  },

  hideMenu: () => {
    if (menuBrowser) {
      try {
        menuBrowser.execute(`eventSend(${JSON.stringify({ type: 'hide' })});`);
        showMenu = false;
        mp.gui.cursor.show(false, false);
      } catch (e) {
        methods.debug(e);
      }
    }
  },

  isShowMenu: () => {
    return showMenu;
  },

  soundHit: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'hit' })})`);
    }
  },
  soundPlay2: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'play2' })})`);
    }
  },
  radioSoundPeer: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'radioPeer' })})`);
    }
  },

  radioSoundOn: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'radioOn' })})`);
    }
  },

  radioSoundOff: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'radioOff' })})`);
    }
  },

  radioSoundShOn: (offsetVol = 0) => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'radioShStart', shVol: offsetVol })})`);
    }
  },

  radioSoundShOff: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'radioShStop' })})`);
    }
  },

  buckle: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'buckle' })})`);
    }
  },
  unbuckle: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.radio.radioManager(${JSON.stringify({ type: 'unbuckle' })})`);
    }
  },

  hideHud: () => {
    if (gui.hudLoaded) {
      gui.browser.execute(`CEF.hud.showHud(false)`);
    }
  },

  showHud: () => {
    if (gui.hudLoaded) {
      gui.browser.execute(`CEF.hud.showHud(true)`);
    }
  },

  updateMafiaInfo: (lme: number, rm: number, trd: number, lcn: number, time: number) => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.updateMafiaInfo(${time}, ${lcn}, ${trd}, ${rm}, ${lme})`);
    }
  },

  showMafiaInfo: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.showMafiaInfo(true)`);
    }
  },

  hideMafiaInfo: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.showMafiaInfo(false)`);
    }
  },

  updateGangInfo: (top1: number, top2: number, time: number) => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.updateGangInfo(${time}, ${top1}, ${top2})`);
    }
  },

  showGangInfo: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.showGangInfo(true)`);
    }
  },

  hideGangInfo: () => {
    if (gui.browser) {
      gui.browser.execute(`CEF.capture.showGangInfo(false)`);
    }
  },

  updateDeathTimer: (timerCounter: number) => {
    if (gui.hudLoaded) {
      gui.browser.execute(`CEF.hud.setDeathTime(${timerCounter})`);
    }
  },

  showDeathTimer: () => {
    if (gui.hudLoaded) {
      gui.browser.execute(`CEF.hud.toggleDeathTimer(true)`);
    }
  },

  hideDeathTimer: () => {
    if (gui.hudLoaded) {
      gui.browser.execute(`CEF.hud.toggleDeathTimer(false)`);
    }
  },

  showToolTip: (text: string) => {
    mp.game.ui.notifications.show(text);
  },

  showSubtitle: (message: string, duration = 5000, drawImmediately = true) => {
    mp.game.ui.notifications.show(message);
  },

  updateZoneAndStreet: () => {
    const local = mp.players.local;
    let getStreet = mp.game.pathfind.getStreetNameAtCoord(
      local.position.x,
      local.position.y,
      local.position.z,
      0,
      0
    );
    _street = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
    _zone = mp.game.ui.getLabelText(
      mp.game.zone.getNameOfZone(local.position.x, local.position.y, local.position.z)
    );
  },

  updateToolBars: () => {
    return;
    /*
    if (user.isLogin()) {
      if (mp.players.local.isSittingInAnyVehicle()) {
        fuelBar.visible = true;
        speedBar.visible = true;
        speedBar.text = `${methods.getCurrentSpeed()} KM/H`;
  
        let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);
        if (vInfo.fuel_full > 1)
          fuelBar.progress = mp.players.local.vehicle.getVariable('fuel') / vInfo.fuel_full;
        else fuelBar.visible = false;
  
        //mp.game.invoke('0x90D1CAD1', mp.players.local.vehicle.handle, mp.players.local.vehicle.getVariable('fuel'));
      } else {
        speedBar.visible = false;
        fuelBar.visible = false;
      }
  
      voiceBar.visible = true;
  
      let userEatLevel = user.get('eat_level');
      //eatBar.visible = true; TODO
      eatBar.progress = userEatLevel / 1000;
  
      if (eatBar.progress >= 1) eatBar.progress = 1;
  
      if (userEatLevel > 1000) eatBar.pbarFgColor = ui.ColorBlue;
      else if (userEatLevel > 600) eatBar.pbarFgColor = ui.ColorWhite;
      else if (userEatLevel > 400) eatBar.pbarFgColor = ui.ColorAmber;
      else if (userEatLevel > 200) eatBar.pbarFgColor = ui.ColorDeepOrange;
      else if (userEatLevel > 0) eatBar.pbarFgColor = ui.ColorRed;
      else if (userEatLevel <= 0) eatBar.pbarFgColor = ui.ColorRed900;
  
      let userWaterLevel = user.get('water_level');
      // drinkBar.visible = true; TODO
      drinkBar.progress = userWaterLevel / 100;
  
      if (drinkBar.progress >= 1) drinkBar.progress = 1;
  
      if (userWaterLevel > 100) drinkBar.pbarFgColor = ui.ColorBlue;
      else if (userWaterLevel > 60) drinkBar.pbarFgColor = ui.ColorWhite;
      else if (userWaterLevel > 40) drinkBar.pbarFgColor = ui.ColorAmber;
      else if (userWaterLevel > 20) drinkBar.pbarFgColor = ui.ColorDeepOrange;
      else if (userWaterLevel > 0) drinkBar.pbarFgColor = ui.ColorRed;
      else if (userWaterLevel <= 0) drinkBar.pbarFgColor = ui.ColorRed900;
    } else {
      speedBar.visible = false;
      fuelBar.visible = false;
  
      voiceBar.visible = false;
      eatBar.visible = false;
      drinkBar.visible = false;
      radioBar.visible = false;
    }*/
  },

  getCurrentZone: () => {
    return _zone;
  },

  getCurrentStreet: () => {
    return _street;
  },

  updateDirectionText: () => {
    let dgr = mp.players.local.getRotation(0).z + 180;
    if (dgr >= 22.5 && dgr < 67.5) return 'SE';
    if (dgr >= 67.5 && dgr < 112.5) return 'E';
    if (dgr >= 112.5 && dgr < 157.5) return 'NE';
    if (dgr >= 157.5 && dgr < 202.5) return 'N';
    if (dgr >= 202.53 && dgr < 247.5) return 'NW';
    if (dgr >= 247.5 && dgr < 292.5) return 'W';
    if (dgr >= 292.5 && dgr < 337.5) return 'SW';
    return 'S';
  },

  drawText: (
    caption: string,
    xPos: number,
    yPos: number,
    scale: number,
    r: number,
    g: number,
    b: number,
    a: number,
    font: number,
    justify: number,
    shadow: boolean,
    outline: boolean
  ) => {
    if (!mp.game.ui.isHudComponentActive(0)) return false;

    mp.game.ui.setTextFont(font);
    mp.game.ui.setTextScale(1, scale);
    mp.game.ui.setTextColour(r, g, b, a);

    if (shadow) mp.game.invoke('0x1CA3E9EAC9D93E5E');
    if (outline) mp.game.invoke('0x2513DFB0FB8400FE');

    switch (justify) {
      case 1:
        mp.game.ui.setTextCentre(true);
        break;
      case 2:
        mp.game.ui.setTextRightJustify(true);
        mp.game.ui.setTextWrap(0, xPos);
        break;
    }

    mp.game.ui.setTextEntry('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(caption);
    mp.game.ui.drawText(xPos, yPos);
  },

  drawRect: (
    xPos: number,
    yPos: number,
    wSize: number,
    hSize: number,
    r: number,
    g: number,
    b: number,
    a: number
  ) => {
    if (!mp.game.ui.isHudComponentActive(0)) return false;
    let x = xPos + wSize * 0.5;
    let y = yPos + hSize * 0.5;
    mp.game.invoke('0x3A618A217E5154F0', x, y, wSize, hSize, r, g, b, a);
  },

  drawText3D: (caption: string, x: number, y: number, z: number) => {
    if (!mp.game.ui.isHudComponentActive(0)) return false;

    z = z + 0.5;
    mp.game.graphics.setDrawOrigin(x, y, z, 0);
    //let camPos = mp.game.invoke('0x14D6F5678D8F1B37');
    /*let camPos = mp.players.local.position;
      let dist = methods.distanceToPos(camPos, new mp.Vector3(x, y, z));
      let scale = 1 / dist * 2;
      let fov = 1 / mp.game.invoke('0x65019750A0324133') * 100;
      scale = fov * scale;
      if (scale < 0.5)
          scale = 0.5;
      if (scale > 0.8)
          scale = 0.8;*/
    //scale = 1 - scale;
    let scale = 0.40;

    mp.game.ui.setTextFont(0);
    mp.game.ui.setTextScale(0.1 * scale, 0.55 * scale);
    mp.game.ui.setTextColour(255, 255, 255, 255);
    mp.game.ui.setTextProportional(true);
    mp.game.ui.setTextDropshadow(0, 0, 0, 0, 255);
    mp.game.ui.setTextEdge(2, 0, 0, 0, 150);
    mp.game.invoke('0x2513DFB0FB8400FE');
    mp.game.ui.setTextEntry('STRING');
    mp.game.ui.setTextCentre(true);
    mp.game.ui.addTextComponentSubstringPlayerName(caption);
    mp.game.ui.drawText(0, 0);
    mp.game.invoke('0xFF0B610F6BE0D7AF');
  },
};

export { ui };
