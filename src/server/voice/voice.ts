/// <reference path="../../declaration/server.ts" />

import {RadioRoomsContorller} from './RadioRoomsContorller';
import { methods } from '../modules/methods';

mp.events.add('playerJoin', (player:PlayerMp) => {
  player.voice = {
    isEnabledMicrophone: false
  };

  player.radioRoom = '';
});

mp.events.add('playerQuit', (player:PlayerMp) => {
  RadioRoomsContorller.onQuit(player.radioRoom, player);
});

//Инит
mp.events.add('voice.server.initRadio', (player:PlayerMp, frequency) => {
  if(frequency == "0.0") return;
  if (!RadioRoomsContorller.hasRoom(frequency)) {
    RadioRoomsContorller.createRoom(frequency);
  }

  RadioRoomsContorller.onJoin(frequency, player);
});

//Изменить частоту рации
mp.events.add('voice.server.changeRadioFrequency', (player:PlayerMp, frequency) => {
  RadioRoomsContorller.onQuit(player.radioRoom, player);
  if(frequency == "0.0") return;
  if (!RadioRoomsContorller.hasRoom(frequency)) {
    RadioRoomsContorller.createRoom(frequency);
  }

  RadioRoomsContorller.onJoin(frequency, player);
});

// Выключение рации
mp.events.add('voice.server.quitRadio', (player:PlayerMp) => {
  RadioRoomsContorller.onQuit(player.radioRoom, player);
});

mp.events.add('voice.server.enableMic', (player:PlayerMp) => {
  methods.debug("enableMic: "+player.radioRoom)
  RadioRoomsContorller.enableMic(player.radioRoom, player);
});

mp.events.add('voice.server.disableMic', (player:PlayerMp) => {
  methods.debug("disableMic: "+player.radioRoom)
  player.setVariable('radioSpeak', false)
  RadioRoomsContorller.disableMic(player.radioRoom, player);
});

/*
	MAIN VOICE EVENTS - start
*/
mp.events.add('voice.changeStateConnection', (player:PlayerMp, state) => {
  //player.data['voice.stateConnection'] = state;
  player.setVariable('voice.stateConnection', state)
});

mp.events.add('voice.toggleMicrophone', (player:PlayerMp, isEnabled) => {
  mp.players.call(player.streamedPlayers, 'voice.toggleMicrophone', [player, isEnabled]);
  player.voice.isEnabledMicrophone = isEnabled;
});

/*
	MAIN VOICE EVENTS - end
*/

/*
    UTILITY FUNCTIONS - start
*/

const setVoiceDistance = (player:PlayerMp, distance:number) => {
  player.setVariable('voice.distance', distance)
  //player.data['voice.distance'] = distance;
};

//const getVoiceDistance = (player:PlayerMp) => player.data['voice.distance'];
const getVoiceDistance = (player:PlayerMp) => player.getVariable('voice.distance');

const isEnabledMicrophone = (player:PlayerMp) => player.voice.isEnabledMicrophone;

const setVoiceMuted = (player:PlayerMp, muted:boolean) => {
  //player.data['voice.muted'] = muted;
  player.setVariable('voice.muted', muted)
};

//const getVoiceMuted = (player:PlayerMp) => player.data['voice.muted'];
const getVoiceMuted = (player:PlayerMp) => player.getVariable('voice.muted');

const setMicrophoneKey = (player:PlayerMp, key:any) => {
  player.voice.microphoneKey = key;
  player.call('voice.changeMicrophoneActivationKey', [key]);
};

const getMicrophoneKey = (player:PlayerMp) => player.voice.microphoneKey;

const vmethods = {
  getMicrophoneKey,
  setMicrophoneKey,
  getVoiceMuted,
  setVoiceMuted,
  getVoiceDistance,
  setVoiceDistance,
  isEnabledMicrophone
};

mp.events.add('voice.server.callMethod', (method:"getMicrophoneKey"|"setMicrophoneKey"|"getVoiceMuted"|"setVoiceMuted"|"getVoiceDistance"|"setVoiceDistance"|"isEnabledMicrophone", ...args) => {
  if (typeof vmethods[method] === 'function') {
    // @ts-ignore
    return vmethods[method](...args);
  }
});

export {vmethods};