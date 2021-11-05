import React, { Component } from 'react';
import { API, CEF } from 'api';

import Question from './Question';

interface QuestionsProps {
  list: any[];
  num: number;
  confirm(ans: number, callback: Function): void;
}
interface QuestionsState {
  ans: number;
  isNew: boolean;
}

class Questions extends Component<QuestionsProps, QuestionsState> {
  constructor(props: QuestionsProps) {
    super(props);

    this.state = {
      ans: null,
      isNew: false,
    };
  }

  ansClick(ans: number) {
    this.setState({ ans, isNew: false });
  }

  render() {
    const i = this.props.num - 1;
    const list = this.props.list;
    return (
      <div>
        <section className="section-view autoschool-section-quiz">
          <div className="box-white box-autoschool posrev">
            <div className="autoschool-header">
              <div className="question-title">
                <span>
                  {i + 1} из {list.length}
                </span>
                {list[i].text}
              </div>
            </div>
            <div className="white-box-content">
              <div className="question-img">
                {list[i].img ? (
                  <img src={require(`./imgs/${list[i].img}.jpg`)} />
                ) : (
                  <img src={require('./imgs/question.png')} alt="" />
                )}
              </div>
              <Question
                ans={list[i].ans}
                isNew={this.state.isNew}
                ansClick={this.ansClick.bind(this)}
              />
            </div>
            <div className="white-box-content">
              <button
                className="primary-button go-quiz-end"
                onClick={() =>
                  this.props.confirm(this.state.ans, () =>
                    this.setState({ isNew: true, ans: null })
                  )
                }
              >
                <span>{i + 1 != list.length ? 'Далее' : 'Завершить'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Questions;
