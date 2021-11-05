import React, { Component } from 'react';
import { CEF } from 'api';
import { MenuItemBase, MenuInterface } from '../../../../util/menu';
// import rpc from 'rage-rpc';





import arrowRight from '../Personage/images/svg/arrow-right-pers.svg';
import arrowLeft from '../Personage/images/svg/arrow-left-pers.svg';
import { gtaStrToHtml } from '../../../../util/string';

const sizeUl = window.innerHeight > 1300 ? 394 : 294;

// TODO добавть desc
class Menu extends Component<any, MenuInterface> {
  constructor(props: any) {
    super(props);

    if(this.props.test){
      this.state = {
        id: 0,
        open: true,
        select: 0,
        title: '',
        subtitle: "asgasgasgsgsdgsdgsgsgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfgdsdgsdg",
        items: [
          { name: "qwe \"1\"", icon:"Item_1"},
          { name: "qwe 1", icon: "Item_2"},
          { name: "qwe 1", icon: "Item_3"},
          { name: "qwe 1", icon: "Item_4"},
          { name: "qwe 1", icon: "Item_5"},
          { name: "qwe 1", icon: "Item_6"},
          { name: "qwe 1", icon: "Item_7"},
          { name: "qwe 1", icon: "Item_8"},
          {name:"qwe 1"},
          {name:"qwe 1"},
          // { name:"qwe 2 gadgsdddddddddddddddddddddddddddddddg",more:"gadgsdddddddddddddddddddddddddddddddg",type:"select",desc:"gasgasgasg"},
          { name: "qwe 3", more: "gadg", type: "select", desc:"gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj gsdgdfgs 5g dftrg dsr5g xftj "},
          {name:"qwe 4",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 5",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 6",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 7",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 8",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 9",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 10",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 11",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 12",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 1",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 2",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 3",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 4",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 5",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 6",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 7",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 8",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 9",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 10",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 11",more:"gadg",type:"select",desc:"gasgasgasg"},
          {name:"qwe 12",more:"gadg",type:"select",desc:"gasgasgasg"},
        ],
        sprite: "diamond"
      }
    } else {
      this.state = {
        id: 0,
        open: false,
        select: 0,
        title: '',
        subtitle: "",
        items: []
      }
    }
    



    
    this.openMenu = this.openMenu.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    
    mp.events.register('menu:open', (data: MenuInterface) => {
      this.openMenu(data);
    })
    mp.events.register('menu:addItems', (...items: MenuItemBase[]) => {
      this.setState({ items: [...this.state.items, ...items] });
    })
    mp.events.register('menu:close', () => {
      this.setState({ open: false, select: 0 });
    })
  }

  openMenu(data:MenuInterface){
    data.open = true;
    data.select = data.select ? data.select : 0;
    data.items.forEach(item => {
      if(!item.listSelected) item.listSelected = 0;
      if(item.type == "range"){
        let arr:string[] = []
        for(let i = item.rangeselect[0]; i <= item.rangeselect[1]; i++) arr.push(i.toString())
        item.type = "list";
        item.list = arr;
      }
    })
    this.setState({...data})
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleClick() {
    if(!this.state.open) return;
    if (this.state.select < 0) return;
    mp.trigger('menu:select', this.state.id, this.state.select);
    // CEF.gui.setGui(null);
  } 
  handleList() {
    if(!this.state.open) return;
    if (this.state.select < 0) return;
    let selected = this.state.items[this.state.select]
    if(selected && (selected.type == "range" || selected.type == "list")){
      mp.trigger('menu:onchange', this.state.id, this.state.select, this.state.items[this.state.select].listSelected);
    }
    // mp.trigger('select', this.selected, this.state.items[this.selected]);
    // CEF.gui.setGui(null);
  }

  

  handleKeyDown(e: any) {
    if(!this.state.open) return;
    e.preventDefault();
    let old = this.state.select
    if (e.keyCode == 38) {
      let select = this.state.select - 1;
      if (this.state.select == null) select = this.state.items.length - 1;
      if (select < 0) select = this.state.items.length - 1;
      if (select > this.state.items.length - 1) select = 0;
      this.setState({ select });
      mp.trigger('menu:setindex', this.state.id, select)
      document
          .querySelector('.all-menu-list li.active')
        .scrollIntoView({ block: 'center' })
    } else if (e.keyCode == 40) {
      let select = this.state.select + 1;
      if (this.state.select == null) select = 0;
      if (select < 0) select = this.state.items.length - 1;
      if (select > this.state.items.length - 1) select = 0;
      this.setState({ select });
      mp.trigger('menu:setindex', this.state.id, select)
        document
          .querySelector('.all-menu-list li.active')
          .scrollIntoView({ block: 'center' })
    } else if (e.keyCode == 13) {
      this.handleClick();
    }
    if (e.keyCode == 27 || e.keyCode == 8) {
      mp.trigger("menu:close")
      this.setState({open: false});
    }
    // Move Left
    if (e.keyCode == 37) {
      let current = this.state.items[this.state.select];
      let selected = current.listSelected;
      if(current.type == "list"){
        if(selected == 0) selected = current.list.length - 1;
        else selected--;
      }
      const news = this.state.items;
      news[this.state.select].listSelected = selected;
      this.setState({items:news})
      this.handleList()
    }
    // Move Right
    if (e.keyCode == 39) {
      let current = this.state.items[this.state.select];
      let selected = current.listSelected;
      if(current.type == "list"){
        if(selected == current.list.length - 1) selected = 0;
        else selected++;
      }
      const news = this.state.items;
      news[this.state.select].listSelected = selected;
      this.setState({items:news})
      this.handleList()
    }
  }

  render() {
    if(!this.state.open) return <></>;
    return (
        <div className="popup-menu">
          <div className="header">
          <div className="title" style={{ "background": this.state.sprite ? "url('" + require('./title/' + this.state.sprite + ".png") + "')" : null }} dangerouslySetInnerHTML={{ __html: gtaStrToHtml(this.state.title) }}></div>
          <div className="subtitle">
              <span dangerouslySetInnerHTML={{ __html: gtaStrToHtml(this.state.subtitle) }}></span>
              {/* <span className="right">{this.state.select+1} / {this.state.items.length}</span> */}
            </div>
          </div>
            <div className="clear"></div>
        <ul className="all-menu-list" style={{ maxHeight: sizeUl+"px"}}>
          {this.state.items.length == 0 ? <li>
            <div>
              <span>Пусто</span>
              <span></span>
            </div>
          </li> : this.state.items.map((item, key) => {
            const icon = item.icon ? require(`../../icons/${item.icon}.png`) : null;
            let prevRange = "";
            let nextRange = "";
            // if(!item.visible) return <></>;
            return (
              <li
                key={key}
                className={this.state.select == key ? 'active' : ''}
                // onMouseOver={() => this.setState({ select: key })}
                // onClick={this.handleClick}
              >
                <div>
                  <span dangerouslySetInnerHTML={{ __html: (icon ? `<img src=${icon} />&nbsp;&nbsp;` : '')+gtaStrToHtml(item.name) }}></span>


                  {item.type == "select" ? <>
                    {item.more ? <span dangerouslySetInnerHTML={{ __html: gtaStrToHtml(item.more as string) }}></span> : <span></span>}
                  </> : (item.type == "list") ? (<span dangerouslySetInnerHTML={{ __html: `<img src="${arrowLeft}" alt="" width="10px" /> ${gtaStrToHtml(item.list[item.listSelected])} <img src="${arrowRight}" alt="" width="10px" />` }}></span>) : <span></span>}



                </div>
              </li>
            );
          })}
          </ul>
        {this.state.items.length > 0 && this.state.items[this.state.select].desc ? <div className="help">
          <p dangerouslySetInnerHTML={{ __html: gtaStrToHtml(this.state.items[this.state.select].desc) }}></p>
        </div> : <></>}
        
      </div>
    );
  }
}

export default Menu;
