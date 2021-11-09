var data = {
  fatherIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43, 44],
  motherIds: [
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    45,
  ],
  father: [
    'Бенджамин',
    'Бенджамин',
    'Джоуи',
    'Ной',
    'Андре',
    'Джоан',
    'Алекс',
    'Исаак',
    'Эвон',
    'Итон',
    'Винсент',
    'Анжел',
    'Диего',
    'Адриан',
    'Габриель',
    'Майкл',
    'Сантьяго',
    'Кевин',
    'Луис',
    'Самюэль',
    'Энтони',
    'Клайд',
    'Нико',
    'Джон',
  ],
  mother: [
    'Ханна',
    'Обри',
    'Жасмин',
    'Жизель',
    'Амелия',
    'Изабелла',
    'Зои',
    'Ава',
    'Камилла',
    'Вайолет',
    'София',
    'Эйлин',
    'Николь',
    'Эшли',
    'Грейс',
    'Брианна',
    'Натали',
    'Оливия',
    'Элизабет',
    'Кэтрин',
    'Эмма',
    'Мисти',
  ],
  eyebrowsMale: [
    'None',
    'Balanced',
    'Fashion',
    'Cleopatra',
    'Quizzical',
    'Femme',
    'Seductive',
    'Pinched',
    'Chola',
    'Triomphe',
    'Carefree',
    'Curvaceous',
    'Rodent',
    'Double Tram',
    'Thin',
    'Penciled',
    'Mother Plucker',
    'Straight and Narrow',
    'Natural',
    'Fuzzy',
    'Unkempt',
    'Caterpillar',
    'Regular',
    'Mediterranean',
    'Groomed',
    'Bushels',
    'Feathered',
    'Prickly',
    'Monobrow',
    'Winged',
    'Triple Tram',
    'Arched Tram',
    'Cutouts',
    'Fade Away',
    'Solo Tram',
  ],
  eyebrowsFemale: [
    'None',
    'Balanced',
    'Fashion',
    'Cleopatra',
    'Quizzical',
    'Femme',
    'Seductive',
    'Pinched',
    'Chola',
    'Triomphe',
    'Carefree',
    'Curvaceous',
    'Rodent',
    'Double Tram',
    'Thin',
    'Penciled',
    'Mother Plucker',
    'Straight and Narrow',
    'Natural',
    'Fuzzy',
    'Unkempt',
    'Caterpillar',
    'Regular',
    'Mediterranean',
    'Groomed',
    'Bushels',
    'Feathered',
    'Prickly',
    'Monobrow',
    'Winged',
    'Triple Tram',
    'Arched Tram',
    'Cutouts',
    'Fade Away',
    'Solo Tram',
  ],
  beard: [
    'None',
    'Light Stubble',
    'Balbo',
    'Circle Beard',
    'Goatee',
    'Chin',
    'Chin Fuzz',
    'Pencil Chin Strap',
    'Scruffy',
    'Musketeer',
    'Mustache',
    'Trimmed Beard',
    'Stubble',
    'Thin Circle Beard',
    'Horseshoe',
    "Pencil and 'Chops",
    'Chin Strap Beard',
    'Balbo and Sideburns',
    'Mutton Chops',
    'Scruffy Beard',
    'Curly',
    'Curly & Deep Stranger',
    'Handlebar',
    'Faustic',
    'Otto & Patch',
    'Otto & Full Stranger',
    'Light Franz',
    'The Hampstead',
    'The Ambrose',
    'Lincoln Curtain',
  ],
  hairMale: [
    'Close Shave',
    'Buzzcut',
    'Faux Hawk',
    'Hipster',
    'Side Parting',
    'Shorter Cut',
    'Biker',
    'Ponytail',
    'Cornrows',
    'Slicked',
    'Short Brushed',
  ],
  hairFemale: [
    'Close Shave',
    'Short',
    'Layered Bob',
    'Pigtails',
    'Ponytail',
    'Braided Mohawk',
    'Braids',
    'Bob',
    'Faux Hawk',
    'French Twist',
    'Long Bob',
  ],
  hairColorListItem: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
  ],
  eyeColor: [
    'Green',
    'Emerald',
    'Light Blue',
    'Ocean Blue',
    'Light Brown',
    'Dark Brown',
    'Hazel',
    'Dark Gray',
    'Light Gray',
    'Pink',
    'Yellow',
    'Purple',
  ],
  hairListItem: Array.apply(null, { length: 37 }).map(Number.call, Number), //
  eyeColorListItem: Array.apply(null, { length: 32 }).map(Number.call, Number), //
  overlayListItem: Array.apply(null, { length: 30 }).map(Number.call, Number), //
  eyeBrowsListItem: Array.apply(null, { length: 31 }).map(Number.call, Number), //
  eyeBrowsColorListItem: Array.apply(null, { length: 64 }).map(Number.call, Number),
  overlayColorListItem: Array.apply(null, { length: 64 }).map(Number.call, Number),
  overlay9ListItem: Array.apply(null, { length: 10 }).map(Number.call, Number),
  overlay9ColorListItem: Array.apply(null, { length: 5 }).map(Number.call, Number),
  overlay8ListItem: Array.apply(null, { length: 10 }).map(Number.call, Number), // Узнать
  overlay8ColorListItem: Array.apply(null, { length: 60 }).map(Number.call, Number),
  overlay5ListItem: Array.apply(null, { length: 7 }).map(Number.call, Number),
  overlay5ColorListItem: Array.apply(null, { length: 60 }).map(Number.call, Number),
  overlay4ListItem: Array.apply(null, { length: 10 }).map(Number.call, Number), // Узнать
  specificationsValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  specifications: {
    eyebrowHeight: 6,
    eyebrowDepth: 7,
    noseWidth: 0,
    noseHeight: 1,
    noseTipLength: 2,
    noseTipHeight: 4,
    noseDepth: 3,
    noseBroke: 5,
    cheekboneHeight: 8,
    cheekboneWidth: 9,
    cheekDepth: 10, // неточно
    eyeScale: 11,
    lipThickness: 12,
    jawWidth: 13,
    jawShape: 14,
    chinHeight: 15,
    chinDepth: 17,
    chinWidth: 16,
    chinIndent: 18,
    neck: 19,
  },
};

Vue.component('list', {
  template:
    '<div v-bind:id="id" class="appearance">\
    <i @click="left" class="left"></i>\
    <div>{{ values[index] }}</div>\
    <i @click="right" class="right"></i></div>',
  props: ['id', 'num'],
  data: function() {
    return {
      index: 0,
      values: this.num
        ? [
            -1,
            -0.1,
            -0.2,
            -0.3,
            -0.4,
            -0.5,
            -0.6,
            -0.7,
            -0.8,
            -0.9,
            0,
            0.1,
            0.2,
            0.3,
            0.4,
            0.5,
            0.6,
            0.7,
            0.8,
            0.9,
            1,
          ]
        : data[this.id],
    };
  },
  methods: {
    right() {
      this.index++;
      if (this.index == this.values.length) this.index = 0;
      this.send();
    },
    left() {
      this.index--;
      if (this.index < 0) this.index = this.values.length - 1;
      this.send();
    },
    send() {
      let id = this.id;
      var value = this.num ? this.values[this.index] : this.index;
      if (id == 'father') value = data.fatherIds[this.index];
      else if (id == 'mother') value = data.motherIds[this.index];
      //console.log("send", id, value)
      mp.trigger('client:user:creator:eventManager', id, Number(value));
    },
  },
});

var editor = new Vue({
  el: '.characterEditor',
  data: {
    active: true,
    gender: true,
    isAppearance: false,
  },
  methods: {
    genderChange(type) {
      if (type) {
        this.gender = true;
        //console.log(this.gender)
        mp.trigger('client:user:creator:eventManager', 'sexItem', 0);
      } else {
        this.gender = false;
        //console.log(this.gender)
        mp.trigger('client:user:creator:eventManager', 'sexItem', 1);
      }
    },
    saveCharacter() {
      mp.trigger('client:user:creator:eventManager', 'doneBtn');
    },
    random() {
      mp.trigger('client:user:creator:eventManager', 'random');
    },
  },
});

$(document).on('input', 'input[type="range"]', function(event) {
  let id = event.target.id;
  let val = Number(event.target.value);
  //console.log('editorList:'+id+':'+val);
  $('output#' + id).html(val);
  if (event.target.name == 'specifications') {
    data.specificationsValues[data.specifications[id]] = val;
    id = 'specifications';
    val = JSON.stringify(data.specificationsValues);
  }
  //console.log("input range", id, val)
  mp.trigger('client:user:creator:eventManager', id, val);
});

$('input[type=range]').rangeslider({
  polyfill: false,
});

$('#genderMale').on('click', function() {
  $('#genderFemale').removeClass('active');
  $('#genderMale').addClass('active');
  editor.genderChange(true);
});
$('#genderFemale').on('click', function() {
  $('#genderMale').removeClass('active');
  $('#genderFemale').addClass('active');
  editor.genderChange(false);
});

$(function() {
  $(document).on('input', '.camera input[type="range"]', function(e) {
    let id = e.target.id;
    let val = e.target.value;
    $('output#' + id).html(val);
    mp.trigger('client:user:creator:eventManager', id, Number(val));
  });
});
