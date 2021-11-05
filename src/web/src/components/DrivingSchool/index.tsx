import React, { Component } from 'react';
import Intro from './Intro';
import Outro from './Outro';
import Questions from './Questions';
import list from './list';

import close from './imgs/close.svg';

interface DrivingSchoolState {
  page: number;
  question: number;
  miss: number;
}
/** Максимально допустимое количество ошибок */
export const maxMiss = 5;

export class DrivingSchool extends Component<any, DrivingSchoolState> {
  constructor(props: any) {
    super(props);

    this.state = {
      page: 0,
      question: 1,
      miss: 0,
    };
  }

  go() {
    this.setState({ page: 1 });
  }

  confirm(ans: number, callback: Function) {
    if (ans) {
      this.setState((prev: DrivingSchoolState) => {
        const state: any = {
          question: prev.question + 1,
          newQuestion: true,
        };
        if (ans != list[this.state.question - 1].correct) {
          state.miss = prev.miss + 1;
        }
        if (state.question > list.length) {
          return { miss: prev.miss, page: 2 };
        } else {
          return { ...state };
        }
      });
      callback();
    }
  }

  render() {
    return (
      <div className="autoschool">
        <i className="shadow-overlay"></i>
        {this.state.page == 0 ? (
          <Intro go={this.go.bind(this)} />
        ) : this.state.page == 1 ? (
          <Questions list={list} num={this.state.question} confirm={this.confirm.bind(this)} />
        ) : (
          <Outro miss={this.state.miss} />
        )}
      </div>
    );
  }
}

export default DrivingSchool;
