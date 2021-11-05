mp.events.add("fpsync.update", (player:PlayerMp, camPitch:number, camHeading:number) => {
    mp.players.call(player.streamedPlayers, "fpsync.update", [player.id, camPitch, camHeading]);
});

mp.events.add("pointingStop", (player:PlayerMp) => {
    //player.stopAnimation();
    mp.players.call(player.streamedPlayers, "fpsync.stop", [player.id]);
});
