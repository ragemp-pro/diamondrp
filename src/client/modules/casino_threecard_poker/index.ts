import CamerasManager from '../../managers/cameraManager';
const camera = CamerasManager.hasCamera('casino') ? CamerasManager.getCamera('casino') : CamerasManager.createCamera('casino', 'default', new mp.Vector3(0, 0, 0), new mp.Vector3(-90, 0, 0), 50);

import bezierEasing from './helpers/bezierEasing';
import * as helpers from './helpers';
import Quaternion from './helpers/Quaternion';
import { gui } from '../gui';
import { user } from '../../user';
import { inCasino } from '../casino_roulette';


const thisInfo: any = {
  x: 0,
  y: 0,
  dealerCards: [],
  playerCards: [],
  playersCards: new Map(),
  currentSitIndex: 0,
  currentState: 0,
  currentAnimationState: 0,
  isActive: false,
  currentBetStatus: 0,
  betBalance: 0,
  secondBetBalance: 0,
  awaitSetBet: false,
  lastEndTimeSecconds: 0,
  lastCurrentBetName: '',
  lastPosition: new mp.Vector3(0, 0, 0)
};

const CARDS_POSITIONS: any = {
  spawn: [
    [0, 0.55, -1],
    [0, 0.55, 1.2]
  ],
  dealer: [
    [-0.1371, 0.14, -20],
    [0, 0.115, 0],
    [0.1421, 0.14, 22]
  ],
  [0]: [
    [-0.7, 0.215, 0.9479, 113],
    [-0.7 + 0.01, 0.215 - 0.015, 0.9479 + 0.00055, 113],
    [-0.7 + 0.02, 0.215 - 0.03, 0.9479 + 0.0011, 113],
  ],
  [1]: [
    [-0.31, -0.2, 0.9479, -17],
    [-0.31 + 0.02, -0.2 + 0.0005, 0.9479 + 0.00055, -17],
    [-0.31 + 0.04, -0.2 + 0.001, 0.9479 + 0.0011, -17]
  ],
  [2]: [
    [0.288, -0.21, 0.9479, 23],
    [0.288 + 0.015, -0.21 + 0.015, 0.9479 + 0.00055, 23],
    [0.288 + 0.03, -0.21 + 0.03, 0.9479 + 0.0011, 23]
  ],
  [3]: [
    [0.682, 0.176, 0.9479, -108],
    [0.682 - 0.001, 0.176 + 0.02, 0.9479 + 0.00055, -108],
    [0.682 - 0.002, 0.176 + 0.04, 0.9479 + 0.0011, -108]
  ]
};

const CAMERAS_SIT_POSITIONS: {[key: number]: number[]} = {
  [0]: [-1.3, 0, 1.5],
  [1]: [-0.4877952745, -0.7133464511, 1.5],
  [2]: [0.480708, -0.721220, 1.5],
  [3]: [1.2153543, -0.0042913, 1.5]
};

const CARDS_SHOW_SIT_POSITION: {[key: number]: number[][]} = {
  [0]: [
    [-1.0248031495, 0.173267716, 1.1, 108.5],
    [-1, 0.1, 1.1, 108.5],
    [-0.9766929, 0.0284251, 1.1, 108.5],
  ],
  [1]: [
    [-0.47125984, -0.4409055, 1.1, 160.72],
    [-0.400787403, -0.46452755, 1.1, 160.72],
    [-0.33267716, -0.48854329, 1.1, 160.72]
  ],
  [2]: [
    [0.305511807, -0.48421258, 1.1, -158.44998168945312],
    [0.37637794, -0.45704723, 1.1, -158.44998168945312],
    [0.44685038, -0.42909447, 1.1, -158.44998168945312],
  ],
  [3]: [
    [0.93149605, 0.00909449, 1.1, 252.03],
    [0.95433068, 0.080354335, 1.1, 252.03],
    [0.9775590481, 0.15240158, 1.1, 252.03],
  ],
};

const BETS_BALANCE: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

const SITS_POSITIONS: {[key: number]: [number, number, number, number]} = {
  [0]: [-1.3, 0, 0.7, -60],
  [1]: [-0.4877952745, -0.7133464511, 0.7, -20],
  [2]: [0.480708, -0.721220, 0.7, 30],
  [3]: [1.2153543, -0.0042913, 0.7, 70]
};

const coordsTable: [Vector3Mp, number, string][] = [
  [new mp.Vector3(1143.338, 264.2453, -52.84094), -134.9999614, 'vw_prop_casino_3cardpoker_01'],
  [new mp.Vector3(1146.329, 261.2543, -52.84094), 44.9999372, 'vw_prop_casino_3cardpoker_01'],
  [new mp.Vector3(1133.74, 266.6947, -52.04094), -44.9999372, 'vw_prop_casino_3cardpoker_01b'],
  [new mp.Vector3(1148.74, 251.6947, -52.04094), -44.9999372, 'vw_prop_casino_3cardpoker_01b'],
];

const interpolationPipelines: Map<ObjectMp, any> = new Map();

const defaultOptions: any = {
  object: null,
  objectModel: '',
  bezier: [0.42, 0.13, 0.06, 0.89],
  onComplete: () => {}
};

const startCardAnimation = (pipeline: any, options: any = {}) => {
  options = {
    ...defaultOptions,
    ...options
  };

  const animatedCard = mp.objects.exists(options.object) ? options.object : mp.objects.new(mp.game.joaat(options.objectModel), helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(0, 0.55, -1)), {
    dimension: -1,
    rotation: new mp.Vector3(90, 0, 0)
  });

  let id = 0;

  for (const pipe of pipeline) {
    pipe.id = id;
    id++;
  }

  const currentAction = pipeline.shift();
  let prevPos = currentAction.from;

  if (typeof currentAction.from === 'function') {
    prevPos = currentAction.from();
  }

  let prevRot = currentAction.fromRotation;

  if (typeof currentAction.fromRotation === 'function') {
    prevRot = currentAction.fromRotation();
  }

  if (typeof currentAction.to === 'function') {
    currentAction.to = currentAction.to();
  }

  if (typeof currentAction.rotation === 'function') {
    currentAction.rotation = currentAction.rotation();
  }

  const bezier = bezierEasing(options.bezier[0], options.bezier[1], options.bezier[2], options.bezier[3]);

  interpolationPipelines.set(animatedCard, {
    pipeline,
    startTime: Date.now(),
    percentage: 0,
    percentageRotation: 0,
    prevPos,
    prevRot,
    percentageCompleted: false,
    percentageRotationCompleted: false,
    bezier,
    delayActive: false,
    currentAction,
    onComplete: options.onComplete
  });

  return animatedCard;
};

const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const suits = [
  {
    type: 'd',
    label: 'Бубны',
    name: 'diamonds',
    nameModel: 'dia'
  },
  {
    type: 'c',
    label: 'Трефы',
    name: 'clubs',
    nameModel: 'club'
  },
  {
    type: 'h',
    label: 'Черви',
    name: 'hearts',
    nameModel: 'hrt'
  },
  {
    type: 's',
    label: 'Пики',
    name: 'spades',
    nameModel: 'spd'
  }
];

const cardsArray = [];
const cardsModelArray = new Map();

const valuesMap: any = {
  '2': '02',
  '3': '03',
  '4': '04',
  '5': '05',
  '6': '06',
  '7': '07',
  '8': '08',
  '9': '09',
  'T': '10',
  'J': 'jack',
  'Q': 'queen',
  'K': 'king',
  'A': 'ace',
};

for (let i = 0; i < suits.length; i++) {
  for (let j = 0; j < values.length; j++) {
    cardsArray.push(`${values[j]}${suits[i].type}`);
    cardsModelArray.set(`${values[j]}${suits[i].type}`, `vw_prop_cas_card_${suits[i].nameModel}_${valuesMap[values[j]]}`);
    cardsModelArray.set(`${valuesMap[values[j]]}${suits[i].type}`, `vw_prop_cas_card_${suits[i].nameModel}_${valuesMap[values[j]]}`);
  }
}

const waitMs = [0, 100, 200];
const waitMsReverse = [200, 100, 0];

let timerSit: number = 0;

mp.events.add('casino.poker.client.stop', () => {
  thisInfo.isActive = false;

  clearTimeout(timerSit);

  for (let i = 0; i < 3; i++) {
    if (mp.objects.exists(thisInfo.dealerCards[i])) {
      thisInfo.dealerCards[i].destroy();
    }

    if (mp.objects.exists(thisInfo.playerCards[i])) {
      thisInfo.playerCards[i].destroy();
    }
  }

  user.playScenario("PROP_HUMAN_SEAT_BENCH", mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, mp.players.local.getHeading() - 90);
  setTimeout(() => {
    user.stopScenario();
    // setTimeout(() => {
    //   mp.players.local.setCoordsNoOffset(thisInfo.lastPosition.x, thisInfo.lastPosition.y, thisInfo.lastPosition.z, false, false, false);
    // }, 2000);
  }, 200);

  mp.players.local.setVisible(true, true);
  CamerasManager.setActiveCamera(camera, false);
  mp.game.ui.displayRadar(true);
  gui.browser.execute(`CEF.casino.hide();`);
});

const CURRENT_STATE_NAMES = ['Ожидание игроков', 'Ожидаются ставки', 'Раздача карт', 'Раздача карт', 'Ожидание поддержки первоначальной ставки', 'Вскрытие рук', 'Вскрытие рук']

mp.events.add('casino.poker.client.start', (currentSitIndex: number, tableIndex: number) => {
  thisInfo.isActive = true;

  thisInfo.isShowsCards = false;
  thisInfo.currentBetStatus = 0;
  thisInfo.currentSitIndex = currentSitIndex;
  thisInfo.currentTableIndex = tableIndex;
  thisInfo.currentTableHeading = coordsTable[tableIndex][1];
  thisInfo.currentTablePosition = coordsTable[tableIndex][0];
  thisInfo.currentTableModel = coordsTable[tableIndex][2];

  const cameraPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
    CAMERAS_SIT_POSITIONS[thisInfo.currentSitIndex][0],
    CAMERAS_SIT_POSITIONS[thisInfo.currentSitIndex][1],
    CAMERAS_SIT_POSITIONS[thisInfo.currentSitIndex][2]
  ));

  const cameraPointPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
    CARDS_POSITIONS[thisInfo.currentSitIndex][0][0],
    CARDS_POSITIONS[thisInfo.currentSitIndex][0][1],
    CARDS_POSITIONS[thisInfo.currentSitIndex][0][2]
  ));

  thisInfo.mainCameraPosition = cameraPosition;
  thisInfo.mainCameraPointPosition = cameraPointPosition;

  thisInfo.dealerCameraPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
    CARDS_POSITIONS.dealer[1][0],
    CARDS_POSITIONS.dealer[1][1] - 0.1,
    1.4
  ));

  thisInfo.dealerCameraPointPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
    CARDS_POSITIONS.dealer[1][0],
    CARDS_POSITIONS.dealer[1][1],
    0.9479
  ));

  camera.setCoord(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.pointAtCoord(cameraPointPosition.x, cameraPointPosition.y, cameraPointPosition.z);

  const sitPosition = helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
    SITS_POSITIONS[currentSitIndex][0],
    SITS_POSITIONS[currentSitIndex][1],
    SITS_POSITIONS[currentSitIndex][2]
  ));

  const obj = mp.game.object.getClosestObjectOfType(
    thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z,
    2.0,
    mp.game.joaat(thisInfo.currentTableModel),
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

  thisInfo.lastPosition = mp.players.local.position;

  user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, (thisInfo.currentTableHeading + SITS_POSITIONS[currentSitIndex][3]) - 90, false);

  timerSit = setTimeout(() => {
    user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, thisInfo.currentTableHeading + SITS_POSITIONS[currentSitIndex][3]);

    mp.players.local.setVisible(false, false);
    CamerasManager.setActiveCamera(camera, true);
    mp.game.ui.displayRadar(false);

    gui.browser.execute(`CEF.casino.show('poker', {
      currentState: '${CURRENT_STATE_NAMES[thisInfo.currentState]}',
      maxBet: 5000,
      minBet: 10,
      betActive: ${thisInfo.currentBetStatus < 2 && (thisInfo.currentState === 0 || thisInfo.currentState === 1)},
      currentBet: '${thisInfo.currentBetStatus === 0 ? 'Начальная ставка' : thisInfo.currentBetStatus === 1 ? 'Ставка "ПАРА ПЛЮС"' : ''}'
    });`);

    gui.browser.execute(`CEF.casino.changeBetValue(${BETS_BALANCE[thisInfo.betBalance]});`);
  }, 4000);
});

const updateInterfaceInfo = () => {
  gui.browser.execute(`CEF.casino.updateAdditionalData({
    currentState: '${CURRENT_STATE_NAMES[thisInfo.currentState]}',
    betActive: ${thisInfo.currentBetStatus < 2 && (thisInfo.currentState === 0 || thisInfo.currentState === 1)},
    applyActive: ${thisInfo.currentBetStatus < 3 && thisInfo.currentState === 4 && (typeof thisInfo.firstBet === 'undefined' ? -1 : thisInfo.firstBet) !== -1},
    currentBet: '${(thisInfo.currentState !== 0 && thisInfo.currentState !== 1) ? '' : thisInfo.currentBetStatus === 0 ? 'Начальная ставка' : thisInfo.currentBetStatus === 1 ? 'Ставка "ПАРА ПЛЮС"' : ''}'
  });`);

  gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentState === 4 && (typeof thisInfo.firstBet === 'undefined' ? -1 : thisInfo.firstBet) !== -1 ? BETS_BALANCE[thisInfo.firstBet] : BETS_BALANCE[thisInfo.betBalance]});`);
};

const safeGetPositionPlayerCard = (index: number) => {
  if (mp.objects.exists(thisInfo.playerCards[index])) {
    return thisInfo.playerCards[index].getCoords(true);
  } else {
    return new mp.Vector3(0, 0, 0);
  }
};

const safeGetQuaternionPlayerCard = (index: number) => {
  if (mp.objects.exists(thisInfo.playerCards[index])) {
    return new Quaternion(thisInfo.playerCards[index].getQuaternion(0, 0, 0, 0));
  } else {
    return new mp.Vector3(0, 0, 0);
  }
};

const safeGetPositionDealerCard = (index: number) => {
  if (mp.objects.exists(thisInfo.dealerCards[index])) {
    return thisInfo.dealerCards[index].getCoords(true);
  } else {
    return new mp.Vector3(0, 0, 0);
  }
};

const safeGetQuaternionDealerCard = (index: number) => {
  if (mp.objects.exists(thisInfo.dealerCards[index])) {
    return new Quaternion(thisInfo.dealerCards[index].getQuaternion(0, 0, 0, 0));
  } else {
    return new mp.Vector3(0, 0, 0);
  }
};

mp.events.add('casino.poker.client.changeTableState', (state: number, data: any) => {
  thisInfo.currentState = state;

  if (state === 0) {
    const [spawnCoordsFrom, spawnCoordsTo]: [[number, number, number], [number, number, number]] = CARDS_POSITIONS.spawn;
    for (let i = 0; i < 3; i++) {
      if (mp.objects.exists(thisInfo.dealerCards[i])) {
        startCardAnimation([
          {
            delay: i * 100,
            from: () => safeGetPositionPlayerCard(i),
            to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsTo),
            duration: 500,
            fromRotation: () => safeGetQuaternionDealerCard(i),
            rotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading))
          },
          {
            to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsFrom),
            duration: 500
          }
        ], {
          object: thisInfo.dealerCards[i],
          onComplete() {
            if (mp.objects.exists(thisInfo.dealerCards[i])) {
              thisInfo.dealerCards[i].destroy()
            }
          }
        });
      }

      if (mp.objects.exists(thisInfo.playerCards[i])) {
        startCardAnimation([
          {
            delay: i * 100,
            from: () => safeGetPositionPlayerCard(i),
            to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsTo),
            duration: 500,
            fromRotation: () => safeGetQuaternionPlayerCard(i),
            rotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading))
          },
          {
            to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsFrom),
            duration: 500
          }
        ], {
          object: thisInfo.playerCards[i],
          onComplete() {
            if (mp.objects.exists(thisInfo.playerCards[i])) {
              thisInfo.playerCards[i].destroy()
            }
          }
        });
      }
    }

    thisInfo.firstBet = -1;
    thisInfo.secondBet = -1;

    thisInfo.currentBetStatus = 0;
    thisInfo.isShowsCards = false;
  } else if (state === 1) {
    thisInfo.endBetTime = Date.now() + 30000;
  } else if (state === 2) {
    thisInfo.endBetTime = null;
    gui.browser.execute(`CEF.casino.updateAdditionalData({
      endBetTime: '0'
    });`);

    for (let i = 0; i < 3; i++) {
      const [spawnCoordsFrom, spawnCoordsTo]: [[number, number, number], [number, number, number]] = CARDS_POSITIONS.spawn;

      if (mp.objects.exists(thisInfo.dealerCards[i])) {
        thisInfo.dealerCards[i].destroy();
      }

      if (mp.objects.exists(thisInfo.playerCards[i])) {
        thisInfo.playerCards[i].destroy();
      }

      thisInfo.dealerCards[i] = startCardAnimation([
        {
          delay: i * 100,
          from: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsFrom),
          to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsTo),
          duration: 1000,
          fromRotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading)),
          rotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading)),
        },
        {
          to: helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
            CARDS_POSITIONS.dealer[i][0],
            CARDS_POSITIONS.dealer[i][1],
            0.9479
          )),
          duration: 750,
          rotationDuration: 650,
          rotation: Quaternion.fromEuler(new mp.Vector3(-180, 0, CARDS_POSITIONS.dealer[i][2] + thisInfo.currentTableHeading))
        }
      ], {
        objectModel: cardsModelArray.get(data[i])
      });
    }
  } else if (state === 3) {
    if (!data) {
      return;
    }

    for (let i = 0; i < 3; i++) {
      const [spawnCoordsFrom, spawnCoordsTo]: [[number, number, number], [number, number, number]] = CARDS_POSITIONS.spawn;
      thisInfo.playerCards[i] = startCardAnimation([
        {
          delay: i * 100,
          from: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsFrom),
          to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, ...spawnCoordsTo),
          duration: 1000,
          fromRotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading)),
          rotation: Quaternion.fromEuler(new mp.Vector3(-90, 0, thisInfo.currentTableHeading)),
        },
        {
          to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, CARDS_POSITIONS[thisInfo.currentSitIndex][i][0], CARDS_POSITIONS[thisInfo.currentSitIndex][i][1], CARDS_POSITIONS[thisInfo.currentSitIndex][i][2]),
          duration: 750,
          rotationDuration: 650,
          rotation: Quaternion.fromEuler(new mp.Vector3(0, 180, CARDS_POSITIONS[thisInfo.currentSitIndex][i][3] + thisInfo.currentTableHeading))
        }
      ], {
        objectModel: cardsModelArray.get(data[i])
      });
    }
  } else if (state === 4) {
    thisInfo.endBetTime = Date.now() + 10000;
  } else if (state === 5) {
    thisInfo.endBetTime = null;

    gui.browser.execute(`CEF.casino.updateAdditionalData({
      endBetTime: '0'
    });`);

    for (let i = 0; i < 3; i++) {
      const pipeline = [];

      if (thisInfo.isShowsCards) {
        pipeline.push({
          delay: waitMsReverse[i],
          from: safeGetPositionPlayerCard(i),
          to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, CARDS_POSITIONS[thisInfo.currentSitIndex][i][0], CARDS_POSITIONS[thisInfo.currentSitIndex][i][1], CARDS_POSITIONS[thisInfo.currentSitIndex][i][2]),
          duration: 150,
          fromRotation: () => safeGetQuaternionPlayerCard(i),
          rotation: () => Quaternion.fromEuler(new mp.Vector3(0, 0, helpers.normalizeAngle(CARDS_POSITIONS[thisInfo.currentSitIndex][i][3] + thisInfo.currentTableHeading)))
        });
      } else {
        pipeline.push({
          delay: waitMsReverse[i],
          from: safeGetPositionPlayerCard(i),
          to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, CARDS_POSITIONS[thisInfo.currentSitIndex][i][0], CARDS_POSITIONS[thisInfo.currentSitIndex][i][1], 0.96 + (i * 0.01)),
          duration: 150
        });

        pipeline.push({
          delay: waitMsReverse[i],
          duration: 300,
          fromRotation: () => safeGetQuaternionPlayerCard(i),
          rotation: () => Quaternion.fromEuler(new mp.Vector3(0, 0, helpers.normalizeAngle(CARDS_POSITIONS[thisInfo.currentSitIndex][i][3] + thisInfo.currentTableHeading)))
        });

        pipeline.push(
          {
            delay: i * 300,
            duration: 150,
            from: () => safeGetPositionPlayerCard(i),
            to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, CARDS_POSITIONS[thisInfo.currentSitIndex][i][0], CARDS_POSITIONS[thisInfo.currentSitIndex][i][1], CARDS_POSITIONS[thisInfo.currentSitIndex][i][2])
          });
      }

      startCardAnimation(pipeline, {
        object: thisInfo.playerCards[i]
      });

      startCardAnimation([
        {
          delay: waitMsReverse[i],
          from: safeGetPositionDealerCard(i),
          to: helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
            CARDS_POSITIONS.dealer[i][0],
            CARDS_POSITIONS.dealer[i][1],
            0.97
          )),
          duration: 150
        },
        {
          delay: waitMsReverse[i],
          duration: 300,
          fromRotation: () => safeGetQuaternionDealerCard(i),
          rotation: () => Quaternion.fromEuler(new mp.Vector3(0, 0, CARDS_POSITIONS.dealer[i][2] + thisInfo.currentTableHeading))
        },
        {
          delay: i * 300,
          duration: 150,
          from: () => safeGetPositionDealerCard(i),
          to: helpers.getObjectOffsetFromCoords(thisInfo.currentTablePosition, thisInfo.currentTableHeading, new mp.Vector3(
            CARDS_POSITIONS.dealer[i][0],
            CARDS_POSITIONS.dealer[i][1],
            0.9479
          ))
        }
      ], {
        object: thisInfo.dealerCards[i]
      });
    }
  } else if (state === 6) {

  }

  updateInterfaceInfo();
});

const cancelBet = () => {
  if (!thisInfo.isActive) {
    return;
  }

  mp.events.callRemote('casino.poker.server.setBet', -1);
};

mp.keys.bind(0x20, false, cancelBet);

const decreaseBetBalance = () => {
  if (!thisInfo.isActive || (thisInfo.currentState !== 0 && thisInfo.currentState !== 1) || thisInfo.currentBetStatus >= 2) {
    return;
  }

  if (thisInfo.betBalance - 1 <= 0) {
    thisInfo.betBalance = 0;
  } else {
    thisInfo.betBalance -= 1;
  }

  updateInterfaceInfo();
};

mp.keys.bind(0x25, true, decreaseBetBalance);

const incrementBetBalance = () => {
  if (!thisInfo.isActive || (thisInfo.currentState !== 0 && thisInfo.currentState !== 1) || thisInfo.currentBetStatus >= 2) {
    return;
  }

  if (thisInfo.betBalance + 1 >= BETS_BALANCE.length - 1) {
    thisInfo.betBalance = BETS_BALANCE.length - 1;
  } else {
    thisInfo.betBalance += 1;
  }

  updateInterfaceInfo();
};

mp.keys.bind(0x27, true, incrementBetBalance);

const showMyCards = () => {
  if (!thisInfo.isActive || thisInfo.currentState !== 4 || thisInfo.isShowsCards) {
    return;
  }

  thisInfo.isShowsCards = true;

  const cardsPositions = CARDS_SHOW_SIT_POSITION[thisInfo.currentSitIndex];

  for (let i = 0; i < 3; i++) {
    startCardAnimation([
      {
        delay: waitMsReverse[i],
        from: safeGetPositionPlayerCard(i),
        to: mp.game.object.getObjectOffsetFromCoords(thisInfo.currentTablePosition.x, thisInfo.currentTablePosition.y, thisInfo.currentTablePosition.z, thisInfo.currentTableHeading, cardsPositions[i][0], cardsPositions[i][1], cardsPositions[i][2]),
        duration: 500,
        fromRotation: () => safeGetQuaternionPlayerCard(i),
        rotation: Quaternion.fromEuler(new mp.Vector3(-45, 0, helpers.normalizeAngle(cardsPositions[2][3] + thisInfo.currentTableHeading)))
      }
    ], {
      object: thisInfo.playerCards[i]
    });
  }
};

mp.keys.bind(0x22, true, showMyCards);

const showDealerCards = () => {
  if (!thisInfo.isActive) {
    return;
  }

  camera.setCoord(thisInfo.dealerCameraPosition.x, thisInfo.dealerCameraPosition.y, thisInfo.dealerCameraPosition.z);
  camera.pointAtCoord(thisInfo.dealerCameraPointPosition.x, thisInfo.dealerCameraPointPosition.y, thisInfo.dealerCameraPointPosition.z);
};

mp.keys.bind(0x21, true, showDealerCards);

const hideDealerCards = () => {
  if (!thisInfo.isActive) {
    return;
  }

  camera.setCoord(thisInfo.mainCameraPosition.x, thisInfo.mainCameraPosition.y, thisInfo.mainCameraPosition.z);
  camera.pointAtCoord(thisInfo.mainCameraPointPosition.x, thisInfo.mainCameraPointPosition.y, thisInfo.mainCameraPointPosition.z);
};

mp.keys.bind(0x21, false, hideDealerCards);

mp.events.add('casino.poker.client.setBet.response', (status, balance) => {
  if (status) {
    if (thisInfo.currentBetStatus === 0) {
      thisInfo.firstBet = balance;
    } else if (thisInfo.currentBetStatus === 1) {
      thisInfo.secondBet = balance;
    }
    thisInfo.currentBetStatus++;
    thisInfo.betBalance = 0;
  }

  updateInterfaceInfo();

  thisInfo.awaitSetBet = false;
});

const sendBetRequest = () => {
  if (!thisInfo.isActive) {
    return;
  }

  if (thisInfo.awaitSetBet) {
    return;
  }

  if (
    (thisInfo.currentState === 1 && thisInfo.currentBetStatus >= 2) ||
    (thisInfo.currentState === 4 && thisInfo.currentBetStatus >= 3) ||
    thisInfo.currentState === 2 ||
    thisInfo.currentState === 3 ||
    thisInfo.currentState === 5 ||
    thisInfo.currentState === 6
  ) {
    return;
  }

  thisInfo.awaitSetBet = true;

  mp.events.callRemote('casino.poker.server.setBet', thisInfo.betBalance);
};

mp.keys.bind(0x0D, true, sendBetRequest);

mp.events.add('casino.client.interfaceAction', (action: string, ...data: any) => {
  if (thisInfo.isActive) {
    if (action === 'changeDirection') {
      const [direction]: [number] = data;

      if (direction === -1) {
        decreaseBetBalance();
      } else {
        incrementBetBalance();
      }
    } else if (action === 'clickButton') {
      const [buttonName]: [string] = data;

      if (buttonName === 'setBet') {
        sendBetRequest();
      } else if (buttonName === 'cancelBet') {
        cancelBet();
      } else if (buttonName === 'applyBet') {
        sendBetRequest();
      } else if (buttonName === 'showMyCards') {
        showMyCards();
      } else if (buttonName === 'dealerCardsHide') {
        hideDealerCards();
      } else if (buttonName === 'dealerCardsShow') {
        showDealerCards();
      }
    }
  }
});

mp.events.add('render', () => {
  if (!inCasino) return;
  
  if (thisInfo.isActive) {
    mp.game.controls.disableAllControlActions(0);

    let endBetSeconds = 0;

    if (thisInfo.endBetTime) {
      endBetSeconds = Math.floor((thisInfo.endBetTime - Date.now()) / 1000);
    } else {
      thisInfo.lastEndTimeSecconds = 0;
    }

    if (thisInfo.lastEndTimeSecconds !== endBetSeconds) {
      if (endBetSeconds >= 0) {
        gui.browser.execute(`CEF.casino.updateAdditionalData({
          endBetTime: '${endBetSeconds.toString().padStart(2, '0')}'
        });`);
      }

      thisInfo.lastEndTimeSecconds = endBetSeconds;
    }
  }

  for (const [object, objectInfo] of interpolationPipelines) {
    if (!mp.objects.exists(object)) {
      interpolationPipelines.delete(object);
      return;
    }

    if (!objectInfo.delayActive && objectInfo.currentAction.delay !== 0 && typeof objectInfo.currentAction.delay === 'number') {
      objectInfo.delayActive = true;
    }

    if (objectInfo.delayActive) {
      if ((Date.now() - objectInfo.startTime) >= objectInfo.currentAction.delay) {
        objectInfo.startTime = Date.now();
        objectInfo.currentAction.delay = 0;
        objectInfo.delayActive = false;
      }

      continue;
    }

    objectInfo.percentage = (Date.now() - objectInfo.startTime) / objectInfo.currentAction.duration;
    objectInfo.percentageRotation = (Date.now() - objectInfo.startTime) / (objectInfo.currentAction.rotationDuration || objectInfo.currentAction.duration);

    if (objectInfo.percentage > 1) {
      objectInfo.percentageCompleted = true;
      objectInfo.percentage = 1;
    }

    if (objectInfo.percentageRotation > 1) {
      objectInfo.percentageRotationCompleted = true;
      objectInfo.percentageRotation = 1;
    }

    if (objectInfo.prevPos && objectInfo.currentAction.to && !objectInfo.currentAction.disablePosition) {
      const coords = helpers.lerpVector3(objectInfo.prevPos, objectInfo.currentAction.to, objectInfo.bezier(objectInfo.percentage));
      object.setCoordsNoOffset(coords.x, coords.y, coords.z, false, false, false);
    }

    if ((objectInfo.prevRot && objectInfo.currentAction.rotation) && !objectInfo.currentAction.disableRotation) {
      if (objectInfo.prevRot instanceof Quaternion && objectInfo.currentAction.rotation instanceof Quaternion) {
        const quat = objectInfo.prevRot.slerp(objectInfo.currentAction.rotation, objectInfo.bezier(objectInfo.percentageRotation));

        object.setQuaternion(quat.x, quat.y, quat.z, quat.w);
      } else {
        const rot = helpers.lerpVector3(objectInfo.prevRot, objectInfo.currentAction.rotation, objectInfo.bezier(objectInfo.percentageRotation));
        object.setRotation(rot.x, rot.y, rot.z, 2, false);
      }
    }

    if (objectInfo.percentageCompleted && objectInfo.percentageRotationCompleted) {
      const nextAction = objectInfo.pipeline.shift();

      if (typeof nextAction === 'undefined') {
        interpolationPipelines.delete(object);
        if (typeof objectInfo.currentAction.onComplete === 'function') {
          objectInfo.currentAction.onComplete();
        }

        objectInfo.onComplete();
      } else {
        if (typeof objectInfo.currentAction.onComplete === 'function') {
          objectInfo.currentAction.onComplete();
        }

        objectInfo.percentage = 0;
        objectInfo.percentageRotation = 0;
        objectInfo.percentageCompleted = false;
        objectInfo.percentageRotationCompleted = false;
        objectInfo.startTime = Date.now();
        const lastAction = objectInfo.currentAction;
        objectInfo.currentAction = nextAction;

        if (typeof lastAction.from === 'function') {
          lastAction.from = lastAction.from();
        }

        if (typeof lastAction.to === 'function') {
          lastAction.to = lastAction.rotation();
        }

        if (typeof nextAction.from === 'function') {
          nextAction.from = nextAction.from();
        }

        if (typeof nextAction.to === 'function') {
          nextAction.to = nextAction.to();
        }

        objectInfo.prevPos = nextAction.from || lastAction.to;

        if (typeof lastAction.fromRotation === 'function') {
          lastAction.fromRotation = lastAction.fromRotation();
        }

        if (typeof lastAction.rotation === 'function') {
          lastAction.rotation = lastAction.rotation();
        }

        if (typeof nextAction.fromRotation === 'function') {
          nextAction.fromRotation = nextAction.fromRotation();
        }

        if (typeof nextAction.rotation === 'function') {
          nextAction.rotation = nextAction.rotation();
        }

        objectInfo.prevRot = nextAction.fromRotation || lastAction.rotation;

        objectInfo.delayActive = false;

        if (objectInfo.currentAction.delay !== 0 && typeof objectInfo.currentAction.delay === 'number') {
          objectInfo.delayActive = true;
          continue;
        }
      }
    }
  }
});
