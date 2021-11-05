/// <reference path="../declaration/client.ts" />

let __CONFIG__:{
  [param:string]:any;
} = {
  pushToTalkKey: 78, // default voice activation key
  defaultDistance: 15, // default proximity distance
  token: 'lol', // that is token from server
  isTokenSecurity: false, //
  prefixId: `M83_pl_`, // that prefix for voice id
  receivingTokenEventName: 'youToken', // the name of the event that receives the token
  sendDataProximityInterval: 500, // the interval between sending loudness data to ms
  debug: false, // debug mode
  smoothTransitionRate: 0.09, // speed of transition from global chat to radio / phone call
  voiceVolume: 0,
  radioVolume: 1,
  radioBalance: 0
};

const __STORAGE__ = {
  browserReady: false,
  lastSendingProximityEvent: Date.now(),
  enabledMicrophone: false,
  mutedMicrophone: false,
  currentConnectedPlayers: <Set<PlayerMp>> new Set(),
  queueRequestPeers: new Map(),
  stateVoiceConnection: 'closed',
  streamedPlayers: <Set<PlayerMp>> new Set(),
  virtualStreamedPlayers: <Set<PlayerMp>>new Set(),
  distance: __CONFIG__.defaultDistance,
  globalPeers: new Set(),
  proximityPeers: new Set(),
  radioState: <Map<PlayerMp,boolean>>new Map()
};


const isEnabledMicrophone = () => __STORAGE__.enabledMicrophone;


const safeSetVoiceInfo = (player:PlayerMp, key:string, value:any) => {
  if (typeof player.voice === 'undefined') {
    player.voice = {
      enabled: false,
      muted: false,
      volume: 0,
      balance: 0,
      globalVolume: 0,
      _volume: 0,
      stateConnection: 'connected',
      distance: __CONFIG__.defaultDistance,
      stateChangeVolume: 'proximity'
    };
  }

  player.voice[key] = value;
};

const safeGetVoiceInfo = (player:PlayerMp, key:string) => {
  if (typeof player.voice === 'undefined') {
    player.voice = {
      enabled: false,
      muted: false,
      volume: 0,
      balance: 0,
      globalVolume: 0,
      _volume: 0,
      stateConnection: 'connected',
      distance: __CONFIG__.defaultDistance,
      stateChangeVolume: 'proximity'
    };
  }

  return player.voice[key];
};



const setSettings = (key:string, val:any) => {
  __CONFIG__[key] = val;
};

const changeSettings = (obj:{
  [param:string]:any;
}) => {
  __CONFIG__ = {
    ...__CONFIG__,
    obj
  };
};

export default {
  setSettings,
  changeSettings,
  isEnabledMicrophone,
  getVoiceInfo: safeGetVoiceInfo,
  setVoiceInfo: safeSetVoiceInfo
};
