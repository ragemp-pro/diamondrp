interface fractionInterface {
  /** ID Фракции */
  id: number;
  /** Название */
  name: string;
  /** Описание */
  desc: string;
  /** Иконка */
  icon: string;
  /** Гос фракция */
  gos?: boolean;
  /** Мафия */
  mafia?: boolean;
  /** Банда */
  gang?: boolean;
  /** Список рангов */
  ranks: string[];
  /** Базовая цифра зарплаты, которая прибавится к итоговой */
  moneybase: number;
  /** Множитель ранга для определения зарплаты */
  moneymultipler: number;
  /** HEX Цвет фракции для некоторых систем */
  color?: string;
}

interface recListItem {
  name: string;
  param: string;
  fractions: number[];
  rank: number;
  remove?: boolean;
  give?: boolean;
  cost?: number;
}

export const recLists: recListItem[] = [
  // Выдача
  { name: "Рецепт на марихуану", param: "allow_marg", fractions: [16], rank: 5, give: true, cost: 1000 },
  { name: "Рецепт на антипохмелин", param: "allow_antipohmel", fractions: [16], rank: 5, give: true, cost: 1000 },
  { name: "Медицинская страховка", param: "med_lic", fractions: [16], rank: 5, give: true, cost: 15000 },
  { name: "Лицензия на адвоката", param: "law_lic", fractions: [1], rank: 7, give: true, cost: 15000 },
  { name: "Лицензия на бизнес", param: "biz_lic", fractions: [1], rank: 7, give: true, cost: 10000 },
  { name: "Лицензия на рыбалку", param: "fish_lic", fractions: [1], rank: 7, give: true, cost: 7000 },
  { name: "Лицензия на оружие", param: "gun_lic", fractions: [2, 7, 3], rank: 6, give: true, cost: 15000 },
  // Изъятие
  { name: "Медицинская страховка", param: "med_lic", fractions: [16], rank: 6, remove: true },
  { name: "Лицензия категории A", param: "a_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия категории B", param: "b_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия категории C", param: "c_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия воздушного ТС", param: "air_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия водного ТС", param: "ship_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия на оружие", param: "gun_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия на рыбалку", param: "fish_lic", fractions: [2, 3, 7], rank: 6, remove: true },
  { name: "Лицензия на адвоката", param: "biz_lic", fractions: [1], rank: 7, remove: true },
  { name: "Лицензия на бизнес", param: "biz_lic", fractions: [1], rank: 7, remove: true },
]

export const fractionList: fractionInterface[] = [
  { id: 1, name: "Government", desc: "Правительство", icon: "GOV", gos: true, mafia: false, gang: false, ranks: ["Практикант", "Ассистент", "Младший специалист", "Специалист", "Старший специалист", "Зам. начальника отдела", "Начальник отдела", "Департамент Мэра", "Прокурор", "Судья", "Ген.Прокурор", "Верховный судья", "Вице-Губернатор", "Губернатор"], moneybase: 0, moneymultipler: 1000 },
  { id: 2, name: "LSPD", desc: "Отделение полиции", icon: "LSPD", gos: true, mafia: false, gang: false, ranks: ["Cadet PA", "Police Officier I", "Police Officier II", "Police Officier III", "Police Officier III+1", "Sergeant I", "Sergeant II", "Lieutenant I", "Lieutenant II", "Captain I", "Captain II", "Commander", "Assistant Chief of Police", "Chief of Police"], moneybase: 0, moneymultipler: 1100 },
  { id: 3, name: "FIB", desc: "Отделение FIB", icon: "fib", gos: true, mafia: false, gang: false, ranks: ["Trainee", "Improver", "Junior Specialist", "Specialist", "Senior Specialist", "Junior Agent", "Agent", "Senior Agent", "Special Agent", "Senior Special Agent", "Lead Agent", "Inspector FIB", "Deputy Director of FIB", "Director of FIB"], moneybase: 0, moneymultipler: 1200 },
  { id: 4, name: "Army", desc: "Армия", icon: "Army", gos: true, mafia: false, gang: false, ranks: ["Рядовой-рекрут", "Рядовой 1 класса", "Младший капрал", "Капрал", "Сержант", "Первый Сержант", "Уорент-Офицер", "Второй Лейтенант", "Первый Лейтенант", "Капитан", "Майор", "Подполковник", "Полковник", "Генерал"], moneybase: 0, moneymultipler: 1050 },
  { id: 7, name: "Sheriffs Department", desc: "Шериф Департамент", icon: "Sheriff", gos: true, mafia: false, gang: false, ranks: ["Deputy Sheriff Trainee", "Deputy Sheriff I", "Corporal I", "Corporal II", "Sergeant I", "Sergeant II", "Lieutenant I", "Lieutenant II", "Captain I", "Captain II", "Major", "Assistant Sheriff", "Undersheriff", "Sheriff"], moneybase: 0, moneymultipler: 1100 },
  { id: 8, name: "Russian Mafia", desc: "Русская Мафия", icon: "russia", gos: false, mafia: true, gang: false, ranks: ["Шпана", "Боец", "Браток", "Блатной", "Доверенный", "Бродяга", "Дипломат", "Смотрящий", "Положенец", "Авторитет"], moneybase: 0, moneymultipler: 0 },
  { id: 9, name: "LCN", desc: "Итальянская Мафия", icon: "lcn", gos: false, mafia: true, gang: false, ranks: ["Novizio", "Associate", "Combattente", "Soldato", "Regime", "Sotto Cappo", "Caporegime", "Giovane boss", "Consigliere", "Don"], moneybase: 0, moneymultipler: 0 },
  { id: 10, name: "Yakuza", desc: "Японская Мафия", icon: "japan", gos: false, mafia: true, gang: false, ranks: ["Taiko", "Satei", "Kumi-in", "Fuku-Hombute", "Bengoshi", "Kanbu", "Kyodai", "Kaikei", "Shingiin", "Saiko-Komon", "Kumicho"], moneybase: 0, moneymultipler: 0 },
  { id: 11, name: "Ukrainian Mafia", desc: "Украинская мафия", icon: "ukraine", gos: false, mafia: true, gang: false, ranks: ["Казак", "Приказный", "Урядник", "Вахмистр", "Подхорунжий", "Доверенный хлопец", "Хорунжий", "Есаул", "Атаман", "Гетман"], moneybase: 0, moneymultipler: 0 },
  { id: 16, name: "EMS", desc: "Отделение Больницы", icon: "EMS", gos: true, mafia: false, gang: false, ranks: ["Практикант ", "Интерн", "Ординатор ", "Младший специалист", "Старший специалист ", "Главный специалист", "Фельдшер", "Ассистент врача", "Врач", "Зам.Глава отдела", "Глава отдела", "Глава Департамента", "Зам. Директора", "Директор"], moneybase: 0, moneymultipler: 1000 },
  { id: 18, name: "Ballas", desc: "Ballas", icon: "Ballas", gos: false, mafia: false, gang: true, ranks: ["Blade", "Buster", "Сracker", "gunBrogh", "upBrogh", "Gangster", "Federal block", "Foulkes", "Rich Nig", "Big Gangster"], moneybase: 0, moneymultipler: 0, color: "#CD42FF" },
  { id: 19, name: "Families", desc: "Families", icon: "Families", gos: false, mafia: false, gang: true, ranks: ["Beginner", "Youngsta", "Killa", "Wang G", "Shooter", "Big Brother", "High", "The King", "Deputy Boss", "Mad Dog"], moneybase: 0, moneymultipler: 0, color: "#41AB5D" },
  { id: 20, name: "Marabunta Grande", desc: "Marabunta Grande", icon: "mara", gos: false, mafia: false, gang: true, ranks: ["Novato", "Experimentado", "Maton", "El asesino", "Viendo", "Trusted", "Cerrar", "Mano izquierda", "Mano derecha", "Capitulo"], moneybase: 0, moneymultipler: 0, color: "#49A2E6" },
  { id: 21, name: "Vagos", desc: "Vagos", icon: "Vagos", gos: false, mafia: false, gang: true, ranks: ["Novato", "Guardian", "Verificado", "Local", "Bandito", "Medio", "Assessino", "Sabio", "Mano Derechа", "El Padre"], moneybase: 0, moneymultipler: 0, color: "#FCCD4C" },
]

export const fraction = {
  list: fractionList,
  /** Поиск конфигурации фракции по её ID */
  getFraction: (fractionid: number) => {
    return fractionList.find(item => item.id == fractionid)
  },
  /** Название фракции */
  getFractionName: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    return data.name
  },
  /** Цвет фракции */
  getFractionColor: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return "#fc0317";
    return data.color || "#fc0317"
  },
  /** Иконка фракции */
  getFractionIcon: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    return data.icon
  },
  /** Описание фракции */
  getFractionDesc: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    return data.desc
  },
  /** Список рангов */
  getFractionRanks: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return [];
    return data.ranks
  },
  /** Получить ранг лидера */
  getLeaderRank: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    return data.ranks.length
  },
  /** Получить ранг зама лидера */
  getSubLeaderRank: (fractionid: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    return data.ranks.length - 1
  },
  /** Является ли член фракции лидером */
  isLeader: (fractionid: number, rank: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return false;
    return data.ranks.length <= rank
  },
  /** Является ли член фракции замом лидера */
  isSubLeader: (fractionid: number, rank: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return false;
    return (data.ranks.length - 1) <= rank
  },
  /** Позволяет узнать, существует ли указанный ранг во фракции */
  isRankCorrect: (fractionid: number, rank: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return false;
    if (!data.ranks[rank - 1]) return false;
    return true;
  },
  /** Позволяет узнать, существует ли указанный ранг во фракции */
  getRankName: (fractionid: number, rank: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return null;
    if (!data.ranks[rank - 1]) return null;
    return data.ranks[rank - 1];
  },
  /** Подсчёт денег, которые заработает член фракции */
  getPayDayMoney: (fractionid: number, rank: number) => {
    let data = fraction.getFraction(fractionid)
    if (!data) return 0;
    return data.moneybase + data.moneymultipler * rank
  }
}

export const fractionUtil = fraction;