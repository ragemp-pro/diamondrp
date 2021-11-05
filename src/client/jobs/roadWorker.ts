/// <reference path="../../declaration/client.ts" />

import {methods} from '../modules/methods';
import {user} from '../user';
import {coffer} from '../coffer';
import {ui} from '../modules/ui';
import {menuList} from '../menuList';
import {jobPoint} from '../managers/jobPoint';
import {cleaner} from "./cleaner";
import { playMinigame } from '../modules/minigame';
import { gui } from '../modules/gui';

let isStart = false;
let isProcess = false;
let count = 0;
let _checkpointId = -1;



let roadWorker = {
    isStart: false,
    
    markers: [[53.50541,-711.3873,29.87694],[57.57128,-708.451,30.00957],[56.72814,-701.3369,30.09235],[90.61273,-616.3182,29.7602],[91.80334,-607.3279,30.17802],[91.80334,-607.3279,30.17802]],
    
    startOrEnd: function() {
    
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
            roadWorker.findRandomPickup();
        }
    
        roadWorker.isStart = isStart;
    },
    
    findRandomPickup: function() {
        if (isProcess || !isStart) return;
        let pickupId = methods.getRandomInt(0, 5);
        _checkpointId = jobPoint.create(new mp.Vector3(roadWorker.markers[pickupId][0], roadWorker.markers[pickupId][1], roadWorker.markers[pickupId][2]));
    },
    
    workProcess: function() {
    
        if (isProcess || !isStart) return;
    
        let pos = mp.players.local.position;
    
        roadWorker.markers.forEach(function (item) {
            let pPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pPos, pos) < 2) {
                mp.players.local.position = pPos;
                mp.players.local.setHeading(item[3]);
    
                isProcess = true;
                methods.disableAllControls(true);
                jobPoint.delete();
                _checkpointId = -1;
    
                user.playScenario("WORLD_HUMAN_CONST_DRILL");
    
                playMinigame("hammer").then(status => {
                    isProcess = false;
    
                    methods.disableAllControls(false);
                    user.stopScenario();
                    if(status){
                        count++;
                        roadWorker.takeMoney();
                    } else {
                        mp.game.ui.notifications.show('~r~Вы ничего не заработали');
                    }
                    roadWorker.findRandomPickup();
                });
            }
        });
    },
    
    takeMoney: function() {
        if (count > 0) {
            let money = count * 12;
            user.giveJobMoney(money);
            coffer.removeMoney(money);
            mp.game.ui.notifications.show('Вы заработали ~g~$' + methods.numberFormat(money));
            count = 0;
            return;
        }
        mp.game.ui.notifications.show('~r~Вы ничего не заработали');
    },
    
    checkPressE: function() {
        let distanceCheck = 2;
        if (methods.distanceToPos(mp.players.local.position, new mp.Vector3(52.84556, -722.4211, 30.7647)) < distanceCheck)
            menuList.showJobRoadWorkerMenu();
    }
};



mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        roadWorker.workProcess();
});

export {roadWorker};