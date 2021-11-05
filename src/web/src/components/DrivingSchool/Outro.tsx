import React, { Component } from 'react';
import { CEF } from 'api';
import art from './imgs/autoschool-art-end.png';
import close from './imgs/close.svg';
import { maxMiss } from '.';

interface OutroProps {
  miss: number;
}

class Outro extends Component<OutroProps, any> {
  constructor(props: OutroProps) {
    super(props);
    console.log(this.props);
  }

  goOut() {
    CEF.gui.setGui(null);
    mp.events.triggerServer('client:autoschool:theory', false);
  }

  goPractise() {
    CEF.gui.setGui(null);
    mp.events.triggerServer('client:autoschool:theory', true);
  }

  render() {
    return (
      <section className="section-view autoschool-section-success">
        <div className="box-white box-autoschool posrev">
          <i className="close" style={{ marginRight: 50 }}>
            <img src={close} onClick={() => {
              CEF.gui.setGui(null)
              if(this.props.miss <= 5){
                mp.events.triggerServer('client:autoschool:theory:close');
              }
              }} />
          </i>
          <i className="autoschool-art-end">
            <img src={art} alt="" />
          </i>
          <div className="autoschool-header">
            <div className="question-title">
              Вы {this.props.miss > maxMiss ? 'не' : ''} сдали экзамен на права!
            </div>
          </div>
          <div className="white-box-content">
            {this.props.miss > maxMiss ? (
              <p>
                К сожалению, совершили более 5 ошибок.
                <br />
                Вы сможете повторить попытку только через 5 минут
              </p>
            ) : (
              <p>
                Поздравляем вас,
                <br />
                Вы прошли теорию
              </p>
            )}
          </div>
          <div className="white-box-content">
            <button
              className="primary-button go-quiz-end"
              onClick={() => (this.props.miss > maxMiss ? this.goOut() : this.goPractise())}
            >
              <span>{this.props.miss > maxMiss ? 'ОК' : 'Перейти к практике'}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default Outro;
