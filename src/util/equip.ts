export interface EquipDataItem {
  icon: string;
  count?: number;
  canTake?: boolean;
  name?:string;
  model:string;
  ammo?:number;
  shiporder?:boolean;
}

export const EquipDataItems:EquipDataItem[] = [
  {
    icon: 'Item_40',
    model: "40",
    name: "Наручники",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_278',
    model: "278",
    name: "Спец. Аптечка",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_59',
    model: "59",
    name: "Фонарик",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_66',
    model: "66",
    name: "Дубинка",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_82',
    model: "82",
    name: "Электрошокер",
    ammo: 1,
    shiporder: true
  },
  ///////////////
  {
    icon: 'Item_78',
    model: "78",
    name: "Beretta 90Two",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_90',
    model: "90",
    name: "Benelli M3",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_103',
    model: "103",
    name: "MP5A3",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_110',
    model: "110",
    name: "HK-416",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_119',
    model: "119",
    name: "L115A3",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_146',
    model: "146",
    name: "Коробка патронов 12.7mm",
    ammo: 60,
    shiporder: true
  },
  {
    icon: 'Item_153',
    model: "153",
    name: "Коробка патронов 9mm (SMG)",
    ammo: 140,
    shiporder: true
  },
  {
    icon: 'Item_27',
    model: "27",
    name: "Коробка патронов 9mm (Пистолет)",
    ammo: 140,
    shiporder: true
  },
  {
    icon: 'Item_28',
    model: "28",
    name: "Коробка патронов 18.5mm",
    ammo: 120,
    shiporder: true
  },
  {
    icon: 'Item_30',
    model: "30",
    name: "Коробка патронов 5.56mm",
    ammo: 260,
    shiporder: true
  },
  {
    icon: 'Item_29',
    model: "29",
    name: "Коробка патронов 7.62mm",
    ammo: 130,
    shiporder: true
  },
  {
    icon: 'Item_252',
    model: "252",
    name: "Бронежилет",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_199',
    model: "199",
    name: "Полицейское ограждение",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_201',
    model: "201",
    name: "Полосатый конус",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_202',
    model: "202",
    name: "Красный конус",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_77',
    model: "77",
    name: "Taurus PT92",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_71',
    model: "71",
    name: "P99",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_58',
    model: "58",
    name: "Лом",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_69',
    model: "69",
    name: "Выкидной нож",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_64',
    model: "64",
    name: "Кастет",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_101',
    model: "101",
    name: "Mini Uzi",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_94',
    model: "94",
    name: "P-90",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_67',
    model: "67",
    name: "Разводной ключ",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_61',
    model: "61",
    name: "Молоток",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_106',
    model: "106",
    name: "AK-102",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_117',
    model: "117",
    name: "M14 EBR",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_108',
    model: "108",
    name: "QBZ-97",
    ammo: 1,
    shiporder: true
  },
  {
    icon: 'Item_112',
    model: "112",
    name: "AKS-47u",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_99',
    model: "99",
    name: "Intratec TEC-9",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_60',
    model: "60",
    name: "Клюшка для гольфа",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_54',
    model: "54",
    name: "Кавалерийский кинжал",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_63',
    model: "63",
    name: "Нож",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_87',
    model: "87",
    name: "Обрез",
    ammo: 1,
    shiporder: false
  },
  {
    icon: 'Item_145',
    model: "145",
    name: "Упаковка марихуаны 800г",
    ammo: 800,
    shiporder: false
  },
  {
    icon: 'Item_143',
    model: "143",
    name: "Упаковка марихуаны 200г",
    ammo: 200,
    shiporder: false
  },
  {
    icon: 'Item_156',
    model: "156",
    name: "Кокаин 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_176',
    model: "176",
    name: "Амфетамин 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_177',
    model: "177",
    name: "DMT 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_178',
    model: "178",
    name: "Мефедрон 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_179',
    model: "179",
    name: "Кетамин 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_180',
    model: "180",
    name: "LSD 50гр",
    ammo: 50,
    shiporder: false
  },
  {
    icon: 'Item_276',
    model: "276",
    name: "Коробка спец. отмычек",
    ammo: 30,
    shiporder: false
  },
  {
    icon: 'Item_262',
    model: "262",
    name: "C4 Мощная",
    ammo: 1,
    shiporder: false
  },
]

export const getItemChestData = (model:string) => EquipDataItems.find(item => item.model == model);