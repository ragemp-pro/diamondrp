import { methods } from '../modules/methods';

mp.events.add('seatPedIntoVehicle', (pedid: number, vehid: number, seat: number, timeout:number, speed:number, flag:number) => {
  let ped = mp.peds.atRemoteId(pedid);
  if(!ped) return;
  let veh = mp.vehicles.atRemoteId(vehid);
  if(!veh) return;
  mp.game.invoke(methods.TASK_ENTER_VEHICLE, ped.handle, veh.handle, timeout, seat, speed, flag);
})
mp.events.add('pedDriveWaypoint', (pedid: number, x: number, y: number, z: number, speed: number, driveMode: number, stopRange: number) => {
  let ped = mp.peds.atRemoteId(pedid);
  if(!ped) return;
  mp.game.invoke("0x158BB33F920D360C", ped.handle, mp.game.invoke('0x9A9112A0FE9A4713', ped.handle, true), x, y, z, speed, driveMode, stopRange)
})
mp.events.add('clearPedTask', (pedid: number, immediately = false) => {
  let ped = mp.peds.atRemoteId(pedid);
  if(!ped) return;
  if (immediately) mp.game.invoke("0xE1EF3C1216AFF2CD", ped.handle)
  else mp.game.invoke("0xAAA34F8A7CB32098", ped.handle)
})



let _npcList:{
  pos:Vector3Mp;
  heading:number;
  isCreate:boolean;
  handle:number;
  ped:PedMp;
  model:HashOrString;
  scenario:string;
  animation1:string;
  animation2:string;
  flag:number;
  speechRadius:number;
  didRequest?:boolean;
  isSpeech:boolean;
  speech1:string;
  speech2:string;
}[] = [];
let _loadDist = 100;

let npc = {
  loadAll: () => {
    //House1126
    npc.create(
      's_m_m_highsec_01',
      new mp.Vector3(-137.6827, 974.5458, 235.75),
      -99.98929,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      's_m_m_highsec_02',
      new mp.Vector3(-132.2644, 972.4172, 235.7416),
      64.99982,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      'a_f_y_soucent_02',
      new mp.Vector3(-106.3265, 961.6937, 233.3073),
      116.0001,
      true,
      'WORLD_HUMAN_GARDENER_PLANT'
    );
    npc.create(
      's_m_m_gardener_01',
      new mp.Vector3(-62.68492, 940.9781, 232.4227),
      70.99993,
      true,
      'WORLD_HUMAN_GARDENER_LEAF_BLOWER'
    );
    npc.create(
      's_m_y_devinsec_01',
      new mp.Vector3(-110.9386, 999.0899, 240.8519),
      28.40079,
      true,
      'CODE_HUMAN_CROSS_ROAD_WAIT'
    );
    npc.create(
      'u_m_m_jewelsec_01',
      new mp.Vector3(-93.59818, 987.443, 240.9464),
      -152.9994,
      true,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    npc.create(
      's_m_m_highsec_01',
      new mp.Vector3(-61.13178, 978.3408, 232.8693),
      -153.9992,
      true,
      'WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT'
    );
    npc.create(
      's_m_m_highsec_02',
      new mp.Vector3(-82.46698, 942.5785, 233.0286),
      0.09982711,
      true,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    npc.create(
      's_m_y_devinsec_01',
      new mp.Vector3(-113.0847, 983.8484, 235.7563),
      119.1996,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      'u_m_m_jewelsec_01',
      new mp.Vector3(-48.72831, 951.6181, 232.1743),
      -173.2996,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      's_m_m_highsec_01',
      new mp.Vector3(-68.40871, 1007.543, 234.3994),
      -34.9999,
      true,
      'WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT'
    );
    npc.create(
      'a_f_m_eastsa_02',
      new mp.Vector3(-80.19171, 980.4577, 234.1708),
      -134.9996,
      true,
      'WORLD_HUMAN_GARDENER_PLANT'
    );
  
    // 24/7 - Гора Чиллиад - Шоссе Сенора
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(1728.476, 6416.668, 35.03724),
      -109.9557,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // LTD Gasoline - Грейпсид - Грейпсид-Пейн-стрит
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(1698.477, 4922.482, 42.06366),
      -32.02934,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Сэнди Шорс - Нинланд-авеню
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(1959.179, 3741.332, 32.34376),
      -51.81022,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Хармони - Шоссе 68
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(549.306, 2669.898, 42.15651),
      102.036,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Rob's Liquor - Пустыня Гранд-Сенора - Шоссе 68
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(1165.198, 2710.855, 38.15769),
      -169.9903,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Пустыня Гранд-Сенора - Шоссе Сенора
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(2676.561, 3280.001, 55.24115),
      -20.5138,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Чумаш - Барбарено-роуд
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(-3243.886, 999.9983, 12.83071),
      -0.1504957,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Каньон Бэнхэм - Инесено-роуд
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(-3040.344, 584.0048, 7.908932),
      25.86866,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Rob's Liquor - Каньон Бэнхэм - Шоссе Грейт-Оушн
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(-2966.275, 391.6495, 15.04331),
      90.95544,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // LTD Gasoline - Ричман-Глен - Бэнхэм-Кэньон-драйв
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(-1820.364, 794.7905, 138.0867),
      136.5701,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Центр Вайнвуда - Клинтон-авеню
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(372.8323, 327.9543, 103.5664),
      -93.31544,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Rob's Liquor - Морнингвуд - Просперити-стрит
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(-1486.615, -377.3467, 40.16341),
      135.9596,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Rob's Liquor - Каналы Веспуччи - Сан-Андреас-авеню
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(-1221.311, -907.9825, 12.32635),
      44.03139,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // LTD Gasoline - Маленький Сеул - Паломино-авеню
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(-706.0112, -912.8375, 19.2156),
      93.35769,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // LTD Gasoline - Миррор-Парк - Вест-Миррор-драйв
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(1164.863, -322.054, 69.2051),
      109.3829,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Rob's Liquor - Мурьета-Хайтс - Бульвар Эль-Ранчо
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(1134.109, -983.1777, 46.41582),
      -74.49993,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Строберри - Бульвар Инносенс
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(24.17295, -1345.768, 29.49703),
      -79.8604,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    ); //
    // LTD Gasoline - Дэвис - Дэвис-авеню
    npc.create(
      mp.game.joaat('s_f_y_sweatshop_01'),
      new mp.Vector3(-46.25561, -1757.611, 29.42101),
      55.09486,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // 24/7 - Татавиамские горы - Шоссе Паломино
    npc.create(
      mp.game.joaat('mp_m_shopkeep_01'),
      new mp.Vector3(2555.677, 380.6046, 108.623),
      1.572431,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Digital Den - Маленький Сеул - Паломино-авеню
    npc.create(
      mp.game.joaat('g_m_y_korean_01'),
      new mp.Vector3(-656.9416, -858.7859, 24.49001),
      2.746706,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Digital Den - Миррор-Парк - Бульвар Миррор-Парк
    npc.create(
      mp.game.joaat('a_m_y_hipster_01'),
      new mp.Vector3(1132.687, -474.5676, 66.7187),
      345.9362,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Family Pharmacy - Мишн-Роу - Фантастик-плейс
    npc.create(
      mp.game.joaat('a_m_m_business_01'),
      new mp.Vector3(317.9639, -1078.319, 28.47855),
      359.3141,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Dollars Pills - Альта - Альта-стрит
    npc.create(
      mp.game.joaat('a_f_y_business_01'),
      new mp.Vector3(92.31831, -231.1054, 54.66363),
      327.2379,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // D.P. Pharmacy - Текстайл-Сити - Строберри-авеню
    npc.create(
      mp.game.joaat('a_m_m_business_01'),
      new mp.Vector3(299.7478, -733.0994, 29.3525),
      255.0316,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Bay Side Drugs - Палето-Бей - Бульвар Палето
    npc.create(
      mp.game.joaat('a_f_y_business_01'),
      new mp.Vector3(-177.5367, 6384.567, 31.49536),
      224.1046,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Ammu-Nation - Татавиамские горы - Шоссе Паломино
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(2567.45, 292.3297, 108.7349),
      0.9863386,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Чумаш - Барбарено-роуд
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(-3173.501, 1088.957, 20.83874),
      -106.5671,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Река Занкудо - Шоссе 68
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(-1118.609, 2700.271, 18.55414),
      -135.1759,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Сэнди-Шорс - Бульвар Алгонквин
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(1692.413, 3761.51, 34.70534),
      -126.9435,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Палето-Бэй - Шоссе Грейт-Оушн
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(-331.3555, 6085.712, 31.45477),
      -133.1493,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Пиллбокс-Хилл - Элгин-Авеню
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(23.1827, -1105.512, 29.79702),
      158.1179,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Хавик - Спэниш-авеню
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(253.8001, -51.07007, 69.9411),
      71.83827,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Ла-Меса - Шоссе Олимпик
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(841.848, -1035.449, 28.19485),
      -1.228782,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Маленький Сеул - Паломино-авеню
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(-661.7558, -933.2841, 21.82923),
      -178.1721,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Морнингвуд - Бульвар Морнингвуд
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(-1303.956, -395.2117, 36.69579),
      75.62228,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Ammu-Nation - Сайпрес-Флэтс - Попьюлар-стрит
    npc.create(
      mp.game.joaat('s_m_y_ammucity_01'),
      new mp.Vector3(809.6276, -2159.31, 29.61901),
      -2.014809,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Blazing Tattoo - Центр Вайнвуда - Бульвар Ванйвуд
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(319.8327, 181.0894, 103.5865),
      -106.512,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Alamo Tattoo Studio - Сэнди-Шорс - Занкудо-авеню
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(1862.807, 3748.279, 33.03187),
      40.61253,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Paleto Tattoo - Палето-Бэй - Дулуоз-авеню
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(-292.3047, 6199.946, 31.48711),
      -117.6071,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // The Pit - Каналы Веспуччи - Агуха-стрит
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(-1151.971, -1423.695, 4.954463),
      136.3183,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Los Santos Tattoos - Эль-Бурро-Хайтс - Бульвар Инносенс
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(1324.483, -1650.021, 52.27503),
      144.9793,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Ink Inc - Чумаш - Барбарено-роуд
    npc.create(
      mp.game.joaat('u_m_y_tattoo_01'),
      new mp.Vector3(-3170.404, 1072.786, 20.82917),
      -6.981083,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Herr Kutz Barber - Дэвис - Карсон-авеню
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(134.8694, -1708.296, 29.29161),
      151.6018,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Herr Kutz Barber - Миррор-Парк - Бульвар Миррор-Парк
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(1211.27, -471.0499, 66.20805),
      82.84951,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Herr Kutz Barber - Палето-Бэй - Дулуоз-авеню
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(-278.3121, 6230.216, 31.69552),
      60.1603,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Beach Combover Barber - Веспуччи - Магеллан-авеню
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(-1284.274, -1115.853, 6.99013),
      99.18153,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // O'Sheas Barbers Shop - Сэнди-Шорс - Альгамбра-драйв
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(1931.232, 3728.298, 32.84444),
      -144.9153,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Hair on Hawick - Хавик - Хавик-авеню
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(-31.19347, -151.4883, 57.07652),
      -7.542643,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Bob Mulet - Рокфорд-Хиллз - Мэд-Уэйн-Тандер-драйв
    npc.create(
      mp.game.joaat('s_f_m_fembarber'),
      new mp.Vector3(-822.4669, -183.7317, 37.56892),
      -139.7869,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Binco - Каналы Веспуччи - Паломино-авеню
    npc.create(
      mp.game.joaat('a_f_y_hipster_02'),
      new mp.Vector3(-823.3749, -1072.378, 11.32811),
      -108.4307,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Binco - Текстайл-Сити - Синнерс-пэссейдж
    npc.create(
      mp.game.joaat('a_m_y_hipster_02'),
      new mp.Vector3(427.0797, -806.0226, 29.49113),
      130.6033,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Discount Store - Палето-Бэй - Бульвар Палето
    npc.create(
      mp.game.joaat('a_f_y_hipster_02'),
      new mp.Vector3(6.133633, 6511.472, 31.87784),
      82.75452,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Discount Store - Грейпсид - Грейпсид-Мэйн-стрит
    npc.create(
      mp.game.joaat('a_m_y_hipster_02'),
      new mp.Vector3(1695.472, 4823.236, 42.0631),
      125.9657,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Discount Store - Пустыня Гранд-Сенора - Шоссе 68
    npc.create(
      mp.game.joaat('a_f_y_hipster_02'),
      new mp.Vector3(1196.317, 2711.907, 38.22262),
      -145.9363,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Discount Store - Река Занкудо - Шоссе 68
    npc.create(
      mp.game.joaat('a_m_y_hipster_02'),
      new mp.Vector3(-1102.664, 2711.66, 19.10786),
      -103.8504,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Discount Store - Строберри - Бульвар Инносентс
    npc.create(
      mp.game.joaat('a_f_y_hipster_02'),
      new mp.Vector3(73.73582, -1392.895, 29.37614),
      -68.70364,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Sub Urban - Хармони - Шоссе 68
    npc.create(
      mp.game.joaat('s_f_y_shop_mid'),
      new mp.Vector3(612.8171, 2761.852, 42.08812),
      -63.55088,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Sub Urban - Дель-Перро - Норт-Рокфорд-драйв
    npc.create(
      mp.game.joaat('a_m_y_hipster_01'),
      new mp.Vector3(-1194.562, -767.3227, 17.31602),
      -120.527,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Sub Urban - Чумаш - Шоссе Грейт-Оушн
    npc.create(
      mp.game.joaat('s_f_y_shop_mid'),
      new mp.Vector3(-3168.905, 1043.997, 20.86322),
      80.39653,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Sub Urban - Альта - Хавик-авеню
    npc.create(
      mp.game.joaat('a_m_y_hipster_01'),
      new mp.Vector3(127.306, -223.5369, 54.55785),
      101.7699,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Ponsonbys - Бертон - Бульвар Лас-Лагунас
    npc.create(
      mp.game.joaat('a_f_y_business_01'),
      new mp.Vector3(-164.6587, -302.2024, 39.7333),
      -90.87177,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Ponsonbys - Рокфорд-Хиллз - Портола-драйв
    npc.create(
      mp.game.joaat('a_m_y_business_01'),
      new mp.Vector3(-708.5155, -152.5676, 37.41148),
      133.2013,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Ponsonbys - Морнингвуд - Кугар-авеню
    npc.create(
      mp.game.joaat('a_f_y_business_01'),
      new mp.Vector3(-1449.5, -238.6422, 49.81335),
      60.38498,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Vangelico - Рокфорд-Хиллз - Рокфорд-драйв
    npc.create(
      mp.game.joaat('u_f_y_jewelass_01'),
      new mp.Vector3(-623.1789, -229.2665, 38.05703),
      48.75668,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    npc.create(
      mp.game.joaat('ig_jewelass'),
      new mp.Vector3(-620.9707, -232.295, 38.05703),
      -134.2347,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    npc.create(
      mp.game.joaat('u_m_m_jewelsec_01'),
      new mp.Vector3(-628.8972, -238.8752, 38.05712),
      -49.34913,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    // Vespucci Movie Masks - Веспуччи-бич - Витус-стрит
    npc.create(
      mp.game.joaat('s_m_y_shop_mask'),
      new mp.Vector3(-1334.673, -1276.343, 4.963552),
      142.5475,
      false,
      'WORLD_HUMAN_STAND_IMPATIENT'
    );
    // Beekers Garage - Палето-Бэй - Бульвар Палето
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(106.3625, 6628.315, 31.78724),
      -108.3491,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Los Santos Customs Senora - Пустыня-Гранд-Сенора - Шоссе 68
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(1178.711, 2639.02, 37.7538),
      64.71403,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Los Santos Customs Burton - Бертон - Карсер-вэй
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(-345.0504, -129.6553, 39.00965),
      -149.6841,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Los Santos Customs La Mesa - Ла-Меса - Шоссе-Олимпик
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(737.2117, -1083.939, 22.16883),
      97.4564,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Hayes Autos - Строберри - Литл-Бигхорн-авеню
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(471.7564, -1310.021, 29.22494),
      -128.6412,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bennys Original Motor Works - Строберри - Альта-стрит
    npc.create(
      mp.game.joaat('ig_benny'),
      new mp.Vector3(-216.5449, -1320.012, 30.89039),
      -97.54453,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Los Santos Customs LSIA - Международный аэропорт Лос-Сантос - Гринвич-Парквэй
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(-1145.874, -2003.389, 13.18026),
      94.71597,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Arcadius Motors - Пиллбокс-Хилл - Агуха-стрит
    npc.create(
      mp.game.joaat('s_m_m_autoshop_01'),
      new mp.Vector3(-146.3981, -583.4999, 167.0001),
      170.6504,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Международный аэропорт Лос-Сантос - Нью-Эмпайр-вэй
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(-1013.832, -2681.289, 13.98584),
      -129.831,
      false,
      'CODE_HUMAN_MEDIC_TIME_OF_DEATH'
    );
    // Bike rent - Строберри - Элгин-авеню
    npc.create(
      mp.game.joaat('a_m_m_skater_01'),
      new mp.Vector3(54.99599, -1332.448, 29.31313),
      -89.18844,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    // Bike rent - Центр Вайнвуда - Бульвар Ванйвуд
    npc.create(
      mp.game.joaat('a_m_y_skater_01'),
      new mp.Vector3(317.7819, 131.6896, 103.5097),
      -8.225225,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Дель-Перро - Магеллан-авеню
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(-1438.929, -616.7726, 30.83312),
      43.13194,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    // Bike rent - Чумаш - Барбарено-роуд
    npc.create(
      mp.game.joaat('a_m_m_skater_01'),
      new mp.Vector3(-3241.305, 978.2664, 12.7019),
      -75.12445,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Палето-Бэй - Бульвар Палето
    npc.create(
      mp.game.joaat('a_m_y_skater_01'),
      new mp.Vector3(-266.6101, 6286.955, 31.51312),
      -122.874,
      false,
      'WORLD_HUMAN_SMOKING'
    );
    // Bike rent - Грейпсид - Грейпсид-Мэйн-стрит
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(1683.86, 4849.291, 42.1307),
      80.91198,
      false,
      'CODE_HUMAN_MEDIC_TIME_OF_DEATH'
    );
    // Bike rent - Сэнди-Шорс - Альгамбра-драйв
    npc.create(
      mp.game.joaat('a_m_m_skater_01'),
      new mp.Vector3(1866.788, 3686.039, 33.80155),
      -140.6224,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Пустыня-Гранд-Сенора - Шоссе 68
    npc.create(
      mp.game.joaat('a_m_y_skater_01'),
      new mp.Vector3(1931.512, 2626.497, 46.13971),
      -134.649,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Текстайл-Сити - Элгин-авеню
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(297.899, -600.8516, 43.33313),
      170.1455,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    // Bike rent - Миррор-Парк - Никола-авеню
    npc.create(
      mp.game.joaat('a_m_m_skater_01'),
      new mp.Vector3(1127.567, -502.2049, 64.18119),
      -159.9116,
      false,
      'CODE_HUMAN_MEDIC_TIME_OF_DEATH'
    );
    // Bike rent - Пиллбокс-Хилл - Бульвар Веспуччи
    npc.create(
      mp.game.joaat('a_m_y_skater_01'),
      new mp.Vector3(-54.65418, -912.4835, 29.47488),
      -148.2788,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Маленький Сеул - Декер-стрит
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(-873.3246, -809.8458, 19.2563),
      -174.0148,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    // Bike rent - Рокфорд-Хиллз - Южный бульвар Дель-Перро
    npc.create(
      mp.game.joaat('a_m_m_skater_01'),
      new mp.Vector3(-824.8772, -115.1577, 37.58219),
      -162.9892,
      false,
      'WORLD_HUMAN_SMOKING'
    );
    // Bike rent - Веспуччи-бич - Гома-стрит
    npc.create(
      mp.game.joaat('a_m_y_skater_01'),
      new mp.Vector3(-1205.739, -1555.178, 4.373027),
      -3.119672,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    // Bike rent - Хармони - Сенора-роуд
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(286.0219, 2594.102, 44.40743),
      -69.00703,
      false,
      'WORLD_HUMAN_SMOKING'
    );
    // Bike rent - Мишн-Роу - Алти-стрит
    npc.create(
      mp.game.joaat('a_f_y_skater_01'),
      new mp.Vector3(387.2543, -946.5811, 29.42514),
      -175.2946,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    // Boat rent - Ла-Пуэрта - Шэнк-стрит
    npc.create(
      mp.game.joaat('a_m_y_runner_01'),
      new mp.Vector3(-790.4313, -1453.044, 1.596039),
      -38.84312,
      false,
      'CODE_HUMAN_MEDIC_TIME_OF_DEATH'
    );
    // Boat rent - Бухта Палето - Шоссе Грейт-Оушн
    npc.create(
      mp.game.joaat('a_f_y_runner_01'),
      new mp.Vector3(-1603.928, 5251.08, 3.974748),
      108.5822,
      false,
      'WORLD_HUMAN_SMOKING'
    );
    // Boat rent - Сан-Шаньский горный хребет - Кэтфиш-Вью
    npc.create(
      mp.game.joaat('a_m_y_runner_01'),
      new mp.Vector3(3867.177, 4463.583, 2.727666),
      73.1316,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
  
    //EMS
    npc.create(
      mp.game.joaat('s_f_y_scrubs_01'),
      new mp.Vector3(262.7821, -1359.238, 24.53779),
      46.81502,
      true,
      'WORLD_HUMAN_CLIPBOARD'
    );
    npc.create(
      mp.game.joaat('s_m_m_doctor_01'),
      new mp.Vector3(280.5828, -1333.853, 24.53781),
      319.4619,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    npc.create(
      mp.game.joaat('s_m_m_paramedic_01'),
      new mp.Vector3(268.4438, -1357.79, 24.5378),
      327.3099,
      false,
      'WORLD_HUMAN_STAND_MOBILE'
    );
  
    //GOV
    npc.create(
      mp.game.joaat('s_m_m_highsec_01'),
      new mp.Vector3(-1385.913, -477.0084, 72.04214),
      191.1487,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      mp.game.joaat('s_m_m_highsec_02'),
      new mp.Vector3(-1385.346, -479.9799, 72.04214),
      3.717501,
      true,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      mp.game.joaat('a_f_y_business_04'),
      new mp.Vector3(-1379.815, -477.6191, 72.04214),
      90.06773,
      true,
      'WORLD_HUMAN_CLIPBOARD'
    );
  
    //Pacific Standart
    npc.create(mp.game.joaat('a_f_y_business_01'), new mp.Vector3(254.1582, 222.8858, 106.2869), 156);
    npc.create(mp.game.joaat('a_m_m_business_01'), new mp.Vector3(252.3869, 223.4011, 106.2869), 156);
    npc.create(mp.game.joaat('a_m_y_business_01'), new mp.Vector3(249.102, 224.6973, 106.287), 156);
    npc.create(mp.game.joaat('a_f_y_business_02'), new mp.Vector3(247.2151, 225.22, 106.2876), 156);
    npc.create(mp.game.joaat('a_f_m_business_02'), new mp.Vector3(243.8021, 226.2166, 106.2876), 156);
    npc.create(mp.game.joaat('a_m_y_business_02'), new mp.Vector3(241.9458, 227.1961, 106.287), 156);
  
    //Flecca
    npc.create(
      mp.game.joaat('ig_taostranslator'),
      new mp.Vector3(148.0046, -1041.758, 29.36793),
      -24
    );
    npc.create(mp.game.joaat('ig_patricia'), new mp.Vector3(175.031, 2708.488, 38.08792), 175);
    npc.create(mp.game.joaat('cs_movpremmale'), new mp.Vector3(-1211.733, -332.3059, 37.78094), 27);
  
    //Blaine
    npc.create(mp.game.joaat('cs_molly'), new mp.Vector3(-112.1827, 6471.3, 31.62671), 128);
    npc.create(mp.game.joaat('g_m_y_korean_01'), new mp.Vector3(-109.9172, 6469.146, 31.62671), 128);
  
    //SAPD
    npc.create(
      mp.game.joaat('s_f_y_cop_01'),
      new mp.Vector3(440.3013, -978.6867, 30.6896),
      179.0161,
      false,
      'WORLD_HUMAN_STAND_MOBILE'
    );
    npc.create(
      mp.game.joaat('s_m_y_cop_01'),
      new mp.Vector3(454.3719, -980.504, 30.68959),
      72.25758,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    npc.create(
      mp.game.joaat('s_m_y_cop_01'),
      new mp.Vector3(462.1494, -992.3374, 24.91487),
      5.561146,
      false,
      'WORLD_HUMAN_GUARD_STAND'
    );
    npc.create(
      mp.game.joaat('s_m_y_cop_01'),
      new mp.Vector3(412.6824, -1023.331, 29.47568),
      7.878762,
      false,
      'WORLD_HUMAN_CLIPBOARD'
    );
    npc.create(
      mp.game.joaat('s_f_y_cop_01'),
      new mp.Vector3(461.6078, -1021.399, 32.98539),
      169.3055,
      false,
      'WORLD_HUMAN_AA_COFFEE'
    );
    npc.create(
      mp.game.joaat('s_m_y_cop_01'),
      new mp.Vector3(448.1678, -988.1086, 30.68959),
      20.97919,
      false,
      'WORLD_HUMAN_STAND_MOBILE'
    );
    npc.create(
      mp.game.joaat('s_m_y_cop_01'),
      new mp.Vector3(426.3052, -992.8116, 35.68463),
      90.84706,
      false,
      'WORLD_HUMAN_SMOKING'
    );
  
    npc.timer();
    npc.timer500();
  },

  timer: () => {
    //return;
    let playerPos = mp.players.local.position;
  
    _npcList.forEach(async function(item) {
      let dist = methods.distanceToPos(playerPos, item.pos);
  
      if (dist < _loadDist && !item.isCreate) {
        try {
          if (mp.game.streaming.hasModelLoaded(item.model)) {
            item.ped = mp.peds.new(item.model, item.pos, item.heading);
            item.handle = item.ped.handle;
  
            if (item.scenario != '')
              mp.game.invoke(
                methods.TASK_START_SCENARIO_IN_PLACE,
                item.handle,
                item.scenario,
                0,
                true
              );
  
            if (item.animation1 != '') {
              mp.game.streaming.requestAnimDict(item.animation1);
              setTimeout(function() {
                if (mp.game.streaming.hasAnimDictLoaded(item.animation1))
                  mp.game.invoke(
                    methods.TASK_PLAY_ANIM,
                    item.handle,
                    item.animation1,
                    item.animation2,
                    9,
                    -8,
                    -1,
                    item.flag,
                    0,
                    false,
                    false,
                    false
                  );
              }, 5000);
            }
  
            item.isCreate = true;
          } else if (item.didRequest !== true) {
            item.didRequest = true;
            mp.game.streaming.requestModel(item.model);
          }
        } catch (e) {
          methods.debug('CreatePed', e);
        }
      } else if (dist > _loadDist + 50 && item.isCreate) {
        try {
          methods.debug('DELETE', item);

          try {
            item.ped.destroy();
            item.ped = null;
            item.handle = 0;
            item.isCreate = false;
          } catch (e) {
            methods.debug(e);
          }
  
          if (item.didRequest === true) {
            item.didRequest = false;
            mp.game.streaming.setModelAsNoLongerNeeded(item.model);
          }
        } catch (e) {
          methods.debug('DeletePed', e);
        }
      }
    });
  
    setTimeout(npc.timer, 10000);
  },
  
  timer500: () => {
    let playerPos = mp.players.local.position;
  
    _npcList.forEach(async function(item) {
      let dist = methods.distanceToPos(playerPos, item.pos);
  
      if (dist <= item.speechRadius && item.isCreate && !item.isSpeech) {
        if (item.speech1 != '')
          mp.game.audio.playAmbientSpeechWithVoice(
            item.handle,
            item.speech1,
            '',
            'SPEECH_PARAMS_FORCE_SHOUTED',
            false
          );
        //mp.game.invoke(methods.PLAY_AMBIENT_SPEECH1, item.handle, item.speech1, 'SPEECH_PARAMS_FORCE');
        item.isSpeech = true;
      } else if (dist > item.speechRadius && item.isCreate && item.isSpeech) {
        if (item.speech2 != '')
          mp.game.audio.playAmbientSpeechWithVoice(
            item.handle,
            item.speech2,
            '',
            'SPEECH_PARAMS_FORCE_SHOUTED',
            false
          );
        //mp.game.invoke(methods.PLAY_AMBIENT_SPEECH1, item.handle, item.speech2, 'SPEECH_PARAMS_FORCE');
        item.isSpeech = false;
      }
    });
  
    setTimeout(npc.timer500, 500);
  },

  create: (
    model:HashOrString,
    pos:Vector3Mp,
    heading:number,
    empty = false,
    scenario = '',
    animation1 = '',
    animation2 = '',
    flag = 9,
    speechRadius = 5,
    speech1 = 'GENERIC_HI',
    speech2 = 'GENERIC_BYE'
  ) => {
    if (typeof model == 'string') model = mp.game.joaat(model);
  
    _npcList.push({
      model: model,
      pos: pos,
      heading: heading,
      ped: null,
      scenario: scenario,
      animation1: animation1,
      animation2: animation2,
      flag: flag,
      speechRadius: speechRadius,
      speech1: speech1,
      speech2: speech2,
      isSpeech: false,
      isCreate: false,
      handle: 0,
    });
  },

  createPedLocally: (model:HashOrString, pos:Vector3Mp, heading:number) => {
    if (mp.game.streaming.isModelValid(model)) {
      mp.game.streaming.requestModel(model);
      if (mp.game.streaming.hasModelLoaded(model))
        return mp.game.ped.createPed(26, model, pos.x, pos.y, pos.z, heading, false, false), mp.game.streaming.setModelAsNoLongerNeeded(model);
    }
    return 0;
  },
};

export { npc };
