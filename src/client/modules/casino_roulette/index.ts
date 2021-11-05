import helpers, {ChipTypePricesType} from '../../../shared/casino_roulette/helpers';

import CamerasManager from '../../managers/cameraManager';
import { gui } from '../gui';
import { user } from '../../user';
import { methods } from '../methods';

const camera = CamerasManager.hasCamera('casino_roulette') ? CamerasManager.getCamera('casino_roulette') : CamerasManager.createCamera('casino', 'default', new mp.Vector3(0, 0, 0), new mp.Vector3(-90, 0, 0), 50);

export let inCasino = false;
const interiors = [274689, 275201];

setInterval(() => {
  if(!user.isLogin()) return;
  let inint = interiors.indexOf(mp.game.interior.getInteriorAtCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z)) > -1;
  if(inint != inCasino){
    inCasino = inint;
    gui.browser.execute(`CEF.hud.setCasinoInt(${inCasino ? 'true' : 'false'});`)
  }
}, 500);

const GRID_START_X = -0.057;
const GRID_START_Y = -0.192;
const GRID_START_Z = 0.9448;

const CELL_SIZE_X = 0.081;
const CELL_SIZE_X_05 = 0.081 / 2;

const CELL_SIZE_Y = 0.167;
const CELL_SIZE_Y_05 = 0.167 / 2;
const CELL_SIZE_Y_07 = CELL_SIZE_Y * 0.7;

const CELL_OFFSET_X = 0.015;
const CELL_OFFSET_Y = 0.02;

const GRID_CENTER_X = 0.39;
const GRID_CENTER_Y = -0.02;

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const MAX_BETS = 10;

const chipTypeModels = ['vw_prop_chip_10dollar_x1', 'vw_prop_chip_50dollar_x1', 'vw_prop_chip_100dollar_x1', 'vw_prop_chip_500dollar_x1', 'vw_prop_chip_1kdollar_x1', 'vw_prop_chip_5kdollar_x1', 'vw_prop_chip_10kdollar_x1'];

const stateNames = ['Ожидание', 'Ставки сделаны', 'Запуск...'];

interface BetInterface {
  balance: number;
  x: number;
  y: number;
  chipObject: any;
}

interface ThisInfoInterface {
  isActive: boolean;
  ballObject?: any;
  currentTable?: any;
  tables: any[];
  chipObject?: any;
  markerObjects: any;
  chipPosition: Vector3Mp;
  cellsData: any[];
  selectedIds: string[];
  otherBets: any;
  myBets: any;
  currentChipType: number;
  cameraOnWheel: boolean;
  waitBet: boolean;
  currentState?: number;
  currentStateName?: string;
  lastSelectedBetKey: string;
  lastCurrentBet: number;
  endActionTime?: number;
  lastActionTimeSeconds: number;
  lastPosition: Vector3Mp;
}

const thisInfo: ThisInfoInterface = {
  isActive: false,
  ballObject: null,
  currentTable: null,
  tables: [],
  chipObject: null,
  markerObjects: new Map(),
  chipPosition: new mp.Vector3(0, 0, 0),
  cellsData: [],
  selectedIds: [],
  otherBets: new Map(),
  myBets: new Map(),
  currentChipType: 0,
  cameraOnWheel: false,
  waitBet: false,
  lastSelectedBetKey: '',
  lastCurrentBet: 0,
  endActionTime: null,
  lastActionTimeSeconds: 0,
  lastPosition: new mp.Vector3(0, 0, 0)
};

const SITS_POSITIONS: {[key: number]: [number, number, number, number]} = {
  [0]: [-0.22, -0.9, 0.7, 0],
  [1]: [0.76, -0.9, 0.7, 0],
  [2]: [1.4, -0.13, 0.7, 90],
  [3]: [0.76, 0.65, 0.7, 180]
};

// TODO: Add it to shared casino
mp.keys.bind(0x45, true, () => {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && gui.currentGui !== 'casino') {
    mp.events.callRemote('onPressKeyCasino:e');
  }
});

const timerLoadAnimDict = setInterval(() => {
  if (!mp.game.streaming.hasAnimDictLoaded('anim_casino_b@amb@casino@games@roulette@table')) {
    mp.game.streaming.requestAnimDict('anim_casino_b@amb@casino@games@roulette@table');
    return;
  }

  clearInterval(timerLoadAnimDict);
}, 500);

const createTable = (color: number, position: Vector3Mp, heading: number, chipTypePrices: ChipTypePricesType) => {
  const model = 'vw_prop_casino_roulette_01';
  const tableObject = mp.objects.new(mp.game.joaat(model), position, {
    dimension: -1,
    rotation: new mp.Vector3(0, 0, heading)
  });

  mp.game.invoke('0x971DA0055324D033', tableObject.handle, color);

  thisInfo.tables.push({
    tableObject,
    position,
    heading,
    model,
    chipTypePrices
  });
};

for (let i = 0; i < helpers.positions.length; i++) {
  const positionInfo = helpers.positions[i];
  createTable(1, positionInfo.position, positionInfo.heading, positionInfo.chipTypePrices);
}

const generateTableCells = (entity: ObjectMp) => {
  const cells: any[] = [];

  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 3; j++) {
      const id = cells.length;

      const bottomOffset = i === 11 ? -CELL_OFFSET_X : 0;
      const leftOffset = j === 0 ? CELL_OFFSET_Y * 2 : 0;

      const firstPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((i * CELL_SIZE_X) - CELL_SIZE_X_05) - CELL_OFFSET_X, GRID_START_Y + ((j * CELL_SIZE_Y) - CELL_SIZE_Y_05) - CELL_OFFSET_Y + leftOffset, GRID_START_Z);
      const secondPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((i * CELL_SIZE_X) - CELL_SIZE_X_05) - CELL_OFFSET_X, GRID_START_Y + ((j * CELL_SIZE_Y) + CELL_SIZE_Y_05) + CELL_OFFSET_Y, GRID_START_Z);
      const threePoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((i * CELL_SIZE_X) + CELL_SIZE_X_05) + CELL_OFFSET_X + bottomOffset, GRID_START_Y + ((j * CELL_SIZE_Y) - CELL_SIZE_Y_05) - CELL_OFFSET_Y + leftOffset, GRID_START_Z);
      const fourPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((i * CELL_SIZE_X) + CELL_SIZE_X_05) + CELL_OFFSET_X + bottomOffset, GRID_START_Y + ((j * CELL_SIZE_Y) + CELL_SIZE_Y_05) + CELL_OFFSET_Y, GRID_START_Z);

      const markerPos = entity.getOffsetFromInWorldCoords(GRID_START_X + (i * CELL_SIZE_X), GRID_START_Y + (j * CELL_SIZE_Y), GRID_START_Z);

      cells.push({
        id,
        coloredId: RED_NUMBERS.includes(id + 1) ? `~r~${id + 1}` : `~c~${id + 1}`,
        firstPoint,
        secondPoint,
        threePoint,
        fourPoint,
        markerPos,
        isActive: false
      });
    }
  }

  (() => {
    const firstPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X, 0.107 - CELL_SIZE_Y_07 - CELL_OFFSET_Y, GRID_START_Z);
    const secondPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X, 0.107 + CELL_SIZE_Y_07 + CELL_OFFSET_Y, GRID_START_Z);
    const threePoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, 0.107 - CELL_SIZE_Y_07 - CELL_OFFSET_Y, GRID_START_Z);
    const fourPoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, 0.107 + CELL_SIZE_Y_07 + CELL_OFFSET_Y, GRID_START_Z);

    const markerPos = entity.getOffsetFromInWorldCoords(-0.137, 0.107, GRID_START_Z);

    cells.push({
      id: cells.length,
      coloredId: `~g~Double zero`,
      firstPoint,
      secondPoint,
      threePoint,
      fourPoint,
      markerPos,
      isActive: false
    });
  })();

  (() => {
    const firstPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X, -0.148 - CELL_SIZE_Y_07 + (CELL_OFFSET_Y * 0.5), GRID_START_Z);
    const secondPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X, -0.148 + CELL_SIZE_Y_07 + CELL_OFFSET_Y, GRID_START_Z);
    const threePoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, -0.148 - CELL_SIZE_Y_07 + (CELL_OFFSET_Y * 0.5), GRID_START_Z);
    const fourPoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, -0.148 + CELL_SIZE_Y_07 + CELL_OFFSET_Y, GRID_START_Z);

    const markerPos = entity.getOffsetFromInWorldCoords(-0.137, -0.148, GRID_START_Z);

    cells.push({
      id: cells.length,
      coloredId: `~g~zero`,
      firstPoint,
      secondPoint,
      threePoint,
      fourPoint,
      markerPos,
      isActive: false
    });
  })();

  (() => {
    for (let i = 0; i < 3; i++) {
      const firstPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 4)) * i) - (CELL_SIZE_X_05), GRID_START_Y - (CELL_SIZE_Y * 0.8) - (CELL_OFFSET_Y * 0.2), GRID_START_Z);
      const secondPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 4)) * i) - (CELL_SIZE_X_05), GRID_START_Y - (CELL_SIZE_Y_05), GRID_START_Z);
      const threePoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 4)) * i) - (CELL_SIZE_X_05) + (CELL_SIZE_X * 4), GRID_START_Y - (CELL_SIZE_Y * 0.8) - (CELL_OFFSET_Y * 0.2), GRID_START_Z);
      const fourPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 4)) * i) - (CELL_SIZE_X_05) + (CELL_SIZE_X * 4), GRID_START_Y - (CELL_SIZE_Y_05), GRID_START_Z);

      const hoverItems = [];

      for (let j = (i) * 12; j < (i + 1) * 12; j++) {
        hoverItems.push(j);
      }

      cells.push({
        id: cells.length,
        coloredId: `~c~${(i) * 12}-${(i + 1) * 12}`,
        firstPoint,
        secondPoint,
        threePoint,
        fourPoint,
        isActive: false,
        hoverItems
      });
    }
  })();

  (() => {
    for (let i = 0; i < 6; i++) {
      const firstPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 2)) * i) - (CELL_SIZE_X_05), GRID_START_Y - (CELL_SIZE_Y) - (CELL_SIZE_Y * 0.4), GRID_START_Z);
      const secondPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 2)) * i) - (CELL_SIZE_X_05), GRID_START_Y - (CELL_SIZE_Y_05) + (CELL_OFFSET_Y * 0.6) - (CELL_SIZE_Y * 0.4), GRID_START_Z);
      const threePoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 2)) * i) - (CELL_SIZE_X_05) + (CELL_SIZE_X * 2), GRID_START_Y - (CELL_SIZE_Y) - (CELL_SIZE_Y * 0.4), GRID_START_Z);
      const fourPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (((CELL_SIZE_X * 2)) * i) - (CELL_SIZE_X_05) + (CELL_SIZE_X * 2), GRID_START_Y - (CELL_SIZE_Y_05) + (CELL_OFFSET_Y * 0.6) - (CELL_SIZE_Y * 0.4), GRID_START_Z);

      const hoverItems = [];

      if (i === 0) {
        for (let j = 0; j < 18; j++) {
          hoverItems.push(j);
        }
      } else if (i === 1) {
        for (let j = 0; j < 36; j++) {
          if ((cells[j].id + 1) % 2 === 0) {
            hoverItems.push(j);
          }
        }
      } else if (i === 2) {
        for (let j = 0; j < 36; j++) {
          if (RED_NUMBERS.includes(cells[j].id + 1)) {
            hoverItems.push(j);
          }
        }
      } else if (i === 3) {
        for (let j = 0; j < 36; j++) {
          if (!RED_NUMBERS.includes(cells[j].id + 1)) {
            hoverItems.push(j);
          }
        }
      } else if (i === 4) {
        for (let j = 0; j < 36; j++) {
          if ((cells[j].id + 1) % 2 !== 0) {
            hoverItems.push(j);
          }
        }
      } else if (i === 5) {
        for (let j = 18; j < 36; j++) {
          hoverItems.push(j);
        }
      }

      cells.push({
        id: cells.length,
        coloredId: `~c~down_${i}`,
        firstPoint,
        secondPoint,
        threePoint,
        fourPoint,
        isActive: false,
        hoverItems
      });
    }
  })();

  (() => {
    for (let i = 0; i < 3; i++) {
      const rightOffset = i === 2 ? CELL_OFFSET_Y : 0;
      const firstPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((12 * CELL_SIZE_X) - CELL_SIZE_X_05), GRID_START_Y + ((i * CELL_SIZE_Y) - CELL_SIZE_Y_05) + 0.0005, GRID_START_Z);
      const secondPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((12 * CELL_SIZE_X) - CELL_SIZE_X_05), GRID_START_Y + ((i * CELL_SIZE_Y) + CELL_SIZE_Y_05) + rightOffset - 0.0005, GRID_START_Z);
      const threePoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((12 * CELL_SIZE_X) + CELL_SIZE_X_05) + (CELL_OFFSET_X * 0.4), GRID_START_Y + ((i * CELL_SIZE_Y) - CELL_SIZE_Y_05) + 0.0005, GRID_START_Z);
      const fourPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + ((12 * CELL_SIZE_X) + CELL_SIZE_X_05) + (CELL_OFFSET_X * 0.4), GRID_START_Y + ((i * CELL_SIZE_Y) + CELL_SIZE_Y_05) + rightOffset - 0.0005, GRID_START_Z);

      const hoverItems = [];

      for (let j = 0; j < 12; j++) {
        hoverItems.push(j * 3 + i);
      }

      cells.push({
        id: cells.length,
        coloredId: `~c~Колонка: ${i + 1}`,
        firstPoint,
        secondPoint,
        threePoint,
        fourPoint,
        isActive: false,
        hoverItems
      });
    }
  })();

  (() => {
    const firstPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X , GRID_START_Y - CELL_SIZE_Y_05, GRID_START_Z);
    const secondPoint = entity.getOffsetFromInWorldCoords(-0.137 - CELL_SIZE_X_05 - CELL_OFFSET_X, GRID_START_Y - CELL_SIZE_Y_05 + CELL_OFFSET_Y, GRID_START_Z);
    const threePoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, GRID_START_Y - CELL_SIZE_Y_05, GRID_START_Z);
    const fourPoint = entity.getOffsetFromInWorldCoords(-0.137 + CELL_SIZE_X_05 + CELL_OFFSET_X, GRID_START_Y - CELL_SIZE_Y_05 + CELL_OFFSET_Y, GRID_START_Z);

    cells.push({
      id: cells.length,
      coloredId: `~c~Ряд: 1`,
      firstPoint,
      secondPoint,
      threePoint,
      fourPoint,
      isActive: false,
      hoverItems: [36, 37]
    });
  })();

  (() => {
    for (let i = 0; i < 12; i++) {
      const bottomOffset = i === 11 ? -CELL_OFFSET_X : 0;

      const firstPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (CELL_SIZE_X * i) - (CELL_SIZE_X_05) - CELL_OFFSET_X, GRID_START_Y - CELL_SIZE_Y_05, GRID_START_Z);
      const secondPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (CELL_SIZE_X * i) - (CELL_SIZE_X_05) - CELL_OFFSET_X, GRID_START_Y - CELL_SIZE_Y_05 + CELL_OFFSET_Y, GRID_START_Z);
      const threePoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (CELL_SIZE_X * i) - (CELL_SIZE_X_05) + CELL_SIZE_X + CELL_OFFSET_X + bottomOffset, GRID_START_Y - CELL_SIZE_Y_05, GRID_START_Z);
      const fourPoint = entity.getOffsetFromInWorldCoords(GRID_START_X + (CELL_SIZE_X * i) - (CELL_SIZE_X_05) + CELL_SIZE_X + CELL_OFFSET_X + bottomOffset, GRID_START_Y - CELL_SIZE_Y_05 + CELL_OFFSET_Y, GRID_START_Z);

      const hoverItems = [];

      for (let j = i * 3; j < (i + 1) * 3; j++) {
        hoverItems.push(j);
      }

      cells.push({
        id: cells.length,
        coloredId: `~c~Ряд: ${i + 2}`,
        firstPoint,
        secondPoint,
        threePoint,
        fourPoint,
        isActive: false,
        hoverItems
      });
    }
  })();

  return cells;
};

const area = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => (Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0));
const check = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x: number, y: number) => (
  (
    area(x1, y1, x2, y2, x3, y3) +
    area(x1, y1, x4, y4, x3, y3)
  ) ===
  (
    area(x, y, x1, y1, x2, y2) +
    area(x, y, x2, y2, x3, y3) +
    area(x, y, x3, y3, x4, y4) +
    area(x, y, x1, y1, x4, y4)
  )
);

const onActiveAction = ({id, hoverItems}: {id: number, hoverItems: number[]}) => {
  if (!Array.isArray(hoverItems)) {
    return;
  }

  for (let i = 0; i < hoverItems.length; i++) {
    thisInfo.currentTable.cellsData[hoverItems[i]].isHovered = true;
  }
};

const onDeActiveAction = ({id, hoverItems}: {id: number, hoverItems: number[]}) => {
  if (!Array.isArray(hoverItems)) {
    return;
  }

  for (let i = 0; i < hoverItems.length; i++) {
    thisInfo.currentTable.cellsData[hoverItems[i]].isHovered = false;
  }
};

const playAnimForCurrentTable = (winNumber: number, animTime = 0) => {
  if (typeof thisInfo.currentTable === 'undefined' || !thisInfo.currentTable.tableObject || !mp.objects.exists(thisInfo.currentTable.tableObject)) {
    return
  }

  const animId = helpers.mapAnims[winNumber];
  thisInfo.currentTable.tableObject.playAnim(`exit_${animId}_wheel`, 'anim_casino_b@amb@casino@games@roulette@table', 1000, false, true, false, 0, 131072);
  thisInfo.currentTable.tableObject.forceAiAndAnimationUpdate();

  if (animTime !== 0) {
    const animDurationWheel = mp.game.entity.getEntityAnimDuration('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_wheel`);

    const timerUpdateCurrentTime = setInterval(() => {
      if (thisInfo.currentTable && mp.objects.exists(thisInfo.currentTable.tableObject) && thisInfo.currentTable.tableObject.isPlayingAnim('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_wheel`, 3)) {
        thisInfo.currentTable.tableObject.setAnimCurrentTime('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_wheel`, animTime / animDurationWheel);
        clearInterval(timerUpdateCurrentTime);
      }
    }, 50);
  }


  thisInfo.currentTable.currentAnimName = `exit_${animId}_wheel`;

  if (!thisInfo.ballObject || !mp.objects.exists(thisInfo.ballObject)) {
    return;
  }

  const ballPosition = thisInfo.currentTable.tableObject.getWorldPositionOfBone(thisInfo.currentTable.tableObject.getBoneIndexByName('Roulette_Wheel'));

  thisInfo.ballObject.setCoordsNoOffset(ballPosition.x, ballPosition.y, ballPosition.z, false, false, false);
  const tableRotation = thisInfo.currentTable.tableObject.getRotation(2);
  thisInfo.ballObject.setRotation(tableRotation.x, tableRotation.y, tableRotation.z + 90, 2, false);

  mp.game.invoke('0xEA1C610A04DB6BBB', thisInfo.ballObject.handle, true);

  thisInfo.ballObject.playAnim(`exit_${animId}_ball`, 'anim_casino_b@amb@casino@games@roulette@table', 1000, false, true, false, 0, 136704);

  if (animTime !== 0) {
    const animDurationBall = mp.game.entity.getEntityAnimDuration('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_ball`);

    const timerUpdateCurrentTime = setInterval(() => {
      if (mp.objects.exists(thisInfo.ballObject) && thisInfo.ballObject.isPlayingAnim('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_ball`, 3)) {
        thisInfo.ballObject.setAnimCurrentTime('anim_casino_b@amb@casino@games@roulette@table', `exit_${animId}_ball`, animTime / animDurationBall);
        clearInterval(timerUpdateCurrentTime);
      }
    }, 50);
  }

  thisInfo.currentTable.currentAnimId = animId;
};

const changeCurrentTableState = (state: number, winNumber?: number, animTime?: number, endActionTime?: number) => {
  if (!thisInfo.currentTable || !thisInfo.isActive) {
    return false;
  }

  thisInfo.currentState = state;
  thisInfo.currentStateName = stateNames[state];

  if (state !== 0) {
    gui.browser.execute(`CEF.casino.updateAdditionalData({selected: '', currentBet: ''})`);
  }

  if (state === 0) {
    thisInfo.endActionTime = Date.now() + (typeof endActionTime === 'number' ? endActionTime : 30000);
    changeChipState(true);

    for (const [playerKey, bets] of thisInfo.otherBets) {
      for (const [betKey, bet] of bets) {
        if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
          bet.chipObject.destroy();
          bets.delete(betKey);
        }
      }

      thisInfo.otherBets.delete(playerKey);
    }

    for (const [betKey, bet] of thisInfo.myBets) {
      if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
        bet.chipObject.destroy();
      }

      thisInfo.myBets.delete(betKey);
    }
  } else if (state === 1) {
    thisInfo.endActionTime = null;
    changeMarkersActive(false);
    changeChipState(false);

    if (typeof thisInfo.currentTable.currentAnimName !== 'undefined') {
      thisInfo.currentTable.tableObject.stopAnim(thisInfo.currentTable.currentAnimName, 'anim_casino_b@amb@casino@games@roulette@table', 0);
    }

    if (!thisInfo.ballObject || !mp.objects.exists(thisInfo.ballObject)) {
      return;
    }

    mp.game.invoke('0xEA1C610A04DB6BBB', thisInfo.ballObject.handle, false);

    mp.gui.chat.push('Ставки сделаны');
  } else if (state === 2) {
    thisInfo.endActionTime = null;
    changeChipState(false);

    mp.gui.chat.push('Запуск...');
    playAnimForCurrentTable(winNumber, animTime);
  }

  gui.browser.execute(`CEF.casino.updateAdditionalData({currentBets: ${getBetsCount()}, currentState: '${thisInfo.currentStateName}'});`);
};

const changeMarkersActive = (state: boolean) => {
  if (!thisInfo.currentTable || !thisInfo.isActive) {
    return false;
  }

  for (let i = 0; i < 38; i++) {
    const cellData = thisInfo.currentTable.cellsData[i];

    if (typeof cellData.markerObject !== 'undefined' && mp.objects.exists(cellData.markerObject)) {
      mp.game.invoke('0xEA1C610A04DB6BBB', cellData.markerObject.handle, state);
    }
  }
}

const changeChipState = (state: boolean) => {
  if (!thisInfo.chipObject || !mp.objects.exists(thisInfo.chipObject)) {
    return false;
  }

  mp.game.invoke('0xEA1C610A04DB6BBB', thisInfo.chipObject.handle, state);
};

const changeCameraMode = (onWheel: boolean) => {
  if (!thisInfo.currentTable || !thisInfo.isActive) {
    return false;
  }

  const pointPosition = onWheel ? thisInfo.currentTable.centerGridPosition : thisInfo.currentTable.wheelCenterPosition;

  mp.game.cam.doScreenFadeOut(50);

  setTimeout(() => {
    camera.pointAtCoord(pointPosition.x, pointPosition.y, pointPosition.z);
  }, 80);

  setTimeout(() => {
    mp.game.cam.doScreenFadeIn(50);
  }, 100);
};

const changeChipType = (direction: number) => {
  if (!thisInfo.currentTable || !thisInfo.isActive || thisInfo.currentState !== 0) {
    return false;
  }

  const nextChipType = Math.min(Math.max(thisInfo.currentChipType + direction, 0), thisInfo.currentTable.chipTypePrices.length - 1);

  const nextChipModel = mp.game.joaat(chipTypeModels[nextChipType]);
  const chipExists = thisInfo.chipObject && mp.objects.exists(thisInfo.chipObject);

  if (chipExists && thisInfo.chipObject.model === nextChipModel) {
    return;
  }

  if (chipExists) {
    thisInfo.chipObject.destroy();
  }

  const chipPosition = thisInfo.currentTable.tableObject.getOffsetFromInWorldCoords(thisInfo.chipPosition.x, thisInfo.chipPosition.y, GRID_START_Z);

  thisInfo.chipObject = mp.objects.new(nextChipModel, chipPosition, {dimension: -1});

  changeChipState(thisInfo.currentState === 0);

  thisInfo.currentChipType = nextChipType;
  gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentTable.chipTypePrices[nextChipType]});`);
};

mp.keys.bind(0x27, true, () => {
  changeChipType(1);
});

mp.keys.bind(0x25, true, () => {
  changeChipType(-1);
});

mp.keys.bind(0x22, false, () => {
  changeCameraMode(true);
});

mp.keys.bind(0x22, true, () => {
  changeCameraMode(false);
});

let timerSit: number = 0;

mp.events.add('casino.client.start', (tableId: number, currentState: number, currentWinNumber: number, currentAnimTime: number, initedBets: string, endActionTime: number, currentSitIndex: number) => {
  if (!thisInfo.tables[tableId] || thisInfo.isActive) {
    return;
  }

  const tableInfo = thisInfo.tables[tableId];

  if (!tableInfo.tableObject || !mp.objects.exists(tableInfo.tableObject)) {
    return;
  }

  if (typeof tableInfo.centerGridPosition === 'undefined') {
    tableInfo.centerGridPosition = tableInfo.tableObject.getOffsetFromInWorldCoords(GRID_CENTER_X, GRID_CENTER_Y, GRID_START_Z);
  }

  if (typeof tableInfo.wheelCenterPosition === 'undefined') {
    tableInfo.wheelCenterPosition = tableInfo.tableObject.getOffsetFromInWorldCoords(-0.73, GRID_CENTER_Y - 0.15, GRID_START_Z + 0.1);
  }

  if (typeof tableInfo.cameraPosition === 'undefined') {
    tableInfo.cameraPosition = tableInfo.tableObject.getOffsetFromInWorldCoords(GRID_CENTER_X, -0.2, 2.5);
  }

  if (typeof tableInfo.gridFirstPoint === 'undefined') {
    tableInfo.gridFirstPoint = tableInfo.tableObject.getOffsetFromInWorldCoords(-0.14, -0.39, GRID_START_Z);
  }

  if (typeof tableInfo.gridSecondPoint === 'undefined') {
    tableInfo.gridSecondPoint = tableInfo.tableObject.getOffsetFromInWorldCoords(-0.14, 0.21, GRID_START_Z);
  }

  if (typeof tableInfo.gridThreePoint === 'undefined') {
    tableInfo.gridThreePoint = tableInfo.tableObject.getOffsetFromInWorldCoords(0.91, 0.21, GRID_START_Z);
  }

  if (typeof tableInfo.gridFourPoint === 'undefined') {
    tableInfo.gridFourPoint = tableInfo.tableObject.getOffsetFromInWorldCoords(0.91, -0.39, GRID_START_Z);
  }

  camera.setCoord(tableInfo.cameraPosition.x, tableInfo.cameraPosition.y, tableInfo.cameraPosition.z);
  camera.pointAtCoord(tableInfo.centerGridPosition.x, tableInfo.centerGridPosition.y, tableInfo.centerGridPosition.z);

  thisInfo.currentChipType = 0;

  thisInfo.chipObject = mp.objects.new(mp.game.joaat(chipTypeModels[thisInfo.currentChipType]), tableInfo.centerGridPosition, {dimension: -1});

  thisInfo.chipPosition.x = GRID_CENTER_X;
  thisInfo.chipPosition.y = GRID_CENTER_Y;

  changeChipState(currentState === 0);

  thisInfo.ballObject = mp.objects.new(mp.game.joaat('vw_prop_roulette_ball'), tableInfo.tableObject.getWorldPositionOfBone(tableInfo.tableObject.getBoneIndexByName('Roulette_Wheel')), {
    dimension: -1
  });

  mp.game.invoke('0xEA1C610A04DB6BBB', thisInfo.ballObject.handle, false);

  const tableRotation = tableInfo.tableObject.getRotation(2);

  if (typeof tableInfo.cellsData === 'undefined') {
    tableInfo.cellsData = generateTableCells(tableInfo.tableObject);
  }

  for (let i = 0; i < 38; i++) {
    const cellData = tableInfo.cellsData[i];
    const markerPos = cellData.markerPos;

    if (typeof cellData.markerObject === 'undefined' || !mp.objects.exists(cellData.markerObject)) {
      cellData.markerObject = mp.objects.new(mp.game.joaat(i >= 36 ? 'vw_prop_vw_marker_01a' : 'vw_prop_vw_marker_02a'), markerPos, {
        dimension: -1,
        rotation: tableRotation
      });
    }

    mp.game.invoke('0xEA1C610A04DB6BBB', cellData.markerObject.handle, false);
    mp.game.invoke('0x971DA0055324D033', cellData.markerObject.handle, 3);
  }

  thisInfo.waitBet = false;

  thisInfo.isActive = true;
  thisInfo.currentTable = tableInfo;

  changeCurrentTableState(currentState, currentWinNumber, currentAnimTime, endActionTime);

  const sitPosition = tableInfo.tableObject.getOffsetFromInWorldCoords(
    SITS_POSITIONS[currentSitIndex][0],
    SITS_POSITIONS[currentSitIndex][1],
    SITS_POSITIONS[currentSitIndex][2]
  );

  const obj = mp.game.object.getClosestObjectOfType(
    tableInfo.position.x, tableInfo.position.y, tableInfo.position.z,
    2.0,
    mp.game.joaat(tableInfo.model),
    false,
    false,
    false
  );

  if (obj !== 0) {
    mp.game.invoke("0x1A9205C1B9EE827F", obj, false, false);

    setTimeout(() => {
      mp.game.invoke("0x1A9205C1B9EE827F", obj, true, true);
    }, 5000);
  }

  thisInfo.lastPosition = mp.players.local.position;

  user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, (tableInfo.heading + SITS_POSITIONS[currentSitIndex][3]) - 90, false);

  timerSit = setTimeout(() => {
    user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, (tableInfo.heading + SITS_POSITIONS[currentSitIndex][3]));
    CamerasManager.setActiveCamera(camera, true);

    mp.game.ui.displayRadar(false);

    gui.browser.execute(`CEF.casino.show('roulette', {minBet: ${thisInfo.currentTable.chipTypePrices[0]}, maxBet: ${thisInfo.currentTable.chipTypePrices[thisInfo.currentTable.chipTypePrices.length - 1]}, currentBets: ${getBetsCount()}, currentState: '${stateNames[currentState]}'});`);
    gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentTable.chipTypePrices[0]});`);

    if (!initedBets.length) {
      return;
    }

    const parsedInitedBets = initedBets.split('|');

    for (let i = 0; i < parsedInitedBets.length; i++) {
      const [playerId, betKey, x, y, balance] = parsedInitedBets[i].split(',');

      const player = mp.players.at(parseInt(playerId));

      if (player && mp.players.exists(player)) {
        updateBet(player, betKey, parseFloat(x), parseFloat(y), parseInt(balance));
      }
    }

    gui.browser.execute(`CEF.casino.updateAdditionalData({currentBets: ${getBetsCount()}, currentState: '${stateNames[currentState]}'});`);
  }, 4000);
});

mp.events.add('casino.client.stop', (playerId: number) => {
  clearTimeout(timerSit);

  if (!thisInfo.isActive) {
    return false;
  }

  if (playerId !== mp.players.local.remoteId) {
    if (thisInfo.otherBets.has(playerId)) {
      const bets = thisInfo.otherBets.get(playerId);

      for (const [betKey, bet] of bets) {
        if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
          bet.chipObject.destroy();
          bets.delete(betKey);
        }
      }

      thisInfo.otherBets.delete(playerId);
    }
    return;
  }

  thisInfo.isActive = false;
  gui.browser.execute(`CEF.casino.hide();`);

  mp.players.local.setVisible(true, true);
  CamerasManager.setActiveCamera(camera, false);
  mp.game.ui.displayRadar(true);

  user.playScenario("PROP_HUMAN_SEAT_BENCH", mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, mp.players.local.getHeading() - 90);
  setTimeout(() => {
    user.stopScenario();
    // setTimeout(() => {
    //   mp.players.local.setCoordsNoOffset(thisInfo.lastPosition.x, thisInfo.lastPosition.y, thisInfo.lastPosition.z, false, false, false);
    // }, 2000);
  }, 200);

  if (typeof thisInfo.chipObject !== 'undefined' && mp.objects.exists(thisInfo.chipObject)) {
    thisInfo.chipObject.destroy();
  }

  if (typeof thisInfo.ballObject !== 'undefined' && mp.objects.exists(thisInfo.ballObject)) {
    thisInfo.ballObject.destroy();
  }

  if (thisInfo.currentTable.currentAnimName) {
    thisInfo.currentTable.tableObject.stopAnim(thisInfo.currentTable.currentAnimName, 'anim_casino_b@amb@casino@games@roulette@table', -1000);
  }

  for (let i = 0; i < 38; i++) {
    const cellData = thisInfo.currentTable.cellsData[i];

    if (typeof cellData.markerObject !== 'undefined' && mp.objects.exists(cellData.markerObject)) {
      cellData.markerObject.destroy();
    }
  }

  for (const [betKey, bet] of thisInfo.myBets) {
    if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
      bet.chipObject.destroy();
    }

    thisInfo.myBets.delete(betKey);
  }

  for (const [playerKey, bets] of thisInfo.otherBets) {
    for (const [betKey, bet] of bets) {
      if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
        bet.chipObject.destroy();
        bets.delete(betKey);
      }
    }

    thisInfo.otherBets.delete(playerKey);
  }

  delete thisInfo.currentTable;
});

mp.events.add('casino.client.updateState', (state: number, winNumber: number) => {
  changeCurrentTableState(state, winNumber);
});

const getChipModelTypeByBalance = (balance: number): string => {
  for (let i = thisInfo.currentTable.chipTypePrices.length - 1; i >= 0; i--) {
    const chipPrice = thisInfo.currentTable.chipTypePrices[i];

    if (balance >= chipPrice) {
      return chipTypeModels[i];
    }
  }
};

const updateChipModelForBet = (bet: BetInterface) => {
  const model = mp.game.joaat(getChipModelTypeByBalance(bet.balance));

  if (!bet.chipObject || !mp.objects.exists(bet.chipObject)) {
    bet.chipObject = mp.objects.new(model, thisInfo.currentTable.tableObject.getOffsetFromInWorldCoords(bet.x, bet.y, GRID_START_Z), {dimension: -1});
  } else if (bet.chipObject.model !== model && bet.balance > 0) {
    const chipPosition = bet.chipObject.getCoords(true);
    bet.chipObject.destroy();

    bet.chipObject = mp.objects.new(model, chipPosition, {dimension: -1});
  }
};

const updateBet = (player: PlayerMp, betKey: string, x: number, y: number, balance: number) => {
  if (!thisInfo.isActive || !thisInfo.currentTable) {
    return;
  }

  if (player === mp.players.local) {
    thisInfo.waitBet = false;

    if (thisInfo.myBets.has(betKey)) {
      const bet = thisInfo.myBets.get(betKey);

      bet.balance = balance;
    } else {
      const betInfo = {
        balance,
        x,
        y
      };

      thisInfo.myBets.set(betKey, betInfo);
    }

    const bet = thisInfo.myBets.get(betKey);

    updateChipModelForBet(bet);

    if (bet.balance <= 0) {
      if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
        bet.chipObject.destroy();
      }

      thisInfo.myBets.delete(betKey);
    }
  } else {
    if (!thisInfo.otherBets.has(player.remoteId)) {
      thisInfo.otherBets.set(player.remoteId, new Map());
    }

    const playerBets = thisInfo.otherBets.get(player.remoteId);

    if (playerBets.has(betKey)) {
      const bet = playerBets.get(betKey);

      bet.balance = balance;
    } else {
      const betInfo = {
        balance,
        x,
        y
      };

      playerBets.set(betKey, betInfo);
    }

    const bet = playerBets.get(betKey);

    updateChipModelForBet(bet);

    if (bet.balance <= 0) {
      if (bet.chipObject && mp.objects.exists(bet.chipObject)) {
        bet.chipObject.destroy();
      }

      playerBets.delete(betKey);
    }

    if (!playerBets.size) {
      thisInfo.otherBets.delete(player.remoteId);
    }
  }

  gui.browser.execute(`CEF.casino.updateAdditionalData({currentBets: ${getBetsCount()}});`);
};

const getBetsCount = (): number => {
  let betsCount = thisInfo.myBets.size;

  // for (const bets of thisInfo.otherBets.values()) {
  //   betsCount += bets.size;
  // }

  return betsCount;
};

const hasBetByBetKey = (betKey: string): boolean => thisInfo.myBets.has(betKey);

mp.events.add('casino.client.updateBetFailure', () => {
  thisInfo.waitBet = false;
});

mp.events.add('casino.client.updateBet', updateBet);

mp.events.add('casino.client.interfaceAction', (action: string, ...data: any) => {
  if (!thisInfo.isActive) {
    return;
  }

  if (action === 'changeDirection') {
    const [direction]: [number] = data;

    changeChipType(direction);
  }
});

const resolution = mp.game.graphics.getScreenActiveResolution(0, 0);

mp.events.add('click', (x, y, upOrDown, leftOrRight) => {
  if (
    !thisInfo.isActive ||
    thisInfo.waitBet ||
    upOrDown === 'down' ||
    thisInfo.currentState !== 0 ||
    !thisInfo.currentTable ||
    !helpers.insidePolygon(
      [mp.gui.cursor.position[0] / resolution.x, mp.gui.cursor.position[1] / resolution.y],
      [
        [thisInfo.currentTable.screenGridFirstPoint.x, thisInfo.currentTable.screenGridFirstPoint.y],
        [thisInfo.currentTable.screenGridSecondPoint.x, thisInfo.currentTable.screenGridSecondPoint.y],
        [thisInfo.currentTable.screenGridThreePoint.x, thisInfo.currentTable.screenGridThreePoint.y],
        [thisInfo.currentTable.screenGridFourPoint.x, thisInfo.currentTable.screenGridFourPoint.y]
      ]
    )
  ) {
    return;
  }

  const betKey = thisInfo.selectedIds.join('-');

  if (leftOrRight === 'left') {
    if (getBetsCount() >= MAX_BETS) {
      mp.gui.chat.push(`Сделано максимальное количество ставок`);
      return;
    }

    mp.events.callRemote('casino.setBet', betKey, thisInfo.chipPosition.x, thisInfo.chipPosition.y, thisInfo.currentChipType);
    thisInfo.waitBet = true;
  }

  if (leftOrRight === 'right') {
    if (hasBetByBetKey(betKey)) {
      mp.events.callRemote('casino.removeBet', betKey, thisInfo.currentChipType);
      thisInfo.waitBet = true;
    }
  }
});

mp.events.add('render', () => {
  if (!inCasino) return;
  if (thisInfo.isActive && thisInfo.currentTable && thisInfo.currentTable.tableObject && mp.objects.exists(thisInfo.currentTable.tableObject)) {
    mp.game.controls.disableAllControlActions(0);

    const tableInfo = thisInfo.currentTable;

    let endActionSeconds = 0;

    if (thisInfo.endActionTime) {
      endActionSeconds = Math.floor((thisInfo.endActionTime - Date.now()) / 1000);
    } else {
      thisInfo.lastActionTimeSeconds = 0;
    }

    if (thisInfo.lastActionTimeSeconds !== endActionSeconds) {

      if (endActionSeconds >= 0) {
        gui.browser.execute(`CEF.casino.updateAdditionalData({
          currentState: 'Ожидание - 00:${endActionSeconds.toString().padStart(2, '0')}'
        });`);
      }

      thisInfo.lastActionTimeSeconds = endActionSeconds;
    }

    if (thisInfo.currentState === 0) {
      tableInfo.screenGridFirstPoint = mp.game.graphics.world3dToScreen2d(tableInfo.gridFirstPoint.x, tableInfo.gridFirstPoint.y, tableInfo.gridFirstPoint.z);
      tableInfo.screenGridSecondPoint = mp.game.graphics.world3dToScreen2d(tableInfo.gridSecondPoint.x, tableInfo.gridSecondPoint.y, tableInfo.gridSecondPoint.z);
      tableInfo.screenGridThreePoint = mp.game.graphics.world3dToScreen2d(tableInfo.gridThreePoint.x, tableInfo.gridThreePoint.y, tableInfo.gridThreePoint.z);
      tableInfo.screenGridFourPoint = mp.game.graphics.world3dToScreen2d(tableInfo.gridFourPoint.x, tableInfo.gridFourPoint.y, tableInfo.gridFourPoint.z);

      const mousePosition = [mp.gui.cursor.position[0] / resolution.x, mp.gui.cursor.position[1] / resolution.y];

      const gridStartY = mousePosition[1] - tableInfo.screenGridSecondPoint.y;
      const gridEndY = tableInfo.screenGridFourPoint.y - tableInfo.screenGridSecondPoint.y;

      const yRelativePos = gridStartY / gridEndY;

      const screenGridX = helpers.lerp(tableInfo.screenGridSecondPoint.x, tableInfo.screenGridFirstPoint.x, yRelativePos);
      const gridStartX = mousePosition[0] - screenGridX;
      const gridEndX = tableInfo.screenGridThreePoint.x - screenGridX;

      const xRelativePos = gridStartX / gridEndX;

      thisInfo.chipPosition.x = Math.min(Math.max(helpers.lerp(-0.191, 0.96, xRelativePos), -0.191), 0.96);
      thisInfo.chipPosition.y = Math.min(Math.max(helpers.lerp(0.23, -0.426, yRelativePos), -0.426), 0.23);

      const chipPosition = thisInfo.currentTable.tableObject.getOffsetFromInWorldCoords(thisInfo.chipPosition.x, thisInfo.chipPosition.y, GRID_START_Z);
      thisInfo.chipObject.setCoordsNoOffset(chipPosition.x, chipPosition.y, chipPosition.z, false, false, false);

      const selectedIds = [];
      const selectedColoredIds = [];

      for (let i = 0; i < thisInfo.currentTable.cellsData.length; i++) {
        const {id, coloredId, firstPoint, secondPoint, threePoint, fourPoint} = thisInfo.currentTable.cellsData[i];
        if (check(firstPoint.x, firstPoint.y, threePoint.x, threePoint.y, fourPoint.x, fourPoint.y, secondPoint.x, secondPoint.y, chipPosition.x, chipPosition.y)) {
          selectedIds.push(id);
          selectedColoredIds.push(coloredId);
        } else {
          if (thisInfo.currentTable.cellsData[i].isActive) {
            onDeActiveAction(thisInfo.currentTable.cellsData[i]);
            thisInfo.currentTable.cellsData[i].isActive = false;
          }
        }
      }

      thisInfo.selectedIds = selectedIds;

      const betKey = selectedIds.join('-');

      if (thisInfo.lastSelectedBetKey !== betKey) {
        thisInfo.lastSelectedBetKey = betKey;

        const selected = helpers.rules[betKey] ? helpers.rules[betKey].title || betKey : '';

        gui.browser.execute(`CEF.casino.updateAdditionalData({selected: '${selected}'})`);
      }

      // if (betKey.length && helpers.rules[betKey]) {
      //   mp.game.graphics.drawText(`Выбрано: ${helpers.rules[betKey].title}`, [0.5, 0.1], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
      // } else {
      //   mp.game.graphics.drawText(`Выбрано: ${betKey}`, [0.5, 0.1], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
      // }

      let currentBet = 0;

      if (thisInfo.myBets.has(betKey)) {
        currentBet = thisInfo.myBets.get(betKey).balance;

        // mp.game.graphics.drawText(`Сумма этой ставки: ${thisInfo.myBets.get(betKey).balance}, возможный выигрыш: ${helpers.rules[betKey].multiplier * thisInfo.myBets.get(betKey).balance}`, [0.5, 0.13], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
      }

      if (thisInfo.lastCurrentBet !== currentBet) {
        thisInfo.lastCurrentBet = currentBet;
        gui.browser.execute(`CEF.casino.updateAdditionalData({currentBet: ${currentBet}})`);
      }

      for (let cellId = 0; cellId < thisInfo.currentTable.cellsData.length; cellId++) {
        const {id, markerObject} = thisInfo.currentTable.cellsData[cellId];

        if (selectedIds.includes(id)) {
          if (!thisInfo.currentTable.cellsData[cellId].isActive) {
            onActiveAction(thisInfo.currentTable.cellsData[cellId]);
            thisInfo.currentTable.cellsData[cellId].isActive = true;
          }
        }

        if (markerObject && mp.objects.exists(markerObject)) {
          mp.game.invoke('0xEA1C610A04DB6BBB', markerObject.handle, thisInfo.currentTable.cellsData[cellId].isHovered || thisInfo.currentTable.cellsData[cellId].isActive);
        }
      }
    }

    // mp.game.graphics.drawText(`Текущее состояние: ${thisInfo.currentStateName}`, [0.5, 0.19], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
  }
});
