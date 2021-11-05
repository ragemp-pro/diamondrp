import { menu } from '../modules/menu';
import { user } from '../user';
import { methods } from '../modules/methods';
import { parkPlaceEntity } from '../modules/entity/parkPlaceEntity';

let places: Map<
	number,
	{ x: number; y: number; z: number; rx: number; ry: number; rz: number; h: number; type: number }
> = new Map();

export const loadParkPlace = () => {
	parkPlaceEntity.findAll().then(datas => {
		datas.forEach(data => {
			places.set(data.id, { ...data })
		})
	});
}

/** Функция поиска ближайшего парковочного места
 * При type - player угла rotation мы не получим
 * По умолчанию - vehicle
 */
export function getParkPosition(
	position: Vector3Mp,
	range: number = 50,
	/**
    * + vehicle - Легковые (0) - По умолчанию
    * + truck - Большие грузовики (1)
    * + bike - Мото (2)
    * + plane - Самолёты (3)
    * + heli - Вертолёты (4)
    * + player - Люди (5)
    * + all - Все (6)
   */
	type: 'vehicle' | 'truck' | 'bike' | 'plane' | 'heli' | 'player' | 'all' = 'vehicle'
) {
	let searchKey = 0;
	switch (type) {
		case 'vehicle':
			searchKey = 0;
			break;
		case 'bike':
			searchKey = 1;
			break;
		case 'truck':
			searchKey = 2;
			break;
		case 'heli':
			searchKey = 3;
			break;
		case 'plane':
			searchKey = 4;
			break;
		case 'player':
			searchKey = 5;
			break;
		case 'all':
			searchKey = 6;
			break;
		default:
			searchKey = 7;
			break;
	}
	if (!position) return null;
	if (typeof position.x != "number" || typeof position.y != "number" || typeof position.y != "number") return null;
	let search = [...places].map(([id, data]) => {
		let pos2 = new mp.Vector3(data.x, data.y, data.z)
		if (data.type <= searchKey && methods.distanceToPos(pos2, position) <= range) return { ...data, id, pos: pos2 }
	});
	search.sort((a, b) => {
		if (methods.distanceToPos(a.pos, position) < methods.distanceToPos(b.pos, position)) return -1
		else return 1;
	})
	let freeFound: {
		id: number;
		pos: Vector3Mp;
		rot: Vector3Mp;
		x: number;
		y: number;
		z: number;
		rx?: number;
		ry?: number;
		rz?: number;
		h: number;
		type: number;
	} = null;
	search.map(data => {
		if (!data) return;
		if (!freeFound) {
			let free = true;
			mp.vehicles.forEachInRange(position, range, (vehicle) => {
				if (free) {
					if (vehicle.dist(data.pos) < 3) return free = false;
				}
			})
			if (free) {
				freeFound = { ...data, rot: new mp.Vector3(data.rx, data.ry, data.rz) }
			}
		}
	})
	return freeFound;
}

// chat.registerCommand('parking', (player) => {
// 	spawnParkMenu(player);
// });


export function spawnParkMenu(player: PlayerMp) {
	if (!user.isAdminNow(player)) return player.notify('~r~Доступно только для администрации');
	let m = menu.new(player, 'Точки спавна', 'Действия');
	let type = 0;
	let lastID = 0;
	m.newItem({
		name: 'Новая точка',
		type: 'list',
		desc: 'Не забудьте выбрать правильный тип\n~r~Внимание!!! лучше делать в ТС',
		list: ['Легковые ТС', 'Мото', 'Большие грузовики', 'Вертолёты', 'Самолёты', 'Люди', 'Все'],
		onchange: (value) => {
			type = value;
		},
		onpress: () => {
			let x = 0.0;
			let y = 0.0;
			let z = 0.0;
			let rx = 0.0;
			let ry = 0.0;
			let rz = 0.0;
			let pos = player.vehicle ? player.vehicle.position : player.position;
			x = pos.x;
			y = pos.y;
			z = pos.z;
			let rot = player.vehicle ? player.vehicle.rotation : { x: 0.0, y: 0.0, z: 0.0 };
			rx = rot.x;
			ry = rot.y;
			rz = rot.z;
			let h = player.vehicle ? player.vehicle.heading : player.heading;
			let fnd = 0;
			places.forEach((items, id) => {
				if (!fnd && methods.distanceToPos(pos, new mp.Vector3(items.x, items.y, items.z)) < 3) fnd = id;
			})
			if (fnd) return player.notify("В данном месте уже есть позиция, ID - " + fnd);
			parkPlaceEntity.create({
				type, x, y, z, rx, ry, rz, h
			}).then(data => {
				lastID = data.id;
				places.set(lastID, { type, x, y, z, rx, ry, rz, h });
				player.notify('~g~Точка добавлена (ID: ' + lastID + ')');
			})
		}
	});
	m.newItem({
		name: 'Удалить последнюю точку',
		onpress: () => {
			if (lastID == 0) return player.notify('~r~Удалять нечего');
			parkPlaceEntity.destroy({ where: { id: lastID } }).then(() => {
				player.notify('~g~Точка удалена');
			})
			places.delete(lastID);
			lastID = 0;
		}
	});
	m.newItem({
		name: 'ID ближайшей точки',
		onpress: () => {
			let data = getParkPosition(player.position, 40);
			user.setWaypoint(player, data.x, data.y);
			player.notify("ID ближайшей точки - " + data.id);
		}
	});
	m.newItem({
		name: 'Удалить точку по ID',
		onpress: () => {
			menu.input(player, "Введите ID").then(d => {
				let id = methods.parseInt(d);
				if (!places.has(id)) return player.notify("ID не существует");
				parkPlaceEntity.destroy({ where: { id: id } }).then(() => {
					player.notify('~g~Точка удалена');
				})
				places.delete(id);
			})
		}
	});
	m.open();
}
