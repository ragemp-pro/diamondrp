import { methods } from '../modules/methods';

setInterval(() => {
  if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, mp.game.joaat('WEAPON_UNARMED'), false)){
    mp.game.invoke(methods.GIVE_WEAPON_TO_PED, mp.players.local.handle, mp.game.joaat('WEAPON_UNARMED'), 0, false, true)
  }
  // 
}, 1000)


mp.events.add('client:syncDeathRagdoll', async function(pId) {
  try {
    let remotePlayer = mp.players.atRemoteId(pId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer === mp.players.local) return;
      remotePlayer.setCanRagdoll(true);
      remotePlayer.setToRagdoll(30000, 30000, 0, false, false, false);
      remotePlayer.freezePosition(true);

      setTimeout(function() {
        if (mp.players.exists(remotePlayer)) remotePlayer.freezePosition(false);
      }, 30000);
    }
  } catch (e) {}
});

mp.events.add('client:syncAnimation', async (playerId, dict, anim, flag, accessVeh = false) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer.vehicle) return;

      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;
      else {
        remotePlayer.setAsMission(false, true);
        if (flag == 8 || flag == 9) flag = 32;

        if (dict == 'dead') flag = 9;
      }

      methods.debug('Execute: events:client:syncAnimation:' + flag);

      remotePlayer.clearTasks();
      //remotePlayer.clearSecondaryTask();
      mp.game.streaming.requestAnimDict(dict);
      let cnt = 0;
      while (!mp.game.streaming.hasAnimDictLoaded(dict) && cnt < 100){
        cnt++;
        await methods.sleep(100);
      }

      try {
        remotePlayer.taskPlayAnim(dict, anim, 8.0, -8, -1, flag, 0, false, false, false);
      } catch (e) {
        methods.debug(e);
      }
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncAnimation');
    methods.debug(e);
  }
});

///eval mp.events.call('client:syncArrestAnimation', 0);
///a move_m@intimidation@cop@unarmed idle

mp.events.add('client:syncArrestAnimation', async (playerId) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer.vehicle) return;

      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;
      else remotePlayer.setAsMission(false, true);

      methods.debug('Execute: events:client:syncArrestAnimation');

      remotePlayer.clearTasks();
      //remotePlayer.clearSecondaryTask();
      mp.game.streaming.requestAnimDict('random@arrests');
      mp.game.streaming.requestAnimDict('random@arrests@busted');

      if (!mp.game.streaming.hasAnimDictLoaded('random@arrests')) await methods.sleep(100);
      if (!mp.game.streaming.hasAnimDictLoaded('random@arrests@busted')) await methods.sleep(100);

      if (remotePlayer.isPlayingAnim('random@arrests@busted', 'idle_a', 3) === true) {
        remotePlayer.taskPlayAnim(
          'random@arrests@busted',
          'exit',
          8.0,
          -8,
          -1,
          2,
          0,
          false,
          false,
          false
        );
        await methods.sleep(3000);
        remotePlayer.taskPlayAnim(
          'random@arrests',
          'kneeling_arrest_get_up',
          8.0,
          -8,
          -1,
          128,
          0,
          false,
          false,
          false
        );
      } else {
        remotePlayer.taskPlayAnim(
          'random@arrests',
          'idle_2_hands_up',
          8.0,
          -8,
          -1,
          2,
          0,
          false,
          false,
          false
        );
        await methods.sleep(4000);
        remotePlayer.taskPlayAnim(
          'random@arrests',
          'kneeling_arrest_idle',
          8.0,
          -8,
          -1,
          2,
          0,
          false,
          false,
          false
        );
        await methods.sleep(500);
        remotePlayer.taskPlayAnim(
          'random@arrests@busted',
          'enter',
          8.0,
          -8,
          -1,
          2,
          0,
          false,
          false,
          false
        );
        await methods.sleep(1000);
        remotePlayer.taskPlayAnim(
          'random@arrests@busted',
          'idle_a',
          8.0,
          -8,
          -1,
          9,
          0,
          false,
          false,
          false
        );
      }
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncAnimation');
    methods.debug(e);
  }
});

mp.events.add('client:syncHeadingToCoord', (playerId, x, y, z) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer.vehicle) return;

      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;

      methods.debug('Execute: events:client:syncHeadingToCoord');

      remotePlayer.clearTasks();
      remotePlayer.taskTurnToFaceCoord(x, y, z, -1);

      setTimeout(function() {
        remotePlayer.clearTasks();
      }, 2000);
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncAnimation');
    methods.debug(e);
  }
});

mp.events.add('client:syncHeadingToTarget', (playerId, targetId) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    let targetPlayer = mp.players.atRemoteId(targetId);
    if (
      remotePlayer &&
      mp.players.exists(remotePlayer) &&
      targetPlayer &&
      mp.players.exists(targetPlayer)
    ) {
      if (remotePlayer.vehicle) return;

      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;

      methods.debug('Execute: events:client:syncHeadingToTarget');

      remotePlayer.clearTasks();
      remotePlayer.taskTurnToFace(targetPlayer.handle, -1);

      setTimeout(function() {
        remotePlayer.clearTasks();
      }, 2000);
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncAnimation');
    methods.debug(e);
  }
});

mp.events.add('client:syncStopAnimation', (playerId) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      remotePlayer.clearTasks();
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncAnimation');
    methods.debug(e);
  }
});

mp.events.add('client:syncScenario', (playerId, name, x, y, z, h, tp) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    methods.debug('Execute: events:client:syncScenario');
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;
      else remotePlayer.setAsMission(false, true);

      if(name && x && y && z && h){
        remotePlayer.clearTasksImmediately();
        remotePlayer.taskStartScenarioAtPosition(name, x, y, z, h, -1, (!(!!tp) && name == "PROP_HUMAN_SEAT_BENCH"), !!tp)
      } else
      if (name == 'PROP_HUMAN_SEAT_BENCH') {
        remotePlayer.clearTasks();
        let pos = remotePlayer.getOffsetFromInWorldCoords(0, -0.5, -0.5);
        let heading = remotePlayer.getRotation(0).z;
        remotePlayer.taskStartScenarioAtPosition(
          name,
          pos.x,
          pos.y,
          pos.z,
          heading,
          -1,
          true,
          false
        );
      } else {
        remotePlayer.clearTasks();
        remotePlayer.taskStartScenarioInPlace(name, 0, true);
      }
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncScenario');
    methods.debug(e);
  }
});

mp.events.add('client:syncStopScenario', (playerId, quick = false) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    methods.debug('Execute: client:syncStopScenario');
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (quick){
        remotePlayer.clearTasksImmediately();
      } else {
        remotePlayer.clearTasks();
      }
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncScenario');
    methods.debug(e);
  }
});


mp.events.add('client:syncScenarioCoord', (playerId, x: number, y: number, z: number, r: number) => {
  //if (mp.players.local.remoteId == playerId || mp.players.local.id == playerId)
  try {
    methods.debug('Execute: events:client:syncScenario');
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;
      else remotePlayer.setAsMission(false, true);

      remotePlayer.clearTasks();
      remotePlayer.taskUseNearestScenarioToCoordWarp(x,y,z,r,2.0)
    }
  } catch (e) {
    methods.debug('Exception: events:client:syncScenario');
    methods.debug(e);
  }
});
