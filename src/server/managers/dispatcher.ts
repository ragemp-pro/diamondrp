/// <reference path="../../declaration/server.ts" />

import { user } from '../user'
import { weather } from './weather'
import { methods } from '../modules/methods'
import { fractionList } from '../../util/fractions';
import { gtaStrToHtml } from '../../util/string';
import { notifyPictures } from '../modules/entity/userNotifyEntity';

let generateDispatchId = 1;

let countTaxi = 0;
let dispatchTaxiId = 0;
export function dispatchTaxiIdSet(){
    dispatchTaxiId++;
    const ids = dispatchTaxiId;
    return ids;
}

interface dispatchItem {
    id: number;
    accept?:string;
    title: string;
    desc: string;
    // street1: string;
    withCoord?: boolean;
    posX?: number;
    posY?: number;
    when: number;
    authorid?: number;
}

setTimeout(() => {
    for (let i = 0; i < 100; i++) dispatcher.data.push([])
    mp.events.addRemoteCounted(
        'server:dispatcher:callFraction',
        (player, fractions:string, title, desc) => {
            dispatcher.sendPos(title, desc, player.position, true, player, JSON.parse(fractions));
        }
    );
}, 1000)



export let dispatcher = {
    data: <dispatchItem[][]>[],
    sendPosImage: function (title: string, desc: string, author: string, icon: notifyPictures, pos: Vector3Mp, fraction: number | number[]) {
        generateDispatchId++;
        const id = generateDispatchId;
        let time = methods.getTimeStamp()
        if (fraction){
            if (typeof fraction == "number") fraction = [fraction]
            fraction.map(fraction => {
                dispatcher.data[fraction].push({
                    id,
                    title: gtaStrToHtml(title),
                    desc: gtaStrToHtml(desc),
                    posX: pos.x,
                    posY: pos.y,
                    withCoord: true,
                    when: time
                })

                methods.notifyWithPictureToFraction(title, author, desc, icon, fraction)
            })
            return;
        }
        
    },
    sendPos: function(title:string, desc:string, pos:Vector3Mp, withCoord = true, author?:PlayerMp, fraction?:number|number[]) {
        generateDispatchId++;
        const id = generateDispatchId;
        let time = methods.digitFormat(weather.getHour()) + ':' + methods.digitFormat(weather.getMin());
        let times = methods.getTimeStamp()
        if (fraction){
            if (typeof fraction == "number") fraction = [fraction]
            fraction.map(fraction => {
                dispatcher.data[fraction].push({
                    id,
                    title: gtaStrToHtml(title),
                    desc: gtaStrToHtml(desc),
                    posX: pos.x,
                    posY: pos.y,
                    withCoord,
                    when: times,
                    authorid: author ? user.getId(author) : null
                })
                mp.players.forEach(function (player) {
                    if (user.getPlayerFraction(player) == fraction)
                        player.call("client:dispatcher:addDispatcherList", [title, desc, time, pos.x, pos.y, pos.z, withCoord]);
                });
            })
            return;
        }
        dispatcher.data.map(item => {
            item.push({
                id, 
                title: gtaStrToHtml(title), 
                desc: gtaStrToHtml(desc), 
                posX: pos.x, 
                posY: pos.y, 
                withCoord, 
                when: times,
                authorid: author ? user.getId(author) : null
            })
        })
        
        mp.players.forEach(function(player) {
            if(title == `[EMS] Код 3` && desc == `Человек без сознания` && !user.isEms(player)){
                return;
            }
            if (user.isFib(player) || user.isEms(player) || user.isSapd(player) || user.isSheriff(player) || user.isPrison(player))
                player.call("client:dispatcher:addDispatcherList", [title, desc, time, pos.x, pos.y, pos.z, withCoord]);
        });
    },

    sendLocalPos: function(title:string, desc:string, pos:Vector3Mp, fractionId:number, withCoord = true) {
        methods.debug('dispatcher.sendLocalPos');
        generateDispatchId++;
        const id = generateDispatchId;
        dispatcher.data[fractionId].push({
            id,
            title: gtaStrToHtml(title),
            desc: gtaStrToHtml(desc), 
            posX: pos.x,
            posY: pos.y,
            withCoord,
            when: methods.getTimeStamp()
        })
        let time = methods.digitFormat(weather.getHour()) + ':' + methods.digitFormat(weather.getMin());
        mp.players.forEach(function(player) {
            if (user.get(player, 'fraction_id') == fractionId)
                player.call("client:dispatcher:addDispatcherList", [title, desc, time, pos.x, pos.y, pos.z, withCoord]);
        });
    },

    sendTaxiPos: function(title:string, desc:string, pos:Vector3Mp, taxiType = 'taxi1') {
        dispatchTaxiId++;
        const ids = dispatchTaxiId;
        methods.debug('dispatcher.sendTaxiPos');
        //TODO BLACKOUT
        let time = methods.digitFormat(weather.getHour()) + ':' + methods.digitFormat(weather.getMin());
        mp.players.forEach(function(player) {
            if (methods.distanceToPos(player.position, pos) < 1000) {
                if (user.get(player, 'job') == taxiType)
                    player.call("client:dispatcher:addDispatcherTaxiList", [title, desc, time, pos.x, pos.y, pos.z, ids]);
            }
        });
    },

    sendTaxiPosForPlayer: function(player:PlayerMp, title:string, desc:string, price:number, pos:Vector3Mp, ids:number) {
        
        methods.debug('dispatcher.sendTaxiPos');
        let time = methods.digitFormat(weather.getHour()) + ':' + methods.digitFormat(weather.getMin());
        player.call("client:dispatcher:addDispatcherTaxiList", [countTaxi++, title, desc, time, price, pos.x, pos.y, pos.z, ids]);
    }

}