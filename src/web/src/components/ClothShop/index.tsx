import React, { Component } from 'react';

interface ClothItem {
  
}

export default class ClothShop extends Component<{ test?: boolean }, {
  name: string;
  selected?:number;
}> {
  constructor(props: any) {
    super(props);
    this.state = {
      name: "Test",
    }
  }
  selectCloth(id:number){

  }
  render() {
    return <>
      <div className="section-view">
        <i className="close"><img src="images/svg/close.svg" alt="" /></i>
        <div className="left-box-screen clothes">
          <div>
              <div className="left-box-title"><strong>{this.state.name}</strong><br />
              <p>For man &amp; for girl</p>
            </div>
            <label className="lbl-form"><strong>Футболки</strong></label>
          </div>
          <div className="left-box-enter-list clothes all">
            <div className="clothes-item go-back active"><img src={require('../../../assets/images/arrow-left.svg')} alt="" />Выход</div>
            <div className="clothes-list">
              <div className="clothes-item clth">
                <p>
                  Вещь один или два <span>$234</span>
                </p>
                <div className="b-line">
                  <div className="buttons-wrap">
                    <button><img src="images/svg/arrow-left.svg" alt="" /></button>
                    <button><img src="images/svg/arrow-right.svg" alt="" /></button>
                    <p>1 / 3</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="car-buy-box">
              <button className="primary-button large">Купить</button>
              <div>
                <p>стоимость</p>
                <p><strong>$200 100</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
  }
}
