import helpers from '../../../shared/casino_roulette/helpers';
import { methods } from '../methods';
import { menu } from '../menu';
import { user } from '../../user';
import { business } from '../../business';
import * as pokerHelpers from '../casino_threecard_poker/helpers';

export let casinoEnterCost = 500;
const chipsCost = 100;
const chipsMax = 50000;
const MAX_BETS = 10;
export const casino_business_id = 500;
const tables: TableInterface[] = [];

for (let i = 0; i < helpers.positions.length; i++) {
  const positionInfo = helpers.positions[i];

  tables.push({
    position: positionInfo.position,
    heading: positionInfo.heading,
    chipTypePrices: positionInfo.chipTypePrices,
    players: new Map(),
    maxPlayers: 4,
    lastWinTime: Date.now(),
    currentWinNumber: -1,
    currentState: 0,
    lastIdleTime: Date.now(),
    // usedSits: new Map(),
    sits: [
      {
        position: pokerHelpers.calculateAttachPosition(positionInfo.position, new mp.Vector3(0, 0, positionInfo.heading), new mp.Vector3(-0.22, -0.9, 0.7)),
        player: null
      },
      {
        position: pokerHelpers.calculateAttachPosition(positionInfo.position, new mp.Vector3(0, 0, positionInfo.heading), new mp.Vector3(0.76, -0.9, 0.7)),
        player: null
      },
      {
        position: pokerHelpers.calculateAttachPosition(positionInfo.position, new mp.Vector3(0, 0, positionInfo.heading), new mp.Vector3(1.4, -0.13, 0.7)),
        player: null
      },
      {
        position: pokerHelpers.calculateAttachPosition(positionInfo.position, new mp.Vector3(0, 0, positionInfo.heading), new mp.Vector3(0.76, 0.65, 0.7)),
        player: null
      }
    ]
  });

  methods.createDynamicCheckpoint(positionInfo.position, 'Нажмите ~g~Е~s~ чтобы играть в рулетку', (player: PlayerMp) => {}, 3, 0, [0,0,0,0]);
}
/*
INSERT INTO `business` (`id`, `name`, `name2`, `price`, `money_tax`, `score_tax`, `user_name`, `user_id`, `bank`, `type`, `price_product`, `price_card1`, `price_card2`, `tarif`, `interior`, `rp_logo`, `rp_main_img`, `rp_color`) VALUES ('500', 'Казино', 'Unknown', '5000000', '0', '0', '', '0', '0', '13', '100', '10', '10', '0', '2', '/images/logoBig.png', 'https://i.imgur.com/PhhDQT9.jpg', 'grey')
*/


mp.blips.new(679, new mp.Vector3(935.53, 46.44, 81.095), {
  scale: 0.7,
  dimension: 0,
  color: 37,
  shortRange: true,
  name: "Казино"
});

methods.createDynamicCheckpoint(new mp.Vector3(1111.87, 208.12, -49.34), "Нажмите ~g~Е~s~ чтобы открыть меню бара", player => {
  player.call('client:menuList:showBarFreeMenu', [casino_business_id]);
}, 4.75, 0, [0,255,0,30])
methods.createDynamicCheckpoint(new mp.Vector3(1087.86, 222.02, -50.20), "Нажмите ~g~Е~s~ чтобы настроить плату за вход", player => {
  if(user.get(player, 'fraction_id2') != casino_business_id) return player.notify("~r~Доступно только владельцу казино");
  if(!user.isLeader2(player)) return player.notify("~r~Доступно только владельцу казино");
  const m = menu.new(player, "", "Охрана");
  m.sprite = "diamond"

  m.newItem({
    name: "Стоимость входа",
    onpress: () => {
      menu.input(player, "Введите сумму (50-500)", business.getPrice(casino_business_id).toString(), 5, "int").then(res => {
        let sum = methods.parseInt(res);
        if(isNaN(sum) || sum < 50 || sum > 500) return player.notify("~r~Количество указанно не верно")
        m.close();
        business.setPrice(casino_business_id, sum)
        player.notify(`~g~Стоимость входа успешно установлена`);
      })
    }
  });

  m.open();
});
methods.createDynamicCheckpoint(new mp.Vector3(1116.0321044921875,217.92660522460938,-50.43515396118164), "Нажмите ~g~Е~s~ чтобы купить фишки", player => {
  const m = menu.new(player, "", "Касса");
  m.sprite = "diamond"
  m.newItem({
    name: "Купить фишки",
    more: "1 Фишка - "+chipsCost+"$",
    onpress: () => {
      menu.input(player, "Введите количество", "", 5, "int").then(res => {
        let sum = methods.parseInt(res);
        if(isNaN(sum) || sum < 1 || sum > 10000000) return player.notify("~r~Количество указанно не верно")
        if(user.getChips(player) + sum > chipsMax) return player.notify("~r~Лимит фишек на руках - 50к");
        if(user.getMoney(player) < chipsCost*sum) return player.notify("~r~У вас недостаточно средств");
        m.close();
        user.addChips(player, sum);
        user.removeMoney(player, chipsCost * sum);
        player.notify(`~g~Вы успешно приобрели ${sum} фишек за ${chipsCost*sum}$ `);
        user.log(player, "Casino", `приобрёл ${sum} фишек за ${chipsCost*sum}$`)
      })
    }
  });

  m.newItem({
    name: "Обменять фишки",
    more: `Баланс: ${user.getChips(player)}`,
    onpress: () => {
      menu.input(player, "Введите количество", user.getChips(player).toString(), 11, "int").then(res => {
        let sum = methods.parseInt(res);

        if(isNaN(sum) || sum < 1 || sum > 10000000) {
          return player.notify("~r~Количество указанно не верно")
        }

        if(user.getChips(player) < sum) {
          return player.notify("~r~У вас недостаточно фишек для данной операции");
        }

        m.close();
        user.removeChips(player, sum);
        user.addMoney(player, chipsCost * sum);
        player.notify(`~g~Вы успешно обменяли ${sum} фишек на ${chipsCost * sum}$`);
        user.log(player, "Casino", `обменял ${sum} фишек на ${chipsCost * sum}$`)
      })
    }
  });

  m.open();
});

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

const sendEventToPlayers = (players: PlayerMp[], eventName: string, ...args: any[]) => {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    if (mp.players.exists(player)) {
      player.call(eventName, args);
    }
  }
};

const changeTableState = (table: TableInterface, state: number, data?: number) => {
  table.currentState = state;
  const players = [...table.players.keys()];

  sendEventToPlayers(players, 'casino.client.updateState', state, data);
};

const changeStateTablesHandler = () => {
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    table.lastIdleTime = Date.now();
    changeTableState(table, 0);

    for (const playerInfo of table.players.values()) {
      try {
        let playerWinBalance = 0;
        let playerWinBetCount = 0;
        let playerLossBetCount = 0;

        for (const [betKey, bet] of playerInfo.bets) {
          const rule = helpers.rules[betKey];

          if (!rule) {
            methods.saveLog('casino', betKey);
          }

          if (rule.winNumbers.includes(table.currentWinNumber)) {
            playerWinBalance += (bet.balance * rule.multiplier) + bet.balance;
            playerWinBetCount++;
          } else {
            playerLossBetCount++;
          }

          playerInfo.bets.delete(betKey);
        }

        playerInfo.usedChips.clear();

        if (playerWinBetCount + playerLossBetCount) {
          user.addChips(playerInfo.playerInstance, playerWinBalance);
          let messageStr = '';

          if (playerWinBalance > 0) {
            messageStr += `Ты выиграл ${playerWinBalance}. `;
            user.log(playerInfo.playerInstance, "Casino", `выиграл в рулетке ${playerWinBalance} фишек`)
          }

          playerInfo.playerInstance.outputChatBox(messageStr + `Прошло ${playerWinBetCount} ставок из ${playerWinBetCount + playerLossBetCount}.`);
        } else {
          playerInfo.skipBets += 1;

          if (playerInfo.skipBets >= 5) {
            user.kick(playerInfo.playerInstance, "Вы пропустили 5 ставок", "ANTI-AFK")
          }
        }
      } catch(e) {
        console.error(e);
      }
    }
  }

  setTimeout(() => {
    for (let i = 0; i < tables.length; i++) {
      changeTableState(tables[i], 1);
    }
  }, 30000);

  setTimeout(() => {
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const winNumber = Math.floor(Math.random() * 38);
      table.currentWinNumber = winNumber;
      table.lastWinTime = Date.now();

      changeTableState(table, 2, winNumber);
    }
  }, 40000);
};

const changeStateTablesTimer = setInterval(changeStateTablesHandler, 52000);
changeStateTablesHandler();

const createPlayerForTableFromPlayer = (player: PlayerMp, sitPositionId: number): TablePlayerInterface => ({
  playerInstance: player,
  bets: new Map(),
  skipBets: 0,
  usedChips: new Set(),
  sitPositionId
});

const casinoClientStop = (player: PlayerMp) => {
  const table = player.currentRouletteTable;
  const playerInfo = table.players.get(player);
  player.outputChatBox(`Ты вышел с рулетки`);

  const players = [...table.players.keys()];

  sendEventToPlayers(players, 'casino.client.stop', player.id);

  if (table.currentState === 0) {
    let returnetBetsValue = 0;

    const playerInfo = table.players.get(player);

    for (const [betKey, betInfo] of playerInfo.bets) {
      returnetBetsValue += betInfo.balance;
    }

    user.addChips(player, returnetBetsValue);
  }

  // table.usedSits.delete(player);
  table.sits[playerInfo.sitPositionId].player = null;
  table.players.delete(player);
  player.currentRouletteTable = null;
};

const getBetsCount = (table: TableInterface, userId: number) => {
  let betsCount = 0;

  table.players.forEach((playerInfo, pl) => {
    if (userId == pl.id) {
      betsCount += playerInfo.bets.size;
    }
  });

  return betsCount;
};

mp.events.add('playerQuit', (player: PlayerMp) => {
  if (player.currentRouletteTable) {
    casinoClientStop(player)
  }
});

mp.events.add('casino.setBet', (player: PlayerMp, betKey: string, x: number, y: number, chipType: number) => {
  if (!player.currentRouletteTable) {
    return;
  }

  const table = player.currentRouletteTable;

  if (
    !table.players.has(player) ||
    typeof betKey !== 'string' ||
    !betKey.length ||
    getBetsCount(table, player.id) >= MAX_BETS ||
    user.getChips(player) - table.chipTypePrices[chipType] < 0 ||
    table.currentState !== 0
  ) {
    player.call('casino.client.updateBetFailure', [0]);
    return;
  }

  const playerInfo = table.players.get(player);

  let updateOtherPlayers = false;

  let betsSum = 0;

  for (const betInfo of playerInfo.bets.values()) {
    betsSum += betInfo.balance;
  }

  if (betsSum + table.chipTypePrices[chipType] > table.chipTypePrices[table.chipTypePrices.length - 1]) {
    player.notify(`~r~Сумма всех ваших ставок не может превышать более ${table.chipTypePrices[table.chipTypePrices.length - 1]} фишек`);
    player.call('casino.client.updateBetFailure', [0]);
    return;
  }

  if (playerInfo.usedChips.has(chipType)) {
    player.notify(`~r~Вы уже использовали фишку данного номинала.`);
    player.call('casino.client.updateBetFailure', [0]);
    return;
  }

  if (playerInfo.bets.has(betKey)) {
    const bet = playerInfo.bets.get(betKey);

    bet.balance += table.chipTypePrices[chipType];
    const currentChipType = helpers.getChipTypeByBalance(table, bet.balance);

    if (bet.currentChipType !== currentChipType) {
      updateOtherPlayers = true;
    }

    bet.currentChipType = currentChipType;
  } else {
    const betInfo = {
      balance: table.chipTypePrices[chipType],
      x,
      y,
      currentChipType: chipType
    };

    playerInfo.bets.set(betKey, betInfo);

    updateOtherPlayers = true;
  }

  playerInfo.usedChips.add(chipType);

  user.removeChips(player, table.chipTypePrices[chipType]);
  const bet = playerInfo.bets.get(betKey);
  playerInfo.skipBets = 0;

  const players = [...table.players.keys()];

  for (let i = 0; i < players.length; i++) {
    const tablePlayer = players[i];

    if (updateOtherPlayers && tablePlayer !== player) {
      tablePlayer.call('casino.client.updateBet', [player, betKey, bet.x, bet.y, table.chipTypePrices[bet.currentChipType]]);
    }
  }

  player.call('casino.client.updateBet', [player, betKey, bet.x, bet.y, bet.balance]);
});

mp.events.add('casino.removeBet', (player: PlayerMp, betKey: string, chipType: number) => {
  if (!player.currentRouletteTable) {
    return;
  }

  const table = player.currentRouletteTable;

  if (!table.players.has(player)  || table.currentState !== 0) {
    player.call('casino.client.updateBetFailure', [0]);
    return;
  }

  const playerInfo = table.players.get(player);

  let updateOtherPlayers = false;

  if (playerInfo.bets.has(betKey)) {
    const bet = playerInfo.bets.get(betKey);

    const currentChipType = helpers.getChipTypeByBalance(table, bet.balance);

    bet.balance -= table.chipTypePrices[currentChipType];
    user.addChips(player, table.chipTypePrices[currentChipType]);

    if (bet.currentChipType !== currentChipType) {
      updateOtherPlayers = true;
    }

    bet.currentChipType = currentChipType;

    const players = [...table.players.keys()];

    for (let i = 0; i < players.length; i++) {
      const tablePlayer = players[i];

      if (updateOtherPlayers && tablePlayer !== player) {
        tablePlayer.call('casino.client.updateBet', [player, betKey, 0, 0, table.chipTypePrices[bet.currentChipType]]);
      }
    }

    player.call('casino.client.updateBet', [player, betKey, 0, 0, bet.balance]);

    if (bet.balance <= 0) {
      playerInfo.usedChips.delete(currentChipType);
      playerInfo.bets.delete(betKey);
      return;
    }
  }
});

export const pressE = (player: PlayerMp) => {
  if (player.currentRouletteTable) {
    casinoClientStop(player);
    player.exitCasinoWait = Date.now() + 2000;

    return true;
  }

  if (player.exitCasinoWait && player.exitCasinoWait >= Date.now()) {
    return true;
  }

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    if (vdist(player.position, table.position) <= 2) {
      if (table.players.size >= table.maxPlayers) {
        player.outputChatBox(`Все места заняты`);
        return true;
      }

      const initedBets = [];

      for (const [player, {bets}] of table.players) {
        if (mp.players.exists(player)) {
          for (const [betKey, betInfo] of bets) {
            initedBets.push(`${player.id},${betKey},${betInfo.x},${betInfo.y},${betInfo.balance}`);
          }
        }
      }

      const dist = pokerHelpers.vdist(player.position, table.position);

      const sits = [];

      if (dist <= 3.3) {
        for (let i = 0; i < table.sits.length; i++) {
          const sitPosition = table.sits[i].position;
          const distSit = pokerHelpers.vdist(player.position, sitPosition);

          if (distSit <= 1.2) {
            sits.push([i, distSit]);
          }
        }
      }

      const sortedSitPositions = sits.sort((a, b) => a[1] - b[1]);

      if (sortedSitPositions.length) {
        const [sortedSitPositionId] = sortedSitPositions[0];

        // let isSitUsed = false;
        //
        // for (const [_, sitIndex] of table.usedSits) {
        //   if (sitIndex === sortedSitPositionId && _ !== player) {
        //     player.outputChatBox(`Это место занято`);
        //     isSitUsed = true;
        //     return true;
        //   }
        // }
        //
        // if (isSitUsed) {
        //   return true;
        // }
        //
        // table.usedSits.set(player, sortedSitPositionId);

        if (table.sits[sortedSitPositionId].player) {
          player.outputChatBox(`Это место занято`);
          return true;
        }

        table.sits[sortedSitPositionId].player = player;

        table.players.set(player, table.players.get(player) || createPlayerForTableFromPlayer(player, sortedSitPositionId));
        player.currentRouletteTable = table;

        player.outputChatBox(`Ты занял место: ${sortedSitPositionId + 1}`);

        player.call('casino.client.start', [i, table.currentState, table.currentWinNumber, (Date.now() - table.lastWinTime) / 1000, initedBets.join('|'), 30000 - (Date.now() - table.lastIdleTime), sortedSitPositionId]);
      }

      return true;
    }
  }

  return false;
};
