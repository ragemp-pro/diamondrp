import { user } from '../user';
import { methods } from '../modules/methods';

let itemList:{
  title:string;
  time:string;
  street1:string;
  street2:string;
  desc:string;
  withCoord:boolean;
  x:number;
  y:number;
  z:number;
}[] = [];
let itemTaxiList:{
  count:number;
  time:string;
  price:number;
  title:string;
  desc:string;
  street1:string;
  street2:string;
  x:number;
  y:number;
  z:number;
  id:number;
}[] = [];

const dispatcher = {

  callFraction: (title:string, desc:string, fraction:number[]) => {
    mp.events.callRemote('server:dispatcher:callFraction', JSON.stringify(fraction), title, desc);
  },
  send: (title:string, desc:string, withCoord = true) => {
    dispatcher.sendPos(title, desc, mp.players.local.position, withCoord);
  },
  
  sendPos: (title:string, desc:string, pos:Vector3Mp, withCoord = true, fromPhone = false) => {
    mp.events.callRemote('server:dispatcher:sendPos', title, desc, pos.x, pos.y, pos.z, withCoord, fromPhone);
  },
  
  sendLocal: (title:string, desc:string, withCoord = true) => {
    dispatcher.sendLocalPos(
      title,
      desc,
      mp.players.local.position,
      user.get('fraction_id'),
      withCoord
    );
  },
  
  sendLocalPos: (title:string, desc:string, pos:Vector3Mp, fractionId:number, withCoord = true) => {
    mp.events.callRemote(
      'server:dispatcher:sendLocalPos',
      title,
      desc,
      pos.x,
      pos.y,
      pos.z,
      fractionId,
      withCoord
    );
  },
  
  addDispatcherList: (title:string, desc:string, time:any, x:number, y:number, z:number, withCoord:boolean) => {
    let getStreet = mp.game.pathfind.getStreetNameAtCoord(x, y, z, 0, 0);
    let street1 = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(x, y, z));
    let street2 = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
  
    itemList.unshift({
      title: title,
      desc: desc,
      street1: street1,
      street2: street2,
      time: time,
      x: x,
      y: y,
      z: z,
      withCoord: withCoord,
    });
  
    mp.game.ui.notifications.showWithPicture(title, 'Диспетчер', desc, 'CHAR_CALL911', 1);
    mp.game.ui.notifications.show(`~y~Время:~s~ ${time}\n${withCoord ? `~y~Район:~s~ ${street1}\n~y~Улица:~s~ ${street2}` : ''}`);
  },
  
  addDispatcherTaxiList: (count:number, title:string, desc:string, time:any, price:number, x:number, y:number, z:number, id:number) => {
    let getStreet = mp.game.pathfind.getStreetNameAtCoord(x, y, z, 0, 0);
    let street1 = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(x, y, z));
    let street2 = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
  
    itemTaxiList.unshift({
      count: count,
      title: title,
      desc: desc,
      street1: street1,
      street2: street2,
      time: time,
      price: price,
      x: x,
      y: y,
      z: z,
      id: id
    });
  
    let icon = user.get('job') == 'taxi1' ? 'CHAR_TAXI' : 'CHAR_TAXI_LIZ';
  
    mp.game.ui.notifications.showWithPicture(title, 'Диспетчер', desc, icon, 1);
    mp.game.ui.notifications.show(`~y~Время:~s~ ${time}\n~y~Район:~s~ ${street1}\n~y~Улица:~s~ ${street2}`);
  },
  
  sendNotification: (title:string, desc:string, desc2:string, desc3:string) => {
    methods.notifyWithPictureToFraction(title, 'Диспетчер', desc, 'CHAR_CALL911', 2, 1);
    methods.notifyWithPictureToFraction(title, 'Диспетчер', desc, 'CHAR_CALL911', 3, 1);
    methods.notifyWithPictureToFraction(title, 'Диспетчер', desc, 'CHAR_CALL911', 7, 1);
    methods.notifyWithPictureToFraction(title, 'Диспетчер', desc, 'CHAR_CALL911', 16, 1);
  
    if (desc2) {
      setTimeout(function() {
        methods.notifyToFraction(desc2, 2);
        methods.notifyToFraction(desc2, 3);
        methods.notifyToFraction(desc2, 7);
        methods.notifyToFraction(desc2, 16);
      }, 100);
    }
    if (desc3) {
      setTimeout(function() {
        methods.notifyToFraction(desc3, 2);
        methods.notifyToFraction(desc3, 3);
        methods.notifyToFraction(desc3, 7);
        methods.notifyToFraction(desc3, 16);
      }, 200);
    }
  },
  
  sendNotificationFraction: (title:string, desc:string, desc2:string, desc3:string, fractionId:number) => {
    methods.notifyWithPictureToFraction(title, 'Диспетчер', desc, 'CHAR_CALL911', fractionId, 1);
  
    if (desc2) {
      setTimeout(function() {
        methods.notifyToFraction(desc2, fractionId);
      }, 100);
    }
    if (desc3) {
      setTimeout(function() {
        methods.notifyToFraction(desc3, fractionId);
      }, 200);
    }
  },
  
  getItemList: () => {
    return itemList;
  },
  
  getItemTaxiList: () => {
    return itemTaxiList;
  },
};

export { dispatcher };
