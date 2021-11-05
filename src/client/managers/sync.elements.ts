import { inGreenZone } from "../modules/savezone";
import { user } from "../user";
import { weapons } from "../weapons";
import { items } from "../items";
import { inventory } from "../inventory";
import { methods } from "../modules/methods";

export let syncdata = {
  // interrior: 0,
  insaveZone: false,
  weapons: <{item:number,hash:number;ammo:number;ammoType:number}[]>[]
};

export const syncData = () => {
  if(!user.isLogin()) return;
  let needSync = false;
  let currentInt = mp.game.interior.getInteriorAtCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z)
  // if(syncdata.interrior != currentInt) needSync = true;
  if(syncdata.insaveZone != inGreenZone()) needSync = true;
  let data = <{item:number,hash:number;ammo:number;ammoType:number}[]>[];

  for (let n = 54; n < 138; n++) {
    weapons.hashesMap.forEach((item) => {
      if (item[0] !== items.getItemNameHashById(n)) return;
      let hash = item[1] / 2;
      if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false)) return;
      let ammo = mp.game.invoke(methods.GET_AMMO_IN_PED_WEAPON, mp.players.local.handle, hash);
      let ammoType = inventory.ammoTypeToAmmo(
        mp.game.invoke(methods.GET_PED_AMMO_TYPE_FROM_WEAPON, mp.players.local.handle, hash)
      );
      data.push({item:n,hash,ammo,ammoType})
    });
  }

  if(JSON.stringify(syncdata.weapons) != JSON.stringify(data)) needSync = true;
  syncdata.weapons = data;
  // syncdata.interrior = currentInt;
  syncdata.insaveZone = inGreenZone();
  if(needSync) mp.events.callRemote('sync.elements', JSON.stringify(syncdata))
}

setInterval(() => {
  syncData();
}, 3000);