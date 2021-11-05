/// <reference path="../declaration/server.ts" />

import {Container} from './modules/data'
import {methods} from './modules/methods'
import { customParams } from './modules/admin';
import { cofferEntity } from './modules/entity/coffer';


let containerId = 99999;

export let coffer = {
    load: function() {
        methods.debug('coffer.load');
        cofferEntity.findOne().then(data => {
            Container.Set(containerId, 'cofferMoney', data.money);
            Container.Set(containerId, 'cofferMoneyBomj', data.moneyBomj);
            Container.Set(containerId, 'cofferNalog', data.nalog);
            Container.Set(containerId, 'cofferNalogBizz', data.nalog_bizz);
            Container.Set(containerId, 'cofferMoneyLimit', data.moneyLimit);
            Container.Set(containerId, 'cofferMoneyOld', data.moneyOld);
    
            methods.debug('Coffer loaded: ' + data.money);
        })
    },
    save: function() {
        methods.debug('coffer.save');
        let Money = Container.Get(containerId, 'cofferMoney');
        let MoneyBomj = Container.Get(containerId, 'cofferMoneyBomj');
        let Nalog = Container.Get(containerId, 'cofferNalog');
        let BizzNalog = Container.Get(containerId, 'cofferNalogBizz');
        let MoneyOld = Container.Get(containerId, 'cofferMoneyLimit');
        let MoneyLimit = Container.Get(containerId, 'cofferMoneyOld');
        cofferEntity.update({
            money: Money,
            moneyBomj: MoneyBomj,
            nalog: Nalog,
            nalog_bizz: BizzNalog,
            moneyOld: MoneyOld,
            moneyLimit: MoneyLimit,
        }, {where: { id: 1 }})
    },
    get: function(key:any) {
        return Container.Get(containerId, key);
    },
    addMoney: function(money:number = 0) {
        coffer.setMoney(coffer.getMoney() + methods.parseInt(money));
    },
    removeMoney: function(money:number) {
        coffer.setMoney(coffer.getMoney() - methods.parseInt(money));
    },
    setMoney: function(money:number) {
        Container.Set(containerId, 'cofferMoney', methods.parseInt(money));
    },
    getMoney: function() {
        if (Container.Has(containerId, 'cofferMoney'))
            return methods.parseInt(Container.Get(containerId, 'cofferMoney'));
        return 0;
    },
    getMoneyOld: function() {
        if (Container.Has(containerId, 'cofferMoneyOld'))
            return methods.parseInt(Container.Get(containerId, 'cofferMoneyOld'));
        return 50;
    },
    getPosob: function() {
        if (Container.Has(containerId, 'cofferMoneyBomj'))
            return methods.parseInt(Container.Get(containerId, 'cofferMoneyBomj'));
        return 50;
    },
    getNalog: function() {
        if (Container.Has(containerId, 'cofferNalog'))
            return methods.parseInt(Container.Get(containerId, 'cofferNalog'));
        return 5;
    },
    getNalogBizz: function() {
        if (Container.Has(containerId, 'cofferNalogBizz'))
            return methods.parseInt(Container.Get(containerId, 'cofferNalogBizz'));
        return 5;
    },
    setNalogBizz: function(value:number) {
        Container.Set(containerId, 'cofferNalogBizz', value)
        coffer.save()
    },
    setMoneyOld: function(sum:number) {
        Container.Set(containerId, 'cofferMoneyOld', sum)
        coffer.save()
    },
    setPosob: function(sum:number) {
        Container.Set(containerId, 'cofferMoneyBomj', sum)
        coffer.save()
    },
    setNalog: function(sum:number) {
        Container.Set(containerId, 'cofferNalog', sum)
        coffer.save()
    }
};



setInterval(() => {
    if (!customParams.cofferbonus) return;
    if (coffer.getMoney() > 10000000000) return;
    if(coffer.getMoney() < 1000000){
        coffer.addMoney(methods.getRandomInt(1000000, 5000000));
    } else if(coffer.getMoney() < 5000000){
        coffer.addMoney(methods.getRandomInt(500000, 1000000));
    } else if(coffer.getMoney() < 10000000){
        coffer.addMoney(methods.getRandomInt(200000, 400000));
    } else if(coffer.getMoney() < 50000000){
        coffer.addMoney(methods.getRandomInt(100000, 200000));
    } else {
        coffer.addMoney(methods.getRandomInt(1000, 5000));
    }
}, 60000)