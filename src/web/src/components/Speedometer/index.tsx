import React, { PureComponent } from 'react';
import { API, CEF } from 'api';
import { connect } from 'react-redux';
// @ts-ignore
import ProgressBar from 'progressbar.js';

import speedometerImg from './imgs/speedometr.svg';
import arrowLeft from './imgs/arrow-left.svg';
import arrowRight from './imgs/arrow-right.svg';
import gasImg from './imgs/gas.svg';

interface Speedometer {
  speed: any;
  circle: HTMLElement;
  speedometer: HTMLElement;
}
interface SpeedometerProps {
  speedometer: boolean;
  showHud: boolean;
}
interface SpeedometerState {
  speed: number;
  fuel: number;
  engine: boolean;
  lock: boolean;
  lights: boolean;
}

class Speedometer extends PureComponent<SpeedometerProps, SpeedometerState> {
  constructor(props: SpeedometerProps) {
    super(props);

    this.state = {
      speed: 0,
      fuel: 0,
      engine: false,
      lock: false,
      lights: false,
    };

    CEF.speedometer.setSpeed = (speed: number) => {
      speed = speed < 0 ? 0 : speed > 400 ? 400 : speed;
      this.setState({ speed });
    };
    CEF.speedometer.setFuel = (fuel: number) => {
      // fuel = fuel < 0 ? 0 : fuel > 80 ? 80 : Math.round(fuel);
      fuel = Math.ceil(fuel);
      this.setState({ fuel });
    };
    CEF.speedometer.setEngine = (engine: boolean) => {
      this.setState({ engine });
    };

    mp.events.register('cef:speedometer:setEngine', CEF.speedometer.setEngine.bind(this));

    CEF.speedometer.setLockCar = (lock) => {
      this.setState({ lock });
    };

    mp.events.register('cef:speedometer:setLockCar', CEF.speedometer.setLockCar.bind(this));

    CEF.speedometer.setLights = (lights) => {
      this.setState({ lights });
    };
  }

  componentDidMount() {
    this.speed = new ProgressBar.Circle(this.circle, {
      strokeWidth: 6,
      duration: -1,
      color: '#00bff3',
      svgStyle: null,
    });
  }

  componentDidUpdate() {
    if (this.props.speedometer) {
      let speed = this.state.speed;
      if (speed > 80) {
        speed = 80 + ((this.state.speed - 80) / 2);
      }
      this.speed.animate(speed * 0.00283);
    } else {
      this.setState({
        speed: 0,
        fuel: 0,
        engine: false,
        lock: false,
        lights: false,
      });
    }
  }

  render() {
    return (
      <div
        className={`hud-speedometr-wrap ${this.props.speedometer ? 'on' : ''}`}
        ref={(el) => (this.speedometer = el)}
      >
        <div className="hud-speedometr" style={{ opacity: this.props.showHud ? 1 : 0 }}>
          <div id="speedometrcircle" ref={(el) => (this.circle = el)}></div>
          <img src={speedometerImg} className="speedometr" alt="" />
          <div className="speed-count">{Math.floor(this.state.speed)}</div>
          {/* <div className="arrows">
            <i className="arrow-left">
              <img src={arrowLeft} alt="" />
            </i>
            <i className="arrow-right">
              <img src={arrowRight} alt="" />
            </i>
          </div> */}
          {this.state.fuel != -1 ?
            <div className="hud-oil">
              <img src={gasImg} alt="" />
              <p>{this.state.fuel}L</p>
            </div>
          : ''}
          <div className="hud-sensor">
            <i className={this.state.engine ? 'engine on' : 'engine'}></i>
            <i className={this.state.lights && this.state.engine ? 'light on' : 'light'}></i>
            <i className={!this.state.lock ? 'doors on' : 'doors'}></i>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state: any) => ({
  speedometer: state.gui.speedometer,
  showHud: state.gui.showHud,
});
export default connect(
  mapStateToProps,
  null
)(Speedometer);
