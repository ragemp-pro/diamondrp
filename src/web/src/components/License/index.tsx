import React, { Component } from 'react';
import { CEF } from 'api';

import close from '../../../assets/images/svg/close.svg';
import carImg from '../../../assets/images/menu/car.svg';
import boatImg from '../../../assets/images/menu/boat.svg';
import flyImg from '../../../assets/images/menu/fly.svg';
import gunImg from '../../../assets/images/menu/gun.svg';
import lawImg from '../../../assets/images/menu/justice.svg';
import taxiImg from '../../../assets/images/menu/taxi.svg';
import bizImg from '../../../assets/images/menu/business.svg';
import fishImg from '../../../assets/images/menu/fish.svg';
import medImg from '../../../assets/images/menu/heart-care.svg';
import animalImg from '../../../assets/images/menu/hunter.svg';

interface LicenseState {
  name: string;
  a_lic: number;
  b_lic: number;
  c_lic: number;
  air_lic: number;
  ship_lic: number;
  gun_lic: number;
  taxi_lic: number;
  law_lic: number;
  med_lic: number;
  biz_lic: number;
  animal_lic: number;
  fish_lic: number;
}

class License extends Component<any, LicenseState> {
  constructor(props: any) {
    super(props);

    this.state = {
      name: '',
      a_lic: 0,
      b_lic: 0,
      c_lic: 0,
      air_lic: 0,
      ship_lic: 0,
      gun_lic: 0,
      taxi_lic: 0,
      law_lic: 0,
      med_lic: 0,
      biz_lic: 0,
      animal_lic: 0,
      fish_lic: 0,
    };

    const e = mp.events.register('cef:license:init', (data) => {
      this.setState({ ...data });
      e.destroy();
    });
  }

  componentDidMount() {
    CEF.gui.setCursor(true); 
  }

  render() {
    const {
      name,
      a_lic,
      b_lic,
      c_lic,
      air_lic,
      ship_lic,
      gun_lic,
      taxi_lic,
      law_lic,
      med_lic,
      biz_lic,
      animal_lic,
      fish_lic,
    } = this.state;
    return (
      <>
        <i className="dark-bottom"></i>
        <div className="section-middle-block">
          <div className="licenses-wrapper">
            <button className="closebutton" onClick={() => CEF.gui.setGui(null)}>
              <img src={close} alt="" />
            </button>
            <p className="lic-title">Лицензии {name}</p>
            <div className="lic-grid">
              <div>
                <img src={carImg} alt="" />
                <p>
                  Лицензии на
                  <br />
                  <strong>управление ТС</strong>
                </p>
                <ul className="lic-type">
                  <li className={a_lic ? 'on' : ''}>
                    A
                  </li>
                  <li className={b_lic ? 'on' : ''}>
                    B
                  </li>
                  <li className={c_lic ? 'on' : ''}>
                    C
                  </li>
                </ul>
                <br />
                {/* <ul>
                  <li className={car_lic[current_type] ? 'on' : ''}>
                    {car_lic[current_type] ? 'И' : 'Не и'}меется
                  </li>
                </ul> */}
                {/* <small style={{ opacity: car_lic[current_type] ? 1 : 0 }}>
                  Действительна
                  <br />
                  <span>{car_lic[current_type]} ч.</span>
                </small> */}
              </div>
              <div>
                <img src={flyImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>воздушный транспорт</strong>
                </p>
                <ul>
                  <li className={air_lic ? 'on' : ''}>{air_lic ? 'И' : 'Не и'}меется</li>
                </ul>
                {/* <small>
                  Действительна
                  <br />
                  <span>300 часов</span>
                </small> */}
              </div>
              <div>
                <img src={boatImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>водный транспорт</strong>
                </p>
                <ul>
                  <li className={ship_lic ? 'on' : ''}>{ship_lic ? 'И' : 'Не и'}меется</li>
                </ul>
                {/* <small>
                  Действительна
                  <br />
                  <span>300 часов</span>
                </small> */}
              </div>
              <div>
                <img src={gunImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>оружие</strong>
                </p>
                <ul>
                  <li className={gun_lic ? 'on' : ''}>{gun_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={taxiImg} alt="" />
                <p>
                  Лицензия
                  <br />
                  <strong>таксиста</strong>
                </p>
                <ul>
                  <li className={taxi_lic ? 'on' : ''}>{taxi_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={lawImg} alt="" />
                <p>
                  Лицензия
                  <br />
                  <strong>адвоката</strong>
                </p>
                <ul>
                  <li className={law_lic ? 'on' : ''}>{law_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={medImg} alt="" />
                <p>
                  Медицинская
                  <br />
                  <strong>страховка</strong>
                </p>
                <ul>
                  <li className={med_lic ? 'on' : ''}>{med_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={bizImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>бизнес</strong>
                </p>
                <ul>
                  <li className={biz_lic ? 'on' : ''}>{biz_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={animalImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>охоту</strong>
                </p>
                <ul>
                  <li className={animal_lic ? 'on' : ''}>{animal_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
              <div>
                <img src={fishImg} alt="" />
                <p>
                  Лицензия на
                  <br />
                  <strong>рыбалку</strong>
                </p>
                <ul>
                  <li className={fish_lic ? 'on' : ''}>{fish_lic ? 'И' : 'Не и'}меется</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default License;
