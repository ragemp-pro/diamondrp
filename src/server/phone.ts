/// <reference path="../declaration/server.ts" />



import {methods} from './modules/methods'
import {weather} from './managers/weather'
import {user} from './user'
import { phoneContactEntity, phoneSMSEntity } from './modules/entity/phone';
import { Op } from 'sequelize';



export let phone = {
    getByNumber: (number:string) => {
        let nmbr:PlayerMp = null;
        mp.players.forEach(pl => {
            if (!user.isLogin(pl))
                return;
            let phoneNumber = user.get(pl, "phone_code") + "-" + user.get(pl, "phone");
            if (phoneNumber != number) return;

            nmbr = pl;
        });
        return nmbr;
    },
    getNumber: (player:PlayerMp) => {
        return user.get(player, "phone_code") + "-" + user.get(player, "phone");
    },
    sendSms: function(player:PlayerMp, number:string, text:string) {
        methods.debug('phone.sendSms');
        if (!user.isLogin(player))
            return;
        try {
            let numberFrom = user.get(player, "phone_code") + "-" + user.get(player, "phone");
    
            mp.players.forEach(pl => {
                if (!user.isLogin(pl))
                    return;
                let phoneNumber = user.get(pl, "phone_code") + "-" + user.get(pl, "phone");
                if (phoneNumber != number) return;
    
                let numberToCont = numberFrom;
                
                phoneContactEntity.findOne({where: {
                    number: number,
                    text_number: numberFrom
                }}).then(item => {
                    if(item) numberToCont = item.title;
                })
    
                setTimeout(function () {
                    if (!user.isLogin(pl))
                        return;
                    pl.call("client:phone:addNewSms", [numberToCont, text]);
                }, 1000);
            });
            phoneSMSEntity.create({
                number_from: numberFrom,
                number_to: number,
                text: text,
                datetime: weather.getRpDateTime(),
            })
            player.notify("~g~Отправлено~s~\nСМС была отправлена получателю");
        } catch(e) {
            methods.debug(e);
        }
    },
    
    openSmsListMenu: function(player:PlayerMp, number:string) {
        methods.debug('phone.openSmsListMenu');
        if (!user.isLogin(player))
            return;
        try {
            let data = new Map();
            phoneSMSEntity.findAll({where: {
                [Op.or]: [{ number_from: number }, { number_to: number }]
            }, order: [["id", "DESC"]], limit: 100}).then(rows => {
                rows.forEach(row => {
                    data.set(row['id'].toString(), [row["number_from"], row["number_to"], row["datetime"], row["text"]]);
                });
                if (!user.isLogin(player))
                    return;
                player.call("client:phone:sendToPlayerSmsListMenu", [Array.from(data), number]);
            })
        } catch(e) {
            methods.debug(e);
        }
    },
    
    openContactListMenu: function(player:PlayerMp, number:string) {
        methods.debug('phone.openContactListMenu');
        if (!user.isLogin(player))
            return;
        try {
            let data = new Map();
    
            phoneContactEntity.findAll({
                where: {
                    number: number
                },
                order: [["title", "ASC"]],
                limit: 100
            }).then(rows => {
                rows.forEach(row => {
                    data.set(row['id'].toString(), [row["title"], row["text_number"]]);
                });
                if (!user.isLogin(player))
                    return;
                player.call("client:phone:sendToPlayerContactListMenu", [Array.from(data)]);
            })
        } catch(e) {
            methods.debug(e);
        }
    },
    
    addContact: function(player:PlayerMp, phone:string, title:string, num:string) {
        methods.debug('phone.addContact');
        if (!user.isLogin(player))
            return;
        try {
            if(title.length >= 50) return player.notify(`~r~Длинна имени контакта не более 50`)
            phoneContactEntity.create({
                number: phone,
                title: title,
                text_number: num
            })
            player.notify("~g~Контакт был добавлен");
        } catch(e) {
            methods.debug(e);
        }
    },
    
    deleteContact: function(player:PlayerMp, id:number) {
        methods.debug('phone.deleteContact');
        phoneContactEntity.destroy({
            where: {
                id: id
            }
        })
        if (!user.isLogin(player))
            return;
        try {
            player.notify("~g~Контакт был удален");
        } catch(e) {
            methods.debug(e);
        }
    },
    
    renameContact: function(player:PlayerMp, id:number, newName:string) {
        methods.debug('phone.renameContact');
        phoneContactEntity.update({
            title: newName
        }, { where: {
            id:id
        }})
        if (!user.isLogin(player))
            return;
        try {
            player.notify("~g~Контакт был переименован");
        } catch(e) {
            methods.debug(e);
        }
    },
    
    openSmsInfoMenu: function(player:PlayerMp, id:number) {
        methods.debug('phone.openSmsInfoMenu');
        if (!user.isLogin(player))
            return;
        try {
            phoneSMSEntity.findOne({
                where: {
                    id: id
                }
            }).then(item => {
                if (!item) return;
                if (!user.isLogin(player))
                    return;
                player.call("client:phone:sendToPlayerSmsInfoMenu", [item.id, item.number_from, item.number_to, item.text, item.datetime]);
                return;
            })
        } catch(e) {
            methods.debug(e);
        }
    },
    
    openContInfoMenu: function(player:PlayerMp, id:number) {
        methods.debug('phone.openContInfoMenu');
        if (!user.isLogin(player))
            return;
        try {

            phoneContactEntity.findOne({
                where: {
                    id: id
                }
            }).then(item => {
                if (!user.isLogin(player))
                    return;
                if (item)
                player.call("client:phone:sendToPlayerContInfoMenu", [item.id, item.title, item.text_number]);
                return;
            })

        } catch(e) {
            methods.debug(e);
        }
    },
    
    deleteSms: function(player:PlayerMp, id:number) {
        methods.debug('phone.deleteSms');
        phoneSMSEntity.destroy({
            where: {
                id: id
            }
        })
        if (!user.isLogin(player))
            return;
        try {
            player.notify("~g~Смс была удалена");
        } catch(e) {
            methods.debug(e);
        }
    },
};
