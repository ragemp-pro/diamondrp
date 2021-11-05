import React, { Component } from 'react';
import { API, CEF } from 'api';

import logo from './logo-login.png';

class Newpass extends Component {
  render() {
    return (
      <section className="section-view newpass-section">
        <div className="box-white box-login">
          <div className="login-header">
            <img src={logo} alt="" />
          </div>
          <div className="white-box-content">
            <div className="title-wrap">
              <h2>Восстановление</h2>
              <p>
                <a
                  href="#"
                  className="hrefer go-login"
                  onClick={() => {
                    CEF.gui.setGui('login');
                  }}
                >
                  Вернуться назад
                </a>
              </p>
            </div>
            <form>
              <div className="input-wrap mb30">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-envelope"></span>
                </div>
                <input type="text" placeholder="Ваша почта" className="primary-input" />
              </div>
              <div className="button-center">
                <button
                  type="submit"
                  className="primary-button mb30"
                  onClick={() => {
                    CEF.gui.setGui('login');
                  }}
                >
                  <span>Восстановить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }
}

export default Newpass;
