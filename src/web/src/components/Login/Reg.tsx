import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import { connect } from 'react-redux';
import $ from 'jquery';

import logo from './logo-login.png';

interface Reg {
  promocode: React.RefObject<HTMLInputElement>;
  email: React.RefObject<HTMLInputElement>;
  age: React.RefObject<HTMLInputElement>;
  password: React.RefObject<HTMLInputElement>;
  password2: React.RefObject<HTMLInputElement>;
  rp_name: React.RefObject<HTMLInputElement>;
  referrer: React.RefObject<HTMLInputElement>;
  updateEvent: RegisterResponse
}

class Reg extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      sended: false,
    }

    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.email = createRef();
    this.age = createRef();
    this.password = createRef();
    this.password2 = createRef();
    this.rp_name = createRef();
    this.promocode = createRef();
    this.referrer = createRef();

    this.updateEvent = mp.events.register('cef:register:updateSendStatus', () => {
      this.setState({ sended: false });
    });
  }

  componentDidMount() {
    $(document).on('keyup', this.handleKeyUp);
  }
  componentWillUnmount() {
    $(document).off('keyup', this.handleKeyUp);
    this.updateEvent.destroy();
  }

  handleKeyUp(e: JQuery.KeyUpEvent) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.handleClick(e);
    }
  }

  handleClick(e: any) {
    e.preventDefault();
    if (this.state.sended) return;
    let rp_name = this.rp_name.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let password = this.password.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let age = parseInt(this.age.current.value)
    let password2 = this.password2.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let email = this.email.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let promocode = this.promocode.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    let referrer = this.referrer.current.value
      .replace(/"/g, "'")
      .replace(/^\s\s*/, '')
      .replace(/\s\s*$/, '');
    if (!/^([A-Z][a-z]+ [A-Z][a-z]+)$/.test(rp_name))
      return CEF.alert.setAlert(
        'error',
        'Некорректное игровое имя. Пример РП никнейма: John Dow'
      );
    if(isNaN(age)) return CEF.alert.setAlert('error', 'В поле возраста допускается ввод только цифр');
    if(age < 16 || age > 90) return CEF.alert.setAlert('error', 'Допустимый возраст персонажа - 16-90 лет');
    if (password.length < 6)
      return CEF.alert.setAlert('error', 'Длина пароль должна быть не меньше 6 символов');
    if(password != password2){
      return CEF.alert.setAlert('error', 'Пароли не совпадают');
    }
    if (email !== '' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
      return CEF.alert.setAlert(
        'error',
        'Некорректный адрес электронной почты. Пример: admin@ren-play.ru'
      );
    mp.events.callServer('server:user:account:register', rp_name, password, email, referrer, promocode, age);
    this.setState({ sended: true });
  }

  render() {
    return (
      <section className="section-view reg-section">
        <div className="box-white box-login">
          <div className="login-header">
            <img src={logo} alt="" />
          </div>
          <div className="white-box-content posrev">
            <div className="title-wrap">
              <h2>Регистрация</h2>
              <p>
                <a href="#" className="hrefer go-login" onClick={() => CEF.gui.setGui('login')}>
                  Вернуться назад
                </a>
              </p>
            </div>
            <form>
              <div className="input-wrap">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-user"></span>
                </div>
                <input
                  type="text"
                  placeholder="Никнейм"
                  className="primary-input"
                  ref={this.rp_name}
                />
              </div>
              <div className="input-wrap">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-envelope"></span>
                </div>
                <input
                  type="text"
                  placeholder="Ваша почта"
                  className="primary-input"
                  ref={this.email}
                />
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
              <div className="input-wrap">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-lock"></span>
                </div>
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  className="primary-input"
                  ref={this.password2}
                />
              </div>
              <div className="input-wrap">
                <div className="icon-left">
                  <span className="glyphicon glyphicon-flag"></span>
                </div>
                <input
                  type="number"
                  placeholder="Возраст персонажа"
                  className="primary-input"
                  ref={this.age}
                />
              </div>
              <div className="input-wrap">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-user"></span>
                </div>
                <input
                  type="text"
                  placeholder="Кто пригласил"
                  className="primary-input"
                  ref={this.referrer}
                />
              </div>
              <div className="input-wrap mb30">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-user"></span>
                </div>
                <input
                  type="text"
                  placeholder="Промокод"
                  className="primary-input"
                  ref={this.promocode}
                />
              </div>
              <div className="button-center">
                <button type="submit" className="primary-button mb30" onClick={this.handleClick}>
                  <span>Создать</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state: any) => ({
  login: state.login,
});

export default connect(
  mapStateToProps,
  null
)(Reg);
