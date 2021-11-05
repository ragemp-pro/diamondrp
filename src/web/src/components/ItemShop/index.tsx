import React, { Component } from 'react';

import { API } from '../../api';

import appleIcon from 'assets/images/svg/apple.svg';
import cartIcon from 'assets/images/svg/shopping-cart.svg';
import bottleIcon from './icons/product-1.png';

interface ItemShop {
  initEvent: RegisterResponse;
}

interface ItemShopState {
  active: number;
  name: string;
  sections: string[];
  items: { section_id: number; name: string; desc: string; price: number; icon: string }[];
}

interface SectionData {
  name: string;
  items: { name: string; desc: string; price: number; icon: string }[];
}

class ItemShop extends Component<any, ItemShopState> {
  constructor(props: any) {
    super(props);

    this.state = {
      active: 0,
      name: 'Premium Deluxe Shoper',
      sections: ['Продукты питания', 'Американское лото', '123'],
      items: [
        {
          section_id: 0,
          name: 'Вода',
          desc: 'Описание',
          price: 123,
          icon: 'product-1.png',
        },
        {
          section_id: 1,
          name: 'Билет',
          desc: 'Описание',
          price: 100,
          icon: 'product-1.png',
        },
      ],
    };


    this.initEvent = mp.events.register('cef:item_shop:init', (data: SectionData[]) => {
      const state = data.reduce((state, section, id) => {
        state.sections.push(section.name);
        const items = section.items.map((item) => ({ section_id: id, ...item }));
        state.items.push(...items);
        return state;
      }, { sections: [], items: [] });
      this.setState({ ...state });
    });
  }

  componentWillUnmount() {
    this.initEvent.destroy();
  }
  
  changeSection(id: number) {
    this.setState({ active: id });
  }

  buyItem(e: React.SyntheticEvent, itemName: string) {
    e.preventDefault();
    mp.events.triggerServer('server:item_shop:buy_item', itemName);
  }

  render() {
    const { active, name, sections, items } = this.state;
    return (
      <>
        <i className="shadow-overlay"></i>
        <div className="section-middle">
          <div className="grid-shop">
            <div className="shopname">{name}</div>
            <div className="shoplist">
              <ul>
                {sections.map((section, id) => (
                  <li
                    className={active == id ? 'active' : ''}
                    key={id}
                    onClick={() => this.changeSection(id)}
                  >
                    <a>
                      <span>
                        <img src={appleIcon} alt="" />
                      </span>
                      {section}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="shopcontent">
              <div>
                <div className="products-gridder">
                  {items
                    .filter((item) => item.section_id == active)
                    .map((item, id) => (
                      <div className="prod-item" key={id}>
                        <div className="prod-preview">
                          <span>${item.price}</span>
                          <img src={require(`./icons/${item.icon}`)} alt="" />
                        </div>
                        <div className="prod-cont">
                          <p>
                            <strong>{item.name}</strong>
                          </p>
                          <p>{item.desc}</p>
                          <button className="buy-but" onClick={(e) => this.buyItem(e, item.name)}>
                            <img src={cartIcon} alt="" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ItemShop;
