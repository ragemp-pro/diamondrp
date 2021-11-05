import { ui } from '../modules/ui';
import { methods } from '../modules/methods';

let _checkpoint: CheckpointMp = null;
let _marker: MarkerMp = null;
let _blip: BlipMp = null;
let _lastPos = new mp.Vector3(0, 0, 0);
let _deleteWhenNear = false;
const player = mp.players.local
setInterval(() => {
  if(!_deleteWhenNear) return;
  let pos = player.position;
  if(mp.game.gameplay.getDistanceBetweenCoords(pos.x, pos.y, pos.z, _marker.position.x, _marker.position.y, _marker.position.z, true) < 10){
    jobPoint.delete();
  }
}, 1000)

let jobPoint = {
  create: (pickupPos:Vector3Mp, route = false, radius = 1, deleteWhenNear = false) => {
    jobPoint.delete();

    _deleteWhenNear = deleteWhenNear;

    _lastPos = pickupPos;
  
    _marker = mp.markers.new(1, pickupPos, radius, {
      color: [ui.MarkerRed[0],ui.MarkerRed[1],ui.MarkerRed[2],ui.MarkerRed[3]],
      dimension: -1,
    });
  
    _checkpoint = mp.checkpoints.new(1, pickupPos, radius + 0.2, {
      direction: new mp.Vector3(0, 0, 0),
      color: [33, 150, 243, 0],
      visible: true,
      dimension: -1,
    });
  
    _blip = mp.blips.new(1, pickupPos, {
      color: 59,
      scale: 0.8,
      name: 'Работа',
      drawDistance: 100,
      shortRange: false,
      dimension: -1,
    });
  
    _blip.setRoute(route);
  
    return _checkpoint.id;
  },
  
  delete: () => {
    _deleteWhenNear = false;
    try {
      if (typeof _blip == 'object' && mp.blips.exists(_blip)) _blip.destroy();
      else {
        mp.blips.forEach(function(blip) {
          if (mp.blips.exists(blip) && blip.getSprite() == 1) blip.destroy();
        });
      }
    } catch (e) {
      mp.console.logError(e);
      mp.blips.forEach(function(blip) {
        if (mp.blips.exists(blip) && blip.getSprite() == 1) blip.destroy();
      });
    }
  
    try {
      if (typeof _marker == 'object' && mp.markers.exists(_marker)) _marker.destroy();
      else {
        mp.markers.forEach(function(marker) {
          if (typeof marker == "object" && typeof marker.getColor == "function" && mp.markers.exists(marker) && marker.getColor() === ui.ColorRed) marker.destroy();
        });
      }
    } catch (e) {
      mp.console.logError(e);
      mp.markers.forEach(function(marker) {
        if (typeof marker == "object" && typeof marker.getColor == "function" && mp.markers.exists(marker) && marker.getColor() === ui.ColorRed) marker.destroy();
      });
    }
  
    try {
      if (typeof _checkpoint == 'object' && mp.checkpoints.exists(_checkpoint)) _checkpoint.destroy();
      else {
        mp.checkpoints.forEach(function(cp) {
          if (methods.distanceToPos(_lastPos, cp.position) < 3) cp.destroy();
        });
      }
    } catch (e) {
      mp.console.logError(e);
      mp.checkpoints.forEach(function(cp) {
        if (methods.distanceToPos(_lastPos, cp.position) < 3) cp.destroy();
      });
    }
  
    _checkpoint = null;
    _marker = null;
    _blip = null;
  },
};

export { jobPoint };
