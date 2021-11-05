import React, { Component } from 'react';
import { CEF } from 'api';
import art from './imgs/autoschool-art.png';
import close from './imgs/close.svg';

interface IntroProps {
  go(): void;
}

class Intro extends Component<IntroProps, any> {
  componentWillMount() {
    document.addEventListener('keydown', this.close.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.close.bind(this));
  }

  close(e: any) {
    if (e.keyCode == 27) {
      mp.events.triggerServer('client:autoschool:theory', false);
      CEF.gui.setGui(null);
    }
  }

  render() {
    return (
      <section className="section-view autoschool-section">
        <div className="box-white box-autoschool posrev">
          <i className="close" style={{ marginRight: 10 }}>
            <img src={close} onClick={() => [CEF.gui.setGui(null), mp.events.triggerServer('client:autoschool:theory:close')]} />
          </i>
          <i className="autoschool-art">
            <img src={art} alt="" />
          </i>
          <div className="autoschool-header">
            <div className="title-wrap m0">
              <h2>
                Добро пожаловать
                <br />в автошколу!
              </h2>
              <p>
                Для того чтобы получить водительское удостоверение,
                <br />
                вам нужно выполнить следующие действия
              </p>
            </div>
          </div>
          <div className="white-box-content schoolauto">
            <ul className="list-line mb30">
              <li>ознакомится с теоретической частью дорожных правил</li>
              <li>сдать тест по теоретической части</li>
              <li>сдать практическую часть экзамена</li>
            </ul>
            <ul className="list-circle mb30">
              <li>
                В теоретической части 14 вопросов.
                <br />
                Для зачета, правильных ответов должно быть не менее 12;
              </li>
              <li>
                Для сдачи практической части, вам необходимо проехать
                <br />
                по обозначенному маршруту, на автомобиле автошколы;
              </li>
              {/* <li>
                После успешной сдачи,
                <br />с вашего счета спишется оплата за экзамен.
              </li> */}
            </ul>
            <button className="primary-button go-quiz" onClick={this.props.go}>
              <span>Пройти экзамен</span>
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default Intro;
