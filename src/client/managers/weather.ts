import { methods } from '../modules/methods';
import { user } from '../user';

let Day = 0;
let Month = 0;
let Year = 0;
let Hour = 0;
let Min = 0;
let Sec = 0;
let Temp = 27;
let TempServer = 27;
let DayName = 'Понедельник';
let RealHour = 0;
let Players = 0;
let FullRealDateTime = '';
let CurrentWeather = 'CLEAR';
let DayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MonthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

const weather = {
  nextWeather: (weatherName:string, delay:number) => {
    // mp.game.gameplay.setWeatherTypeTransition(mp.game.joaat(CurrentWeather), mp.game.joaat(weatherName), delay);
    mp.game.gameplay.setWeatherTypeOverTime(weatherName, CurrentWeather == weatherName ? 1 : delay);
    CurrentWeather = weatherName;
  
    // mp.console.logInfo('CURRENT WEATHER: ' + weatherName + ':' + delay);
  
    setTimeout(function() {
      /* TODO чтобы снег лежал, ес че
          SetWeatherTypePersist(weatherList[idx].ToString());
          SetWeatherTypeNowPersist(weatherList[idx].ToString());
          SetWeatherTypeNow(weatherList[idx].ToString());
          SetOverrideWeather(weatherList[idx].ToString());
          */
  
      if (
        weatherName == 'XMAS' 
        // ||
        // weatherName == 'SNOWLIGHT' ||
        // weatherName == 'BLIZZARD' ||
        // weatherName == 'SNOW'
      ) {
        // mp.game.graphics.setForceVehicleTrails(true);
        // mp.game.graphics.setForcePedFootstepsTracks(true);
        
        //SetOverrideWeather("XMAS");

        //RequestScriptAudioBank("ICE_FOOTSTEPS", false);
        //RequestScriptAudioBank("SNOW_FOOTSTEPS", false);
  
        //N_0xc54a08c85ae4d410(3.0f);
  
        /*RequestNamedPtfxAsset("core_snow");
              while (!HasNamedPtfxAssetLoaded("core_snow"))
                  await Delay(10);
              UseParticleFxAssetNextCall("core_snow");*/
      } else {
        //ReleaseNamedScriptAudioBank("ICE_FOOTSTEPS");
        //ReleaseNamedScriptAudioBank("SNOW_FOOTSTEPS");
        // mp.game.graphics.setForceVehicleTrails(false);
        // mp.game.graphics.setForcePedFootstepsTracks(false);
        //RemoveNamedPtfxAsset("core_snow");
        //N_0xc54a08c85ae4d410(0.0f);
      }
    }, delay);
  },

  getWeatherId: (weatherName:string) => {
    let weatherId = 0;
    switch (weatherName) {
      case 'CLEAR':
        weatherId = 1;
        break;
      case 'CLOUDS':
        weatherId = 2;
        break;
      case 'SMOG':
        weatherId = 3;
        break;
      case 'FOGGY':
        weatherId = 4;
        break;
      case 'OVERCAST':
        weatherId = 5;
        break;
      case 'RAIN':
        weatherId = 6;
        break;
      case 'THUNDER':
        weatherId = 7;
        break;
      case 'CLEARING':
        weatherId = 8;
        break;
      case 'XMAS':
        weatherId = 13;
        break;
    }
    return methods.parseInt(weatherId);
  },
  
  syncDateTime: (min:number, hour:number, day:number, month:number, year:number) => {
    mp.discord.update('Diamond RolePlay'+(user.testServer ? ' [TEST MOD]' : ''), 'gta-5.ru');
  
    DayName = DayNames[new Date(year, month, day).getDay()];
  
    Day = day;
    Month = month;
    Year = year;
    Hour = hour;
    Min = min;
    Sec = 0;
  
    Players = mp.players.length;
  
    mp.game.time.setClockDate(day, month, year);
    mp.game.time.setClockTime(hour, min, Sec);
  },
  
  getCurrentDayName: () => {
    return DayName;
  },
  
  getMonth: () => {
    return Month;
  },
  
  getHour: () => {
    return Hour;
  },
  
  getMin: () => {
    return Min;
  },
  
  getTime: () => {
    return `${methods.digitFormat(Hour)}:${methods.digitFormat(Min)}`;
  },
  
  getFullRpDateTime: () => {
    return `${methods.digitFormat(Hour)}:${methods.digitFormat(Min)} | ${methods.digitFormat(
      Day
    )}/${methods.digitFormat(Month)}/${Year}`;
  },
  
  getFullRpDate: () => {
    return `${methods.digitFormat(Day)}.${methods.digitFormat(Month)}.${Year}`;
  },

  getMonthYearDate: () => {
    const dateTime = new Date();
    return `${MonthNames[dateTime.getMonth()]} ${dateTime.getFullYear()}`;
  },
  
  getFullRpTime: () => {
    return `${methods.digitFormat(Hour)}:${methods.digitFormat(Min)}`;
  },
  
  syncRealTime: (hour:number) => {
    RealHour = hour;
  },
  
  getRealTime: () => {
    return RealHour;
  },
  
  syncRealFullDateTime: (dateTime: string) => {
    FullRealDateTime = dateTime;
  },
  
  getRealFullDateTime: () => {
    return FullRealDateTime;
  },
  
  getRealFullDateTimeWithOnline: () => {
    return FullRealDateTime + ' | Игроков: ' + Players + ' /1000 | ID: ' + user.get('id') + ((user.isAdmin() && mp.players.local.getVariable('enableAdmin') === true) ? ' | ~r~ADMIN MOD' : "");
  },
  
  syncWeatherTemp: (temp:number) => {
    Temp = temp;
    TempServer = temp;
  },
  
  getWeatherTemp: () => {
    return Temp;
  },
  
  getWeatherTempServer: () => {
    return TempServer;
  },
  
  secSyncTimer: () => {
    Sec++;
    if (Sec >= 59) Sec = 59;
    mp.game.time.setClockTime(Hour, Min, Sec);
    setTimeout(weather.secSyncTimer, 141);
  },
  
  getCurrentWeather: () => {
    return CurrentWeather;
  },

};

export { weather };
