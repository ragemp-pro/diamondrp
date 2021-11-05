import _ from 'lodash';
import slotMachineData from './slotMachineData';
import { user } from '../../user';
import { methods } from '../methods';

const vdist = (v1: Vector3Mp, v2: Vector3Mp, useZ = true): number => {
  const diffY = v1.y - v2.y;
  const diffX = v1.x - v2.x;

  if (useZ) {
    const diffZ = v1.z - v2.z;
    return Math.sqrt((diffY * diffY) + (diffX * diffX) + (diffZ * diffZ));
  } else {
    return Math.sqrt((diffY * diffY) + (diffX * diffX));
  }
};
for (let i = 0; i < slotMachineData.slotMachinesMeta.length; i++) {
  const slotMachineMeta = slotMachineData.slotMachinesMeta[i];
  methods.createDynamicCheckpoint(slotMachineMeta.position, 'Нажмите ~g~Е~s~ чтобы сесть за автомат', (player: PlayerMp) => {}, 2, 0, [0,0,0,0]);
}
const generateWinNumbers = () => {
  const winNumbers = [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)];

  // "normalize", cause 6 and 2 - its cherry, and when drop numbers 6-2-6, visually it same icons, but code think what win numbers wrong
  for (let i = 0; i < winNumbers.length; i++) {
    if (winNumbers[i] === 6) {
      winNumbers[i] = 2;
    }
  }

  const winString = winNumbers.join('-');
  const rule = slotMachineData.rules[winString];

  return {
    winNumbers,
    winString,
    rule,
    isWinBet: typeof rule === 'number'
  };
};

const generateWin = () => {
  const winActions = _.shuffle(_.flatMap(slotMachineData.rulesPercentage, (winAction => Array(winAction.pct).fill(winAction))));

  const winAction = winActions[Math.floor(Math.random() * winActions.length)];

  const winStrings = slotMachineData.rulesMap[winAction.value];
  const winString = winStrings[Math.floor(Math.random() * winStrings.length)];

  const rule = slotMachineData.rules[winString];

  return {
    winString,
    rule,
    isWinBet: typeof rule === 'number'
  };
};

mp.events.add('casino.slots.server.spin.request', (player: PlayerMp, currentBet: number) => {
  const slotMachineMeta = slotMachineData.slotMachinesMeta[player.currentSlotMachine];
  if (!slotMachineMeta) return;
  const slotMachineBetMeta = slotMachineData.typesMeta[slotMachineMeta.type];

  const betBalance = slotMachineBetMeta.bet * currentBet;

  if (player.chipsBalance - betBalance < 0) {
    player.call('casino.slots.client.spin.response', [false, '', player.chipsBalance]);
    return;
  }

  user.removeChips(player, betBalance);

  const {winString, rule, isWinBet} = generateWin();

  player.call('casino.slots.client.spin.response', [true, winString, player.chipsBalance]);

  const winBalance = betBalance * rule;

  player.slotMachinesCurrentState = 1;

  setTimeout(() => {
    if (player && mp.players.exists(player) && typeof player.currentSlotMachine === 'number') {
      if (isWinBet) {
        user.addChips(player, winBalance);
        user.log(player, "Casino", `выиграл в игровом автомате ${winBalance} фишек`)
        player.call('casino.slots.client.responseWin', [winBalance, player.chipsBalance]);
      } else {
        player.notify(`~o~Ты проиграл ${betBalance}`);
      }

      player.slotMachinesCurrentState = 0;
    }
  }, 5000);
});

mp.events.add('playerQuit', (player) => {
  if (typeof player.currentSlotMachine === 'number') {
    slotMachineData.slotMachinesMeta[player.currentSlotMachine].player = null;
  }
});

export const pressE = (player: PlayerMp) => {
  if (typeof player.currentSlotMachine === 'number') {
    if (player.slotMachinesCurrentState === 1) {
      return true;
    }

    player.call('casino.slots.client.stop');
    const slotid = player.currentSlotMachine
    setTimeout(() => {
      slotMachineData.slotMachinesMeta[slotid].player = null;
    }, 5000)

    player.currentSlotMachine = null;
    player.exitCasinoWait = Date.now() + 2000;
    return true;
  }

  if (player.exitCasinoWait && player.exitCasinoWait >= Date.now()) {
    return true;
  }

  const slotMachines = [];

  for (let i = 0; i < slotMachineData.slotMachinesMeta.length; i++) {
    const slotMachineMeta = slotMachineData.slotMachinesMeta[i];
    const dist = vdist(player.position, slotMachineMeta.position);

    if (dist <= 2) {
      slotMachines.push([i, dist])
    }
  }

  const sortedSlotMachines = slotMachines.sort((a, b) => a[1] - b[1]);

  if (sortedSlotMachines.length) {
    const [sortedSlotMachineId] = sortedSlotMachines[0];
    const slotMachineMeta = slotMachineData.slotMachinesMeta[sortedSlotMachineId];
    if (slotMachineMeta.player) {
      player.outputChatBox('Это место занято');
      return true;
    }

    slotMachineMeta.player = player;
    player.currentSlotMachine = sortedSlotMachineId;
    player.call('casino.slots.client.start', [sortedSlotMachineId, player.chipsBalance]);

    return true;
  }

  return false;
};
