/// <reference path="../../declaration/client.ts" />

import {Container} from '../modules/data';
import {methods} from '../modules/methods';
import {user} from '../user';
import UIMenu from '../modules/menu';
import {ui} from '../modules/ui';
import {houses} from '../houses';
import {jobPoint} from '../managers/jobPoint';


let isProcess = false;
let _checkpointId = -1;
let waterPower = {
    findHouse: function() {
        if (isProcess) return;
        houses.getRandomHousePositionOfLosSantos('client:jobs:waterPower:findHouse');
    },
    
    findHouseEvent: function(x:number, y:number, z:number) {
        if (isProcess) return;
    
        isProcess = true;
        mp.game.ui.notifications.showWithPicture('Начальник', "323-555-0600", 'Скинул координаты точки', "CHAR_MP_RAY_LAVOY", 1);
        _checkpointId = jobPoint.create(new mp.Vector3(x, y, z), true);
    },
    
    workProcess: function() {
        if (!isProcess) return;
    
        isProcess = false;
        jobPoint.delete();
    
        user.playScenario("CODE_HUMAN_MEDIC_TIME_OF_DEATH");
    
        let randomNum = methods.getRandomInt(1000, 9999);
    
        mp.game.ui.notifications.show(`~b~Номер счета: ${randomNum}`);
    
        setTimeout(async function () {
            let num = methods.parseInt(await UIMenu.Menu.GetUserInput("Введите номер счёта", "", 4));
            user.stopScenario();
            if (randomNum == num) {
                user.giveJobMoney(methods.getRandomInt(45, 60));
                mp.game.ui.notifications.show('~b~Вы произвели необходимую проверку в доме');
                user.giveJobSkill();
            }
            else {
                user.giveJobMoney(methods.getRandomInt(10, 20));
                mp.game.ui.notifications.show('~r~Вы ошиблись с вводом данных');
            }
    
        }, 5000);
    }
};


mp.events.add("client:jobs:waterPower:findHouse", (x, y, z) => {
    waterPower.findHouseEvent(x, y, z);
});

mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if (!isProcess) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId) {
        waterPower.workProcess();
    }
});

export {waterPower};