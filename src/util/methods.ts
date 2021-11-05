export const testJSON = (text: string) => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};
/** Default - 500ms */
export const sleep = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Default - 500ms */
export const wait = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export const getTime = function(from:string | number | Date = null) {
  let time;
  if(from == null) time = new Date();
  else time = new Date(from);
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let seconds = time.getSeconds();
  let ms = time.getMilliseconds();
  let m = time.getTime();
  let full = ms + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000
  let res = {
    hour: hours,
    minutes: minutes,
    seconds: seconds,
    ms: ms,
    m: m,
    full: full,
    index: time
  };
  return res;
}

function randEl<T>(arr: T[], length?: undefined|0|null):T;
function randEl<T>(arr: T[], length?:number):T[];
function randEl<T>(arr: T[], length: number = 0):T[]|T{
  if (arr.length == 0) return null;
  const newArr = [...arr];
  if (length > 1){
    let resArr:T[] = [];
    for(let id = 0;id<length;id++){
      let id = getRandomInt(0, newArr.length - 1)
      resArr.push(newArr[id])
      newArr.splice(id, 1);
    }
  } else {
    return newArr[getRandomInt(0, newArr.length - 1)]
  }
}

/** Вернёт случайный элемент массива */
export const randomArrayEl = randEl;

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min:number, max:number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const formatTime = (time: number) => {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  let minutes_str = String(minutes);
  let seconds_str = String(seconds);
  if (minutes < 10) minutes_str = `0${minutes}`;
  if (seconds < 10) seconds_str = `0${seconds}`;
  return `${minutes_str}:${seconds_str}`;
};