import React, { Component } from 'react';

import Wrap from './Wrap';
import Sex from './Sex';
import Dropdown from './Dropdown';
import RgSlider from './RegulatorSlider';
import RgButton from './RegulatorButton';
import RgGroup from './RegulatorGroup';

import arrowRight from './images/svg/arrow-right-white.svg';

import personage from './config';
const {
  face,
  fathers,
  mothers,
  features,
  hair,
  hairColor,
  eyebrows,
  eyebrowsColor,
  eyeColor,
  freckles,
  frecklesColor,
  beard,
  beardColor,
  pomade,
  pomadeColor,
  blush,
  blushColor,
  makeup,
  makeupColor,
} = personage;

interface PersonageState {
  random: boolean;
  section: number;
  item: number;
  floor: number;
  face: [number, number];
  skin: number;
  heredity: number;
  features: number[];
  hair: number,
  hairColor: number,
  eyebrows: number,
  eyebrowsColor: number,
  eyeColor: number,
  freckles: number,
  frecklesColor: number,
  beard: number,
  beardColor: number,
  pomade: number,
  pomadeColor: number,
  blush: number,
  blushColor: number,
  makeup: number,
  makeupColor: number;
  focus: number;
  cam: string | null;
}

class Personage extends Component<any, PersonageState> {
  constructor(props: any) {
    super(props);

    this.state = {
      random: false,
      section: 0,
      item: 0,
      floor: 0,
      face: [0, 0],
      skin: 0.5,
      heredity: 0.5,
      features: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      hair: 0,
      hairColor: 0,
      eyebrows: 0,
      eyebrowsColor: 0,
      eyeColor: 0,
      freckles: 0,
      frecklesColor: 0,
      beard: 0,
      beardColor: 0,
      pomade: 0,
      pomadeColor: 0,
      blush: 0,
      blushColor: 0,
      makeup: 0,
      makeupColor: 0,
      focus: 0,
      cam: null,
    };
  }

  setItem(item: number) {
    this.setState({ item });
  }

  setFloor(floor: number) {
    mp.trigger('client:user:personage:eventManager', 'floor', floor);
    this.setState({
      floor,
      hair: 0,
      hairColor: 0,
      eyebrows: 0,
      eyebrowsColor: 0,
      eyeColor: 0,
      freckles: 0,
      frecklesColor: 0,
      beard: 0,
      beardColor: 0,
      pomade: 0,
      pomadeColor: 0,
      blush: 0,
      blushColor: 0,
      makeup: 0,
      makeupColor: 0,
    });
  }

  setParent(id: number) {
    this.setState((state) => {
      state.face[state.item] = id;
      mp.trigger(
        'client:user:personage:eventManager',
        state.item ? 'mother' : 'father',
        face[state.item][id]
      );
      return {
        ...state,
      };
    });
  }

  setHeredity(heredity: number) {
    this.setState(() => {
      mp.trigger('client:user:personage:eventManager', 'heredity', heredity);
      return {
        heredity,
      };
    });
  }

  setSkin(skin: number) {
    this.setState(() => {
      mp.trigger('client:user:personage:eventManager', 'skin', skin);
      return {
        skin,
      };
    });
  }

  setAppearance(type: string, value: number) {
    mp.trigger('client:user:personage:eventManager', type, value);
  }

  setFeatures(value: number) {
    this.setState((state) => {
      state.features[state.item] = value;
      mp.trigger('client:user:personage:eventManager', 'features', JSON.stringify(state.features));
      return {
        ...state
      };
    });
  }

  confirm(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    mp.trigger('client:user:personage:eventManager', 'save');
  }

  random(e: React.SyntheticEvent<any>) {
    e.preventDefault();
    this.setState({ random: true }, () => {
      this.setState({ random: false });
    });
  }

  setCam(type: string, value: number) {
    mp.trigger('client:user:personage:eventManager', type, value);
  }

  render() {
    return (
      <>
        <div className="personage-shadow-overlay-create"></div>
        <div className="rotate-box">
          <RgSlider
            title="Поворот камеры"
            range={[0, 360]}
            handler={(value) => this.setCam('rotate', value)}
          />
          <RgSlider
            title="Дальность камеры"
            range={[0, 1]}
            handler={(value) => this.setCam('depth', value)}
          />
          <RgSlider
            title="Высота камеры"
            range={[-0.7, 0.7]}
            handler={(value) => this.setCam('height', value)}
          />
        </div>
        <p className="title-create"><span className="glyphicons glyphicons-parents"></span><br />Создание персонажа</p>
        <button className="primary-button create-this" onClick={this.confirm.bind(this)}>
          <span>
            Создать <img src={arrowRight} alt="" />
          </span>
        </button>
        <Wrap>
          <button className="random-buttom personage" onClick={this.random.bind(this)}>
            Случайно
          </button>
          <Sex setFloor={this.setFloor.bind(this)} />
          <Dropdown title="Наследственность">
            <RgButton
              title="Отец"
              count={face[0].length}
              names={fathers}
              random={this.state.random}
              handler={(key) => {
                this.setItem(0);
                this.setParent(key);
              }}
            />
            <RgButton
              title="Мать"
              count={face[1].length}
              names={mothers}
              random={this.state.random}
              handler={(key) => {
                this.setItem(1);
                this.setParent(key);
              }}
            />
            <div className="parent-preview">
              <img src={require(`./images/parents/female_${this.state.face[1]}.png`)} alt="" />
              <img src={require(`./images/parents/male_${this.state.face[0]}.png`)} alt="" />
            </div>
            <RgSlider
              title="Цвет кожи"
              range={[0, 1]}
              random={this.state.random}
              handler={this.setSkin.bind(this)}
            />
            <RgSlider
              title="Сходство"
              range={[0, 1]}
              random={this.state.random}
              handler={this.setHeredity.bind(this)}
            />
          </Dropdown>
          <Dropdown title="Внешность">
            <RgGroup>
              <RgButton
                title="Прическа"
                count={hair[this.state.floor].length}
                random={this.state.random}
                handler={(value) => this.setAppearance('hair', hair[this.state.floor][value])}
                in
                large
              />
              <RgButton
                title="Цвет волос"
                count={hairColor}
                random={this.state.random}
                handler={(value) => this.setAppearance('hairColor', value)}
                in
              />
            </RgGroup>
            <RgGroup>
              <RgButton
                title="Брови"
                count={eyebrows}
                random={this.state.random}
                handler={(value) => this.setAppearance('eyebrows', value)}
                in
                large
              />
              <RgButton
                title="Цвет бровей"
                count={eyebrowsColor}
                random={this.state.random}
                handler={(value) => this.setAppearance('eyebrowsColor', value)}
                in
              />
            </RgGroup>
            <RgButton
              title="Глаза"
              count={eyeColor}
              random={this.state.random}
              handler={(value) => this.setAppearance('eyeColor', value)}
            />
            <RgButton
              title="Веснушки"
              count={freckles}
              random={this.state.random}
              handler={(value) => this.setAppearance('freckles', value)}
            />
            {!this.state.floor ? <RgGroup>
              <RgButton
                title="Борода"
                count={beard}
                random={this.state.random}
                handler={(value) => this.setAppearance('beard', value)}
                in
                large
              />
              <RgButton
                title="Цвет бороды"
                count={beardColor}
                random={this.state.random}
                handler={(value) => this.setAppearance('beardColor', value)}
                in
              />
            </RgGroup> : ''}
          </Dropdown>
          <Dropdown title="Характеристики">
            <RgGroup>
              {features.map((i, id) => (
                <RgSlider
                  key={id}
                  title={i}
                  range={[-0.5, 0.5]}
                  random={this.state.random}
                  handler={(value) => {
                    this.setItem(id), this.setFeatures(value);
                  }}
                  features
                  in
                />
              ))}
            </RgGroup>
          </Dropdown>
        </Wrap>
      </>
    );
  }
}

export default Personage;
