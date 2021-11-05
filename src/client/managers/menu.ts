import { MenuItem, MenuInterface, MenuItemBase } from "../../util/menu";
import { gtaStrToHtml } from "../../util/string";

export interface MenuItemClient extends MenuItem {
    SetRightLabel?(text: string): MenuItemClient;
    SetIcon?(url: string): MenuItemClient;
    [x:string]:any;
}

export let menuid = 0;
export let currentMenu: MenuClass;

function filter(str:string){
    if(!str) return "";
    return gtaStrToHtml(str).replace(/\n/gi, ' ').replace(/"/gi, "").replace(/'/gi, "")
}

function itemMenuCEF(item: MenuItemClient): MenuItemBase {
    return {
        name: item.name,
        more: item.more,
        desc: item.desc,
        type: item.type,
        rangeselect: item.rangeselect,
        list: item.list,
        listSelected: item.listSelected,
        icon: item.icon
    }
}

export class MenuClass {
    /** Уникальный ID каждого конструктора меню */
    readonly id: number;
    serverid?:number;
    workAnyTime?:boolean;
    /** Заголовок меню */
    title: string;
    /** Подзаголовок меню */
    subtitle: string;
    /** Пункты меню */
    items: MenuItemClient[];
    /** Доп параметры */
    customParams: {
        isResetBackKey?: boolean,
        isDisableAllControls?: boolean,
        DisableAllControlsOnClose?: boolean;
        closeEvent?: boolean;
        selected?: number;
    }
    closedMenu: boolean;
    opened: boolean;
    onclose: () => Promise<void> | void;
    oldsystem: boolean;
    ItemSelect?: { onHandle: ((item: MenuItemClient, id?: number) => any)[]; on: (handler: (item: MenuItemClient, id?: number) => void) => any; };
    ListChange?: { onHandle: ((item: MenuItemClient, id?: number) => any)[]; on: (handler: (item: MenuItemClient, id?: number) => void) => any; };
    MenuClose: { onHandle: (() => any)[]; on: (handler: () => any) => void; };
    IndexChange: { onHandle: ((index: number) => any)[]; on: (handler: (index: number) => any) => void; };
    spriteName?: string;
    constructor(title: string, subtitle: string, items?: MenuItemClient[], oldsystem = false) {
        if (currentMenu) currentMenu.close();
        this.opened = false;
        this.oldsystem = oldsystem;
        this.closedMenu = false;
        this.id = parseInt(`${menuid++}`);
        this.title = filter(title);
        this.subtitle = filter(subtitle);
        this.items = (items ? items : []).map((item) => {
            if (!item.type) item.type = "select";
            return item;
        });
        this.customParams = {};

        // Declare old methods
        this.ItemSelect = { 
            onHandle: <((item: MenuItemClient, id?: number) => any)[]>[],
            on: (handler: (item: MenuItemClient, id?: number) => any) => {
                this.ItemSelect.onHandle.push(handler);
            } 
        }
        this.ListChange = { 
            onHandle: <((item: MenuItemClient, id?: number) => any)[]>[],
            on: (handler: (item: MenuItemClient, id?: number) => any) => {
                this.ListChange.onHandle.push(handler);
            } 
        }
        this.MenuClose = { 
            onHandle: <(() => any)[]>[],
            on: (handler: () => any) => {
                this.MenuClose.onHandle.push(handler);
                this.onclose = () => {
                    this.MenuClose.onHandle.map(itm => {
                        itm();
                    })
                }
            } 
        }
        this.IndexChange = { 
            onHandle: <((index:number) => any)[]>[],
            on: (handler: (index: number) => any) => {
                this.IndexChange.onHandle.push(handler);
            } 
        }
    }
    /** Добавляет новые пункты в текущее меню */
    newItem(item: MenuItemClient) {
        if (!this.items) return;
        if (!item.type) item.type = "select"
        //if(item.more) item.name+=" "+item.more, item.more = null;


        if (item.name) item.name = filter(item.name);
        if (item.more) item.more = filter(String(item.more));
        if (item.desc) item.desc = filter(item.desc);
        if (item.list) {
            item.list.map(q => {
                q = filter(q);
            })
        }

        item.SetRightLabel = (text) => {
            item.more = text;
            return item;
        }
        item.SetIcon = (url) => {
            item.icon = url;
            return item;
        }
        this.items.push(item);
        if(this.opened){
            mp.events.triggerBrowser('menu:addItems', itemMenuCEF(item))
        }
        return item
    }
    /** Отрисовать меню в текущем состоянии у клиента */
    async open(selected: number = null) {
        setTimeout(() => {
            if (!this.items) return;
            this.customParams.selected = selected ? selected : 0
            this.items.forEach(item => {
                if (item.type == "list") {
                    if (item.Index) item.listSelected = item.Index
                    if (!item.listSelected) item.listSelected = 0;
                    item.listSelectedName = item.list[item.listSelected]
                }
                if (item.name) item.name = filter(item.name);
                if (item.more) item.more = filter(String(item.more));
                if (item.desc) item.desc = filter(item.desc);
                if (item.list) {
                    item.list.map(q => {
                        q = filter(q);
                    })
                }
            })
            let data: MenuInterface = {
                id: this.id,
                select: this.customParams.selected,
                title: this.title,
                subtitle: this.subtitle,
                items: [...this.items].map(q => { return itemMenuCEF(q)}),
                sprite: this.spriteName ? this.spriteName : null
            }
            this.opened = true;
            currentMenu = this;
            mp.events.triggerBrowser('menu:open', data)
        }, 100)
    }
    /** Функция закрытия меню */
    close(fromCef = false) {
        currentMenu = null;
        if(!fromCef)mp.events.triggerBrowser('menu:close');
        if(this.onclose) this.onclose();
    }



    // Declare Old methoods
    AddMenuItem(title: string, subtitle?: string){
        return this.newItem({
            name: title,
            desc: subtitle ? subtitle : "",
        })
    }
    AddMenuItemList(title: string, list: string[], subtitle?: string){
        return this.newItem({
            type: "list",
            list,
            name: title,
            desc: subtitle ? subtitle : ""
        })
    }

}

mp.events.add('menu:close', () => {
    if (!currentMenu) return;
    currentMenu.close(true);
})

mp.events.add('menu:setindex', (id:number, select:number) => {
    if (!currentMenu) return;
    if (currentMenu.id != id) return;
    let item = currentMenu.items[select];
    if (!item) return;
    if (!currentMenu.IndexChange || !currentMenu.IndexChange.onHandle) return;
    currentMenu.IndexChange.onHandle.map(itm => {
        itm(select);
    })
})

mp.events.add('menu:select', (id:number, select:number) => {
    if(!currentMenu) return;
    if(currentMenu.id != id) return;
    let item = currentMenu.items[select];
    if(!item) return;
    if (currentMenu.ItemSelect && currentMenu.ItemSelect.onHandle && currentMenu.ItemSelect.onHandle.length > 0){
        currentMenu.ItemSelect.onHandle.map(itm => {
            itm(item, select)
        })
        return;
    }
    if (typeof item.onpress == "function") item.onpress(item, select);
})

mp.events.add('menu:onchange', (id: number, select: number, value:number) => {
    if(!currentMenu) return;
    if(currentMenu.id != id) return;
    let item = currentMenu.items[select];
    if(!item) return;
    if (currentMenu.ListChange && currentMenu.ListChange.onHandle && currentMenu.ListChange.onHandle.length > 0) {
        currentMenu.ListChange.onHandle.map(itm => {
            itm(item, value)
        })
        // return;
    }

    if (item.type == "list" && !item.list[value]) return;
    item.listSelected = value;
    if (item.type == "list") item.listSelectedName = item.list[value];
    if (typeof item.onchange == "function") item.onchange(item.listSelected, item, select);
})





let serverEventClose = false;
mp.events.add('server:menu:close', () => {
    serverEventClose = true;
    if(currentMenu) currentMenu.close();
    serverEventClose = false
})


let longMenuData: {
    id: number;
    title: string;
    subtitle: string;
    customParams: {
        isResetBackKey?: boolean,
        isDisableAllControls?: boolean,
        DisableAllControlsOnClose?: boolean;
    };
    length: number;
    items: MenuItem[],
    itemsBlock: MenuItem[][],
    workAnyTime: boolean;
    sprite:string;
};

setTimeout(() => {
    mp.events.register("server:menu:openPartPrepare", (id: number, title: string, subtitle: string, customParams: {
        isResetBackKey?: boolean,
        isDisableAllControls?: boolean,
        DisableAllControlsOnClose?: boolean;
        closeEvent?: boolean;
        selected?: number;
    }, length: number, workAnyTime: boolean, sprite: string) => {
        longMenuData = {
            items: [],
            itemsBlock: [],
            id,
            title,
            subtitle,
            customParams,
            length,
            workAnyTime,
            sprite
        }
        for (let id = 0; id < length; id++) longMenuData.itemsBlock.push([])
        return true;
    })
}, 100)



let reopen = false;
mp.events.add("server:menu:openPartItems", (index: number, items: MenuItem[]) => {
    longMenuData.itemsBlock[index].push(...items);
    let q = 0;
    longMenuData.itemsBlock.forEach(items => {
        q += items.length
    })
    if (q == longMenuData.length) {
        longMenuData.itemsBlock.forEach(items => {
            longMenuData.items.push(...items);
        })
        openMenu(longMenuData.id, longMenuData.title, longMenuData.subtitle, longMenuData.items, longMenuData.customParams, longMenuData.workAnyTime, longMenuData.sprite)
    }
    return true;
})

mp.events.add('server:menu:open', (id: number, title: string, subtitle: string, items: MenuItem[], customParams: {
    isResetBackKey?: boolean,
    isDisableAllControls?: boolean,
    DisableAllControlsOnClose?: boolean;
    closeEvent?: boolean;
    selected?: number;
}, workAnyTime: boolean, sprite: string) => {
    openMenu(id, title, subtitle, items, customParams, workAnyTime, sprite)
})

function openMenu(id: number, title: string, subtitle: string, items: MenuItem[], customParams: {
    isResetBackKey?: boolean,
    isDisableAllControls?: boolean,
    DisableAllControlsOnClose?: boolean;
    closeEvent?: boolean;
    selected?: number;
}, workAnyTime: boolean = false, sprite:string) {

    reopen = true;

    let m = new MenuClass(title, subtitle);
    if (sprite) m.spriteName = sprite;
    m.serverid = id;
    items.map((item) => {
        m.newItem({
            ...item,
            onpress: (_, index) => {
                mp.events.callSocket('client:menu:itemSelect', id, index)
            },
            onchange: (val, _, index) => {
                mp.events.callSocket('client:menu:listChange', id, index, val)
            },
        })
    })
    m.onclose = () => {
        if (serverEventClose) return;
        if (reopen) return;
        if (!customParams.closeEvent) return;
        mp.events.callSocket('client:menu:closeEvent', id)
    }
    m.workAnyTime = workAnyTime;
    m.open(customParams.selected);
    
    reopen = false;
}