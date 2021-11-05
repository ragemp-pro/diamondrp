import { user } from "../user";
import { methods } from "../modules/methods";

const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.45;

const loadClipSet = (clipSetName:string) => {
    mp.game.streaming.requestClipSet(clipSetName);
    while (!mp.game.streaming.hasClipSetLoaded(clipSetName)) mp.game.wait(0);
};

// load clip sets
loadClipSet(movementClipSet);
loadClipSet(strafeClipSet);





function setWalkingStyle(user: PlayerMp, style: string) {
    if (!style) {
        user.resetMovementClipset(1.0);
        user.resetStrafeClipset();
    } else {
        if (!mp.game.streaming.hasClipSetLoaded(style)) mp.game.streaming.requestClipSet(style);
        user.setMovementClipset(style, 1.0);
    }
}


function walkingStyleContol(player: PlayerMp) {
    if (player.getHealth() < 20) {
        setWalkingStyle(player, "move_m@injured")
    } else if (player.getVariable('isCrouched')){
        player.setMovementClipset(movementClipSet, clipSetSwitchTime);
        player.setStrafeClipset(strafeClipSet);
    } else if (player.getVariable('walkstyle'))
        setWalkingStyle(player, player.getVariable('walkstyle'));
    else {
        setWalkingStyle(player, null)
    }
}


mp.events.addDataHandler("walkstyle", (entity: PlayerMp, value) => {
    walkingStyleContol(entity);
});





// apply clip sets if streamed player is crouching
mp.events.add("entityStreamIn", (entity: PlayerMp) => {
    if (entity.type !== "player") return;
    walkingStyleContol(entity);
});

setInterval(() => {
    walkingStyleContol(mp.players.local)
    mp.players.forEachInStreamRange(nplayer => {
        walkingStyleContol(nplayer)
    })
}, 5000)

mp.events.addDataHandler("isCrouched", (entity: PlayerMp, value: boolean) => {
    if (entity.type !== "player") return;
    walkingStyleContol(entity);
});

mp.events.add("playerEnterVehicle", function (vehicle, seat) {
    if(mp.players.local.getVariable('isCrouched')){
        user.setVariable('isCrouched', false);
    }
});

let lastpress = 0;

mp.keys.bind(17, true, () => {
    if (!user.isLogin()) return;
    if (mp.keys.isDown(18)) return;
    if (mp.keys.isDown(16)) return;
    if(mp.gui.cursor.visible) return;
    lastpress = methods.getTimeStampMS()
    mp.events.callRemote("toggleCrouch");
});
