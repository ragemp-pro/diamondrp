const redNumbers: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const mapWinMultiplier: {[key: string]: number} = {
  'number': 35,
  'trio': 11,
  'dozen': 2,
  'small': 1,
  'even': 1,
  'red': 1,
  'black': 1,
  'odd': 1,
  'big': 1,
  'column': 2,
  'split': 17,
  'five-numbers': 6,
  'six-numbers': 5,
  'square': 8,
  'straight': 11,
};

interface RuleInterface {
  multiplier: number;
  title: string;
  type: string;
  winNumbers: number[]
}

const createRulesObject = (title: string, type: string, winNumbers: number[]): RuleInterface => ({
  multiplier: mapWinMultiplier[type],
  title,
  type,
  winNumbers
});

const rules: {[key: string]: RuleInterface} = {
  '0-1-37': createRulesObject('Трио', 'trio', [0, 1, 37]),
  '1-36-37': createRulesObject('Трио', 'trio', [1, 36, 37]),
  '1-2-36': createRulesObject('Трио', 'trio', [1, 2, 36]),
  '0-37': createRulesObject('Сплит', 'split', [0, 37]),
  '1-37': createRulesObject('Сплит', 'split', [1, 37]),
  '1-36': createRulesObject('Сплит', 'split', [1, 36]),
  '2-36': createRulesObject('Сплит', 'split', [2, 36]),
  '50': createRulesObject('Сплит', 'split', [36, 37]),
  '36-37': createRulesObject('Сплит', 'split', [36, 37]),
  '36': createRulesObject('Double zero', 'split', [36]),
  '37': createRulesObject('Zero', 'split', [37]),
  '38': createRulesObject('Дюжина 1', 'dozen', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  '39': createRulesObject('Дюжина 2', 'dozen', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]),
  '40': createRulesObject('Дюжина 3', 'dozen', [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
  '41': createRulesObject('Малые', 'small', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]),
  '42': createRulesObject('Четные', 'even', [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]),
  '43': createRulesObject('Красные', 'red', [0, 2, 4, 6, 8, 11, 13, 15, 17, 18, 20, 22, 24, 26, 29, 31, 33, 35]),
  '44': createRulesObject('Черные', 'black', [1, 3, 5, 7, 9, 10, 12, 14, 16, 19, 21, 23, 25, 27, 28, 30, 32, 34]),
  '45': createRulesObject('Нечетные', 'odd', [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34]),
  '46': createRulesObject('Большие', 'big', [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
  '47': createRulesObject('Колонна 1', 'column', [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33]),
  '48': createRulesObject('Колонна 2', 'column', [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]),
  '49': createRulesObject('Колонна 3', 'column', [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]),
  '50-51': createRulesObject('5 номеров', 'five-numbers', [37, 38, 0, 1, 2])
};

for (let i = 0; i < 36; i++) {
  rules[i] = createRulesObject(`${i + 1} ${redNumbers.includes(i + 1) ? 'красное': 'черное'}`, 'number', [i]);
}

for (let i = 0; i < 11; i++) {
  const ix3 = i * 3;

  const rulesSquareFirst = [ix3, ix3 + 1, ix3 + 3, ix3 + 4];
  const rulesSquareSecond = [ix3 + 1, ix3 + 2, ix3 + 4, ix3 + 5];

  rules[rulesSquareFirst.join('-')] = createRulesObject('Каре', 'square', rulesSquareFirst);
  rules[rulesSquareSecond.join('-')] = createRulesObject('Каре', 'square', rulesSquareSecond);

  const splitFirst = [ix3, ix3 + 3];
  const splitSecond = [ix3 + 1, ix3 + 4];
  const splitThree = [ix3 + 2, ix3 + 5];

  rules[splitFirst.join('-')] = createRulesObject('Сплит', 'split', splitFirst);
  rules[splitSecond.join('-')] = createRulesObject('Сплит', 'split', splitSecond);
  rules[splitThree.join('-')] = createRulesObject('Сплит', 'split', splitThree);
}

for (let i = 0; i < 12; i++) {
  const ix3 = i * 3;

  const splitFirst = [ix3, ix3 + 1];
  const splitSecond = [ix3 + 1, ix3 + 2];

  rules[splitFirst.join('-')] = createRulesObject('Сплит', 'split', splitFirst);
  rules[splitSecond.join('-')] = createRulesObject('Сплит', 'split', splitSecond);
}

for (let i = 51; i < 63; i++) {
  const j = i - 51;
  const jx3 = j * 3;

  rules[i] = createRulesObject('Стрит', 'straight', [jx3, jx3 + 1, jx3 + 2]);

  if (i !== 62) {
    const nextJ = (i - 50) * 3;

    rules[`${i}-${i + 1}`] = createRulesObject('6 номеров', 'six-numbers', [jx3, jx3 + 1, jx3 + 2, nextJ, nextJ + 1, nextJ + 2]);
  }
}

const getChipTypeByBalance = (table: TableInterface, balance: number) => {
  for (let i = table.chipTypePrices.length - 1; i >= 0; i--) {
    const chipPrice = table.chipTypePrices[i];

    if (balance >= chipPrice) {
      return i;
    }
  }
};

const mapAnims: {[key: number]: number} = {
  [36]: 1,
  [26]: 2,
  [9]: 3,
  [24]: 4,
  [28]: 5,
  [11]: 6,
  [7]: 7,
  [18]: 8,
  [12]: 37,
  [17]: 10,
  [5]: 11,
  [20]: 12,
  [32]: 13,
  [15]: 14,
  [3]: 15,
  [22]: 16,
  [34]: 17,
  [13]: 18,
  [1]: 19,
  [37]: 20,
  [27]: 21,
  [8]: 22,
  [25]: 23,
  [29]: 24,
  [10]: 25,
  [6]: 26,
  [19]: 27,
  [31]: 28,
  [16]: 29,
  [4]: 30,
  [21]: 31,
  [33]: 32,
  [14]: 33,
  [2]: 34,
  [23]: 35,
  [35]: 36,
  [30]: 9,
  [0]: 38
};

export type ChipTypePricesType = number[];

interface TableMetaInterface {
  position: Vector3Mp;
  heading: number;
  chipTypePrices: ChipTypePricesType;
  isVip: boolean;
}

const positions: TableMetaInterface[] = [
  {
    position: new mp.Vector3(1146.247802734375, 267.0387268066406, -52.84086990356445),
    heading: 228,
    chipTypePrices: [100, 250, 750, 1000],
    isVip: false
  },
  {
    position: new mp.Vector3(1149.006103515625, 264.03985595703125, -52.84086990356445),
    heading: 45,
    chipTypePrices: [10, 25, 75, 100],
    isVip: false
  }
];

type Polygon2D = [number, number];

const insidePolygon = (point: number[], vs: [Polygon2D, Polygon2D, Polygon2D, Polygon2D]) => {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

const lerp = (v1: number, v2: number, deltaTime: number): number => (1 - deltaTime) * v1 + deltaTime * v2;

export default {
  getChipTypeByBalance,
  insidePolygon,
  lerp,
  redNumbers,
  mapWinMultiplier,
  rules,
  mapAnims,
  positions
};
