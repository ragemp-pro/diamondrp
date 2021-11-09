/// <reference path="../../declaration/server.ts" />

import fs from 'fs'
import { Container } from './data'
import { chat } from './chat'
import crypto from 'crypto'
import { enums } from '../enums'
import { user } from '../user'
import { vehicles } from '../vehicles'
import { business } from '../business'
import { bank } from '../business/bank'
import { coffer } from '../coffer'
import { mysql } from './mysql'

export let lastMessageLog: string[] = [];

let checkPointStaticList: { x: number, y: number, z: number, color: any, scale: number, height: number }[] = [];
let lotoMoney = 10;
let pedId = 0;

import ip from 'ip';
import { exec } from 'child_process'

import { menu } from './menu'
import { vehicleInfoCar } from './vehicleInfo'
import { inventory } from '../inventory'
import { dispatcher } from '../managers/dispatcher'
import { businessEntity } from './entity/business'
import { fractionUtil } from '../../util/fractions'
import { pickups } from './pickups'
import { houses } from '../houses'
import { condo } from '../condo'
import { stock } from '../stock'
import { apartments } from '../apartments'
import { RAGE_BETA } from '../../util/newrage'
import { notifyPictures } from './entity/userNotifyEntity'
import { lotoList, itemLoto } from '../../util/loto'
import { randomArrayEl } from '../../util/methods'
import { sequelize } from './sequelize'
import { logFractionGunEntity } from './entity/logFractionGunEntity'
import { userEntity } from './entity/user'
import { getCompanyName } from '../../util/company.names'
import { houseFridgeAmount, houseFridgeCost } from '../../util/inventory'


let containerDynamicHandle: [Vector3Mp, number, (player: PlayerMp) => any, number, number][] = []

export class DynamicCheckpoint {
	readonly id: number
	colshape: ColshapeMp
	marker: MarkerMp
	position: Vector3Mp
	message: string
	handle: (player: PlayerMp) => any
	scale: number
	dimension: number
	type: number
	color: number[]
	constructor(pos: Vector3Mp, message: string, handle: (player: PlayerMp) => any, scale: number = 1, dimension: number = 0, color: number[] = [33, 150, 243, 100], type: number = 1){
		methods.tempDynamicId++;
		const id = methods.tempDynamicId;
		this.id = id
		this.type = type
		this.position = pos;
		this.message = message;
		this.handle = handle;
		this.scale = scale;
		this.dimension = dimension;
		this.color = color;
		this.recreate()
	}
	recreate(){
		if (this.marker && mp.markers.exists(this.marker)) this.marker.destroy()
		if (this.colshape && mp.colshapes.exists(this.colshape)){
			mp.players.toArray().filter(player => player.colshapeHandleId == this.id).map(target => {
				mp.events.call('playerExitColshape', target, this.colshape)
			})
			this.colshape.destroy()
		}
		this.marker = mp.markers.new(this.type, this.position, this.scale,
			{
				color: this.color ? <RGBA>this.color : undefined,
				dimension: this.dimension
			})
			this.colshape = mp.colshapes.newSphere(this.position.x, this.position.y, this.position.z, this.scale + 0.4, this.dimension);
			this.marker.dimension = this.dimension
			this.colshape.dimension = this.dimension
		this.colshape.dynamicData = {
			handle:this.handle, message:this.message, id:this.id
		}
		
	}
	delete() {
		
		if (mp.markers.exists(this.marker)) this.marker.destroy()
		if (mp.colshapes.exists(this.colshape)){
			mp.players.toArray().filter(target => target.colshape == this.colshape).map(target => {
				mp.events.call('playerExitColshape', target, this.colshape)
			})
			this.colshape.destroy()
		}
	}
	updatePos(posnew: Vector3Mp) {
		this.position = posnew;
		setTimeout(() => {
			this.recreate()
		}, 100)
	}
	updateDimension(value: number) {
		this.dimension = value;
		setTimeout(() => {
			this.recreate()
		}, 100)
	}
	updatePosAndDimension(posnew: Vector3Mp, value: number) {
		this.position = posnew;
		this.dimension = value;
		setTimeout(() => {
			this.recreate()
		}, 100)
	}
	updateName(name: string) {
		this.message = name;
		this.recreate()
	}
}


mp.events.add('onKeyPress:E', (player:PlayerMp) => {
	if (player.duelLobby && player.dimension != 0) return;
	if (player.keyEspam) return;
	player.keyEspam = true;
	setTimeout(() => {
		if (mp.players.exists(player)) player.keyEspam = false;
	}, 500)
	if (!user.isLogin(player)) return;
	if (user.isDead(player)) return;
	if (player.colshapeHandle) return player.colshapeHandle(player);
	let fndhandle = containerDynamicHandle.find(([pos, scale, handle, dimension, id]) => player.dist(pos) <= scale + 0.2 && (player.dimension == dimension || dimension == -1))
	if (fndhandle) return fndhandle[2](player);
	// let foundInventory = false;
	houses.getAllHouses().forEach((val: { position: Vector3Mp }, key: any) => {
		if (methods.distanceToPos(player.position, val.position) < 1.5) {
			let houseData = houses.getHouseData(key);
			if (!houseData) return;
			if (!houseData.get('is_buy')){

				let m = menu.new(player, ``,
					`~b~Адрес: ~s~${houseData.get('address')} ${houseData.get('id')}`);
				m.sprite = "house";
				m.newItem({
					name: `Купить дом за ~g~$${methods.numberFormat(houseData.get('price'))}`,
					onpress: () => {
						houses.buy(player, houseData.id);
					}
				})
				if (houseData.int_x > 0) m.newItem({
					name: `~g~Осмотреть дом`,
					onpress: () => {
						user.teleport(player, houseData.int_x, houseData.int_y, houseData.int_z, null, houseData.id)
					}
				})

				if (user.get(player, 'job') == 'mail' || user.get(player, 'job') == 'mail2') {
					if (!(Container.Has(houseData.get('id'), 'isMail')))
						m.newItem({
							name: `~g~Положить почту`,
							onpress: () => {
								player.call('sendMail', [houseData.id])
							}
						})
						else
						m.newItem({
							name: `~o~Дом уже обслуживался`
						})
				}

				m.open();
			}
			else {
				if (houseData.get('int_x') == 0){
					let m = menu.new(player, ``,
						`~b~Адрес: ~s~${houseData.get('address')} ${houseData.get('id')}`);
					m.sprite = "house";
					m.newItem({
						name: `~b~Владелец:~s~ ${houseData.get('name_user')}`
					})

					if (user.get(player, 'job') == 'mail' || user.get(player, 'job') == 'mail2') {
						if (!(Container.Has(houseData.get('id'), 'isMail')))
							m.newItem({
								name: `~g~Положить почту`,
								onpress: () => {
									player.call('sendMail', [houseData.id])
								}
							})
						else
							m.newItem({
								name: `~o~Дом уже обслуживался`
							})
					}

					m.open();
					
				} else {
					let m = menu.new(player, `№${houseData.get('id')}`,
						`~b~Адрес: ~s~${houseData.get('address')} ${houseData.get('id')}`);

					m.newItem({
						name: `~b~Владелец:~s~ ${houseData.get('name_user')}`
					})
					m.newItem({
						name: `~g~Войти`,
						onpress: async () => {
							if (houseData.get('pin') > 0 && user.getId(player) != houseData.get('id_user')) {
								if (player.spamProtect) return player.notify("~r~Подождите перед вводом пароля");
								player.spamProtect = true;
								setTimeout(() => {
									if (mp.players.exists(player)) player.spamProtect = false;
								}, 5000)
								let q = await menu.input(player, "Введите пинкод", "", 10, "password");
								if(!q) return;
								let pass = methods.parseInt(q);
								if (pass == houseData.get('pin'))
									user.teleport(player, houseData.int_x, houseData.int_y, houseData.int_z, null, houseData.id)
								else player.notify('~r~Вы ввели не правильный пинкод');
							} else user.teleport(player, houseData.int_x, houseData.int_y, houseData.int_z, null, houseData.id)
						}
					})

					if (user.get(player, 'job') == 'mail' || user.get(player, 'job') == 'mail2') {
						if (!(Container.Has(houseData.get('id'), 'isMail')))
							m.newItem({
								name: `~g~Положить почту`,
								onpress: () => {
									player.call('sendMail', [houseData.id])
								}
							})
						else
							m.newItem({
								name: `~o~Дом уже обслуживался`
							})
					}

					m.open();

				}
			}
		}
	});

	condo.getAllHouses().forEach((val: { position: Vector3Mp }, key: any) => {
		if (methods.distanceToPos(player.position, val.position) < 1.5) {
			let houseData = condo.getHouseData(key);
			if (!houseData) return;
			if (houseData.get('id_user') == 0)
				player.call('client:showCondoBuyMenu', [Array.from(houseData)]);
			else player.call('client:showCondoOutMenu', [Array.from(houseData)]);
		}
	});

	stock.getAll().forEach((pos: Vector3Mp, key: any) => {
		if (methods.distanceToPos(player.position, pos) < 1.5) {
			let houseData = stock.getData(key);
			if (!houseData) return;
			if (houseData.get('user_id') == 0)
				player.call('client:showStockBuyMenu', [Array.from(houseData)]);
			else player.call('client:showStockOutMenu', [Array.from(houseData)]);
		}
	});

	//let idx = 0;
	enums.buildListData.forEach((val: number[], idx: number) => {
		let pos = new mp.Vector3(val[0], val[1], val[2]);
		if (methods.distanceToPos(player.position, pos) < 1.5) {
			player.call('client:showApartmentListMenu', [val[3], idx]);
		}
		//idx++;
	});

	if (player.dimension > 100000 && player.dimension < 5000000) {
		enums.apartIntData.forEach(function (item: number[]) {
			let pos = new mp.Vector3(item[0], item[1], item[2]);
			if (methods.distanceToPos(player.position, pos) < 1.5) {
				let apartData = apartments.getApartData(player.dimension - 100000);
				player.call('client:showApartmentInfoMenu', [Array.from(apartData)]);
			}
		});
		enums.houseIntData.forEach(function (item: number[]) {
			let pos = new mp.Vector3(item[0], item[1], item[2]);
			if (methods.distanceToPos(player.position, pos) < 1.5) {
				let apartData = apartments.getApartData(player.dimension - 100000);
				player.call('client:showApartmentInfoMenu', [Array.from(apartData)]);
			}
		});
		// // Kitchen
		// enums.kitchenIntData.forEach(function (item: number[]) {
		// 	if (foundInventory) return;
		// 	let pos = new mp.Vector3(item[0], item[1], item[2]);
		// 	if (methods.distanceToPos(player.position, pos) < 1.5) {
		// 		foundInventory = true
		// 	}
		// });
		// if (foundInventory) return inventory.openInventory(player);
	} else if (player.dimension >= 5000000 && player.dimension < 5100000) {
		let houseData = condo.getHouseData(player.dimension - 5000000);
		if (houseData &&
			methods.distanceToPos(
				player.position,
				new mp.Vector3(houseData.get('int_x'), houseData.get('int_y'), houseData.get('int_z'))
			) < 1.5
		)
			player.call('client:showCondoInMenu', [Array.from(houseData)]);

		// enums.kitchenIntData.forEach(function (item: number[]) {
		// 	if (foundInventory) return;
		// 	let pos = new mp.Vector3(item[0], item[1], item[2]);
		// 	if (methods.distanceToPos(player.position, pos) < 1.5) {
		// 		foundInventory = true;
		// 	}
		// });
		// if (foundInventory) return inventory.openInventory(player);
	} else if (player.dimension >= 5100000 && player.dimension < 5200000) {
		let houseData = stock.getData(player.dimension - 5100000);
		if (methods.distanceToPos(player.position, stock.exitPos) < 1.5)
			player.call('client:showStockInMenu', [Array.from(houseData)]);
	} else if (player.dimension > 0) {
		let houseData = houses.getHouseData(player.dimension);
		if (houseData &&
			methods.distanceToPos(
				player.position,
				new mp.Vector3(houseData.get('int_x'), houseData.get('int_y'), houseData.get('int_z'))
			) < 1.5
		){
			let m = menu.new(player, `№${houseData.get('id')}`,
				`~b~Адрес: ~s~${houseData.get('address')} ${houseData.get('id')}`);

			m.newItem({
				name: `~b~Владелец:~s~ ${houseData.get('name_user')}`
			})
			m.newItem({
				name: `~g~Выйти из дома`,
				onpress: async () => {
					user.teleport(player, houseData.x, houseData.y, houseData.z, null, 0)
				}
			})
			if (user.getId(player) == houseData.get('id_user')) m.newItem({
				name: `~y~Сменить пинкод`,
				onpress: async () => {
					let q = await menu.input(player, "Введите новый пинкод", "", 10, "password");
					if (!q) return;
					let pass = methods.parseInt(q);
					if (!pass || isNaN(pass) || pass < 1 || pass > 99999) return player.notify('~r~Вы ввели не правильный пинкод');
					houses.updatePin(houseData.id, pass);
				}
			})

			if (user.get(player, 'job') == 'mail' || user.get(player, 'job') == 'mail2') {
				if (!(Container.Has(houseData.get('id'), 'isMail')))
					m.newItem({
						name: `~g~Положить почту`,
						onpress: () => {
							player.call('sendMail', [houseData.id])
						}
					})
				else
					m.newItem({
						name: `~o~Дом уже обслуживался`
					})
			}

			m.open();
		}
			
		// Kitchen
		let kitchen = enums.kitchenIntData.find(item => methods.distanceToPos(player.position, new mp.Vector3(item[0], item[1], item[2])) < 1.5)

		if (kitchen && houseData) {
			let m = menu.new(player, "Холодильник")
			m.newItem({
				name: "Открыть холодильник",
				onpress: () => {
					menu.close(player);
					inventory.openInventory(player)
				}
			})
			m.newItem({
				name: "Улучшение",
				more: `Текущее: ${houseData.get('chest')}ур. (${methods.numberFormat(houseFridgeAmount[houseData.get('chest')]/1000)} кг)`,
				onpress: () => {
					if (houseData.get('id_user') != user.getId(player)) return player.notify("~r~Заказывать улучшения дома может только владелец");
					if (houseData.get('chest') != 0) return player.notify(`~r~Дальнейшее улучшение доступно на сайте gta-5.ru/trade`)
					let submenu = menu.new(player, "Выберите улучшение");
					submenu.newItem({
						name: `Ур. 1 (${methods.numberFormat(houseFridgeAmount[1] / 1000)} кг)`,
						more: `$${methods.numberFormat(houseFridgeCost)}`,
						onpress: () => {
							user.accept(player, "Вы уверены?").then(status => {
								if(!status) return;
								if (houseData.get('chest') != 0) return player.notify(`~r~Дальнейшее улучшение доступно на сайте gta-5.ru/trade`)
								if (user.getCashMoney(player) < houseFridgeCost) return player.notify("~r~У вас недостаточно средств");
								user.removeCashMoney(player, houseFridgeCost);
								houses.setChestLevel(houseData.get('id'), 1);
								player.notify('~g~Заказ обработан')
							})
						}
					})
					submenu.newItem({
						name: `Ур. 2 (${methods.numberFormat(houseFridgeAmount[2] / 1000)} кг)`,
						// more: `$${methods.numberFormat(houseFridgeCost)}`,
						onpress: () => {
							return player.notify(`~r~Данное улучшение доступно к приобретению на сайте gta-5.ru/trade`)
						}
					})
					submenu.open();
				}
			})
			m.open();
			return;
		}
		// if (foundInventory) return inventory.openInventory(player);
	}
	if (inventory.getNearestInventoriesPoints(player).length > 0) return inventory.openInventory(player)
	pickups.checkPressE(player);
});
mp.events.add('playerEnterColshape', (player: PlayerMp, colshape: ColshapeMp) => {
	if (!colshape.dynamicData) return;
	let text = colshape.dynamicData.message;
	if (colshape.dynamicData.onenter) {
		colshape.dynamicData.handle(player)
		return;
	}
	if (colshape.dynamicData.handle) player.colshapeHandle = colshape.dynamicData.handle, player.colshapeHandleId = colshape.dynamicData.id
	if (text.regexIndexOf(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, 0) == 0) {
		let res = text.replace(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, '');
		res = res[0].toUpperCase() + res.slice(1);
		user.setHelpKey(player, text.split(/Нажмите ~[a-zA-Z]~/g)[1].split(/~[a-zA-Z]~ чтобы /g)[0], res, 10000);
	}
	else player.notify(text);
	player.colshape = colshape;
})
mp.events.add('playerExitColshape', (player: PlayerMp, colshape: ColshapeMp) => {
	if (colshape && colshape.dynamicData && colshape.dynamicData.onLeave){
		colshape.dynamicData.onLeave(player);
	}
	user.removeHelpKey(player);
	menu.close(player)
	player.colshapeHandle = null;
	player.colshapeHandleId = null;
	player.colshape = null;
})

let ids = 10000000;

function calculateAttachPosition(
	position: Vector3Mp,
	/** Вектор поворота объёкта */
	rotation: Vector3Mp,
	offset: Vector3Mp
): Vector3Mp;
function calculateAttachPosition(
	position: Vector3Mp,
	/** GTA Heading объёкта */
	heading: number,
	offset: Vector3Mp
): Vector3Mp;
function calculateAttachPosition(position: Vector3Mp, rotation: Vector3Mp | number, offset: Vector3Mp): Vector3Mp {
	if (typeof rotation == "number") rotation = new mp.Vector3(0, 0, rotation)
	const _rotation = new mp.Vector3(rotation.x / 180 * Math.PI, rotation.y / 180 * Math.PI, rotation.z / 180 * Math.PI);
	const cos_rx = Math.cos(_rotation.x);
	const cos_ry = Math.cos(_rotation.y);
	const cos_rz = Math.cos(_rotation.z);
	const sin_rx = Math.sin(_rotation.x);
	const sin_ry = Math.sin(_rotation.y);
	const sin_rz = Math.sin(_rotation.z);

	return new mp.Vector3(
		position.x + offset.x * cos_ry * cos_rz - offset.x * sin_rx * sin_ry * sin_rz - offset.y * cos_rx * sin_rz + offset.z * sin_ry * cos_rz + offset.z * sin_rx * cos_ry * sin_rz,
		position.y + offset.x * cos_ry * sin_rz + offset.x * sin_rx * sin_ry * cos_rz + offset.y * cos_rx * cos_rz + offset.z * sin_ry * sin_rz - offset.z * sin_rx * cos_ry * cos_rz,
		position.z - offset.x * cos_rx * sin_ry + offset.y * sin_rx + offset.z * cos_rx * cos_ry
	);
};

export let methods = {
	getCompanyName: getCompanyName,
	teleportVehicle: (vehicle:VehicleMp, position: Vector3Mp, rotaion?: number, dimension?:number) => {
		if(!mp.vehicles.exists(vehicle)) return;
		vehicle.getOccupants().map(target => {
			if (typeof dimension === "number") target.dimension = dimension;
			user.teleportProtect(target);
		})
		if (typeof dimension === "number"){
			vehicle.dimension = dimension;
		}
		if (typeof rotaion === "number") vehicle.rotation.z = rotaion;
		vehicle.position = position;
	},
	coordBoxToPoints: (crd:{x:number,y:number}, line:number) => {
		let polygon: [number, number][] = [];

		const r = (line / 2)
		polygon.push(
			[crd.x - r, crd.y - r],
			[crd.x - r, crd.y + r],
			[crd.x + r, crd.y - r],
			[crd.x + r, crd.y + r],
		)
		return polygon
	},
	pointInBox: (point: [number, number], vs: [number, number][]) => {
		let min1: number = 99999999999999;
		let max1: number = -1111111111111;
		let min2: number = 99999999999999;
		let max2: number = -1111111111111;
		for (let id in vs) {
			let item = vs[id];
			let item1 = item[0];
			let item2 = item[1];
			if (item1 < min1) min1 = item1;
			if (item2 < min2) min2 = item2;
			if (item1 > max1) max1 = item1;
			if (item2 > max2) max2 = item2;
		}
		let point1 = point[0];
		let point2 = point[1];
		if (point1 < min1) return false;
		if (point2 < min2) return false;
		if (point1 > max1) return false;
		if (point2 > max2) return false;
		return true;
	},
	filter: (str: string) => {
		if (!str) return str;
		if (typeof str !== "string") return str
		return str.replace(/[^-0-9A-Zа-я-"<>/[\]() ]/gim, '').replace(/<script>/gi, '').replace(/<\/script>/gi, '').replace(/<body>/gi, '').replace(/<\/body>/gi, '').replace(/<html>/gi, '').replace(/<\/body>/gi, '')
	},
	model: (model: string) => {
		return model.replace(/[^a-z0-9]/gi, '');
	},
	hashToDb: (hash: HashOrString) => {
		return typeof hash === "string" ? mp.joaat(hash) : hash
	},
	explodeDoorsList: <[number, number, number, number][]>[],
	calculateAttachPosition,
	/** Позволяет уделить особое внимание на конкретной игровой метке */
	setBlipAlert: (blip: BlipMp, time: number = 60000) => {
		if (!mp.blips.exists(blip)) return;
		let end = false;
		const changeShortRange = blip.shortRange;
		const baseScale = blip.scale
		let big = false;
		if (changeShortRange) blip.shortRange = false;

		const interval_alert = () => {
			if (end) return;
			setTimeout(() => {
				if (end) return;
				if (!mp.blips.exists(blip)) return;
				if (!big) blip.scale = blip.scale * 1.5
				else blip.scale = blip.scale / 1.5
				big = !big;
				interval_alert();
			}, 500)
		}
		interval_alert();
		setTimeout(() => {
			if (!mp.blips.exists(blip)) return;
			end = true;
			if (changeShortRange) blip.shortRange = true;
			if (big) blip.scale /= 1.5;
		}, time)
	},
	getRandomPoint: (pos: Vector3Mp, range: number, notz = true) => {
		return new mp.Vector3(methods.getRandomInt(pos.x - range, pos.x + range), methods.getRandomInt(pos.y - range, pos.y + range), notz ? pos.z : methods.getRandomInt(pos.z - range, pos.z + range))
	},
	moveEntityToCoord: (entity: EntityMp, coord: Vector3Mp, distance: number, movez = false) => {
		let entitypos = entity.position;
		if (entitypos.x - coord.x < -distance) entitypos.x += distance;
		else if (entitypos.x - coord.x > distance) entitypos.x -= distance;
		if (entitypos.y - coord.y < -distance) entitypos.y += distance;
		else if (entitypos.y - coord.y > distance) entitypos.y -= distance;
		if (movez && entitypos.z - coord.z < -distance) entitypos.z += distance;
		else if (movez && entitypos.z - coord.z > distance) entitypos.z -= distance;
		entity.position = entitypos;
		return entitypos
	},
    /** 
     * Получить координату между точками для ровного перемещения
     * @argument position {number} - от 0.0 до 1.0 
     * */
	interpolateCoord: (pos1: Vector3Mp, pos2: Vector3Mp, position: number): Vector3Mp => {
		let newPos = new mp.Vector3(pos1.x - pos2.x, pos1.y - pos2.y, pos1.z - pos2.z);
		newPos.x *= position;
		newPos.y *= position;
		newPos.z *= position;
		newPos.x += pos1.x;
		newPos.y += pos1.y;
		newPos.z += pos1.z;
		return newPos
	},
	saveFractionLog: (name: string, doName: string, fractionId: number) => {
		logFractionGunEntity.create({
			name: name,
			do: doName,
			fraction_id: fractionId,
			timestamp: methods.getTimeStamp()
		});
	},
	newDimention: () => {
		return ids++
	},
	restartServer: () => {
		if (!methods.isTestServer()) exec("pm2 restart ragemp");
	},
	isTestServer: () => {
		return mp.config.test;
	},
	sha256: function (text: string) {
		return crypto.createHash('sha256').update(text).digest('hex');
	},
	playerDisableAllControls: function (player: PlayerMp, disable: boolean) {
		try {
			player.call('modules:client:player:DisableAllControls', [disable]);
		}
		catch (e) {
			console.log(e);
		}
	},
	sleep: (ms: number) => new Promise(res => setTimeout(res, ms)),
	getRandomInt: function (min: number, max: number) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	getRandomFloat: function () {
		return methods.getRandomInt(0, 10000) / 10000;
	},
	daysInMonth: function (month: number, year: number) {
		return new Date(year, month, 0).getDate();
	},
	distanceToPos: function (v1: { x: number, y: number, z: number }, v2: { x: number, y: number, z: number }) {
		return Math.abs(Math.sqrt(Math.pow((v2.x - v1.x), 2) +
			Math.pow((v2.y - v1.y), 2) +
			Math.pow((v2.z - v1.z), 2)));
	},
	distanceToPos2D: function (v1: { x: number, y: number }, v2: { x: number, y: number }) {
		return Math.abs(Math.sqrt(Math.pow((v2.x - v1.x), 2) +
			Math.pow((v2.y - v1.y), 2)));
	},
	removeQuotes: function (str: string) {
		if (typeof str != "string") return str;
		return str.replace('\'', '');
	},
	notifyWithPictureToAll: function (title: string, sender: string, message: string, notifPic: string, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) {
		mp.players.call("BN_ShowWithPicture", [title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor]);
	},
	notifyWithPictureToFraction: function (title: string, sender: string, message: string, notifPic: notifyPictures, fractionId = 0, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.get(p, 'fraction_id') == fractionId) {
				try {
					p.notifyWithPicture(title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor);
				}
				catch (e) {

				}
			}
		});
	},
	notifyWithPictureToFraction2: function (title: string, sender: string, message: string, notifPic: notifyPictures, fractionId = 0, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.get(p, 'fraction_id2') == fractionId) {
				try {
					p.notifyWithPicture(title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor);
				}
				catch (e) {

				}
			}
		});
	},
	notifyWithPictureToJob: function (title: string, sender: string, message: string, notifPic: notifyPictures, job: any, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.get(p, 'job') == job) {
				try {
					p.notifyWithPicture(title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor);
				}
				catch (e) {

				}
			}
		});
	},
	notifyWithPictureToPlayer: function (p: PlayerMp, title: string, sender: string, message: string, notifPic: notifyPictures, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) {
		if (mp.players.exists(p))
			p.notifyWithPicture(title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor);
	},
	notifyToFraction: function (message: string, fractionId = 0) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.get(p, 'fraction_id') == fractionId)
				p.notify(message);
		});
	},
	notifyToAll: function (message: string) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p))
				p.notify(message);
		});
	},
	getOrbitPosition: function (x: number, y: number, z: number, rot: number, range: number) {
		let newPos = new mp.Vector3(range * Math.sin(rot) + x, range * Math.cos(rot) + y, z);
		return newPos;
	},
	updatePlayersFractionType: function (fractionId: number, type: any) {
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.get(p, 'fraction_id2') == fractionId)
				user.set(p, 'fractionType', type);
		});
	},
	getCountFractionUsers: function (fractionId: number, cb: (res: number) => any) {
		userEntity.count({
			where: {
				fraction_id: fractionId
			}
		}).then(count => {
			cb(count);
		})
	},
	getCountFraction2Users: function (fractionId: number, cb: (res: number) => any) {
		userEntity.count({
			where: {
				fraction_id2: fractionId
			}
		}).then(count => {
			cb(count);
		})
	},
	updateLoto: function () {
		let alllotoItems = inventory.allItems().filter(item => item.item_id == itemLoto && item.key_id == 0)
		lotoList.map(loto => {
			let lotoItems = alllotoItems.filter(item => item.prefix == loto.prize)
			if(loto.count <= lotoItems.length){
				let winner = randomArrayEl(lotoItems)
				lotoItems.map(items => {
					if (items.id == winner.id) {
						items.key_id = 1;
						methods.notifyWithPictureToAll('American Loto', "Розыгрыш $" + methods.numberFormat(loto.prize), `Победил номер билета: ${winner.id}`, "WEB_PILLPHARM", 1);
						if(items.owner_type == 1){
							let target = user.getPlayerById(items.owner_id)
							if(target) target.notify('~g~Ваш билет оказался выигрышным')
						}
					} else {
						items.key_id = -1
					}
					inventory.reloadInventoryEntity(items.owner_type, items.owner_id);
					inventory.saveItem(items.id)
				})
			}
		})
	},
	resetLoto: function () {
		lotoMoney = methods.getRandomInt(400, 800);
	},
	secondsToTime: (secs: number) => {
		let hours = Math.floor(secs / (60 * 60));
		let divisor_for_minutes = secs % (60 * 60);
		let minutes = Math.floor(divisor_for_minutes / 60);
		let divisor_for_seconds = divisor_for_minutes % 60;
		let seconds = Math.ceil(divisor_for_seconds);
		return (hours ? (hours + "ч. :") : "") + minutes + "м." + ((secs < 60) ? (": " + seconds + "с.") : "");
	},
	unixTimeStampToDateTime: function (timestamp: number) {
		let dateTime = new Date(timestamp * 1000);
		return `${methods.digitFormat(dateTime.getDate())}/${methods.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}`
	},
	unixTimeStampToDateTimeShort: function (timestamp: number) {
		let dateTime = new Date(timestamp * 1000);
		return `${methods.digitFormat(dateTime.getDate())}/${methods.digitFormat(dateTime.getMonth() + 1)} ${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}`
	},
	getTimeStamp: function () {
		return Date.now() / 1000 | 0;
	},
	parseInt: function (str: string | number) {
		if (typeof str == "number") return Math.floor(str);
		return parseInt(str) || 0;
	},
	parseFloat: function (str: string | number) {
		if (typeof str == "number") return str;
		return parseFloat(str) || 0.0;
	},
	saveAll: function () {
		methods.saveAllAnother();
		methods.saveAllUser();
	},
	saveAllAnother: async function () {
		console.log('Save All Another');
		coffer.save();
		setTimeout(() => {
			console.time('saveVehicle');
			mp.vehicles.forEach((v) => {
				if (vehicles.exists(v)) {
					try {
						if (v.getVariable('container')) {
							vehicles.save(v.getVariable('container'));
						}
					}
					catch (e) {
						methods.debug(e);
					}
				}
			});
			console.timeEnd('saveVehicle');
		}, 10000)
	},
	saveAllUser: function () {
		console.log('Save All User', mp.players.length);
		console.time('saveAllUser');
		let time = methods.getTimeStamp()
		mp.players.forEach((p) => {
			if (mp.players.exists(p)) {
				if (user.isLogin(p)) {
					try {
						user.saveAccount(p).then(notSaved => {
							if (notSaved) {
								p.notify('~r~Ошибка сохранения аккаунта, сообщите разработчикам');
								p.notify('~r~Обязательно запомните время');
								console.error(`SAVE ERROR: ${user.get(p, 'id')} | ${user.has(p, 'id')} | ${time} | ${notSaved}`)
								methods.saveLog("saveError", `SAVE ERROR: ${user.get(p, 'id')} | ${user.has(p, 'id')} | ${time} | ${notSaved}`)
							}
						});
					}
					catch (e) {
						console.error(e);
					}
				}
			}
		});
		console.timeEnd('saveAllUser');

	},
	createBlip: function (pos: Vector3Mp, sprite: number, color: number, scale?: number, name?: string, dimension?: number) {
		if (scale == undefined)
			scale = 0.8;
		if (dimension == undefined)
			dimension = -1;
		if (name == undefined)
			return mp.blips.new(sprite, pos,
				{
					color: color,
					scale: scale,
					shortRange: true,
					dimension: dimension
				});
		return mp.blips.new(sprite, pos,
			{
				name: name,
				color: color,
				scale: scale,
				shortRange: true,
				dimension: dimension
			});
	},
	getVehicleInfo: function (model: number | string): vehicleInfoCar {
		let hash: number;
		if (typeof model == "string") hash = mp.joaat(model);
		else hash = model;
		let vehInfo = enums.vehicleInfo;
		for (let item in vehInfo) {
			let vItem = vehInfo[item];
			if (vItem.hash == model || vItem.display_name == model || mp.joaat(vItem.display_name.toString().toLowerCase()) == model)
				return vItem;
		}
		return { id: 0, hash, display_name: 'Unknown', class_name: 'Unknown', stock: 205000, fuel_full: 75, fuel_min: 8 };
	},
	getTaxiModalClass: function (model: any) {
		if (methods.getVehicleInfo(model).display_name == 'Oracle2')
			return 1;
		else if (methods.getVehicleInfo(model).display_name == 'Schafter4')
			return 2;
		else if (methods.getVehicleInfo(model).display_name == 'Revolter')
			return 3;
		else if (methods.getVehicleInfo(model).display_name == 'SC1')
			return 4;
		return 0;
	},
	getTaxiDistPrice: function (pos1: Vector3Mp, pos2: Vector3Mp, type = 0) {
		let typePrice = 20;
		let distance = methods.distanceToPos(pos1, pos2);

		switch (type) {
			case 1:
				typePrice = 16;
				break;
			case 2:
				typePrice = 13;
				break;
			case 3:
				typePrice = 7;
				break;
			case 4:
				typePrice = 5;
				break;
		}

		let price = methods.parseInt(distance / typePrice);
		if (price > 2000)
			price = 2000;

		return price;
	},
	createGlobalPedInVehicle: function (model: any, vehicleId: number) {
		mp.players.call('client:methods:createGlobalPedInVehicle', [pedId++, model, vehicleId]);
	},
	deleteGlobalPed: function (id: number) {
		mp.players.call('client:methods:deleteGlobalPed', [id]);
	},
	getRanks: fractionUtil.getFractionRanks,
	getLeaderRank: fractionUtil.getLeaderRank,
	getFractionRankName: fractionUtil.getRankName,
	getFractionName: fractionUtil.getFractionName,
	getMafiaName: fractionUtil.getFractionName,
	getPlayerById: function (id: number): PlayerMp {
		let player = undefined;
		mp.players.forEach(function (p) {
			if (user.isLogin(p) && user.getId(p) == id) {
				player = p;
			}
		});
		return player;
	},
	checkTeleport: function (player: PlayerMp, pos1: Vector3Mp, pos2: Vector3Mp) {
		try {
			let distanceCheck = 1.4;
			let playerPos = player.position;
			if (methods.distanceToPos(pos1, playerPos) < distanceCheck)
				user.teleport(player, pos2.x, pos2.y, pos2.z + 1);
			if (methods.distanceToPos(pos2, playerPos) < distanceCheck)
				user.teleport(player, pos1.x, pos1.y, pos1.z + 1);
		}
		catch (e) {
			methods.debug(e);
		}
	},
	checkTeleportVeh: function (player: PlayerMp, pos1: Vector3Mp, pos2: Vector3Mp) {
		try {
			let distanceCheck = 1.4;
			let playerPos = player.position;
			if (methods.distanceToPos(pos1, playerPos) < distanceCheck){
				let notfree = mp.vehicles.toArray().find(vehicle => methods.distanceToPos(pos2, vehicle.position) < 3)
				if(notfree){
					if (notfree.getOccupants().length == 0) notfree.destroy();
					else return player.notify('~r~Движение невозможно, место выхода занято другим ТС')
				}
				user.teleportVeh(player, pos2.x, pos2.y, pos2.z);
			}
			if (methods.distanceToPos(pos2, playerPos) < distanceCheck){
				let notfree = mp.vehicles.toArray().find(vehicle => methods.distanceToPos(pos1, vehicle.position) < 3)
				if (notfree) {
					if (notfree.getOccupants().length == 0) notfree.destroy();
					else return player.notify('~r~Движение невозможно, место выхода занято другим ТС')
				}
				user.teleportVeh(player, pos1.x, pos1.y, pos1.z);
			}
		}
		catch (e) {
			methods.debug(e);
		}
	},
	getFractionAllowCarList: function (fractionId: number) {
		let carAllowList = [];
		//console.time('getFractionAllowCarList');
		for (let id in enums.vehicleList) {
			if (enums.vehicleList[id][6] == fractionId) {
				// let canAdd = !(!!mp.vehicles.toArray().find(veh => veh.getVariable('id') == id && veh.getVariable('fraction_id') == fractionId));
				// let canAdd = true;
				// mp.vehicles.forEach(function (veh) {
				//     if (!vehicles.exists(veh))
				//         return;
				//     if (veh.getVariable('id') == id && veh.getVariable('fraction_id') == fractionId)
				//         canAdd = false;
				// });
				if (!(!!mp.vehicles.toArray().find(veh => veh.getVariable('id') == id && veh.getVariable('fraction_id') == fractionId))) {
					let name = methods.getVehicleInfo(enums.vehicleList[id][0]);
					carAllowList.push({ name: name.display_name, id: methods.parseInt(id), rank: methods.parseInt(enums.vehicleList[id][7]) });
				}
			}
		}
		//console.timeEnd('getFractionAllowCarList');
		return carAllowList;
	},
	getNearestVehicleWithCoords: function (pos: Vector3Mp, r: number) {
		let nearest: VehicleMp = undefined, dist;
		let min = r;
		methods.getListOfVehicleInRadius(pos, r).forEach(vehicle => {
			dist = methods.distanceToPos(pos, vehicle.position);
			if (dist < min) {
				nearest = vehicle;
				min = dist;
			}
		});
		return nearest;
	},
	getListOfVehicleInRadius: function (pos: Vector3Mp, r: number) {
		let returnVehicles: VehicleMp[] = [];
		mp.vehicles.forEachInRange(pos, r,
			(vehicle) => {
				if (!vehicles.exists(vehicle))
					return;
				returnVehicles.push(vehicle);
			}
		);
		return returnVehicles;
	},
	getListOfVehicleNumberInRadius: function (pos: Vector3Mp, r: number) {
		let returnVehicles: string[] = [];
		mp.vehicles.forEachInRange(pos, r,
			(vehicle) => {
				if (!vehicles.exists(vehicle))
					return;
				returnVehicles.push(vehicle.numberPlate);
			}
		);
		return returnVehicles;
	},
	getNearestPlayerWithCoords: function (pos: Vector3Mp, r: number) {
		let nearest: PlayerMp = undefined, dist;
		let min = r;
		methods.getListOfPlayerInRadius(pos, r).forEach(player => {
			if (!user.isLogin(player)) return;
			dist = methods.distanceToPos(pos, player.position);
			if (dist < min) {
				nearest = player;
				min = dist;
			}
		});
		return nearest;
	},
	getNearestPlayerWithPlayer: function (pl: PlayerMp, r: number) {
		let nearest: PlayerMp = undefined, dist;
		let min = r;
		let pos = pl.position;
		methods.getListOfPlayerInRadius(pos, r).forEach(player => {
			if (!user.isLogin(player)) return;
			if (pl == player) return;
			if (pl.dimension != player.dimension) return;
			dist = methods.distanceToPos(pos, player.position);
			if (dist < min) {
				nearest = player;
				min = dist;
			}
		});
		return nearest;
	},
	getListOfPlayerInRadius: function (pos: Vector3Mp, r: number) {
		let returnPlayers: PlayerMp[] = [];
		mp.players.forEachInRange(pos, r,
			(player) => {
				if (!user.isLogin(player)) return;
				returnPlayers.push(player);
			}
		);
		return returnPlayers;
	},
	getSkillCountPlayers: function (job: string, skill = 500, cb: (count: number) => any) {
		userEntity.count({
			where: {
				['skill_'+job]: skill
			}
		}).then(count => {
			cb(count);
		})
	},
	deleteObjectGlobal: function (x: number, y: number, z: number, hash: Hash) {
		mp.players.call('client:deleteObject', [x, y, z, hash]);
	},
	deleteObjectLocal: function (x: number, y: number, z: number, hash: Hash, range = 1) {
		mp.players.call('client:deleteObject', [x, y, z, hash, range]);
	},
	restoreObjectGlobal: function (x: number, y: number, z: number, hash: Hash) {
		// mp.players.call('client:restoreObject', [x, y, z, hash]);
	},
	explodeObjectGlobal: function (x: number, y: number, z: number, hash: Hash) {
		mp.players.call('client:explodeObject', [x, y, z, hash]);
	},
	openDoorExplode: function (x: number, y: number, z: number, hash: Hash, player?: PlayerMp) {
		if (!player) return mp.players.call('client:openDoorExplode', [x, y, z, hash]);
		player.call('client:openDoorExplode', [x, y, z, hash]);
	},
	openDoorRestore: function (x: number, y: number, z: number, hash: Hash, player?: PlayerMp) {
		if (!player) return mp.players.call('client:openDoorRestore', [x, y, z, hash]);
		player.call('client:openDoorRestore', [x, y, z, hash]);
	},
	getCheckPointStaticList: function () {
		return checkPointStaticList;
	},
	createStaticCheckpointV: function (pos: Vector3Mp, message: string, scale?: number, dimension?: number, color?: number[], height?: number) {
		return methods.createStaticCheckpoint(pos.x, pos.y, pos.z, message, scale, dimension, color, height);
	},
	tempDynamicId: 0,
	createExplopeCheckpoint: (
		/** Координаты */
		pos: Vector3Mp | Vector3Mp[],
		/** Модель двери */
		model: HashOrString,
		/** Проверка доступа */
		check?: (player: PlayerMp) => boolean,
		/** CallBack после взрыва */
		cb?: (player: PlayerMp) => void,
		/** Шанс от 1 до 10, чем больше, тем выше шанс, по умолчанию 8 */
		chance = 6,
		/** Отправим вызов копам? */
		bankreport = true,
		/** Вызов для конкретной фракции */
		fraction?:number
	) => {
		const hash = typeof model == "string" ? mp.joaat(model) : model;
		if (!(pos instanceof Array)) pos = [pos]
		pos.map(item => {
			methods.explodeDoorsList.push([item.x, item.y, item.z, hash]);
			let used = false;
			methods.createDynamicCheckpoint(item, "Нажмите ~g~E~w~ чтобы заложить C4", player => {
				const userid = user.getId(player)
				if (check) {
					if (!check(player)) return;
				}
				if (player.vehicle) return;
				if (user.isGos(player)) return player.notify("~r~Вы не можете закладывать бомбу");
				if (!user.getItem(player, 262)) return player.notify("~r~У вас нет C4");
				if (used) return player.notify("~r~Кто то уже закладывает C4");
				if (methods.explodedDoors.find(itm => (methods.distanceToPos(new mp.Vector3(itm[0], itm[1], itm[2]), new mp.Vector3(item.x, item.y, item.z)) < 5 && itm[3] == hash))) return player.notify("~r~Дверь уже взорвана");
				// user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
				user.playScenario(player, "CODE_HUMAN_MEDIC_TEND_TO_DEAD", item.x, item.y, item.z)
				user.disableAllControls(player, true);
				used = true;
				setTimeout(() => {
					used = false;
				}, 27000);
				setTimeout(() => {
					if (!mp.players.exists(player)) return;
					// user.playScenario(player, "CODE_HUMAN_MEDIC_TEND_TO_DEAD")
					setTimeout(() => {
						if (!mp.players.exists(player)) return;
						user.stopScenario(player);
						setTimeout(() => {
							if (!mp.players.exists(player)) return;
							user.disableAllControls(player, false);
							if (!user.getItem(player, 262)) return player.notify("~r~У вас нет C4");
							inventory.deleteItem(user.getItem(player, 262).id);
							let object = mp.objects.new(-1110203649, new mp.Vector3(player.position.x, player.position.y, player.position.z - 1.0));
							player.notify("~g~Взрывчатка установлена, подождите 10 секунд");
							setTimeout(() => {
								if (mp.players.exists(player)) player.notify("~g~До взрыва осталось 5 секунд");
								setTimeout(() => {
									if (mp.objects.exists(object)) object.destroy();
									if (!mp.players.exists(player)) return;
									if (methods.getRandomInt(1, 10) <= chance) {
										user.log(player, "ExplodeDoor", `успешно заложил C4 ${bankreport ? "С сигнализацией" : "Без сигнализации"}`);
										if (bankreport){
											if (fraction){
												dispatcher.sendLocalPos("Код 0", `В ${model == 3309500160 ? 'хранилище казино' : 'банке'} сработала сигнализация`, player.position, fraction, true)
											} else {
												dispatcher.sendPos("Код 0", `В ${model == 3309500160 ? 'хранилище казино' : 'банке'} сработала сигнализация`, player.position);
											}
										} 
										methods.openDoorExplode(item.x, item.y, item.z, hash)
										methods.explodedDoors.push([item.x, item.y, item.z, hash]);
										if (cb) cb(player)
									} else {
										user.log(player, "ExplodeDoor", `НЕуспешно заложил C4`);
										if (mp.players.exists(player)) player.notify("~r~Взрывчатка не сработала");
									}
								}, 5000);
							}, 5000);
						}, 4000);
					}, 10000);
				}, 5000)
			}, 2, 0, [0, 0, 0, 0]);
		})
	},
	createDynamicCheckpoint: (pos: Vector3Mp, message: string, handle: (player: PlayerMp) => any, scale: number = 1, dimension: number = 0, color: number[] = [33, 150, 243, 100], height?: number, type: number = 1) => {
		return new DynamicCheckpoint(pos, message, handle, scale, dimension, color, type)
	},
	createEnterCheckpoint: (pos: Vector3Mp | Vector3Mp[], handle: (player: PlayerMp) => any, scale: number = 1, dimension: number = 0, color: number[] = null, onLeave?: (player: PlayerMp) => any) => {
		methods.tempDynamicId++;
		const id = methods.tempDynamicId;
		let colshapes: ColshapeMp[] = [];
		let markers: MarkerMp[] = [];
		if (!(pos instanceof Array)) pos = [pos]
		pos.map(item => {
			// methods.createStaticCheckpointV(item, message, scale, dimension ? dimension : 0, color, height);
			containerDynamicHandle.push([item, scale, handle, dimension, id])
			let colshape = mp.colshapes.newSphere(item.x, item.y, item.z, scale + 0.4, dimension);
			colshape.dynamicData = {
				handle, id, onenter: true, onLeave
			}
			if (color) {
				markers.push(mp.markers.new(1, item, scale,
					{
						color: color ? <RGBA>color : undefined,
						dimension
					}));
			}
			colshapes.push(colshape)
		})

		let res = {
			delete: () => {
				containerDynamicHandle.map(([_q, _a, _b, _c, ids], index) => {
					if (ids == id) containerDynamicHandle.splice(index, 1);
				})
				colshapes.forEach(item => {
					if (mp.colshapes.exists(item) && item.dynamicData && item.dynamicData.id == id) item.destroy()
				});
				markers.map(item => {
					item.destroy();
				})
				res = undefined;
			},
			updatePos: (posnew: Vector3Mp) => {
				containerDynamicHandle.map(([qpos, _a, _b, _c, ids], index) => {
					if (ids == id) qpos = posnew
				})
				colshapes.forEach(item => {
					if (mp.colshapes.exists(item) && item.dynamicData && item.dynamicData.id == id) item.position = posnew
				});
				markers.map(item => {
					item.position = posnew
				})
			},
			updateName: (name: string) => {
				colshapes.forEach(item => {
					if (mp.colshapes.exists(item) && item.dynamicData && item.dynamicData.id == id) item.dynamicData.message = name
				});
			}
		}

		return res;

	},
	getTimeWithoutSec: function () {
		let dateTime = new Date();
		return `${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}`;
	},
	getTime: function () {
		let dateTime = new Date();
		return `${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}:${methods.digitFormat(dateTime.getSeconds())}`;
	},
	getDate: function () {
		let dateTime = new Date();
		return `${methods.digitFormat(dateTime.getDate())}/${methods.digitFormat(dateTime.getMonth() + 1)}/${methods.digitFormat(dateTime.getFullYear())}`;
	},
	debugEnable: false,
	sequelizeEnable: false,
	debug: function (...text: any[]) {
		if (!methods.isTestServer() && !methods.debugEnable) return;
		lastMessageLog.push(...text);
		if (lastMessageLog.length > 100) lastMessageLog.splice(0, lastMessageLog.length - 100);
		console.log(`[${methods.getTime()}]`, ...text);
	},
	debugSeq: function (...text: any[]) {
		// methods.saveLog('sequelize', text[0])
		if (!methods.sequelizeEnable) return;
		console.log(`[${methods.getTime()}]`, text[0]);
	},
	debugStart: function (name: string) {
		if (!methods.isTestServer() && !methods.debugEnable) return;
		console.time('saveBusiness');
	},
	debugEnd: function (name: string) {
		if (!methods.isTestServer() && !methods.debugEnable) return;
		console.timeEnd(name);
	},
	convertNumberToHash: function (number: number | string) {
		// !todo mb .toString() ?
		return mp.joaat(number.toString().toUpperCase());
	},
	escapeRegExp: function (str: string) {
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	},
	replaceAll: function (str: string, find: string, replace: string) {
		return str.replace(new RegExp(methods.escapeRegExp(find), 'g'), replace);
	},
	createStaticCheckpoint: function (x: number, y: number, z: number, message: string, scale?: number, dimension?: number, color?: RGBA, height?: number) {

		if (scale == undefined)
			scale = 1;
		if (color == undefined)
			color = [33, 150, 243, 100];
		if (height == undefined)
			height = scale;

		if (dimension == undefined)
			dimension = -1;
		else
			dimension = methods.parseInt(dimension);

		let checkpointID = checkPointStaticList.length;
		checkPointStaticList.push({ x, y, z, color, scale, height });
		if (message != undefined)
			Container.Set(999999, 'checkpointStaticLabel' + checkpointID, message);

        // let pos = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
        mp.markers.new(1, new mp.Vector3(x, y, z), scale, {
            color: color,
            dimension: dimension
        });

		//return mp.colshapes.newTube(x, y, z, scale + 0.4, scale + 0.6);
        /*let checkpoint = mp.checkpoints.new(1, pos, scale + 0.2,
        {
            direction: new mp.Vector3(0, 0, 0),
            color: [ 33, 150, 243, 0 ],
            visible: true,
            dimension: dimension
        });
        if (message != undefined)
            Container.Data.Set(999999, 'checkpointLabel' + checkpoint.id, message);
        return checkpoint;*/
		return checkpointID;
	},
	digitFormat: function (number: number) {
		return ("0" + number).slice(-2);
	},
	numberFormat: function (currentMoney: number) {
		return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
			return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, "$1,");
		});
	},
	saveLog: function (name: string, log: string) {
		fs.appendFile("log/" + name + ".log", `[${methods.getDate()}] [${methods.getTime()}] ${log}\n`, function (err) {
			if (err) {
				methods.createFile("log/" + name + ".log");
				return methods.debug(err);
			}
		});
	},
	createFile: function (filename: string) {
		fs.open(filename, 'r', function (err, fd) {
			if (err) {
				fs.writeFile(filename, '', function (err) {
					if (err)
						methods.debug(err);
					else
						methods.debug("The file was saved!");
				});
			} else {
				methods.debug("The file exists!");
			}
		});
	},
	loadInteriorCheckpoints: function () {
		enums.houseIntData.forEach(function (item: any[]) {
			let checkpoint = methods.createStaticCheckpoint(item[0], item[1], item[2], "Нажмите ~g~Е~s~ чтобы открыть меню");
		});
		enums.apartIntData.forEach(function (item: any[]) {
			let checkpoint = methods.createStaticCheckpoint(item[0], item[1], item[2], "Нажмите ~g~Е~s~ чтобы открыть меню");
		});
		enums.kitchenIntData.forEach(function (item: any[]) {
			let checkpoint = methods.createStaticCheckpoint(item[0], item[1], item[2], "Нажмите ~g~Е~s~ чтобы открыть меню кухни");
		});
		enums.buildListData.forEach(function (item: any[]) {
			let checkpoint = methods.createStaticCheckpoint(item[0], item[1], item[2], "Нажмите ~g~Е~s~ чтобы открыть меню");
			let blip = methods.createBlip(new mp.Vector3(item[0], item[1], item[2]), 475, 0, 0.4, 'Апартаменты');
		});
	},
	loadAllBlips: function () {
		methods.createBlip(new mp.Vector3(-1581.81, -903.71, 8.20), 641, 0, 0.8, 'Авторынок');
		methods.createBlip(new mp.Vector3(-2303.5, 3388.43, 31.25), 598, 0, 0.8, 'United States Marine Corps');
		methods.createBlip(new mp.Vector3(437.5687, -982.9395, 30.69), 60, 0, 0.8, 'Police Department');
		methods.createBlip(new mp.Vector3(-448.6859, 6012.703, 30.71638), 60, 16, 0.8, 'Sheriff Department');
		methods.createBlip(new mp.Vector3(1853.22, 3686.6796875, 33.2670), 60, 16, 0.8, 'Sheriff Department');
		methods.createBlip(new mp.Vector3(-138.8656, -634.0953, 168.8204), 535, 67, 0.8, 'Arcadius - Бизнес Центр');
		methods.createBlip(new mp.Vector3(-66.66476, -802.0474, 44.22729), 475, 59, 0.8, 'Государственный банк "Maze"');
		// methods.createBlip(new mp.Vector3(2523.98, -412.34, 94.12), 498, 0, 0.8, 'Офис FIB');
		methods.createBlip(new mp.Vector3(1830.489, 2603.093, 45.8891), 238, 0, 0.8, 'Федеральная тюрьма');
		methods.createBlip(new mp.Vector3(-546.04, -202.54, 38.23), 419, 0, 0.8, 'Здание правительства');
		methods.createBlip(new mp.Vector3(354.65, -595.92, 28.79), 489, 59, 0.8, 'Здание больницы LS');
		// methods.createBlip(new mp.Vector3(210.0973, -1649.418, 29.8032), 436, 60, 0.8, 'Здание Fire Department');
		//methods.createBlip(new mp.Vector3(-1581.689, -557.913, 34.95288), 545, 0, 0.8, 'Здание автошколы');

		methods.createBlip(new mp.Vector3(46.947, -1753.859, 46.508), 78, 68, 0.4, 'Торговый центр MegaMoll');

		methods.createBlip(new mp.Vector3(-3544, 6135, 0), 68, 59, 0.8, 'Рыбалка запрещена');
		methods.createBlip(new mp.Vector3(4989, 1712, 0), 68, 59, 0.8, 'Рыбалка запрещена');
		methods.createBlip(new mp.Vector3(-1337.255, -1277.948, 3.872962), 362, 0, 0.8, 'Магазин масок');

		methods.createBlip(new mp.Vector3(-1516.71, 851.46, 181.59), 78, 71, 0.8, 'Украинское посольство');
		methods.createBlip(new mp.Vector3(-1366.50, 56.68, 54.10), 78, 4, 0.8, 'Русское посольство');
		methods.createBlip(new mp.Vector3(-348.33, 178.55, 87.92), 78, 1, 0.8, 'Японское посольство');
		methods.createBlip(new mp.Vector3(-1886.83, 2049.96, 140.98), 78, 2, 0.8, 'Итальянское посольство');
	},
	explodedDoors: <[number, number, number, number][]>[],
	createEvent: (id: string, name: string, x: number, y: number, z: number, range: number) => {
		const item = { id, name, x, y, z, range }
		mapEventList.push(item);
		mp.players.call('mapEvent:new', [JSON.stringify(item)])
	},
	removeEvent: (id: string) => {
		mapEventList.map((item, i) => {
			if (item.id === id) mapEventList.splice(i, 1);
		})
		mp.players.call('mapEvent:remove', [id])
	},
};

let mapEventList: { id: string, name: string, x: number, y: number, z: number, range: number}[] = []

mp.events.add('playerJoin', (player: PlayerMp) => {
	if (methods.isTestServer()) player.call('server:test', [RAGE_BETA]);
	player.call('client:explodeDoorsAll', [JSON.stringify(methods.explodeDoorsList)]);
	player.call('mapEvent:load', [JSON.stringify(mapEventList)]);
	setTimeout(() => {
		if (!mp.players.exists(player)) return;
		methods.explodedDoors.forEach(item => {
			methods.openDoorExplode(item[0], item[1], item[2], item[3], player);
		})
	}, 5000)
})








function dec2binInt(decString: string) {

	let bufferSize = 13;
	let bufferMax = 10000000000000;

	let remainder;
	let padDecString;

	let bufferArray = new Array();
	let indexArray;
	let lengthArray;
	let zeroIndex;

	let roundNumberFigures;
	let indexFigures;

	let binArray = new Array("000", "001", "010", "011", "100", "101", "110", "111");
	let outputBin;

	let checkAllZero;

	roundNumberFigures = Math.floor((Math.floor(Math.log(Math.pow(10, decString.length)) / Math.LN2) + 1) / 3) * 3 + 3;

	let carry;

	let temp;

	// Check if the number of characters is a multiple of the buffersize
	remainder = decString.length - (Math.floor(decString.length / bufferSize) * bufferSize);

	// If not, pad with zeros
	padDecString = decString;

	if (remainder != 0) {

		for (let index = remainder; index < bufferSize; index++) {
			padDecString = "0" + padDecString;
		}

	}

	// Load string into array
	indexArray = 0;
	for (let index = 0; index < padDecString.length; index += bufferSize) {

		bufferArray[indexArray] = parseInt(padDecString.substr(index, bufferSize), 10);

		indexArray++;

	}

	lengthArray = indexArray;



	// Shift right

	outputBin = "";
	indexFigures = 0;
	let zerosCount = 0;

	checkAllZero = 1;
	while ((indexFigures < roundNumberFigures) && (checkAllZero != 0)) {
		carry = 0;
		checkAllZero = 0;

		for (let index = 0; index < lengthArray; index++) {

			bufferArray[index] += (carry * bufferMax);

			temp = Math.floor(bufferArray[index] / 8);

			carry = bufferArray[index] - (temp * 8);

			bufferArray[index] = temp;

			checkAllZero += bufferArray[index];

		}

		outputBin = binArray[carry] + outputBin;

		if (indexFigures != 0) {
			indexFigures += 3;
		}
		else {
			if (binArray[carry].indexOf("1") != -1) {
				indexFigures = 3 - binArray[carry].indexOf("1");
				zerosCount += 2 - binArray[carry].indexOf("1");
			}
			else {
				zerosCount += 3;
			}
		}

	}

	// Remove extra zeros
	if (outputBin.indexOf("1") == -1) {
		outputBin = "0";
	}
	else {
		outputBin = outputBin.substr(outputBin.indexOf("1"));
	}

	return outputBin;


}

function dec2binFrac(decString: any, numberFigures: any, intPartIsZero: any) {

	let bufferSize = 15;
	let bufferMax = 1000000000000000;

	let remainder;
	let padDecString;

	let bufferArray = new Array();
	let indexArray;
	let lengthArray;
	let zeroIndex;

	let roundNumberFigures;
	let indexFigures;

	let binArray = new Array("000", "001", "010", "011", "100", "101", "110", "111");
	let outputBin;

	let checkAllZero;
	let zerosCount;

	roundNumberFigures = Math.floor(numberFigures / 3) * 3 + 3;

	let carry;

	let temp;

	// Check if the number of characters is a multiple of the buffersize
	remainder = decString.length - (Math.floor(decString.length / bufferSize) * bufferSize);

	// If not, pad with zeros
	padDecString = decString;

	if (remainder != 0) {

		for (let index = remainder; index < bufferSize; index++) {
			padDecString += "0";
		}

	}


	// Load string into array
	indexArray = 0;
	for (let index = 0; index < padDecString.length; index += bufferSize) {

		bufferArray[indexArray] = parseInt(padDecString.substr(index, bufferSize), 10);

		indexArray++;

	}

	lengthArray = indexArray;


	// Shift left

	outputBin = "";
	if (intPartIsZero == 0) {
		indexFigures = 0;
	}
	else {
		indexFigures = -1;
	}
	zerosCount = 0;

	checkAllZero = 1;
	while ((indexFigures < roundNumberFigures) && (checkAllZero != 0)) {
		carry = 0;
		checkAllZero = 0;

		for (let index = lengthArray - 1; index >= 0; index--) {
			bufferArray[index] = bufferArray[index] * 8 + carry;

			carry = Math.floor(bufferArray[index] / bufferMax);

			bufferArray[index] -= carry * bufferMax;

			checkAllZero += bufferArray[index];

		}

		outputBin += binArray[carry];

		if (indexFigures != -1) {
			indexFigures += 3;
		}
		else {
			if (binArray[carry].indexOf("1") != -1) {
				indexFigures = 3 - binArray[carry].indexOf("1");
				zerosCount += binArray[carry].indexOf("1");
			}
			else {
				zerosCount += 3;
			}
		}

	}

	// If not enough bits, pad with zeros
	if (outputBin.length < numberFigures) {

		temp = numberFigures - outputBin.length;

		for (let index = 0; index < temp; index++) {
			outputBin += "0";
		}
	}
	// Else remove extra bits
	else {
		outputBin = outputBin.substr(0, zerosCount + numberFigures);
	}

	return outputBin;

}

function bin2decInt(binString: any) {

	let bufferSize = 15;
	let bufferMax = 1000000000000000;

	let bufferArray = new Array();
	let bufferLength;

	let remainder;
	let padString;

	let decString;
	let temp;

	if (binString.length < 1024) {

		bufferLength = Math.floor((Math.floor(Math.log(Math.pow(2, binString.length)) / Math.LN10) + 1) / bufferSize) + 1;
	}
	else {
		// Cannot calculate the log of 2^1024: overflow
		bufferLength = Math.floor((Math.floor(308.2547) + 1) / bufferSize) + 1;;
	}

	// Make sure the number of bits is a multiple of 3
	remainder = binString.length - (Math.floor(binString.length / 3) * 3);

	padString = binString;

	if (remainder != 0) {
		for (let index = 0; index < (3 - remainder); index++) {
			padString = "0" + padString;
		}
	}

	// Initialize array
	for (let index = 0; index < bufferLength; index++) {
		bufferArray[index] = 0;
	}

	for (let indexBin = 0; indexBin < padString.length; indexBin += 3) {

		let carry = parseInt(padString.substr(indexBin, 3), 2);

		for (let index = bufferLength - 1; index >= 0; index--) {
			bufferArray[index] = bufferArray[index] * 8 + carry;

			carry = Math.floor(bufferArray[index] / bufferMax);

			bufferArray[index] -= carry * bufferMax;

		}

	}

	decString = "";
	for (let index = 0; index < bufferLength; index++) {

		for (let index2 = 0; index2 < (bufferSize - (bufferArray[index] + "").length); index2++) {
			decString += "0";
		}

		decString += bufferArray[index];

	}

	// Remove extra zeros
	temp = -1;

	for (let index = 0; index < decString.length; index++) {
		if (decString.charAt(index) != "0") {
			temp = index;
			break;
		}
	}

	if (temp == -1) {
		decString = "0";
	}
	else {
		decString = decString.substr(temp);
	}


	return decString;

}

function bin2decFrac(binString: any, numberFigures: any) {

	let bufferSize = 13;
	let bufferMax = 10000000000000;
	let bufferLength;

	let remainder;

	let bufferArray = new Array();
	let indexArray;
	let lengthArray;

	let padString;

	let carry;
	let temp;

	let decString;


	bufferLength = Math.floor((numberFigures) / bufferSize) + 1;

	// Make sure the number of bits is a multiple of 3
	remainder = binString.length - (Math.floor(binString.length / 3) * 3);

	padString = binString;

	if (remainder != 0) {
		for (let index = 0; index < (3 - remainder); index++) {
			padString = padString + "0";
		}
	}

	// Initialize array
	for (let index = 0; index < bufferLength; index++) {
		bufferArray[index] = 0;
	}



	// Shift right
	for (let indexBin = padString.length - 3; indexBin >= 0; indexBin -= 3) {
		carry = parseInt(padString.substr(indexBin, 3), 2);

		for (let index = 0; index < bufferLength; index++) {

			bufferArray[index] += (carry * bufferMax);

			temp = Math.floor(bufferArray[index] / 8);

			carry = bufferArray[index] - (temp * 8);

			bufferArray[index] = temp;

		}

	}

	decString = "";
	for (let index = 0; index < bufferLength; index++) {

		for (let index2 = 0; index2 < (bufferSize - (bufferArray[index] + "").length); index2++) {
			decString += "0";
		}

		decString += bufferArray[index];


	}

	temp = decString.length;

	if (decString.length < numberFigures) {
		for (let index = 0; index < (numberFigures - temp); index++) {
			decString += "0";
		}
	}
	else {
		decString = decString.substr(0, numberFigures);
	}

	return decString;

}

function roundBinary(binString: any, carry: any) {

	let roundString;
	let sum;
	let digit;

	if (carry == 1) {
		roundString = "";
		for (let index = binString.length - 1; index >= 0; index--) {

			digit = parseInt(binString.charAt(index), 10);

			if ((carry == 1) && (digit == 1)) {
				sum = 0;
				carry = 1;
			}
			else if ((carry == 0) && (digit == 0)) {
				sum = 0;
				carry = 0;
			}
			else {
				sum = 1;
				carry = 0;
			}

			roundString = sum + roundString;
		}

		if (carry == 1) {
			roundString = carry + roundString;
		}

	}
	else {
		roundString = binString;
	}

	return roundString;

}

function bin2hex(binNumber: any) {

	let arrayHex = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");

	let hexNumber;

	hexNumber = "";

	for (let index = 0; index < binNumber.length; index += 4) {
		hexNumber += arrayHex[parseInt(binNumber.substr(index, 4), 2)];
	}

	return hexNumber;

}

function hex2bin(hexNumber: any) {

	let hexaString = "0123456789ABCDEF";
	let binaryArray = new Array("0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111");

	let binaryString;

	binaryString = "";
	for (let index = 0; index < hexNumber.length; index++) {
		binaryString += binaryArray[hexaString.indexOf(hexNumber.charAt(index))];
	}

	return binaryString;

}

function fastDec2Bin(compareArray: any, numberCompare: any, expression: any) {

	let binString;

	binString = "";

	for (let index = 0; index < numberCompare; index++) {

		if ((expression - compareArray[index]) >= 0) {
			expression -= compareArray[index];
			binString += "1";
		}
		else {
			binString += "0";
		}
	}

	return binString;
}

function fastBin2Dec(binString: any) {

	let decNumber;

	decNumber = 0;

	for (let index = 0; index < binString.length; index++) {

		if (binString.charAt(index) == "1") {
			decNumber += Math.pow(2, binString.length - index - 1);
		}
	}

	return decNumber;
}

// **********************************************************************
// *			         HELPERS				*
// **********************************************************************


function padZerosLeft(expression: any, numberZeros: any) {

	for (let index = 0; index < numberZeros; index++) {
		expression = "0" + expression;
	}

	return expression;

}

function padZerosRight(expression: any, numberZeros: any) {

	for (let index = 0; index < numberZeros; index++) {
		expression = expression + "0";
	}

	return expression;

}

function completeZerosLeft(expression: any, length: any) {
	return padZerosLeft(expression.substr(0, length), length - expression.length);
}

function completeZerosRight(expression: any, length: any) {
	return padZerosRight(expression.substr(0, length), length - expression.length);
}

function validateExpression(expression: any, numberFigures: any, reference: any) {

	let newExpression;
	let validChar;

	for (let index = 0; index < expression.length; index++) {
		validChar = 0;

		for (let index2 = 0; index2 < reference.length; index2++) {
			if (expression.charAt(index) == reference.charAt(index2)) {
				validChar = 1;
			}
		}

		if (validChar == 0) {
			expression = "0";
			break;
		}
	}

	if (expression.length < numberFigures) {
		newExpression = expression;

		for (let index = 0; index < (numberFigures - expression.length); index++) {
			newExpression = reference.charAt(0) + newExpression;
		}
	}

	if (expression.length >= numberFigures) {
		newExpression = expression.substr(0, numberFigures);
	}


	return newExpression;

}

function validateBinary(expression: any, numberFigures: any) {
	return validateExpression(expression, numberFigures, "01");
}

function validateHexadecimal(expression: any, numberFigures: any) {
	return validateExpression(expression.toUpperCase(), numberFigures, "0123456789ABCDEF");
}

function integerFitRange(value: any, min: any, max: any) {

	let temp;

	temp = parseInt(Math.floor(value) + "");

	if (temp < min) {
		temp = min;
	}
	if (temp > max) {
		temp = max;
	}

	return temp;

}

// **********************************************************************
// *			      	  OBJECTS				*
// **********************************************************************

// +--------------------------------------------------------------------+
// |			     Scientific Number				|
// +--------------------------------------------------------------------+

function ScientificNumber(sign: any, firstCoefficient: any, otherCoefficients: any, exponent: any) {

	this.sign = sign;
	this.firstCoefficient = firstCoefficient;
	this.otherCoefficients = otherCoefficients;
	this.exponent = exponent;
	this.NaN = 0;
	this.infinity = 0;

	this.getNumber = ScientificNumber_getNumber;
	this.parse = ScientificNumber_parse;
	this.round = ScientificNumber_round;
	this.roundRemoveExtraZeros = ScientificNumber_roundRemoveExtraZeros;
}

function ScientificNumber_getNumber() {
	let sign;

	if (this.NaN == 0) {

		if (this.sign == "-") {
			sign = "-";
		}
		else {
			sign = "";
		}

		if (this.infinity == 0) {

			return (sign + this.firstCoefficient + "." + this.otherCoefficients + "E" + this.exponent);
		}
		else {
			return (sign + "infinity");
		}

	}
	else {
		return "NaN";
	}

}

function ScientificNumber_parse(numberString: any) {

	let char;
	let state;

	let PLUS;
	let MINUS;
	let DOT;
	let NZF;
	let F;
	let Z;
	let E;

	let sign;
	let coefficientFirst;
	let coefficientOthers;
	let expSign;
	let exponent;

	let noZeroCoefficientOthers;

	let temp;

	PLUS = "+";
	MINUS = "-";
	DOT = ".";
	NZF = "123456789";
	F = "0123456789";
	Z = "0";
	E = "Ee";

	sign = "+";
	coefficientFirst = "";
	coefficientOthers = "";
	expSign = 1;
	let shift = 0;
	exponent = "";

	state = 0;

	for (let index = 0; index < numberString.length; index++) {

		char = numberString.charAt(index);

		switch (state) {
			case 0:
				state = -1;
				if (PLUS.indexOf(char) != -1) { state = 1; sign = "+"; }
				if (MINUS.indexOf(char) != -1) { state = 2; sign = "-"; }
				if (NZF.indexOf(char) != -1) { state = 3; sign = "+"; coefficientFirst = char; }
				if (DOT.indexOf(char) != -1) { state = 4; sign = "+"; shift--; }
				if (Z.indexOf(char) != -1) { state = 5; sign = "+"; }
				break;

			case 1:
				state = -1;
				if (NZF.indexOf(char) != -1) { state = 3; coefficientFirst = char; }
				if (DOT.indexOf(char) != -1) { state = 4; shift--; }
				if (Z.indexOf(char) != -1) { state = 5; }
				break;

			case 2:
				state = -1;
				if (NZF.indexOf(char) != -1) { state = 3; coefficientFirst = char; }
				if (DOT.indexOf(char) != -1) { state = 4; shift--; }
				if (Z.indexOf(char) != -1) { state = 5; }
				break;

			case 3:
				state = -1;
				if (DOT.indexOf(char) != -1) { state = 6; }
				if (F.indexOf(char) != -1) { state = 3; shift++; coefficientOthers += char; }
				if (E.indexOf(char) != -1) { state = 9; }
				break;

			case 4:
				state = -1;
				if (NZF.indexOf(char) != -1) { state = 8; coefficientFirst = char; }
				if (Z.indexOf(char) != -1) { state = 7; shift--; }
				break;

			case 5:
				state = -1;
				if (NZF.indexOf(char) != -1) { state = 3; coefficientFirst = char; }
				if (DOT.indexOf(char) != -1) { state = 4; shift--; }
				if (Z.indexOf(char) != -1) { state = 5; }
				break;

			case 6:
				state = -1;
				if (F.indexOf(char) != -1) { state = 6; coefficientOthers += char; }
				if (E.indexOf(char) != -1) { state = 9; }
				break;

			case 7:
				state = -1;
				if (Z.indexOf(char) != -1) { state = 7; shift--; }
				if (NZF.indexOf(char) != -1) { state = 8; coefficientFirst = char; }
				if (E.indexOf(char) != -1) { state = 9; }
				break;

			case 8:
				state = -1;
				if (F.indexOf(char) != -1) { state = 8; coefficientOthers += char; }
				if (E.indexOf(char) != -1) { state = 9; }
				break;

			case 9:
				state = -1;
				if (PLUS.indexOf(char) != -1) { state = 10; expSign = 1; }
				if (MINUS.indexOf(char) != -1) { state = 11; expSign = -1; }
				if (F.indexOf(char) != -1) { state = 12; expSign = 1; exponent += char; }
				break;

			case 10:
				state = -1;
				if (F.indexOf(char) != -1) { state = 12; exponent += char; }
				break;

			case 11:
				state = -1;
				if (F.indexOf(char) != -1) { state = 12; exponent += char; }
				break;

			case 12:
				state = -1;
				if (F.indexOf(char) != -1) { state = 12; exponent += char; }
				break;

		}

	}


	noZeroCoefficientOthers = "";

	if (state == -1) {

		if (numberString.toLowerCase() == "infinity") {
			this.sign = "+";
			this.firstCoefficient = "";
			this.otherCoefficients = "";
			this.exponent = 0;
			this.NaN = 0;
			this.infinity = 1;

			return 0;
		}

		else if (numberString.toLowerCase() == "+infinity") {
			this.sign = "+";
			this.firstCoefficient = "";
			this.otherCoefficients = "";
			this.exponent = 0;
			this.NaN = 0;
			this.infinity = 1;

			return 0;
		}

		else if (numberString.toLowerCase() == "-infinity") {
			this.sign = "-";
			this.firstCoefficient = "";
			this.otherCoefficients = "";
			this.exponent = 0;
			this.NaN = 0;
			this.infinity = 1;

			return 0;
		}

		else {

			this.sign = "";
			this.firstCoefficient = "";
			this.otherCoefficients = "";
			this.exponent = 0;
			this.NaN = 1;
			this.infinity = 0;

			return -1;

		}


	}

	state = 0;

	for (let index = coefficientOthers.length - 1; index >= 0; index--) {
		char = coefficientOthers.charAt(index);

		switch (state) {
			case 0:
				if (Z.indexOf(char) != -1) { state = 1; }
				if (NZF.indexOf(char) != -1) { state = 2; noZeroCoefficientOthers = char + noZeroCoefficientOthers; }
				break;

			case 1:
				if (Z.indexOf(char) != -1) { state = 1; }
				if (NZF.indexOf(char) != -1) { state = 2; noZeroCoefficientOthers = char + noZeroCoefficientOthers; }
				break;

			case 2:
				if (F.indexOf(char) != -1) { state = 2; noZeroCoefficientOthers = char + noZeroCoefficientOthers; }
				break;
		}

	}

	if (exponent == "") {
		exponent = "0";
	}
	exponent = ((parseInt(exponent, 10)) * expSign + shift) + "";

	if (noZeroCoefficientOthers == "") {
		noZeroCoefficientOthers = "0";
	}

	if (coefficientFirst == "") {
		coefficientFirst = "0";
		noZeroCoefficientOthers = "0";
		expSign = "+";
		exponent = "0";
	}

	this.sign = sign;
	this.firstCoefficient = coefficientFirst;
	this.otherCoefficients = noZeroCoefficientOthers;
	this.exponent = parseInt(exponent, 10);
	this.NaN = 0;
	this.infinity = 0;

	return 0;

}

function ScientificNumber_round(numberFigures: any) {

	let otherCoefficients;
	let completeNumber;

	let char;
	let carry;
	let sum;

	let roundedNumber;

	otherCoefficients = completeZerosRight(this.otherCoefficients, numberFigures);

	completeNumber = this.firstCoefficient + otherCoefficients;

	if (parseInt(completeNumber.charAt(completeNumber.length - 1), 10) >= 5) {
		carry = 1;
	}
	else {
		carry = 0;
	}

	completeNumber = completeNumber.substr(0, completeNumber.length - 1);
	roundedNumber = "";

	for (let index = completeNumber.length - 1; index >= 0; index--) {

		char = completeNumber.charAt(index);

		sum = parseInt(char, 10) + carry;

		if (sum == 10) {
			sum = 0;
			carry = 1;
		}
		else {
			carry = 0;
		}

		roundedNumber = sum + roundedNumber;

	}

	if (carry == 1) {
		this.firstCoefficient = "1";
		this.otherCoefficients = roundedNumber;
		this.exponent = this.exponent + 1;
	}
	else {
		this.firstCoefficient = roundedNumber.substr(0, 1);
		this.otherCoefficients = roundedNumber.substr(1);
	}

}

function ScientificNumber_roundRemoveExtraZeros(numberFigures: any) {
	this.round(numberFigures);
	this.parse(this.getNumber());
}

// +--------------------------------------------------------------------+
// |			     Decimal Number				|
// +--------------------------------------------------------------------+

function DecimalNumber(decInt: any, decFrac: any, sign: any, status: any) {

	// +0:
	//
	// 	integer = "0"
	//	fractional = "0"
	//	sign = "+"
	//	status = "normal"
	//
	// -0:
	//
	// 	integer = "0"
	//	fractional = "0"
	//	sign = "-"
	//	status = "normal"
	//
	// +infinity:
	//
	// 	integer = ""
	//	fractional = ""
	//	sign = "+"
	//	status = "infinity"
	//
	// -infinity:
	//
	// 	integer = ""
	//	fractional = ""
	//	sign = "-"
	//	status = "infinity"
	//
	// NaN:
	//
	// 	integer = ""
	//	fractional = ""
	//	sign = ""
	//	status = "NaN"
	//
	//
	// 12.53:
	//
	// 	integer = "12"
	//	fractional = "53"
	//	sign = "+"
	//	status = "normal"
	//
	// -12.53:
	//
	// 	integer = "12"
	//	fractional = "53"
	//	sign = "-"
	//	status = "normal"
	//

	this.integer = decInt;
	this.fractional = decFrac;
	this.sign = sign;
	this.status = status;

	this.getNumber = DecimalNumber_getNumber;
	this.fromScientific = DecimalNumber_fromScientific;
	this.fromSingle = DecimalNumber_fromSingle;
	this.fromDouble = DecimalNumber_fromDouble;
}

function DecimalNumber_getNumber() {
	if (this.status == "NaN") {
		return this.status;
	}
	else if (this.status == "infinity") {
		return (this.sign + this.status);
	}
	else {
		return (this.sign + this.integer + "." + this.fractional);
	}
}

function DecimalNumber_fromScientific(sciNumber: any, expMin: any, expMax: any) {

	let integer;
	let fractional;



	if (sciNumber.NaN == 0) {

		if (sciNumber.infinity == 1) {
			this.integer = "0";
			this.fractional = "0";
			this.sign = sciNumber.sign;
			this.status = "infinity";
		}

		else if ((sciNumber.exponent >= expMin) && (sciNumber.exponent <= expMax)) {

			if (sciNumber.exponent < 0) {
				integer = "0";
				fractional = padZerosLeft(sciNumber.firstCoefficient + sciNumber.otherCoefficients, -1 * sciNumber.exponent - 1);
			}

			if (sciNumber.exponent >= 0) {
				integer = (sciNumber.firstCoefficient + (sciNumber.otherCoefficients).substr(0, sciNumber.exponent));
				integer = padZerosRight(integer, (sciNumber.exponent - (sciNumber.otherCoefficients).length));
				fractional = (sciNumber.otherCoefficients).substr(sciNumber.exponent);

				if (fractional == "") {
					fractional = "0";
				}
			}

			this.integer = integer;
			this.fractional = fractional;
			this.sign = sciNumber.sign;
			this.status = "normal";

		}

		else if (sciNumber.exponent < expMin) {
			this.integer = "0";
			this.fractional = "0";
			this.sign = sciNumber.sign;
			this.status = "normal";
		}

		else if (sciNumber.exponent > expMax) {
			this.integer = "";
			this.fractional = "";
			this.sign = sciNumber.sign;
			this.status = "infinity";
		}

	}
	else {
		this.integer = "";
		this.fractional = "";
		this.sign = "";
		this.status = "NaN";

	}

}

function DecimalNumber_fromSingle(ieeeNumber: any) {

	let mantissa;
	let exponent;
	let sign;

	let binInt;
	let binFrac;

	let decInt;
	let decFrac;

	let status;

	let temp;

	mantissa = ieeeNumber.mantissa;
	exponent = ieeeNumber.exponent;
	sign = ieeeNumber.sign;

	if (exponent == 128) {
		if (parseInt(mantissa, 10) == 0) {
			status = "infinity";
		}
		else {
			status = "NaN";
		}
	}
	else {
		if (exponent == -127) {
			if (parseInt(mantissa, 10) == 0) {
				status = "zero";
			}
			else {
				exponent = -126;
				mantissa = "0" + mantissa;
				status = "denormalized";
			}
		}
		else {
			mantissa = "1" + mantissa;
			status = "normalized";
		}

		temp = mantissa.length;

		for (let index = 0; index < 24 - temp; index++) {
			mantissa = mantissa + "0";
		}

		for (let index = 0; index < (-exponent - 1); index++) {
			mantissa = "0" + mantissa;
		}

		for (let index = 0; index < (exponent - 23); index++) {
			mantissa = mantissa + "0";
		}



		binInt = mantissa.substr(0, exponent + 1);
		binFrac = mantissa.substr(binInt.length);

		decInt = bin2decInt(binInt);
		decFrac = bin2decFrac(binFrac, 149);

	}

	this.integer = decInt;
	this.fractional = decFrac;
	this.sign = sign;
	this.status = status;

}

function DecimalNumber_fromDouble(ieeeNumber: any) {

	let mantissa;
	let exponent;
	let sign;

	let binInt;
	let binFrac;

	let decInt;
	let decFrac;

	let status;

	let temp;

	mantissa = ieeeNumber.mantissa;
	exponent = ieeeNumber.exponent;
	sign = ieeeNumber.sign;

	if (exponent == 1024) {
		if (parseInt(mantissa, 10) == 0) {
			status = "infinity";
		}
		else {
			status = "NaN";
		}
	}
	else {
		if (exponent == -1023) {
			if (parseInt(mantissa, 10) == 0) {
				status = "zero";
			}
			else {
				exponent = -1022;
				mantissa = "0" + mantissa;
				status = "denormalized";
			}
		}
		else {
			mantissa = "1" + mantissa;
			status = "normalized";
		}

		temp = mantissa.length;

		for (let index = 0; index < 53 - temp; index++) {
			mantissa = mantissa + "0";
		}

		for (let index = 0; index < (-exponent - 1); index++) {
			mantissa = "0" + mantissa;
		}

		for (let index = 0; index < (exponent - 52); index++) {
			mantissa = mantissa + "0";
		}

		binInt = mantissa.substr(0, exponent + 1);
		binFrac = mantissa.substr(binInt.length);

		decInt = bin2decInt(binInt);
		decFrac = bin2decFrac(binFrac, 1074);

	}

	this.integer = decInt;
	this.fractional = decFrac;
	this.sign = sign;
	this.status = status;

}

// +--------------------------------------------------------------------+
// |			        IEEE Single				|
// +--------------------------------------------------------------------+

function IEEESingle(mantissa: any, exponent: any, sign: any) {

	this.mantissa = mantissa;
	this.exponent = exponent;
	this.sign = sign;

	this.getBinary = IEEESingle_getBinary;
	this.getHex = IEEESingle_getHex;
	this.fromDecimal = IEEESingle_fromDecimal;
	this.fromHex = IEEESingle_fromHex;

}

function IEEESingle_getBinary() {

	let exponent;
	let sign;

	let temp;

	exponent = dec2binInt((this.exponent + 127) + "");

	temp = 8 - exponent.length;

	for (let index = 0; index < temp; index++) {
		exponent = "0" + exponent;
	}

	if (this.sign == "+") {
		sign = "0";
	}
	else {
		sign = "1";
	}

	return (sign + exponent + this.mantissa);

}

function IEEESingle_getHex() {
	return bin2hex(this.getBinary());
}

function IEEESingle_fromHex(hexNumber: any) {

	let binNumber;

	hexNumber = completeZerosLeft(hexNumber, 8);

	binNumber = hex2bin(hexNumber);

	if (binNumber.substr(0, 1) == "0") {
		this.sign = "+";
	}
	else {
		this.sign = "-";
	}

	this.exponent = parseInt(binNumber.substr(1, 8), 2) - 127;
	this.mantissa = binNumber.substr(9, 23);

}

function IEEESingle_fromDecimal(decNumber: any) {

	let decInt;
	let decFrac;
	let sign;

	decInt = decNumber.integer;
	decFrac = decNumber.fractional;
	sign = decNumber.sign;

	let binInt;
	let binFrac;
	let allString;
	let deNorm;

	let exponent;
	let mantissa;
	let temp;

	if (decNumber.status == "infinity") {
		this.mantissa = "00000000000000000000000";
		this.exponent = 128;
		this.sign = sign;
	}

	else if (decNumber.status == "NaN") {
		this.mantissa = "11111111111111111111111";
		this.exponent = 128;
		this.sign = "+";

	}

	else {

		binInt = dec2binInt(decInt);

		if (binInt != "0") {
			binFrac = dec2binFrac(decFrac, 25 - binInt.length, 0);
		}
		else {

			binFrac = dec2binFrac(decFrac, 25, 1);
		}

		if ((parseInt(binInt, 10) == 0) && (parseInt(binFrac, 10) == 0)) {

			exponent = -127;
			mantissa = "00000000000000000000000";
		}
		else {
			allString = binInt + "." + binFrac;

			exponent = allString.indexOf(".") - allString.indexOf("1");

			if (exponent > 0) {
				exponent--;
			}

			if (exponent < -126) {
				deNorm = -126 - exponent;
			}
			else {
				deNorm = 0;
			}

			allString = binInt + binFrac;

			mantissa = allString.substr(allString.indexOf("1") + 1 - deNorm, 24);

			temp = mantissa.length

			for (let index = 0; index < (23 - temp); index++) {
				mantissa += "0";
			}

			temp = roundBinary(mantissa.substr(0, 23), parseInt(mantissa.charAt(23), 10));


			if (temp.length > 23) {
				mantissa = temp.substr(1);
				exponent++;
			}
			else {
				mantissa = temp;
			}

			if (exponent < -126) {
				exponent = -127;
			}

			if (exponent > 127) {
				exponent = 128;
				mantissa = "00000000000000000000000";
			}
		}

		this.mantissa = mantissa;
		this.exponent = exponent;
		this.sign = sign;

	}

}

// +--------------------------------------------------------------------+
// |			        IEEE Double				|
// +--------------------------------------------------------------------+

function IEEEDouble(mantissa: any, exponent: any, sign: any) {

	this.mantissa = mantissa;
	this.exponent = exponent;
	this.sign = sign;

	this.getBinary = IEEEDouble_getBinary;
	this.getHex = IEEEDouble_getHex;
	this.fromDecimal = IEEEDouble_fromDecimal;
	this.fromHex = IEEEDouble_fromHex;
}

function IEEEDouble_getBinary() {

	let exponent;
	let sign;

	let temp;

	exponent = dec2binInt((this.exponent + 1023) + "");

	temp = 11 - exponent.length;

	for (let index = 0; index < temp; index++) {
		exponent = "0" + exponent;
	}

	if (this.sign == "+") {
		sign = "0";
	}
	else {
		sign = "1";
	}

	return (sign + exponent + this.mantissa);

}

function IEEEDouble_getHex() {
	return bin2hex(this.getBinary());
}

function IEEEDouble_fromHex(hexNumber: any) {

	let binNumber;

	hexNumber = completeZerosLeft(hexNumber, 16);

	binNumber = hex2bin(hexNumber);

	if (binNumber.substr(0, 1) == "0") {
		this.sign = "+";
	}
	else {
		this.sign = "-";
	}

	this.exponent = parseInt(binNumber.substr(1, 11), 2) - 1023;
	this.mantissa = binNumber.substr(12, 52);

}

function IEEEDouble_fromDecimal(decNumber: any) {

	let decInt;
	let decFrac;
	let sign;

	decInt = decNumber.integer;
	decFrac = decNumber.fractional;
	sign = decNumber.sign;

	let binInt;
	let binFrac;
	let allString;
	let deNorm;

	let exponent;
	let mantissa;
	let temp;

	if (decNumber.status == "infinity") {
		this.mantissa = "0000000000000000000000000000000000000000000000000000";
		this.exponent = 1024;
		this.sign = sign;
	}

	else if (decNumber.status == "NaN") {
		this.mantissa = "1111111111111111111111111111111111111111111111111111";
		this.exponent = 1024;
		this.sign = "+";

	}

	else {

		binInt = dec2binInt(decInt);

		if (binInt != "0") {
			binFrac = dec2binFrac(decFrac, 54 - binInt.length, 0);
		}
		else {
			binFrac = dec2binFrac(decFrac, 54, 1);
		}

		if ((parseInt(binInt, 10) == 0) && (parseInt(binFrac, 10) == 0)) {

			exponent = -1023;
			mantissa = "0000000000000000000000000000000000000000000000000000";
		}
		else {

			allString = binInt + "." + binFrac;

			exponent = allString.indexOf(".") - allString.indexOf("1");

			if (exponent > 0) {
				exponent--;
			}

			if (exponent < -1022) {
				deNorm = -1022 - exponent;
			}
			else {
				deNorm = 0;
			}

			allString = binInt + binFrac;

			mantissa = allString.substr(allString.indexOf("1") + 1 - deNorm, 53);

			temp = mantissa.length

			for (let index = 0; index < (52 - temp); index++) {
				mantissa += "0";
			}

			temp = roundBinary(mantissa.substr(0, 52), parseInt(mantissa.charAt(52), 10));

			if (temp.length > 52) {
				mantissa = temp.substr(1);
				exponent++;
			}
			else {
				mantissa = temp;
			}

			if (exponent < -1022) {
				exponent = -1023;
			}

			if (exponent > 1023) {
				exponent = 1024;
				mantissa = "0000000000000000000000000000000000000000000000000000";
			}

		}

		this.mantissa = mantissa;
		this.exponent = exponent;
		this.sign = sign;

	}
}

// **********************************************************************
// *			    HIGH LEVEL CONVERSION			*
// **********************************************************************

function dec2Float(expression: any) {

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	// @ts-ignore
	let single = new IEEESingle("", "", "");

	sci.parse(expression);
	dec.fromScientific(sci, -45, 45);
	single.fromDecimal(dec);

	return (single.getHex());

}

function dec2Double(expression: any) {

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	// @ts-ignore
	let double = new IEEEDouble("", "", "");

	sci.parse(expression);
	dec.fromScientific(sci, -324, 324);
	double.fromDecimal(dec);

	return (double.getHex());

}

function float2Dec(expression: any, numberFigures: any) {

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	// @ts-ignore
	let single = new IEEESingle("", "", "");

	single.fromHex(expression);
	dec.fromSingle(single);
	sci.parse(dec.getNumber());

	if (numberFigures != -1) {
		sci.roundRemoveExtraZeros(numberFigures);
	}

	return (sci.getNumber());

}

function double2Dec(expression: any, numberFigures: any) {

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	// @ts-ignore
	let double = new IEEEDouble("", "", "");

	double.fromHex(expression);
	dec.fromDouble(double);
	sci.parse(dec.getNumber());

	if (numberFigures != -1) {
		sci.roundRemoveExtraZeros(numberFigures);
	}


	return (sci.getNumber());

}

function mostAccurateFloat(expression: any, numberFigures: any) {

	return float2Dec(dec2Float(expression), numberFigures);

}

function mostAccurateDouble(expression: any, numberFigures: any) {

	return double2Dec(dec2Double(expression), numberFigures);

}

function unsignedCharDec2Bin(expression: any) {

	let compareArray = new Array(128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");

	sci.parse(expression);
	dec.fromScientific(sci, 0, 2);
	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, 0, 255);

	return fastDec2Bin(compareArray, 8, value);

}

function unsignedCharBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 255);

	return value;

}

function mostAccurateUnsignedChar(expression: any) {

	return unsignedCharBin2Dec(unsignedCharDec2Bin(expression));

}

function signedCharDec2Bin(expression: any) {

	let compareArray = new Array(128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	sci.parse(expression);
	dec.fromScientific(sci, 0, 2);

	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, -128, 127);

	if (value < 0) {
		value += compareArray[0] * 2;
	}

	return fastDec2Bin(compareArray, 8, value);

}

function signedCharBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 255);

	if (value > 127) {
		value -= 256;
	}

	return value;

}

function mostAccurateSignedChar(expression: any) {

	return signedCharBin2Dec(signedCharDec2Bin(expression));

}

function unsignedShortDec2Bin(expression: any) {

	let compareArray = new Array(32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	sci.parse(expression);
	dec.fromScientific(sci, 0, 5);

	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, 0, 65535);

	return fastDec2Bin(compareArray, 16, value);

}

function unsignedShortBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 65535);

	return value;

}

function mostAccurateUnsignedShort(expression: any) {

	return unsignedShortBin2Dec(unsignedShortDec2Bin(expression));

}

function signedShortDec2Bin(expression: any) {

	let compareArray = new Array(32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	sci.parse(expression);
	dec.fromScientific(sci, 0, 5);

	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, -32768, 32767);

	if (value < 0) {
		value += compareArray[0] * 2;
	}

	return fastDec2Bin(compareArray, 16, value);

}

function signedShortBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 65535);

	if (value > 32767) {
		value -= 65536;
	}

	return value;

}

function mostAccurateSignedShort(expression: any) {

	return signedShortBin2Dec(signedShortDec2Bin(expression));

}

function unsignedIntDec2Bin(expression: any) {

	let compareArray = new Array(2147483648, 1073741824, 536870912, 268435456, 134217728, 67108864, 33554432, 16777216, 8388608, 4194304, 2097152, 1048576, 524288, 262144, 131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	sci.parse(expression);
	dec.fromScientific(sci, 0, 9);

	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, 0, 4294967295);

	return fastDec2Bin(compareArray, 32, value);

}

function unsignedIntBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 4294967295);

	return value;

}

function mostAccurateUnsignedInt(expression: any) {

	return unsignedIntBin2Dec(unsignedIntDec2Bin(expression));

}

function signedIntDec2Bin(expression: any) {

	let compareArray = new Array(2147483648, 1073741824, 536870912, 268435456, 134217728, 67108864, 33554432, 16777216, 8388608, 4194304, 2097152, 1048576, 524288, 262144, 131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1);

	let value;

	// @ts-ignore
	let sci = new ScientificNumber("", "", "", "");
	// @ts-ignore
	let dec = new DecimalNumber("", "", "", "");
	sci.parse(expression);
	dec.fromScientific(sci, 0, 9);

	value = dec.integer;

	if (dec.sign == "-") {
		value *= -1;
	}

	value = integerFitRange(value, -2147483648, 2147483647);

	if (value < 0) {
		value += compareArray[0] * 2;
	}

	return fastDec2Bin(compareArray, 32, value);

}

function signedIntBin2Dec(expression: any) {

	let value;

	value = fastBin2Dec(expression);

	value = integerFitRange(value, 0, 4294967295);

	if (value > 2147483647) {
		value -= 4294967296;
	}

	return value;

}

function mostAccurateSignedInt(expression: any) {

	return signedIntBin2Dec(signedIntDec2Bin(expression));

}


// **********************************************************************
// *			          FORMATTING				*
// **********************************************************************
function formatInput(expression: any, maxChar: any) {

	if (expression.length > maxChar) {
		return expression.substr(0, maxChar) + "...";
	}
	else {
		return expression;
	}

}


// **********************************************************************
// *			     ELEMENTS EXTRACTION			*
// **********************************************************************

function getFloatSign(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(0, 1);

}

function getFloatExponent(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(1, 8);

}

function getFloatMantissa(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(9, 23);

}

function getDoubleSign(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(0, 1);

}

function getDoubleExponent(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(1, 11);

}

function getDoubleMantissa(hexNumber: any) {

	let binNumber;

	binNumber = hex2bin(hexNumber);

	return binNumber.substr(12, 52);

}