import { user } from "./user";
import { methods } from "./modules/methods";
import { voiceDistanceRange, voiceDistanceRangePlus } from "../util/voice";
import { ui } from "./modules/ui";
import { gui } from "./modules/gui";
import { pressFinger } from "./managers/fingerpoint";
export {}

let voiceVolume = 6.0;
let phoneVolume = 11.0;
let currentRadio = ""
// const player = mp.players.local;
const MaxRange = voiceDistanceRange;


/** Игроки, которые рядом, которых мы должны слышать */
let worldList: number[] = [];
/** Игрок, с которым мы говорим по телефону */
let phoneTarget: number;
/** Игроки, которые на одной частоте с нами */
let radioList: number[] = [];

let block = false;


export function restartVoice(){
    if (block) return mp.game.ui.notifications.show('~r~Нельзя так часто перезагружать голосовой чат');
    block = true;
    setTimeout(() => {
        block = false;
    }, 10000)
    mp.voiceChat.cleanupAndReload(true, true, true);
    mp.game.ui.notifications.show('~g~Голосовой чат перезапущен');
}

function removeWorldVoice(nplayer:PlayerMp|number, disconnect = true) {
    if(typeof nplayer == "number") nplayer = mp.players.atRemoteId(nplayer);
    if (!mp.players.exists(nplayer)) return;
    if(nplayer.remoteId == phoneTarget) return;
    if (radioList.indexOf(nplayer.remoteId) > -1) return;
    let idx = worldList.indexOf(nplayer.remoteId);
    if (idx !== -1)
        worldList.splice(idx, 1);
    if (!disconnect) return;
    mp.events.callSocket("worldVoiceRemove", nplayer);
    nplayer.isListening = false;
    nplayer.voiceVolume = 0.0;
    nplayer.voice3d = false;
}
let radioSpeakersq: string[] = [];
function voiceControllerTick(){
    radioSpeakersq = []
    voiceVolume = user.get('s_voice_vol') * 5
    phoneVolume = user.get('s_radio_vol') * 5
    currentRadio = mp.players.local.getVariable('radioVol')
    mp.players.forEach(nplayer => {
        /** Отключаем проверку на самомо себя */
        if (nplayer.id == mp.players.local.id) return;
        /** Проверяем, мб мы должны работать с телефонным звонком либо рацией */
        if (!phoneRadioController(nplayer)) {
            /** Если игрок не в зоне стрима - отключаем сходу */
            if (!nplayer.handle) {
                nplayer.voiceVolume = 0.0;
                nplayer.voice3d = false;
                return;
            }
            /** Определяем расстояние между игроками */
            const dist = methods.distanceToPos(mp.players.local.position, nplayer.position);
            /** Статус того, нужно ли нам разговаривать или нет */
            const needSpeak = (dist < MaxRange) && mp.players.local.dimension == nplayer.dimension
            // Отключаем голос если он подключён
            if (!needSpeak) {
                // Определяем надобность того, чтобы запросить отмену передачи голоса
                if (worldList.indexOf(nplayer.remoteId) > -1) {
                    removeWorldVoice(nplayer)
                }
                nplayer.voiceVolume = 0.0;
                nplayer.voice3d = false;
            } else {
                // Определяем надобность того, чтобы запросить передачу голоса
                if (worldList.indexOf(nplayer.remoteId) == -1) {
                    worldList.push(nplayer.remoteId);
                    mp.events.callSocket("worldVoiceAdd", nplayer);
                    nplayer.isListening = true;
                }
                //////////////////////////////////////////////////////////////
                ///////// Теперь определяем громкость передачи голоса ////////
                //////////////////////////////////////////////////////////////
                // Если оба в одном ТС
                if (nplayer.vehicle && nplayer.vehicle == mp.players.local.vehicle) {
                    nplayer.voiceVolume = voiceVolume;
                    nplayer.voice3d = false;
                    // Если цель в ТС, но не в открытом ТС
                } else if (nplayer.vehicle && !mp.game.vehicle.isThisModelABike(nplayer.vehicle.model) && !mp.game.vehicle.isThisModelABicycle(nplayer.vehicle.model) && !mp.game.vehicle.isThisModelAQuadbike(nplayer.vehicle.model) && !mp.game.vehicle.isThisModelABoat(nplayer.vehicle.model)) {
                    nplayer.voiceVolume = voiceVolume / 3;
                    nplayer.voice3d = true;
                } else {
                    // Если мы в ТС, но цель нет
                    if (mp.players.local.vehicle) {
                        nplayer.voiceVolume = voiceVolume / 3;
                        nplayer.voice3d = true;
                    } else {
                        // Мы оба не в ТС, начинаем цеплять расстояние и прочее
                        let endVolume = (mp.players.local.hasClearLosTo(nplayer.handle, 17) ? voiceVolume : voiceVolume / 4) - (voiceVolume / MaxRange) * (dist + 1.3)
                        if (endVolume > voiceVolume) endVolume = voiceVolume;
                        else if (endVolume < 0) endVolume = 0.0
                        nplayer.voiceVolume = endVolume;
                        nplayer.voice3d = true;
                    }
                }
            }
        }
    })
    radioSpeakers = radioSpeakersq
}

setInterval(() => {
    if (!user.isLogin()) return;
    voiceControllerTick()
}, 300)

setInterval(() => {
    mp.events.triggerBrowser("cef:hud:radioSpeakerList", radioSpeakers)
}, 1000)

function phoneRadioController(nplayer:PlayerMp) {
    let speak = false
    if (nplayer) {
        if (currentRadio && currentRadio.length > 3 && currentRadio == nplayer.getVariable('radioVol') && nplayer.getVariable('radioSpeak')) {
            nplayer.voiceVolume = phoneVolume;
            nplayer.voice3d = false;
            speak = true;
            if (!radioSpeakersq.includes(`${nplayer.getVariable('name')} [${nplayer.getVariable('id')}]`))
            radioSpeakersq.push(`${nplayer.getVariable('name')} [${nplayer.getVariable('id')}]`)
        }
        if (typeof phoneTarget === "number" && phoneTarget == nplayer.remoteId){
            nplayer.voiceVolume = phoneVolume;
            nplayer.voice3d = false;
            speak = true;
        }
    }
    if (!speak) {
        if (worldList.indexOf(nplayer.remoteId) == -1) {
            nplayer.voiceVolume = 0.0;
            nplayer.voice3d = false;
        }
    }
    return speak;
}



mp.events.addDataHandler("muted:voice", (entity, value) => {
    if (entity != mp.players.local) return;
    if (!value) return gui.browser.execute('CEF.hud.lockMicrophone(false)');
    disableMicrophone()
    disableMicrophoneRadio()
    gui.browser.execute('CEF.hud.lockMicrophone(true)');
});

export let pressVoice = false;

const enableMicrophone = async () => {
    if(!user.isLogin()) return;
    if (user.isDead())
        return;
    if (mp.players.local.getVariable('muted:voice')) return;
    if (pressVoice) return;
    if (pressFinger) return;
    mp.voiceChat.muted = false;
    gui.browser.execute('CEF.hud.setMicrophone(true)');
    mp.events.callSocket('startWorldSpeak')
    pressVoice = true;
    setTimeout(() => {
        pressVoice = false;
    }, 300)
    voiceKeyPressed = true;
    mp.game.streaming.requestAnimDict("mp_facial");
    while (!mp.game.streaming.hasAnimDictLoaded("mp_facial"))
        await methods.sleep(10);
    mp.players.local.playFacialAnim("mic_chatter", "mp_facial");
}
const disableMicrophone = async () => {
    if (!user.isLogin()) return;
    mp.voiceChat.muted = true;
    gui.browser.execute('CEF.hud.setMicrophone(false)');
    mp.events.callSocket('stopWorldSpeak')
    voiceKeyPressed = false;
    mp.game.streaming.requestAnimDict("facials@gen_male@variations@normal");
    while (!mp.game.streaming.hasAnimDictLoaded("facials@gen_male@variations@normal"))
        await methods.sleep(10);
    mp.players.local.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
}

setInterval(() => {
    if (radioKeyPressed || mp.players.local.getVariable('radioSpeak')){
        if (mp.keys.isDown(0x14)) return;
        if (mp.keys.isDown(0x72)) return;
        disableMicrophoneRadio();
        return;
    }
    if (voiceKeyPressed){
        if (mp.keys.isDown(78)) return;
        disableMicrophone();
        return;
    }
}, 1500);

let radioKeyPressed = false;
let voiceKeyPressed = false;

const enableMicrophoneRadio = () => {
    if (!user.isLogin())
    return;
    if (user.isCuff())
    return;
    if (user.isDead())
        return;
    if (radioKeyPressed) return;
    if (mp.players.local.getVariable('muted:voice')) return;

    const freq = methods.parseInt(user.get('walkietalkie_num').split('.')[0]);
    if (freq == 0) return;

    if (user.get('walkietalkie_num') != "0" && user.get('jail_time') == 0 && !mp.players.local.getVariable('muted:voice')) {
        gui.browser.execute('CEF.hud.setRadio(true)');
        ui.radioSoundOn();
        enableMicrophone();
        radioKeyPressed = true;
        mp.events.call("radioSpeakerAdd", user.get("rp_name"));
        mp.events.callSocket("voice.server.enableMic");
        user.playAnimation("random@arrests", "generic_radio_chatter");
    }
    
};

const disableMicrophoneRadio = () => {
    if (!user.isLogin())
        return;
    ui.radioSoundOff();
    disableMicrophone();
    mp.events.call("radioSpeakerRemove", user.get("rp_name"));
    mp.events.callSocket("voice.server.disableMic");
    gui.browser.execute('CEF.hud.setRadio(false)');
    user.stopAllAnimation();  
    radioKeyPressed = false;
};
mp.keys.bind(0x14, true, enableMicrophoneRadio);
mp.keys.bind(0x14, false, disableMicrophoneRadio);

mp.keys.bind(0x72, true, enableMicrophoneRadio);
mp.keys.bind(0x72, false, disableMicrophoneRadio);


mp.keys.bind(78, true, enableMicrophone);
mp.keys.bind(78, false, disableMicrophone);

// mp.events.addDataHandler('radioVol', (playerq:PlayerMp) => {
//     if (playerq.remoteId == mp.players.local.remoteId) worldList = [];
// });

mp.events.add({
    "playerStartTalking": (nplayer: PlayerMp) => {
        phoneRadioController(nplayer);
    },
    "playerStartTalkingEvent": async (nplayer:PlayerMp) =>{
        if(!nplayer) return;
        nplayer.isSpeaking = true;


        let radioVol = mp.players.local.getVariable("radioVol");

        let nradioVol = nplayer.getVariable("radioVol");
        let nradiospeak = nplayer.getVariable('radioSpeak');
        if ((phoneTarget == nplayer.remoteId) || (radioVol && radioVol == nradioVol && nradiospeak)) {
            nplayer.voiceVolume = phoneVolume;
            nplayer.voice3d = false;
            // if (radioVol && radioVol == nradioVol && nradiospeak) ui.radioSoundOn();
            // if (worldList.indexOf(nplayer) > -1) worldList.splice(worldList.indexOf(nplayer), 1)
        }
        phoneRadioController(nplayer);

        if (!nplayer.handle) return;
        mp.game.streaming.requestAnimDict("mp_facial");
        while (!mp.game.streaming.hasAnimDictLoaded("mp_facial"))
            await methods.sleep(10);
        nplayer.playFacialAnim("mic_chatter", "mp_facial");
    },
    "playerStopTalkingEvent": async (nplayer:PlayerMp) =>{
        if (!nplayer) return;
        nplayer.isSpeaking = false;
        // if (radioVol && radioVol == nradioVol && nradiospeak) ui.radioSoundOff();
        if(!nplayer.handle) return;
        mp.game.streaming.requestAnimDict("facials@gen_male@variations@normal");
        while (!mp.game.streaming.hasAnimDictLoaded("facials@gen_male@variations@normal"))
            await methods.sleep(10);
        nplayer.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
    },
    "playerQuit": (nplayer:PlayerMp) => {
        if (!nplayer) return;
        worldList.splice(worldList.indexOf(nplayer.remoteId), 1);
        radioList.splice(radioList.indexOf(nplayer.remoteId), 1);
        if (phoneTarget == nplayer.remoteId) phoneTarget = null;
    },
    "callStop": () => {
        if (worldList.indexOf(phoneTarget) == -1){
            let nplayer = mp.players.atRemoteId(phoneVolume)
            if (!nplayer) return;
            removeWorldVoice(nplayer);
        }
        phoneTarget = null;
    },
    "callStart": (nplayer:PlayerMp) => {
        if (!mp.players.exists(nplayer)) return;
        phoneTarget = nplayer.remoteId;
    },
    'radioClientConnect': (nplayer: number) => {
        if(!mp.players.exists(nplayer)) return;
        if (radioList.indexOf(nplayer) == -1) radioList.push(nplayer);
    },
    'radioClientDisconnect': (nplayer: number) => {
        radioList.splice(radioList.indexOf(nplayer), 1);
        if (worldList.indexOf(nplayer) == -1) removeWorldVoice(nplayer);
    },
    'radioClientDisconnectClear': () => {
        radioList = [];
        radioSpeakers = [];
        worldList = [];
        mp.events.triggerBrowser("cef:hud:radioSpeakerClear")
    },
});


let radioSpeakers: string[] = [];

// mp.events.add("radioSpeakerRemove", (name: string, id?: number) => {
//     radioSpeakers.splice(radioSpeakers.indexOf(name), 1);
//     mp.events.triggerBrowser("cef:hud:radioSpeakerRemove", name)
//     if (typeof id === "number"){
//         if (radioList.indexOf(id) == -1) radioList.push(id)
//     }
// })
// mp.events.add("radioSpeakerAdd", (name: string, id?:number) => {
//     if(radioSpeakers.indexOf(name) == -1){
//         radioSpeakers.push(name);
//         mp.events.triggerBrowser("cef:hud:radioSpeakerAdd", name)
//     }
//     if (typeof id === "number"){
//         if (radioList.indexOf(id) == -1) radioList.push(id)
//     }
// })