import { methods, DynamicCheckpoint } from "./methods";
import { inventory } from "../inventory";
import { menu } from "./menu";
import { user } from "../user";
import { items } from "../items";
import { fractionUtil } from "../../util/fractions";
import { customChest } from "./entity/customChest";
import { mysql } from "./mysql";
import { gangRespPosition } from "./gangwar";
import { order, orderItem, maxShipWeight, newOrder, illegalList } from "./chest";
import { EquipDataItems } from "../../util/equip";
import { getDefaultCount } from "../../util/inventory";
import { logFractionGunEntity } from "./entity/logFractionGunEntity";
import { customParams } from "./admin";

/** Таймер */
const accessTimer = 10;

let accessBagPosition:{x:number,y:number,z:number,d?:number}[] = [
    // LSPD
    { x: 442.99, y: -1017.98, z: 28.67, d: 0},
    { x: 471.11, y: -1021.55, z: 28.18, d: 0},
    { x: 408.23, y: -983.07, z: 29.27, d: 0},
    // FIB
    { x: 127.09, y: -733.10, z: 33.13, d: 0},
    // SANDY
    { x: 1858.05, y: 3678.08, z: 33.71, d: 0},
    // PALETO
    { x: -453.91, y: 5999.53, z: 31.34, d: 0},
    // USMC
    { x: -2410.47, y: 3324.71, z: 32.83, d: 0},
    // Мафии
    { x: -1516.71, y: 851.46, z: 181.59, d: 0 },
    { x: -1366.50, y: 56.68, z: 54.10, d: 0 },
    { x: -3024.25, y: 80.26, z: 11.61, d: 0 },
    { x: -1886.83, y: 2049.96, z: 140.98, d: 0 },
];





gangRespPosition.map(item => {
    accessBagPosition.push({x:item.x,y:item.y,z:item.z,d:0});
})

export type accessListItem = {
    /** item_id предмета */
    id:number;
    /** Ранг, с которого есть доступ к предмету */
    rank: number,
    /** Счётчик одновременно взятых вещей */
    timer: number
}

export interface protectSetting {
    /** Фракция, для которой открыт доступ */
    fraction:number;
    /** Пинкод, по которому можно зайти в склад в любом случае */
    pincode:number;
    /** Открыт/Закрыт */
    locked:boolean;
    accessList: accessListItem[];
    weight: number;
}


class ChestElement {
    readonly id: number;
    private positiondata: Vector3Mp;
    private dimensiondata: number;
    restrictItems: number[];
    point: DynamicCheckpoint;
    name: string;
    settings: protectSetting;
    timerAmount: Map<string,number>;
    grabmoney:number;
    constructor(id: number, name: string, position: Vector3Mp, dimension: number, settings: protectSetting){
        this.id = id;
        this.name = name;
        this.settings = settings;
        this.positiondata = position;
        this.dimensiondata = dimension;
        this.restrictItems = [];
        this.grabmoney = 0;
        this.point = methods.createDynamicCheckpoint(position, "Нажмите ~g~E~w~ чтобы открыть "+name, player => {
            this.open(player);
        }, 1, this.dimension)
        this.timerAmount = new Map()
        this.settings.pincode = 0;
        chest.pool.push(this);
    }
    getTimerAmount(target: PlayerMp | number, item_id: number) {
        const player = typeof target === "number" ? target : user.getId(target);
        if (!this.timerAmount.has(player + "_" + item_id)) this.timerAmount.set(player + "_" + item_id, 0)
        return this.timerAmount.get(player + "_" + item_id)
    }
    canTakeItem(player: PlayerMp, item_id:number) {
        let itemsettings = this.settings.accessList.find(item => item.id === item_id)
        if (!itemsettings) return false;
        let countAccess = itemsettings.timer;
        let rankAccess = itemsettings.rank;
        let taked = this.getTimerAmount(player, item_id);
        if(rankAccess > user.getPlayerFractionRank(player)) return false;
        if (countAccess <= taked) return false;
        return true;
    }
    addTimerAmount(target: PlayerMp | number, item_id:number) {
        const player = typeof target === "number" ? target : user.getId(target);
        let value = this.getTimerAmount(player, item_id);
        this.timerAmount.set(player + "_" + item_id, value+1)
        setTimeout(() => {
            let value = this.getTimerAmount(player, item_id);
            this.timerAmount.set(player + "_" + item_id, value - 1)
        }, accessTimer * 60000)
    }
    canControl(player:PlayerMp){
        return user.isAdminNow(player, 5) || (user.getPlayerFraction(player) == this.settings.fraction && user.isLeader(player));
    }
    dropIllegal(player: PlayerMp) {
        let m = menu.new(player, "Утилизация", "Список доступных предметов");
        inventory.getItemListData(1, user.getId(player)).map(item => {
            let chestItem = illegalList.find(itm => item.item_id >= itm.range[0] && item.item_id <= itm.range[1]);
            if (chestItem) {
                let desc = items.getItemNameById(item.item_id);
                m.newItem({
                    name: desc,
                    onpress: () => {
                        let reward = item.count < getDefaultCount(item.item_id) ? 0 : chestItem.cost;
                        inventory.deleteItem(item.id);
                        methods.saveFractionLog(
                            user.getRpName(player),
                            'Утилизировал на складе ' + this.name + ' ' + desc,
                            this.settings.fraction
                        );
                        user.log(player, "ChestLog", 'Утилизировал на складе ' + this.name + ' ' + desc + " " + this.settings.fraction)
                        this.dropIllegal(player);
                        if (reward > 0) {
                            user.addCashMoney(player, chestItem.cost)
                            player.notify("~g~Получено за утилизацию - " + chestItem.cost + "$")
                        }
                        this.save();
                    }
                })
            }
        })
        m.open();
    }
    open(player:PlayerMp){
        if (user.getPlayerFraction(player) != this.settings.fraction && !user.isAdminNow(player, 5)) return player.notify(`~r~У вас нет доступа`)
        let m = menu.new(player, "", this.name);
        m.sprite = "shopui_title_gr_gunmod"
        m.newItem({
            name: "Содержимое",
            onpress: () => {
                menu.close(player);
                inventory.openInventory(player)
            }
        })
        if (user.isGos(player)) {
            m.newItem({
                name: "Утилизировать конфискат",
                onpress: () => this.dropIllegal(player)
            })
        }
        if(customParams.chestorders){
            let transferBag = user.getItem(player, inventory.types.BagTransfer)
            if (transferBag){
                m.newItem({
                    name: "Разгрузить сумку",
                    onpress: () => {
                        let transferBag = user.getItem(player, inventory.types.BagTransfer)
                        if (!transferBag) return player.notify(`~r~У вас нет в инвентаре ~b~${items.getItemNameById(inventory.types.BagTransfer)}`)
                        let allitems = inventory.getItemListData(inventory.types.BagTransfer, transferBag.id);
                        if(allitems.length == 0) return player.notify(`~r~Сумка пустая`);
                        let currentAmmount = inventory.currentAmount(inventory.types.StockFraction, this.id);
                        let addedWeight = 0
                        allitems.map(item => {
                            addedWeight += items.getItemWeightById(item.item_id)
                        })
                        if (currentAmmount + addedWeight > inventory.maxAmount(inventory.types.StockFraction, this.id)) return player.notify(`~r~Склад переполнен`)
                        allitems.map(item => {
                            inventory.updateItemOwnerSystem(item.id, inventory.types.StockFraction, this.id);
                        })
                        inventory.deleteItem(transferBag.id)
                        user.checkComponents(player);
                    }
                })
            }
        }
        if(user.isGos(player) && player.bankgrabmoney){
            m.newItem({
                name: "Разгрузить сумку с деньгами",
                onpress: () => {
                    if (!player.bankgrabmoney) return player.notify(`~r~У вас нет сумки с деньгами`)
                    this.grabmoney += player.bankgrabmoney;
                    player.bankgrabmoney = 0;
                    player.notify(`~g~Вы сдали сумку`)
                    user.checkComponents(player)
                }
            })
        }
        if (this.settings.fraction == 4 && (user.getPlayerFractionRank(player) > 11) && customParams.chestorders) {
            m.newItem({
                name: "Получить транспортировочную сумку",
                desc: "Она необходима для транспортировки вещей в другие склады",
                onpress: () => {
                    if (user.hasItem(player, inventory.types.BagTransfer)) return player.notify(`~r~У вас уже есть ~b~${items.getItemNameById(inventory.types.BagTransfer)}`);
                    user.giveItem(player, inventory.types.BagTransfer, 1, true)
                }
            })
            m.newItem({
                name: "Новый заказ",
                onpress: () => { this.newOrder(player) }
            })
            m.newItem({
                name: "Загрузка предметов в транспортную сумку",
                onpress: () => {
                    if (!user.hasItem(player, inventory.types.BagTransfer)) return player.notify(`~r~У вас нет в инвентаре ~b~${items.getItemNameById(inventory.types.BagTransfer)}`)
                    let submenu2 = menu.new(player, "Выберите предметы");
                    let list = new Map<number, number>();
                    this.settings.accessList.map(item => {
                        list.set(item.id, 0)
                        submenu2.newItem({
                            name: items.getItemNameById(item.id),
                            type: "range",
                            rangeselect: [0, 1000],
                            onchange: (v) => {
                                list.set(item.id, v);
                            }
                        })
                    });
                    submenu2.newItem({
                        name: "~b~Выгрузить указанные предметы в сумку",
                        onpress: () => {
                            user.accept(player, "Вы уверены?").then(status => {
                                if (!status) return;
                                let transferBag = user.getItem(player, inventory.types.BagTransfer)
                                if (!transferBag) return player.notify(`~r~У вас нет в инвентаре ~b~${items.getItemNameById(inventory.types.BagTransfer)}`)
                                let allitems = this.allItems().filter(item => list.has(item.item_id));
                                list.forEach((amount, itemid) => {
                                    if (amount > 0) {
                                        let itms = allitems.filter(item => item.item_id == itemid)
                                        if (itms.length < amount) {
                                            player.notify(`~r~${items.getItemNameById(itemid)} не был загружен. Причина - отсутствует на складе в достаточном количестве`)
                                        } else {
                                            if ((inventory.currentAmount(inventory.types.BagTransfer, transferBag.id) + items.getItemWeightById(itemid) * amount) > inventory.maxAmount(inventory.types.BagTransfer, transferBag.id)){
                                                player.notify(`~r~${items.getItemNameById(itemid)} не был загружен. Причина - недостаточно места в сумке`)
                                            } else {
                                                for (let id = 0; id < amount; id++) {
                                                    inventory.updateItemOwnerSystem(itms[id].id, inventory.types.BagTransfer, transferBag.id)
                                                }
                                            }
                                        }
                                    }
                                })
                                player.notify(`~g~Готово`);
                            })
                        }
                    })
                    submenu2.open();
                }
            })
        }

        if(this.canControl(player) || user.getPlayerFractionRank(player) >= 13){
            m.newItem({
                name: "Записи склада",
                onpress: () => {
                    menu.close(player);
                    user.setGui(player, "chestLog")
                    logFractionGunEntity.findAll({
                        where: {
                            fraction_id: this.settings.fraction
                        }, order: [['id', 'DESC']], limit: 400
                    }).then(data => {
                        let list: { who: string, what: string, when: number, take: boolean }[] = [];
                        data.map(item => {
                            let what = String(item.do)
                            if(item.do.indexOf('Взял') == 0){
                                list.push({
                                    who: item.name,
                                    what: what,
                                    when: item.timestamp,
                                    take: true
                                })
                            } else if (what.indexOf('Положил') == 0) {
                                list.push({
                                    who: item.name,
                                    what: what,
                                    when: item.timestamp,
                                    take: false
                                })
                            } else {
                                list.push({
                                    who: item.name,
                                    what: what,
                                    when: item.timestamp,
                                    take: false
                                })
                            }
                            
                        })
                        
                        mp.events.triggerBrowser(player, 'chest:log', fractionUtil.getFractionIcon(this.settings.fraction), fractionUtil.getFractionName(this.settings.fraction), list)
                    });
                }
            })
            m.newItem({
                name: "Статус",
                more: this.settings.locked ? '~g~Закрыт' : '~r~Открыт',
                onpress: () => {
                    this.settings.locked = !this.settings.locked
                    player.notify('Склад '+(this.settings.locked ? '~g~Закрыт' : '~r~Открыт'))
                    this.open(player);
                    this.save();
                }
            })
            
            // m.newItem({
            //     name: "Пинкод для общего доступа",
            //     desc: 'Пинкод используется для доступа ~r~НЕ ~w~членам организации',
            //     more: this.settings.pincode == 0 ? '~g~Отключён' : '~r~Включён',
            //     onpress: () => {
            //         if (this.settings.pincode == 0){
            //             menu.input(player, "Введите новый пинкод", `${this.settings.pincode}`, 5, "password").then((results) => {
            //                 if(!results) return
            //                 if(!results.isNumberOnly()) return player.notify(`~r~Допускаются только цифры`)
            //                 let result = methods.parseInt(results)
            //                 if(isNaN(result) || result < 1 || result > 99999) return player.notify(`~r~Новый пинкод введён не верно`)
            //                 this.settings.pincode = result;
            //                 this.open(player);
            //                 this.save();
            //                 player.notify('~g~Новый пинкод установлен. Те, кто знают его смогут воспользоватся складом без членства во фракции')
            //             })
            //         } else {
            //             user.accept(player, "Отключить пинкод?").then(status => {
            //                 if(!status) return;
            //                 this.settings.pincode = 0
            //                 player.notify(`~g~Пинкод снят. Доступ только для членов фракции`)
            //                 this.open(player);
            //                 this.save();
            //             })
            //         }
            //     }
            // })
            // ############
            //!@todo сделать логи склада
            // ############

            m.newItem({
                name: "Настройка доступа",
                desc: 'Вы можете указать кто какой предмет и в каком количестве может брать',
                onpress: () => {
                    const submenuopen = () => {
                        let submenu = menu.new(player, "Настройка доступа", "Список");
                        submenu.onclose = () => { return this.open(player) }
                        let itemsList = inventory.getItemListData(inventory.types.StockFraction, this.id)
                        itemsList.map(item => {
                            if (!this.settings.accessList.find(q => q.id == item.item_id)) this.settings.accessList.push({id: item.item_id, rank: 1, timer: 1})
                        })
    
                        this.settings.accessList.map(item => {
                            submenu.newItem({
                                name: items.getItemNameById(item.id),
                                more: `Р: ${item.rank} | С: ${item.timer}`,
                                onpress: () => {
                                    let submenu2 = menu.new(player, "Настройка")
                                    submenu2.onclose = () => {return submenuopen();}
                                    submenu2.newItem({
                                        name: "Ранг для доступа",
                                        type: "list",
                                        list: ["~r~Необходимо выбрать",...fractionUtil.getFractionRanks(this.settings.fraction)],
                                        listSelected: item.rank,
                                        onpress: (val) => {
                                            if(val.listSelected <= 0) return player.notify(`~r~Необходимо выбрать ранг`)
                                            item.rank = val.listSelected
                                            this.save();
                                            player.notify('~g~Настройка ранга для ' + items.getItemNameById(item.id)+ ' сохранена')
                                        }
                                    })
                                    submenu2.newItem({
                                        name: "Счётчик количества",
                                        desc: "Сколько можно брать предметов за " + accessTimer + ' мин.',
                                        type: "range",
                                        rangeselect: [0, 20],
                                        listSelected: item.timer,
                                        onpress: (val) => {
                                            if(val.listSelected <= 0) return player.notify(`~r~Небходимо выбрать больше 0`)
                                            item.timer = val.listSelected
                                            this.save();
                                            player.notify('~g~Настройка счётчика для ' + items.getItemNameById(item.id)+ ' сохранена')
                                        }
                                    })
                                    submenu2.open();
                                }
                            })
                        })
    
                        submenu.open();
                    }
                    submenuopen()
                }
            })
        }



        if(user.isAdminNow(player, 5)){
            m.newItem({
                name: "~b~Админ раздел",
                onpress: () => {
                    player.notify('~g~Серёга, епта, это просто текст, листай ниже')
                }
            })
            m.newItem({
                name: "Указать вес склада",
                onpress: () => {
                    menu.input(player, "Введите вес", `${(this.settings.weight/1000)}`, 5, "int").then((results) => {
                        if (!results) return;
                        let result = methods.parseInt(results)
                        if (isNaN(result) || result < 1 || result > 9999999) return player.notify(`~r~Вес введён не верно`)
                        this.settings.weight = result*1000;
                        this.save();
                        player.notify('~g~Новый вес установлен')
                    })
                }
            })
            m.newItem({
                name: "Закинуть предметы в склад",
                onpress: () => {
                    let submenu2 = menu.new(player, "Выберите предметы");
                    let list = new Map<number, number>();
                    this.settings.accessList.map(item => {
                        list.set(item.id, 0)
                        submenu2.newItem({
                            name: items.getItemNameById(item.id),
                            type: "range",
                            rangeselect: [0, 1000],
                            onchange: (v) => {
                                list.set(item.id, v);
                            }
                        })
                    });
                    submenu2.newItem({
                        name: "Внести указанные вещи на склад",
                        onpress: () => {
                            user.accept(player, "Вы уверены?").then(status => {
                                if(!status) return;
                                list.forEach((amount, itemid) => {
                                    if (amount > 0)
                                    inventory.createManyItem(itemid, 0, inventory.types.StockFraction, this.id, amount);
                                })
                                player.notify(`~g~Склад пополнен`);
                            })
                        }
                    })
                    submenu2.open();
                }
            })
            m.newItem({
                name: "Сменить фракцию склада",
                onpress: () => {
                    menu.selectFraction(player).then(fra => {
                        if (!fractionUtil.getFraction(fra)) return player.notify(`~r~Отмена`)
                        const fraction = methods.parseInt(fra);
                        this.settings.fraction = fraction;
                        this.save();
                        player.notify('~g~Фракция изменена')
                    });
                }
            })
            m.newItem({
                name: "~r~Удалить склад",
                onpress: () => {
                    user.accept(player, "Вы уверены?").then(status => {
                        if(!status) return;
                        this.delete()
                        player.notify('~g~Склад успешно удалён');
                    })
                }
            })
        }
        m.open()
        
    }
    allItems(){
        return inventory.allItems().filter(item => item.owner_type == inventory.types.StockFraction && item.owner_id == this.id)
    }
    newOrder(player: PlayerMp) {
        let m = menu.new(player, this.name, "Список доступного арсенала");
        let itemsorder: Map<string, number> = new Map()
        EquipDataItems.map(item => {
            if (item.shiporder) {
                itemsorder.set(item.model, 0);
                m.newItem({
                    name: item.name,
                    type: "range",
                    rangeselect: [0, 1000],
                    onchange: (value) => itemsorder.set(item.model, value)
                })
            }
        })
        m.newItem({
            name: "~g~Заказать",
            onpress: () => {
                let resitem: orderItem[] = [];
                let weight = 0;
                itemsorder.forEach((value, item) => {
                    weight += (<number>items.getItemAmountById(methods.parseInt(item)) * value);
                    resitem.push({
                        model: item,
                        amount: value
                    })
                })
                if (weight > maxShipWeight * 1000) return player.notify("~r~Заказ не может превышать вес в " + maxShipWeight + "кг. Вес вашего текущего заказа - " + methods.parseInt(weight / 1000) + " кг.");
                newOrder(player, resitem);
                this.save();
            }
        })
        m.open()
    }
    save(){
        customChest.findOne({ where: { id: this.id } }).then(item => {
            if(!item) return;
            item.pos = this.position
            item.dimension = this.dimension
            item.settings = this.settings
            item.name = this.name
            item.save();
        })
    }
    delete(){
        customChest.destroy({where:{id:this.id}})
        this.point.delete();
        chest.pool.splice(this.getInPoolIndex(), 1);
    }
    static getInPool(id:number){
        return chest.pool.find(item => item.id == id)
    }
    getInPoolIndex(){
        return chest.pool.findIndex(item => item.id == this.id)
    }
    get position(){
        return this.positiondata
    }
    set position(value:Vector3Mp){
        this.positiondata = value
        if (this.point) this.point.updatePos(value)
    }
    get dimension(){
        return this.dimensiondata
    }
    set dimension(value:number){
        this.dimensiondata = value
        if (this.point) this.point.updateDimension(value)
    }
}


export const chest = {
    new: (id: number, name: string, position: Vector3Mp, dimension: number, settings: protectSetting) => {
        if(chest.pool.find(item => item.id == id)){
            new Error("[Chest] Dublicate ID "+id)
            return null;
        }
        return new ChestElement(id, name, position, dimension, settings)
    },
    create: (player: PlayerMp, name: string, fraction: number): Promise<ChestElement> => {
        return new Promise((resolve, reject) => {
            const position = {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z-1,
            }
            const settings: protectSetting = { fraction, pincode: 0, accessList: [], locked: false, weight: 1000000}
            customChest.create({
                name, dimension: player.dimension, pos: position, settings
            }).then(item => {
                resolve(chest.new(item.id, name, new mp.Vector3(position.x, position.y, position.z), player.dimension, settings))
                player.notify('~g~Склад успешно создан')
            }).catch(err => {
                player.notify('~r~Возникла ошибка')
                resolve(null)
                console.error(err)
            })
        })
    },
    get: (id:number) => chest.pool.find(item => item.id == id),
    getNearest: (player:PlayerMp, dist:number = 10, useZ = true) => {
        return chest.pool.find(item => player.dimension == item.dimension && methods.distanceToPos2D(item.position, player.position) <= dist && (!useZ || methods.distanceToPos(item.position, player.position) <= dist));
    },
    canTransferBag: (player:PlayerMp) => {
        if (!!accessBagPosition.find(item => methods.distanceToPos2D(item, player.position) <= 30 && (!item.d || player.dimension == item.d))) return true;
        if(chest.getNearest(player, 10, true)) return true;
        if (player.dist(order.colshapePos) < 20 && player.dimension == 0) return true;
        return false;
    },
    at: (id:number) => chest.get(id),
    pool: <ChestElement[]>[],
    load: () => {
        customChest.findAll().then(items => {
            items.map(item => {
                chest.new(item.id, item.name, new mp.Vector3(item.pos.x, item.pos.y, item.pos.z), item.dimension, item.settings)
            })
        }).catch(err => {
            console.error(err)
        })
    }
}