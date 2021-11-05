const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const suits = [
  {
    type: 'd',
    label: 'Бубны',
    name: 'diamonds',
    nameModel: 'dia'
  },
  {
    type: 'c',
    label: 'Трефы',
    name: 'clubs',
    nameModel: 'club'
  },
  {
    type: 'h',
    label: 'Черви',
    name: 'hearts',
    nameModel: 'hrt'
  },
  {
    type: 's',
    label: 'Пики',
    name: 'spades',
    nameModel: 'spd'
  }
];

export const cardsArray: string[] = [];

for (let i = 0; i < suits.length; i++) {
  for (let j = 0; j < values.length; j++) {
    cardsArray.push(`${values[j]}${suits[i].type}`);
  }
}

export const BETS_BALANCE = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];;


export const mapWins: {[key: string]: {first: {multiplier: number}, second: {multiplier: number}}} = {
  'Straight Flush': {
    first: {
      multiplier: 6
    },
    second: {
      multiplier: 40
    }
  },
  'Three of a Kind': {
    first: {
      multiplier: 4
    },
    second: {
      multiplier: 30
    }
  },
  'Straight': {
    first: {
      multiplier: 1
    },
    second: {
      multiplier: 6
    }
  },
  'Flush': {
    first: {
      multiplier: 0
    },
    second: {
      multiplier: 4
    }
  },
  'Pair': {
    first: {
      multiplier: 0
    },
    second: {
      multiplier: 1
    }
  },
  'High Card': {
    first: {
      multiplier: 0
    },
    second: {
      multiplier: 0
    }
  }
};
