import { gui } from '../gui';
import * as helpers from '../casino_threecard_poker/helpers';
import { user } from '../../user';
import { inCasino } from '../casino_roulette';

const thisInfo: any = {
  dealerActive: false,
  isActive: false,
  currentTable: null,
  players: new Set(),
  currentBet: 0,
  spinActive: false,
  onInterfaceHovered: false
};

const SITS_POSITIONS: {[key: number]: [number, number, number, number]} = {
  [0]: [-1.3, 0, 0.7, -60],
  [1]: [-0.4877952745, -0.7133464511, 0.7, -20],
  [2]: [0.480708, -0.721220, 0.7, 30],
  [3]: [1.2153543, -0.0042913, 0.7, 70]
};

interface DiceTable {
  position: Vector3Mp;
  heading: number;
  model: string;
}

const diceTables: DiceTable[] = [];

const createTable = (position: Vector3Mp, heading: number, model: string) => {
  const table = {
    position,
    heading,
    model
  };

  diceTables.push(table);

  return table;
};

createTable(new mp.Vector3(1148.837, 269.747, -52.84095), -134.6906604, 'vw_prop_casino_blckjack_01');
createTable(new mp.Vector3(1151.84, 266.747, -52.84095), 45.3093566, 'vw_prop_casino_blckjack_01');
createTable(new mp.Vector3(1144.429, 247.3352, -52.041), 135.3094387, 'vw_prop_casino_blckjack_01b');
createTable(new mp.Vector3(1129.406, 262.3578, -52.041), 135.3094387, 'vw_prop_casino_blckjack_01b');

const getStateName = () => {
  return thisInfo.spinActive ? 'Идет игра' : 'Ожидание';
};

const getPlayersNames = () => {
  return [...thisInfo.players].map((player, playerIndex) => (
    `${playerIndex + 1}) ${(player === mp.players.local) ? 'Вы' : `Игрок ${playerIndex + 1}`}`
  ));
};

mp.events.add('casino.dice.client.startDealer', (tableId, ...players) => {
  thisInfo.players = new Set(players);
  thisInfo.currentTable = diceTables[tableId];
  thisInfo.dealerActive = true;
  thisInfo.currentBet = 0;
  thisInfo.awaitChangeBet = false;
  thisInfo.awaitSetBet = false;
  thisInfo.awaitSpin = false;
  thisInfo.spinActive = false;

  gui.browser.execute(`CEF.casino.show('dice-dealer', {currentState: '${getStateName()}', currentBet: 0, players: ${JSON.stringify(getPlayersNames())}, disabledChangeBet: false})`);
  gui.browser.execute(`CEF.casino.changeBetValue(0);`);

  mp.game.ui.displayRadar(false);
});

mp.events.add('casino.dice.client.stopDealer', () => {
  thisInfo.dealerActive = false;
  thisInfo.players = new Set();
  thisInfo.currentTable = null;

  gui.browser.execute(`CEF.casino.hide()`);

  mp.game.ui.displayRadar(true);
});

let sitTimer: number = 0;

mp.events.add('casino.dice.client.start', (tableId, sitIndex, currentBet, currentState, endSpinTime, ...players) => {
  thisInfo.players = new Set(players);
  thisInfo.currentTable = diceTables[tableId];
  thisInfo.currentBet = currentBet;
  thisInfo.spinActive = currentState === 1;

  if (currentState === 1) {
    thisInfo.endSpinTime = endSpinTime;
  }

  thisInfo.isActive = true;
  thisInfo.awaitChangeBet = false;
  thisInfo.awaitSetBet = false;
  thisInfo.awaitSpin = false;

  const sitPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTable.position, thisInfo.currentTable.heading, new mp.Vector3(
    SITS_POSITIONS[sitIndex][0],
    SITS_POSITIONS[sitIndex][1],
    SITS_POSITIONS[sitIndex][2]
  ));

  const obj = mp.game.object.getClosestObjectOfType(
    thisInfo.currentTable.position.x, thisInfo.currentTable.position.y, thisInfo.currentTable.position.z,
    2.0,
    mp.game.joaat(thisInfo.currentTable.model),
    false,
    false,
    false
  );

  if(obj !== 0) {
    mp.game.invoke("0x1A9205C1B9EE827F", obj, false, false);

    setTimeout(() => {
      mp.game.invoke("0x1A9205C1B9EE827F", obj, true, true);
    }, 5000);
  }

  thisInfo.sitPosition = sitPosition;

  thisInfo.lastPosition = mp.players.local.position;

  user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, (thisInfo.currentTable.heading + SITS_POSITIONS[sitIndex][3]) - 90, false);

  sitTimer = setTimeout(() => {
    user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, thisInfo.currentTable.heading + SITS_POSITIONS[sitIndex][3]);
    mp.game.ui.displayRadar(false);
    gui.browser.execute(`CEF.casino.show('dice', {currentState: '${getStateName()}', currentBet: ${currentBet}, players: ${JSON.stringify(getPlayersNames())}, disabledChangeBet: false})`);
    gui.browser.execute(`CEF.casino.changeBetValue(${currentBet});`);
  }, 4000);
});

mp.events.add('casino.dice.client.stop', () => {
  clearTimeout(sitTimer);
  thisInfo.isActive = false;
  thisInfo.players = new Set();
  thisInfo.currentTable = null;
  thisInfo.currentBet = 0;

  gui.browser.execute(`CEF.casino.hide()`);

  mp.game.ui.displayRadar(true);

  user.playScenario("PROP_HUMAN_SEAT_BENCH", mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, mp.players.local.getHeading() - 90);
  setTimeout(() => {
    user.stopScenario();
    setTimeout(() => {
      mp.players.local.setCoordsNoOffset(thisInfo.lastPosition.x, thisInfo.lastPosition.y, thisInfo.lastPosition.z, false, false, false);
    }, 2000);
  }, 200);
});

mp.events.add('casino.client.interfaceAction', (action: string, ...data: any) => {
  if (thisInfo.isActive) {
    if (action === 'clickButton') {
      const [buttonName]: string = data;

      if (buttonName === 'bet') {
        requestBet();
      }
    }
  } else if (thisInfo.dealerActive) {
    if (action === 'changeBetValue') {
      const [newValue]: [string] = data;

      requestChangeBet(parseInt(newValue));
    } else if (action === 'clickButton') {
      const [buttonName]: string = data;

      if (buttonName === 'spin') {
        requestSpin(true);
      }
    } else  if (action === 'onHoverInterface') {
      const [state]: [boolean] = data;

      thisInfo.onInterfaceHovered = state;
    }
  }
});

const requestChangeBet = (value: number) => {
  if (value > 10000 || value <= 0) {
    gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentBet})`);
    return;
  }

  thisInfo.nextBet = value;
  mp.events.callRemote('casino.dice.server.changeBet', thisInfo.nextBet);
  thisInfo.awaitChangeBet = true;

  gui.browser.execute(`CEF.casino.updateAdditionalData({disabledChangeBet: true, players: ${JSON.stringify(getPlayersNames())}})`);
};

mp.keys.bind(0x25, true, () => {
  if (!thisInfo.dealerActive || thisInfo.awaitChangeBet || thisInfo.spinActive) {
    return;
  }

  const prevBet = thisInfo.currentBet;
  let newBet = thisInfo.currentBet;

  if (thisInfo.currentBet - 50 <= 0) {
    mp.gui.chat.push(`Сумма ставки не может быть равна 0`);
    return;
  } else {
    newBet = thisInfo.currentBet - 50;
  }

  if (prevBet === thisInfo.currentBet) {
    return;
  }

  requestChangeBet(newBet);
});

mp.keys.bind(0x27, true, () => {
  if (!thisInfo.dealerActive || thisInfo.awaitChangeBet || thisInfo.spinActive) {
    return;
  }

  requestChangeBet(thisInfo.currentBet + 50);
});

const requestBet = () => {
  if (thisInfo.isActive && !thisInfo.awaitSetBet) {
    if (thisInfo.players.size >= 4) {
      mp.gui.chat.push(`Ставки сделаны!`);
      return;
    }

    mp.events.callRemote('casino.dice.server.setBet');
    thisInfo.awaitSetBet = true;
  }
};

const requestSpin = (skipHovered: boolean = false) => {
  if (thisInfo.dealerActive && !thisInfo.awaitSpin && (skipHovered ? true : !thisInfo.onInterfaceHovered)) {
    if (thisInfo.players.size < 2) {
      mp.gui.chat.push(`Слишком мало участников для запуска игры!`);
      return;
    }

    mp.events.callRemote('casino.dice.server.spin');
    thisInfo.awaitSpin = true;
  }
};

mp.keys.bind(0x0D, true, () => {
  if (thisInfo.spinActive) {
    return;
  }

  requestSpin();

  requestBet();
});

mp.events.add('casino.dice.client.setBet.response', () => {
  thisInfo.awaitSetBet = false;
});

mp.events.add('casino.dice.client.spin.response', (success) => {
  thisInfo.awaitSpin = false;

  if (success) {
    thisInfo.spinActive = true;
    thisInfo.endSpinTime = Date.now() + 10000;

    gui.browser.execute(`CEF.casino.updateAdditionalData({currentState: '${getStateName()}', players: ${JSON.stringify(getPlayersNames())}})`);
  }
});

mp.events.add('casino.dice.client.spin', (success) => {
  if (!thisInfo.isActive) {
    return;
  }

  thisInfo.spinActive = true;
  thisInfo.endSpinTime = Date.now() + 10000;
  gui.browser.execute(`CEF.casino.updateAdditionalData({currentState: '${getStateName()}', players: ${JSON.stringify(getPlayersNames())}})`);
});

mp.events.add('casino.dice.client.clear', () => {
  thisInfo.spinActive = false;
  thisInfo.currentBet = 0;
  thisInfo.endSpinTime = null;
  thisInfo.players.clear();

  gui.browser.execute(`CEF.casino.updateAdditionalData({currentState: '${getStateName()}', players: [], bet: 0, currentBet: 0})`);
  gui.browser.execute(`CEF.casino.changeBetValue(0)`);
});

mp.events.add('casino.dice.client.changeBet.response', (success) => {
  thisInfo.awaitChangeBet = false;

  if (success) {
    thisInfo.currentBet = thisInfo.nextBet;
  }

  gui.browser.execute(`CEF.casino.updateAdditionalData({disabledChangeBet: false, players: ${JSON.stringify(getPlayersNames())}})`);
  gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentBet})`);

});

mp.events.add('casino.dice.client.changeBet', (changedBet) => {
  thisInfo.currentBet = changedBet;

  gui.browser.execute(`CEF.casino.updateAdditionalData({currentBet: ${changedBet}, players: ${JSON.stringify(getPlayersNames())}})`);
});

mp.events.add('casino.dice.client.addPlayer', (player) => {
  thisInfo.players.add(player);

  gui.browser.execute(`CEF.casino.updateAdditionalData({players: ${JSON.stringify(getPlayersNames())}})`);
});

mp.events.add('casino.dice.client.removePlayer', (player) => {
  thisInfo.players.delete(player);

  gui.browser.execute(`CEF.casino.updateAdditionalData({players: ${JSON.stringify(getPlayersNames())}})`);
});

mp.events.add('render', () => {
  if (!inCasino) return;

  if (thisInfo.sitPosition) {
    mp.game.graphics.drawMarker(
      25,
      thisInfo.sitPosition.x, thisInfo.sitPosition.y, thisInfo.sitPosition.z,
      0, 0, 0,
      0, 0, 0,
      0.1, 0.1, 0.1,
      255, 255, 255, 255,
      false, false, 2,
      false, "", "",false
    );
  }

  if (thisInfo.dealerActive || thisInfo.isActive) {
    mp.game.controls.disableAllControlActions(0);

    if (thisInfo.endSpinTime) {
      const endBetSeconds = Math.floor((thisInfo.endSpinTime - Date.now()) / 1000);

      if (endBetSeconds > 0) {
        mp.game.graphics.drawText(`Осталось времени: 00:${endBetSeconds.toString().padStart(2, '0')}`, [0.5, 0.1], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.7], outline: true, centre: true });
      }
    }

    // mp.game.graphics.drawText(`Текущая ставка: ${thisInfo.currentBet}`, [0.5, 0.13], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });

    // mp.game.graphics.drawText(`Игроки: ${thisInfo.players.size}/4`, [0.5, 0.16], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });

    // for (let i = 0; i < players.length; i++) {
    //   const player = players[i];
    //   if (mp.players.exists(player)) {
    //     mp.game.graphics.drawText(`${player.name}`, [0.5, 0.19 + (i * 0.03)], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
    //   }
    // }
  }
});
