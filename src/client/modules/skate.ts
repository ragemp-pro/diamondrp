export {}
import { user } from "../user";
import { sleep } from "../../util/methods";
import { methods } from "./methods";
import { inGreenZone } from "./savezone";


// const player = mp.players.local;
const boardprop = mp.game.joaat("p_defilied_ragdoll_01_s")

async function attach(player:PlayerMp, first = true){
  if(first) player.skate = {}, await sleep(500)
  if(!player.skate.obj) player.skate.obj = mp.objects.new(boardprop, new mp.Vector3(player.position.x, player.position.y, player.position.z-1), {
    dimension: player.dimension
  })
  await sleep(100)
  player.vehicle.setAlpha(0)
  player.skate.objveh = player.vehicle
  // Create ped clone
  if(!player.skate.objped) player.skate.objped = mp.peds.new(player.model, player.position, 0, player.dimension)
  if(first) player.skate.objped.setVisible(false, false);
  player.skate.objveh.setNoCollision(player.skate.objped.handle, false)
  await sleep(500)

  // Invincible
  player.skate.objped.setInvincible(true)

  

  //player.skate.obj.attachTo(player.skate.objveh.handle, 20, 0.0, 0.0, -0.20, 0.0, 0.0, 90.0, true, true, true, true, 1, true)
  player.skate.obj.attachTo(player.skate.objveh.handle, 20, 0.0, 0.0, -0.48, 0.0, 0.0, 90.0, true, true, true, true, 1, true)

  player.skate.obj.setCollision(true, true);

  


  for(let id = 0;id<12;id++){
    let texture = player.getTextureVariation(id)
    let drawable = player.getDrawableVariation(id)
    let pallete = player.getPaletteVariation(id)
    mp.game.invoke("0x262B14F48D29DE80", player.skate.objped.handle, id, drawable, texture, pallete)
  }
  for(let id = 0;(id<3 || id == 6 || id == 7);id++){
    let texture = player.getPropTextureIndex(id)
    let index = player.getPropIndex(id)
    mp.game.invoke("0x93376B65A266EB5F", player.skate.objped.handle, id, index, texture, true)
  }

  mp.game.invoke("0x262B14F48D29DE80", player.skate.objped.handle, 1, 8, 0);

  // player.skate.objped.set

  // Anim
  player.skate.objped.taskPlayAnim("move_strafe@stealth", "idle", 8.0, -8, -1, 9, 0, false, false, false)
  // SetCollision
  player.skate.objped.setCollision(true, true);
  // Attach clone ped to skate
  player.skate.objped.attachTo(player.skate.obj.handle, 20, 0.0, 0.0, 1.1, 0.0, 0.0, -90.0, true, true, true, true, 1, true)
  // Set clone ped visible
  player.skate.objped.setVisible(true, true);
  if(!first) return;
  setTimeout(() => {
    attach(player, false);
  }, 1000)
  while(player.handle && player.skate && player.skate.objped){
    await sleep(1000);
    if(!player.skate.objped.isPlayingAnim("move_strafe@stealth", "idle", 3)) player.skate.objped.taskPlayAnim("move_strafe@stealth", "idle", 8.0, -8, -1, 9, 0, false, false, false)
  }
}

function dettach(player:PlayerMp){
  if(!player.skate) return;
  if(player.skate.obj) player.skate.obj.destroy();
  player.skate.obj = null;
  // delete clone ped
  if(player.skate.objped) player.skate.objped.destroy()
  player.skate = null;
}

mp.events.add("render", () => {
  if(!mp.players.local.skate) return;
  if(mp.game.controls.isDisabledControlJustPressed(0,75)){
    mp.events.callRemote('unskate')
    dettach(mp.players.local);
    return;
  }
  if(!mp.players.local.vehicle){
    mp.events.callRemote('unskate')
    dettach(mp.players.local);
    return;
  }
  if(inGreenZone()){
    mp.events.callRemote('unskate')
    dettach(mp.players.local);
    return;
  }
		
})

mp.events.add('entityStreamIn', (entity:PlayerMp) => {
  if(entity.type != "player") return;
  if(entity.getVariable('skate')) attach(entity)
});
mp.events.add('entityStreamOut', (entity:PlayerMp) => {
  if(entity.type != "player") return;
  if(entity.getVariable('skate')) dettach(entity)
});
mp.events.addDataHandler("skate", (entity, value) => {
  if(!value) dettach(entity)
  else attach(entity)
});

mp.events.add('entityStreamIn', (entity:EntityMp) => {
  if(entity.type != "player" && entity.type != "vehicle") return;
  if(entity.getVariable('skate')) entity.setAlpha(0)
});

mp.events.addDataHandler("skate", (entity:EntityMp, value) => {
  if(entity.type != "player" && entity.type != "vehicle") return;
  if(!value) return;
  entity.setAlpha(0)
});