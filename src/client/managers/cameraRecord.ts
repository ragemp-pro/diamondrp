import camerasManager from './cameraManager';
import { ui } from '../modules/ui';

export type cameraSettingsMode = "Обычный"|"Смотреть на ТС"|"Смотреть на игрока";
interface cameraSettings {
  pos1: Vector3Mp;
  pos2: Vector3Mp;
  rot1: Vector3Mp;
  rot2: Vector3Mp;
  mode: cameraSettingsMode;
  target: number;
  fov: number;
  duration: number;
}

setTimeout(() => {
  mp.events.register("camera:rotationCamera", () => {
    return new Promise((resolve) => {
      resolve(camerasManager.gameplayCam.getRot(2))
    })


  });
  mp.events.register("camera:start", (settings:cameraSettings) => {
    return new Promise((resolve) => {
      ui.hideHud();
      mp.game.ui.displayHud(false);
      let camera:CameraMp = camerasManager.createCamera('recordCamera', 'default', settings.pos1, settings.rot1 ? settings.rot1 : new mp.Vector3(0,0,0), settings.fov, settings.target, settings.mode, settings.duration*1000);
      camerasManager.setActiveCameraWithInterp(camera, settings.pos2, settings.rot2 ? settings.rot2 : new mp.Vector3(0,0,0), settings.duration*1000, 0, 0, settings.target, settings.mode, settings.duration*1000);
      setTimeout(() => {
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
        camerasManager.destroyCamera(camera);
        resolve(true);
        ui.showHud();
        mp.game.ui.displayHud(true);
      }, settings.duration*1000 + 1000);
    })
  })
}, 1000)


