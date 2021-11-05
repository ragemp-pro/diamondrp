import { user } from "../user";

mp.events.add("skate", (player:PlayerMp) => {
  return player.notify("~r~Кататься можно когда есть снег");
  if(player.inGreenZone) return player.notify("~r~Нельзя кататься в зелёной зоне");
  if(player.getVariable('skate')) return;
  const veh = mp.vehicles.new(mp.joaat('bmx'), player.position, {
    alpha: 0,
    dimension: player.dimension,
    locked: true,
    engine: true
  })
  veh.position = player.position;
  veh.alpha = 0;
  veh.setVariable('skate', true);
  user.showLoadDisplay(player)
  setTimeout(() => {
    if(mp.vehicles.exists(veh) && mp.players.exists(player)){
      veh.position = new mp.Vector3(player.position.x, player.position.y, player.position.z)
      player.alpha = 0;
      player.putIntoVehicle(veh, -1);
      veh.alpha = 0;
      player.skateveh = veh
      
      setTimeout(() => {
        player.setVariable('skate', true);
        user.hideLoadDisplay(player)
      }, 500)
    }
  }, 500)
})

function unskate(player:PlayerMp){
  if(mp.players.exists(player))user.showLoadDisplay(player)
  setTimeout(() => {
    if(mp.players.exists(player)) player.alpha = 255;
    if(mp.players.exists(player)) player.setVariable('skate', false);
    if(mp.vehicles.exists(player.skateveh)) player.skateveh.destroy();
    if(mp.players.exists(player)) player.alpha = 255;
    if(mp.players.exists(player)) player.skateveh = null;
    if(mp.players.exists(player)){
      setTimeout(() => {
        user.hideLoadDisplay(player)
      }, 500)
    }
    player.skateveh = null;
  }, 1000)
}

mp.events.add("unskate", (player:PlayerMp) => unskate(player))
mp.events.add("playerDeath", (player) => unskate(player));
mp.events.add("playerQuit", (player) => unskate(player));