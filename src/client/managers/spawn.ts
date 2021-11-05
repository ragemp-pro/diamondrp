import { methods } from '../modules/methods';
import { ui } from '../modules/ui';
import { user } from '../user';
import {Container} from '../modules/data';
import { teleportProtection } from '../modules/ach';

let _currentCam: CameraMp = null;
let currentTimer = null;
let _posX = 0;
let _posY = 0;
let _posZ = 0;
let _posH = 0;
let _posR = 0;
let _posRot = 0;

let characterChanger: BrowserMp = null;
let currentCam = null;
let currentCamCoords = null;
let currentCamDist = 0.2;
let currentCamRot = -2;
let _rows: any[] = null;
let currentAccount = 0;
let currentSpawn = 0;
let acceptRules = false;

let _spawnList: any[][] = [];

let spawn = {
  changeCamPos: async (x: number, y: number, z: number) => {
    mp.game.streaming.requestCollisionAtCoord(x, y, z);

    user.showLoadDisplay();
    await methods.sleep(500);
    _posX = x;
    _posY = y;
    _posZ = z;

    spawn.destroyCam();
    spawn.createOrbitCam(x, y, z, 100, 100);
    teleportProtection();
    mp.players.local.position = new mp.Vector3(x, y, z);

    user.hideLoadDisplay();
  },

  updateSpawnList: (accountId: number) => {
    let spawnList = [];
    _spawnList = [];

    if (_rows[accountId].lastSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].lastSpawn);
      spawnList.push('Точка выхода');
    }
    if (_rows[accountId].houseSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].houseSpawn);
      spawnList.push('Дом');
    }
    if (_rows[accountId].trailerSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].trailerSpawn);
      spawnList.push('Дом на колёсах');
    }
    if (_rows[accountId].stockSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].stockSpawn);
      spawnList.push('Склад');
    }
    if (_rows[accountId].apartSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].apartSpawn);
      spawnList.push('Апартаменты');
    }
    if (_rows[accountId].condoSpawn[0] != 0) {
      _spawnList.push(_rows[accountId].condoSpawn);
      spawnList.push('Квартира');
    }

    if (spawnList.length == 0) {
      _spawnList.push(_rows[accountId].standartSpawn);
      spawnList.push('Стандартный спавн');
    }

    let data = {
      type: 'updateSpawnList',
      list: spawnList,
    };
    characterChanger.execute(`eventSend(${JSON.stringify(data)});`);
  },

  updateAccountList: () => {
    let accountList: any[] = [];
    _rows.forEach((row: { [x: string]: any }) => {
      accountList.push(row['rp_name']);
    });

    let data = {
      type: 'updateAccountList',
      list: accountList,
    };
    characterChanger.execute(`eventSend(${JSON.stringify(data)});`);
  },

  setSpawnCam: (x: number, y: number, z: number) => {
    mp.gui.cursor.show(true, true);
    mp.game.streaming.requestCollisionAtCoord(x, y, z);
    mp.players.local.position = new mp.Vector3(x, y, z);
    spawn.createOrbitCam(x, y, z, 100, 100);
  },

  createOrbitCam: (x: number, y: number, z: number, height: number, maxRadius = 100, fov = 20) => {
    _posX = x;
    _posY = y;
    _posZ = z;
    _posH = height;
    _posR = maxRadius;

    if (
      methods.distanceToPos2D(
        new mp.Vector3(-66.66476, -802.0474, 44.22729),
        new mp.Vector3(_posX, _posY, _posZ)
      ) < 700
    )
      _posH = 250;

    let newPos = spawn.getOrbit(_posX, _posY, _posZ + _posH, 0, _posR);
    _currentCam = mp.cameras.new('orbitCam', newPos, new mp.Vector3(0, 0, 0), fov);
    _currentCam.pointAtCoord(x, y, z);
    _currentCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, false, false);

    return _currentCam;
  },

  timer: () => {
    if (_currentCam) {
      _posRot += 0.002;
      if (_posRot >= 360) _posRot = 0;

      let newPos = spawn.getOrbit(_posX, _posY, _posZ + _posH, _posRot, _posR);
      _currentCam.setCoord(newPos.x, newPos.y, newPos.z);
    }
    setTimeout(spawn.timer, 20);
  },

  destroyCam: () => {
    if (_currentCam) {
      _currentCam.destroy();
      mp.game.cam.renderScriptCams(false, true, 500, true, true);
    }

    _posX = 0;
    _posY = 0;
    _posZ = 0;
    _posH = 0;
    _posR = 0;
    _currentCam = null;
  },

  destroy: () => {
    spawn.destroyCam();
    if (characterChanger) characterChanger.destroy();
    characterChanger = null;
  },

  getOrbit: (x: number, y: number, z: number, rot: number, range: number) => {
    let newPos = new mp.Vector3(range * Math.sin(rot) + x, range * Math.cos(rot) + y, z);
    return newPos;
  },
};

mp.events.add('client:user:creator:hide', function() {
  characterChanger.destroy();
  ui.showHud();
  mp.gui.chat.activate(true);
  currentCam = null;
  currentCamDist = 0.2;
  currentCamRot = -2;
  currentCamCoords = null;
  characterChanger = null;
  mp.players.local.freezePosition(false);
  mp.gui.cursor.show(false, false);
  mp.game.ui.displayRadar(true);
});


mp.events.add('client:user:spawn:auth', function(nick, password) {
  if (Container.HasLocally(mp.players.local.remoteId, 'isAuthTimeout')) {
    mp.game.ui.notifications.show('~r~Нельзя так часто нажимать эту кнопку');
    mp.game.ui.notifications.show('~r~Подождите 10 секунд');
    return;
  }

  nick = nick.replace(/[^a-zA-Z\s]/gi, '');
  if (_spawnList[currentSpawn].length > 4)
    mp.events.callRemote('server:user:validate:account', nick, password, -1, -1, -1, -1);
  else if (_rows == null)
    mp.events.callRemote('server:user:validate:account', nick, password, -2, -2, -2, -2);
  else {
    try {
      if (_rows[currentAccount].rp_name != nick)
        mp.events.callRemote('server:user:validate:account', nick, password, -2, -2, -2, -2);
      else
        mp.events.callRemote(
          'server:user:validate:account',
          nick,
          password,
          _spawnList[currentSpawn][0],
          _spawnList[currentSpawn][1],
          _spawnList[currentSpawn][2],
          _spawnList[currentSpawn][3]
        );
    } catch (e) {
      mp.events.callRemote('server:user:validate:account', nick, password, -2, -2, -2, -2);
    }
  }

  Container.SetLocally(mp.players.local.remoteId, 'isAuthTimeout', true);

  setTimeout(function() {
    Container.ResetLocally(mp.players.local.remoteId, 'isAuthTimeout');
  }, 10000);
});

mp.events.add('client:user:spawn:reg', function(
  name,
  surname,
  email,
  pass1,
  pass2,
  referer,
  promocode
) {
  if (Container.HasLocally(mp.players.local.remoteId, 'isAuthTimeout')) {
    mp.game.ui.notifications.show('~r~Нельзя так часто нажимать эту кнопку');
    mp.game.ui.notifications.show('~r~Подождите 10 секунд');
    return;
  }

  name = name.replace(/[^a-zA-Z\s]/gi, '');
  surname = surname.replace(/[^a-zA-Z\s]/gi, '');
  email = email.replace("'", '');
  referer = referer.replace(/[^a-zA-Z\s]/gi, '');
  promocode = promocode.replace("'", '');
  if (name == '') {
    mp.game.ui.notifications.show('~r~Имя - поле не заполнено');
    return;
  }
  if (surname == '') {
    mp.game.ui.notifications.show('~r~Фамилия - поле не заполнено');
    return;
  }
  if (email == '') {
    mp.game.ui.notifications.show('~r~Email - поле не заполнено');
    return;
  }
  if (pass1 == '') {
    mp.game.ui.notifications.show('~r~Пароль - поле не заполнено');
    return;
  }
  if (pass2 != pass1) {
    mp.game.ui.notifications.show('~r~Пароли не совпадают');
    return;
  }
  if (acceptRules == false) {
    mp.game.ui.notifications.show('~r~Вы не согласились с правилами сервера');
    return;
  }
  mp.game.ui.notifications.show('~b~Пожалуйста подождите...');
  mp.events.callRemote(
    'server:user:register:account',
    name + ' ' + surname,
    pass1,
    email,
    referer,
    promocode
  );

  Container.SetLocally(mp.players.local.remoteId, 'isAuthTimeout', true);

  setTimeout(function() {
    Container.ResetLocally(mp.players.local.remoteId, 'isAuthTimeout');
  }, 10000);
});

export { spawn };
