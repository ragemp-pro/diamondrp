/// <reference path="../../declaration/client.ts" />

import {Container} from '../modules/data';
import {methods} from '../modules/methods';
import {user} from '../user';
import {ui} from '../modules/ui';
import {houses} from '../houses';
import {jobPoint} from '../managers/jobPoint';

mp.events.add('sendMail', (id:number) => {
    mail.sendMail(id);
})

let mail = {
    sendMail: function(houseId:number) {
        try {
            methods.debug('Execute: mail.sendMail');
            if (Container.HasLocally(mp.players.local.id, 'mail')) {
                if (Container.GetLocally(mp.players.local.id, 'mail') > 0) {
                    Container.Set(houseId, 'isMail', true);
                    Container.SetLocally(mp.players.local.id, 'mail', Container.GetLocally(mp.players.local.id, 'mail') - 1);
                    mp.game.ui.notifications.show(`~g~Вы отнесли почту ${Container.GetLocally(mp.players.local.id, 'mail')}/10`);
                    user.giveJobSkill();
                    user.giveJobMoney(11);
                    return;
                }
            }
            mp.game.ui.notifications.show('~r~У Вас нет почты, возьмите из авто');
        } catch (e) {
            methods.debug('Exception: mail.sendMail');
            methods.debug(e);
        }
    },
    
    sendMail2: function(houseId:number) {
        try {
            methods.debug('Execute: mail.sendMail2');
            if (Container.HasLocally(mp.players.local.id, 'mail')) {
                if (Container.GetLocally(mp.players.local.id, 'mail') > 0) {
                    Container.Set(houseId, 'isMail2', true);
                    Container.SetLocally(mp.players.local.id, 'mail', Container.GetLocally(mp.players.local.id, 'mail') - 1);
                    mp.game.ui.notifications.show(`~g~Вы отнесли почту ${Container.GetLocally(mp.players.local.id, 'mail')}/10`);
                    user.giveJobSkill();
                    user.giveJobMoney(11);
                    return;
                }
            }
            mp.game.ui.notifications.show('~r~У Вас нет почты, возьмите из авто');
        } catch (e) {
            methods.debug('Exception: mail.sendMail2');
            methods.debug(e);
        }
    },
    
    takeMail: function() {
        try {
            methods.debug('Execute: mail.takeMail');
            Container.SetLocally(mp.players.local.id, 'mail', 10);
            mp.game.ui.notifications.show("~g~Вы взяли почту из транспорта");
        } catch (e) {
            methods.debug('Exception: mail.takeMail');
            methods.debug(e);
        }
    }
};

export {mail};