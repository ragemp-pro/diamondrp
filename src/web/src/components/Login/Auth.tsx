import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import Select from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setLoginData, setLogged } from '../../actions/login';

import logo from './logo-login.png';
import arrowRight from 'assets/images/svg/arrow-right.svg';
import arrowLeft from 'assets/images/svg/arrow-left.svg';

interface Auth {
  name: React.RefObject<HTMLInputElement>;
  password: React.RefObject<HTMLInputElement>;
  updateEvent: RegisterResponse;
}

interface AuthProps {
  setLogged(logged: boolean): any;
  setLoginData(names: string[], spawnPos: any[]): any
  names: string[];
  spawnPos: any[];
}

interface AuthState {
  active: number;
  currentSpawnPos: any;
  sended: boolean;
  inputted: boolean;
  focus: boolean;
}

class Auth extends Component<AuthProps, AuthState> {
  constructor(props: AuthProps) {
    super(props);
    this.state = {
      active: 0,
      currentSpawnPos: null,
      sended: false,
      inputted: false,
      focus: false,
    };

    this.handleKeyUp = this.handleKeyUp.bind(this);

    mp.events.register('cef:login:setData', (data) => {
      const names = data.map((player: any) => player.name);
      const spawnPos = data.map((player: any) => {
        return player.spawnPos.map((item: any) => ({
          value: item.slice(1),
          label: item[0],
        }));
      });
      this.setState({ currentSpawnPos: spawnPos[0][0] });
      this.props.setLoginData(names, spawnPos);
      this.name.current.value = this.props.names[this.state.active] || '';
    });

    const loggedEvent = mp.events.register('cef:login:setLogged', (logged: boolean) => {
      this.props.setLogged(logged);
      loggedEvent.destroy();
    });

    this.name = createRef();
    this.password = createRef();

    this.updateEvent = mp.events.register('cef:login:updateSendStatus', () => {
      this.setState({ sended: false });
    });
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp);
    if (this.props.spawnPos.length) {
      this.setState({ currentSpawnPos: this.props.spawnPos[0][0] });
    }
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
    this.updateEvent.destroy();
  }

  handleKeyUp(e: any) {
    e.preventDefault();
    if (e.keyCode == 13) {
      this.handleClick(e);
    }
    if (e.keyCode == 39) {
      this.changePlayer(1);
    }
    if (e.keyCode == 37) {
      this.changePlayer(-1);
    }
  }

  handleClick(e: React.SyntheticEvent<MouseEvent>) {
    e.preventDefault();
    // if (!this.props.names.length) {
    //   CEF.alert.setAlert('info', 'У вас нет аккаунтов, зарегестрируйтесь');
    //   return CEF.gui.setGui('reg');
    // }
    if (!this.name.current.value) {
      CEF.alert.setAlert('warning', 'Введите никнейм');
      return;
    }
    let name = this.name.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let password = this.password.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    if (!password) return CEF.alert.setAlert('warning', 'Введите пароль');
    const spawnPos = this.state.currentSpawnPos ? this.state.currentSpawnPos.value : null;
    mp.events.triggerServer('server:user:account:validate', name, password, spawnPos);
    this.setState({ sended: true });
  }

  changeSpawn(select: any) {
    this.setState({ currentSpawnPos: select });
    mp.events.triggerClient('client:auth:change_spawn', select.value);
  }

  changePlayer(modifer: number) {
    if (this.state.focus) return;
    if (!this.props.names.length) return;
    if (this.state.active + 1 == this.props.names.length && modifer == 1) {
      modifer = 1 - this.props.names.length;
    } else if (this.state.active == 0 && modifer == -1) {
      modifer = this.props.names.length - 1;
    }
    this.setState((state: AuthState) => ({
      active: state.active + modifer,
      currentSpawnPos: this.props.spawnPos[state.active + modifer][0],
      inputted: false,
    }), () => (this.name.current.value = this.props.names[this.state.active]));
  }

  inputPlayer(e: React.SyntheticEvent<InputEvent>) {
    e.preventDefault();
    this.setState({ inputted: true });
  }

  render() {
    return (
      <section className="section-view login-section">
        <div className="box-white box-login">
          <div className="login-header">
            <img src={logo} alt="" />
          </div>
          <div className="white-box-content posrev">
            <div className="title-wrap">
              <h2>Авторизация</h2>
              <p>
                Нет аккаунта?
                <a href="#" className="hrefer go-reg" onClick={() => CEF.gui.setGui('reg')}>
                  Создайте его
                </a>
              </p>
            </div>
            <div className="input-wrap posrev">
              <img src={arrowLeft} alt="" className="login-arrow-left" onClick={() => this.changePlayer(-1)} />
              <div className="icon-left">
                <span className="glyphicons glyphicons-user"></span>
              </div>
              <input
                type="text"
                placeholder="Ваш никнейм"
                className="primary-input"
                ref={this.name}
                onChange={this.inputPlayer.bind(this)}
                onFocus={() => this.setState({ focus: true })}
                onBlur={() => this.setState({ focus: false })}
              />
              <img src={arrowRight} alt="" className="login-arrow-right" onClick={() => this.changePlayer(1)} />
            </div>
            <div className="input-wrap">
              <div className="icon-left">
                <span className="glyphicons glyphicons-lock"></span>
              </div>
              <input
                type="password"
                placeholder="Пароль"
                className="primary-input"
                ref={this.password}
              />
            </div>
            <div className="input-wrap mb30">
              <Select
                name="WantedReasons"
                onChange={this.changeSpawn.bind(this)}
                options={!this.state.inputted ? this.props.spawnPos[this.state.active] : []}
                value={!this.state.inputted ? this.state.currentSpawnPos : null}
                isSearchable={false}
                in
                placeholder="Выберите место спавна"
                styles={{
                  control: (base: any) => ({
                    ...base,
                    minHeight: 50,
                    minWidth: 265,
                    backgroundColor: '#ebf1f6',
                    boxShadow: 'inset 0px 0px 0px 2px rgba(220, 228, 235, 0.97)',
                  }),
                }}
              />
            </div>
            <div className="button-center">
              <button className="primary-button mb30 log-in" onClick={this.handleClick.bind(this)}>
                <span>Войти</span>
              </button>
              {/* <p className="button-desc">
                Забыли пароль?
                <br />
                <a href="#" className="hrefer go-newpass" onClick={() => CEF.gui.setGui('newpass')}>
                  Восстановить аккаунт
                </a>
              </p> */}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state: any) => ({
  login: state.login,
  names: state.login.names,
  spawnPos: state.login.spawnPos,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      setLoginData,
      setLogged,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
