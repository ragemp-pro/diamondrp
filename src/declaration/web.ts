/// <reference path="rage-client.ts" />
interface HTMLElement{
  value?: string;
}
interface API {
  store: {
    dispatch(action: object): void;
    getState(): any;
  };
  getRandomInt(min: number, max: number): number;
  getDate(): string;
  getTime(): string;
  remote(event: string, ...args: any[]): void;
}

interface CEF {
  alert: {
    setAlert(type: 'success' | 'info' | 'warning' | 'error', text: string, img?: string, time?:number): void;
    setBigAlert(type: 'success' | 'info' | 'warning' | 'error', text: string, time:number): void;
    setHelp(text: string): void;
    setHelpKey(key: string, text: string): void;
    removeHelpKey(): void;
    setSafezoneInfo(width: number, height: number, left: number, bottom: number): void;
  };
  speedometer: {
    setSpeedometer(speedometer: boolean): void;
    setSpeed(speed: number): void;
    setFuel(fuel: number): void;
    setEngine(engine: boolean): void;
    setLockCar(lock: boolean): void;
    setLights(lights: boolean): void;
  };
  circle: {
    setData(data: any[]): void;
  };
  usermenu: {
    setBinds(binds: string): void;
    setPlayers(
      players: {
        id: number;
        name: string;
        level: number;
        color: [number, number, number, number];
      }[]
    ): void;
  };
  hud: {
    setCasinoInt(inCasino: boolean): void;
    setGreenZone(status:number): void;
    setGangZone(gangzone: string, gangzonefractioncolor: string, gangzonefractionname: string): void;
    setGangWar(status:boolean): void;
    setSpecialZone(zone:string): void;
    disableRace(): void;
    raceData(position: number, lap: number, lapMax: number, racers: number): void;
    setHud(hud: boolean): void;
    setWeapon(weapon: boolean): void;
    setBullets(b1: number, b2: number): void;
    setMicrophone(microphone: boolean): void;
    setRadio(radio: boolean): void;
    lockMicrophone(microphoneLock: number): void;
    setHudBinds(binder: any): void;
    setMoney(money: number): void;
    setChips(money: number): void;
    setMoneyBank(money: number): void;
    setHasBankCard(hasBankCard: boolean): void;
    showHud(show: boolean): void;
    disableHud(disable: boolean): void;
    setTime(time: string): void;
    setTimeTablet(time: string): void;
    setDate(date: string): void;
    setTemp(temp: number): void;
    setCompass(compass: string): void;
    setStat(statTime: string, online: number, player_id: number, admin: boolean, godmode: boolean, afk?: boolean, admin_hidden?: boolean, mask?: boolean): void;
    setZone(zone: string, street: string): void;
    toggleDeathTimer(deathTimer: boolean): void;
    setDeathTime(deathTime: number): void;
    setHasWatch(hasWatch: boolean): void;
    setInfoLinePos(left: number, bottom: number): void;
    updateHelpToggle(toggle: boolean): void;
  };
  gui: {
    setGui(gui: string): void;
    setCursor(cursor: boolean): void;
    setShow(show: boolean): void;
    setInput(input: boolean): void;
    setCircleCursor(cursor: boolean): void;
    setBinder(binder: string): void;
  };
  capture: {
    showMafiaInfo(show: boolean): void;
    updateMafiaInfo(time: number, lcn: number, trd: number, rm: number, lme: number): void;
    showGangInfo(show: boolean): void;
    updateGangInfo(time: number, top1: number, top2: number): void;
  };
  radio: {
    radioManager(data: { type: string; shVol: number }): void;
  }
  inventory: {
    setModal(
      modalText: string,
      modalValue: number,
      modalBtnText: string,
      modalHandler: Function
    ): void;
    removeModal(): void;
  };
  phone: {
    data: any;
    setAddingPhone(phone: string): void;
    setAddingName(name: string): void;
  };
  login: {
    setLoginInputs(name: string, password: string): void;
    setLogged(logged: boolean): void;
  };
  masters: {
    clothesData: any;
    setClothesData(data: any): void;
    objectData: any;
    setObjectData(data: any): void;
  };
  fueling: {
    setDialog(number: number, fullTank: number, currentTank: number, perLiter: number): void;
  };
  buycar: {
    allowTestDrive(): void;
    setCars(cars: string): void;
    setCar(id: number): void;
    setColors(colors: string): void;
    setType(type: string): void;
  };
  buyphone: {
    setAuctionList(list: string): void;
  };
  smi: {
    setAdvList(advs: any): void;
    setAccessEdit(data: any): void;
    setAccessAccept(data: any): void;
    setAccessDelete(data: any): void;
  };
  bank: {
    checkOldPin(data: any): void;
    setCards(data: any): void;
    setOwner(data: any): void;
    setActiveCard(data: any): void;
    setHistory(data: any): void;
  };
  progressbar: {
    show(show: boolean): void;
    update(width: number): void;
    setText(text: string): void;
  }
  casino: {
    show(type: string, additionalData: {[key: string] : any}): void;
    hide(): void;
    changeBetValue(value: string, notify: boolean): void;
    updateAdditionalData(additionalData: {[key: string]: any}): void;
  }
}

interface WindowCef extends Window {
  CustomEvent: any;
  callRemote: (name: string, jsargs: string) => SocketIOClient.Socket;
  initSocketSystem: (url: string, id: number, key: string) => void;
  chatAPI: {
    show(show: boolean): void;
    push(message: string): void;
    activate(activate: boolean): void;
    send(message: string): void;
    clear(): void;
    value(): void;
  };
  API: API;
  CEF: CEF;
  custom_sound: {
    playCustomSoundAtEntity: (url: string, volume: number, max_dist: number, netid: string) => any;
    setCustomSoundList: (
      name: string,
      url: string,
      volume: number,
      list: { x: number; y: number; z: number; dist: number }[]
    ) => any;
    setCustomSound: (
      name: string,
      url: string,
      volume: number,
      max_dist: number,
      x: number,
      y: number,
      z: number
    ) => any;
    removeCustomSound: (name: string) => any;
    playCustomSound: (
      url: string,
      volume: number,
      max_dist: number,
      x: number,
      y: number,
      z: number
    ) => any;
    setAllData: (
      x: number,
      y: number,
      z: number,
      fx: number,
      fy: number,
      fz: number,
      data: string
    ) => any;
    generateAudioSource: (url: string) => any;
    currentMillisecond: () => any;
  };
  __customTriggerCef__: (name: string, ...args: any[]) => any;
  __customCallCef__: (env: 'server' | 'client', name: string, ...args: any[]) => any;
  __customResponseCef__: (id: number, result: any) => any;
  mp: CefMp;
}

declare var window: WindowCef;

interface CefMp {
  enableDebuggingAlerts(arg0: boolean): any;
  trigger(arg0: string, ...args: any[]): any;
  invoke(arg0: string, ...args: any[]): any;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.mp3' {
  const content: string;
  export default content;
}
declare module '*.ogg' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}
