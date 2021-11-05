import { wait, getRandomInt, randomArrayEl, sleep } from '../../util/methods';
import { methods } from './methods';
const player = mp.players.local;


const TEST_VEHICLES: string[] = ["xa21", "asea", "krieger", "neon", "revolter", "chino", "nero", "pfister811",
	"t20", "f620", "felon", "packer", "issi2", "picador", "panto", "windsor", "zion2", "blade"];
const TEST_VEHICLES_POSITION = new mp.Vector3(-993.02, -3341.62, 10.94)
const TEST_LABEL_POSITION = new mp.Vector3(-993.02, -3341.62, 13.94)
const TEST_LABEL_COUNT = 50
const TEST_LABEL_TIME = 30
const TEST_VEHICLES_TIME = 30;


/**
Copyright 2019 Vincent Heins/TheMysteriousVincent

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
class FPSCalculator {
	private fps = 0;

	constructor() {
		let lastFrameCount = this.getFrameCount();
		setInterval(() => {
			this.fps = this.getFrameCount() - lastFrameCount;
			lastFrameCount = this.getFrameCount();
		}, 1000);
	}

	public get(): number {
		return this.fps;
	}

	private getFrameCount(): number {
		return mp.game.invoke('0xFC8202EFC642E6F2') as number; // '0xFC8202EFC642E6F2' is a method of GTA5 which returns the frame count since the game was started (see http://www.dev-c.com/nativedb/func/info/fc8202efc642e6f2 for ref.)
	}
}

export const FPS = new FPSCalculator();

let enabledTestMod = false
mp.events.add("server:test", (beta = false) => {
	if (enabledTestMod) return;
	enabledTestMod = true;
	if (!beta) require('_rage-console');
})

mp.events.add('playerCommand', (command) => {
	if (!enabledTestMod) return;
	if (command != "testfps") return;
	stressTest()
});


let startTest = false;

mp.events.add('render', () =>{
	if (!startTest) return;
	mp.game.controls.disableAllControlActions(0);
	mp.game.controls.disableAllControlActions(1);
})

setInterval(() => {
	if (!startTest) return;
	counedFPS.push(FPS.get())
}, 100)

let testLabels:TextLabelMp[] = []
let testVehicles:VehicleMp[] = []
let counedFPS:number[] = []

async function stressTest(){
	counedFPS = [];
	startTest = true;
	mp.gui.chat.push('Запускаем проверку FPS')
	await sleep(500)
	mp.game.cam.doScreenFadeOut(1000);
	await sleep(1000);
	player.position = new mp.Vector3(-940.45, -3372.32, 13.94);
	player.setHeading(53.87);
	mp.game.cam.setGameplayCamRelativeHeading(0);
	mp.game.cam.doScreenFadeIn(1000);
	await sleep(1000);
	setTimeout(async () => {
		let sssss = true;
		let c = 1;
		
		for (let id = 0; id < TEST_LABEL_COUNT; id++) {
			testLabels.push(mp.labels.new('1', new mp.Vector3(TEST_LABEL_POSITION.x, TEST_LABEL_POSITION.y, TEST_LABEL_POSITION.z + (id/100))))
			await sleep(200);
		}
		setTimeout(() => {
			sssss = false;
		}, TEST_LABEL_TIME * 1000)
		while (sssss){
			testLabels.map(item => {
				item.text = c.toString();
			})
			c++;
			await sleep(100);
		}
		testLabels.map(item => {
			item.destroy();
		})
		
	}, 100)
	
	for (let id = 0; id < TEST_VEHICLES.length; id++){
		testVehicles.push(mp.vehicles.new(mp.game.joaat(TEST_VEHICLES[id]), TEST_VEHICLES_POSITION))	
		await sleep(100);
	}
	setTimeout(async () => {
		let sssss = true;
		setTimeout(() => {
			sssss = false;
		}, TEST_LABEL_TIME * 1000)
		while (sssss) {
			testVehicles.map(veh => {
				veh.setEngineOn(veh.getIsEngineRunning(), true, true);
				veh.setCoords(TEST_VEHICLES_POSITION.x, TEST_VEHICLES_POSITION.y, TEST_VEHICLES_POSITION.z, false,true,true, false);
			})
			await sleep(100);
		}
		testVehicles.map(item => {
			item.destroy();
		})
	}, 100)
	await sleep(TEST_VEHICLES_TIME*1000*2+5000)
	mp.gui.chat.push('Тест окончен.');
	let resultBall = Math.floor(counedFPS.reduce(function (sum, current) {
		return sum + current;
	}, 0));
	let averageFPS = Math.floor(resultBall / counedFPS.length)
	let minFPS = Math.floor(counedFPS.reduce(function (min, current) {
		if (min == 0) return current;
		else if(min < current) return min;
		else return current;
	}, 0));
	let maxFPS = Math.floor(counedFPS.reduce(function (max, current) {
		if (max > current) return max;
		else return current;
	}, 0));
	mp.gui.chat.push(`Минимальный FPS: ${minFPS}, Максимальный FPS: ${maxFPS}, Средний FPS: ${averageFPS}, Бал оценки: ${resultBall}`)
	startTest = false;
}






let models = [
	'u_m_y_abner',
	'csb_abigail',
	'ig_abigail',
	'a_m_m_acult_01',
	'a_m_o_acult_01',
	'a_m_y_acult_01',
	'a_m_y_acult_01',
	'a_m_y_acult_02',
	'a_m_m_afriamer_01',
	,
	'ig_mp_agent14',
	'csb_mp_agent14',
	'csb_agent',
	's_f_y_airhostess_01',
	's_m_y_airworker',
	'u_m_m_aldinapoli',
	'ig_amandatownley',
	'cs_amandatownley',
	's_m_y_ammucity_01',
	's_m_m_ammucountry',
	'ig_andreas',
	'cs_andreas',
	'csb_anita',
	'u_m_y_antonb',
	'csb_anton',
	'g_m_m_armboss_01',
	'g_m_m_armgoon_01',
	'g_m_y_armgoon_02',
	'g_m_m_armlieut_01',
	'mp_s_m_armoured_01',
	's_m_m_armoured_01'
];

setTimeout(() => {
	mp.events.register('ping:test', () => {
		return true;
	});
	mp.events.register('pc:test', () => {
		return new Promise(async (resolve) => {
			counedFPS = [];
			startTest = true;
			let resData = {
				forMany: 0,
				loadModels: 0,
				spawnPeds: 0,
				npcJob: 0,
				resultBall: 0,
				averageFPS: 0,
				minFPS: 0,
				maxFPS: 0,
			};
			methods.debug('Start TEST');
			methods.debug('For timer');

			// For timer
			let start = new Date().getTime();
			let q = 0;
			for (let id = 0; id < 500000000; id++) q += id;
			let end = new Date().getTime();
			resData.forMany = end - start;
			// ########################
			methods.debug(resData.forMany);
			methods.debug('Request model timer');
			// Request model timer

			let steps = 3;

			try {
				start = new Date().getTime();
				for (let step = 0; step < steps; step++) {
					mp.gui.chat.push('Step '+step);
					for (let id in models) {
						let model = mp.game.gameplay.getHashKey(models[id]);
						if (mp.game.streaming.isModelValid(model)) {
							let cnt = 0;
							while (!mp.game.streaming.hasModelLoaded(model) && cnt < 300) {
								mp.game.streaming.requestModel(model);
								cnt++;
								await wait(1);
							}
							if (cnt < 3000) {
								mp.gui.chat.push('Model '+models[id]+ 'not valid');
							}
						} else {
							mp.gui.chat.push('Model '+models[id]+' not valids');
						}
					}
				}
				for (let step = 0; step < steps; step++) {
					for (let id in models) {
						let model = mp.game.gameplay.getHashKey(models[id]);
						mp.game.streaming.setModelAsNoLongerNeeded(model);
					}
				}
				end = new Date().getTime();
				resData.loadModels = end - start;
			} catch (error) {
				mp.gui.chat.push(error);
			}
			// ########################
			methods.debug(resData.loadModels);
			methods.debug("Spawn NPC's");
			//Spawn NPC's
			let pedsTest: PedMp[] = [];
			start = new Date().getTime();
			for (let id = 0; id < 50; id++) {
        try {
          let model = mp.game.gameplay.getHashKey(randomArrayEl(models));
          let cnt = 0;
          while (!mp.game.streaming.hasModelLoaded(model) && cnt < 300) {
            mp.game.streaming.requestModel(model);
            cnt++;
            await wait(1);
          }
          if(cnt < 300){
            let ped = mp.peds.new(model, new mp.Vector3(mp.players.local.position.x + getRandomInt(-10, 10), mp.players.local.position.y + getRandomInt(-10, 10), mp.players.local.position.z + 5), mp.players.local.heading, mp.players.local.dimension);
            mp.game.streaming.setModelAsNoLongerNeeded(model);
            await wait(50);
            ped.freezePosition(false);
            ped.setVisible(true, true);
            ped.setAlpha(255);
            mp.game.invoke(
              methods.TASK_GO_TO_ENTITY,
              ped.handle,
              mp.players.local.handle,
              -1,
              10.0,
              1073741824.0,
              0
            );
            mp.game.invoke(methods.SET_PED_KEEP_TASK, ped.handle, true);
            pedsTest.push(ped);
            await wait(50);
          }
        } catch (error) {
          mp.gui.chat.push(error)
        }
			}
			await wait(10000);
			end = new Date().getTime();
			resData.npcJob = end - start - 10000;
			methods.debug(resData.npcJob);
			pedsTest.forEach((ped) => {
				ped.destroy();
			});
			// ##########################
			resData.resultBall = Math.floor(counedFPS.reduce(function (sum, current) {
				return sum + current;
			}, 0));
			resData.averageFPS = Math.floor(resData.resultBall / counedFPS.length)
			resData.minFPS = Math.floor(counedFPS.reduce(function (min, current) {
				if (min == 0) return current;
				else if (min < current) return min;
				else return current;
			}, 0));
			resData.maxFPS = Math.floor(counedFPS.reduce(function (max, current) {
				if (max > current) return max;
				else return current;
			}, 0));
			resolve(resData);
			startTest = false;
		});
	});
}, 100);
