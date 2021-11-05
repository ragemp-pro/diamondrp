/// <reference path="../../declaration/client.ts" />

import {methods} from '../modules/methods';
import {user} from '../user';
import {coffer} from '../coffer';
import {ui} from '../modules/ui';
import {menuList} from '../menuList';
import {jobPoint} from '../managers/jobPoint';
import {builder} from "./builder";
import {roadWorker} from "./roadWorker";
import { playMinigame } from '../modules/minigame';
import { gui } from '../modules/gui';

let isStart = false;
let isProcess = false;
let count = 0;
let _checkpointId = -1;


let cleaner = {
    isStart: false,
    
    markers: [[-1536.631,-451.4576,34.88205,137.3628],[-1532.549,-454.8775,34.88456,139.3095],[-1553.697,-446.5077,39.51906,142.7419],[-1535.673,-459.0544,39.52384,142.13],[-1540.909,-454.7619,39.51913,137.2621],[-1541.229,-429.4637,34.59196,51.92725],[-1554.131,-441.6807,39.51905,51.12228],[-1533.775,-420.5667,34.59194,37.03086],[-1538.859,-456.4115,39.52203,142.7622],[-1534.811,-462.4519,34.44516,30.1082],[-1528.802,-462.5171,34.4021,214.4953]],

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
            isStart = true;
            cleaner.findRandomPickup();
        }
    
        cleaner.isStart = isStart;
    },
    
    findRandomPickup: function() {
        if (isProcess || !isStart) return;
        let pickupId = methods.getRandomInt(0, 10);
        _checkpointId = jobPoint.create(new mp.Vector3(cleaner.markers[pickupId][0], cleaner.markers[pickupId][1], cleaner.markers[pickupId][2]));
    },
    
    workProcess: function() {
    
        if (isProcess || !isStart) return;
    
    
        let pos = mp.players.local.position;
    
        cleaner.markers.forEach(function (item) {
            let pPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pPos, pos) < 2) {
                mp.players.local.position = pPos;
                mp.players.local.setHeading(item[3]);
    
                isProcess = true;
                methods.disableAllControls(true);
                jobPoint.delete();
                _checkpointId = -1;
    
                user.playScenario("WORLD_HUMAN_MAID_CLEAN");
    
                playMinigame("wash").then(status => {
                    isProcess = false;
    
                    methods.disableAllControls(false);
                    user.stopScenario();
                    if(!status){
                        mp.game.ui.notifications.show('~r~Вы ничего не заработали');
                    } else {
                        count++;
                        cleaner.takeMoney();
                        user.setData('skill_scrap', user.get('skill_scrap') + 1);
                        cleaner.findRandomPickup();
                    }
                    
                    
                })
            }
        });
    },
    
    takeMoney: function() {
        if (count > 0) {
            let money = count * 15;
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
        if (methods.distanceToPos(mp.players.local.position, new mp.Vector3(-1539.165, -448.0839, 34.88203)) < distanceCheck)
            menuList.showJobCleanerMenu();
    }
};



mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        cleaner.workProcess();
});

export  {cleaner};