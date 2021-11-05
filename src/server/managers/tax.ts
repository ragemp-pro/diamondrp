/// <reference path="../../declaration/server.ts" />

import { Container } from '../modules/data'
import { methods } from '../modules/methods'
import { user } from '../user'
import { bank } from '../business/bank'
import { condo } from '../condo'
import { houses } from '../houses'
import { apartments } from '../apartments'
import { business } from '../business'
import { vehicles } from '../vehicles'
import { stock } from '../stock'
import { weather } from './weather'
import { businessEntity } from '../modules/entity/business'
import { Op } from 'sequelize'
import { userEntity } from '../modules/entity/user'
import { housesEntity } from '../modules/entity/housesEntity'
import { Sequelize } from 'sequelize-typescript'
import { condoEntity } from '../modules/entity/condoEntity'
import { apartmentEntity } from '../modules/entity/apartmentEntity'
import { stocksEntity } from '../modules/entity/stockEntity'
import { carsEntity } from '../modules/entity/carsModel'
import { rpInvaderAdEntity } from '../modules/entity/rpInvaderAdEntity'
import { sequelize } from '../modules/sequelize'

let _currentTax = 0.0001;
let _taxMin = 10;
let _taxDays = 21;


export let tax = {
    loadAll: function () {
        // console.time('tax.loadAll');
        setTimeout(() => {
            setInterval(tax.removeTax, methods.parseInt(60000 * 60 * 3.4));
        }, 60000 * 60 * 3)
        // console.time('tax.loadAll businessEntity');
        businessEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 10000000') }, { where: {} }).then(() => {
            // console.timeEnd('tax.loadAll businessEntity');
            business.loadAll();
            // console.time('tax.loadAll housesEntity');
            housesEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 50000000') }, { where: {} }).then(() => {
                // console.timeEnd('tax.loadAll housesEntity');
                // console.time('tax.loadAll condoEntity');
                condoEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 40000000') }, { where: {} }).then(() => {
                    // console.timeEnd('tax.loadAll condoEntity');
                    // console.time('tax.loadAll apartmentEntity');
                    apartmentEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 70000000') }, { where: {} }).then(() => {
                        // console.timeEnd('tax.loadAll apartmentEntity');
                        // console.time('tax.loadAll stocksEntity');
                        stocksEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 90000000') }, { where: {} }).then(() => {
                            // console.timeEnd('tax.loadAll stocksEntity');
                            // console.time('tax.loadAll carsEntity');
                            carsEntity.update({ score_tax: Sequelize.literal('rand()*10000000 + 30000000') }, { where: {} }).then(() => {
                                // console.timeEnd('tax.loadAll carsEntity');
                                // console.timeEnd('tax.loadAll');
                                tax.updateTax();
                            });
                        });
                    });
                });
            });
        })
    },

    adLiveInvader: function (text: string) {
        methods.debug('tax.adLiveInvader');
        rpInvaderAdEntity.create({
            datetime: weather.getRpDateTime(),
            name: 'Государство',
            phone: 'gov.sa',
            title: 'Продажа',
            text: text,
        })
        text = (text.length > 49) ? text.slice(0, 50) + "..." : text;
        methods.notifyWithPictureToAll("Государство", "~g~Реклама", text, "CHAR_LIFEINVADER", 2)
    },

    sell: function () {
        methods.debug('tax.sell');

        //=============================
        //============Склады=============
        //=============================
        stocksEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                user_id: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7
                mp.players.forEach(function (p) {
                    if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["user_id"])) {
                        user.set(p, 'stock_id', 0);
                        user.addBankMoney(p, price);
                        bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                        p.notify('~r~Ваш склад был изъят государством за неуплату');
                        user.saveAccount(p);
                    }
                });

                stock.updateOwnerInfo(methods.parseInt(row['id']), 0, '');
                userEntity.update({
                    money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                    stock_id: 0,
                }, { where: { id: methods.parseInt(row["user_id"]) } })
                methods.saveLog('SellInactive', `"USER: ${row["user_id"]} STOCK ${row["id"]}"`);
            });

            if (rows.length > 0)
                tax.adLiveInvader(`Склады поступили в продажу`);
        });

        //=============================
        //============Дома=============
        //=============================
        housesEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                id_user: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7
                mp.players.forEach(function (p) {
                    if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["id_user"])) {
                        user.set(p, 'id_house', 0);
                        user.updateClientCache(p)
                        user.addBankMoney(p, price);
                        bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                        p.notify('~r~Ваш дом был изъят государством за неуплату');
                        user.saveAccount(p);
                    } else if (user.isLogin(p) && user.get(p, 'id_house') == methods.parseInt(row['id'])) {
                        user.set(p, 'id_house', 0);
                        user.updateClientCache(p)
                        p.notify('~r~Дом, в котором вы были прописаны был изъят государством за неуплату');
                    }
                });

                houses.updateOwnerInfo(methods.parseInt(row['id']), 0, '');
                userEntity.update({
                    money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                    id_house: 0,
                }, { where: { id: methods.parseInt(row["id_user"]) } })
                userEntity.update({ id_house: 0 }, {
                    where: {
                        id_house: methods.parseInt(row['id'])
                    }
                })

                methods.saveLog('SellInactive', `"USER: ${row["id_user"]} HOUSE ${row["id"]}"`)
            });

            if (rows.length > 0)
                tax.adLiveInvader(`Дома поступили в продажу`);
        });

        //=============================
        //============Квартира=============
        //=============================
        condoEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                id_user: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7
                mp.players.forEach(function (p) {
                    if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["id_user"])) {
                        user.set(p, 'condo_id', 0);
                        user.addBankMoney(p, price);
                        bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                        p.notify('~r~Ваша квартира была изъята государством за неуплату');
                        user.saveAccount(p);
                    }
                });

                condo.updateOwnerInfo(methods.parseInt(row['id']), 0, '');

                userEntity.update({
                    money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                    condo_id: 0,
                }, { where: { id: methods.parseInt(row["id_user"]) } })

                methods.saveLog('SellInactive', `"USER: ${row["id_user"]} CONDO ${row["id"]}"`)
            });

            if (rows.length > 0)
                tax.adLiveInvader(`Квартиры поступили в продажу`);
        });

        //=============================
        //============Бизнес=============
        //=============================
        businessEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                user_id: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7
                mp.players.forEach(function (p) {
                    if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["user_id"])) {
                        user.set(p, 'business_id', 0);
                        user.addBankMoney(p, price);
                        bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                        p.notify('~r~Ваш бизнес был изъят государством за неуплату');
                        user.saveAccount(p);
                    }
                });

                business.updateOwnerInfo(methods.parseInt(row['id']), 0, '');

                userEntity.update({
                    money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                    business_id: 0,
                }, { where: { id: methods.parseInt(row["user_id"]) } })

                tax.adLiveInvader(`Бизнес ${row["name"]} поступил в продажу`);
                methods.saveLog('SellInactive', `"USER: ${row["user_id"]} BIZZ ${row["id"]}"`)
            });

            if (rows.length > 0)
                tax.adLiveInvader(`Бизнесы поступили в продажу`);
        });

        //=============================
        //============Апарты=============
        //=============================
        apartmentEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                user_id: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7
                mp.players.forEach(function (p) {
                    if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["user_id"])) {
                        user.set(p, 'apartment_id', 0);
                        user.addBankMoney(p, price);
                        bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                        p.notify('~r~Ваши апартаменты были изъяты государством за неуплату');
                        user.saveAccount(p);
                    }
                });

                apartments.updateOwnerInfo(methods.parseInt(row['id']), 0, '');
                userEntity.update({
                    money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                    apartment_id: 0,
                }, { where: { id: methods.parseInt(row["user_id"]) } })

                methods.saveLog('SellInactive', `"USER: ${row["user_id"]} APART ${row["id"]}"`)
            });

            if (rows.length > 0)
                tax.adLiveInvader(`Апартаменты поступили в продажу`);
        });

        //=============================
        //============Авто=============
        //=============================
        carsEntity.findAll({
            where: {
                money_tax: { [Op.lte]: Sequelize.literal("(round(price * '0.0001' + '10', 0) * '" + _taxDays + "') * '-1'") },
                id_user: { [Op.gt]: 0 }
            }, limit: 20
        }).then(rows => {
            rows.forEach(row => {

                let price = methods.parseInt(row['price']);

                if (methods.parseInt(row["money_tax"]) < -100000)
                    price = methods.parseInt(price * 1.3);

                price = price * 0.7

                userEntity.findAll({
                    where: {
                        [Op.or]: [
                            { car_id1: row["id"] },
                            { car_id2: row["id"] },
                            { car_id3: row["id"] },
                            { car_id4: row["id"] },
                            { car_id5: row["id"] },
                            { car_id6: row["id"] },
                            { car_id7: row["id"] },
                            { car_id8: row["id"] },
                        ]
                    }
                }).then(rows1 => {
                    let carId = "1";
                    rows1.forEach(item => {
                        if (item["car_id2"] == row["id"])
                            carId = "2";
                        if (item["car_id3"] == row["id"])
                            carId = "3";
                        if (item["car_id4"] == row["id"])
                            carId = "4";
                        if (item["car_id5"] == row["id"])
                            carId = "5";
                        if (item["car_id6"] == row["id"])
                            carId = "6";
                        if (item["car_id7"] == row["id"])
                            carId = "7";
                        if (item["car_id8"] == row["id"])
                            carId = "8";
                    });

                    mp.players.forEach(function (p) {
                        if (user.isLogin(p) && user.getId(p) == methods.parseInt(row["id_user"])) {
                            user.set(p, 'car_id' + carId, 0);
                            user.addBankMoney(p, price);
                            bank.sendSmsBankOperation(p, `Зачисление: $${methods.numberFormat(price)}`);
                            p.notify('~r~Ваш транспорт были изъяты государством за неуплату');
                            user.saveAccount(p);
                        }
                    });

                    vehicles.updateOwnerInfo(methods.parseInt(row['id']), 0, '');

                    userEntity.update({
                        money_bank: Sequelize.literal("money_bank + " + methods.parseInt(price)),
                        ["car_id" + carId]: 0,
                    }, { where: { id: methods.parseInt(row["id_user"]) } })

                    methods.saveLog('SellInactive', `"USER: ${row["id_user"]} CAR ${row["id"]}"`);
                });

                if (rows.length > 0)
                    tax.adLiveInvader(`Новый транспорт поступили в продажу`);
            });
        });
    },

    payTax: function (player: PlayerMp, type: number, sum: number, score: number) {
        methods.debug('tax.payTax');
        if (!user.isLogin(player))
            return;

        if (sum < 1) {
            player.notify('~r~Сумма должна быть больше нуля');
            return;
        }

        let table = 'cars';

        if (score.toString()[0] == "1")
            table = 'business';
        else if (score.toString()[0] == "3")
            table = 'cars';
        else if (score.toString()[0] == "4")
            table = 'condo';
        else if (score.toString()[0] == "5")
            table = 'houses';
        else if (score.toString()[0] == "7")
            table = 'apartment';
        else if (score.toString()[0] == "9")
            table = 'stocks';

        let model = table == "cars" ? carsEntity :
            table == "business" ? businessEntity :
                table == "condo" ? condoEntity :
                    table == "houses" ? housesEntity :
                        table == "apartment" ? apartmentEntity :
                            table == "stocks" ? stocksEntity : carsEntity

        methods.debug(table);

        // @ts-ignore
        model.findAll({
            where: {
                score_tax: score
            }, limit: 1
        }).then((rows: any[]) => {
            if (rows.length == 0)
                return player.notify('~r~Номер счёта не найден');

            let row = rows[0];
            if (sum > methods.parseInt(row["money_tax"]) * -1) {
                player.notify('~r~Сумма оплаты не должна привышать суммы долга (#1)');
                player.notify(`~r~Ваш долг равен: $${row["money_tax"]}`);
                return;
            }

            if (type == 0)
                user.removeCashMoney(player, sum);
            else
                user.removeBankMoney(player, sum);

            // @ts-ignore
            model.update({
                money_tax: methods.parseInt(row["money_tax"]) + sum
            }, {
                where: {
                    score_tax: score
                }
            })

            player.notify(`~g~Счёт ${score} был оплачен на сумму $${sum}`);

            setTimeout(() => tax.updateTax(score), 1000);

        })
    },

    removeTax: function () {
        methods.debug('tax.removeTax');


        sequelize.query("UPDATE pAFk3qiAgG1_houses SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE id_user > 0").then(() => {
            sequelize.query("UPDATE pAFk3qiAgG1_condo SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE id_user > 0").then(() => {
                sequelize.query("UPDATE pAFk3qiAgG1_apartment SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE user_id > 0").then(() => {
                    sequelize.query("UPDATE pAFk3qiAgG1_business SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE user_id > 0").then(() => {
                        sequelize.query("UPDATE pAFk3qiAgG1_stocks SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE user_id > 0").then(() => {
                            sequelize.query("UPDATE pAFk3qiAgG1_cars SET money_tax = money_tax - (round((price * '" + _currentTax + "' + '" + _taxMin + "') / '7', 0)) WHERE id_user > 0").then(() => {

                            });
                        });
                    });
                });
            });
        });

        methods.notifyWithPictureToAll('~y~Оплата налогов', 'Новости правительства', 'Не забудьте оплатить налог за ваше имущество', 'CHAR_BANK_MAZE');

        setTimeout(tax.sell, 15000);
        setTimeout(tax.updateTax, 20000);
    },

    updateTax: function (score?: number) {
        // console.time("updateTax")
        if (!score || score.toString()[0] == "4"){
            // console.time("updateTax condoEntity")
            condoEntity.findAll({
                where: {
                    id_user: { [Op.not]: 0 }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then(rows => {
                // console.timeEnd("updateTax condoEntity")
                rows.forEach(item => {
                    Container.Set(300000 + methods.parseInt(item['id']), 'money_tax', item['money_tax']);
                    Container.Set(300000 + methods.parseInt(item['id']), 'score_tax', item['score_tax']);
                });
            });
        }
        if (!score || score.toString()[0] == "5") {
            // console.time("updateTax housesEntity")
            housesEntity.findAll({
                where: {
                    id_user: { [Op.not]: 0 }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then(rows => {
                // console.timeEnd("updateTax housesEntity")
                rows.forEach(item => {
                    let q = houses.getHouseData(item.id)
                    if (q) {
                        q.money_tax = item.money_tax;
                        q.score_tax = item.score_tax;
                    }
                });
            });
        }
        if (!score || score.toString()[0] == "3") {
            // console.time("updateTax carsEntity")
            carsEntity.findAll({
                where: {
                    id_user: { [Op.not]: 0 }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then(rows => {
                // console.timeEnd("updateTax carsEntity")
                rows.forEach(item => {
                    Container.Set(200000 + methods.parseInt(item['id']), 'money_tax', item['money_tax']);
                    Container.Set(200000 + methods.parseInt(item['id']), 'score_tax', item['score_tax']);
                });
            });
        }
        if (!score || score.toString()[0] == "9") {
            // console.time("updateTax stocksEntity")
            stocksEntity.findAll({
                where: {
                    user_id: { [Op.not]: 0 }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then(rows => {
                // console.timeEnd("updateTax stocksEntity")
                rows.forEach(item => {
                    Container.Set(400000 + methods.parseInt(item['id']), 'money_tax', item['money_tax']);
                    Container.Set(400000 + methods.parseInt(item['id']), 'score_tax', item['score_tax']);
                });
            });
        }
        if (!score || score.toString()[0] == "7") {
            // console.time("updateTax apartmentEntity")
            apartmentEntity.findAll({
                where: {
                    user_id: { [Op.not]: 0 }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then(rows => {
                // console.timeEnd("updateTax apartmentEntity")
                rows.forEach(item => {
                    Container.Set(-100000 + methods.parseInt(item['id']), 'money_tax', item['money_tax']);
                    Container.Set(-100000 + methods.parseInt(item['id']), 'score_tax', item['score_tax']);
                });
            });
        }
        if (!score || score.toString()[0] == "1") {
            // console.time("updateTax businessEntity")
            businessEntity.findAll({
                where: {
                    user_id: {
                        [Op.not]: 0
                    }
                },
                attributes: ["id", "score_tax", "money_tax"]
            }).then((rows) => {
                // console.timeEnd("updateTax businessEntity")
                rows.forEach(item => {
                    let q = business.getData(item.id)
                    if (q) {
                        q.money_tax = item.money_tax;
                        q.score_tax = item.score_tax;
                        q.save();
                    }
                });
            })
        }
        
        // console.timeEnd("updateTax")




    }
}
