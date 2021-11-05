/// <reference path="../../declaration/server.ts" />

import { methods } from "../modules/methods"
import { menu } from "../modules/menu";
import { user } from "../user";
import { randomArrayEl } from "../../util/methods";
import { vehicles } from "../vehicles";
import { chat, enabledSystem } from "../modules/chat";
import { getParkPosition } from "./parking";
import { npc, npc_dialog } from "../modules/npc";
import { gtaStrToHtml } from "../../util/string";
import { RAGE_BETA } from "../../util/newrage";

export {}
/** Уникальный ID для генератора */
let ids = 1;


let autoschoolPos = new mp.Vector3(-702.40, -1308.85, 4.11)


let licCost:{
  [name:string]:number;
} = {
  "a":300,
  "b":600,
  "c":1000,
  "air":5000,
  "ship":2000,
}
let licVehs:{
  [name:string]:string;
} = {
  "a":"lectro",
  "b":"asea",
  "c":"mule",
  "air":"buzzard2",
  "ship":"dinghy",
}
let licVehsPos:{
  [name:string]:{x:number;y:number;z:number;h:number}[];
} = {
  "a":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "b":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "c":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "air":[{x: -749.308349609375, y: -1432.199462890625, z: 4.902952671051025, h: 169.6073760986328},],
  "ship":[{x: -832.7066650390625, y: -1439.804931640625, z: -1.1218644380569458, h: 86.00557708740234},],
}

/** Очередь на экзамен */
let examWaitList:Map<number, {
  /** Лицензия */
  lic:string;
  /** Получили экзаменатора или нет? */
  status:boolean;
  /** Начали ли мы прохождения экзамена или нет */
  start:boolean;
}> = new Map();
class autoschoolClass {
  /** Позиция */
  theoryMap: Map<number,(status:boolean)=>any>;
  readonly position: Vector3Mp;
  readonly id: number;
  constructor(position:Vector3Mp){
    ids++;
    this.theoryMap = new Map();
    this.id = ids;
    this.position = position;
    methods.createDynamicCheckpoint(this.position, "Нажмите ~g~E~w~ чтобы открыть меню лицензионного центра", (player) => {
      // console.log("[AUTOSCHOOL] ENTER DYNAMIC CHECK")
      if(!enabledSystem.autoschool) return player.notify("Лицензионный центр на временных тех работах. Загляните чуть позже")
      this.menu(player)
    }, 2, 0)
    mp.blips.new(77, this.position, {
      dimension: 0,
      name: "Лицензионный центр",
      scale: 0.5,
      color: 25,
      shortRange: true
    })
  }
  menu(player:PlayerMp){
    user.questWorks(player)
    // console.log("[AUTOSCHOOL] OPEN MENU")
    let m = menu.new(player, "Лицензии", "Доступные лицензии");
    let cats = ["a", "b", "c"];
    if(user.get(player, 'fraction_id') == 17){
      m.newItem({
        name: "Ожидающие экзамен",
        more: [...examWaitList].filter(i => !i[1].start).length,
        onpress: () => {
          this.examsList(player)
        }
      })
    }
    cats.forEach(cat => {
      m.newItem({
        name: "Категория "+cat.toUpperCase(),
        more: user.get(player, cat+"_lic") ? "~g~Получено" : "~b~Получить (~g~$"+licCost[cat]+"~b~)",
        onpress: () => {
          if(user.get(player, cat+"_lic")) return player.notify("У вас уже есть данное удостоверение");
          this.startExam(player, cat);
        }
      })
    })
    m.newItem({
      name: "Категория "+("Водный ТС"),
      more: user.get(player, "ship_lic") ? "~g~Получено" : "~b~Получить (~g~$"+licCost["ship"]+"~b~)",
      onpress: () => {
        if(user.get(player, "ship_lic")) return player.notify("У вас уже есть данная лицензия");
        this.startExam(player, "ship");
      }
    })
    m.newItem({
      name: "Категория "+("Воздушный ТС"),
      more: user.get(player, "air_lic") ? "~g~Получено" : "~b~Получить (~g~$"+licCost["air"]+"~b~)",
      onpress: () => {
        if(user.get(player, "air_lic")) return player.notify("У вас уже есть данная лицензия");
        this.startExam(player, "air");
      }
    })
    m.open()
  }

  startExam(player:PlayerMp,lic:string){
    // console.log("[AUTOSCHOOL] START EXAM")
    if(player.autoschoolExam) return player.notify("Вы уже сдаёте экзамен"); 
    
    // if(player.autoschoolExamProtect) return player.notify(`~r~Вы можете повторно сдавать экзамен через ${player.autoschoolExamProtect} мин.`);
    if(user.get(player, lic+"_lic")) return player.notify("У вас уже есть данное удостоверение");
    let cost = licCost[lic];
    if(user.getMoney(player) < cost) return player.notify("У вас недостаточно средств для оплаты");
    // player.autoschoolExamProtect = 10;
    // const check = () => {
    //   if(!mp.players.exists(player)) return;
    //   player.autoschoolExam = null;
    //   player.autoschoolExamProtect--;
    //   if(player.autoschoolExamProtect){
    //     setTimeout(() => {
    //       check();
    //     }, 60000)
    //   } else {
    //     player.autoschoolExamProtect = 0;
    //   }
    // }
    // check();
    player.autoschoolExam = this.id
    user.removeCashMoney(player, cost);
    player.notify("Пошлина за экзамен оплачена")
    let cats = ["a", "b", "c"];
    let needPractice = true;
    cats.map((item) => {
      if(user.get(player, item+"_lic")) needPractice = false;
    })
    if(lic.length == 1 && needPractice) this.starTheory(player, lic);
    else this.starPractice(player, lic);
  }

  starPractice(player:PlayerMp, lic:string){
    // console.log("[AUTOSCHOOL] START PRACTICE")
    examWaitList.set(player.id, {lic,status:false,start:false});
    player.notify("~g~Ищем свободного инструктора, максимальное время ожидания - 30 секунд");
    this.requestExam(player, lic);
    setTimeout(() => {
      if(!mp.players.exists(player)) return;
      if(examWaitList.get(player.id).start) return;
      player.notify("Свободных инструкторов на данный момент нет. Экзамем пройдёт в автоматическом режиме")
      this.tehnicalStart(player, lic);
    }, 30000)
    
  }
  requestExam(player:PlayerMp, lic:string){
    if(!mp.players.exists(player)) return;
    // console.log("[AUTOSCHOOL] REQUEST EXAM")
    let getExam = false
    let name = user.getRpName(player);
    mp.players.forEach((target) => {
      if(user.isLogin(target)){
        if(user.get(target, 'fraction_id') == 17){
          if(target.dist(autoschoolPos) < 3000){
            user.accept(target, name+" требуется экзаменатор, категория "+this.getLicName(lic)).then(status => {
              if(!status) return;
              if(getExam) return target.notify("Экзамен уже принят кем то другим")
              if(!mp.players.exists(player)) return target.notify("Игрок покинул сервер")
              getExam = true;
              examWaitList.get(player.id).status = true;
              player.notify(user.getRpName(target)+" направляется к вам, ожидайте");
            })
          }
        }
      }
    })
  }
  getLicName(type:string){
    if(type == "a") return "A";
    else if(type == "b") return "B";
    else if(type == "c") return "C";
    else if(type == "air") return "Авиа";
    else if(type == "ship") return "Водный";
  }
  examsList(player:PlayerMp){
    // console.log("[AUTOSCHOOL] EXAMS LIST")
    let m = menu.new(player, "Экзамен", "Список");
    examWaitList.forEach((data, targetid) => {
      let target = mp.players.at(targetid);
      if(!mp.players.exists(target)){
        examWaitList.delete(targetid)
      } else {
        if(!data.start){
          m.newItem({
            name: user.getRpName(target),
            more: this.getLicName(data.lic),
            onpress: () => {
              if(target.dist(autoschoolPos) > 50){
                target.notify("Вернитесь к автошколе, инструктор вас ожидает");
                player.notify(user.getRpName(target)+" отошёл от автошколы, дождитесь его");
                return;
              }
              if(target.id == player.id) return player.notify("~r~Вы не можете принимать экзамен у самого себя");
              this.tehnicalStart(target, data.lic, player);
            }
          })
        }
      }
    })
    m.open()
  }
  tehnicalStart(player:PlayerMp, lic:string, instructor?:PlayerMp){
    // console.log("[AUTOSCHOOL] TEHNICAL START")
    if(!examWaitList.has(player.id)) return;
    if(examWaitList.get(player.id).start) return;
    examWaitList.get(player.id).start = true;
    let tp:any;
    switch (lic) {
      case "a":
        tp = "bike";
        break;
      case "b":
        tp = "vehicle";
        break;
      case "c":
        tp = "truck";
        break;
      case "air":
        tp = "heli";
        break;    
    }
    let part = getParkPosition(new mp.Vector3(-797, -1304, 4), 100, tp);
    let parkPos = tp ? part : null
    let vehicle = newVeh(player, licVehs[lic], parkPos ? parkPos : randomArrayEl(licVehsPos[lic]))
    user.showLoadDisplay(player);
    if(instructor) user.showLoadDisplay(instructor);
    setTimeout(() => {
      if(!mp.players.exists(player)) return;
      if(instructor && !mp.players.exists(instructor)) return;
      if(!mp.vehicles.exists(vehicle)) return;
      player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      if (instructor) instructor.putIntoVehicle(vehicle, RAGE_BETA ? 1 : 0);
      user.hideLoadDisplay(player);
      if(instructor) user.hideLoadDisplay(instructor);
      mp.events.callClient(player, "server:autoschool:practice", lic, vehicle.id, instructor ? true : false).then(async (status:boolean) => {
        // console.log("[AUTOSCHOOL] PRACTICE END")
        if(mp.players.exists(instructor) && instructor) status = await user.accept(instructor, "Успешная сдача?");
        player.autoschoolExam = null
        if(instructor) user.teleport(instructor, this.position.x, this.position.y, this.position.z);
        if(instructor && status) user.addCashMoney(instructor, lic.length == 1 ? licCost[lic]*0.5 : licCost[lic]*0.1);
        user.teleport(player, this.position.x, this.position.y, this.position.z);
        if(mp.vehicles.exists(vehicle)) 
        vehicle.destroy();
        if(!status) return player.notify("Вы не сдали практику");
        user.set(player, lic+"_lic", 1);
        player.notify("Вы получили удостоверение категории "+lic);
        user.updateClientCache(player)
        user.questWorks(player)
        examWaitList.delete(player.id)
      });
    }, 1000)
  }
  starTheory(player: PlayerMp, lic: string){
    // console.log("[AUTOSCHOOL] START THEORY")
    if(schools.theoryMap.has(user.getId(player))) schools.theoryMap.delete(user.getId(player))
    menu.close(player);
    user.setGui(player, 'driving_school');
    this.theoryMap.set(user.getId(player), (status:boolean|number) => {
      if(typeof status == "number" && status == 2){
        user.addCashMoney(player, licCost[lic])
        player.notify("~g~Мы вернули вам средства за оплату экзамена")
        player.autoschoolExam = null
        return
      }
      if(!status){
        player.notify('Вы не сдали теорию')
        player.autoschoolExam = null
      } else {
        this.starPractice(player, lic);
      }
    });
  }
}

setTimeout(() => {
  mp.events.register('client:autoschool:theory', (player:PlayerMp, status:boolean) => {
    if(!mp.players.exists(player)) return;
    if(!schools.theoryMap.has(user.getId(player))) return;
    schools.theoryMap.get(user.getId(player))(status);
    schools.theoryMap.delete(user.getId(player))
  })
  mp.events.register('client:autoschool:theory:close', (player:PlayerMp) => {
    if(!mp.players.exists(player)) return;
    if(!schools.theoryMap.has(user.getId(player))) return;
    // @ts-ignore
    schools.theoryMap.get(user.getId(player))(2);
    schools.theoryMap.delete(user.getId(player))
  })
}, 1000)





function newVeh(player:PlayerMp, car:string, spawn:{x:number;y:number;z:number;h:number;}){
  // console.log("[AUTOSCHOOL] NEW VEHICLE")
  let carConf = methods.getVehicleInfo(car);
  let vehicle = mp.vehicles.new(car, new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5), {
    locked: false,
    engine: true,
    heading: spawn.h
  })
  vehicle.setVariable('fuel', carConf.fuel_full);
  vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
  vehicle.numberPlate = user.getId(player).toString()+" EX";
  vehicle.setColorRGB(255, 255, 255, 255, 255, 255);
  vehicles.setFuelFull(vehicle)
  vehicles.lockStatus(player, vehicle, false);
  vehicles.engineStatus(player, vehicle, true);
  setTimeout(() => {
    if(!mp.vehicles.exists(vehicle)) return;
    vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
    setTimeout(() => {
      if (!mp.vehicles.exists(vehicle)) return;
      vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
      vehicle.repair();
    }, 200)
  }, 200)
  return vehicle
}

chat.registerCommand("pointcatch", (player) => {
  if(!user.isAdminNow(player)) return;
  let points:{
    x:number;
    y:number;
    z:number;
    h:number;
  }[] = [];
  let m = menu.new(player, "Сборка");
  m.newItem({
    name: "Новая",
    onpress: () => {
      player.notify("Количество точек: "+points.push(player.vehicle ? {
        ...player.vehicle.position,
        h:player.vehicle.heading
      } : {
        ...player.position,
        h:player.heading
      }))
    }
  })
  m.newItem({
    name: "Сохранить",
    onpress: () => {
      methods.saveLog("pointCatch", JSON.stringify(points));
    }
  })
  m.open();
})
let schools = new autoschoolClass(autoschoolPos);


npc_dialog.new("Антонио", "Инструктор", new mp.Vector3(-705.78, -1303.13, 5.11), 60.42, "ig_tomepsilon", (player) => {
  npc_dialog.open(player, `Здравствуйте. Выберите что вас интересует`, ["Правила дорожного движения штата san andreas", "Порядок дорожного движения", "Общие правила", "Начало движения, маневрирование", "Сигналы светофора и регулировщика", "Правила обгона", "Дорожная разметка", "Пользование внешними световыми приборами и звуковыми сигналами", "Ничего, спасибо"]).then(res => {
    let text = "";
    if(res == 0) text = `Правила Дорожного Движения - свод правил, регулирующих обязанности участников дорожного движения (водителей транспортных средств, их пассажиров, пешеходов и т.д.), а также технические требования, предъявляемые к транспортным средствам для обеспечения безопасности дорожного движения.`;
    if(res == 1) text = `-  Движение транспортных средств является правосторонним.
    -  Все участники дорожного движения, организаторы дорожного движения и другие лица должны соблюдать требования правовых актов по дорожному движению, быть внимательными и осмотрительными в дорожном движении и обеспечивать ритмичность движения с целью предотвращения возникновения опасности и причинения вреда.
    `
    if(res == 2) text = `- пройти обучение навыкам вождения на автомобиле или мотоцикле можно только начиная с 16 лет.
    - Перед началом движения, перестроением, поворотом (разворотом) и остановкой водитель обязан подавать сигналы световыми указателями поворота соответствующего направления
    -  При приближении транспортного средства с включенными проблесковым маячком синего цвета и специальным звуковым сигналом водители обязаны уступить дорогу для обеспечения беспрепятственного проезда указанного транспортного средства. 
    - При съезде автомобиля правыми колесами на неукрепленную и влажную обочину возникает опасность заноса из-за разницы сцепления правых и левых колес с дорогой. При этом целесообразно, не меняя скорости, т.е. не прибегая к торможению, плавным поворотом рулевого колеса вернуть автомобиль на проезжую часть. Торможение в данной ситуации может вызвать занос автомобиля.`;
    if(res == 3) text = `- Перед началом движения, перестроением, поворотом (разворотом) и остановкой водитель обязан подавать сигналы световыми указателями поворота соответствующего направления
    - При перестроении водитель должен уступить дорогу транспортным средствам, движущимся попутно без изменения направления движения. При одновременном перестроении транспортных средств, движущихся попутно, водитель должен уступить дорогу транспортному средству, находящемуся справа
    - При выезде на дорогу с прилегающей территории водитель должен уступить дорогу транспортным средствам и пешеходам, движущимся по ней, а при съезде с дороги - пешеходам и велосипедистам, путь движения которых он пересекает`
    if(res == 4) text = `Круглые сигналы светофора имеют следующие значения:
    - ЗЕЛЕНЫЙ СИГНАЛ разрешает движение;
    - ЗЕЛЕНЫЙ МИГАЮЩИЙ СИГНАЛ  разрешает движение и информирует вас о том, что в скоре будет включен запрещающий сигнал
    - ЖЕЛТЫЙ МИГАЮЩИЙ СИГНАЛ разрешает движение и информирует о наличии нерегулируемого перекрестка или пешеходного перехода, предупреждает об опасности;
    - КРАСНЫЙ СИГНАЛ, в том числе мигающий, запрещает движение.`
    if(res == 5) text = `Перед началом обгона водитель должен убедиться в том, что:
    - водитель транспортного средства, которое двигается впереди по той самой полосе, не подал сигнал о намерении поворота (перестроение) налево;
    - полоса , предназначенная для встречного движения, свободна на достаточно для обгона расстоянии;
    -  ваше транспортное средство никто не обгоняет.
    - водителю обгоняемого транспортного средства запрещается препятствовать обгону путем повышения скорости движения или иными действиями.`
    if(res == 6) text = `Белые и желтые линии - Могут быть сплошными и прерывистыми, одиночными и двойными. Они используются для отделения полос и разделения движения потоков транспортных средств.
    Желтые линии - отделяют полосы движения транспортных средств движущихся в противоположном направлении. Так-же одиночная желтая линия может отделять правую кромку обочины на шоссе.
    Белые линии - отделяют полосы движения транспортных средств движущихся в одном направлении. Так-же одиночная желтая линия может отделять правую кромку обочины на шоссе.
    - Прерывистая одиночная желтая линия - Следует держаться правее от линии, за исключением случая когда вы обгоняете впереди идущее Т/С. Вы можете пересекать прерывистую желтую линию только для безопасного обгона впереди идущих транспортных средств, и в случаях пересечения перекрестка если это обусловлено дорожной разметкой .
    - Прерывисто-сплошная двойная желтая линия - Сплошная желтая линия справа от прерывистой желтой линии означает что по встречной полосе на этом участке обгон запрещен (за исключением безопасного поворота налево на перекрестках, проезда прямо на перекрестках если это обусловлено дорожной разметкой в виде стрелки направления движения вашей полосы “движение только прямо”). Если прерывистая желтая линия находится справа от сплошной желтой линии вы можете совершить обгон впереди идущего Т/С и занять свою полосу (даже пересекая сплошную желтую линию).
    - Двойная желтая линия - Обгон на этом участке дороге запрещен. Пересекать двойную желтую линию запрещено за исключением безопасного пересечения перекрестков если это обусловлено соответствующей дорожной разметкой .
    - Прерывистая белая линия - Используется для разделения полос движения в одном направлении.
    - Пересекать прерывистую белую линию разрешено если этот маневр будет безопасным.`
    if(res == 7) text = `-  В темное время суток и в условиях недостаточной видимости независимо от освещения дороги, а также в тоннелях на движущемся транспортном средстве должны быть включены следующие световые приборы:
    на всех механических транспортных средствах - фары дальнего или ближнего света, на велосипедах - фары или фонари, на гужевых повозках - фонари (при их наличии);
    - Дальний свет должен быть переключен на ближний:
    в населенных пунктах, если дорога освещена;
    при встречном разъезде на расстоянии не менее чем за 150 м до транспортного средства, а также и при большем, если водитель встречного транспортного средства периодическим переключением света фар покажет необходимость этого;
    в любых других случаях для исключения возможности ослепления водителей как встречных, так и попутных транспортных средств.`
    if(!text) return npc_dialog.close(player);
    npc_dialog.open(player, gtaStrToHtml(text), ["Благодарю за информацию"])
  });
})

mp.events.add("playerJoin", (player:PlayerMp) => {
  player.autoschoolExam = null;
})