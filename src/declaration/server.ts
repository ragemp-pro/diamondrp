/// <reference path="rage-server.ts" />

declare interface Vector2 {
  x: number;
  y: number;
}

interface ObjectMp {
  mapeditor?:boolean;
  mapeditorid?:string;
}
interface TextLabelMp {
  mapeditor?:boolean;
  mapeditorid?:string;
}

interface VehicleMp {
  afkCount: number;
  /** Индикатор арендованого транспорта */
  isRent?:boolean;
  /** Индикатор рабочего транспорта */
  isJob?:boolean;
  admin:boolean;
  gr6money?: number;
  gr6users?: PlayerMp[];
  gr6Owner?: number;
  fractiongarage?: number;
  fraction_id?: number;
  modelname?: string;
  modelhash?: number;
  blockboost:boolean;
  is_gos:boolean;
  dbid:number;
  deliverTarget: import("../util/gang.deliver").GangDeliverPosition;
  deliverFraction: number;
  deliverPlayer: number;
  deliverCheckpoint: boolean;
  /** Какое сидение является водительским, после новой версии RAGE это новая цифра */
  driverSeat: number;
}

interface ColshapeMp {
  npcDialog: import("../server/modules/npc").npcDialog;
  dynamicData: {
    handle: (player: PlayerMp) => any;
    onLeave?: (player: PlayerMp) => any;
    message?: string;
    id: number;
    onenter?: boolean;
  }
  teleportPoint: import("../server/config/teleport").teleportElement;
}

interface TablePlayerBetInterface {
  balance: number;
  x: number;
  y: number;
  currentChipType: number;
}

interface TablePlayerInterface {
  playerInstance: PlayerMp;
  bets: Map<string, TablePlayerBetInterface>;
  skipBets: number;
  usedChips: Set<number>;
  sitPositionId: number;
}

interface TableInterface {
  position: Vector3Mp;
  heading: number;
  players: Map<PlayerMp, TablePlayerInterface>;
  maxPlayers: number;
  lastWinTime: number;
  currentWinNumber: number;
  currentState: number;
  lastIdleTime: number;
  sits: {position: Vector3Mp, player?: PlayerMp}[]
  chipTypePrices: number[];
}

interface ThreeCardPokerTablePlayer {
  firstBet: number;
  secondBet: number;
  typeBet: string;
  hand?: any;
  applyFirstBet?: boolean;
}

interface ThreeCardPokerTable {
  position: Vector3Mp;
  heading: number;
  usedCards: Set<string>;
  currentState: number;
  players: Map<PlayerMp, ThreeCardPokerTablePlayer>,
  gameTimer: number;
  activeGame: boolean;
  firstBetActive: boolean;
  dealerHand?: any;
  usedSits: Map<PlayerMp, number>;
}

interface PlayerServer extends EntityMp {
  dressData?:{
    [param:string]: [number, number];
  };
  dressSync?:boolean;
  /** Запрет на телепортацию к себе */
  teleportBlock:boolean;
  /** Временная защита от блокировки за лечение */
  healProtect: number;
  /** Временная защита от блокировки за телепортацию */
  teleportProtect: number;
  /** ID Сошиала игрока, который получен со стороны клиента */
  clientSocial?: number;
  /** Доступ к стрельбищу */
  shootingRangeAccess?: boolean;
  /** Админское оповещение в чат о срабатывании античита */
  registerAnticheat?: boolean;
  /** Админское оповещение в чат о новых регистрациях с отображением SocialClub игрока */
  registerAlert?: boolean;
  /** Список татуировок
   * - [
   *  + string => overlay
   *  + string => name
   * - ]
   */
  tattoosList: [string,string][];
  startShootingEvent: boolean;
  trackingList:string[];
  tracking:boolean;
  trackingBlock:boolean;
  keyEspam:boolean;
  waypoint:{x:number,y:number};
  colshapeHandle: (player: PlayerMp) => any;
  colshape:ColshapeMp;
  colshapeHandleId:number;
  passwords: Map<string, number>;
  /** Индикатор открытого инвентаря, вид - `inv_[TYPE]_[ID]` */
  openInventory:string;
  spamProtect: boolean;
  passwordEnterProtect: boolean;
  passwordEnterBad: number;
  datingList: Map<number,string>;
  /** Уровень игрока */
  level:number;
  /** Опыт игрока */
  exp_level:number;
  /** Время в сети, проигранное на сервере */
  online_time:number;
  blocksave: boolean;
  lastSave: number;
  countedTriggersSwap: number;
  countedTriggers: number;
  // db_user: import("../server/modules/entity/user").userEntity;
  _rgscId:bigint;
  _serial2:any;
  /** Деньги, которые игрок выносит с банка, и ему нужно их доставить на базу */
  bankgrabmoney:number;
  /** Индикатор того, что мы оплатили вход в казино */
  inCasino: boolean;
  /** Список тех предметов, которые игрок уже подобрал */
  holidayPickups: number[];
  shootingPickups: number[];
  chestId: number;
  /** ID Инта, если мы в нём находимся */
  interrior: number;
  weaponsAll: {item:number,hash:number;ammo:number;ammoType:number}[];
  inGreenZone: boolean;
  hasAttachment: (attachmentName: HashOrString) => boolean;
  addAttachment: (attachmentName: HashOrString, remove: boolean) => void;
  _attachments:number[]
  /** Ячейка соединения сокета */
  socket: import('socket.io').Socket
  /** Индикатор состояния подключения к сокету */
  socketConnected?:boolean;
  /** Пароль для верификации socket соединения */
  socketKey: string;
  socketAdvancedLog: boolean;
  jobmoneyfarm: number;
  quests: {name:string,complete:boolean}[];

  /** Количество отыгранного времени за сутки */
  played_time: number;
  chipsBalance: number;
  currentSlotMachine?: number;
  slotMachinesCurrentState?: number;
  currentRouletteTable?: TableInterface;

  currentPokerTable?: ThreeCardPokerTable;

  dealerJobActive?: boolean;
  dealerJobTable?: any;
  currentDiceTable?: any;

  exitCasinoWait?: number;

  currentDialog: import("../server/modules/npc").npcDialog;
  cameraManagerSettings: import("../server/managers/cameraRecord").cameraSettings
  serverMenu: import("../server/modules/menu").MenuClass;
  /** ID Автошколы, в которой проходит экзамен */
  autoschoolExam: number;
  autoschoolExamProtect: number;
  /** ID лобби игры по лепке снеговика */
  snowLobby: number;
  /** Количество  */
  snowSnows: number;
  /** ID гоночного лобби */
  raceLobby: number;
  /** ID дуэльного лобби */
  duelLobby: number;
  /** ТС для скейта (rcbandito) */
  skateveh: VehicleMp;
  /** Машина, которую арендовали */
  gr6Veh: VehicleMp;
  /** Машина, в которой работаем */
  gr6TaskVeh: VehicleMp;
  gr6duty: boolean;
  gr6haveTask: boolean;
  gr6Task: {x:number;y:number;z:number,dist:number};

  exitCoord: {x:number;y:number;z:number,h?:number};
  lobbyId: number;
  testPc: boolean;
  testPing: boolean;
  followTarget: boolean;
  flymode: boolean;
  doorsControl: string;
  spectateTarget: PlayerMp;
  spectatePosition: {x:number,y:number,z:number,h:number,d:number};
  spectateHeading: number;
  spectateDimension: number;
  spectateInterval: boolean;
  address: any;
  serial: any;
  notify: (
    message: string,
    flashing?: boolean,
    textColor?: number,
    bgColor?: number,
    flashColor?: number[]
  ) => void;
  notifyWithPicture(
    title: string,
    sender: string,
    message: string,
    notifPic: import('../server/modules/entity/userNotifyEntity').notifyPictures,
    icon: number,
    flashing?: boolean,
    textColor?: number,
    bgColor?: number,
    flashColor?: number[]
  ): any;
  voice: {
    [param: string]: any;
  };
  radioRoom: string;

  currentAutosalonId: number;
}

interface InventoryItem {
  id: number;
  label: string;
  item_id: number;
  count: number;
  prefix: number;
  number: number;
  key_id: number;
}

type weathers =
  | 'EXTRASUNNY'
  | 'CLEAR'
  | 'CLOUDS'
  | 'SMOG'
  | 'FOGGY'
  | 'OVERCAST'
  | 'RAIN'
  | 'THUNDER'
  | 'CLEARING'
  | 'SNOW'
  | 'XMAS';


//! MYSQL

interface CarInstance {
  id: number;
  id_user: number;
  user_name: string;
  name: string;
  hash: number;
  price: number;
  full_fuel: number;
}
interface CarRentInstance {
  id: number;
  id_user: number;
  business_name: string;
  name: string;
  price: number;
}
