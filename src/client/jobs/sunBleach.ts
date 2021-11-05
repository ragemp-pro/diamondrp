/// <reference path="../../declaration/client.ts" />

import {Container} from '../modules/data';
import {methods} from '../modules/methods';
import {user} from '../user';
import {ui} from '../modules/ui';
import {houses} from '../houses';
import {jobPoint} from '../managers/jobPoint';
import { gui } from '../modules/gui';


let isProcess = false;
let _checkpointId = -1;

let sunBleach = {
    findHouse: function() {
        if (isProcess) return;
        houses.getRandomHousePositionOfLosSantos('client:jobs:sunBleach:findHouse');
    },
    
    findHouseEvent: function(x:number, y:number, z:number) {
        if (isProcess) return;
    
        isProcess = true;
        mp.game.ui.notifications.showWithPicture('Начальник', "323-555-0600", 'Скинул координаты точки', "CHAR_MP_RAY_LAVOY", 1);
        _checkpointId = jobPoint.create(new mp.Vector3(x, y, z), true);
    },
    
    workProcess: function() {
        if (!isProcess) return;
    
        user.showLoadDisplay();
    
        Container.ResetLocally(mp.players.local.id, 'workerTool');
        isProcess = false;
    
        methods.disableAllControls(true);
        jobPoint.delete();
    
        user.playScenario("CODE_HUMAN_MEDIC_TIME_OF_DEATH");
    
        setTimeout(function () {
            methods.disableAllControls(false);
            user.stopScenario();
            user.hideLoadDisplay();
            user.giveJobMoney(methods.getRandomInt(35, 45));
            mp.game.ui.notifications.show('~b~Вы произвели необходимую проверку в доме');
            user.giveJobSkill();
        }, 5000);
    }
}


mp.events.add("client:jobs:sunBleach:findHouse", (x, y, z) => {
    sunBleach.findHouseEvent(x, y, z);
});

mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (!isProcess) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId) {
        if (!Container.HasLocally(mp.players.local.id, 'workerTool')) {
            mp.game.ui.notifications.show('~r~Возьмите инструменты в транспорте');
            return;
        }
        sunBleach.workProcess();
    }
});

export {sunBleach};