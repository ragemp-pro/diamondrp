/// <reference path="../../declaration/server.ts" />

import { methods } from './methods';
import { business } from '../business';
import { enums } from '../enums';
import { user } from '../user';
import { fuel } from '../business/fuel';
import { cloth } from '../business/cloth';
import { shop } from '../business/shop';
import { barberShop } from '../business/barberShop';
import { bank } from '../business/bank';
import { licenseCenter } from '../business/licenseCenter';
import { rent } from '../business/rent';
import { gun } from '../business/gun';
import { lsc } from '../business/lsc';
import { bar } from '../business/bar';
import { carWash } from '../business/carWash';
import { tattoo } from '../business/tattoo';
import { autosalon } from '../business/autosalon';


let distanceCheck = 1.4;

export let pickups = {
    Red: [244, 67, 54, 100],
    Green: [139, 195, 74, 100],
    Blue: [33, 150, 243, 100],
    Yellow: [255, 235, 59, 100],
    Blue100: [187, 222, 251, 100],
    White: [255, 255, 255, 100],

    PrintShopPos: new mp.Vector3(-1234.7786865234375, -1477.7230224609375, 3.324739933013916),

    StockSapdPos: new mp.Vector3(477.2227, -984.3262, 23.91476),

    BankMazeLiftOfficePos: new mp.Vector3(-77.77799, -829.6542, 242.3859),
    BankMazeLiftStreetPos: new mp.Vector3(-66.66476, -802.0474, 43.22729),
    BankMazeLiftRoofPos: new mp.Vector3(-67.13605, -821.9, 320.2874),
    BankMazeLiftGaragePos: new mp.Vector3(-84.9765, -818.7122, 35.02804),
    BankMazeOfficePos: new mp.Vector3(-72.80013, -816.4397, 242.3859),


    LifeInvaderShopPos: new mp.Vector3(-1083.074, -248.3521, 36.76329),
    HackerSpaceShopPos: new mp.Vector3(522.0684, 167.0983, 98.38704),

    HackerSpaceOutPos: new mp.Vector3(1672.243, -26.09709, 172.7747),
    HackerSpaceInPos: new mp.Vector3(1671.604, -23.82703, 177.2864),

    MeriaUpPos: new mp.Vector3(-1395.997, -479.8439, 71.04215),
    MeriaDownPos: new mp.Vector3(-1379.659, -499.748, 32.15739),
    MeriaRoofPos: new mp.Vector3(-1369, -471.5994, 83.44699),
    MeriaGarPos: new mp.Vector3(-1360.679, -471.8841, 30.59572),
    // MeriaGarderobPos: new mp.Vector3(-1380.995, -470.7387, 71.04216),
    MeriaHelpPos: new mp.Vector3(-555.69, -188.61, 37.23),
    //MeriaKeyPos: new mp.Vector3(-1381.507, -466.2556, 71.04215),

    SapdDutyPos: new mp.Vector3(457.5687, -992.9395, 29.69),
    // SapdClearPos: new mp.Vector3(440.5925, -975.6348, 29.69),
    SapdArrestPos: new mp.Vector3(459.6778, -989.071, 23.91487),
    SapdToCyberRoomPos: new mp.Vector3(464.357, -983.8818, 34.89194),
    SapdFromCyberRoomPos: new mp.Vector3(463.7193, -1003.186, 31.7847),
    SapdToBalconPos: new mp.Vector3(463.0852, -1009.47, 31.78511),
    SapdFromBalconPos: new mp.Vector3(463.5898, -1012.111, 31.9835),
    SapdToBalcon2Pos: new mp.Vector3(428.4888, -995.2952, 34.68689),
    SapdFromBalcon2Pos: new mp.Vector3(464.1708, -984.0346, 38.89184),
    SapdToInterrogationPos: new mp.Vector3(404.0302, -997.302, -100.004),
    SapdFromInterrogationPos: new mp.Vector3(446.7996, -985.8127, 25.67422),

    // SheriffArsenalPos: new mp.Vector3(-437.330, 6001.264, 30.716),
    // SheriffArsenalPos2: new mp.Vector3(1842.06, 3691.33, 33.26704),
    // SheriffClearPos: new mp.Vector3(-448.6859, 6012.703, 30.71638),
    // SheriffClearPos1: new mp.Vector3(1852.84, 3689.81, 33.26),
    SheriffArrestPos: new mp.Vector3(-441.605, 6012.786, 26.985),
    SheriffArrestPos1: new mp.Vector3(1857.12, 3694.97, 29.25),

    PrisonArrestPos: new mp.Vector3(1690.606, 2591.926, 44.83793),
    PrisonPos1: new mp.Vector3(1846.5198, 2585.9008, 44.6720),
    PrisonPos2: new mp.Vector3(1774.8231, 2552.00925, 44.5649),

    UsmcPos1: new mp.Vector3(556.8799, -3119.107, 17.76859),
    UsmcPos2: new mp.Vector3(556.9783, -3120.458, 17.76858),
    UsmcPos11: new mp.Vector3(581.3184, -3119.271, 17.76858),
    UsmcPos22: new mp.Vector3(581.518, -3120.49, 17.76858),

    FibArrestPos: new mp.Vector3(2500.21, -409.59, 89.10),
    FibDutyPos: new mp.Vector3(131.0169, -729.158, 257.1521),
    FibLift0StationPos: new mp.Vector3(122.9873, -741.1865, 32.13323),
    FibLift1StationPos: new mp.Vector3(136.2213, -761.6816, 44.75201),
    FibLift2StationPos: new mp.Vector3(136.2213, -761.6816, 241.152),
    FibLift3StationPos: new mp.Vector3(114.9807, -741.8279, 257.1521),
    FibLift4StationPos: new mp.Vector3(141.4099, -735.3376, 261.8516),

    LicUpPos: new mp.Vector3(-1580.642, -561.7131, 107.523),
    LicDownPos: new mp.Vector3(-1581.576, -557.9908, 33.953),
    LicRoofPos: new mp.Vector3(-1581.576, -557.9908, 33.953),
    LicGaragePos: new mp.Vector3(-1540.117, -576.3737, 24.70784),
    LicBuyPos: new mp.Vector3(-1576.237, -579.495, 107.523),

    /*Keys*/

    PrisonKeyPos: new mp.Vector3(1840.7513, 2529.2451, 44.67202),
    TrashKeyPos: new mp.Vector3(1569.828, -2130.211, 77.33018),
    BusKeyPos: new mp.Vector3(-675.2166, -2166.933, 4.992994),
    Taxi1KeyPos: new mp.Vector3(895.4368, -179.3315, 73.70035),
    Taxi2KeyPos: new mp.Vector3(896.4077, -1035.7718, 34.109),
    SunbKeyPos: new mp.Vector3(-1185.243, -1508.272, 3.379671),
    LabKeyPos: new mp.Vector3(3605.323, 3733.005, 28.6894),
    ConnorKeyPos: new mp.Vector3(-1158.08, -742.0112, 18.66016),
    BgstarKeyPos: new mp.Vector3(152.6678, -3077.842, 4.896314),
    BshotKeyPos: new mp.Vector3(-1178.1021, -891.6275, 12.7608),
    WapKeyPos: new mp.Vector3(598.5981, 90.37159, 91.82394),
    ScrapKeyPos: new mp.Vector3(-429.1001, -1728, 18.78384),
    PhotoKeyPos: new mp.Vector3(-1041.409, -241.3437, 36.84774),
    Trucker23KeyPos1: new mp.Vector3(858.682, -3203.116, 4.994998),
    Trucker23KeyPos2: new mp.Vector3(114.1641, -2569.154, 5.004592),
    Trucker23KeyPos3: new mp.Vector3(671.4843, -2667.671, 5.081176),
    Mail1KeyPos: new mp.Vector3(-409.8598, -2803.78, 5.000382),
    Mail2KeyPos: new mp.Vector3(78.81596, 112.1012, 80.16817),


    /*EMS*/
    EmsDuty1Pos: new mp.Vector3(198.1601, -1646.53, 28.80321),
    EmsDuty2Pos: new mp.Vector3(265.9458, -1364.34, 23.53779),
    EmsTakeMedPos: new mp.Vector3(251.6622, -1346.598, 23.53781),
    //EmsAptekaPos: new mp.Vector3(260.5087, -1358.359, 23.53779),

    EmsInPos: new mp.Vector3(279.73, -1349.40, 23.54),
    EmsOutPos: new mp.Vector3(341.09, -595.49, 27.79),
    


    EmsElevatorRoofPos: new mp.Vector3(339.11, -584.11, 73.17),
    EmsElevatorPos: new mp.Vector3(247.0811, -1371.92, 23.53779),

    //Apteka
    AptekaPos: new mp.Vector3(318.3438, -1078.762, 18.68166),

    AptekaEnterPos1: new mp.Vector3(326.5005, -1074.198, 28.47986),
    AptekaEnterPos2: new mp.Vector3(325.4413, -1076.997, 18.68166),

    AptekaEnterPos11: new mp.Vector3(307.633544921875, -734.6121826171875, 28.316791534423828),
    AptekaEnterPos22: new mp.Vector3(305.29156494140625, -733.535888671875, 28.353723526000977),

    

    TheLostPos1: new mp.Vector3(982.47, -103.51, 73.848),
    TheLostPos2: new mp.Vector3(981.03, -101.79, 73.845),

    /*ElShop*/
    ElShopPos1: new mp.Vector3(-658.8024, -855.8863, 23.50986),
    ElShopPos2: new mp.Vector3(-658.6975, -854.5909, 23.50342),

    ElShopPos11: new mp.Vector3(1137.675, -470.7754, 65.66285),
    ElShopPos12: new mp.Vector3(1136.156, -470.4759, 65.70986),

    /*Club*/
    ClubGalaxyUserPos1: new mp.Vector3(-1569.33, -3016.98, -75.40616),
    ClubGalaxyUserPos2: new mp.Vector3(4.723007, 220.3487, 106.7251),

    ClubGalaxyVPos1: new mp.Vector3(-1640.193, -2989.592, -78.22095),
    ClubGalaxyVPos2: new mp.Vector3(-22.13015, 217.3953, 105.5861),

    /*ArcMotors*/
    ArcMotorsPos1: new mp.Vector3(-142.2805, -590.9449, 166.0),
    ArcMotorsPos2: new mp.Vector3(-144.3968, -577.2031, 31.42448),

    /*Apart*/
    Apart19RoofPos: new mp.Vector3(109.9076, -867.6014, 133.7701),
    Apart16RoofPos: new mp.Vector3(-902.897, -369.9444, 135.2822),
    Apart5GaragePos: new mp.Vector3(-761.8995, 352.0111, 86.99801),
    Apart0GaragePos: new mp.Vector3(-15.46794, -612.5906, 34.86151),

    /*Other*/
    WzlInPos: new mp.Vector3(-569.2264, -927.8373, 35.83355),
    WzlOutPos: new mp.Vector3(-598.7546, -929.9592, 22.86355),
    Ems1InPos: new mp.Vector3(-292.4272, -602.7892, 47.43756),
    Ems1OutPos: new mp.Vector3(-292.3299, -600.8806, 32.55319),

    /*Bar*/
    BannanaInPos: new mp.Vector3(-1387.63, -588.0929, 29.31953),
    BannanaOutPos: new mp.Vector3(-1388.737, -586.4232, 29.21938),
    ComedyInPos: new mp.Vector3(-458.3946, 284.7393, 77.52148),
    ComedyOutPos: new mp.Vector3(-430.0718, 261.1223, 82.00773),

    /*AutoRepairs*/
    AutoRepairsPos1: new mp.Vector3(1130.324, -776.4052, 56.61017),
    AutoRepairsPos2: new mp.Vector3(1130.287, -778.5369, 56.62984),
    AutoRepairsPosShop: new mp.Vector3(1128.081, -780.6564, 56.62164),
    AutoRepairsPosCarShop: new mp.Vector3(1154.168, -785.3322, 56.59872),
    AutoRepairsPosCarPos: new mp.Vector3(1150.372, -776.313, 56.59872),

    /*Eat Prison*/
    EatPrisonPos: new mp.Vector3(1753.543, 2566.54, 44.56501),

    /*Cloth*/
    ClothMaskPos: new mp.Vector3(-1337.255, -1277.948, 3.872962),

    /*Jobs*/
    RoadWorkerStartPos: new mp.Vector3(52.84556, -722.4211, 30.7647),
    MainerStartPos: new mp.Vector3(2947.1118, 2745.2358, 42.37148),

    BuilderStartPos: new mp.Vector3(-142.2255, -936.2115, 28.29189),
    BuilderUpPos: new mp.Vector3(-155.5601, -945.4041, 268.1353),
    BuilderDownPos: new mp.Vector3(-163.4722, -942.6283, 28.28476),

    CleanerStartPos: new mp.Vector3(-1539.165, -448.0839, 34.88203),

    SpawnHelpPos: new mp.Vector3(-1026.957, -2734.395, 13.75665),

    /*Biz*/
    InvaderPos1: new mp.Vector3(-1078.19, -254.3557, 43.02112),
    InvaderPos2: new mp.Vector3(-1072.305, -246.3927, 53.00602),

    /*HouseTeleport*/
    House253Pos1: new mp.Vector3(-1788.01, 425.4173, 121.6412),
    House253Pos2: new mp.Vector3(-1787.942, 419.7598, 131.3078),
    House253Pos11: new mp.Vector3(-1798.054, 409.0267, 112.4533),
    House253Pos22: new mp.Vector3(-1799.5, 414.1857, 127.3076),
    House253Pos111: new mp.Vector3(-1838.613, 437.3826, 125.1088),
    House253Pos222: new mp.Vector3(-1843.037, 438.5938, 128.7066),

    /*NPC*/
    StartHelpPos: new mp.Vector3(-1033.243, -2735.249, 19.16927),

    /*Grab*/
    GrabPos: new mp.Vector3(973.4865, -2190.531, 29.55157),

    checkPressLAlt: function(player: PlayerMp) {

        methods.debug('checkPressLAlt');

        if (!user.isLogin(player))
            return;
        let playerPos = player.position;

        

        if (methods.distanceToPos(pickups.BankMazeLiftGaragePos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.BankMazeLiftOfficePos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.BankMazeLiftStreetPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.BankMazeLiftRoofPos, playerPos) < distanceCheck)
            player.call('client:menuList:showMazeOfficeTeleportMenu');


        if (methods.distanceToPos(pickups.FibLift0StationPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.FibLift1StationPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.FibLift2StationPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.FibLift3StationPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.FibLift4StationPos, playerPos) < distanceCheck)
            player.call('client:menuList:showFibOfficeTeleportMenu');

        if (methods.distanceToPos(pickups.MeriaDownPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.MeriaGarPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.MeriaRoofPos, playerPos) < distanceCheck ||
            methods.distanceToPos(pickups.MeriaUpPos, playerPos) < distanceCheck)
            player.call('client:menuList:showGovOfficeTeleportMenu');

        //if (methods.distanceToPos(pickups.GrabPos, playerPos) < distanceCheck)
        //   player.call('client:clearGrabMoney');

        if (user.isGos(player))
            methods.checkTeleport(player, pickups.PrisonPos1, pickups.PrisonPos2);

        
        //methods.checkTeleport(player, TheLostPos1, TheLostPos2);
        //methods.checkTeleport(player, AptekaEnterPos1, AptekaEnterPos2);
        methods.checkTeleport(player, pickups.AptekaEnterPos11, pickups.AptekaEnterPos22);
        methods.checkTeleport(player, pickups.UsmcPos1, pickups.UsmcPos2);
        methods.checkTeleport(player, pickups.UsmcPos11, pickups.UsmcPos22);
        methods.checkTeleport(player, pickups.EmsInPos, pickups.EmsOutPos);
        //methods.checkTeleport(player, SapdFromBalconPos, SapdToCyberRoomPos);
        //methods.checkTeleport(player, SapdToBalconPos, SapdFromBalconPos);
        //methods.checkTeleport(player, SapdToBalcon2Pos, SapdFromBalcon2Pos);
        //methods.checkTeleport(player, SapdToInterrogationPos, SapdFromInterrogationPos);
        methods.checkTeleport(player, pickups.ComedyInPos, pickups.ComedyOutPos);
        methods.checkTeleport(player, pickups.ClubGalaxyUserPos1, pickups.ClubGalaxyUserPos2);
        methods.checkTeleport(player, pickups.Ems1OutPos, pickups.Ems1InPos);
        methods.checkTeleport(player, pickups.WzlInPos, pickups.WzlOutPos);
        methods.checkTeleport(player, pickups.LicDownPos, pickups.LicUpPos);
        methods.checkTeleport(player, pickups.BuilderDownPos, pickups.BuilderUpPos);
        methods.checkTeleport(player, pickups.InvaderPos2, pickups.InvaderPos1);
        methods.checkTeleport(player, pickups.House253Pos1, pickups.House253Pos2);
        methods.checkTeleport(player, pickups.House253Pos11, pickups.House253Pos22);
        methods.checkTeleport(player, pickups.House253Pos111, pickups.House253Pos222);
        
        methods.checkTeleport(player, pickups.EmsElevatorRoofPos, pickups.EmsElevatorPos);

        //gr6
        methods.checkTeleport(player, new mp.Vector3(486.0731, -1075.497, 28.00087), new mp.Vector3(486.0519, -1078.475, 28.19953));

        methods.checkTeleportVeh(player, pickups.ArcMotorsPos1, pickups.ArcMotorsPos2);
        methods.checkTeleportVeh(player, pickups.ClubGalaxyVPos1, pickups.ClubGalaxyVPos2);
    },

    checkPressE: function(player: PlayerMp) {
        // methods.debug('checkPressE');
        if (!user.isLogin(player))
            return;

        let playerPos = player.position;

        

        /*if (player.dimension > 0) {
            player.notify('~r~Это действие не доступно');
            return;
        }*/

        tattoo.checkPosForOpenMenu(player);
        fuel.checkPosForOpenMenu(player);
        carWash.checkPosForOpenMenu(player);
        shop.checkPosForOpenMenu(player);
        bank.checkPosForOpenMenu(player);
        cloth.checkPosForOpenMenu(player);
        licenseCenter.checkPosForOpenMenu(player);
        barberShop.checkPosForOpenMenu(player);
        bar.checkPosForOpenMenu(player);
        rent.checkPosForOpenBikeMenu(player);
        gun.checkPosForOpenMenu(player);
        lsc.checkPosForOpenMenu(player);
        autosalon.checkPosForOpenMenu(player);

        if (methods.distanceToPos(pickups.LifeInvaderShopPos, playerPos) < distanceCheck)
            player.call('client:menuList:showInvaderShopMenu');

        if (methods.distanceToPos(pickups.PrintShopPos, playerPos) < distanceCheck)
            player.call('client:menuList:showPrintShopMenu');

        if (methods.distanceToPos(pickups.BankMazeOfficePos, playerPos) < distanceCheck)
            player.call('client:menuList:showMazeOfficeMenu');
        if (methods.distanceToPos(pickups.MeriaHelpPos, playerPos) < distanceCheck)
            player.call('client:menuList:showMeriaMainMenu');

        if (methods.distanceToPos(pickups.Mail1KeyPos, playerPos) < distanceCheck || methods.distanceToPos(pickups.Mail2KeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehMailMenu');
        if (methods.distanceToPos(pickups.BusKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehBusMenu');
        if (methods.distanceToPos(pickups.Taxi1KeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehTaxi1Menu');
        if (methods.distanceToPos(pickups.Taxi2KeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehTaxi2Menu');
        if (methods.distanceToPos(pickups.BgstarKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehBugstarMenu');
        if (methods.distanceToPos(pickups.BshotKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehBshotMenu');
        if (methods.distanceToPos(pickups.SunbKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehSunsetBleachMenu');
        if (methods.distanceToPos(pickups.WapKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehWaterPowerMenu');
        if (methods.distanceToPos(pickups.ConnorKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehGardenerMenu');
        if (methods.distanceToPos(pickups.PhotoKeyPos, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehPhotoMenu');
        if (methods.distanceToPos(pickups.Trucker23KeyPos1, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehTruckerMenu', [1]);
        if (methods.distanceToPos(pickups.Trucker23KeyPos2, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehTruckerMenu', [2]);
        if (methods.distanceToPos(pickups.Trucker23KeyPos3, playerPos) < distanceCheck)
            player.call('client:menuList:showRentVehTruckerMenu', [3]);

        

        
        
        if (user.isSapd(player)) {
            // if (methods.distanceToPos(pickups.SapdClearPos, playerPos) < distanceCheck)
            //     player.call('client:menuList:showSapdClearMenu');
            if (methods.distanceToPos(pickups.SapdArrestPos, playerPos) < distanceCheck)
                player.call('client:menuList:showSapdArrestMenu');
        }
        if (user.isSheriff(player)) {
            // if (methods.distanceToPos(pickups.SapdClearPos, playerPos) < distanceCheck)
            //     player.call('client:menuList:showSapdClearMenu');
            // if (methods.distanceToPos(pickups.SheriffClearPos, playerPos) < distanceCheck)
            //     player.call('client:menuList:showSapdClearMenu');
            // if (methods.distanceToPos(pickups.SheriffClearPos1, playerPos) < distanceCheck)
            //     player.call('client:menuList:showSapdClearMenu');
            if (methods.distanceToPos(pickups.SheriffArrestPos, playerPos) < distanceCheck)
                player.call('client:menuList:showSapdArrestMenu');
            if (methods.distanceToPos(pickups.SheriffArrestPos1, playerPos) < distanceCheck)
                player.call('client:menuList:showSapdArrestMenu');
        }
        if (user.isSheriff(player) || user.isFib(player) || user.isSapd(player)) {
            if (methods.distanceToPos(pickups.PrisonArrestPos, playerPos) < distanceCheck)
                player.call('client:menuList:showSapdArrestMenu');
        }
        if (user.isFib(player)) {
            if (methods.distanceToPos(pickups.FibArrestPos, playerPos) < distanceCheck)
                player.call('client:menuList:showSapdArrestMenu');
        }
    },

    createPickups: function() {
        methods.debug('createPickups');
        //NPC
        //methods.createStaticCheckpointV(pickups.StartHelpPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Yellow);

        //AutoRepairs
        //methods.createStaticCheckpointV(pickups.AutoRepairsPosShop, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.AutoRepairsPosCarShop, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.AutoRepairsPosCarPos, 'Место для ремонта транспорта', 1, -1, Blue);

        //Eat Prison
        methods.createStaticCheckpointV(pickups.EatPrisonPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //EMS
        //methods.createStaticCheckpointV(pickups.EmsTakeMedPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.EmsAptekaPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.EmsDuty1Pos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.EmsDuty2Pos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);

        //Apteka
        //methods.createStaticCheckpointV(pickups.AptekaPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, Blue);
        //methods.createStaticCheckpointV(pickups.TheLostPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, Blue100);
        //methods.createStaticCheckpointV(pickups.TheLostPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, Blue100);
        
        
        methods.createStaticCheckpointV(pickups.PrisonPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.PrisonPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        //methods.createStaticCheckpointV(pickups.AptekaEnterPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, Blue100);
        methods.createStaticCheckpointV(pickups.AptekaEnterPos11, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.AptekaEnterPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.AptekaEnterPos22, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        methods.createStaticCheckpointV(pickups.UsmcPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.UsmcPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.UsmcPos11, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.UsmcPos22, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        //Keys
        methods.createStaticCheckpointV(pickups.TrashKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.BusKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Taxi1KeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Taxi2KeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.SunbKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.LabKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.ConnorKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.BgstarKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.BshotKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.WapKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        //methods.createStaticCheckpointV(pickups.ScrapKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.PhotoKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Trucker23KeyPos1, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Trucker23KeyPos2, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Trucker23KeyPos3, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Mail1KeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Mail2KeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        

        //Hackerspace
        methods.createStaticCheckpointV(pickups.HackerSpaceShopPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        //Hackerspace
        methods.createStaticCheckpointV(pickups.PrintShopPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //Invader
        methods.createStaticCheckpointV(pickups.LifeInvaderShopPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //EMS
        methods.createStaticCheckpointV(pickups.EmsInPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.EmsOutPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);


        methods.createStaticCheckpointV(pickups.EmsElevatorPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.EmsElevatorRoofPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        //SAPD
        /*methods.createStaticCheckpointV(pickups.SapdFromCyberRoomPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdToCyberRoomPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdToBalconPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdFromBalconPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdToBalcon2Pos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdFromBalcon2Pos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdFromInterrogationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.SapdToInterrogationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);*/

        //methods.createStaticCheckpointV(pickups.SapdToInterrogationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        //Checkpoint.Create(SapdToInterrogationPos, 1.4, "pickup:teleport");

        //methods.createStaticCheckpointV(pickups.SapdFromInterrogationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        //Checkpoint.Create(SapdFromInterrogationPos, 1.4, "pickup:teleport");

        //Maze Bank
        methods.createStaticCheckpointV(pickups.BankMazeLiftOfficePos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.BankMazeLiftStreetPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.BankMazeLiftRoofPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.BankMazeLiftGaragePos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.BankMazeOfficePos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);


        //Meria
        methods.createStaticCheckpointV(pickups.MeriaUpPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.MeriaDownPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.MeriaRoofPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.MeriaGarPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        // methods.createStaticCheckpointV(pickups.MeriaGarderobPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.MeriaHelpPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //SAPD
        //methods.createStaticCheckpointV(pickups.SapdDutyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        //methods.createStaticCheckpointV(pickups.StockSapdPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        // methods.createStaticCheckpointV(pickups.SapdClearPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.SapdArrestPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.PrisonKeyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        // methods.createStaticCheckpointV(pickups.SheriffClearPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        // methods.createStaticCheckpointV(pickups.SheriffClearPos1, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.SheriffArrestPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.SheriffArrestPos1, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        methods.createStaticCheckpointV(pickups.PrisonArrestPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.FibArrestPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //FIB
        //methods.createStaticCheckpointV(pickups.FibDutyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        methods.createStaticCheckpointV(pickups.FibLift0StationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.FibLift1StationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.FibLift2StationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.FibLift3StationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.FibLift4StationPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        //Bar
        /*methods.createStaticCheckpointV(pickups.BannanaInPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        Checkpoint.Create(BannanaInPos, 1.4, "pickup:teleport:menu");
    
        methods.createStaticCheckpointV(pickups.BannanaOutPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        Checkpoint.Create(BannanaOutPos, 1.4, "pickup:teleport:menu");*/

        methods.createStaticCheckpointV(pickups.ComedyInPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.ComedyOutPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        //methods.createStaticCheckpointV(pickups.AutoRepairsPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        //methods.createStaticCheckpointV(pickups.AutoRepairsPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        //Apart
        methods.createStaticCheckpointV(pickups.Apart0GaragePos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Apart5GaragePos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Apart16RoofPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.Apart19RoofPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //ElShop

        //ClubGalaxy
        methods.createStaticCheckpointV(pickups.ClubGalaxyUserPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.ClubGalaxyUserPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        //methods.createStaticCheckpointV(pickups.ClubGalaxyVPos1, 4, 0.3, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.ClubGalaxyVPos2, "Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом", 4, -1, pickups.Blue100, 0.3);

        //ArcMotors
        methods.createStaticCheckpointV(pickups.ArcMotorsPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 4, -1, pickups.Blue100, 0.3);
        methods.createStaticCheckpointV(pickups.ArcMotorsPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 4, -1, pickups.Blue100, 0.3);

        //Other
        methods.createStaticCheckpointV(pickups.Ems1OutPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.Ems1InPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        methods.createStaticCheckpointV(pickups.WzlInPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.WzlOutPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        

        //Lic
        methods.createStaticCheckpointV(pickups.LicUpPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.LicDownPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.LicRoofPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.LicGaragePos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.LicBuyPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //Cloth
        //methods.createStaticCheckpointV(pickups.ClothMaskPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //RoadWorker
        methods.createStaticCheckpointV(pickups.RoadWorkerStartPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.MainerStartPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //Builder
        methods.createStaticCheckpointV(pickups.BuilderStartPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);
        methods.createStaticCheckpointV(pickups.BuilderUpPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.BuilderDownPos, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.CleanerStartPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        //
        //methods.createStaticCheckpointV(pickups.GrabPos, 'Нажмите ~g~E~s~ чтобы открыть меню', 1, -1, pickups.Blue);

        methods.createStaticCheckpointV(pickups.InvaderPos1, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);
        methods.createStaticCheckpointV(pickups.InvaderPos2, 'Нажмите ~g~Left Alt~s~ чтобы воспользоваться пикапом', 1, -1, pickups.Blue100);

        
    }

};
