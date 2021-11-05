import { shootingProps, shootTargets } from "../../util/shootingRange"
import { pointingAt } from "./raycast";
import { scaleFormText, ScaleForm } from "./scaleForm";
import { ui } from "../modules/ui";

let objects: ObjectMp[] = [];
let blips: BlipMp[] = [];
let start = false
let res:(status:boolean)=>any = null;
let raycastRes: RaycastResult;



scaleFormText(`Начало\nиспытания`, new mp.Vector3(-1747.086, 2940.278, 35.40466), new mp.Vector3(0, 0, 120), 100, new mp.Vector3(6, 3, 1))
let top3scale: ScaleForm;
mp.events.add('updateshoottop3', (list: string[]) => {
    if (!top3scale) top3scale = scaleFormText(`Топ-5\n${list.join('\n')}`, new mp.Vector3(-1745.536, 2921.145, 33.87434), new mp.Vector3(0, 0, 120), 100, new mp.Vector3(3, 1.6, 0.7))
    else top3scale.setText(`Топ-5\n${list.join('\n')}`)
})





mp.events.add('playerDeath', function () {
    if (!res) return;
    start = false;
    res(false);
    objects.map(item => {
        item.destroy();
    })
    blips.map(item => {
        item.destroy();
    })
    objects = []
    blips = []
});
mp.events.add('shootingRangeClose', function () {
    if (!res) return;
    start = false;
    res(false);
    objects.map(item => {
        item.destroy();
    })
    blips.map(item => {
        item.destroy();
    })
    objects = []
    blips = []
});

mp.events.add('playerWeaponShot', (targetPosition:Vector3Mp, targetEntity:EntityMp) => {
    if (!start) return;
    start = false;
    // mp.gui.chat.push('shoot')
    // if (targetPosition) mp.gui.chat.push(`POS: X: ${targetPosition.x}, Y: ${targetPosition.y}, Z: ${targetPosition.z}`);
    raycastRes = pointingAt(200);
    if (!raycastRes) return;
    // mp.gui.chat.push('TYPE: ' + raycastRes.entity.type);
    let index = objects.findIndex(item => item == raycastRes.entity)
    if (index > -1){
        objects[index].destroy();
        blips[index].destroy();
        objects.splice(index, 1);
        blips.splice(index, 1);
        ui.soundHit()
    }
    if(objects.length == 0){
        start = false;
        res(true);
        res = null;
    } else {
        start = true;
    }
});

setTimeout(() => {
    mp.events.register('shootingRangeWait', () => {
        return new Promise((resolve) => {
            objects = []
            blips = []
            ui.soundPlay2();
            shootingProps.map(item => {
                let model = item.model.toLowerCase()
                if (shootTargets.includes(model)) {
                    objects.push(mp.objects.new(mp.game.joaat(model),
                        new mp.Vector3(parseFloat(item.position.x), parseFloat(item.position.y), parseFloat(item.position.z)), {
                        rotation: new mp.Vector3(parseFloat(item.rotation.x) * -1, parseFloat(item.rotation.y) * -1, parseFloat(item.rotation.z) * -1),
                        dimension: mp.players.local.dimension
                    }))
                    blips.push(mp.blips.new(119,
                        new mp.Vector3(parseFloat(item.position.x), parseFloat(item.position.y), parseFloat(item.position.z)), {
                        color: 1,
                        dimension: mp.players.local.dimension,
                        shortRange: false
                    }))
                }
            })
            res = resolve;
            start = true;
        })
    })
}, 2000)