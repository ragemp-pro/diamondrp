/// <reference path="../../declaration/server.ts" />

import { methods } from './methods';
import { user } from '../user';
import { Container } from './data';
import { mysql } from './mysql';
import { vehicles } from '../vehicles';
import { bank } from '../business/bank';
import { inventory } from '../inventory';

setTimeout(() => {
  methods.updateLoto();
}, 120000)

export let timer = {
  loadAll: function() {
    timer.min30Timer();
    timer.sec10Timer();
    timer.secTimer();
    timer.min1Timer();
    timer.hour8Timer();
    timer.hour5Timer();
  },
  min30Timer: function() {
    methods.updateLoto();
    inventory.deleteWorldItems();

    for (let i = 1; i < 1300; i++) {
      try {
        if (Container.Has(i, 'isMail')) Container.Reset(i, 'isMail');
        if (Container.Has(i, 'isMail2')) Container.Reset(i, 'isMail2');
      } catch (e) {
        methods.debug(e);
      }
    }


    mp.players.forEach(function(p) {
      if (user.isLogin(p)) {
        if (user.has(p, 'grabVeh')) user.reset(p, 'grabVeh');
      }
    });

    setTimeout(timer.min30Timer, 1000 * 60 * 30);
  },
  hour5Timer: function() {
    for (let i = 0; i < 200; i++) {
      try {
        if (Container.Has(i, 'isGrabGunShop')) Container.Reset(i, 'isGrabGunShop');
      } catch (e) {
        methods.debug(e);
      }
    }

    setTimeout(timer.hour5Timer, 1000 * 60 * 60 * 5);
  },
  hour8Timer: function() {
    bank.loadGrabCounts();
    setTimeout(timer.hour8Timer, 1000 * 60 * 60 * 8);
  },
  sec10Timer: function() {
    let time = methods.getTimeStamp()
    mp.players.forEach(function(p) {
      if (
        user.isLogin(p)// && methods.distanceToPos(new mp.Vector3(-306.342, 202.8106, 190.4903), p.position) > 30
      ) {
        let userId = user.getId(p);
        user.setById(userId, 'pos_x', p.position.x);
        user.setById(userId, 'pos_y', p.position.y);
        user.setById(userId, 'pos_z', p.position.z);
        user.setById(userId, 'rot', p.heading);
        user.setById(userId, 'hp', p.health);
        user.setById(userId, 'dimension', p.dimension);
        user.setById(userId, 'timestamp', time);
      }
    });

    setTimeout(timer.sec10Timer, 1000 * 10);
  },
  secTimer: function() {
    //TODO
    /*mp.players.forEach(function (p) {
            if (user.isLogin(p) && user.has(p, 'ping')) {
                if (user.get(p, 'ping') + 400 < p.ping)
                    user.kickAntiCheat(p, 'Ping: ' + p.ping + 'ms')
            }
        });
        setTimeout(timer.secTimer, 1000);*/
  },
  min1Timer: () => {
    // mp.players.forEach((player) => {
    //   if (!player.getVariable('rentCar')) return;
    //   const rentVeh = player.getVariable('rentCar');
    //   if (!mp.vehicles.exists(rentVeh) || rentVeh == player.vehicle) return;
    //   if (typeof player.getVariable('rentCarTimer') != 'number')
    //     return player.setVariable('rentCarTimer', 1);
    //   const time = player.getVariable('rentCarTimer') + 1;
    //   if (time >= 10) {
    //     rentVeh.destroy();
    //     player.setVariable('rentCar', null);
    //     player.notify('~y~Арендованный ТС был удален');
    //     player.setVariable('rentCarTimer', null);
    //     return;
    //   }
    //   player.notify(`~y~Арендованный ТС пропадет через ~o~${10 - time} ~y~мин.`);
    //   player.setVariable('rentCarTimer', time);
    // });

    // setTimeout(timer.min1Timer, 1000 * 60);
  },
};
