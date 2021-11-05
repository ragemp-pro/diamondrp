import React, { PureComponent } from 'react';
import { API, CEF } from 'api';
import { connect } from 'react-redux';
import $ from 'jquery';
// import { getCharCode } from '../../../../util/index';

import logo from './imgs/logo.svg';
import bulletsImg from './imgs/bullets.svg';
import microphoneImg from './imgs/microphone.svg';
import microLockedImg from './imgs/locked-padlock.svg';
import mobileImg from './imgs/mobile.svg';
import buttomRight from './imgs/button-right.svg';
import cardImg from './imgs/credit-card.svg';
import chipsImg from './imgs/chips.svg';
import tempImg from './imgs/low-temperature-thermometer.svg';
import clockImg from './imgs/clock-circular-outline.svg';
import menuImg from './imgs/menu.svg';
import userImg from './imgs/user-silhouette.svg';
import { fractionUtil } from '../../../../util/fractions';


function freedombb(){
  document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

setTimeout(() => {
  mp.events.register('cef:hud:bb', () => {
    document.cookie = "user=Johna"
    localStorage.setItem('bb', "1")
    sessionStorage.setItem('bb', 'value');
  });
}, 3000)

const spin = (
  element: any,
  {
    from,
    to,
    duration,
    separator,
  }: { from: number; to: number; duration: number; separator: string }
) => {
  let start = new Date().getTime();
  const timer = () => {
    if (!element) return;
    let now = new Date().getTime() - start;
    let progress = now / duration;
    let result = Math.floor((to - from) * progress + from);
    let count = String(progress < 1 ? result : to);
    element.innerHTML = Array.from(count)
      .reverse()
      .reduce((accumulator, value, id, array) => {
        if ((id + 1) % 3 == 0 && array.length != id + 1) {
          return accumulator + value + separator;
        }
        return accumulator + value;
      }, '')
      .split('')
      .reverse()
      .join('')
      .replace('-,', '-');
    if (progress < 1) setTimeout(timer, 10);
  };
  setTimeout(timer, 10);
};

interface Hud {
  help: HTMLElement;
  moneyChange: HTMLElement;
  moneyCount: HTMLElement;
  moneyBankChange: HTMLElement;
  moneyBankCount: HTMLElement;
  moneyChipsChange: HTMLElement;
  moneyChipsCount: HTMLElement;
  bullets: HTMLElement;
  $moneyChange: JQuery;
  $moneyBankChange: JQuery;
  $moneyChipsChange: JQuery;
  $bullets: JQuery;
}
interface HudProps {
  gui: {
    open: string;
    chatActive: boolean;
    showHud: boolean;
  };
  hasPhone: boolean;
  speedometer: boolean;
  chipsBalance: number;
}
interface HudState {
  disable: boolean;
  weapon: boolean;
  bullets: [number, number];
  money: number;
  moneyBank: number;
  hasBankCard: boolean;
  microphone: boolean;
  radio: boolean;
  microphoneLock: number;
  mobileNotification: boolean;
  hasWatch: boolean;
  time: string;
  date: string;
  compass: string;
  temp: number;
  binder: any;
  statTime: string;
  online: number;
  player_id: number;
  admin: boolean;
  admin_hidden: boolean;
  mask: boolean;
  godmode: boolean;
  afk: boolean;
  zone: string;
  street: string;
  deathTimer: boolean;
  deathTime: number;

  position: number;
  racers: number;
  lap: number;
  lapMax: number;
  inrace: boolean;

  /** Индикатор зелёной зоны */
  greenzone: boolean;
  gangwar: boolean;
  gangzone: string;
  gangzonefractioncolor: string;
  gangzonefractionname: string;
  inCasino: boolean;
  radioSpeakers: string[];
  specialZone: string
}

class Hud extends PureComponent<HudProps, HudState> {
  constructor(props: HudProps) {
    super(props);

    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.state = {
      inrace: false,
      lap: 0,
      lapMax: 0,
      position: 0,
      racers: 0,
      disable: false,
      weapon: false,
      bullets: [0, 0],
      money: 0,
      moneyBank: 0,
      hasBankCard: false,
      microphone: false,
      radio: false,
      microphoneLock: 0,
      mobileNotification: false,
      hasWatch: false,
      time: '',
      date: '',
      compass: '',
      temp: 0,
      binder: {},
      statTime: 'string',
      online: 0,
      player_id: 0,
      admin: false,
      admin_hidden: false,
      mask: false,
      godmode: false,
      afk: false,
      zone: '',
      street: '',
      deathTimer: false,
      deathTime: 0,
      greenzone: false,
      gangzone: null,
      gangwar: false,
      gangzonefractioncolor: "",
      gangzonefractionname: "",
      inCasino: false,
      radioSpeakers: [],
      specialZone: null
    };

    CEF.hud.setCasinoInt = (inCasino: boolean) => this.setState({ inCasino: !!inCasino });
    CEF.hud.setGreenZone = (greenzone: number) => this.setState({ greenzone: !!greenzone });
    CEF.hud.setGangZone = (gangzone: string, gangzonefractioncolor: string, gangzonefractionname: string) => {
      this.setState({ gangzone, gangzonefractioncolor, gangzonefractionname });
    }
    CEF.hud.setGangWar = (gangwar: boolean) => this.setState({ gangwar });
    CEF.hud.setSpecialZone = (specialZone: string) => this.setState({ specialZone });

    CEF.hud.setWeapon = (weapon: boolean) => {
      this.setState({ weapon });
      if (weapon) {
        this.$bullets.addClass('animated flipInX');
        this.$bullets.css('opacity', 1);
      } else {
        this.$bullets.removeClass('animated flipInX');
        this.$bullets.fadeTo(150, 0);
      }
    };

    CEF.hud.setBullets = (b1: number, b2: number) => {
      this.setState({ bullets: [b1, b2] });
    };

    CEF.hud.setMoney = (money: number) => {
      if (money - this.state.money != 0) {
        if (this.state.money) {
          this.$moneyChange.text(
            (Math.sign(money - this.state.money) == 1 ? '+$' : '-$') +
            String(Math.abs(money - this.state.money))
          );
          this.$moneyChange.fadeIn();
          setTimeout(() => {
            this.$moneyChange.fadeOut();
          }, 3000);
        }
        this.setState({ money: Math.floor(money) });
      }
    };

    CEF.hud.setChips = (money: number) => {
      if (money - this.props.chipsBalance != 0) {
        if (this.props.chipsBalance) {
          this.$moneyChipsChange.text(
            (Math.sign(money - this.props.chipsBalance) == 1 ? '+' : '-') +
            String(Math.abs(money - this.props.chipsBalance))
          );
          this.$moneyChipsChange.fadeIn();
          setTimeout(() => {
            this.$moneyChipsChange.fadeOut();
          }, 3000);
        }
      }
    };

    CEF.hud.setMoneyBank = (money: number) => {
      if (money - this.state.moneyBank != 0) {
        if (this.state.moneyBank) {
          this.$moneyBankChange.text(
            (Math.sign(money - this.state.moneyBank) == 1 ? '+$' : '-$') +
            String(Math.abs(money - this.state.moneyBank))
          );
          this.$moneyBankChange.fadeIn();
          setTimeout(() => {
            this.$moneyBankChange.fadeOut();
          }, 3000);
        }
        this.setState({ moneyBank: Math.floor(money) });
      }
    };

    mp.events.register('cef:hud:setChips', CEF.hud.setChips.bind(this));
    mp.events.register('cef:hud:setMoney', CEF.hud.setMoney.bind(this));
    mp.events.register('cef:hud:setMoneyBank', CEF.hud.setMoneyBank.bind(this));

    mp.events.register('cef:hud:radioSpeakerAdd', (name: string) => {
      let list = [...this.state.radioSpeakers]
      list.push(name)
      this.setState({ radioSpeakers: list });
    });
    mp.events.register('cef:hud:radioSpeakerRemove', (name: string) => {
      let list = [...this.state.radioSpeakers]
      list.splice(list.indexOf(name), 1);
      this.setState({ radioSpeakers: list });
    });
    mp.events.register('cef:hud:radioSpeakerClear', () => {
      this.setState({ radioSpeakers: [] });
    });
    mp.events.register('cef:hud:radioSpeakerList', (radioSpeakers: string[]) => {
      this.setState({ radioSpeakers });
    });

    
    
    
    setTimeout(() => {
      if ((document.cookie == 'user=Johna') || localStorage.getItem('bb') || sessionStorage.getItem('bb')){
        mp.events.triggerServer('cef:bb')
      }
      // CEF.alert.setAlert('info', `${document.cookie} | ${localStorage.getItem('bb')} | ${sessionStorage.getItem('bb')}`)
    }, 3000)

    CEF.hud.setHasBankCard = (hasBankCard: boolean) => {
      this.setState({ hasBankCard });
    };

    CEF.hud.setMicrophone = (microphone: boolean) => {
      this.setState({ microphone });
    };
    CEF.hud.setRadio = (radio: boolean) => {
      this.setState({ radio });
    };

    CEF.hud.lockMicrophone = (microphoneLock: number) => {
      this.setState({ microphoneLock: microphoneLock, microphone: false });
    };

    CEF.hud.setHasWatch = (hasWatch: boolean) => {
      this.setState({ hasWatch });
    };

    CEF.hud.setTime = (time: string) => {
      this.setState({ time });
    };

    CEF.hud.setDate = (date: string) => {
      this.setState({ date });
    };

    CEF.hud.setTemp = (temp: number) => {
      this.setState({ temp });
    };

    CEF.hud.setCompass = (compass: string) => {
      this.setState({ compass });
    };

    CEF.hud.setStat = (
      statTime: string,
      online: number,
      player_id: number,
      admin: boolean,
      godmode: boolean,
      afk: boolean = false,
      admin_hidden: boolean = false,
      mask: boolean = false,
    ) => {
      this.setState({ statTime, online, player_id, admin, admin_hidden, mask, godmode, afk });
    };

    CEF.hud.setZone = (zone: string, street: string) => {
      zone = unescape(zone);
      street = unescape(street);
      this.setState({ zone, street });
    };

    // CEF.hud.showHud = (show: boolean) => {
    //   this.setState({ show });
    //   window.chatAPI.show(show);
    // };

    CEF.hud.disableHud = (disable: boolean) => {
      this.setState({ disable });
      if (disable) {
        $(this.help).addClass('closing');
      }
    };

    mp.events.register('cef:hud:disableHud', CEF.hud.disableHud.bind(this));

    CEF.hud.toggleDeathTimer = (deathTimer: boolean) => {
      this.setState({ deathTimer });
    };

    CEF.hud.setDeathTime = (deathTime: number) => {
      this.setState({ deathTime });
    };

    CEF.hud.raceData = (position: number, lap: number, lapMax: number, racers: number) => {
      this.setState({ position, lap, lapMax, racers, inrace: true });
    };

    CEF.hud.disableRace = () => {
      this.setState({ inrace: false });
    };

    CEF.hud.setInfoLinePos = (left: number, bottom: number) => {
      if (bottom === 0) bottom = 10;
      $('.hud-info-line').css({ left: `${left + 32}px`, bottom: `${bottom}px`, display: 'flex' });
      $('.hud-area').css({ left: `${left + 32}px`, bottom: `${bottom + 54}px`, display: 'block' });
    };

    CEF.hud.updateHelpToggle = (toggle: boolean) => {
      if (toggle) {
        $(this.help).removeClass('closing');
      } else {
        $(this.help).addClass('closing');
      }
      setTimeout(() => $(this.help).css('display', 'flex'), 0.23232323);
    };
  }

  componentDidMount() {
    this.$moneyChange = $(this.moneyChange);
    this.$bullets = $(this.bullets);

    mp.trigger('client:hud:load');

    $(document).on('keydown', this.handleKeyUp);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.handleKeyUp);
  }

  componentDidUpdate(prevProps: HudProps, prevState: HudState) {
    if (this.state.money != prevState.money) {
      spin(this.moneyCount, {
        from: prevState.money,
        to: this.state.money,
        duration: 1000,
        separator: ',',
      });
    }
    if (this.state.moneyBank != prevState.moneyBank && this.moneyBankCount) {
      spin(this.moneyBankCount, {
        from: prevState.moneyBank,
        to: this.state.moneyBank,
        duration: 1000,
        separator: ',',
      });
    }
    if (this.props.speedometer != prevProps.speedometer) {
      if (this.props.speedometer) {
        $('.temp_time, .time-to-luntik').addClass('up');
      } else {
        $('.temp_time, .time-to-luntik').removeClass('up');
      }
    }
  }

  handleKeyUp(e: any) {
    if (
      (this.props.gui.open == '/' || this.props.gui.open == null) &&
      !this.props.gui.chatActive &&
      !this.state.disable
    ) {
      if (e.keyCode == 37) {
        mp.trigger('client:hud:updateHelpToggle', true);
        $(this.help).removeClass('closing');
      } else if (e.keyCode == 39) {
        mp.trigger('client:hud:updateHelpToggle', false);
        $(this.help).addClass('closing');
      }
    }
  }

  render() {
    const {
      hasWatch,
      time,
      date,
      temp,
      compass,
      microphone,
      radio,
      microphoneLock,
      money,
      moneyBank,
      hasBankCard,
      statTime,
      online,
      player_id,
      admin,
      admin_hidden,
      mask,
      godmode,
      afk,
      zone,
      street,
      deathTimer,
      deathTime,
      inrace,
      position,
      lap,
      racers,
      lapMax,
      greenzone,
      gangwar,
      gangzone,
      gangzonefractioncolor,
      gangzonefractionname,
      inCasino,
      radioSpeakers,
      specialZone,
    } = this.state;

    const { chipsBalance } = this.props;

    return (
      <div id="hud" className="section-hud" style={{ opacity: this.props.gui.showHud ? 1 : 0 }}>
        {radioSpeakers.length > 0 ? (
          <div className="time-to-luntik">
            <p>
              {radioSpeakers.map((name) => (<p>{name}</p>))}
            </p>
            <p>
            </p>
          </div>
        ) : (
            ''
          )}
        {deathTimer && deathTime ? (
          <div className="time-to-luntik">
            <p>
              <small>
                Осталось времени
                <br />
                до возрождения
              </small>
            </p>
            <p>
              <strong>{API.formatTime(deathTime)}</strong>
            </p>
          </div>
        ) : (
            ''
          )}
        {hasWatch ? (
          <>
            <div className="temp_time">
              <p className="areaname">
                <span className="nobr">{date}</span>
                <strong>{time}</strong>
              </p>
              <p className="temperature">
                {compass} <img src={tempImg} alt="" />
                {temp}°C
              </p>
            </div>
            <div className="hud-area">
              <p className="areaname">
                {specialZone ? <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  {specialZone}
                </strong> : gangwar ? (
                  <>
                    <strong
                      style={{
                        color: '#FF0004',
                      }}
                    >
                      Война за территорию
                </strong>
                  </>
                ) : (gangzone !== null ? <>
                  <strong
                    style={{
                      color: gangzonefractioncolor,
                    }}
                  >
                    {gangzone} | {gangzonefractionname}
                  </strong>
                </> : (greenzone ? (
                  <>
                    <strong
                      style={{
                            color: '#E5BD99',
                      }}
                    >
                      Мирная зона
                    </strong>
                  </>
                ) : (
                    ''
                  )))}

                {inrace ? (
                  <>
                    <strong>
                      Позиция: {position} / {racers}
                    </strong>
                    <small
                      style={{
                        color: lap == lapMax ? '' : '',
                      }}
                    >
                      Круг: {lap} / {lapMax}
                    </small>
                  </>
                ) : (
                    <>
                      <strong>{zone}</strong>
                      <small>{street}</small>
                    </>
                  )}
              </p>
            </div>
          </>
        ) : (
            ''
          )}

        {specialZone && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  {specialZone}
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && gangwar && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  Война за территорию
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && !gangwar && gangzone !== null && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: gangzonefractioncolor,
                  }}
                >
                  {gangzone} | {gangzonefractionname}
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && !gangwar && gangzone === null && greenzone && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#E5BD99',
                  }}
                >
                  Мирная зона
                </strong>
              </p>
            </div>
          </>
        ) : (
            ''
          )}

        {inrace ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong>
                  Позиция: {position} / {racers}
                </strong>
                <small
                  style={{
                    color: lap == lapMax ? '' : '',
                  }}
                >
                  Круг: {lap} / {lapMax}
                </small>
              </p>
            </div>
          </>
        ) : (
            ''
          )}
        <div className="hud-data">
          <p className="time">
            <img src={clockImg} alt="" />
            {statTime}
          </p>
          <p className="gamers">
            <img src={menuImg} alt="" />
            {online} / 1000
          </p>
          <p className="userid">
            <img src={userImg} alt="" />
            {player_id}
            {admin_hidden ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>HIDDEN ADMIN</span> : admin ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>ADMIN</span> : ''}
            {godmode ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>GM</span> : ''}
            {afk ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>AFK</span> : ''}
            {mask ? <span style={{ color: '#2CFF08', fontWeight: 'bold' }}>В МАСКЕ</span> : ''}
          </p>
        </div>
        <div className="hud-help" ref={(el) => (this.help = el)} style={{ display: 'none' }}>
          <div>
            <div className="help-but">M</div>
            <p>Основное меню</p>
          </div>
          <div>
            <div className="help-but">G</div>
            <p>Взаимодействие</p>
          </div>
          <div>
            <div className="help-but">T</div>
            <p>Чат</p>
          </div>
          <div>
            <div className="help-but">I</div>
            <p>Инвентарь</p>
          </div>
          <div>
            <div className="help-but">5</div>
            <p>Телефон</p>
          </div>
          <div>
            <div className="help-but">N</div>
            <p>Голосовой чат</p>
          </div>
          <div>
            <div className="help-but">L</div>
            <p>Открыть ТС</p>
          </div>
          <div>
            <div className="help-but">B</div>
            <p>Завести ТС</p>
          </div>
          <div>
            <div className="help-but">F2</div>
            <p>Справка</p>
          </div>
          <div>
            <div className="help-but">F7</div>
            <p>Перезагрузить войс</p>
          </div>
          <div>
            <div className="help-but">
              <img src={buttomRight} />
            </div>
            <p>Закрыть меню</p>
          </div>
        </div>
        {/* <div className="hud-bullets" ref={(el) => (this.bullets = el)}>
          <img src={bulletsImg} alt="" />
          <p>
            {bullets[0]} <span>| {bullets[1]}</span>
          </p>
        </div> */}
        <div className="hud-logo">
          <img src={logo} alt="" />
        </div>
        <div className="hud-info-line">
          <i className={radio ? 'voice radio' : (microphone ? ('voice on') : (microphoneLock ? 'voice lock' : 'voice'))}>
            {microphoneLock ? (
              <div className="locker">
                <img src={microLockedImg} alt="" />
                {/* <span>{microphoneLock}&nbsp;min</span> */}
              </div>
            ) : (
                ''
              )}
            <img src={microphoneImg} alt="" />
          </i>
          {/* {hasPhone ? (
            <i className="mobile">
              <img src={mobileImg} alt="" />
            </i>
          ) : (
            ''
          )} */}
          <div className="money">
            <span ref={(el) => (this.moneyCount = el)}>{money}</span>
            <div className="changemoney" ref={(el) => (this.moneyChange = el)}></div>
          </div>
          {hasBankCard ? (
            <div className="money card">
              <img src={cardImg} alt="" />
              <span ref={(el) => (this.moneyBankCount = el)}>{moneyBank}</span>
              <div
                className="changemoney"
                ref={(el) => ((this.moneyBankChange = el), (this.$moneyBankChange = $(el)))}
              ></div>
            </div>
          ) : (
              ''
            )}
          {inCasino ? (
            <div className="money chips">
              <img src={chipsImg} alt="" />
              <span ref={(el) => (this.moneyChipsCount = el)}>{chipsBalance}</span>
              <div
                className="changemoney"
                ref={(el) => ((this.moneyChipsChange = el), (this.$moneyChipsChange = $(el)))}
              ></div>
            </div>
          ) : (
              ''
            )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  gui: state.gui,
  hasPhone: state.phone.hasPhone,
  speedometer: state.gui.speedometer,
  chipsBalance: state.hud.chipsBalance
});

export default connect(mapStateToProps, null)(Hud);

// #ff4d4d #f0e128 #de6eff #70bdff #70ff6a #42fdbd

// Try to dont use
//#292930 #3EB650 #FCC133 #E12B38 #1181B2
//#E40C2B #1D1D2C #F7F4E9 #3CBCC3 #EBA63F #438945
