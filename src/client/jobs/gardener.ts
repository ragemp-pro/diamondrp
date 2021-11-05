/// <reference path="../../declaration/client.ts" />

import { methods } from '../modules/methods';
import { user } from '../user';
import { jobPoint } from '../managers/jobPoint';
import { photo } from "./photo";
import { gui } from '../modules/gui';


let isProcess = false;
let _checkpointId = -1;



let gardener = {
    markers: [[-1623.738, 96.66486, 62.11858], [-1499.166, -739.9906, 26.20651], [-1550.103, -694.4716, 29.21308], [-80.43311, -420.6727, 36.78386], [-1608.822, -643.9052, 31.38339], [-1481.061, 130.019, 55.6546], [-1674.133, -601.9937, 33.72008], [212.2592, -379.3662, 44.40764], [-1817.289, -464.2487, 42.90029], [268.4755, -400.9404, 44.81379], [-1556.303, 118.2675, 56.79749], [-1887.14, -405.7795, 48.03875], [-1569.9, -5.048523, 60.0406], [-1510.645, 1.18523, 56.76347], [-1471.073, 43.35913, 54.01854], [-837.3448, -937.908, 15.98954], [-999.4036, -646.9059, 23.88176], [-1447.015, -13.90357, 54.65688], [-849.4641, -1009.881, 13.41574], [-885.2766, -878.1136, 16.05929], [-1128.506, -1253.044, 6.866948], [-1863.341, 214.3598, 84.29323], [-1134.065, -1239.2, 6.233136], [971.6022, -611.0195, 58.47553], [-1304.935, -952.8572, 9.341719], [-1328.938, -961.0013, 8.179737], [977.6599, -533.1627, 59.84], [-1441.158, -917.528, 11.88954], [-1040.217, -1308.903, 6.020633], [-882.3195, -1208.285, 5.319786], [-970.1645, -1259.546, 5.582035], [-1948.157, 370.0023, 93.61497], [-1145.459, -1280.558, 7.2417], [-1829.874, 282.9827, 86.09788], [-843.1174, 112.1876, 55.17134], [-843.4338, 100.1544, 53.20478], [-1374.987, -1136.972, 4.693842], [-843.9388, 173.9445, 69.80807], [-1697.869, 364.2751, 87.15717], [-838.0018, 186.1826, 72.13165], [-1445.205, -921.1709, 12.45693], [-935.3578, 113.6355, 57.12218], [-956.7496, 105.7805, 56.15186], [-1315.548, -1112.302, 6.956872], [-990.7855, 156.2806, 61.41539], [-1351.03, -1362.751, 4.462386], [-946.5805, 188.8411, 66.63117], [-1325.24, -1394.652, 5.359413], [-918.2573, 184.5136, 68.65635], [-1215.592, 128.7445, 58.68906], [-1298.852, -1438.6, 4.97308], [-1225.961, -1548.186, 4.601189], [-1058.372, 232.0741, 63.91761], [-1264.696, -1570.552, 4.459717], [-1350.352, -1491.232, 4.782222]],

    start: function() {
        if (isProcess) {
            mp.game.ui.notifications.show('~r~Вы уже получили задание');
            return;
        }
        mp.game.ui.notifications.showWithPicture('Начальник', "323-555-0002", 'Скинул координаты точки', "CHAR_MP_BRUCIE", 1);
        gardener.findRandomPickup();
    },

    findRandomPickup: function() {
        isProcess = true;
        let pickupId = methods.getRandomInt(0, gardener.markers.length - 1);
        _checkpointId = jobPoint.create(new mp.Vector3(gardener.markers[pickupId][0], gardener.markers[pickupId][1], gardener.markers[pickupId][2] - 1));
        user.setWaypoint(gardener.markers[pickupId][0], gardener.markers[pickupId][1]);
    },

    workProcess: function() {
        let pos = mp.players.local.position;
        gardener.markers.forEach(function(item) {
            let pPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pPos, pos) < 2) {

                isProcess = true;
                methods.disableAllControls(true);
                jobPoint.delete();
                _checkpointId = -1;

                user.playScenario(methods.getRandomInt(0, 2) == 1 ? "WORLD_HUMAN_GARDENER_PLANT" : "WORLD_HUMAN_GARDENER_LEAF_BLOWER");

                setTimeout(function() {
                    isProcess = false;
                    methods.disableAllControls(false);
                    user.stopScenario();
                    user.giveJobMoney(40);
                    user.giveJobSkill();
                }, 30000);
            }
        });
    }
};



mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (!isProcess) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        gardener.workProcess();
});

export { gardener };