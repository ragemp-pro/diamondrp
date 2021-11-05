/// <reference path="../declaration/server.ts" />


import { methods } from './modules/methods';
import { chat } from './modules/chat';
import { user } from './user';
import { enums } from './enums';
import { items } from './items';
import { vehicles } from './vehicles';
import { weapons } from './weapons';
import { inventoryEntity } from './modules/entity/inventory';
import { Op } from 'sequelize';
import { InventoryItemDB, getItemChoises, InventoryDataCef, InventoryItemCef, getItemHashById, groupItems, ammoItemIdToMaxCountUtil, inventoryTypesUtil, maxAmountTransferItem, healItemCost, healItemCost3, healItemCost2, houseFridgeAmount } from '../util/inventory';
import { vehicleInfo } from './modules/vehicleInfo';
import { stockSize } from '../util/sharedData';
import { menu } from './modules/menu';
import { stock } from './stock';
import { coffer } from './coffer';
import { tablet } from './managers/tablet.events';
import { chest } from './modules/customchest';
import { fractionUtil } from '../util/fractions';
import { sleep } from '../util/methods';
import { WEAPON_LEVEL_MIN } from '../util/weapons';
import { houses } from './houses';


let props = new Map();

export let itemsDB: Map<number, InventoryItemDB> = new Map();
let inventoryBlocksData: Map<string, InventoryItem[]> = new Map();
let updateBlock: Map<number, boolean> = new Map();

mp.events.add("inventory:open", (player: PlayerMp, ownertype?: number, ownerid?: number) => {
    inventory.openInventory(player, ownertype, ownerid);
});
mp.events.add("inventory:close", (player: PlayerMp) => {
    inventory.closeInventory(player);
});

mp.events.add('playerDeath', (player: PlayerMp) => {
    if(!user.isLogin(player)) return;
    const pos = {x: player.position.x, y: player.position.y, z: player.position.z}
    setTimeout(() => {
        if(!mp.players.exists(player)) return;
        player.weaponsAll.map(item => {
            inventory.addWorldItem(player, item.item, 1, 0, 0, pos.x, pos.y, pos.z, 0.0, 0.0, 0.0, items.getItemHashById(item.item), 1, -1, -1, -1)
            inventory.addWorldItem(player, item.ammoType, 1, 0, 0, pos.x, pos.y, pos.z, 0.0, 0.0, 0.0, items.getItemHashById(item.item), item.ammo, -1, -1, -1)
        })
        user.clearWeapons(player)
        player.weaponsAll = [];
    }, 1000)
});

setTimeout(() => {
    mp.events.register("inventory:unEquipGun", unEquipWeaponEvent);
    mp.events.register("inventory:unEquipGunAmmo", async (player: PlayerMp, item_id:number) => {
        if (player.spamProtect) return player.notify(`~r~Подождите пару секунд`), inventory.openInventory(player)
        if (player.isJumping) return player.notify(`~r~Чтобы снять оружие с экипировки - нужно остановится`), inventory.openInventory(player)
        player.spamProtect = true;
        setTimeout(() => {
            player.spamProtect = false;
        }, 5000)
        await user.unEquipGunAmmo(player, item_id);
        inventory.updateInventory(player)
    });
    mp.events.register("inventory:close", (player: PlayerMp) => {
        inventory.closeInventory(player);
    });
    mp.events.register("inventory:choiceItem", async (player: PlayerMp, data: { item: { id: number, item_id: number }, task: string, owner_id: number, owner_type: number, target_id?: number, target_type?: number }, amount = 1) => {
        if (user.isCuff(player)) {
            return player.notify("~r~Вы в наручниках"), inventory.openInventory(player)
        }
        if (player.health == 0) {
            return player.notify("~r~Вы в коме"), inventory.openInventory(player)
        }
        let task = data.task;
        let item = itemsDB.get(data.item.id)
        if (!item || item.owner_type != data.owner_type || (item.owner_id != data.owner_id && methods.convertNumberToHash(data.owner_id) != item.owner_id)) return player.notify("~r~Предмета больше нет в данном месте"), inventory.openInventory(player)
        if (task == "equipItemButton") {
            inventory.equipItem(player, item.id, item.item_id, item.prefix, item.number, item.key_id, item.count)
        }
        else if (task == "drop") {
            if (player.vehicle) return player.notify(`~r~Данное действие нельзя выполнять в транспорте`), inventory.openInventory(player)
            if (player.dimension != 0) return player.notify(`~r~Выбрасывать предметы можно только в нулевом измерении`), inventory.openInventory(player)
            inventory.dropItem(player, item.id, item.item_id, player.position.x, player.position.y, player.position.z, 0, 0, 0, getItemHashById(item.item_id))
        }
        else if (task == "take") {
            if (player.vehicle) return player.notify(`~r~Данное действие нельзя выполнять в транспорте`), inventory.openInventory(player)
            if (amount > maxAmountTransferItem) return player.notify('~r~Не более 10 за одну операцию'), inventory.openInventory(player);
            inventory.updateItemOwner(player, item.id, data.target_type, data.target_id, amount)
        }
        else if (task == "transfer") {
            if (player.vehicle) return player.notify(`~r~Данное действие нельзя выполнять в транспорте`), inventory.openInventory(player)
            if (amount > 10) return player.notify('~r~Не более 10 за одну операцию'), inventory.openInventory(player);
            let amountHave = inventory.getItemListData(item.owner_type, item.owner_id).filter(itm => itm.item_id == item.item_id).length;
            if (amountHave < amount) {
                if (amount == 1) return player.notify('~r~Данного предмета больше нет'), inventory.openInventory(player)
                return player.notify('~r~Указанное количество превышает максимальное'), inventory.openInventory(player)
            }
            inventory.updateItemOwner(player, item.id, data.target_type, data.target_id, amount)
        }

    })
    mp.events.register("player:unlock", (player: PlayerMp, ownertype: number, ownerid: string | number, value: string) => {
        if (!player.passwordEnterBad) player.passwordEnterBad = 0;
        if (player.passwordEnterProtect) return player.notify(`~r~Повторите попытку позднее`);
        let pin = ownertype == inventory.types.StockFraction ? chest.at(<number>ownerid).settings.pincode : (ownertype == 12 ? stock.getPin2(<number>ownerid) : stock.getPin3(<number>ownerid))
        let pin1 = methods.parseInt(value);
        if (pin != pin1){
            player.passwordEnterBad++;
            player.passwordEnterProtect = true;
            setTimeout(() => {
                player.passwordEnterProtect = false;
            }, player.passwordEnterBad*10000)
            return player.notify(`~r~Пинкод указан не верно`);
        }
        player.passwordEnterBad = 0;
        player.passwords.set(ownertype + "_" + ownerid, pin)
        player.notify(`~g~Пинкод введён`)
        inventory.openInventory(player)
    })
}, 1000)


mp.events.add('playerJoin', (player: PlayerMp) => {
    player.passwords = new Map();
    player.weaponsAll = [];
})

function detectClosedInventory(player: PlayerMp, ownertype: number, ownerid: number | string, reasonReturn?: false, entity?: VehicleMp | PlayerMp): boolean;
function detectClosedInventory(player: PlayerMp, ownertype: number, ownerid: number | string, reasonReturn?: true, entity?: VehicleMp | PlayerMp): string;

function detectClosedInventory(player: PlayerMp, ownertype: number, ownerid: number | string, reasonReturn: true | false = false, entity?:VehicleMp|PlayerMp): string | boolean {
    if (user.isDead(player)) return !reasonReturn ? true : "Вы в коме"
    if (user.isCuff(player)) return !reasonReturn ? true : "Вы в наручниках"
    if (ownertype == 8) {
        if (user.isAdminNow(player, 5)) return !reasonReturn ? false : "";
        let veh = <VehicleMp> entity;
        if(!veh) veh = mp.vehicles.toArray().find(vehicle => vehicle.numberPlate == ownerid || methods.convertNumberToHash(vehicle.numberPlate) == ownerid)
        if (!veh) return !reasonReturn ? true : "Поблизости не обнаружен"
        if (veh.dist(player.position) > 5) return !reasonReturn ? true : "Слишком далеко"
        // let vInfo = vehicleInfo.find(veh.model)
        // if (!vInfo) return !reasonReturn ? true : "Нет багажника";
        if (veh.bodyHealth == 0 || veh.engineHealth == 0) return !reasonReturn ? true : "Сильно повреждён";
        return !reasonReturn ? veh.locked : (veh.locked ? "Закрыт" : "");
    } else if (ownertype == inventory.types.StockFraction) {
        let chestitem = chest.at(<number>ownerid)
        if (!chestitem) return !reasonReturn ? true : "Сломан"
        if (chestitem.settings.locked) return !reasonReturn ? true : "Закрыт"
        if (user.getPlayerFraction(player) == chestitem.settings.fraction) return !reasonReturn ? false : ""
        if (user.isAdminNow(player, 6)) return !reasonReturn ? false : ""
        if (!chestitem.settings.pincode) return !reasonReturn ? true : "Нет доступа"
        else {
            let havepass = player.passwords.get(ownertype + "_" + ownerid) == chestitem.settings.pincode
            if (!havepass) return !reasonReturn ? true : "Требуется пинкод"
        }
    } else if (ownertype == 1) {
        if (user.isAdminNow(player, 5)) return !reasonReturn ? false : "";
        let target = <PlayerMp>entity;
        if(!target) target = mp.players.toArray().find(nplayer => user.getId(nplayer) == ownerid)
        if (!target && !user.isAdminNow(player, 5)) return !reasonReturn ? true : "Не в сети"
        if (player.id == target.id) return !reasonReturn ? false : ""
        if (target.dist(player.position) > 5 && !user.isAdminNow(player, 5)) return !reasonReturn ? true : "Слишком далеко"
        if (!user.isCuff(target) && !user.isAdminNow(player, 5)) return !reasonReturn ? true : "Не в наручниках"
    } else if (ownertype == 12 || ownertype == 13) {
        if (user.isAdminNow(player, 5)) return !reasonReturn ? false : "";
        let pin = ownertype == 12 ? stock.getPin2(<number>ownerid) : stock.getPin3(<number>ownerid)
        if (user.get(player, "stock_id") == ownerid) player.passwords.set(ownertype + "_" + ownerid, pin)
        let havepass = player.passwords.get(ownertype + "_" + ownerid) == pin || pin == 0
        return !reasonReturn ? !havepass : (!havepass ? "Пароль не указан" : "")
    } else if (ownertype == 7) {
        if (user.isAdminNow(player, 5)) return !reasonReturn ? false : "";
        let item = itemsDB.get(<number>ownerid);
        if(!item) return !reasonReturn ? true : "Уничтожена"
        if(item.owner_type == 0){
            if(methods.distanceToPos2D(player.position, {x:item.pos_x,y:item.pos_y}) > 4) return !reasonReturn ? true : "Слишком далеко"
        } else if(detectClosedInventory(player, item.owner_type, item.owner_id)){
            return !reasonReturn ? true : "Лежит в недоступном для вас месте"
        }
    }
    return !reasonReturn ? false : "";
}

export let inventory = {
    deleteHealItemsFromPlayer: (player: PlayerMp|number, notify = false) => {
        let count = 0;
        inventory.getItemListData(1, typeof player == "number" ? player : user.getId(player)).map(item => {
            if ((item.item_id == 215 || item.item_id == 278) && item.prefix == 10) {
                inventory.deleteItem(item.id)
                count++;
            }
        })
        if (notify && typeof player != "number") player.notify(`~g~Вы успешно сдали аптечки в количестве ${count}шт.`)
    },
    getById: (id: number) => {
        return itemsDB.get(id);
    },
    getNearestInventoriesPoints: (player: PlayerMp, r = 1.5) => {
        let res: { type: number, id: number }[] = [];
        if (!user.isLogin(player)) return;
        chest.pool.filter(item => methods.distanceToPos(player.position, item.position) < 3 && player.dimension == item.dimension).map(item => {
            res.push({ type: inventory.types.StockFraction, id: item.id })
        })
        if (player.dimension > 100000 && player.dimension < 5000000) {
            enums.kitchenIntData.forEach(function(item: number[]) {
                if (methods.distanceToPos(player.position, new mp.Vector3(item[0], item[1], item[2])) <= r) {
                    res.push({ type: 10, id: (player.dimension) })
                }
            });
        } else if (player.dimension >= 5000000 && player.dimension < 5100000) {
            enums.kitchenIntData.forEach(function(item: number[]) {
                if (methods.distanceToPos(player.position, new mp.Vector3(item[0], item[1], item[2])) <= r) {
                    res.push({ type: 10, id: (player.dimension) })
                }
            });
        } else if (player.dimension >= 5100000 && player.dimension < 5200000) {
            if (methods.distanceToPos(player.position, stock.stockPos) <= r) {
                for (let q = 12; q < 23; q++)res.push({ type: q, id: player.dimension - 5100000 })
                res.push({ type: 11, id: player.dimension - 5100000 })
            }
        } else if (player.dimension > 0) {
            if(player.dimension >= 10 && player.dimension <= 13 && player.dist(new mp.Vector3(1395.11, 1144.95, 114.33)) < 20){

            } else {
                enums.kitchenIntData.forEach(function(item: number[]) {
                    if (methods.distanceToPos(player.position, new mp.Vector3(item[0], item[1], item[2])) <= r) {
                        res.push({ type: 10, id: player.dimension })
                    }
                });
            }
        }
        return res;
    },
    allItems: () => {
        return [...itemsDB].map(([_, item]) => { return item })
    },
    allItemsMap: () => itemsDB,
    detectClosedInventory,
    stringForLog: (type: number|InventoryItemDB, id?: number) => {
        if(typeof type === "object") return `@inventorytype${type.owner_type} @inventoryid${type.owner_id}`;
        else return `@inventorytype${type} @inventoryid${id}`
    },
    getOwnerNameAndDesc: (ownertype: number, ownerid: number | string, player?: PlayerMp, veh?:VehicleMp) => {
        let name = ""
        let desc = ""
        name = "Хранилище " + ownertype, desc = "Номер: " + ownerid
        if (ownertype == 0) name = "Предметы на земле", desc = "Радиус 2 метра"
        else if (ownertype == 1) {
            name = "Инвентарь игрока"
            if (user.getId(player) == ownerid) desc = user.getRpName(player)
            else if (player && user.getDating(player, <number>ownerid)) desc = user.getDating(player, <number>ownerid)
            else desc = `ID: ${user.getPlayerById(<number>ownerid) ? user.getShowingId(user.getPlayerById(<number>ownerid)) : ownerid}`
        }
        else if (ownertype == 8) {
            let vehs:VehicleMp;
            if(vehs) veh = vehs;
            else vehs = mp.vehicles.toArray().find(veh => veh.numberPlate == ownerid || methods.convertNumberToHash(veh.numberPlate) == ownerid)
            let vehmodel = ""
            if (veh) {
                let vInfo = vehicleInfo.find(veh.model);
                if (vInfo) vehmodel = ` ${vInfo.display_name}`
            }
            name = "Багажник" + vehmodel
            desc = veh ? "Номер ТС: " + veh.numberPlate : `#${ownerid}`
        }
        else if (ownertype == 10) name = "Холодильник"
        else if (ownertype >= 11 && ownertype <= 22) {
            let tid = ownertype - 11;
            if (tid == 1 || tid == 2) {
                name = "Сейф #" + tid, desc = "Номер: " + ownerid
            }
            if (tid >= 3 && tid <= 6) {
                name = "Плотный деревянный ящик #" + (tid - 2), desc = "Номер: " + ownerid
            }
            if ((tid >= 7 && tid <= 12) || tid == 0) {
                name = "Деревянный ящик #" + (tid == 0 ? 6 : (tid - 6)), desc = "Номер: " + ownerid
            }
        }
        else if (ownertype == inventory.types.Bag) {
            name = "Пакет", desc = "#" + ownerid
        }
        else if (ownertype == inventory.types.BagFull) {
            name = items.getItemNameById(inventory.types.BagFull), desc = "#" + ownerid
        }
        else if (ownertype == inventory.types.BagSmall) {
            name = items.getItemNameById(inventory.types.BagSmall), desc = "#" + ownerid
        }
        else if (ownertype == inventory.types.BagTransfer) {
            name = items.getItemNameById(inventory.types.BagTransfer), desc = "#" + ownerid
        }
        else if (ownertype == inventory.types.StockFraction) {
            let chestitem = chest.at(<number>ownerid)
            if (!chestitem){
                name = "Склад", desc = "#" + ownerid
            } else {
                name = "Склад", desc = chestitem.name.replace('Склад ', '')
            }
            
        }
        else name = "Хранилище " + ownertype, desc = "Номер: " + ownerid

        return { name, desc }
    },
    closeInventory: (player: PlayerMp) => {
        if (!mp.players.exists(player)) return;
        user.setGui(player, null);
        player.openInventory = null;
    },
    openInventory: (player: PlayerMp, ownertype?: number, ownerid?: number) => {
        if (!mp.players.exists(player)) return;
        if (player.duelLobby && player.dimension != 0) return;
        const start = new Date().getTime();
        methods.debug('Load Inventory', user.getRpName(player), user.getId(player))
        // user.setGui(player, "inventory");
        let blocks: InventoryDataCef[] = [];
        let myid = user.getId(player)
        let myinventory: InventoryItemCef[] = [];
        inventory.getItemListData(1, myid).map(item => {
            myinventory.push([item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id])
        })
        let nearest: InventoryItemCef[] = [];
        if (player.dimension == 0) {
            let count = 0;
            itemsDB.forEach((item) => {
                // const [id, item_id, amount, count] = item;
                if (item.owner_id == 0 && item.owner_type == 0 && methods.distanceToPos2D({ x: item.pos_x, y: item.pos_y }, { x: player.position.x, y: player.position.y }) < 2 && count < 20) {
                    nearest.push([item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id])
                    count++;
                }
            })
        }
        myinventory = groupItems(myinventory)
        // nearest = groupItems(nearest)
        blocks.push({
            name: "Ваш инвентарь",
            desc: user.getRpName(player),
            owner_id: myid,
            owner_type: 1,
            weight: inventory.currentAmount(1, user.getId(player)),
            weight_max: inventory.maxAmount(1, user.getId(player)),
            items: myinventory
        })
        blocks.push({
            name: "Предметы на земле",
            desc: "Радиус 2 метра",
            owner_id: 0,
            owner_type: 0,
            weight: 0,
            weight_max: 0,
            items: nearest
        })
        // console.log(nearest)
        let vehicles = user.getNearestVehicles(player, 4);
        let nplayers = user.getNearestPlayers(player, 2);
        let chests = inventory.getNearestInventoriesPoints(player);

        chests.map(chest => {
            let locked = inventory.detectClosedInventory(player, chest.type, chest.id)
            let targetinventory: InventoryItemCef[] = !locked ? inventory.getItemListData(chest.type, chest.id).map(item => [item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id]) : []
            targetinventory = groupItems(targetinventory)
            let namedesc = inventory.getOwnerNameAndDesc(chest.type, chest.id, player)
            blocks.push({
                name: namedesc.name,
                desc: namedesc.desc + (locked ? ` (${inventory.detectClosedInventory(player, chest.type, chest.id, true)})` : ""),
                owner_id: chest.id,
                owner_type: chest.type,
                weight: inventory.currentAmount(chest.type, chest.id),
                weight_max: inventory.maxAmount(chest.type, chest.id),
                items: targetinventory,
                closed: locked
            })
        })

        nplayers.forEach(nplayer => {
            if (nplayer.alpha > 0) {
                let locked = inventory.detectClosedInventory(player, 1, user.getId(nplayer), false, nplayer)
                let targetinventory: InventoryItemCef[] = !locked ? inventory.getItemListData(1, user.getId(nplayer)).map(item => [item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id]) : []
                targetinventory = groupItems(targetinventory)
                let namedesc = inventory.getOwnerNameAndDesc(1, user.getId(nplayer), player)
                blocks.push({
                    name: namedesc.name,
                    desc: namedesc.desc + (locked ? ` (${inventory.detectClosedInventory(player, 1, user.getId(nplayer), true)})` : ""),
                    owner_id: user.getId(nplayer),
                    owner_type: 1,
                    weight: inventory.currentAmount(1, user.getId(nplayer)),
                    weight_max: inventory.maxAmount(1, user.getId(nplayer)),
                    items: targetinventory,
                    closed: locked
                })
            }
        });
        vehicles.forEach(vehicle => {
            // let vInfo = methods.getVehicleInfo(vehicle.model)
            let locked = inventory.detectClosedInventory(player, 8, vehicle.numberPlate, false, vehicle)
            let targetinventory: InventoryItemCef[] = !locked ? inventory.getItemListData(8, vehicle.numberPlate).map(item => [item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id]) : []
            targetinventory = groupItems(targetinventory)
            let namedesc = inventory.getOwnerNameAndDesc(8, vehicle.numberPlate, player, vehicle)
            blocks.push({
                name: namedesc.name,
                desc: namedesc.desc + (locked ? ` (${inventory.detectClosedInventory(player, 8, vehicle.numberPlate, true, vehicle)})` : ""),
                owner_id: vehicle.numberPlate,
                owner_type: 8,
                weight: inventory.currentAmount(8, vehicle.numberPlate),
                weight_max: inventory.maxAmount(8, vehicle.numberPlate),
                items: targetinventory,
                closed: locked
            })
        })

        if (player.openInventory && !ownertype && !ownerid) {
            ownertype = methods.parseInt(player.openInventory.split('_')[1]);
            ownerid = methods.parseInt(player.openInventory.split('_')[2]);
        }

        if (ownertype && ownerid) {
            let targetinventory: InventoryItemCef[] = []
            inventory.getItemListData(ownertype, ownerid).map(item => {
                targetinventory.push([item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id])
            })
            targetinventory = groupItems(targetinventory)
            let namedesc = inventory.getOwnerNameAndDesc(ownertype, ownerid)
            blocks.push({
                name: namedesc.name,
                desc: namedesc.desc,
                owner_id: ownerid,
                owner_type: ownertype,
                weight: inventory.currentAmount(ownertype, ownerid),
                weight_max: inventory.maxAmount(ownertype, ownerid),
                items: targetinventory
            })
        }
        blocks.map(block => {
            if (!block.closed) {
                block.items.forEach(itemq => {

                    if ([inventory.types.BagTransfer, inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall].includes(itemq[1])){
                        if (!blocks.find(q => q.owner_type == itemq[1] && q.owner_id == itemq[0])){
                            let targetinventory: InventoryItemCef[] = []
                            inventory.getItemListData(itemq[1], itemq[0]).map(item => {
                                targetinventory.push([item.id, item.item_id, 1, item.count, item.number, item.prefix, item.key_id])
                            })
                            targetinventory = groupItems(targetinventory)
                            let namedesc = inventory.getOwnerNameAndDesc(itemq[1], itemq[0])
                            blocks.push({
                                name: namedesc.name,
                                desc: namedesc.desc,
                                owner_id: itemq[0],
                                owner_type: itemq[1],
                                weight: inventory.currentAmount(itemq[1], itemq[0]),
                                weight_max: inventory.maxAmount(itemq[1], itemq[0]),
                                items: targetinventory
                            })
                            // console.log(namedesc.name, itemq[1], inventory.maxAmount(itemq[1], itemq[0]))
                        }
                    }
                })
            }
        })
        player.openInventory = `inv_${ownertype}_${ownerid}`

        player.call("inventory:open:data", [JSON.stringify(blocks)])
        const end = new Date().getTime();
        methods.debug('Load Inventory End', `${end - start}ms`, user.getRpName(player), user.getId(player))
    },
    updateInventory: (player: PlayerMp) => {
        if (!mp.players.exists(player)) return;
        let targets = user.getNearestPlayers(player)
        targets.map(nplayer => {
            if (user.isLogin(nplayer) && player.dist(nplayer.position) < 5 && player.dimension == nplayer.dimension && nplayer.openInventory) {
                inventory.openInventory(nplayer)
            }
        })
        if(player.openInventory)inventory.openInventory(player)
    },
    getItemChoises: (player: PlayerMp, item: InventoryItemDB) => {
        let itemId = item.item_id
        return getItemChoises(itemId, item.count)
    },
    /** Количество предметов в инвентаре игрока по заданому ID предмета */
    getItemCountById: (player: PlayerMp, id: number) => {
        if (!user.isLogin(player)) return;
        let count = 0;
        let iduser = user.getId(player)
        itemsDB.forEach(item => {
            if (item.owner_id == iduser && item.owner_type == 1 && item.item_id == id) count++;
        })
        return count;
    },
    saveItem: (id: number) => {
        let itm = itemsDB.get(id);
        if (!itm) return;
        inventoryEntity.update({
            item_id: itm.item_id,
            pos_x: itm.pos_x,
            pos_y: itm.pos_y,
            pos_z: itm.pos_z,
            rot_x: itm.rot_x,
            rot_y: itm.rot_y,
            rot_z: itm.rot_z,
            owner_type: itm.owner_type,
            owner_id: itm.owner_id,
            count: itm.count,
            prefix: itm.prefix,
            number: itm.number,
            key_id: itm.key_id,
            timestamp_update: itm.timestamp_update
        }, { where: { id } })
    },
    allInventoryBlocksDataClear: () => {
        inventoryBlocksData = new Map();
    },
    deleteItemDb: (id: number) => {
        let itm = itemsDB.get(id);
        if (!itm) return false;
        inventoryBlocksData.delete(itm.owner_type+"_"+itm.owner_id);
        inventoryEntity.destroy({ where: { id } })
        itemsDB.delete(itm.id);
        return true;
    },
    loadAll: function() {
        let bags_destroy_id: { owner_type: number, owner_id: number }[] = []
        inventoryEntity.findAll({
            where: {
                [Op.or]: [
                    {
                    owner_type: 0,
                    item_id: { [Op.in]: [inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall]}
                    },
                    { item_id: inventory.types.BagTransfer }
                ],
            }
        }).then(bags => {
            bags.map(item => {
                bags_destroy_id.push({ owner_type: item.item_id, owner_id: item.id })
            })
            inventoryEntity.destroy({ where: {
                [Op.or]: [{ owner_type: 999 }, { owner_type: 0 }, { item_id: inventory.types.BagTransfer }, { item_id: -1 }, ...bags_destroy_id] 
            }}).then(() => {
                inventoryEntity.findAll().then(items => {
                    itemsDB = new Map();
                    items.forEach(itm => {
                        itemsDB.set(itm.id, {
                            id: itm.id,
                            item_id: itm.item_id,
                            pos_x: itm.pos_x,
                            pos_y: itm.pos_y,
                            pos_z: itm.pos_z,
                            rot_x: itm.rot_x,
                            rot_y: itm.rot_y,
                            rot_z: itm.rot_z,
                            owner_type: itm.owner_type,
                            owner_id: itm.owner_id,
                            count: itm.count,
                            prefix: itm.prefix,
                            number: itm.number,
                            key_id: itm.key_id,
                            timestamp_update: itm.timestamp_update
                        });
                    })
                    inventoryBlocksData = new Map();
                })
            })
        })
        
    },
    deleteWorldItems: function() {
        let time = methods.getTimeStamp()
        itemsDB.forEach(item => {
            if (item.owner_type == 0 && item.timestamp_update < (time - (60 * 60))) {
                inventory.deleteItem(item.id);
            }
        })
    },
    getItemList: function(player: PlayerMp, ownerType: number, ownerId: number) {
        return inventory.getItemListData(ownerType, ownerId)
    },
    getItemListData: function(ownerType: number, ownerId: number | string) {
        if (ownerType == 8 && (ownerId).toString() != methods.parseInt(ownerId).toString()) ownerId = methods.convertNumberToHash(ownerId)
        if (inventoryBlocksData.has(ownerType + "_" + ownerId)) return inventoryBlocksData.get(ownerType + "_" + ownerId)
        let data: InventoryItem[] = [];
        itemsDB.forEach(row => {
            if([74].includes(row.item_id)){
                return inventory.deleteItem(row.id)
            }
            if (row.owner_type == ownerType && row.owner_id == ownerId){
                let label = "";

                if (row.prefix > 0 && row.number > 0 && row.key_id <= 0) {
                    label = row.prefix + "-" + row.number;
                } else if (row.key_id > 0) {

                    if (row.item_id >= 265 && row.item_id <= 268) {

                        if (row.prefix == 1){
                            if (!enums.clothF[row.key_id]) return inventory.deleteItem(row.id);
                            label = <string>enums.clothF[row.key_id][9];
                        }
                        else {
                            if (!enums.clothM[row.key_id]) return inventory.deleteItem(row.id);
                            label = <string>enums.clothM[row.key_id][9];
                        }
                    }
                    else if (row.item_id >= 269 && row.item_id <= 273) {
                        if (row.prefix == 1){
                            if (!enums.propF[row.key_id]) return inventory.deleteItem(row.id);
                            label = <string>enums.propF[row.key_id][5];
                        }
                        else {
                            if (!enums.propM[row.key_id]) return inventory.deleteItem(row.id);
                            label = <string>enums.propM[row.key_id][5];
                        }
                    }
                    else {
                        label = "#" + row.key_id;
                    }
                }

                data.push({ id: row.id, label: label, item_id: row.item_id, count: row.count, prefix: row.prefix, number: row.number, key_id: row.key_id });
            }
        })
        inventoryBlocksData.set(ownerType + "_" + ownerId, data)

        return data
    },
    getItemListInRadius: function(player: PlayerMp, posX: number, posY: number) {


    },
    dropItem: async (player: PlayerMp, id: number, itemId: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number, model: Hash, ownerType?: number, ownerId?: number) => {
        if (!user.isLogin(player))
            return;
        try {

            if (vehicles.exists(player.vehicle)) {
                player.notify('~r~Вы находитесь в транспорте'), inventory.openInventory(player);
                return;
            }
            if (player.isJumping) {
                player.notify('~r~Вы не должны прыгать'), inventory.openInventory(player);
                return;
            }

            if (user.isCuff(player)) {
                return player.notify("~r~Вы в наручниках"), inventory.openInventory(player)
            }
            if (player.health == 0) {
                return player.notify("~r~Вы в коме"), inventory.openInventory(player)
            }

            if (itemId == 50) {
                return player.notify("~r~Банковскую карту нельзя выкинуть на землю"), inventory.openInventory(player);
            }
            if (itemId >= 138 && itemId <= 141) {
                return player.notify("~r~Пачку денег нельзя выкинуть на землю"), inventory.openInventory(player)
            }
            if(!user.isAdminNow(player, 4)){
                if (itemId == inventory.types.BagTransfer) {
                    let nearestChest = chest.canTransferBag(player)
                    if (!nearestChest) return player.notify(`~r~${items.getItemNameById(itemId)} можно выбрасывать на землю только возле склада`), inventory.openInventory(player);
                }
            }

            let item = itemsDB.get(id);
            if (!item) return;
            if (itemId == 285 && (item.owner_type != 1 || item.owner_id != user.getId(player))){
                return player.notify("~r~Устанавливать шипы можно только со своего инвентаря"), inventory.openInventory(player)
            }
            if (itemId == 285){
                if (!user.isGosPD(player)) return player.notify("~r~Устанавливать шипы могут только сотрудники гос организаций"), inventory.openInventory(player)
                player.notify('~g~Устанавливаем шипы на замлю');
                user.playScenario(player, "CODE_HUMAN_MEDIC_TEND_TO_DEAD");
                user.disableAllControls(player, true)
                await sleep(15000);
                if(!mp.players.exists(player)) return;
                user.disableAllControls(player, false);
                if (vehicles.exists(player.vehicle)) {
                    player.notify('~r~Вы находитесь в транспорте'), inventory.openInventory(player);
                    return;
                }
                if (player.isJumping) {
                    player.notify('~r~Вы не должны прыгать'), inventory.openInventory(player);
                    return;
                }

                if (user.isCuff(player)) {
                    return player.notify("~r~Вы в наручниках"), inventory.openInventory(player)
                }
                if (player.health == 0) {
                    return player.notify("~r~Вы в коме"), inventory.openInventory(player)
                }
                user.stopScenario(player);
            }
            item = itemsDB.get(id);
            if (!item) return;
            
            if (item.owner_type == 0) return player.notify("Данный предмет уже лежит на земле"), inventory.openInventory(player)
            if (!user.isAdminNow(player, 4)) {
                if (item.owner_type == inventory.types.StockFraction) return player.notify("Нельзя выбрасывать предметы со склада на землю"), inventory.openInventory(player)
                if ([inventory.types.BagTransfer, inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall].includes(item.owner_type)) return player.notify("Нельзя выбрасывать предметы с сумки на землю"), inventory.openInventory(player)
            }
            if ((item.item_id == 215 || item.item_id == 278) && item.prefix == 10) return player.notify(`~r~Данный предмет нельзя перемещать`), inventory.openInventory(player)
            if (item.item_id == inventory.types.BagFull){
                if(item.owner_type == 1 && item.owner_id != user.getId(player)){
                    return player.notify(`~r~Данный предмет нельзя отнимать`), inventory.openInventory(player)
                }
            }

            if (inventory.detectClosedInventory(player, item.owner_type, item.owner_id)) {
                player.notify(`~r~${inventory.detectClosedInventory(player, item.owner_type, item.owner_id, true)}`)
                inventory.openInventory(player)
                return;
            }

            let namedesc = inventory.getOwnerNameAndDesc(item.owner_type, item.owner_id);

            user.playAnimation(player, 'pickup_object', 'pickup_low', 8);
            if (item.owner_type == 1 && item.owner_id == user.getId(player))
                chat.sendMeCommand(player, `выкинул на землю \"${items.getItemNameById(itemId)}\"`);
            else
                chat.sendMeCommand(player, `выкинул на землю с ${namedesc.name} ${namedesc.desc} \"${items.getItemNameById(item.item_id)}\"`);

            if (item.owner_type == 1 && item.owner_id == user.getId(player))
                user.log(player, "PlayerInventoryInterraction", `Выкинул на землю ${items.getItemNameById(itemId)} с ${inventory.stringForLog(item)} @item${item.id}`)
            else
                user.log(player, "PlayerInventoryInterraction", `Выкинул на землю с ${namedesc.name} ${namedesc.desc} ${inventory.stringForLog(item)} @item${item.id}`)



            let heading = player.heading;
            let rot = new mp.Vector3(0, 0, heading);

            switch (itemId) {
                case 8:
                case 251:
                    rot = new mp.Vector3(-90, 0, heading);
                    break;
                case 282:
                    rot = new mp.Vector3(-90, 0, heading);
                    break;
                case 285:
                    rot = new mp.Vector3(0, 0, heading-180);
                    break;
            }

            if (itemId >= 54 && itemId <= 126)
                rot = new mp.Vector3(-90, 0, heading);

            let obj = mp.objects.new(model, new mp.Vector3(posX + (methods.getRandomInt(-100, 100) / 300), posY + (methods.getRandomInt(-100, 100) / 400), posZ - 0.97),
                {
                    rotation: rot,
                    alpha: 255,
                    dimension: 0
                });

            posX = obj.position.x;
            posY = obj.position.y;
            posZ = obj.position.z;

            rotX = rot.x;
            rotY = rot.y;
            rotZ = rot.z;

            props.set(id.toString(), obj);

            item.pos_x = posX;
            item.pos_y = posY;
            item.pos_z = posZ;

            item.rot_x = rot.x;
            item.rot_y = rot.y;
            item.rot_z = rot.z;

            const oldownertype = methods.parseInt(`${item.owner_type}`)
            const oldownerid = methods.parseInt(`${item.owner_id}`)

            item.owner_type = 0;
            item.owner_id = 0;

            

            inventoryBlocksData.delete(ownerType + "_" + ownerId);
            inventoryBlocksData.delete(oldownertype + "_" + oldownerid);

            inventory.saveItem(item.id);
            inventory.updateInventory(player);

            if ([inventory.types.BagTransfer, inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall].includes(item.item_id)){
                if (player) user.checkComponents(player)
                if (oldownertype == 1) {
                    let target = user.getPlayerById(oldownerid);
                    if (target) user.checkComponents(target)
                }
            }

        } catch (e) {
            methods.debug(e);
        }
    },
    // clearInventory: (ownerType: number, ownerId: number) => {
    //     itemsDB.forEach(item => {
    //         if(item.owner_type == ownerType && item.owner_id == ownerId){
    //             itemsDB.delete(item.id)
    //         }
    //     })
    //     inventoryBlocksData.delete(ownerType + "_" + ownerId);
    //     inventoryEntity.destroy({where: {
    //         owner_type: ownerType,
    //         owner_id: ownerId,
    //     }})
    // },
    updateItemOwnerSystem: function(id: number, ownerType: number, ownerId: number) {
        if (ownerType == 8 && (ownerId).toString() != methods.parseInt(ownerId).toString()) ownerId = methods.convertNumberToHash(ownerId)
        let item = itemsDB.get(id);

        if (!item) return;
        inventoryBlocksData.delete(item.owner_type + "_" + item.owner_id);
        inventoryBlocksData.delete(ownerType + "_" + ownerId);
        item.owner_type = ownerType;
        item.owner_id = ownerId;
        inventory.saveItem(item.id)
    },
    updateItemOwner: async function(player: PlayerMp, id: number, ownerType: number, ownerId: number, amount = 1, update = true) {
        if (ownerType == 8 && (ownerId).toString() != methods.parseInt(ownerId).toString()) ownerId = methods.convertNumberToHash(ownerId)
        let item = itemsDB.get(id);

        if (!item) return;
        if (user.isCuff(player)) {
            return player.notify("~r~Вы в наручниках"), inventory.openInventory(player)
        }
        if (player.health == 0) {
            return player.notify("~r~Вы в коме"), inventory.openInventory(player)
        }

        if ((item.item_id == 215 || item.item_id == 278) && item.prefix == 10) return player.notify(`~r~Данный предмет нельзя перемещать`), inventory.openInventory(player)


        if (item.item_id == inventory.types.Bag || item.item_id == inventory.types.BagFull || item.item_id == inventory.types.BagTransfer || item.item_id == inventory.types.BagSmall){
            if (ownerType == inventory.types.Bag || ownerType == inventory.types.BagFull || ownerType == inventory.types.BagTransfer || ownerType == inventory.types.BagSmall){
                return player.notify("~r~Нельзя складывать сумку в сумку"), inventory.openInventory(player);
            }
            if (inventory.getItemListData(ownerType, ownerId).find(itm => itm.item_id == inventory.types.Bag || itm.item_id == inventory.types.BagFull || itm.item_id == inventory.types.BagTransfer || itm.item_id == inventory.types.BagSmall)){
                let namedesc = inventory.getOwnerNameAndDesc(ownerType, ownerId);
                return player.notify(`~r~${namedesc.name} уже имеет сумку либо чемодан для перевозки предметов`), inventory.openInventory(player);
            }
            if (item.item_id == inventory.types.BagFull && item.owner_type == 1){
                if (user.getId(player) != item.owner_id) return player.notify(`~r~Сумку нельзя отнимать`), inventory.openInventory(player);
            }
        }

        if(item.owner_type == 0){
            if(methods.distanceToPos2D(player.position, {x: item.pos_x, y: item.pos_y}) > 5) return player.notify(`~r~Вы слишком далеко`), inventory.openInventory(player);
            if (ownerType == inventory.types.Bag || ownerType == inventory.types.BagFull || ownerType == inventory.types.BagTransfer || ownerType == inventory.types.BagSmall) {
                return player.notify("~r~С земли нельзя подбирать в сумку либо чемодан для перевозки предметов"), inventory.openInventory(player);
            }
        }

        if (item.item_id == 50 && item.owner_type == 1) {
            return player.notify("~r~Банковскую карту нельзя передавать"), inventory.openInventory(player);
        }

        if (item.item_id >= 138 && item.item_id <= 141 && item.owner_type == 1) {
            return player.notify("~r~Пачку денег нельзя передавать"), inventory.openInventory(player);
        }
        if (!user.isAdminNow(player, 4)) {
            if (item.item_id == inventory.types.BagTransfer){
                let nearestChest = chest.canTransferBag(player)
                if (!nearestChest) return player.notify(`~r~${items.getItemNameById(item.item_id)} можно перекладывать только возле склада`), inventory.openInventory(player);
            }
        }

        if(item.owner_type == inventory.types.StockFraction && ownerType == inventory.types.BagTransfer){
            if (user.getPlayerFractionRank(player) <= 11) return player.notify(`~r~Складывать предметы в ~b~${items.getItemNameById(inventory.types.BagTransfer)}~w~ можно только с 12 ранга `), inventory.openInventory(player);
        }

        if (ownerType == 999 && ownerId == 1) return player.notify(`Сюда нельзя класть предметы`), inventory.openInventory(player); 
        if (!user.isAdminNow(player, 4)) {
            if (item.owner_type != 999 || item.owner_id != 1){
                if (item.owner_type == inventory.types.BagTransfer || ownerType == inventory.types.BagTransfer){
                    let nearestChest = chest.canTransferBag(player)
                    if (!nearestChest) return player.notify(`~r~Действие доступно только возле склада`), inventory.openInventory(player);
                    if ((item.owner_type == inventory.types.BagTransfer && ownerType != inventory.types.StockFraction) || (ownerType == inventory.types.BagTransfer && item.owner_type != inventory.types.StockFraction)) return player.notify(`~r~${items.getItemNameById(inventory.types.BagTransfer)} предназначен для перевозки предметов в склад`), inventory.openInventory(player);
                }
            }
        }


        if (item.item_id == inventory.types.Bag){
            if(((items.getItemWeightById(item.item_id) + inventory.currentAmount(inventory.types.Bag, item.id)) + inventory.currentAmount(ownerType, ownerId)) > inventory.maxAmount(ownerType, ownerId))
            return player.notify(`~r~Сумка слишком тяжёлая`), inventory.openInventory(player)
        } else if(ownerType == inventory.types.Bag){
            let bagitem = itemsDB.get(ownerId)
            if(bagitem.owner_type > 0){
                if(((items.getItemWeightById(item.item_id) * amount) + inventory.currentAmount(bagitem.owner_type, bagitem.owner_id)) > inventory.maxAmount(bagitem.owner_type, bagitem.owner_id))
                return player.notify(`~r~Сумка станет слишком тяжёлая`), inventory.openInventory(player)
            }
        }

        if (item.item_id == 285 && item.owner_type == 0) {
            if (!user.isGosPD(player)) return player.notify(`~r~Поднимать шипы могут только сотрудники гос организаций`);
        }

        const oldownertype = methods.parseInt(`${item.owner_type}`)
        const oldownerid = methods.parseInt(`${item.owner_id}`)

        if (amount > 1 && (oldownertype == 0 || ownerType == 0)) return player.notify("~r~Выбрасывать на землю и подбирать с неё можно только по одному предмету"), inventory.openInventory(player);
        if (amount > 15) return player.notify("~r~Не более 15 предметов за раз"), inventory.openInventory(player);

        if (inventory.detectClosedInventory(player, item.owner_type, item.owner_id)) {
            let namedesc = inventory.getOwnerNameAndDesc(item.owner_type, item.owner_id);
            return player.notify(`~r~~s~${namedesc.name} ~r~${inventory.detectClosedInventory(player, item.owner_type, item.owner_id, true)}`), inventory.openInventory(player)
        }
        let notaccessOther = inventory.detectClosedInventory(player, ownerType, ownerId)
        if (notaccessOther && update) {
            if (user.getId(player) == item.owner_id && item.owner_type == 1 && ownerType) {
                let target = user.getPlayerById(ownerId)
                if (target) {
                    amount = 1;
                    notaccessOther = !(await user.accept(target, "Принять x" + amount + " " + items.getItemNameById(item.item_id)))
                    if (notaccessOther) return player.notify(`~r~Игрок отказался принять x${amount} ${items.getItemNameById(item.item_id)}`)
                }
            }
        }
        if (notaccessOther) {
            let namedesc = inventory.getOwnerNameAndDesc(ownerType, ownerId);
            return player.notify(`~r~~s~${namedesc.name} ~r~${inventory.detectClosedInventory(player, ownerType, ownerId, true)}`), inventory.openInventory(player)
        }

        if (item.owner_type == inventory.types.StockFraction && ownerType != inventory.types.BagTransfer) {
            if (amount > 1) return player.notify(`~r~Брать со склада можно только по одному предмету`), inventory.openInventory(player);

            let chestItem = chest.at(item.owner_id)
            if (!chestItem) return player.notify(`~r~Возникла ошибка при определении склада`)
            if (!chestItem.canTakeItem(player, item.item_id) && !user.isAdminNow(player, 6)) return player.notify(`~r~Вы не можете брать этот предмет. Либо ваш ранг недостаточно высок, либо вы превысили лимит.`);
            if (!user.isAdminNow(player, 6) && !user.isLeader(player)) chestItem.addTimerAmount(player, item.item_id);
            user.log(player, "ChestLog", 'Взял ' + items.getItemNameById(item.item_id) + ' со склада ' + chestItem.name + ', фракция ' + chestItem.settings.fraction)
            methods.saveFractionLog(
                user.getRpName(player),
                'Взял ' + items.getItemNameById(item.item_id) + ' со склада ' + chestItem.name,
                chestItem.settings.fraction
            );
        }

        if (amount > 1) {
            let namedesc = inventory.getOwnerNameAndDesc(ownerType, ownerId);
            if (inventory.maxAmount(ownerType, ownerId) < (inventory.currentAmount(ownerType, ownerId) + (items.getItemWeightById(item.item_id) * amount))) {
                return player.notify(`~r~~s~${namedesc.name} ~r~не может вместить все предметы`), inventory.openInventory(player)
            }
            let list = inventory.getItemListData(oldownertype, oldownerid);
            let maxamount = methods.parseInt(`${amount}`);
            let countTransfer = 0;

            list.map(itemq => {
                if (itemq.item_id == item.item_id && maxamount > 0) {
                    inventory.updateItemOwner(player, itemq.id, ownerType, ownerId, 1, false)
                    countTransfer++;
                    maxamount--;
                }
            })
            if (countTransfer > 0) {

                let namedescold = inventory.getOwnerNameAndDesc(oldownertype, oldownerid);
                user.playAnimation(player, 'mp_common', 'givetake1_a', 48);
                if (oldownertype == 1 && oldownerid == user.getId(player))
                    chat.sendMeCommand(player, `взял с ${namedescold.name} ${namedescold.desc} x${countTransfer} ${items.getItemNameById(item.item_id)}`);
                else
                    chat.sendMeCommand(player, `положил с ${namedescold.name} ${namedescold.desc} в ${namedesc.name} ${namedesc.desc} x${countTransfer} ${items.getItemNameById(item.item_id)}`);


                    if(ownerType == inventory.types.StockFraction){
                        let chestitem = chest.at(<number>ownerId)
                        user.log(player, "ChestLog", 'Положил на склад x' + amount + ' ' + chestitem.name + ' ' + items.getItemNameById(item.item_id) + chestitem.settings.fraction)
                        methods.saveFractionLog(
                            user.getRpName(player),
                            'Положил на склад x' + amount + ' ' + chestitem.name + ' ' + items.getItemNameById(item.item_id),
                            chestitem.settings.fraction
                        );
                    }

            }
            inventory.updateInventory(player);
            return;
        } else {
            if (ownerType == inventory.types.StockFraction) {
                let chestitem = chest.at(<number>ownerId)
                methods.saveFractionLog(
                    user.getRpName(player),
                    'Положил на склад ' + chestitem.name + ' ' + items.getItemNameById(item.item_id),
                    chestitem.settings.fraction
                );
            }
        }


        if(oldownertype >= inventory.types.UserStock && oldownertype <= inventory.types.UserStockMax) stock.addLog(user.getRpName(player), "TAKE: "+items.getItemNameById(item.item_id), oldownerid)
        else if(ownerType >= inventory.types.UserStock && ownerType <= inventory.types.UserStockMax) stock.addLog(user.getRpName(player), "DROP: "+items.getItemNameById(item.item_id), ownerId)



        if (updateBlock.has(id)) {
            if (update) inventory.openInventory(player);
            return
        }

        if (update) {
            if (inventory.maxAmount(ownerType, ownerId) < (inventory.currentAmount(ownerType, ownerId) + items.getItemWeightById(item.item_id))) {
                let namedesc = inventory.getOwnerNameAndDesc(ownerType, ownerId);
                return player.notify(`~r~~s~${namedesc.name} ~r~переполнен`), inventory.openInventory(player)
            }
        }
        item.owner_type = ownerType;
        item.owner_id = ownerId;
        inventoryBlocksData.delete(ownerType + "_" + ownerId);
        inventoryBlocksData.delete(oldownertype + "_" + oldownerid);
        if (update) {
            let namedesc = inventory.getOwnerNameAndDesc(ownerType, ownerId);
            if (oldownertype == 0 && update) {
                user.playAnimation(player, 'pickup_object', 'pickup_low', 8);
                if (ownerType == 1 && ownerId == user.getId(player))
                    chat.sendMeCommand(player, `поднял с земли \"${items.getItemNameById(item.item_id)}\"`);
                else
                    chat.sendMeCommand(player, `положил с земли в ${namedesc.name} \"${items.getItemNameById(item.item_id)}\"`);

                if (ownerType == 1 && ownerId == user.getId(player))
                    user.log(player, "PlayerInventoryInterraction", `поднял с земли ${inventory.stringForLog(item)} \"${items.getItemNameById(item.item_id)}\"`);
                else
                    user.log(player, "PlayerInventoryInterraction", `положил с земли в ${namedesc.name} ${inventory.stringForLog(item)} \"${items.getItemNameById(item.item_id)}\"`);

            }
            if (oldownertype != 0 && update) {
                let namedescold = inventory.getOwnerNameAndDesc(oldownertype, oldownerid);
                user.playAnimation(player, 'mp_common', 'givetake1_a', 48);
                if (ownerType == 1 && ownerId == user.getId(player))
                    chat.sendMeCommand(player, `взял с ${namedescold.name} ${namedescold.desc} ${namedesc.desc != user.getRpName(player) ? `в ${namedesc.name} ${namedesc.desc} ` : ``}\"${items.getItemNameById(item.item_id)}\"`);
                else
                    chat.sendMeCommand(player, `положил ${namedescold.desc != user.getRpName(player) ? `с ${namedescold.name} ${namedescold.desc} ` : ``}в ${namedesc.name} ${namedesc.desc} \"${items.getItemNameById(item.item_id)}\"`);

                if (ownerType == 1 && ownerId == user.getId(player))
                    user.log(player, "PlayerInventoryInterraction", `взял с ${inventory.stringForLog(oldownertype, oldownerid)} ${namedescold.name} ${namedescold.desc} ${namedesc.desc != user.getRpName(player) ? `в ${namedesc.name} ${namedesc.desc} ${inventory.stringForLog(item)} ` : ``}\"${items.getItemNameById(item.item_id)}\"`);
                else
                    user.log(player, "PlayerInventoryInterraction", `положил ${namedescold.desc != user.getRpName(player) ? `с ${inventory.stringForLog(oldownertype, oldownerid)} ${namedescold.name} ${namedescold.desc} ` : ``}в ${namedesc.name} ${namedesc.desc} ${inventory.stringForLog(item)} \"${items.getItemNameById(item.item_id)}\"`);
            }
            if (oldownertype == inventory.types.BagTransfer){
                if (inventory.currentAmount(inventory.types.BagTransfer, oldownerid) == 0){
                    let itmtransferbag = itemsDB.get(oldownerid);
                    if (itmtransferbag.owner_type == 1){
                        setTimeout(() => {
                            let targetPl = user.getPlayerById(itmtransferbag.owner_id);
                            if(targetPl) user.checkComponents(targetPl)
                        }, 1000)
                    }
                    inventory.deleteItem(oldownerid)
                }
            }
        }

        updateBlock.set(id, true)
        setTimeout(() => {
            updateBlock.delete(id)
        }, 300)

        inventory.saveItem(id);

        if(update){
            if (item.item_id == inventory.types.Bag || item.item_id == inventory.types.BagFull || item.item_id == inventory.types.BagTransfer || item.item_id == inventory.types.BagSmall){
                if(ownerType == 1){
                    let target = user.getPlayerById(ownerId);
                    if(target) user.checkComponents(target)
                }
                if(oldownertype == 1){
                    let target = user.getPlayerById(oldownerid);
                    if(target) user.checkComponents(target)
                }
            }
        }

        if (oldownertype == inventory.types.World) {
            inventory.deleteDropItem(id);
        }
        if (update) inventory.updateInventory(player);

    },
    updateItemCount: function(id: number, count: number) {
        let item = itemsDB.get(id);
        if (!item) return;
        if (updateBlock.has(id)) return;
        updateBlock.set(id, true)
        setTimeout(() => {
            updateBlock.delete(id)
        }, 300)
        item.count = count;
        inventoryBlocksData.delete(item.owner_type + "_" + item.owner_id);
        inventory.saveItem(item.id);
    },
    updateAmount: function(player: PlayerMp, ownerId: number, ownerType: number) { // Фикс хуйни, котороая просто поломала все, заметочка никогда не писать код когда ты очень сильно хочешь спать.

        if (!user.isLogin(player))
            return;

        let data = new Map();
        //console.log(ownerId, ownerType, "update <");

        let rows: InventoryItemDB[] = [];
        itemsDB.forEach(item => {
            if (item.owner_type == ownerType && item.owner_id == ownerId) rows.push(item);
        })
        rows.forEach(row => {
            data.set(row.id.toString(), row.item_id);
        });
        try {
            player.call('client:sendToPlayerItemListUpdateAmountMenu', [Array.from(data), ownerType, ownerId]);
        }
        catch (e) {
            methods.debug(e);
        }
    },
    deleteDropItem: function(id: number) {
        try {
            let entity = props.get(id.toString());
            if (mp.objects.exists(entity))
                entity.destroy();
        } catch (e) {
            methods.debug(e);
        }
    },
    reloadInventoryEntity: (owner_type:number, owner_id:number) => {
        inventoryBlocksData.delete(owner_type + "_" + owner_id)
    },
    deleteItem: function(id: number) {
        try {
            let item = itemsDB.get(id);
            if (item) inventoryBlocksData.delete(item.owner_type + "_" + item.owner_id), inventory.deleteItemDb(item.id)
            inventory.deleteDropItem(id);
        } catch (e) {
            methods.debug(e);
        }
    },
    createManyItem: async (
        /** ID предмета */
        itemId: number, 
        /** Параметр количества у предмета (патроны в коробке и т.д.) */
        count: number, 
        /** Владелец (тип) */
        ownerType: number, 
        /** Владелец (id) */
        ownerId: number, times = 1,
        key = -1, prefix = -1) => {
        if (!items.itemExist(itemId)) return;
        let q:any[] = [];
        let conf = items.getDefaultCount(itemId)
        let time = methods.getTimeStamp()
        for (let i = 0; i < times; i++) q.push({
            item_id: itemId,
            owner_type: ownerType,
            owner_id: ownerId,
            count: count > 0 ? count : conf,
            prefix: prefix,
            number: -1,
            key_id: key,
            timestamp_update: time,
        })
        let item = await inventoryEntity.bulkCreate(q).then(res => {
            res.map(item => {
                itemsDB.set(item.id, item);
            })
            inventoryBlocksData.delete(ownerType + "_" + ownerId);
        })
        return true;
    },
    createItem: async (
        /** ID предмета */
        itemId: number, 
        /** Параметр количества у предмета (патроны в коробке и т.д.) */
        count: number, 
        /** Владелец (тип) */
        ownerType: number, 
        /** Владелец (id) */
        ownerId: number, 
        prefix: number = -1, 
        number: number = -1, 
        keyId: number = -1
        ) => {
        if (!items.itemExist(itemId)) return;
        let conf = items.getDefaultCount(itemId)
        let item = await inventoryEntity.create({
            item_id: itemId,
            owner_type: ownerType,
            owner_id: ownerId,
            count: count > 0 ? count : conf,
            prefix: prefix,
            number: number,
            key_id: keyId,
            timestamp_update: methods.getTimeStamp(),
        })
        itemsDB.set(item.id, item);
        inventoryBlocksData.delete(ownerType + "_" + ownerId);
        return item
    },
    addItem: async function(player: PlayerMp, itemId: number, count: number, ownerType: number, ownerId: number, countItems: number, prefix: number = -1, number: number = -1, keyId: number = -1) {
        if(itemId == -1) return false;
        if(count <= 0) return false;
        if (!items.itemExist(itemId)) return;
        let q: any[] = [];
        for (let i = 0; i < count; i++) q.push({
            item_id: itemId,
            owner_type: ownerType,
            owner_id: ownerId,
            count:countItems,
            prefix,
            number,
            key_id: keyId,
            timestamp_update: methods.getTimeStamp(),
        })
        let item = await inventoryEntity.bulkCreate(q).then(res => {
            res.map(item => {
                itemsDB.set(item.id, item);
            })
            inventoryBlocksData.delete(ownerType + "_" + ownerId);
        })

        // for (let i = 0; i < count; i++) {
        //     let item = await inventoryEntity.create({
        //         item_id: itemId,
        //         owner_type: ownerType,
        //         owner_id: ownerId,
        //         count: countItems,
        //         prefix: prefix,
        //         number: number,
        //         key_id: keyId,
        //         timestamp_update: methods.getTimeStamp(),
        //     })
        //     itemsDB.set(item.id, item);
        // }
        // inventoryBlocksData.delete(ownerType + "_" + ownerId);
        return true;
    },
    addWorldItem: function(player: PlayerMp, itemId: number, count: number, ownerType: number, ownerId: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number, model: Hash, countItems: number, prefix: number, number: number, keyId: number) {
        if(itemId == -1) return false;
        if(count <= 0) return false;
        if (!user.isLogin(player))
            return;
        try {
            let currentTimestamp = methods.getTimeStamp();
            const heading = player.heading;
            for (let i = 0; i < count; i++) {



                inventoryEntity.create({
                    item_id: itemId,
                    owner_type: ownerType,
                    owner_id: ownerId,
                    count: countItems,
                    prefix: prefix,
                    number: number,
                    key_id: keyId,
                    timestamp_update: currentTimestamp,
                    pos_x: posX,
                    pos_y: posY,
                    pos_z: posZ,
                    rot_x: rotX,
                    rot_y: rotY,
                    rot_z: rotZ,
                }).then(item => {
                    if(mp.players.exists(player)) user.log(player, "PlayerInventoryInterraction", `Выбросил предмет @item_id${itemId} ${items.getItemNameById(itemId)} @inventorytype${ownerType} @inventoryid${ownerId} на землю, параметры posX: ${posX} , posY: ${posY} , posZ : ${posZ} , countItems : ${countItems}`)
                    itemsDB.set(item.id, item);
                    posX = posX + methods.getRandomInt(-1, 1);

                    posY = posY + methods.getRandomInt(-1, 1);
                    posZ = posZ + 0.1;

                    let rot = new mp.Vector3(0, 0, heading);

                    switch (itemId) {
                        case 8:
                        case 251:
                            rot = new mp.Vector3(-90, 0, heading);
                            break;
                    }

                    if (itemId >= 54 && itemId <= 126)
                        rot = new mp.Vector3(-90, 0, heading);

                    let obj = mp.objects.new(model, new mp.Vector3(posX + (methods.getRandomInt(-100, 100) / 300), posY + (methods.getRandomInt(-100, 100) / 400), posZ - 0.98),
                        {
                            rotation: rot,
                            alpha: 255,
                            dimension: 0
                        });

                    posX = obj.position.x;
                    posY = obj.position.y;
                    posZ = obj.position.z;

                    rotX = rot.x;
                    rotY = rot.y;
                    rotZ = rot.z;

                    props.set(item.id.toString(), obj);
                    return;
                })

            }
        } catch (e) {
            methods.debug(e);
        }
    },
    calculatePlayerInvAmountMax: (player: PlayerMp) => {
        return 45100 + user.get(player, 'mp0_strength') * 100;
    },
    currentAmount: (type: number, id: number | string) => {
        if (type == 8 && (id).toString() != methods.parseInt(id).toString()) id = methods.convertNumberToHash(id);
        let list = inventory.getItemListData(type, id);
        let weight = 0;
        list.map(item => {
            weight += items.getItemWeightById(item.item_id)
            if (item.item_id == inventory.types.Bag) weight += inventory.currentAmount(inventory.types.Bag, item.id)
        })
        return weight;
    },
    maxAmount: (type: number, id: number | string, veh?:VehicleMp) => {
        if (type == 1) {
            if (user.getPlayerById(<number>id)) {
                return inventory.calculatePlayerInvAmountMax(user.getPlayerById(<number>id))
            } else {
                return 50000
            }
        } else if (type == 8) {
            // let veh = vehicles.findVehicleByNumber(<string>id)
            if(!veh) veh = mp.vehicles.toArray().find(vehs => vehs.numberPlate == id || methods.convertNumberToHash(vehs.numberPlate) == id)
            if (!veh) return 0;
            let vInfo = vehicleInfo.findByVeh(veh);
            if (!vInfo) return 100000;
            return vInfo.stock
        } else if (type == 999) {
            return 0
        } else if (type == inventory.types.Fridge) {
            if (id as number <= 100000){
                let houseData = houses.getHouseData(id as number);
                if (!houseData) return stockSize.Fridge;
                return houseFridgeAmount[houseData.get('chest')]
            } else {
                return stockSize.Fridge;
            }
        // } else if (type == inventory.types.Fridge) {
        //     return stockSize.Fridge
        } else if (type == inventory.types.Bag) {
            return stockSize.Bag
        } else if (type == inventory.types.BagFull) {
            return stockSize.BagFull
        } else if (type == inventory.types.BagSmall) {
            return stockSize.BagSmall
        } else if (type == inventory.types.BagTransfer) {
            return stockSize.BagTransfer
        } else if (type == inventory.types.StockFraction) {
            let inv = chest.at(<number>id)
            if(!inv) return 0;
            return inv.settings.weight
        } else if (type >= inventory.types.UserStock && type <= inventory.types.UserStockMax) {
            let tid = type - 11;
            if (tid == 1 || tid == 2) return stockSize.PrivateSafe
            if (tid >= 3 && tid <= 6) return stockSize.BigWoodBox
            if ((tid >= 7 && tid <= 12) || tid == 0) return stockSize.SmallWoodBox
        } else {
            return 0
        }
    },
    ammoItemIdToMaxCount: ammoItemIdToMaxCountUtil,
    getInvAmount: function(player: PlayerMp, id: number, type: number) {
        return inventory.currentAmount(type, id);
    },
    getInvAmountMax: function(player: PlayerMp, id: number, type: number) {
        return inventory.maxAmount(type, id);
    },
    getListOfEquipWeapons: function(player: PlayerMp) {
        if (!user.isLogin(player))
            return;
        try {
            let table = new Map();
            for (let n = 54; n < 138; n++) {
                weapons.hashes.forEach((item) => {
                    if (item[0] !== items.getItemNameHashById(n)) return;
                    let ammo = player.getWeaponAmmo(item[1]);
                    if (!ammo) return;

                    table.set(n, [item[0], ammo]);
                });
            }
            player.call('client:showWeaponsInMenu', [Array.from(table)]);
        } catch (e) {
            methods.debug(e);
        }
    },
    useItem: async function(player: PlayerMp, id: number, itemId: number) {
        if (!user.isLogin(player))
            return;
        try {
            let user_id = user.getId(player);
            let item = user.getItemById(player, id)
            if (!item) return player.notify("~r~У вас нет данного предмета в инвентаре");
            if (item.item_id != itemId) return player.notify("~r~Попытка вызова действия другого предмета");
            switch (itemId) {
                case 50: {
                    if (user.get(player, 'bank_prefix') == 0) {
                        player.notify('~r~У Вас нет банковского счёта. Оформите в любом отделении');
                        return;
                    }
                    let sum = item.count;
                    inventory.deleteItem(id);
                    user.addBankMoney(player, sum);
                    user.notify(player, '~g~Денежные средства поступили вам на счёт')
                    break;
                }
                case 252: {
                    let ch = chest.getNearest(player, 5, true)
                    if (!ch || !fractionUtil.getFraction(ch.settings.fraction).gos || !user.isGos(player)) return player.notify(`~r~Использовать ${items.getItemNameById(itemId)} можно только возле гос склада`), inventory.openInventory(player);
                    if (player.armour == 100) return player.notify(`~r~На вас уже есть целый бронежилет`), inventory.openInventory(player);
                    player.armour = 100;
                    inventory.deleteItem(id);
                    inventory.updateInventory(player);
                    player.notify(`~g~Вы использовали бронежилет`)
                    user.log(player, "PlayerInventoryInterraction", "Экипировал " + items.getItemNameById(itemId))
                    break;
                }
                case 6:
                    {
                        let veh = methods.getNearestVehicleWithCoords(player.position, 5);
                        if (!mp.vehicles.exists(veh)) return player.notify("~r~Поблизости нет ТС");
                        const heading = veh.heading + 180;
                        // player.heading = heading+90;
                        const attach = methods.calculateAttachPosition(veh.position, veh.rotation, new mp.Vector3(((user.getSex(player) == 1) ? -1.8 : -1.5), 0, 0))
                        // player.position = new mp.Vector3(attach.x, attach.y, player.position.z)
                        user.playScenario(player, ((user.getSex(player) == 1) ? "CODE_HUMAN_MEDIC_TEND_TO_DEAD" : "WORLD_HUMAN_VEHICLE_MECHANIC"), attach.x, attach.y, player.position.z, ((user.getSex(player) == 1) ? heading + 90 : heading - 90), false);
                        user.disableAllControls(player, true);
                        if (!user.getItemById(player, id)) return player.notify("~r~У вас нет данного предмета в инвентаре");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        setTimeout(() => {
                            if (!mp.players.exists(player)) return;
                            user.stopScenario(player)
                            user.disableAllControls(player, false);
                            if (!mp.vehicles.exists(veh)) return player.notify("~r~ТС не обнаружен");
                            if (player.dist(veh.position) > 7) return player.notify("~r~ТС слишком далеко");
                            veh.repair();
                            player.notify("~r~ТС отремонтирован");
                        }, 15000)
                        break;
                    }
                case 0:
                    {
                        let nplayer = methods.getNearestPlayerWithPlayer(player, 1.5);
                        if (!user.isLogin(nplayer)) {
                            player.notify("~r~Рядом с вами никого нет");
                            inventory.openInventory(player);
                            return;
                        }

                        if (nplayer.getVariable("isTie")) {
                            user.unTie(nplayer)
                            player.notify("~y~Вы развязали игрока");
                            chat.sendMeCommand(player, "развязал человека рядом");
                            inventory.addItem(player, itemId, 1, inventory.types.Player, user_id, 1, -1, -1, -1);
                        }
                        else {
                            if (!nplayer.getVariable("isKnockout")) {
                                player.notify("~r~Игрок должен быть в нокауте");
                                inventory.openInventory(player);
                                return;
                            }

                            if (user.isCuff(nplayer) || user.isTie(nplayer)) {
                                player.notify("~r~Этот человек уже в связан/в наручниках");
                                inventory.openInventory(player);
                                return;
                            }
                            user.tie(nplayer);
                            player.notify("~y~Вы связали игрока");
                            chat.sendMeCommand(player, "связал человека рядом");
                            inventory.deleteItem(id);
                            inventory.updateInventory(player)
                        }
                        break;
                    }
                case 1:
                    {
                        let nplayer = methods.getNearestPlayerWithPlayer(player, 1.5);
                        if (!user.isLogin(nplayer)) {
                            player.notify("~r~Рядом с вами никого нет");
                            inventory.openInventory(player)
                            return;
                        }
                        if (nplayer.getVariable("isTieBandage")) {
                            user.unTieBandage(nplayer);
                            player.notify("~y~Вы сняли мешок с головы");
                            chat.sendMeCommand(player, "снял мешок с головы человеку рядом");
                            inventory.addItem(player, itemId, 1, inventory.types.Player, user_id, 1, -1, -1, -1);
                        }
                        else {
                            if (!nplayer.getVariable("isTie")) {
                                player.notify("~r~Игрок должен быть связан");
                                inventory.openInventory(player)
                                return;
                            }

                            user.tieBandage(nplayer);
                            player.notify("~y~Вы надели мешок на голову");
                            chat.sendMeCommand(player, "надел мешок на голову человеку рядом");
                            inventory.deleteItem(id);
                            inventory.updateInventory(player)
                        }
                        break;
                    }
                case 253:
                    {
                        inventory.openInventory(player)
                        return player.notify("~r~Игра в кости только в казино")
                        chat.sendDiceCommand(player);
                        break;
                    }
                case 251:
                    {
                        player.call('client:startFishing');
                        break;
                    }
                case 2:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            return;
                        }
                        user.healProtect(player)
                        chat.sendMeCommand(player, "употребил кокаин");
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 1, 30);
                        user.playDrugAnimation(player);

                        user.set(player, 'useHeal', true);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 158:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил амфетамин");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 0, 30);
                        user.playDrugAnimation(player);

                        user.set(player, 'useHeal', true);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 159:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил DMT");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 2, 30);
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 160:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил мефедрон");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 5, 30);
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 161:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил кетамин");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 3, 30);
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 162:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять наркотики');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил LSD");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.addDrugLevel(player, 4, 30);
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 3:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять аптечки');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "употребил марихуану");
                        user.healProtect(player)
                        if (player.health <= 90)
                            player.health = player.health + 10;
                        else
                            player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 5000);
                        break;
                    }
                case 4:
                    {

                        let veh = methods.getNearestVehicleWithCoords(player.position, 10);
                        if (!vehicles.exists(veh)) {
                            player.notify("~r~Нужно быть рядом с машиной");
                            inventory.openInventory(player)
                            return;
                        }

                        let vehInfo = methods.getVehicleInfo(veh.model);
                        if (vehInfo.fuel_min == 0) {
                            player.notify("~r~Электрокары можно взломать только с спец.отмычками");
                            return;
                        }

                        if (vehInfo.class_name == "Super") {
                            player.notify("~r~Спорткары можно взломать только с спец.отмычками");
                            return;
                        }

                        if (vehInfo.class_name == "Helicopters" || vehInfo.class_name == "Planes" || vehInfo.class_name == "Emergency") {
                            player.notify("~r~Вы не можете взломать это транспортное средство");
                            return;
                        }

                        if (!veh.locked) {
                            player.notify("~r~Транспорт уже открыт");
                            return;
                        }
                        if (user.has(player, 'usingLockpick')) {
                            player.notify("~r~Вы уже используете отмычку");
                            return;
                        }
                        user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
                        user.set(player, 'usingLockpick', true);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        let chance = methods.getRandomInt(0, 5) == 1
                        if (!chance) {
                            inventory.deleteItem(id);
                            inventory.updateInventory(player)
                        } else {
                            inventory.openInventory(player)
                        }
                        setTimeout(function() {
                            try {

                                if (!user.isLogin(player))
                                    return;

                                if (!vehicles.exists(veh)) {
                                    player.notify("~r~Не удалось взломать транспорт");
                                    user.reset(player, 'usingLockpick');
                                    return;
                                }

                                if (chance) {
                                    veh.locked = false;
                                    player.notify("~g~Вы открыли транспорт");
                                    inventory.updateInventory(player);
                                }
                                else {
                                    player.notify("~r~Вы сломали отмычку");
                                }
                                user.reset(player, 'usingLockpick');
                            }
                            catch (e) {
                                methods.debug(e);
                            }
                        }, 25000);
                        break;
                    }
                case 5:
                    {
                        if (vehicles.exists(player.vehicle)) {
                            player.notify("~r~Вы должны находиться около открытого капота");
                            inventory.openInventory(player)
                            return;
                        }
                        let veh = methods.getNearestVehicleWithCoords(player.position, 10);
                        if (veh == null) {
                            player.notify("~r~Нужно быть рядом с машиной");
                            inventory.openInventory(player)
                            return;
                        }

                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        player.notify("~g~Вы залили масло в транспорт");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        break;
                    }
                case 6:
                    {
                        if (vehicles.exists(player.vehicle)) {
                            player.notify("~r~Вы должны находиться около открытого капота");
                            inventory.openInventory(player)
                            return;
                        }
                        let veh = methods.getNearestVehicleWithCoords(player.position, 10)
                        if (veh == null) {
                            player.notify("~r~Нужно быть рядом с машиной");
                            inventory.openInventory(player)
                            return;
                        }

                        if (veh.engineHealth < 750.0) {
                            player.notify("~r~Вы не можете сами починить авто, вызывайте механика");
                            inventory.openInventory(player)
                            return;
                        }
                        if (veh.engineHealth >= 999) {
                            player.notify("~r~Автомобиль не поврежден");
                            inventory.openInventory(player)
                            return;
                        }

                        veh.engineHealth = 1000.0;
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        player.notify("~g~Вы успешно починили авто");
                        inventory.updateInventory(player)
                        inventory.deleteItem(id);
                        break;
                    }
                case 7:
                    {
                        inventory.openInventory(player)
                        player.notify(`~g~Ваш ID:~s~ ${user_id}`);
                        if (user.get(player, "jail_time") > 0)
                            player.notify(`~g~Время в тюрьме:~s~ ${user.get(player, "jail_time")} сек.`);
                        /*if (user.IsMuted())
                            player.notify(`~g~Время окончания мута:~s~ ${Main.UnixTimeStampToDateTime(user.Data.date_mute)}`); Заглушечка/Не думаю что нужно будет, оставим до лучших времен */
                        break;
                    }
                case 9:
                    {
                        if (vehicles.exists(player.vehicle)) {
                            player.notify("~r~Вы должны находиться около транспорта");
                            inventory.openInventory(player)
                            return;
                        }
                        let veh = methods.getNearestVehicleWithCoords(player.position, 10);
                        if (!vehicles.exists(veh)) {
                            player.notify("~r~Нужно быть рядом с машиной");
                            inventory.openInventory(player)
                            return;
                        }

                        let vehInfo = methods.getVehicleInfo(veh.model);
                        let currentFuel = vehicles.getFuel(veh);

                        if (vehInfo.fuel_full < currentFuel + 10) {
                            vehicles.setFuel(veh, vehInfo.fuel_full);
                            player.notify("~r~Полный бак");
                            inventory.openInventory(player)
                            return;
                        }

                        /*if (Managers.Vehicle.VehicleInfoGlobalDataList[vehId].FullFuel < Managers.Vehicle.VehicleInfoGlobalDataList[vehId].Fuel + 10)
                        {
                            Managers.Vehicle.VehicleInfoGlobalDataList[vehId].Fuel = Managers.Vehicle.VehicleInfoGlobalDataList[vehId].FullFuel;
                            player.notify("~g~Вы залили полный бак");
                            return;
                        } Очень странная логика, тк проверка такая же, мб я что то не понимаю.*/

                        vehicles.setFuel(veh, currentFuel + 10);

                        player.notify("~g~Вы заправили авто на 10л.");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        break;
                    }
                case 63:
                    {
                        if (vehicles.exists(player.vehicle)) {
                            player.notify("~r~Вы в автомобиле");
                            inventory.openInventory(player)
                            return;
                        }

                        break;
                    }
                case 232:
                case 234:
                case 236:
                case 238:
                    {
                        user.addEatLevel(player, 800);
                        chat.sendMeCommand(player, "съедает мясо");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 246:
                case 247:
                case 248:
                case 249:
                case 250:
                    {
                        user.addEatLevel(player, 850);
                        chat.sendMeCommand(player, "съедает рыбу");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 237:
                case 239:
                    {
                        user.addEatLevel(player, 500);
                        chat.sendMeCommand(player, "съедает мясо");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 240:
                    {
                        user.addEatLevel(player, 100);
                        chat.sendMeCommand(player, "съедает мясо");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 233:
                    {
                        user.addEatLevel(player, 1500);
                        chat.sendMeCommand(player, "съедает мясо");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 235:
                    {
                        user.addEatLevel(player, 1000);
                        chat.sendMeCommand(player, "съедает мясо");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 10:
                    {
                        user.addEatLevel(player, 40);
                        chat.sendMeCommand(player, "съедает жвачку");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 11:
                    {
                        user.removeWaterLevel(player, 10);
                        user.addEatLevel(player, 190);
                        chat.sendMeCommand(player, "съедает батончик");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 12:
                    {
                        user.removeWaterLevel(player, 20);
                        user.addEatLevel(player, 160);
                        chat.sendMeCommand(player, "съедает чипсы");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 13:
                    {
                        user.removeWaterLevel(player, 5);
                        user.addEatLevel(player, 320);
                        chat.sendMeCommand(player, "съедает роллы");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 14:
                    {
                        user.removeWaterLevel(player, 7);
                        user.addEatLevel(player, 380);
                        chat.sendMeCommand(player, "съедает гамбургер");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 15:
                    {
                        user.removeWaterLevel(player, 5);
                        user.addEatLevel(player, 420);
                        chat.sendMeCommand(player, "съедает салат");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 16:
                    {
                        user.removeWaterLevel(player, 10);
                        user.addEatLevel(player, 550);
                        chat.sendMeCommand(player, "съедает пиццу");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 17:
                    {
                        user.removeWaterLevel(player, 8);
                        user.addEatLevel(player, 780);
                        chat.sendMeCommand(player, "съедает жаркое");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 18:
                    {
                        user.removeWaterLevel(player, 10);
                        user.addEatLevel(player, 850);
                        chat.sendMeCommand(player, "съедает кесадильи");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 19:
                    {
                        user.removeWaterLevel(player, 10);
                        user.addEatLevel(player, 1100);
                        chat.sendMeCommand(player, "съедает фрикасе");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 20:
                    {
                        //user.AddHealthLevel(5); Заглушечка
                        user.addWaterLevel(player, 20);
                        user.addEatLevel(player, 220);
                        chat.sendMeCommand(player, "съедает фрукты");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 32:
                    {
                        user.addWaterLevel(player, 100);
                        user.addEatLevel(player, 900);
                        chat.sendMeCommand(player, "съедает сухпаёк");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playEatAnimation(player);
                        break;
                    }
                case 21:
                    {
                        user.addWaterLevel(player, 100);
                        chat.sendMeCommand(player, "выпивает бутылку воды");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 22:
                    {
                        /*if (user.GetTempLevel() < 35.9)
                            user.AddTempLevel(0.9);*/
                        user.addWaterLevel(player, 95);
                        chat.sendMeCommand(player, "выпивает стакан кофе");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 23:
                    {
                        /*if (user.GetTempLevel() < 35.9)
                            user.AddTempLevel(1.2);*/
                        user.addWaterLevel(player, 95);
                        chat.sendMeCommand(player, "выпивает стакан чая");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 24:
                    {
                        user.addWaterLevel(player, 70);
                        chat.sendMeCommand(player, "выпивает бутылку лимонада");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 25:
                    {
                        user.addWaterLevel(player, 55);
                        chat.sendMeCommand(player, "выпивает банку кока-колы");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 26:
                    {
                        user.addWaterLevel(player, 110);
                        chat.sendMeCommand(player, "выпивает банку энергетика");
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrinkAnimation(player);
                        break;
                    }
                case 31:
                    {
                        player.notify("~r~Больше не работает :c");
                        inventory.openInventory(player)
                        break;
                        let nplayer = methods.getNearestPlayerWithPlayer(player, 1.2);
                        if (!user.isLogin(nplayer)) {
                            player.notify("~r~Рядом с вами никого нет");
                            return;
                        }
                        user.useAdrenaline(nplayer);
                        chat.sendMeCommand(player, "сделал инъекцию адреналина");
                        inventory.deleteItem(id);
                        break;
                    }
                case 40:
                    {
                        let nplayer = methods.getNearestPlayerWithPlayer(player, 1.2);
                        if (!user.checkCanHandCuff(player, nplayer)) return inventory.openInventory(player);
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.arrestAnimation(player, nplayer).then(() => {
                            if (!user.checkCanHandCuff(player, nplayer)) return;
                            methods.saveLog('PlayerCuff', `${user.get(nplayer, 'rp_name')} (${user.getId(nplayer)}) cuffed by ${user.get(player, 'rp_name')} (${user.getId(player)})`);
                            chat.sendMeCommand(player, `надел наручники на человека рядом (${user.getId(nplayer)})`);
                            // user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
                            user.loginterract(player, nplayer, "PlayerCuffed", `надел наручники`)
                            user.cuff(nplayer);
                            if (user.isGos(player)) nplayer.setVariable('cuffedByGos', true);
                        });
                        break;
                    }
                case 215:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять аптечки');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "использовал аптечку");
                        user.healProtect(player)
                        if (player.health >= 60)
                            player.health = 100;
                        else
                            player.health = player.health + 40;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 278:
                    {
                        if (user.has(player, 'useHeal')) {
                            player.notify('~r~Нельзя так часто употреблять аптечки');
                            inventory.openInventory(player)
                            return;
                        }
                        chat.sendMeCommand(player, "использовал аптечку");
                        user.healProtect(player)
                        player.health = 100;
                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.playDrugAnimation(player);
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal');
                        }, 60000);
                        break;
                    }
                case 221:
                    {
                        if (user.has(player, 'useHeal1')) {
                            player.notify('~r~Нельзя так часто употреблять таблетки');
                            inventory.openInventory(player)
                            return;
                        }

                        chat.sendMeCommand(player, "употребил таблетку");

                        user.setDrugLevel(player, 0, 0);
                        user.setDrugLevel(player, 1, 0);
                        user.setDrugLevel(player, 2, 0);
                        user.setDrugLevel(player, 3, 0);
                        user.setDrugLevel(player, 4, 0);
                        user.setDrugLevel(player, 5, 0);
                        user.setDrugLevel(player, 99, 0);

                        user.stopAllScreenEffects(player);

                        user.playDrugAnimation(player);

                        inventory.deleteItem(id);
                        inventory.updateInventory(player)
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        user.set(player, 'useHeal1', true);
                        setTimeout(function() {
                            if (user.isLogin(player))
                                user.reset(player, 'useHeal1');
                        }, 60000);
                        break;
                    }
                case 263:
                    {
                        if (player.dimension > 0) {
                            player.notify('~r~Нельзя совершить ограбление');
                            inventory.openInventory(player)
                            return;
                        }

                        if (user.isGos(player)) {
                            player.notify('~r~Вы состоите в гос. организации');
                            inventory.openInventory(player)
                            return;
                        }

                        let veh = methods.getNearestVehicleWithCoords(player.position, 10);

                        if (!vehicles.exists(veh)) {
                            player.notify("~r~Нужно быть рядом с машиной");
                            return;
                        }

                        let vehInfo = methods.getVehicleInfo(veh.model);

                        if (vehInfo.class_name == "Emergency") {
                            player.notify("~r~Вы не можете взломать это транспортное средство");
                            return;
                        }

                        if (!veh.locked) {
                            player.notify("~r~Транспорт уже открыт");
                            return;
                        }

                        user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
                        let chance = methods.getRandomInt(0, 3) == 1
                        if (!chance) {
                            inventory.deleteItem(id);
                            inventory.updateInventory(player)
                        } else {
                            inventory.openInventory(player)
                        }
                        user.log(player, "PlayerInventoryInterraction", "Использовал " + items.getItemNameById(itemId))
                        setTimeout(function() {
                            try {

                                if (!vehicles.exists(veh)) {
                                    player.notify("~r~Не удалось взломать транспорт");
                                    return;
                                }

                                if (chance) {
                                    veh.locked = false;
                                    player.notify("~g~Вы открыли транспорт");
                                }
                                else {
                                    player.notify("~r~Вы сломали отмычку");
                                    inventory.deleteItem(id);
                                }
                            }
                            catch (e) {
                                methods.debug(e);
                            }
                        }, 25000);

                        break;
                    }
                case 262:
                    {
                        return player.notify("~r~Для того, чтобы заложить C4 подойдите к двери и нажмите ~g~E")
                        break;
                    }
                case 282:
                    {
                        if (user.get(player, 'tablet_equip')) return player.notify(`~r~У вас уже есть экипированный планшет.`)
                        inventory.deleteItem(id)
                        user.set(player, 'tablet_equip', id);
                        user.updateClientCache(player)
                        player.notify('~g~Вы экипировали планшет.')
                        inventory.updateInventory(player);
                        break;
                    }
            }
        } catch (e) {
            methods.debug(e);
        }
    },
    types: inventoryTypesUtil,
    equipItem: (player: PlayerMp, id: number, itemId: number, prefix: number, number: number, keyId: number, countItems: number) => {
        if (!user.getItemById(player, id)) {
            player.notify("~r~Данного предмета у вас больше нет в инвентаре");
            let item = itemsDB.get(id);
            if (item) inventory.updateAmount(player, item.owner_id, item.owner_type)
            return;
        }
        if (itemId == 282) return tablet.equipItem(player, id)
        if(items.isWeapon(itemId)){
            if (WEAPON_LEVEL_MIN > user.getLevel(player)){
                player.notify("~r~Для использования оружия требуется: "+WEAPON_LEVEL_MIN+" ур.");
                inventory.openInventory(player);
                return;
            }
        }
        player.call("server:inventory:equipItem", [id, itemId, prefix, number, keyId, countItems])
        user.log(player, "PlayerInventoryInterraction", "Экипировал " + items.getItemNameById(itemId))
        chat.sendMeCommand(player, 'Экипировал ' + items.getItemNameById(itemId))
        setTimeout(() => {
            if (mp.players.exists(player))
                inventory.updateInventory(player);
        }, 1000)
    }
};

mp.events.add('healNearestByItem', async (player: PlayerMp, pay:boolean = false) => {
    if(!user.isLogin(player)) return;
    if(!user.isEms(player) && !user.isUsmc(player) && user.isAdminNow(player)) return player.notify("~r~У вас нет должной квалификации чтобы оказывать медицинскую помощь");
    let target = await menu.selectNearestPlayers(player, 3);
    if(!target) return player.notify("~r~Поблизости никого нет");
    if(!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    if (!user.hasItem(player, 215)) return player.notify("~r~У вас нет ~b~"+items.getItemNameById(215))
    let status = true;
    if (pay) status = await user.accept(target, "Принять помощь?", "~g~Согласится ($" + healItemCost+")", "~r~Отказатся", true)
    if(!status){
        player.notify('~r~Пациент отказался от оказания помощи');
        target.notify(`~r~Вы отказались от помощи`)
        return;
    }
    if (!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    if (!user.hasItem(player, 215)) return player.notify("~r~У вас нет ~b~" + items.getItemNameById(215))
    if(user.isCuff(player)) return;
    if(user.isDead(player)) return;
    user.removeItem(player, 215);
    user.useAdrenaline(target);
    target.health = 10;
    setTimeout(() => {
        if (mp.players.exists(target)) user.healProtect(target), target.health = 10;
    }, 1000)
    chat.sendMeCommand(player, 'использовал аптечку на пострадавшем');

})

mp.events.add('equipItemCheck', (player: PlayerMp, id: number, itemId: number, prefix: number, number: number, keyId: number, countItems: number) => inventory.equipItem)


mp.events.add('upNearest10', async (player: PlayerMp, pay:boolean) => {
    if (!user.isEms(player) && !user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~У вас нет должной квалификации чтобы оказывать медицинскую помощь");
    if (pay && user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~Вы не можете оказывать платные услуги");
    if (user.isUsmc(player) && !user.isAdminNow(player) && user.getPlayerFractionRank(player) < 5) return player.notify("~r~Доступно с 5 ранга");
    if (!user.hasItem(player, 215)) return player.notify("~r~У вас нет ~b~" + items.getItemNameById(215))
    let target = await menu.selectNearestPlayers(player, 3);
    if (!target) return player.notify("~r~Поблизости никого нет");
    if (!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    let cost = user.getLevel(target) == 1 ? 100 : healItemCost
    if (!pay) cost = 0
    let status = true;
    if (user.isUsmc(player) && !user.isUsmc(target)) return player.notify(`~r~Вы можете оказывать помощь только сотруднику ${user.getPlayerFractionName(player)}`)
    if (pay) status = await user.accept(target, "Принять лечение?", "~g~Принять ($" + cost + ")", "Нет", true)
    if(!mp.players.exists(player)) return;
    if (!mp.players.exists(target)) return;
    if(!status){
        player.notify(`~r~Пациент отказался`)
        target.notify(`~r~Вы отказались`)
        return;
    }
    if (cost && user.getCashMoney(target) < cost) {
        player.notify(`~r~У пациента недостаточно средств для оплаты`)
        target.notify(`~r~У вас недостаточно средств для оплаты`)
        return;
    }
    if (!user.removeItem(player, 215)) {
        return player.notify('~r~Ваша аптечка куда то потерялась')
    }
    if (cost) {
        user.removeCashMoney(target, cost);
        user.addCashMoney(player, cost * 0.5)
        coffer.addMoney(cost * 0.5)
    }
    if (!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    user.playScenario(player, 'CODE_HUMAN_MEDIC_TIME_OF_DEATH');
    setTimeout(() => {
        if(!mp.players.exists(player)) return;
        user.stopScenario(player)
        if(!mp.players.exists(target)) return;
        if (user.isCuff(player)) return;
        if (user.isDead(player)) return;
        user.useAdrenaline(target);
        target.health = 10;
        setTimeout(() => {
            if (mp.players.exists(target)) user.healProtect(target), target.health = 10;
        }, 1000)
        chat.sendMeCommand(player, 'использовал аптечку на пострадавшем');
    }, 5000)
})
mp.events.add('upNearest100', async (player: PlayerMp, pay:boolean) => {
    if (!user.isEms(player) && !user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~У вас нет должной квалификации чтобы оказывать медицинскую помощь");
    if (pay && user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~Вы не можете оказывать платные услуги");
    if (user.isUsmc(player) && !user.isAdminNow(player) && user.getPlayerFractionRank(player) < 5) return player.notify("~r~Доступно с 5 ранга");
    if (!user.hasItem(player, 278)) return player.notify("~r~У вас нет ~b~" + items.getItemNameById(278))
    let target = await menu.selectNearestPlayers(player, 3);
    if (!target) return player.notify("~r~Поблизости никого нет");
    if (!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    let cost = user.getLevel(target) == 1 ? 200 : healItemCost2
    if (!pay) cost = 0
    let status = true;
    if (user.isUsmc(player) && !user.isUsmc(target)) return player.notify(`~r~Вы можете оказывать помощь только сотруднику ${user.getPlayerFractionName(player)}`)
    if (pay) status = await user.accept(target, "Принять лечение?", "~g~Принять ($" + cost + ")", "Нет", true)
    if (!mp.players.exists(player)) return;
    if (!mp.players.exists(target)) return;
    if (!status) {
        player.notify(`~r~Пациент отказался`)
        target.notify(`~r~Вы отказались`)
        return;
    }
    if (cost && user.getCashMoney(target) < cost) {
        player.notify(`~r~У пациента недостаточно средств для оплаты`)
        target.notify(`~r~У вас недостаточно средств для оплаты`)
        return;
    }
    if (!user.isDead(target)) return player.notify("~r~Человеку поблизости не требуется помощь");
    if (!user.removeItem(player, 278)) {
        return player.notify('~r~Ваша аптечка куда то потерялась')
    }
    if (cost) {
        user.removeCashMoney(target, cost);
        user.addCashMoney(player, cost * 0.5)
        coffer.addMoney(cost * 0.5)
    }
    user.playScenario(player, 'CODE_HUMAN_MEDIC_TIME_OF_DEATH');
    setTimeout(() => {
        if (!mp.players.exists(player)) return;
        user.stopScenario(player, true)
        if (!mp.players.exists(target)) return;
        if (user.isCuff(player)) return;
        if (user.isDead(player)) return;
        user.useAdrenaline(target);
        target.health = 100;
        setTimeout(() => {
            if (mp.players.exists(target)) user.healProtect(target), target.health = 100;
        }, 1000)
        chat.sendMeCommand(player, 'использовал аптечку на пострадавшем');
    }, 5000)
})
mp.events.add('healNearest', async  (player: PlayerMp, pay:boolean) => {
    if (!user.isEms(player) && !user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~У вас нет должной квалификации чтобы оказывать медицинскую помощь");
    if (pay && user.isUsmc(player) && !user.isAdminNow(player)) return player.notify("~r~Вы не можете оказывать платные услуги");
    if (!user.hasItem(player, 278) && !user.hasItem(player, 215)) return player.notify("~r~У вас нет ~b~" + items.getItemNameById(278) + " ~r~либо ~b~" + items.getItemNameById(215))
    let target = await menu.selectNearestPlayers(player, 3);
    if (!target) return player.notify("~r~Поблизости никого нет");
    if (user.isDead(target)) return player.notify("~r~Человеку поблизости требуется реанимация");
    let cost = user.getLevel(target) == 1 ? 100 : healItemCost3
    if (!pay) cost = 0
    let status = true;
    if (user.isUsmc(player) && !user.isUsmc(target)) return player.notify(`~r~Вы можете оказывать помощь только сотруднику ${user.getPlayerFractionName(player)}`)
    if (pay) status = await user.accept(target, "Принять лечение?", "~g~Принять ($"+cost+")", "Нет", true)
    if (!mp.players.exists(player)) return;
    if (!mp.players.exists(target)) return;
    if (!status) {
        player.notify(`~r~Пациент отказался`)
        target.notify(`~r~Вы отказались`)
        return;
    }
    if (user.isDead(target)) return player.notify("~r~Человеку поблизости требуется реанимация");
    if(cost && user.getCashMoney(target) < cost){
        player.notify(`~r~У пациента недостаточно средств для оплаты`)
        target.notify(`~r~У вас недостаточно средств для оплаты`)
        return;
    }
    if (!user.removeItem(player, 215)) {
        if (!user.removeItem(player, 278)) {
            return player.notify('~r~Ваша аптечка куда то потерялась')
        }
    }
    if (user.isCuff(player)) return;
    if (user.isDead(player)) return;
    if(cost){
        user.removeCashMoney(target, cost);
        user.addCashMoney(player, cost*0.5)
        coffer.addMoney(cost*0.5)
    }
    user.healProtect(target)
    target.health = 100;
    chat.sendMeCommand(player, 'использовал аптечку на пострадавшем');
})


async function unEquipWeaponEvent(player: PlayerMp, item_id: number){
    if (player.spamProtect) return player.notify(`~r~Подождите пару секунд`), inventory.openInventory(player)
    if (!user.isStill(player)) return player.notify(`~r~Чтобы снять оружие с экипировки - нужно остановится`), inventory.openInventory(player)
    player.spamProtect = true;
    setTimeout(() => {
        player.spamProtect = false;
    }, 5000)
    await user.unEquipWeapon(player, item_id);
    inventory.updateInventory(player)
}

mp.events.add('inventory:unequipgun', unEquipWeaponEvent)


mp.events.add('bankcardreward', (player: PlayerMp, id:number) => {

})


setTimeout(() => {
    methods.createDynamicCheckpoint(new mp.Vector3(353.66, -578.21, 27.79), "Нажмите ~g~Е~s~ чтобы открыть склад", player => {
        if(!user.isEms(player) && !user.isAdminNow(player, 6)) return player.notify(`~r~У вас нет доступа к складу`)
        let m = menu.new(player, "Склад")
        m.newItem({
            name: "Взять аптечку",
            onpress: () => {
                if (inventory.currentAmount(1, user.getId(player)) + items.getItemWeightById(215) > inventory.maxAmount(1, user.getId(player))) return player.notify('~r~У вас недостаточно места в инвентаре')
                inventory.addItem(player, 215, 1, 1, user.getId(player), 1, 10)
                player.notify('~g~Вы получили аптечку')
            }
        })
        m.newItem({
            name: "Взять спец. аптечку",
            onpress: () => {
                if (inventory.currentAmount(1, user.getId(player)) + items.getItemWeightById(278) > inventory.maxAmount(1, user.getId(player))) return player.notify('~r~У вас недостаточно места в инвентаре')
                inventory.addItem(player, 278, 1, 1, user.getId(player), 1, 10)
                player.notify('~g~Вы получили аптечку')
            }
        })
        m.newItem({
            name: "Сдать все аптечки на склад",
            onpress: () => {
                inventory.deleteHealItemsFromPlayer(player, true)
            }
        })
        m.open()
    })
}, 1000)