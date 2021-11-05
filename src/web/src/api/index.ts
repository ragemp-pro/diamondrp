import { store, history } from './store';
import '../../../util/string';
import $ from 'jquery';
const remote = (event: string, ...params: any[]) => {
  mp.trigger('triggerRemote', JSON.stringify([event, params]));
};

const API = {
  store,
  history,
  remote,
  parse: (data: string): object => {
    return JSON.parse(unescape(data));
  },
  getTime: (now?: number) => {
    const date = now ? new Date(now) : new Date();
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000 + 10800000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let hours_str = String(hours);
    let minutes_str = String(minutes);
    if (hours < 10) hours_str = `0${hours}`;
    if (minutes < 10) minutes_str = `0${minutes}`;
    return `${hours_str}:${minutes_str}`;
  },
  getDate: (now?: number) => {
    const date = now ? new Date(now) : new Date();
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000 + 10800000);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let day_str = String(day);
    let month_str = String(month);
    if (day < 10) day_str = `0${day}`;
    if (month < 10) month_str = `0${month}`;
    return `${day_str}.${month_str}.${year}`;
  },
  getRandomInt: (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  formatTime: (time: number) => {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    let minutes_str = String(minutes);
    let seconds_str = String(seconds);
    if (minutes < 10) minutes_str = `0${minutes}`;
    if (seconds < 10) seconds_str = `0${seconds}`;
    return `${minutes_str}:${seconds_str}`;
  },
  slideRight: (current: number, max: number, step = 1) => {
    let next = current + step;
    if (next >= max) next = 0;
    return next;
  },
  slideLeft: (current: number, max: number, step = 1) => {
    let next = current - step;
    if (current == 0) next = max - 1;
    return next;
  }
};

const CEF: CEF = {
  // @ts-ignore
  alert: {},
  // @ts-ignore
  speedometer: {},
  // @ts-ignore
  circle: {},
  // @ts-ignore
  usermenu: {},
  // @ts-ignore
  hud: {},
  // @ts-ignore
  gui: {},
  // @ts-ignore
  inventory: {},
  // @ts-ignore
  phone: {
    data: {},
  },
  // @ts-ignore
  capture: {},
  // @ts-ignore
  radio: {},
  // @ts-ignore
  login: {},
  // @ts-ignore
  masters: {},
  // @ts-ignore
  fueling: {},
  // @ts-ignore
  buycar: {},
  // @ts-ignore
  buyphone: {},
  // @ts-ignore
  smi: {},
  // @ts-ignore
  bank: {},
  // @ts-ignore
  progressbar: {},
  // @ts-ignore
  casino: {},
};

const filterInput = (text: string) => {
  if (typeof text !== "string") return text;
  if (!text.length) return text;
  text = text.toString().replace(/\n/g, ' ');
  text = text.replace(/<([^>]*)>?/gm, '$1');
  return text
}
setInterval(() => {
  $('input').each((_, el) => {
    if ($(el).is(":focus")) {
      let text = ($(el).val()).toString()
      if (text) {
        text = filterInput(text);
        if (($(el).val()).toString() !== text) $(el).val(text);
      }
    }
  })
}, 200)

export { API, CEF };
