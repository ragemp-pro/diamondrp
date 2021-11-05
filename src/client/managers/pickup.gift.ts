import { giftitem } from "../../util/pickup.gift";

let giftpos:giftitem[];
let pickupedData:number[];

mp.events.add("holidayPickups", datas => {
  pickupedData = JSON.parse(datas);
})
mp.events.add("3vv", datas => {
  giftpos = JSON.parse(datas);
})


setInterval(() => {
  if(!pickupedData) return;
  if(!giftpos) return;
  const mypos = mp.players.local.position
  giftpos.map((item, index) => {
    if(pickupedData.indexOf(index) != -1) return remove(item);
    if(mp.game.gameplay.getDistanceBetweenCoords(mypos.x, mypos.y, mypos.z, item.x, item.y, item.z, true) > 300) return remove(item);
    if(!item.object) return create(item);
  })
}, 5000)
setInterval(() => {
  if(!pickupedData) return;
  giftpos.map((item, index) => {
    if (!item.object) return;
    if (item.object && mp.game.invoke("0x80EC48E6679313F9", item.object)) return collect(item, index)
  })
}, 1000)


function create(item:giftitem){
  if (item.object) remove(item);
  item.object = <number>mp.game.invoke("0x891804727E0A98B7", 79909481, item.x, item.y, (item.z-1), 0.0, 0.0, 0.0, 0, 1, 2, 0);
}
function remove(item:giftitem){
  if (!item.object) return;
  mp.game.invoke("0x3288D8ACAECD2AB2", item.object);
  item.object = undefined
}
function collect(item:giftitem, index:number){
  if (!item.object) return;
  remove(item)
  if(pickupedData.indexOf(index) != -1) return;
  pickupedData.push(index)
  mp.events.callRemote('holidayPickups:server', index)
}