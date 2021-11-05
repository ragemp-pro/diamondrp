/// <reference path="../../declaration/client.ts" />
export {}
const player = mp.players.local;

let targetSpectate:PlayerMp = null;
mp.events.add('admin:spectate:stop', () => {
  if(!targetSpectate) return;
  targetSpectate = null;
  mp.players.local.freezePosition(true);
  setTimeout(() => {
    mp.players.local.freezePosition(false);
  }, 5000)
})
mp.events.add('admin:spectate', (target:PlayerMp) => {
  targetSpectate = target;
})

mp.events.add('render', () => {
  if(!targetSpectate) return;
  if (!mp.players.exists(targetSpectate)) return mp.events.callSocket('client:spectate:revive'), targetSpectate = null;
  if (!targetSpectate.handle) return mp.events.callSocket('client:spectate:revive'), targetSpectate = null;
  player.position = new mp.Vector3(targetSpectate.position.x,targetSpectate.position.y,targetSpectate.position.z + 2);
})