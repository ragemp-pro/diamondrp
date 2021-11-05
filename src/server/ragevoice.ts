import { methods } from "./modules/methods";
import { user } from "./user";

mp.events.add({
    "worldVoiceAdd": (player: PlayerMp, nuser: PlayerMp) => {
        if (!mp.players.exists(nuser) || !mp.players.exists(player)) return;
        player.enableVoiceTo(nuser);
    },
    "worldVoiceRemove": (player:PlayerMp, nuser:PlayerMp) => {
        if (!mp.players.exists(nuser) || !mp.players.exists(player)) return;
        player.disableVoiceTo(nuser);
    },
    'startWorldSpeak': (player:PlayerMp) => {
        let targets = user.getNearestPlayers(player, 40);
        targets.map(target => {
            target.call('playerStartTalkingEvent', [player])
        })
    },
    'stopWorldSpeak': (player:PlayerMp) => {
        let targets = user.getNearestPlayers(player, 40);
        targets.map(target => {
            target.call('playerStopTalkingEvent', [player])
        })
    },

});