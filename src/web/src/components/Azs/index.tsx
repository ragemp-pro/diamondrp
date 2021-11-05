import React, { Component, createRef } from 'react';
import { CEF } from '../../api';
import Select from 'react-select';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

import Loading from '../Loading';

import icon from '../../../assets/images/gasoline.svg';

interface Azs {
  slider: React.RefObject<HTMLDivElement>;
  handle: React.RefObject<HTMLDivElement>;
  $slider: JQuery<HTMLDivElement>;
  $handle: JQuery<HTMLDivElement>;
  initEvent: RegisterResponse;
}

interface AzsState {
  init: boolean;
  active: number;

  number: number; // номер АЗС
  cars: [string, string][]; // список машин [название, номер][]
  currentTank: number[]; // текущее кол-во литров
  fullTank: number[]; // максимальное кол-во литров
  toFill: number[]; // состояние ползунка для заправки (в литрах)
  perLiter: number; // цена за литр (определяется у АЗС)
}

class Azs extends Component<any, AzsState> {
  constructor(props: any) {
    super(props);

    // тестовые данные, заменятся после эвента
    this.state = {
      init: false,
      active: 0,
      number: 1,
      cars: [],
      currentTank: [],
      fullTank: [],
      toFill: [],
      perLiter: 11,
    };

    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.slider = createRef();
    this.handle = createRef();

    this.initEvent = mp.events.register(
      'cef:azs:init',
      (cars, number, fullTank, currentTank, perLiter) => {
        this.setState(
          {
            number,
            cars,
            currentTank,
            fullTank,
            perLiter,
            toFill: new Array(cars.length).fill(0),
            init: true,
          },
          () => {
            this.setState(
              (state) => {
                state.toFill[state.active] =
                  state.fullTank[state.active] - state.currentTank[state.active];
                return { ...state };
              },
              () => {
                const { active, toFill } = this.state;

                this.$handle = $(this.handle.current);
                this.$slider = $(this.slider.current);
                //@ts-ignore
                this.$slider.slider({
                  value: Math.floor(toFill[active]),
                  orientation: 'horizontal',
                  range: 'min',
                  step: 1,
                  min: 1,
                  max: Math.floor(toFill[active]),
                  animate: true,
                  create: () => {
                    this.$handle.text('+' + Math.floor(toFill[active]) + 'L');
                  },
                  slide: (_: any, { value }: { value: number }) => {
                    this.setState((state) => {
                      state.toFill[active] = value;
                      return { ...state };
                    });
                    this.$handle.text('+' + Math.floor(value) + 'L');
                  },
                });
              }
            );
          }
        );
      }
    );
  }

  componentDidMount() {
    $(document).on('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    this.initEvent.destroy();
    $(document).off('keyup', this.handleKeyUp);
  }

  handleKeyUp(e: JQuery.KeyUpEvent) {
    e.preventDefault();
    if (e.keyCode == 13) {
      this.fill();
    }
  }

  changeCar(select: any) {
    this.setState(
      (state) => {
        state.toFill[select.id] = state.fullTank[select.id] - state.currentTank[select.id];
        return {
          ...state,
          active: select.id,
        };
      },
      () => {
        const { active, toFill } = this.state;

        //@ts-ignore
        this.$slider.slider({
          value: Math.floor(toFill[active]),
          orientation: 'horizontal',
          range: 'min',
          step: 1,
          min: 1,
          max: Math.floor(toFill[active]),
          animate: true,
          slide: (_: any, { value }: { value: number }) => {
            this.setState((state) => {
              state.toFill[active] = value;
              return { ...state };
            });
            this.$handle.text('+' + Math.floor(value) + 'L');
          },
        });
        this.$handle.text('+' + Math.floor(toFill[active]) + 'L');
      }
    );
  }

  fill() {
    const { active, cars, toFill, number, perLiter } = this.state;
    if (cars.length) {
      mp.events.triggerServer('server:azs:fill', cars[active][1], toFill[active], number, perLiter);
    }
  }

  buyCanister() {
    const { number, perLiter } = this.state;
    mp.events.triggerServer('server:azs:buyCanister', number, perLiter);
  }

  close() {
    CEF.gui.setGui(null);
  }

  render() {
    const selectOptions = this.state.cars.map((item, id) => {
      return { value: item[1], label: `${item[0]} [${item[1]}]`, id };
    });
    const { active, number, currentTank, fullTank, toFill, perLiter, cars } = this.state;
    return (
      <>
        {/* <i className="dark-bottom" style={{ marginTop: -30 }}>
          <span className="icon">
            <img src={icon} alt="" />
          </span>
        </i> */}
        <div className="section-middle-block azs">
          <div
            className="white-block w320"
            style={{
              maxHeight: this.state.init ? 571.4 : 0,
              minHeight: !this.state.init ? 253.6 : 'none',
            }}
          >
            {this.state.init ? (
              <>
                <div className="title-wrap text-center">
                  <h3>АЗС №{number}</h3>
                </div>
                {cars.length ? (
                  <>
                    <div className="input-wrap mb30">
                      <Select
                        name="WantedReasons"
                        onChange={this.changeCar.bind(this)}
                        options={selectOptions}
                        value={selectOptions[active]}
                        isSearchable={false}
                        placeholder="Выберите машину"
                        styles={{
                          control: (base: any) => ({
                            ...base,
                            minHeight: 50,
                            minWidth: 225,
                            backgroundColor: '#ebf1f6',
                            boxShadow: 'inset 0px 0px 0px 2px rgba(220, 228, 235, 0.97)',
                          }),
                        }}
                      />
                    </div>
                    <div className="grid-1-1 mb20">
                      <div className="info-item">
                        <p>
                          <small>Стоимость</small>
                        </p>
                        <p>
                          <strong>${Math.floor(toFill[active] * perLiter)}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="grid-1-1 mb20">
                      <div className="info-item">
                        <p>
                          <small>Состояние</small>
                        </p>
                        <p>
                          <strong>
                            {Math.floor(currentTank[active])} / {fullTank[active]} L
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="info-item mb20">
                      <p>
                        <small>Заправить</small>
                      </p>
                      <p>
                        <strong>
                          {Math.floor(currentTank[active] + toFill[active])} / {fullTank[active]} L
                        </strong>
                      </p>
                      <div id="gasoline" className="regulator-in" ref={this.slider}>
                        <div
                          id="custom-handle"
                          className="ui-slider-handle"
                          ref={this.handle}
                        ></div>
                      </div>
                    </div>
                    <button className="primary-button wide mb10" onClick={this.fill.bind(this)}>
                      <span>Заправить</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-center">На заправке нет ТС</p>
                    <br />
                  </>
                )}
                <button className="primary-button wide mb10" onClick={this.buyCanister.bind(this)}>
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                    Купить канистру
                    <br />
                    (10 L)
                  </span>
                </button>
                <button className="primary-button wide clear" onClick={this.close}>
                  <span>Отменить</span>
                </button>
              </>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </>
    );
  }
}

export default Azs;
