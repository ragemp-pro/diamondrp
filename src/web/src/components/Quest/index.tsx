import React, { Component } from 'react';
import { CEF } from 'api';
import $ from 'jquery';

import close from 'assets/images/svg/close.svg';
import success from 'assets/images/svg/success.svg';
import clock from 'assets/images/svg/clock-circular-outline.svg';

interface QuestState {
  active: number;
  activeCat: string;
  quests: { name: string; img: string; desc: string; rewards?: string[], complete:boolean; group?:string, progress?:string[] }[];
  cats:string[];
}

class Quest extends Component<any, QuestState> {
  constructor(props: any) {
    super(props);

    this.state = {
      active: 0,
      activeCat: null,
      quests: [],
      cats:[],
      
      // quests: [
      //   {
      //     name: 'Сделать что то',
      //     desc:
      //       'Задача организации, в особенности же укрепление и развитие структуры требуют определения и уточнения дальнейших направлений развития. Значимость этих проблем настолько очевидна, что сложившаяся структура организации требуют от нас анализа форм развития. Товарищи! постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет выполнять важные задания по разработке направлений прогрессивного развития',
      //     img: '',
      //     rewards: ['$1515165'],
      //     complete: false,
      //   },
      //   {
      //     name: 'Сделать что то 2',
      //     desc:
      //       'Задача организации, в направлений развития. Значимость этих проблем настолько очевидна, что сложившаяся структура организации требуют от нас анализа форм развития. Товарищи! постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет выполнять важные задания по разработке направлений прогрессивного развития',
      //     img: '',
      //     complete: true,
      //   },
      // ],
    };

    const eInit = mp.events.register('cef:quest:init', (quests) => {
      let cats:string[] = []
      // quests.forEach((item:any) => {
      //   if(item.group && cats.indexOf(item.group) == -1){
      //     cats.push(item.group);
      //   }
      // })
      quests.forEach((item:any, index:number) => {
        if(!item) quests.splice(index);
      })
      this.setState({ quests, cats });
      // if(cats.length > 0) this.setState({ active: 0, activeCat:cats[0] });
      eInit.destroy();
    });
  }

  change(active: number, activeCat:string) {
    // if (active == this.state.active) return;
    $('.info-content').fadeOut(200, () => {
      this.setState({ active, activeCat }, () => {
        $('.info-content').fadeIn(200);
      });
    });
  }

  render() {
    const { quests, active, cats, activeCat } = this.state;
    return (
      <>
        <i className="shadow-overlay"></i>
        <div className="section-middle">
          <div className="grid-shop" id="tabsShopper">
            <div className="shopname">
              Ваши
              <br />
              квесты
            </div>
            <div className="shoplist">
              <ul>
                {cats.map((name, id) => (
                  <li className={activeCat == name ? 'active' : ''} onClick={() => this.change(0, name)}>
                    <a>
                      <span>
                        <img alt=""/>
                      </span>
                      {name}
                    </a>
                  </li>
                ))}
                {quests.map((quest, id) => /*!quest.group ? */(
                  <li className={(active == id && activeCat == null) ? 'active' : ''} onClick={() => this.change(id, null)}>
                    <a style={{ background: quests[id].complete ? '#4579d6' : '' }}>
                      <span>
                        <img src={quests[id].complete ? success : clock} alt="" />
                      </span>
                      {quest.name}
                    </a>
                  </li>
                )/* : ''*/)}
              </ul>
            </div>
            <div className="shopcontent posrev">
              <i className="close">
                <img src={close} onClick={() => CEF.gui.setGui(null)} />
              </i>
              <div>
                <div className="info-content">
                  {quests[active] && activeCat == null ? (
                    <>
                      <h3>{quests[active].name} (<small style={{
                        color: quests[active].complete ? "#40b11e" : "#ff5858"
                      }}>{quests[active].complete ? "Выполнено" : "Выполняется"}</small>)</h3>
                      <p className="text-info mb30">{quests[active].desc}</p>
                      {quests[active].rewards ? (
                        <>
                          <h3>Получите при выполнении</h3>
                          <ul className="mb30">
                            {quests[active].rewards.map((reward) => (
                              <li>{reward}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        ''
                      )}
                      {quests[active].progress && !quests[active].complete ? (
                        <>
                          <h3>Прогресс выполнения</h3>
                          <ul className="mb30">
                            {quests[active].progress.map((progress) => (
                              <li>{progress}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    <>
                      {quests.map((quest, id) => quest.group == activeCat ? (
                        <>
                          <h3>{quest.name} (<small style={{
                            color: quest.complete ? "green" : "red"
                          }}>{quest.complete ? "Выполнено" : "Выполняется"}</small>)</h3>
                          <p className="text-info mb30">{quest.desc}</p>
                          {quest.rewards ? (
                            <>
                              <h3>Получите при выполнении</h3>
                              <ul className="mb30">
                                {quest.rewards.map((reward) => (
                                  <li>{reward}</li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            ''
                          )}
                          <hr/>
                        </>
                      ) : '')}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Quest;
