/// <reference path="../../declaration/client.ts" />

import { methods } from '../modules/methods';
import { user } from '../user';
import { coffer } from '../coffer';
import { ui } from '../modules/ui';
import { menuList } from '../menuList';
import { jobPoint } from '../managers/jobPoint';
import { cleaner } from "./cleaner";
import { playMinigame } from '../modules/minigame';
import { gui } from '../modules/gui';


let isStart = false;
let isProcess = false;
let count = 0;
let _checkpointId = -1;

let mainer = {
    isStart: false,

    markers: [
        [2926.32373046875, 2800.27490234375, 40.433074951171875],
        [2928.197509765625, 2789.14013671875, 39.64565658569336],
        [2940.468994140625, 2778.12255859375, 38.307369232177734],
        [2952.239990234375, 2781.09375, 39.23149490356445],
        [2950.103759765625, 2795.388427734375, 39.81355285644531],
        [2947.564208984375, 2811.36328125, 40.845672607421875],
        [2959.59228515625, 2808.4130859375, 41.28612518310547],
        [2974.08544921875, 2796.08154296875, 40.03358459472656],
        [2975.476318359375, 2780.2724609375, 37.6644973754882],
        [2956.1630859375, 2781.392333984375, 39.77700424194336]
    ],
    startOrEnd: function() {

        if (user.get('job') == 'gr6') {
            mp.game.ui.notifications.show('~b~Вы не можете работать на этой работе сейчас');
            return;
        }

        if (isStart) {

            jobPoint.delete();

            mp.game.ui.notifications.show('~b~Вы закончили рабочий день');

            isStart = false;
            isProcess = false;
            _checkpointId = -1;
        }
        else {

            mp.game.ui.notifications.show('~b~Вы начали рабочий день');
            isStart = true;
            mainer.findRandomPickup();
        }

        mainer.isStart = isStart;
    },

    findRandomPickup: function() {
        if (isProcess || !isStart) return;
        let pickupId = methods.getRandomInt(0, 5);
        _checkpointId = jobPoint.create(new mp.Vector3(mainer.markers[pickupId][0], mainer.markers[pickupId][1], mainer.markers[pickupId][2]));
    },

    workProcess: function() {

        if (isProcess || !isStart) return;

        let pos = mp.players.local.position;

        mainer.markers.forEach(function(item) {
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
                        mainer.takeMoney();
                    } else {
                        mp.game.ui.notifications.show('~r~Вы ничего не заработали');
                    }
                    mainer.findRandomPickup();
                });
            }
        });
    },

    takeMoney: function() {
        if (count > 0) {
            let money = count * 14;
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
        if (methods.distanceToPos(mp.players.local.position, new mp.Vector3(2947.1118, 2745.2358, 42.37148)) < distanceCheck)
            menuList.showJobMainerMenu();
    }
};


mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        mainer.workProcess();
});

export { mainer };