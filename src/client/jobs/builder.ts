/// <reference path="../../declaration/client.ts" />

import {methods} from '../modules/methods';
import {user} from '../user';
import {coffer} from '../coffer';
import {ui} from '../modules/ui';
import {menuList} from '../menuList';
import {jobPoint} from '../managers/jobPoint';
import { playMinigame } from '../modules/minigame';
import { gui } from '../modules/gui';



let isStart = false;
let isProcess = false;
let count = 0;
let _checkpointId = -1;

let builder = {

  isStart: false,
  
  markers: [[-172.2479,-991.1088,253.1315,79.50198,0],[-172.7199,-992.7151,253.1314,79.54372,0],[-173.3227,-995.3729,253.1315,76.74725,0],[-174.2205,-998.3889,253.1315,79.56352,0],[-170.3128,-1004.923,253.1315,163.8139,0],[-167.2567,-1005.97,253.1315,159.6735,0],[-164.6741,-1006.969,253.1314,160.206,0],[-152.5995,-983.616,268.2276,162.2194,1],[-163.3634,-955.0497,268.2273,69.25684,1],[-135.2024,-981.0098,253.3519,252.521,1],[-183.3535,-1017.348,253.3521,161.8717,1],[-177.6228,-968.9905,253.3519,69.92053,1],[-166.073,-962.3404,268.2276,74.31129,1],[-192.6118,-1010.344,253.3521,66.1328,1],[-177.2914,-1019.575,253.3519,165.48,1],[-192.6118,-1010.344,253.3521,66.1328,1]],
  
  startOrEnd: function() {
      try {
          methods.debug('Execute: builder.startOrEnd');
  
          if (user.get('job') == 'gr6') {
              mp.game.ui.notifications.show('~b~Вы не можете работать на этой работе сейчас');
              return;
          }
  
          if (isStart) {
  
              jobPoint.delete();
              user.updateCharacterCloth();
  
              mp.game.ui.notifications.show('~b~Вы закончили рабочий день');
  
              isStart = false;
              isProcess = false;
              _checkpointId = -1;
          }
          else {
  
              mp.game.ui.notifications.show('~b~Вы начали рабочий день');
              mp.game.ui.notifications.show('~b~Поднимитесь в башню, чтобы начать работать');
  
              if (user.getSex() == 1)
              {
                  user.setComponentVariation(3, 55, 0);
                  user.setComponentVariation(8, 36, 0);
                  user.setComponentVariation(11, 0, 0);
              }
              else
              {
                  user.setComponentVariation(3, 30, 0);
                  user.setComponentVariation(8, 59, methods.getRandomInt(0, 2));
                  user.setComponentVariation(11, 0, 0);
              }
  
              isStart = true;
              builder.findRandomPickup();
          }
  
          builder.isStart = isStart;
      } catch (e) {
          methods.debug('Exception: builder.startOrEnd');
          methods.debug(e);
      }
  },
  
  findRandomPickup: function() {
      try {
          methods.debug('Execute: builder.findRandomPickup');
          if (isProcess || !isStart) return;
          let pickupId = methods.getRandomInt(0, 15);
          _checkpointId = jobPoint.create(new mp.Vector3(builder.markers[pickupId][0], builder.markers[pickupId][1], builder.markers[pickupId][2]));
      } catch (e) {
          methods.debug('Exception: builder.findRandomPickup');
          methods.debug(e);
      }
  },
  
  workProcess: function() {
      try {
          methods.debug('Execute: builder.findRandomPickup');
          if (isProcess || !isStart) return;
  
          let pos = mp.players.local.position;
  
          builder.markers.forEach(function (item) {
              let pPos = new mp.Vector3(item[0], item[1], item[2]);
              if (methods.distanceToPos(pPos, pos) < 2) {
                  mp.players.local.position = pPos;
                  mp.players.local.setHeading(item[3]);
  
                  jobPoint.delete();
                  _checkpointId = -1;
                  isProcess = true;
  
                  methods.disableAllControls(true);
  
                  user.playScenario(Math.floor(item[4]) == 0 ? "WORLD_HUMAN_WELDING" : "WORLD_HUMAN_HAMMERING");
  
                  playMinigame("hammer").then(status => {
                      isProcess = false;
                      
                      methods.disableAllControls(false);
                      user.stopScenario();
                      if(!status){
                        mp.game.ui.notifications.show('~r~Вы ничего не заработали');
                      } else {
                          count++;
                          builder.takeMoney();
                          user.setData('skill_builder', user.get('skill_builder') + 1);
                      }
                      builder.findRandomPickup();
                  })
                  
              }
          });
      } catch (e) {
          methods.debug('Exception: builder.findRandomPickup');
          methods.debug(e);
      }
  },
  
  takeMoney: function() {
      try {
          methods.debug('Execute: builder.takeMoney');
          if (count > 0) {
              let money = count*5;
  
              if (user.get('skill_builder') >= 2 && user.get('skill_builder') < 4)
                  money = money * 2;
              else if (user.get('skill_builder') >= 4 && user.get('skill_builder') < 6)
                  money = money * 3;
              else if (user.get('skill_builder') >= 6 && user.get('skill_builder') < 8)
                  money = money * 4;
              else if (user.get('skill_builder') >= 8 && user.get('skill_builder') < 10)
                  money = money * 5;
              else if (user.get('skill_builder') >= 10)
                  money = money * 6;
  
              user.giveJobMoney(money);
              coffer.removeMoney(money);
              mp.game.ui.notifications.show('Вы заработали ~g~$' + methods.numberFormat(money));
              count = 0;
              return;
          }
          mp.game.ui.notifications.show('~r~Вы ничего не заработали');
      } catch (e) {
          methods.debug('Exception: builder.takeMoney');
          methods.debug(e);
      }
  },
  
  checkPressE: function() {
      let distanceCheck = 2;
      if (methods.distanceToPos(mp.players.local.position, new mp.Vector3(-142.2255, -936.2115, 28.29189)) < distanceCheck)
          menuList.showJobBuilderMenu();
  }
};



mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        builder.workProcess();
});

export {builder};