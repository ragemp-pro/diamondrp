/// <reference path="../../declaration/server.ts" />


import { user } from '../user';
import { methods } from '../modules/methods';
import { daynightEntity } from '../modules/entity/daynightEntity';


let _year = 2012;
let _month = 1;
let _day = 1;
let _hour = 12;
let _minute = 0;
let _tempNew = 17;
let _weatherType = 0;
let _weather: weathers = 'CLEAR';
let isVip = 0;
let isUsmc = false;

export let weather = {
  loadAll: function() {
    methods.debug('weather.loadAll');
    daynightEntity.findOne({
      where: {
        id: 1
      }
    }).then(item => {

      let d = new Date();
      _year = d.getFullYear();
      _month = d.getMonth() + 1;
      _day = d.getDate();
      _hour = item['hour'] || d.getHours();
      _minute = item['minute'] || d.getMinutes();
  
      weather.load();
    })
  },

  load: function() {
    methods.debug('weather.load');
    // if (_month < 2 || _month > 11) {
    //   //Зима
    //   _tempNew = methods.getRandomInt(5, 15) * -1;
    //   _weatherType = 0;
    // } else if (_month == 2) {
    //   //Зима
    //   _tempNew = methods.getRandomInt(1, 4) * -1;
    //   _weatherType = 0;
    // } else if (_month >= 3 && _month <= 5) {
    //   //Весна
    //   _tempNew = methods.getRandomInt(0, 8) + 10;
    //   _weatherType = 1;
    // } else if (_month >= 6 && _month <= 9) {
    //   //Лето
    //   _tempNew = methods.getRandomInt(0, 10) + 20;
    //   _weatherType = 2;
    // } //Осень
    // else {
    //   _tempNew = methods.getRandomInt(4, 12);
    //   _weatherType = 3;
    // }

    _tempNew = methods.getRandomInt(20, 30);
    _weatherType = 2;

    mp.players.forEach(function(player) {
      if(user.isLogin(player)){
        if (user.get(player, 'reg_time') > 0)
        user.set(player, 'reg_time', user.get(player, 'reg_time') - 1);
      }
    });
    

    weather.randomTimer();
    weather.weatherTimer();
    weather.timeSyncTimer();
    weather.saveTimer();
  },

  saveTimer: function() {
    methods.debug('weather.saveTimer');

    daynightEntity.update({
      year: _year,
      month: _month,
      day: _day,
      hour: _hour,
      minute: _minute,
    }, { where: {
      id: 1
    }})
    setTimeout(weather.saveTimer, 5 * 60 * 1000);
  },

  randomTimer: function() {
    methods.debug('weather.randomTimer');
    weather.nextRandomWeather();
    setTimeout(weather.randomTimer, 1000 * 60 * 10 + methods.getRandomInt(5, 35));
  },

  weatherTimer: function() {
    methods.debug('weather.weatherTimer');
    switch (_weatherType) {
      case 0:
        if (_hour > 1 && _hour <= 6) _tempNew = _tempNew - (methods.getRandomFloat() + 2);
        else if (_hour > 6 && _hour <= 12) _tempNew = _tempNew + methods.getRandomFloat();
        else if (_hour > 12 && _hour <= 16) _tempNew = _tempNew + (methods.getRandomFloat() + 1);
        else if (_hour > 16 && _hour <= 20) _tempNew = _tempNew + methods.getRandomFloat();
        else if (_hour > 20 && _hour <= 23) _tempNew = _tempNew + methods.getRandomFloat();
        else _tempNew = _tempNew - methods.getRandomFloat() - 0.3;
        break;
      case 1:
      case 2:
      case 3:
        if (_hour > 1 && _hour <= 6) _tempNew = _tempNew - (methods.getRandomFloat() + 1.2);
        else if (_hour > 6 && _hour <= 12) _tempNew = _tempNew + methods.getRandomFloat();
        else if (_hour > 12 && _hour <= 16) _tempNew = _tempNew + (methods.getRandomFloat() + 1);
        else if (_hour > 16 && _hour <= 20) _tempNew = _tempNew + methods.getRandomFloat();
        else if (_hour > 20 && _hour <= 23) _tempNew = _tempNew + methods.getRandomFloat();
        else _tempNew = _tempNew - methods.getRandomFloat() - 0.1;
        break;
    }

    setTimeout(weather.weatherTimer, 30 * 60 * 1000);
  },

  timeSyncTimer: function() {
    methods.debug('weather.timeSyncTimer');

    try {
      _minute++;
      if (_minute > 59) {
        _minute = 0;
        _hour++;


        let d = new Date();
        _year = d.getFullYear();
        _month = d.getMonth() + 1;
        _day = d.getDate();

        if (_hour > 23) {
          _hour = 0;
          // _day++;

          // if (_day > methods.daysInMonth(_year, _month)) {
          //   _day = 1;
          //   _month++;

          //   if (_month > 12) {
          //     _month = 1;
          //     _year++;
          //   }
          // }
        }
      }

      mp.players.forEach(player => {
        if(!user.isLogin(player)) return;
        if (user.get(player, 'reg_time') > 5)
          user.set(player, 'reg_time', user.get(player, 'reg_time') - 4);
        else if (user.get(player, 'reg_time') > 0)
          user.set(player, 'reg_time', user.get(player, 'reg_time') - 1);
      })

      
    } catch (e) {
      methods.debug(e);
    }
    setTimeout(weather.timeSyncTimer, 8500);
  },

  syncData: (player?:PlayerMp) => {
    let dateTime = new Date();
    (player ? player : mp.players).call('weatherdata:set', [
      _minute,
      _hour,
      _day,
      _month,
      _year,
      dateTime.getHours(),
      Math.round(_tempNew),
      `${methods.digitFormat(dateTime.getDate())}.${methods.digitFormat(dateTime.getMonth() + 1)} ${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}`,
      _weather,
      player ? true : false
    ])
  },

  setWeather: function(weatherName: weathers) {
    methods.debug('weather.setWeather');

    methods.debug('CURRENT WEATHER: ' + weatherName);
    if ((weatherName == 'RAIN' || weatherName == 'THUNDER' || weatherName == 'CLEARING') && methods.getRandomInt(0, 3) != 3) {
      weather.nextRandomWeather();
    } else {
      _weather = weatherName;
      weather.syncData();
    };
  },

  getRpDateTime: function() {
    methods.debug('weather.getRpDateTime');
    return `${methods.digitFormat(_hour)}:${methods.digitFormat(_minute)}, ${methods.digitFormat(
      _day
    )}/${methods.digitFormat(_month)}/${_year}`;
  },

  getWeatherTemp: () => {
    return _tempNew;
  },



  getWeather: function() {
    methods.debug('weather.getWeather');
    return _weather;
  },

  getWeatherType: function() {
    methods.debug('weather.getWeatherType');
    return _weatherType;
  },

  getHour: function() {
    return _hour;
  },

  setHour: function(t:number) {
    _hour = t;
  },

  getMin: function() {
    return _minute;
  },

  setMin: function(t:number) {
    _minute = t;
  },

  getDay: function() {
    methods.debug('weather.getDay');
    return _day;
  },

  getMonth: function() {
    methods.debug('weather.getMonth');
    return _month;
  },

  nextRandomWeather: function() {
    methods.debug('weather.nextRandomWeather');
    weather.nextRandomWeatherByType(weather.getWeatherType());
  },

  getWeatherName: function(type: weathers) {
    switch (type) {
      case 'EXTRASUNNY':
      case 'CLEAR':
        return 'Солнечно';
      case 'CLOUDS':
        return 'Облачно';
      case 'SMOG':
        return 'Смог';
      case 'FOGGY':
        return 'Туман';
      case 'OVERCAST':
        return 'Пасмурно';
      case 'RAIN':
        return 'Дождь';
      case 'THUNDER':
        return 'Гроза';
      case 'CLEARING':
        return 'Лёгкий дождь';
      case 'SNOW':
        return 'Снег';
    }
    return 'Солнечно';
  },

  getFullRpTime: function() {
    return `${methods.digitFormat(_hour)}:${methods.digitFormat(_minute)}`;
  },

  nextRandomWeatherByType: function(weatherType: number) {
    methods.debug('weather.nextRandomWeatherByType');

    let weatherList: weathers[] = [
      'EXTRASUNNY',
      'CLEAR',
      'CLOUDS',
      'SMOG',
      'FOGGY',
      'OVERCAST',
      'RAIN',
      'THUNDER',
      'CLEARING',
      'SNOW',
    ];

    switch (weatherType) {
      case 0:
        weatherList = [
          'EXTRASUNNY',
          'CLOUDS',
          'CLOUDS',
          'SMOG',
          'SMOG',
          'FOGGY',
          'FOGGY',
          'OVERCAST',
          'OVERCAST',
        ];

        if (weatherType == 0) if (_tempNew < 1) weatherList = ['SNOW'];

        break;
      case 1:
        weatherList = [
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLOUDS',
          'CLOUDS',
          'CLOUDS',
          'CLOUDS',
          'CLOUDS',
          'SMOG',
          'SMOG',
          'SMOG',
          'FOGGY',
          'FOGGY',
          'FOGGY',
          'OVERCAST',
          'OVERCAST',
          'OVERCAST',
          'CLEARING',
        ];
        break;
      case 3:
        weatherList = [
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLOUDS',
          'CLOUDS',
          'CLOUDS',
          'CLOUDS',
          'SMOG',
          'SMOG',
          'SMOG',
          'FOGGY',
          'FOGGY',
          'FOGGY',
          'OVERCAST',
          'OVERCAST',
          'OVERCAST',
          'RAIN',
          'THUNDER',
          'CLEARING',
        ];
        break;
      case 2:
        weatherList = [
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'EXTRASUNNY',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLEAR',
          'CLOUDS',
          'CLOUDS',
          'SMOG',
          'FOGGY',
          'FOGGY',
          'FOGGY',
          'OVERCAST',
          'CLEARING',
        ];
        break;
    }

    

    if (_hour > 4 && _hour < 7) {
      switch (weather.getWeather()) {
        case 'EXTRASUNNY':
        case 'CLEAR':
        case 'CLOUDS':
          weather.setWeather('FOGGY');
          break;
      }
    } else if (_hour > 20) {
      switch (weather.getWeather()) {
        case 'EXTRASUNNY':
        case 'CLEAR':
        case 'CLOUDS':
          weather.setWeather('SMOG');
          break;
      }
    } else {
      weather.setWeather(weatherList[methods.getRandomInt(0, weatherList.length)]);
    }

    methods.notifyWithPictureToAll(
      `Life Invader [${weather.getFullRpTime()}]`,
      '~y~Новости погоды',
      `${weather.getWeatherName(weather.getWeather())}\nТемпература воздуха: ~y~${Math.round(
        _tempNew
      )}°C`,
      'CHAR_LIFEINVADER',
      1
    );
  },
};


setInterval(() => {
  weather.syncData();
}, 3000)