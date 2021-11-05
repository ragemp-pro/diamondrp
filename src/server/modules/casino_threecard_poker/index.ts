import * as pokerHelpers from './helpers';
import * as pokerData from './threeCardPokerData';
import { user } from '../../user';

import {Hand, Game} from 'pokersolver';
import { methods } from '../methods';

const gameForTest = new Game('threecard');

const generateHand = (table: ThreeCardPokerTable, canDisqualify = false) => {
  const hand = [];

  for (let i = 0; i < 3; i++) {
    let card = pokerHelpers.shuffle(pokerData.cardsArray)[Math.floor((Math.random() * pokerData.cardsArray.length))];

    while(table.usedCards.has(card)) {
      card = pokerHelpers.shuffle(pokerData.cardsArray)[Math.floor((Math.random() * pokerData.cardsArray.length))];
    }

    table.usedCards.add(card);

    hand.push(card);
  }

  return Hand.solve(hand, gameForTest, canDisqualify);
};

/*
  currentState:
  0 - idle
  1 - time for bets ( when anyone set first bet )
  2 - send dealer cards ( block exit )
  3 - send players cards
  4 - apply bets
  5 - show cards
  6 - check winner
*/

const pokerTables: ThreeCardPokerTable[] = [
  {
    position: new mp.Vector3(1143.338, 264.2453, -52.84094),
    heading: -134.9999614,
    usedCards: new Set(),
    currentState: 0,
    players: new Map(),
    gameTimer: -1,
    activeGame: false,
    firstBetActive: false,
    dealerHand: null,
    usedSits: new Map()
  },
  {
    position: new mp.Vector3(1146.329, 261.2543, -52.84094),
    heading: 44.9999372,
    usedCards: new Set(),
    currentState: 0,
    players: new Map(),
    gameTimer: -1,
    activeGame: false,
    firstBetActive: false,
    dealerHand: null,
    usedSits: new Map()
  },
  {
    position: new mp.Vector3(1133.74, 266.6947, -52.04094),
    heading: -44.9999372,
    usedCards: new Set(),
    currentState: 0,
    players: new Map(),
    gameTimer: -1,
    activeGame: false,
    firstBetActive: false,
    dealerHand: null,
    usedSits: new Map()
  },
  {
    position: new mp.Vector3(1148.74, 251.6947, -52.04094),
    heading: -44.9999372,
    usedCards: new Set(),
    currentState: 0,
    players: new Map(),
    gameTimer: -1,
    activeGame: false,
    firstBetActive: false,
    dealerHand: null,
    usedSits: new Map()
  }
];

pokerTables.forEach(item => {
  methods.createDynamicCheckpoint(item.position, 'Нажмите ~g~Е~s~ чтобы сесть за стол', (player: PlayerMp) => {}, 3, 0, [0,0,0,0]);
})

mp.events.add('playerQuit', (player: PlayerMp) => {
  if (player.currentPokerTable) {
    const table = player.currentPokerTable;

    table.players.delete(player);
    table.usedSits.delete(player);
    return;
  }
});

export const pressE = (player: PlayerMp) => {
  if (player.currentPokerTable) {
    const table = player.currentPokerTable;

    if (table.players.has(player)) {
      const playerInfo = table.players.get(player);

      if (playerInfo.firstBet !== -1 || playerInfo.secondBet !== -1) {
        return true;
      }
    }

    table.players.delete(player);
    table.usedSits.delete(player);

    player.currentPokerTable = null;
    player.exitCasinoWait = Date.now() + 2000;
    player.call('casino.poker.client.stop');
    return true;
  }

  if (player.exitCasinoWait && player.exitCasinoWait >= Date.now()) {
    return true;
  }

  for (let j = 0; j < pokerTables.length; j++) {
    const {position, heading, usedSits} = pokerTables[j];

    const sitPositions = [
      pokerHelpers.calculateAttachPosition(position, new mp.Vector3(0, 0, heading), new mp.Vector3(-1.3, 0, 0)),
      pokerHelpers.calculateAttachPosition(position, new mp.Vector3(0, 0, heading), new mp.Vector3(-0.4877952745, -0.7133464511, 0)),
      pokerHelpers.calculateAttachPosition(position, new mp.Vector3(0, 0, heading), new mp.Vector3(0.480708, -0.721220, 0)),
      pokerHelpers.calculateAttachPosition(position, new mp.Vector3(0, 0, heading), new mp.Vector3(1.2153543, -0.0042913, 0))
    ];

    const dist = pokerHelpers.vdist(player.position, position);

    const sits = [];

    if (dist <= 3) {
      for (let i = 0; i < sitPositions.length; i++) {
        const sitPosition = sitPositions[i];
        const distSit = pokerHelpers.vdist(player.position, sitPosition);

        if (distSit <= 1.2) {
          sits.push([i, distSit, j]);
        }
      }
    }

    const sortedSitPositions = sits.sort((a, b) => a[1] - b[1]);

    if (sortedSitPositions.length) {
      const [sortedSitPositionId, _, tableId] = sortedSitPositions[0];

      let isSitUsed = false;

      for (const [_, sitIndex] of usedSits) {
        if (sitIndex === sortedSitPositionId) {
          player.outputChatBox(`Это место занято`);
          isSitUsed = true;
          return true;
        }
      }

      if (isSitUsed) {
        return true;
      }

      const table = pokerTables[tableId];

      player.currentPokerTable = table;

      table.players.set(player, {
        typeBet: 'first',
        firstBet: -1,
        secondBet: -1,
        applyFirstBet: false
      });

      player.call('casino.poker.client.start', [sortedSitPositionId, tableId]);
      return true;
    }
  }

  return false;
};

const changeTableState = (table: ThreeCardPokerTable, state: number) => {
  table.currentState = state;

  if (state === 0 || state === 6) {
    table.usedCards.clear();
  }

  if (state === 0) {
    for (const [player, playerInfo] of table.players) {
      playerInfo.firstBet = -1;
      playerInfo.secondBet = -1;
      playerInfo.hand = null;
      playerInfo.typeBet = 'first';
      playerInfo.applyFirstBet = false;

      if (mp.players.exists(player)) {
        player.call('casino.poker.client.changeTableState', [0]);
      } else {
        table.players.delete(player);
        table.usedSits.delete(player);
      }
    }

    table.activeGame = false;
    table.firstBetActive = false;
    table.dealerHand = null;
  } else if (state === 1) {
    for (const [player, playerInfo] of table.players) {
      if (mp.players.exists(player)) {
        player.call('casino.poker.client.changeTableState', [1]);
      } else {
        table.players.delete(player);
        table.usedSits.delete(player);
      }
    }

    startTableGameTimer(table);
  } else if (state === 2) {
    table.dealerHand = generateHand(table);
    const cards = table.dealerHand.cardPool.map((card: any) => card.toString());

    for (const [player] of table.players) {
      if (mp.players.exists(player)) {
        player.call('casino.poker.client.changeTableState', [2, cards]);
      } else {
        table.players.delete(player);
        table.usedSits.delete(player);
      }
    }
  } else if (state === 3) {
    for (const [player, playerInfo] of table.players) {
      if (playerInfo.firstBet !== -1 || playerInfo.secondBet !== -1) {
        playerInfo.hand = generateHand(table);
        const cards = playerInfo.hand.cardPool.map((card: any) => card.toString());
        if (mp.players.exists(player)) {
          player.call('casino.poker.client.changeTableState', [3, cards]);
        } else {
          table.players.delete(player);
          table.usedSits.delete(player);
        }
      } else {
        if (mp.players.exists(player)) {
          player.call('casino.poker.client.changeTableState', [3, null]);
        } else {
          table.players.delete(player);
          table.usedSits.delete(player);
        }
      }
    }
  } else if (state === 4) {
    for (const [player, playerInfo] of table.players) {
      if (mp.players.exists(player)) {
        player.call('casino.poker.client.changeTableState', [4]);
      } else {
        table.players.delete(player);
        table.usedSits.delete(player);
      }
    }
  } else if (state === 5) {
    for (const [player, playerInfo] of table.players) {
      if (mp.players.exists(player)) {
        player.call('casino.poker.client.changeTableState', [5]);
      } else {
        table.players.delete(player);
        table.usedSits.delete(player);
      }
    }
  } else if (state === 6) {
    for (const [player, playerInfo] of table.players) {
      if (playerInfo.firstBet !== -1 || playerInfo.secondBet !== -1) {
        const [winner] = Hand.winners([playerInfo.hand, table.dealerHand]);

        if (mp.players.exists(player)) {
          player.outputChatBox(`У тебя: ${playerInfo.hand.descr}. У крупье: ${table.dealerHand.descr}`);

          if (winner === playerInfo.hand) {

            let winBalance = 0;

            if (playerInfo.firstBet !== -1 && playerInfo.applyFirstBet) {
              const firstBetBalance = pokerData.BETS_BALANCE[playerInfo.firstBet];

              const bonus = pokerData.mapWins[playerInfo.hand.name].first.multiplier * firstBetBalance;
              winBalance += bonus;

              winBalance += firstBetBalance * (playerInfo.secondBet !== -1 ? 3 : 2);

              let messageStr = `Начальная ставка прошла, ты получил: ${firstBetBalance}. `;
              user.log(player, "Casino", `Начальная ставка прошла, получил: ${firstBetBalance}. [Покер]`);
              if (bonus > 0) {
                messageStr += `Дополнительный бонус начальной ставки: ${bonus}`;
              }

              player.outputChatBox(messageStr);
            }

            if (playerInfo.secondBet !== -1) {
              const secondBetBalance = pokerData.BETS_BALANCE[playerInfo.secondBet];

              const bonus = pokerData.mapWins[playerInfo.hand.name].second.multiplier * secondBetBalance;
              winBalance += bonus;

              if (bonus > 0) {
                winBalance += secondBetBalance;
                player.outputChatBox(`Ставка пара-плюс прошла, ты получил бонус: ${bonus}`);
                user.log(player, "Casino", `получил бонус ${bonus} по ставке пара-плюс [Покер]`);
              } else {
                player.outputChatBox(`Ставка пара-плюс не прошла.`);
              }
            }

            user.addChips(player, winBalance);
          } else {
            let winBalance = 0;

            player.outputChatBox(`Начальная ставка не прошла.`);

            if (playerInfo.secondBet !== -1) {
              const secondBetBalance = pokerData.BETS_BALANCE[playerInfo.secondBet];

              const bonus = pokerData.mapWins[playerInfo.hand.name].second.multiplier * secondBetBalance;
              winBalance += bonus;

              if (bonus > 0) {
                winBalance += secondBetBalance;

                player.outputChatBox(`Ставка пара-плюс прошла, ты получил бонус: ${bonus}`);
                user.log(player, "Casino", `получил бонус ${bonus} по ставке пара-плюс [Покер]`);
              } else {
                player.outputChatBox(`Ставка пара-плюс не прошла.`);
              }
            }

            user.addChips(player, winBalance);
          }

          player.call('casino.poker.client.changeTableState', [6]);
        } else {
          table.players.delete(player);
          table.usedSits.delete(player);
        }
      }
    }
  }
};

const startTableGameTimer = (table: ThreeCardPokerTable) => {
  table.gameTimer = setTimeout(() => {
    changeTableState(table, 2);

    setTimeout(() => {
      changeTableState(table, 3);
    }, 1500);

    setTimeout(() => {
      setTimeout(() => {
        changeTableState(table, 5);

        setTimeout(() => {
          changeTableState(table, 6);
        }, 5000);

        setTimeout(() => {
          changeTableState(table, 0);
        }, 7000);
      }, 10000);

      changeTableState(table, 4);
    }, 3000);
  }, 30 * 1000);
};

mp.events.add('casino.poker.server.setBet', (player: PlayerMp, balance: number) => {
  if (!player.currentPokerTable) {
    return;
  }

  const table = player.currentPokerTable;

  if (table.currentState !== 0 && table.currentState !== 1 && table.currentState !== 4) {
    player.call('casino.poker.client.setBet.response', [false]);
    return;
  }

  const playerInfo = table.players.get(player);

  if (balance !== -1 && player.chipsBalance - pokerData.BETS_BALANCE[balance] < 0) {
    player.call('casino.poker.client.setBet.response', [false]);
    return;
  }

  if (table.currentState === 0 || table.currentState === 1 && playerInfo.typeBet !== 'finish') {
    if (playerInfo.typeBet === 'first') {
      playerInfo.firstBet = balance;
      playerInfo.typeBet = 'second';
      table.firstBetActive = balance !== -1;

      if (table.firstBetActive) {
        user.removeChips(player, pokerData.BETS_BALANCE[balance]);
      }
    } else if (playerInfo.typeBet === 'second') {
      playerInfo.secondBet = balance;
      playerInfo.typeBet = 'finish';

      if (balance !== -1) {
        user.removeChips(player, pokerData.BETS_BALANCE[balance]);
      }
    }

    if (!table.activeGame) {
      changeTableState(table, 1);
    }

    table.activeGame = true;
  } else if (table.currentState === 4 && playerInfo.firstBet !== -1 && !playerInfo.applyFirstBet) {
    if (balance !== -1) {
      user.removeChips(player, pokerData.BETS_BALANCE[playerInfo.firstBet]);
    }

    playerInfo.applyFirstBet = balance !== -1;
  }

  player.call('casino.poker.client.setBet.response', [true, balance]);
});
