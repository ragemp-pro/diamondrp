import {Container} from './modules/data';
import {inventory} from './inventory';
import { methods } from './modules/methods';
import { user } from './user';

let skills = {
  execute: () => {
    setInterval(checkStats, 180000);
    setInterval(checkShooting, 10000);
    setInterval(updateStats, 10000);
  }
};

let checkStats = async () => {
  if (!user.isLogin()) return;

  let localPlayer = mp.players.local;

  if (mp.players.local.isSprinting() && user.get('mp0_stamina') < 99) {
    mp.game.ui.notifications.show(`~g~Навык "Выносливость" был повышен`);
    user.set('mp0_stamina', user.get('mp0_stamina') + 1);
    let vipData = user.getVipData()
    if(vipData){
      if (vipData.skillpersbonus > 0 && user.get('mp0_stamina') % vipData.skillpersbonus === 0) user.set('mp0_stamina', user.get('mp0_stamina') + 1);
    }
    if (user.isUsmc()) user.set('mp0_stamina', user.get('mp0_stamina') + 1);
    Container.Set(mp.players.local.remoteId, 'mp0_stamina', user.get('mp0_stamina'));
  }

  if (mp.players.local.isSprinting() && user.get('mp0_strength') < 99) {
    mp.game.ui.notifications.show(`~g~Навык "Сила" был повышен`);
    user.set('mp0_strength', user.get('mp0_strength') + 1);
    let vipData = user.getVipData()
    if (vipData) {
      if (vipData.skillpersbonus > 0 && user.get('mp0_strength') % vipData.skillpersbonus === 0) user.set('mp0_strength', user.get('mp0_strength') + 1);
    }
    if (user.isUsmc()) user.set('mp0_strength', user.get('mp0_strength') + 1);
    Container.Set(mp.players.local.remoteId, 'mp0_strength', user.get('mp0_strength'));
  }

  /*if (mp.players.local.isSwimming() && user.get('mp0_lung_capacity') < 99) {
        mp.game.ui.notifications.show(`~g~Навык "Объем легких" был повышен`);
        user.set('mp0_lung_capacity', user.get('mp0_lung_capacity') + 1);
        Container.Set(mp.players.local.remoteId, "mp0_lung_capacity", user.get('mp0_lung_capacity'));
    }*/

  if (mp.players.local.isSwimmingUnderWater() && user.get('mp0_lung_capacity') < 99) {
    mp.game.ui.notifications.show(`~g~Навык "Объем легких" был повышен`);
    user.set('mp0_lung_capacity', user.get('mp0_lung_capacity') + 3);
    let vipData = user.getVipData()
    if (vipData) {
      if (vipData.skillpersbonus > 0 && user.get('mp0_lung_capacity') % vipData.skillpersbonus === 0) user.set('mp0_lung_capacity', user.get('mp0_lung_capacity') + 1);
    }
    if (await Container.Get(mp.players.local.remoteId, 'mp0_lung_capacity') > 99)
      user.set('mp0_lung_capacity', 99);
    Container.Set(
      mp.players.local.remoteId,
      'mp0_lung_capacity',
      user.get('mp0_lung_capacity')
    );
  }

  if (user.get('mp0_wheelie_ability') < 99) {
    if (mp.players.local.isSittingInAnyVehicle()) {
      let veh = mp.players.local.vehicle;
      if (
        veh.getPedInSeat(-1) == localPlayer.handle &&
        !veh.isInAir() &&
        methods.getCurrentSpeed() > 10
      ) {
        mp.game.ui.notifications.show(`~g~Навык вождения был повышен`);

        if (user.isUsmc()) user.set('mp0_wheelie_ability', user.get('mp0_wheelie_ability') + 1);

        user.set('mp0_wheelie_ability', user.get('mp0_wheelie_ability') + 1);

        let vipData = user.getVipData()
        if (vipData) {
          if (vipData.skillpersbonus > 0 && user.get('mp0_wheelie_ability') % vipData.skillpersbonus === 0) user.set('mp0_wheelie_ability', user.get('mp0_wheelie_ability') + 1);
        }

        Container.Set(
          mp.players.local.remoteId,
          'mp0_wheelie_ability',
          user.get('mp0_wheelie_ability')
        );
      }
    }
  }

  if (user.get('mp0_flying_ability') < 99) {
    if (mp.players.local.isSittingInAnyVehicle()) {
      let veh = mp.players.local.vehicle;
      if (veh.getPedInSeat(-1) == localPlayer.handle && veh.isInAir()) {
        mp.game.ui.notifications.show(`~g~Навык пилота был повышен`);

        if (user.isUsmc()) user.set('mp0_flying_ability', user.get('mp0_flying_ability') + 1);

        let vipData = user.getVipData()
        if (vipData) {
          if (vipData.skillpersbonus > 0 && user.get('mp0_flying_ability') % vipData.skillpersbonus === 0) user.set('mp0_flying_ability', user.get('mp0_flying_ability') + 1);
        }

        user.set('mp0_flying_ability', user.get('mp0_flying_ability') + 1);
        Container.Set(
          mp.players.local.remoteId,
          'mp0_flying_ability',
          user.get('mp0_flying_ability')
        );
      }
    }
  }

  //45000-55000 Inventory Amount Max
  // !todo WTF?
  //inventory.setInvAmountMax(50100 + user.get('mp0_strength') * 100);
};

let checkShooting = () => {
  if (!user.isLogin()) return;

  if (mp.players.local.isShooting() && user.get('mp0_shooting_ability') < 99) {
    mp.game.ui.notifications.show(`~g~Навык стрельбы был повышен`);

    if (user.isUsmc()) user.set('mp0_shooting_ability', user.get('mp0_shooting_ability') + 1);

    let vipData = user.getVipData()
    if (vipData) {
      if (vipData.skillpersbonus > 0 && user.get('mp0_shooting_ability') % vipData.skillpersbonus === 0) user.set('mp0_shooting_ability', user.get('mp0_shooting_ability') + 1);
    }

    user.set('mp0_shooting_ability', user.get('mp0_shooting_ability') + 1);
    Container.Set(
      mp.players.local.remoteId,
      'mp0_shooting_ability',
      user.get('mp0_shooting_ability')
    );
  }
};

let updateStats = () => {
  if (!user.isLogin()) return;

  mp.game.gameplay.terminateAllScriptsWithThisName('stats_controller');

  mp.game.stats.statSetInt(mp.game.joaat('MP0_STAMINA'), user.get('mp0_stamina'), true);
  mp.game.stats.statSetInt(mp.game.joaat('MP0_STRENGTH'), user.get('mp0_strength'), true);
  mp.game.stats.statSetInt(mp.game.joaat('MP0_LUNG_CAPACITY'), user.get('mp0_lung_capacity'), true);
  mp.game.stats.statSetInt(
    mp.game.joaat('MP0_WHEELIE_ABILITY'),
    user.get('mp0_wheelie_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('MP0_FLYING_ABILITY'),
    user.get('mp0_flying_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('MP0_STEALTH_ABILITY'),
    user.get('mp0_stealth_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('MP0_SHOOTING_ABILITY'),
    user.get('mp0_shooting_ability'),
    true
  );

  mp.game.stats.statSetInt(mp.game.joaat('STAMINA'), user.get('mp0_stamina'), true);
  mp.game.stats.statSetInt(mp.game.joaat('STRENGTH'), user.get('mp0_strength'), true);
  mp.game.stats.statSetInt(mp.game.joaat('LUNG_CAPACITY'), user.get('mp0_lung_capacity'), true);
  mp.game.stats.statSetInt(mp.game.joaat('WHEELIE_ABILITY'), user.get('mp0_wheelie_ability'), true);
  mp.game.stats.statSetInt(mp.game.joaat('FLYING_ABILITY'), user.get('mp0_flying_ability'), true);
  mp.game.stats.statSetInt(mp.game.joaat('STEALTH_ABILITY'), user.get('mp0_stealth_ability'), true);
  mp.game.stats.statSetInt(
    mp.game.joaat('SHOOTING_ABILITY'),
    user.get('mp0_shooting_ability'),
    true
  );

  mp.game.stats.statSetInt(mp.game.joaat('SP0_STAMINA'), user.get('mp0_stamina'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP0_STRENGTH'), user.get('mp0_strength'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP0_LUNG_CAPACITY'), user.get('mp0_lung_capacity'), true);
  mp.game.stats.statSetInt(
    mp.game.joaat('SP0_WHEELIE_ABILITY'),
    user.get('mp0_wheelie_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP0_FLYING_ABILITY'),
    user.get('mp0_flying_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP0_STEALTH_ABILITY'),
    user.get('mp0_stealth_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP0_SHOOTING_ABILITY'),
    user.get('mp0_shooting_ability'),
    true
  );

  mp.game.stats.statSetInt(mp.game.joaat('SP1_STAMINA'), user.get('mp0_stamina'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP1_STRENGTH'), user.get('mp0_strength'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP1_LUNG_CAPACITY'), user.get('mp0_lung_capacity'), true);
  mp.game.stats.statSetInt(
    mp.game.joaat('SP1_WHEELIE_ABILITY'),
    user.get('mp0_wheelie_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP1_FLYING_ABILITY'),
    user.get('mp0_flying_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP1_STEALTH_ABILITY'),
    user.get('mp0_stealth_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP1_SHOOTING_ABILITY'),
    user.get('mp0_shooting_ability'),
    true
  );

  mp.game.stats.statSetInt(mp.game.joaat('SP2_STAMINA'), user.get('mp0_stamina'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP2_STRENGTH'), user.get('mp0_strength'), true);
  mp.game.stats.statSetInt(mp.game.joaat('SP2_LUNG_CAPACITY'), user.get('mp0_lung_capacity'), true);
  mp.game.stats.statSetInt(
    mp.game.joaat('SP2_WHEELIE_ABILITY'),
    user.get('mp0_wheelie_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP2_FLYING_ABILITY'),
    user.get('mp0_flying_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP2_STEALTH_ABILITY'),
    user.get('mp0_stealth_ability'),
    true
  );
  mp.game.stats.statSetInt(
    mp.game.joaat('SP2_SHOOTING_ABILITY'),
    user.get('mp0_shooting_ability'),
    true
  );
};

export { skills };
