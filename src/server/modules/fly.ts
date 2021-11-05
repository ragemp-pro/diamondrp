/// <reference path="../../declaration/server.ts" />
mp.events.add('flyMode', (player:PlayerMp, status:boolean) => {
  player.flymode = status;
  if(player.spectatePosition) return;
  player.alpha = status ? 0 : 255;
});