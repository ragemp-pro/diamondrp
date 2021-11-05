import CamerasManager from '../../managers/cameraManager';
const camera = CamerasManager.hasCamera('casino') ? CamerasManager.getCamera('casino') : CamerasManager.createCamera('casino', 'default', new mp.Vector3(0, 0, 0), new mp.Vector3(-90, 0, 0), 50);

import {slotMachinesMeta, typesMeta} from './slotMachineData';
import {gui}  from '../gui';
import { user } from '../../user';
import { inCasino } from '../casino_roulette';

const STEP = 22.5;

interface ThisInfoInterface {
  isActive: boolean;
  currentBet: number;
  currentState: number;
  currentChips: number;
  spinRotation: number;
  currentSlotMachineId?: number;
  currentSlotMachineMeta?: SlotMachinesMetaInterface;
  currentSlotMachineLocalMeta?: SlotMachinesMetaTypeInterface;
  cameraPosition?: Vector3Mp;
  cameraPoint?: Vector3Mp;
  waitSpinResponse: boolean;
  reels: ReelsObjectInterface[];
}

interface ReelsObjectInterface extends ObjectMp {
  heading: number;
  active: boolean;
  activeWin: boolean;
  winNumber: number;
}

const thisInfo: ThisInfoInterface = {
  isActive: false,
  currentBet: 1,
  currentState: 0,
  currentChips: 0,
  spinRotation: 0,

  waitSpinResponse: false,
  reels: []
};


const createReels = (meta: SlotMachinesMetaInterface, metaLocal: SlotMachinesMetaTypeInterface, offset: Vector3Mp): ReelsObjectInterface => {
  const reels: ReelsObjectInterface = mp.objects.new(mp.game.joaat(`${metaLocal.model}_reels`), mp.game.object.getObjectOffsetFromCoords(meta.position.x, meta.position.y, meta.position.z, meta.heading, offset.x, offset.y, offset.z), {
    dimension: -1
  }) as ReelsObjectInterface;

  reels.freezePosition(true);
  reels.setCollision(false, false);
  reels.setRotation(0, 0, meta.heading, 2, true);

  reels.heading = meta.heading;
  reels.active = false;
  reels.activeWin = false;
  reels.winNumber = -1;

  return reels;
};

let timerSit: number = 0;

mp.events.add('casino.slots.client.start', (slotMachineId, chipsBalance) => {
  const slotMachineMeta = slotMachinesMeta[slotMachineId];

  thisInfo.currentSlotMachineId = slotMachineId;
  thisInfo.currentSlotMachineMeta = slotMachineMeta;
  thisInfo.currentSlotMachineLocalMeta = typesMeta[slotMachineMeta.type];

  thisInfo.currentChips = chipsBalance;

  thisInfo.reels[0] = createReels(slotMachineMeta, thisInfo.currentSlotMachineLocalMeta, new mp.Vector3(-0.115, 0.047, 1.1));
  thisInfo.reels[1] = createReels(slotMachineMeta, thisInfo.currentSlotMachineLocalMeta, new mp.Vector3(0.005, 0.047, 1.1));
  thisInfo.reels[2] = createReels(slotMachineMeta, thisInfo.currentSlotMachineLocalMeta, new mp.Vector3(0.125, 0.047, 1.1));

  thisInfo.waitSpinResponse = false;
  thisInfo.currentState = 0;
  thisInfo.currentBet = 1;

  thisInfo.spinRotation = 0;

  thisInfo.cameraPosition = mp.game.object.getObjectOffsetFromCoords(slotMachineMeta.position.x, slotMachineMeta.position.y, slotMachineMeta.position.z, slotMachineMeta.heading, 0, -1, 1.5);
  thisInfo.cameraPoint = mp.game.object.getObjectOffsetFromCoords(slotMachineMeta.position.x, slotMachineMeta.position.y, slotMachineMeta.position.z, slotMachineMeta.heading, 0, 0, 1.2);

  camera.setCoord(thisInfo.cameraPosition.x, thisInfo.cameraPosition.y, thisInfo.cameraPosition.z);
  camera.pointAtCoord(thisInfo.cameraPoint.x, thisInfo.cameraPoint.y, thisInfo.cameraPoint.z);

  const sitPosition = mp.game.object.getObjectOffsetFromCoords(slotMachineMeta.position.x, slotMachineMeta.position.y, slotMachineMeta.position.z, slotMachineMeta.heading, 0, -0.8, 0.7);
  
  user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, slotMachineMeta.heading - 90, false);
  
  // /tp 1105.29, 225.53, -49.17
  mp.game.ui.displayRadar(false);
  thisInfo.isActive = true;

  timerSit = setTimeout(() => {
    user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition.x, sitPosition.y, sitPosition.z, slotMachineMeta.heading);

    CamerasManager.setActiveCamera(camera, true);
    mp.players.local.setVisible(false, true);
    gui.browser.execute(`CEF.casino.show('slots', {minBet: ${thisInfo.currentSlotMachineLocalMeta.bet}, maxBet: ${thisInfo.currentSlotMachineLocalMeta.bet * 5}});`);
    gui.browser.execute(`CEF.casino.changeBetValue(${thisInfo.currentSlotMachineLocalMeta.bet});`);
  }, 4000)
});

mp.events.add('casino.slots.client.stop', () => {
  thisInfo.isActive = false;

  clearTimeout(timerSit);

  for (let i = 0; i < thisInfo.reels.length; i++) {
    const reels = thisInfo.reels[i];

    if (reels && mp.objects.exists(reels)) {
      reels.destroy();
    }
  }
  const sitPosition = mp.game.object.getObjectOffsetFromCoords(
    thisInfo.currentSlotMachineMeta.position.x,
    thisInfo.currentSlotMachineMeta.position.y,
    thisInfo.currentSlotMachineMeta.position.z,
    thisInfo.currentSlotMachineMeta.heading,
    0.5, -0.9, 0.7
  );

  const sitPosition2 = mp.game.object.getObjectOffsetFromCoords(thisInfo.currentSlotMachineMeta.position.x, thisInfo.currentSlotMachineMeta.position.y, thisInfo.currentSlotMachineMeta.position.z, thisInfo.currentSlotMachineMeta.heading, 0, -0.8, 0.7);
  user.playScenario("PROP_HUMAN_SEAT_BENCH", sitPosition2.x, sitPosition2.y, sitPosition2.z, thisInfo.currentSlotMachineMeta.heading - 90);

  setTimeout(() => {
    user.stopScenario();

    setTimeout(() => {
      mp.players.local.setCoordsNoOffset(sitPosition.x, sitPosition.y, sitPosition.z, false, false, false);
      mp.players.local.setHeading(thisInfo.currentSlotMachineMeta.heading - 90)
    }, 2000);
  }, 200);
  
  // mp.players.local.setCoordsNoOffset(sitPosition.x, sitPosition.y, sitPosition.z, false, false, false);

  mp.game.ui.displayRadar(true);
  CamerasManager.setActiveCamera(camera, false);
  mp.players.local.setVisible(true, true);

  gui.browser.execute(`CEF.casino.hide();`);
});

const changeBet = (direction: number) => {
  if (!thisInfo.isActive) {
    return false;
  }

  let nextBet = thisInfo.currentBet + direction;

  if (nextBet > 5) {
    nextBet = 1;
  } else if (nextBet <= 0) {
    nextBet = 5;
  }

  thisInfo.currentBet = nextBet;
  gui.browser.execute(`CEF.casino.changeBetValue(${nextBet * thisInfo.currentSlotMachineLocalMeta.bet});`);
};

mp.events.add('casino.client.interfaceAction', (action: string, ...data: any) => {
  if (thisInfo.isActive) {
    if (action === 'changeDirection') {
      const [direction]: [number] = data;

      changeBet(direction);
    } else if (action === 'clickButton') {
      const [type]: [string] = data;
      if (type === 'spin') {
        spinRequest();
      }
    }
  }
});

mp.keys.bind(0x27, true, () => {
  changeBet(1);
});

mp.keys.bind(0x25, true, () => {
  changeBet(-1);
});

mp.events.add('casino.slots.client.responseWin', (winBalance, chipsBalance) => {
  thisInfo.currentChips = chipsBalance;

  mp.game.ui.notifications.show(`~g~Ты выиграл ${winBalance}`);
});

mp.events.add('casino.slots.client.spin.response', (success: boolean, winNumbers: string, chipsBalance: number) => {
  if (!thisInfo.waitSpinResponse) {
    return;
  }

  thisInfo.currentChips = chipsBalance;

  if (success) {
    for (let i = 0; i < thisInfo.reels.length; i++) {
      thisInfo.reels[i].winNumber = -1;
      thisInfo.reels[i].active = true;
    }

    const [first, second, three] = winNumbers.split('-').map((winNumber: string): number => parseInt(winNumber));

    setTimeout(() => {
      thisInfo.reels[0].winNumber = first;
      thisInfo.reels[0].activeWin = true;
      thisInfo.currentState = 2;

      setTimeout(() => {
        thisInfo.reels[1].winNumber = second;
        thisInfo.reels[1].activeWin = true;

        thisInfo.currentState = 3;
      }, 1000);

      setTimeout(() => {
        thisInfo.reels[2].winNumber = three;
        thisInfo.reels[2].activeWin = true;

        thisInfo.currentState = 0;
      }, 2000);
    }, 3000);

    thisInfo.currentState = 1;

    thisInfo.waitSpinResponse = false;
    return;
  } else {
    mp.game.ui.notifications.show('~r~Недостаточно средств');
  }

  thisInfo.currentState = 0;
  thisInfo.waitSpinResponse = false;
});

const spinRequest = () => {
  if (!thisInfo.isActive || thisInfo.waitSpinResponse || thisInfo.currentState !== 0) {
    return false;
  }

  thisInfo.waitSpinResponse = true;

  mp.events.callRemote('casino.slots.server.spin.request', thisInfo.currentBet);
}

mp.keys.bind(0x20, false, spinRequest);

mp.events.add('render', () => {
  if (!inCasino) return;
  if (!thisInfo.isActive) {
    return;
  }

  thisInfo.spinRotation += 10;

  for (let i = 0; i < thisInfo.reels.length; i++) {
    const reels = thisInfo.reels[i];

    if (reels && mp.objects.exists(reels) && reels.active) {
      reels.setRotation(thisInfo.spinRotation, 0, reels.heading, 2, true);

      if (typeof reels.winNumber === 'number' && reels.winNumber !== -1 && reels.activeWin) {
        const winRotation = reels.winNumber * STEP;
        const reelsRotation = reels.getRotation(1);

        if (reelsRotation.x >= winRotation) {
          reels.active = false;
          reels.setRotation(winRotation, 0, reels.heading, 2, true);
        }
      }
    }
  }

  // const currentType = thisInfo.currentSlotMachineMeta.type;
  // const currentMeta = typesMeta[currentType];

  // mp.game.graphics.drawText(`Минимальная ставка: ${currentMeta.bet}`, [0.5, 0.1], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
  //
  // mp.game.graphics.drawText(`Максимальная ставка: ${currentMeta.bet * 5}`, [0.5, 0.13], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
  //
  // mp.game.graphics.drawText(`Текущая ставка: ${currentMeta.bet * thisInfo.currentBet}`, [0.5, 0.16], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });
  //
  // mp.game.graphics.drawText(`Текущий баланс фишек: ${thisInfo.currentChips}`, [0.5, 0.19], { font: 4, color: [255, 255, 255, 255], scale: [0, 0.4], outline: true, centre: true });

  mp.game.controls.disableAllControlActions(0);
});
