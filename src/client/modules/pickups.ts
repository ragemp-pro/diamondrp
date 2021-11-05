/// <reference path="../../declaration/client.ts" />

import { methods } from "./methods";

let pickups = {
  BshotKeyPos: new mp.Vector3(-1178.1021, -891.6275, 12.7608),
  WapKeyPos: new mp.Vector3(598.5981, 90.37159, 91.82394),
  ScrapKeyPos: new mp.Vector3(-429.1001, -1728, 18.78384),
  PhotoKeyPos: new mp.Vector3(-1041.409, -241.3437, 36.84774),
  Trucker23KeyPos1: new mp.Vector3(858.682, -3203.116, 4.994998),
  Trucker23KeyPos2: new mp.Vector3(114.1641, -2569.154, 5.004592),
  Trucker23KeyPos3: new mp.Vector3(671.4843, -2667.671, 5.081176),
  Mail1KeyPos: new mp.Vector3(-409.8598, -2803.78, 5.000382),
  Mail2KeyPos: new mp.Vector3(78.81596, 112.1012, 80.16817),
  Gr6KeyPos: new mp.Vector3(484.3769, -1094.1658, 28.3966),
  Ems1KeyPos: new mp.Vector3(293.5118, -1447.379, 28.96659),
  Usmc1KeyPos: new mp.Vector3(-2270.5, 3183.46, 31.81), // ТТС
  Usmc2KeyPos: new mp.Vector3(3080.830810546875, -4693.53515625, 14.262321472167969),
  TrashKeyPos: new mp.Vector3(1569.828, -2130.211, 77.33018),
    BusKeyPos: new mp.Vector3(-675.2166, -2166.933, 4.992994),
    Taxi1KeyPos: new mp.Vector3(895.4368, -179.3315, 73.70035),
    Taxi2KeyPos: new mp.Vector3(896.4077, -1035.7718, 34.109),
    SunbKeyPos: new mp.Vector3(-1185.243, -1508.272, 3.379671),
    LabKeyPos: new mp.Vector3(3605.323, 3733.005, 28.6894),
    ConnorKeyPos: new mp.Vector3(-1158.08, -742.0112, 18.66016),
    BgstarKeyPos: new mp.Vector3(152.6678, -3077.842, 4.896314),
}


methods.createBlip(pickups.BshotKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.WapKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
//methods.createBlip(pickups.ScrapKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.PhotoKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Trucker23KeyPos1, 50, 59, 0.4, 'Гараж рабочего транспорта');

methods.createBlip(pickups.Trucker23KeyPos2, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Trucker23KeyPos3, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Mail1KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');

methods.createBlip(pickups.Mail2KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');

// methods.createBlip(pickups.Gr6KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.WapKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
// methods.createBlip(pickups.Gr6KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.WapKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
//methods.createBlip(pickups.ScrapKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.PhotoKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Trucker23KeyPos1, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Trucker23KeyPos2, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Trucker23KeyPos3, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Mail1KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Mail2KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
// methods.createBlip(pickups.Gr6KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.TrashKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.BusKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Taxi1KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.Taxi2KeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.SunbKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.LabKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.ConnorKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
methods.createBlip(pickups.BgstarKeyPos, 50, 59, 0.4, 'Гараж рабочего транспорта');
mp.game.ui.setNewWaypoint(mp.players.local.position.x, mp.players.local.position.y);

