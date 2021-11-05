/// <reference path="../../declaration/server.ts" />

import { weather } from './weather';
import { methods } from '../modules/methods';

let count = 0;

export let object = {
    create: function(hash:Hash, pos:Vector3Mp, rotation:Vector3Mp, dynamic:boolean, placeOnGround:boolean) {
        mp.objects.new(hash, pos,
            {
                rotation: rotation,
                alpha: 255,
                dimension: -1
            });
        count++;
    },
    loadAll: function() {
        methods.debug('dispatcher.loadAll');
        //TODO потом это тоже на клиент сайд
        // if (weather.getDay() > 15 && weather.getMonth() == 12 || weather.getDay() < 10 && weather.getMonth() == 1) {
        //     object.create(-2002823169, new mp.Vector3(435.19, -988.877, 31.4362), new mp.Vector3(0, 0, 0), false, false);
        //     object.create(-2002823169, new mp.Vector3(435.27, -983.49, 31.445), new mp.Vector3(0, 0, 0), false, false);
        //     object.create(-546242669, new mp.Vector3(426.33, -990.4, 30.89), new mp.Vector3(-5.97114E-13, -5.008956E-06, -89.99999), false, false);
        //     object.create(-546242669, new mp.Vector3(458.3146, -990.955, 30.26), new mp.Vector3(5.97114E-13, -5.008956E-06, 89.99999), false, false);
        //     object.create(-546242669, new mp.Vector3(342.56, -1402.99, 33.40925), new mp.Vector3(1.001791E-05, 5.008956E-06, -39.79974), false, false);
        //     object.create(-546242669, new mp.Vector3(338.36, -1408.03, 33.40925), new mp.Vector3(1.001791E-05, 5.008956E-06, -39.79973), false, false);
        //     object.create(-546242669, new mp.Vector3(346.86, -1397.9, 33.40925), new mp.Vector3(1.001791E-05, 5.008956E-06, -39.79973), false, false);
        //     object.create(-546242669, new mp.Vector3(345.58, -1384.81, 33.34), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(336.45, -1377.16, 33.34), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(340.98, -1380.97, 33.34), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(330.34, -1403.072, 33.39), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(321.24, -1395.416, 33.39), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(325.72, -1399.21, 33.39), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.7997), false, false);
        //     object.create(-546242669, new mp.Vector3(265.6934, -1349.709, 23.5378), new mp.Vector3(1.001789E-05, 5.008956E-06, -39.85997), false, false);
        //     object.create(-546242669, new mp.Vector3(257.8129, -1359.306, 23.5378), new mp.Vector3(1.001789E-05, 5.008955E-06, -39.85997), false, false);
        //     object.create(-546242669, new mp.Vector3(283.25, -1345.036, 23.5378), new mp.Vector3(1.001789E-05, 5.008955E-06, -39.85997), false, false);
        //     object.create(-546242669, new mp.Vector3(267.68, -1354.611, 23.38779), new mp.Vector3(1.001791E-05, 2.23118E-05, -129.86), false, false);
        //     object.create(-1405984223, new mp.Vector3(-1031.538, -2732.781, 21.96949), new mp.Vector3(0, 0, 149.9997), false, false);
        //     object.create(-1405984223, new mp.Vector3(-1037.226, -2729.64, 21.96949), new mp.Vector3(0, 0, 149.9997), false, false);
        //     object.create(-1405984223, new mp.Vector3(-1034.319, -2731.147, 21.96949), new mp.Vector3(0, 0, 149.9997), false, false);
        //     object.create(238789712, new mp.Vector3(-1037.685, -2737.742, 19.43), new mp.Vector3(0, 0, 0), false, false);
        //     object.create(-546242669, new mp.Vector3(-1381.283, -498.3612, 33.35742), new mp.Vector3(1.001791E-05, -5.008957E-06, -81.2498), false, false);
        //     object.create(-546242669, new mp.Vector3(-1388.29, -499.44, 33.35742), new mp.Vector3(1.001791E-05, -5.008957E-06, -81.2498), false, false);
        //     object.create(-2002823169, new mp.Vector3(-1368.86, -503.07, 33.88242), new mp.Vector3(4.07111E-13, 5.008956E-06, 35.84996), false, false);
        //     object.create(-2002823169, new mp.Vector3(-1365.82, -507.43, 33.88242), new mp.Vector3(2.035555E-13, 5.008955E-06, 35.84996), false, false);
        //     object.create(-546242669, new mp.Vector3(-1367.77, -506.16, 33.35742), new mp.Vector3(1.001791E-05, -5.008957E-06, -81.2498), false, false);
        //     object.create(-546242669, new mp.Vector3(-1338.44, -501.59, 33.35742), new mp.Vector3(1.001791E-05, -5.008956E-06, -80.94977), false, false);
        //     object.create(-546242669, new mp.Vector3(-1345.703, -502.7276, 33.35742), new mp.Vector3(1.001791E-05, -5.008956E-06, -80.94978), false, false);
        //     object.create(-546242669, new mp.Vector3(-1360.435, -505.0299, 33.35742), new mp.Vector3(1.001791E-05, -5.008956E-06, -80.94978), false, false);
        //     object.create(-546242669, new mp.Vector3(-1353.02, -503.86, 33.35742), new mp.Vector3(1.001791E-05, -5.008956E-06, -80.94978), false, false);
        //     object.create(-546242669, new mp.Vector3(-1391.574, -493.9914, 33.35742), new mp.Vector3(1.001788E-05, -5.008956E-06, -144.7991), false, false);
        //     object.create(-546242669, new mp.Vector3(-1398.76, -483.6734, 33.35742), new mp.Vector3(1.001787E-05, -5.008956E-06, -144.7991), false, false);
        //     object.create(-546242669, new mp.Vector3(-1395.35, -488.7629, 33.35742), new mp.Vector3(1.001787E-05, -5.008956E-06, -144.7991), false, false);
        //     object.create(-2002823169, new mp.Vector3(-1406.02, -484.39, 33.93), new mp.Vector3(1.00179E-05, 5.008955E-06, -85.12444), false, false);
        //     object.create(-2002823169, new mp.Vector3(-1410.73, -484.81, 33.93), new mp.Vector3(1.00179E-05, 5.008956E-06, -85.12444), false, false);
        //     object.create(-2002823169, new mp.Vector3(-73.16033, -792.7905, 48.65232), new mp.Vector3(1.00179E-05, 5.008956E-06, 91.3996), false, false);
        //     object.create(-2002823169, new mp.Vector3(-80.02226, -793.1427, 48.65232), new mp.Vector3(1.001789E-05, -5.008957E-06, 107.1492), false, false);
        //     object.create(-2002823169, new mp.Vector3(-66.38054, -794.3237, 48.65232), new mp.Vector3(1.001789E-05, 5.008957E-06, 77.52446), false, false);
        //     object.create(-2002823169, new mp.Vector3(-60.40635, -797.4891, 48.65232), new mp.Vector3(9.946521E-06, 2.231179E-05, 59.92423), false, false);
        //     object.create(-2002823169, new mp.Vector3(-55.3768, -802.1185, 48.65232), new mp.Vector3(9.946476E-06, 2.231179E-05, 46.67414), false, false);
        //     object.create(-2002823169, new mp.Vector3(-51.73102, -807.7383, 48.65232), new mp.Vector3(9.946425E-06, 2.23118E-05, 32.42414), false, false);
        //     object.create(-1405984223, new mp.Vector3(-113.995, -607.6886, 39.49), new mp.Vector3(0, 0, -18.99998), false, false);
        //     object.create(-1405984223, new mp.Vector3(-117.852, -618.8688, 39.49), new mp.Vector3(0, 0, -18.99998), false, false);
        //     object.create(-1405984223, new mp.Vector3(723.6649, -1087.273, 24.43), new mp.Vector3(1.00179E-05, 5.008956E-06, -90.49982), false, false);
        //     object.create(-1405984223, new mp.Vector3(723.5949, -1091.37, 24.43), new mp.Vector3(1.00179E-05, 5.008956E-06, -90.49982), false, false);
        //     object.create(-2002823169, new mp.Vector3(729.6231, -1066.252, 28.33736), new mp.Vector3(-5.97114E-13, -5.008956E-06, -89.99999), false, false);
        //     object.create(-546242669, new mp.Vector3(726.92, -1073.712, 27.21), new mp.Vector3(0, 0, 0), false, false);
        //     object.create(-1405984223, new mp.Vector3(738.3269, -1080.166, 27.26), new mp.Vector3(5.008956E-06, -5.008955E-06, 89.99999), false, false);
        //     object.create(-1405984223, new mp.Vector3(740.7825, -1075.336, 23.15999), new mp.Vector3(5.008956E-06, -5.00895E-06, 89.99995), false, false);
        //     object.create(-1405984223, new mp.Vector3(741.3961, -1074.299, 23.15999), new mp.Vector3(5.008955E-06, -5.008947E-06, 89.99993), false, false);
        //     object.create(-1405984223, new mp.Vector3(726.7977, -1080.452, 23.46), new mp.Vector3(5.008945E-06, 2.23118E-05, -5.008955E-06), false, false);
        //     object.create(-546242669, new mp.Vector3(891.5, -180.54, 76.33456), new mp.Vector3(1.001791E-05, -5.008956E-06, -31.67498), false, false);
        //     object.create(-546242669, new mp.Vector3(897.7191, -170.4055, 76.33456), new mp.Vector3(1.001791E-05, -5.008955E-06, -31.67498), false, false);
        //     object.create(-546242669, new mp.Vector3(894.6879, -175.4846, 76.33456), new mp.Vector3(1.001791E-05, -5.008954E-06, -31.67498), false, false);
        //     object.create(-2002823169, new mp.Vector3(14.44191, -1113.317, 37.69299), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(-2002823169, new mp.Vector3(14.44191, -1113.317, 33.49), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(-2002823169, new mp.Vector3(8.71, -1111.22, 33.49297), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(-2002823169, new mp.Vector3(2.51, -1110.04, 33.49), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(-2002823169, new mp.Vector3(-3.255044, -1107.914, 33.49), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(-2002823169, new mp.Vector3(-9.04, -1104.76, 33.49), new mp.Vector3(0, 0, -109.9997), false, false);
        //     object.create(118627012, new mp.Vector3(236.2862, -881.6922, 29.4921), new mp.Vector3(0, 0, 2.399999), false, false);
        //     object.create(118627012, new mp.Vector3(-8.10861, -797.8167, 42.01741), new mp.Vector3(0, 0, 0), false, false);
        //     object.create(118627012, new mp.Vector3(-95.39378, -771.9721, 41.71894), new mp.Vector3(0, 0, 49.99998), false, false);
        //     object.create(118627012, new mp.Vector3(-44.67583, -762.1207, 41.76019), new mp.Vector3(0, 0, 39.99998), false, false);
        //     object.create(-546242669, new mp.Vector3(462.8216, -1019.916, 31.63), new mp.Vector3(0, 0, 0), false, false);
        // }


        // Load Other OBJECTS
        //M83_Galaxy_Int
    

      methods.debug("Spawned object", count)
    }
};
