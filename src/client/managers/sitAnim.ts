import { user } from "../user";
import { sitProps, SitChairConf } from "../../util/sit";
import { methods } from "../modules/methods";
import { MenuClass } from "./menu";
import { ui } from "../modules/ui";
export {}
const player = mp.players.local;

let pressSit = false;

export const checkSitPosition = () => {
    mp.game.invoke('0x277F471BA9DB000B', player.handle, player.position.x, player.position.y, player.position.z, 50, 10)
    if (pressSit) return false;
    pressSit = true;
    setTimeout(() => {
        pressSit = false;
    }, 3000)
    const position = player.position
    let exist = false;
    let pos: Vector3Mp;
    let heading: number;
    let objname: string;
    let objhanlde: number;
    let cfg: SitChairConf;
    sitProps.map(item => {
        let object = mp.game.object.getClosestObjectOfType(
            position.x,
            position.y,
            position.z,
            1.0,
            mp.game.joaat(item.object),
            false,
            false,
            false
        )
        if (object) {
            exist = true;
            let posobj = mp.game.invokeVector3('0x3FEF770D40960D5A', object)
            let headingobj = <number>mp.game.invoke('0xAFBD61CC738D9EB9', object, 2)
            let posres = mp.game.object.getObjectOffsetFromCoords(posobj.x, posobj.y, posobj.z, headingobj, item.verticalOffsetX, item.verticalOffsetY, item.verticalOffsetZ);
            if(pos){
                if (methods.distanceToPos(posres, position) < methods.distanceToPos(pos, position)){
                    pos = posres;
                    heading = headingobj + item.direction;
                    objname = item.object
                    objhanlde = object
                    cfg = item;
                }
            } else {
                pos = posres;
                heading = headingobj + item.direction;
                objname = item.object
                objhanlde = object
                cfg = item;
            }
        }
    })
    if(pos){
        sitOnChair(cfg, objhanlde)

        // let free = mp.players.toArray().filter(player => methods.distanceToPos(pos, player.position) < .1).length == 0;
        // if(!free){
        //     user.notify('~r~Место занято')
        // } else {
        //     user.notify('~r~Название: '+objname)
        //     user.playScenario("PROP_HUMAN_SEAT_CHAIR_MP_PLAYER", pos.x, pos.y, pos.z, heading, false)
        // }
    }

    return exist;
}

let aaaa = 0;
setInterval(() => {
    aaaa++;
    if (aaaa > 7) aaaa = 0;
}, 1000)

const sitOnChair = (item: SitChairConf, object:number) => {
    const position = player.position
    let start = true;
    setTimeout(() => {
        let int:number;
        int = setInterval(() => {
            if(!start) return clearInterval(int);
            let headingobj = <number>mp.game.invoke('0xAFBD61CC738D9EB9', object, 2)
            let headingobj2 = <number>mp.game.invoke('0xAFBD61CC738D9EB9', object, aaaa)
            ui.drawText3D(`H: ${item.direction.toFixed(2)}\nMYH:${player.getHeading().toFixed(2)}\nOBJH:${headingobj.toFixed(2)}\nBJH:${aaaa} / ${headingobj2.toFixed(2)}\nX:${item.verticalOffsetX.toFixed(2)}\nY:${item.verticalOffsetY.toFixed(2)}\nZ:${item.verticalOffsetZ.toFixed(2)}`, player.position.x, player.position.y, player.position.z + 1);
        }, 5);
    }, 1000)
    const s = () => {
        let posobj = mp.game.invokeVector3('0x3FEF770D40960D5A', object)
        let headingobj = <number>mp.game.invoke('0xAFBD61CC738D9EB9', object, 2)
        let posres = mp.game.object.getObjectOffsetFromCoords(posobj.x, posobj.y, posobj.z, headingobj, item.verticalOffsetX, item.verticalOffsetY, item.verticalOffsetZ);
        let heading = headingobj + item.direction + 0.000000001;
        user.playScenario("PROP_HUMAN_SEAT_CHAIR_MP_PLAYER", posres.x, posres.y, posres.z, heading)
        setTimeout(() => {
            player.setHeading(heading);
        }, 100)
    }

    let m = new MenuClass("Настройка", item.object);
    m.newItem({
        name: "Поворот влево",
        onpress: () => {
            item.direction-=1.0;
            s();
        }
    })
    m.newItem({
        name: "Поворот вправо",
        onpress: () => {
            item.direction+=1.0
            s();
        }
    })
    m.newItem({
        name: "X влево",
        onpress: () => {
            item.verticalOffsetX -= .05;
            s();
        }
    })
    m.newItem({
        name: "X вправо",
        onpress: () => {
            item.verticalOffsetX += .05
            s();
        }
    })
    m.newItem({
        name: "Y влево",
        onpress: () => {
            item.verticalOffsetY -= .05;
            s();
        }
    })
    m.newItem({
        name: "Y вправо",
        onpress: () => {
            item.verticalOffsetY += .05
            s();
        }
    })
    m.newItem({
        name: "Z влево",
        onpress: () => {
            item.verticalOffsetZ -= .05;
            s();
        }
    })
    m.newItem({
        name: "Z вправо",
        onpress: () => {
            item.verticalOffsetZ += .05
            s();
        }
    })
    m.newItem({
        name: "~g~Результат",
        more: "Данные",
        onpress: () => {
            user.notify('HEADING ' + (item.direction))
            user.notify('X ' + (item.verticalOffsetX))
            user.notify('Y ' + (item.verticalOffsetY))
            user.notify('Z ' + (item.verticalOffsetZ))
            // s();
        }
    })
    m.newItem({
        name: "~r~Отключить",
        onpress: () => {
            start = false;
            m.close();
        }
    })

    m.open();
    s();

}