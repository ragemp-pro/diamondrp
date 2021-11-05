import { user } from "./user";
import { methods } from "./modules/methods";

const controlsIds = {
  F5: 74,
  W: 32,
  S: 33,
  A: 34,
  D: 35,
  Space: 321,
  Shift: 21,
  LCtrl: 326,
  SpeedUP: 38,
  SpeedDOWN: 44,
};

mp.events.addDataHandler("alpha", (entity:PlayerMp, value:number, oldValue) => {
  if(entity.type != "player") return;
  entity.setAlpha(value)
});
mp.events.add('entityStreamIn', (entity:PlayerMp) => {
  if(entity.type != "player") return;
  if(entity.getVariable('alpha')) entity.setAlpha(entity.getVariable('alpha'));
});

const fly = {
  flying: false,
  lockZ: false,
  f: 2.0,
  w: 2.0,
  h: 2.0,
};
const gameplayCam = mp.cameras.new('gameplay');

function switchFly(status:boolean){
  if(status && mp.players.local.vehicle) return mp.game.ui.notifications.show("Покиньте транспорт");
  if (status && user.get('is6Duty') && !methods.isTestServer()) return mp.game.ui.notifications.show("Не стоит летать пока вы работаете инкассатором");
  fly.flying = !fly.flying;

  const player = mp.players.local;

  player.setInvincible(fly.flying);
  if(!fly.flying) mp.players.local.setInvincible(user.godmode)
  player.freezePosition(fly.flying);
  mp.players.local.setMaxSpeed(fly.flying ? 0 : 99999);
  if (!fly.flying && !mp.game.controls.isControlPressed(0, controlsIds.Space)) {
    let position = mp.players.local.position;
    position.z = mp.game.gameplay.getGroundZFor3dCoord(
      position.x,
      position.y,
      position.z,
      0.0,
      false
    );
    mp.players.local.setCoordsNoOffset(
      position.x,
      position.y,
      position.z,
      false,
      false,
      false
    );
    mp.game.streaming.requestCollisionAtCoord(position.x, position.y, position.z);
  }

  mp.game.ui.notifications.show(fly.flying ? 'Fly: ~g~Enabled' : 'Fly: ~r~Disabled');
  if(fly.flying){
    mp.game.ui.notifications.show(`<strong>Управление</strong><b>Перемещение</b>: WSAD\n<b>Смена оси Z</b>: CTRL + Space\n<b>Смена скорости</b>: Q + E\n<b>Зафиксировать ось Z</b>: X`);
  }
  mp.events.callSocket('flyMode', fly.flying);
}

setInterval(() => {
  if(fly.flying && mp.players.local.getVariable('enableAdmin') !== true) switchFly(false);
}, 1000)


//X
mp.keys.bind(0x58, true, function() {
  if (!user.isLogin()) return;
  if (!fly.flying) return;
  if (!user.isAdmin() || !mp.players.local.getVariable('enableAdmin') === true) return;
  fly.lockZ = !fly.lockZ
  mp.game.ui.notifications.show(fly.lockZ ? 'Ось Z: ~g~Зафиксирована' : 'Ось Z: ~r~Снята с фиксации');
});

mp.events.add('render', () => {
  if (!user.isLogin()) return;
  if (user.isAdmin() && mp.players.local.getVariable('enableAdmin') === true) {
    if (mp.game.controls.isControlJustPressed(0, controlsIds.F5)) switchFly(!fly.flying);
  }
  if (user.isLogin() && fly.flying) {
    let controls = mp.game.controls;
    const direction = gameplayCam.getDirection();

    let updated = false;
    let position = mp.players.local.position;
    if (controls.isControlPressed(0, controlsIds.SpeedUP)) fly.f += 0.01;
    if (controls.isDisabledControlPressed(0, controlsIds.SpeedDOWN)) fly.f -= 0.01;

    if (fly.f < 0.1) fly.f = 0.1;
    if (fly.f > 20.0) fly.f = 20.0;

    const speed = controls.isControlPressed(0, controlsIds.Shift) ? fly.f * 3 : fly.f;

    if (controls.isControlPressed(0, controlsIds.W)) {
      position.x += direction.x * speed;
      position.y += direction.y * speed;
      if(!fly.lockZ)position.z += direction.z * speed;
      updated = true;
    } else if (controls.isControlPressed(0, controlsIds.S)) {
      position.x -= direction.x * speed;
      position.y -= direction.y * speed;
      if(!fly.lockZ)position.z -= direction.z * speed;
      updated = true;
    }

    if (controls.isControlPressed(0, controlsIds.A)) {
      position.x += -direction.y * speed;
      position.y += direction.x * speed;
      updated = true;
    } else if (controls.isControlPressed(0, controlsIds.D)) {
      position.x -= -direction.y * speed;
      position.y -= direction.x * speed;
      updated = true;
    }

    if (controls.isControlPressed(0, controlsIds.Space)) {
      position.z += speed;
      updated = true;
    } else if (controls.isControlPressed(0, controlsIds.LCtrl)) {
      position.z -= speed;
      updated = true;
    }

    if (updated) {
      mp.players.local.setMaxSpeed(99999999);
      mp.players.local.setCoordsNoOffset(
        position.x,
        position.y,
        position.z,
        false,
        false,
        false
      );
    } else {
      mp.players.local.setMaxSpeed(0);
    }
  }
});









let noClipEnabled = false;
let noClipSpeed = 1;
let noClipSpeedNames = ["Die", "Slow", "Medium", "Fast", "Very Fast", "Extremely Fast", "Snail Speed!"];

export const noClipSwitch = function () {
  noClip(!noClipEnabled);
}

export const noClip = function(enable:boolean) {
    try {
        methods.debug('Execute: admin.noClip');
        noClipEnabled = enable;
        if (noClipEnabled)
            mp.game.ui.notifications.show(`~b~Нажмите ~s~H~b~ чтобы выключить No Clip`);

    } catch (e) {
        methods.debug('Exception: admin.noClip');
        methods.debug(e);
    }
};

export const isNoClipEnable = function() {
    return noClipEnabled;
};

export const getNoClipSpeedName = function() {
    return noClipSpeedNames[noClipSpeed];
};

mp.events.add('render', () => {
    if (noClipEnabled) {
        let noClipEntity = mp.players.local.isSittingInAnyVehicle() ? mp.players.local.vehicle : mp.players.local;

        noClipEntity.freezePosition(true);
        noClipEntity.setInvincible(true);

        mp.game.controls.disableControlAction(0, 31, true);
        mp.game.controls.disableControlAction(0, 32, true);
        mp.game.controls.disableControlAction(0, 33, true);
        mp.game.controls.disableControlAction(0, 34, true);
        mp.game.controls.disableControlAction(0, 35, true);
        mp.game.controls.disableControlAction(0, 36, true);
        mp.game.controls.disableControlAction(0, 266, true);
        mp.game.controls.disableControlAction(0, 267, true);
        mp.game.controls.disableControlAction(0, 268, true);
        mp.game.controls.disableControlAction(0, 269, true);
        mp.game.controls.disableControlAction(0, 44, true);
        mp.game.controls.disableControlAction(0, 20, true);
        mp.game.controls.disableControlAction(0, 47, true);

        let yoff = 0.0;
        let zoff = 0.0;

        if (mp.game.controls.isControlJustPressed(0, 22)) {
            noClipSpeed++;
            if (noClipSpeed >= noClipSpeedNames.length)
                noClipSpeed = 0;
        }

        if (mp.game.controls.isDisabledControlPressed(0, 32)) {
            yoff = 0.5;
        }

        if (mp.game.controls.isDisabledControlPressed(0, 33)) {
            yoff = -0.5;
        }

        if (mp.game.controls.isDisabledControlPressed(0, 34)) {
            noClipEntity.setRotation(0, 0, noClipEntity.getRotation(0).z + 3, 0, true);
        }

        if (mp.game.controls.isDisabledControlPressed(0, 35)) {
            noClipEntity.setRotation(0, 0, noClipEntity.getRotation(0).z - 3, 0, true);
        }

        if (mp.game.controls.isDisabledControlPressed(0, 44)) {
            zoff = 0.21;
        }

        if (mp.game.controls.isDisabledControlPressed(0, 20)) {
            zoff = -0.21;
        }

        if (mp.game.controls.isDisabledControlPressed(0, 74)) {
            if(!noClipEntity.getVariable('isTyping')) {
                noClipEnabled = false;
            }
        }

        let newPos = noClipEntity.getOffsetFromInWorldCoords(0, yoff * (noClipSpeed * 0.7), zoff * (noClipSpeed * 0.7));
        let heading = noClipEntity.getRotation(0).z;

        noClipEntity.setVelocity(0, 0, 0);
        noClipEntity.setRotation(0, 0, heading, 0, false);
        noClipEntity.setCollision(false, false);
        noClipEntity.setCoordsNoOffset(newPos.x, newPos.y, newPos.z, true, true, true);

        noClipEntity.freezePosition(false);
        noClipEntity.setInvincible(false);
        noClipEntity.setCollision(true, true);
    }
});
