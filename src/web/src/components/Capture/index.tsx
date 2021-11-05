import React, { Component } from 'react';
import { CEF } from 'api';
import { formatTime } from '../../../../util/methods';

interface MafiaState {
  show: boolean;
  time: number;
  lcn: number;
  trd: number;
  rm: number;
  lme: number;
}

class Mafia extends Component<any, MafiaState> {
  constructor(props: any) {
    super(props);

    this.state = {
      show: false,
      time: 0,
      lcn: 0,
      trd: 0,
      rm: 0,
      lme: 0,
    };

    CEF.capture.showMafiaInfo = (show: boolean) => {
      this.setState({ show });
    };

    CEF.capture.updateMafiaInfo = (
      time: number,
      lcn: number,
      trd: number,
      rm: number,
      lme: number
    ) => {
      this.setState({ time, lcn, trd, rm, lme });
    };
  }

  render() {
    const { show, time, lcn, trd, rm, lme } = this.state;
    return (
      <>
        {show ? (
          <ul className="mafia_war">
            <li>
              <div>
                Осталось времени: <span>{formatTime(time)}</span>
              </div>
            </li>
            <li>
              <div>
                La Cosa Nostra: <span>{lcn}</span> очков
              </div>
            </li>
            <li>
              <div>
                Yakuza: <span>{trd}</span> очков
              </div>
            </li>
            <li>
              <div>
                Русская Мафия: <span>{rm}</span> очков
              </div>
            </li>
            <li>
              <div>
                La eMe: <span>{lme}</span> очков
              </div>
            </li>
          </ul>
        ) : (
          ''
        )}
      </>
    );
  }
}

interface GangState {
  show: boolean;
  time: number;
  top1: number;
  top2: number;
}

class Gang extends Component<any, GangState> {
  constructor(props: any) {
    super(props);

    this.state = {
      show: false,
      time: 0,
      top1: 0,
      top2: 0,
    };

    CEF.capture.showGangInfo = (show: boolean) => {
      this.setState({ show });
    };

    CEF.capture.updateGangInfo = (
      time: number,
      top1: number,
      top2: number
    ) => {
      this.setState({ time, top1, top2 });
    };
  }

  render() {
    const { show, time, top1, top2 } = this.state;
    return (
      <>
        {show ? (
          <ul className="gang_war">
            <li>
              <div>
                Осталось времени: <span>{formatTime(time)}</span>
              </div>
            </li>
            <li>
              <div>
                Атака: <span>{top1}</span> очков
              </div>
            </li>
            <li>
              <div>
                Оборона: <span>{top2}</span> очков
              </div>
            </li>
          </ul>
        ) : (
          ''
        )}
      </>
    );
  }
}

export { Gang, Mafia };
