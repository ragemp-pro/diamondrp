/// <reference path="../../declaration/server.ts" />

import {methods} from './methods';
import {enums} from '../enums';
import { vehInfoEntity } from './entity/vehInfoEntity';
import { vehicleInfoCarConf, vehClassNameConf } from '../../util/vehicles';
export type vehClassName = vehClassNameConf;

export interface vehicleInfoCar extends vehicleInfoCarConf {}

export let vehicleInfo = {
    find: (model:string|number) => {
        let hash = typeof model === "string" ? mp.joaat(model) : model
        return enums.vehicleInfo.find(itm => (itm.hash == hash || itm.hash == methods.hashToDb(hash) || (typeof model == "string" && itm.display_name.toLowerCase() == model.toLowerCase())));
    },
    findByVeh: (vehicle: VehicleMp) => {
        return enums.vehicleInfo.find(itm => (vehicle.modelhash == itm.hash || vehicle.model == itm.hash || vehicle.modelname == itm.display_name || itm.hash == mp.joaat(vehicle.modelname)));
    },
    /** Загрузка всех конфигов */
    loadAll: () => {
        methods.debug('vehicleInfo.loadAll');
        vehInfoEntity.findAll().then(items => {

            items.forEach(function (item) {
                vehicleInfo.add(item)
            });
            methods.debug('Vehicle Info Loaded: ' + enums.vehicleInfo.length);
        })
    },
    /** Системная функция, вызывать не требуется */
    add: (item:vehicleInfoCar) => {
        enums.vehicleInfo.push(item);
        mp.players.call('client:updateVehicleInfo', [[item]]);
    },
    /** Удалить конфиг */
    remove: (id:number) => {
        return new Promise((resolve, reject) => {
            vehInfoEntity.destroy(({where: {id}})).then(() => {
                enums.vehicleInfo.forEach((item, index) => {
                    if(item.id == id) enums.vehicleInfo.splice(index, 1);
                    mp.players.call('client:removeVehicleInfo', [item.id]);
                })
                resolve(true)
            })
        })
    },
    update: (values: Partial<vehicleInfoCar>, id:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            vehInfoEntity.update(values, { where: { id }, limit: 1}).then(res => {
                let en = enums.vehicleInfo.find(v => v.id === id);
                if(en){
                    let ind = enums.vehicleInfo.findIndex(v => v.id === id);
                    enums.vehicleInfo[ind] = { ...en, ...values };
                    mp.players.call('client:editVehicleInfo', [id, values]);
                }
                resolve();
            })
        })
    },
    /** Создать конфиг */
    create: (model: string, display_name: string, class_name: vehClassName, stock:number,fuel_full:number,fuel_min:number) => {

        vehInfoEntity.create({
            hash: mp.joaat(model),
            display_name,
            class_name,
            stock,
            fuel_full,
            fuel_min,
        }).then(item => {
            const id = item.id;
            vehicleInfo.add({ id, hash: mp.joaat(model), display_name, class_name, stock, fuel_full, fuel_min })
        }).catch(err => {
            console.error(err)
        })
    }
};
