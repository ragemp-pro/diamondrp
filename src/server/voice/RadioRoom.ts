/// <reference path="../../declaration/server.ts" />

import { user } from "../user";
import { voiceDistanceRange, voiceDistanceRangePlus } from "../../util/voice";

export class RadioRoom {
    _players: Set<PlayerMp>;
    name: string;
    constructor(name:string) {
        this.name = name;

        this._players = new Set();
    }

    get players() {
        return Array.from(this._players);
    }

    get metaData() {
        return {
            name: this.name
        }
    }

    onJoin(player:PlayerMp) {
        try {
            if (!this._players.has(player)) {
                // player.call('voice.radioConnect', [this.metaData, ...this.players]);
                // mp.players.call(this.players, 'voice.radioConnect', [this.metaData, player]);
                player.setVariable('radioVol', this.name)
                player.radioRoom = this.name;
                this._players.add(player);
                this._players.forEach(usr => {
                    if (!mp.players.exists(usr)) return;
                    if (usr != player) {
                        if (mp.players.exists(player) && mp.players.exists(usr)) {
                            usr.callsocket("radioClientConnect", [player.id])
                            player.callsocket("radioClientConnect", [usr.id])
                            usr.enableVoiceTo(player);
                            player.enableVoiceTo(usr);
                        }
                    }
                })
            }
        } catch(e) {
            console.log(`room ${this.name} onJoin ${player.name}`, e);
        }
    }

    onQuit(player:PlayerMp) {
        try {
            player.setVariable('radioVol', null);
            player.setVariable('radioSpeak', false)
            player.callsocket("radioClientDisconnectClear", [])
            if (this._players.has(player)) {
                this._players.forEach(usr => {
                    if(!mp.players.exists(usr)) return;
                    if(usr != player){
                        usr.callsocket("radioClientDisconnect", [player.id])
                        if(mp.players.exists(player) && mp.players.exists(usr)){
                            usr.disableVoiceTo(player)
                            player.disableVoiceTo(usr)
                        }
                    }
                })
                player.radioRoom = '';
                this._players.delete(player);
            }
            
        } catch(e) {
            console.log(`room ${this.name} onQuit ${player.name}`, e);
        }
    }

    enableMic(player:PlayerMp) {
        try {
            player.setVariable('radioSpeak', true)
            if (this._players.has(player)) {
                this._players.forEach(usr => {
                    if (!mp.players.exists(usr)) return;
                    if(usr.id != player.id){
                        // if (!this.detectSpeak(player, usr))
                        player.enableVoiceTo(usr);
                        // usr.callsocket("radioSpeakerAdd", [user.getRpName(player), player.id])
                    }
                })
            }
        } catch(e) {
            console.log(`room ${this.name} enableMic ${player.name}`, e);
        }
    }

    disableMic(player:PlayerMp) {
        try {
            // if (this._players.has(player)) {
            //     this._players.forEach(usr => {
            //         if (usr.id != player.id){
            //             usr.callsocket("radioSpeakerRemove", [user.getRpName(player), player.id])
            //         }
            //     })
            // }
        } catch(e) {
            console.log(`room ${this.name} disableMic ${player.name}`, e);
        }
    }

    onRemove() {
        mp.players.call(this.players, 'voice.radioDisconnect', [this.metaData]);
        this._players.clear();
    }

    detectSpeak(player: PlayerMp, target: PlayerMp) {
        if(mp.players.exists(player)) return false;
        if (mp.players.exists(target)) return false;
        if ((player.dist(target.position) + voiceDistanceRangePlus) >= voiceDistanceRange) return false;
        if(player.dimension != target.dimension) return false;
        return true;
    }
}
