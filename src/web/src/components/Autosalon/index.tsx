import React, { Component } from 'react';
import { API, CEF } from 'api';

import close from 'assets/images/svg/close.svg';
import fuel from 'assets/images/svg/fuel.svg';
import stock from 'assets/images/svg/stock.svg';

// '#44b223',
// '#416a34',
// '#346a47',
// '#346a51',
// '#3a346a',
// '#21a7c7',
// '#295cbe',
// '#cc3f6b',
// '#f73535',
// '#cc963f',
// '#c7cc3f',
// '#070606',
// '#ffffff',

interface AutosalonState {
  type: string;
  selectedCar: number;
  selectedColor: number;
  selectPause: boolean;
  cars: CarData[];
  colors: any[];
  allowTestDrive: boolean;
}

interface CarData {
  id: number;
  model: string;
  name: string;
  stock: number;
  fuel: number;
  price: number;
}

class Autosalon extends Component<any, AutosalonState> {
  constructor(props: any) {
    super(props);

    this.state = {
      type: '',
      selectedCar: 0,
      selectedColor: 0,
      selectPause: false,
      cars: [],
      colors: [],
      allowTestDrive: false,
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);

    CEF.buycar.setType = (type: string) => {
      this.setState({ type });
    };
    CEF.buycar.allowTestDrive = () => {
      this.setState({ allowTestDrive: true });
    };

    CEF.buycar.setCars = (cars: any) => {
      cars = JSON.parse(cars);
      this.setState({ cars });
    };
    CEF.buycar.setCar = (id: number) => {
      this.setState({ selectedCar:id });
    };

    CEF.buycar.setColors = (colors: any) => {
      colors = JSON.parse(colors);
      this.setState({ colors: colors });
    };
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e: any) {
    if (e.keyCode == 83 || e.keyCode == 40) {
      if (this.state.selectPause) return;
      this.setState(
        (prev: AutosalonState) => {
          let selected = prev.selectedCar + 1;
          if (selected < 0) selected = this.state.cars.length - 1;
          if (selected > this.state.cars.length - 1) selected = 0;
          this.selectCar(selected);
          return {
            selectedCar: selected,
          };
        },
        () =>
          document
            .querySelector('.left-box-enter-list div.active')
            .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      );
    } else if (e.keyCode == 87 || e.keyCode == 38) {
      if (this.state.selectPause) return;
      this.setState(
        (prev) => {
          let selected = prev.selectedCar - 1;
          if (selected < 0) selected = this.state.cars.length - 1;
          if (selected > this.state.cars.length - 1) selected = 0;
          this.selectCar(selected);
          return {
            selectedCar: selected,
          };
        },
        () =>
          document
            .querySelector('.left-box-enter-list div.active')
            .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      );
    } else if (e.keyCode == 68 || e.keyCode == 39) {
      if (!this.state.colors.length) return;
      this.setState(
        (prev) => {
          let selected = prev.selectedColor + 1;
          if (selected < 0) selected = this.state.colors.length - 1;
          if (selected > this.state.colors.length - 1) selected = 0;
          this.selectColor(selected);
          return {
            selectedColor: selected,
          };
        },
        () =>
          document
            .querySelector('.color-selection div.active')
            .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      );
    } else if (e.keyCode == 65 || e.keyCode == 37) {
      if (!this.state.colors.length) return;
      this.setState(
        (prev) => {
          let selected = prev.selectedColor - 1;
          if (selected < 0) selected = this.state.colors.length - 1;
          if (selected > this.state.colors.length - 1) selected = 0;
          this.selectColor(selected);
          return {
            selectedColor: selected,
          };
        },
        () =>
          document
            .querySelector('.color-selection div.active')
            .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      );
    } else if (e.keyCode == 13) {
      this.buyCar();
    } else if (e.keyCode == 27) {
      this.closeBuying();
    }
  }

  selectCar(id: number) {
    if (this.state.selectPause) return;
    mp.trigger('client:autosalon:changeCar', id);
    this.setState({ selectedCar: id, selectPause: true });
    setTimeout(() => this.setState({ selectPause: false }), 500);
  }

  selectColor(id: number) {
    mp.trigger('client:autosalon:changeColor', id);
    this.setState({ selectedColor: id });
  }

  closeBuying() {
    mp.events.triggerServer('server:autosalon:stopBuyCar');
    CEF.gui.setGui(null);
  }

  buyCar() {
    if (this.state.type == 'buy') {
      mp.trigger(
        'client:autosalon:buyCar',
        this.state.cars[this.state.selectedCar].id,
        this.state.selectedColor
      );
    } else if (this.state.type == 'rent') {
      mp.trigger(
        'client:autosalon:rentCar',
        this.state.cars[this.state.selectedCar].id,
        this.state.selectedColor
      );
    }
    this.closeBuying();
  }

  testDrive(){
    mp.trigger('client:autosalon:testDrive');
  }

  render() {
    return (
      <div id="autosalon">
        <i className="close" onClick={() => this.closeBuying()}>
          <img src={close} alt="" />
        </i>
        <i className="shadow-overlay-autosalon"></i>
        <div className="section-view">
          <div className="left-box-screen-autosalon">
            <div>
              <div className="left-box-title">
                <strong>Купить ТС</strong>
              </div>
              <label className="lbl-form">Выберите авто</label>
            </div>
            <div className="left-box-enter-list">
              {this.state.cars.map((i, id) => (
                <div
                  className={id == this.state.selectedCar ? 'active' : ''}
                  onClick={() => this.selectCar(id)}
                >
                  {i.name}
                </div>
              ))}
            </div>
          </div>
          <div className="car-info-box">
            <p className="car-name">
              {this.state.cars[this.state.selectedCar]
                ? this.state.cars[this.state.selectedCar].name
                : ''}
            </p>
            <p className="car-class mb30">
              {/* <span className="gold">premium</span> */}
              <img src={fuel} alt="" />
              {this.state.cars[this.state.selectedCar] ? (
                <>{this.state.cars[this.state.selectedCar].fuel} L</>
              ) : (
                ''
              )}
              {this.state.cars[this.state.selectedCar] && this.state.cars[this.state.selectedCar].stock ? <>
                <img src={stock} alt="" />
                {Math.floor(this.state.cars[this.state.selectedCar].stock / 1000)} КГ
              </> : <></>}
            </p>
            <label htmlFor="" className="lbl-form">
              Выберите цвет
            </label>
            <div className="color-selection">
              {this.state.colors.map((item, id) => (
                <div
                  style={{ background: item }}
                  className={id == this.state.selectedColor ? 'active' : ''}
                  onClick={() => this.selectColor(id)}
                ></div>
              ))}
            </div>
          </div>
          <div className="car-buy-box">
            <div>
              <p>стоимость</p>
              <p>
                <strong>
                  $
                  {this.state.cars[this.state.selectedCar]
                    ? this.state.cars[this.state.selectedCar].price
                    : ''}
                </strong>
              </p>
            </div>
            <button className="btn btn-success btn-lg" onClick={() => this.buyCar()}>
              {this.state.type == 'rent' ? 'Арендовать' : 'Купить'}
            </button>
            {this.state.allowTestDrive ? <button className="btn btn-info btn-lg" onClick={() => this.testDrive()}>
              Тест-драйв
            </button> : <></>}
            
          </div>
        </div>
      </div>
    );
  }
}

export default Autosalon;
