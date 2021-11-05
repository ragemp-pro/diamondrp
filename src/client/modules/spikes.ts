export {}
const player = mp.players.local;
let regs = false;
mp.events.add('renderHalf', () => {
    if (regs) return;
    if(!player.vehicle) return;
    const veh = player.vehicle;
    // -596599738
    // if (mp.game.invoke('0xBFA48E2FF417213F', ))
    let obj = mp.game.object.getClosestObjectOfType(
        player.vehicle.position.x,
        player.vehicle.position.y,
        player.vehicle.position.z,
        10.0,
        -596599738,
        false,
        false,
        false
    )
    if (!obj) return;
    if (veh.isTouching(obj)){
        regs = true;
        veh.setTyreBurst(0, false, 1000);
        veh.setTyreBurst(1, false, 1000);
        veh.setTyreBurst(4, false, 1000);
        veh.setTyreBurst(5, false, 1000);
        veh.setBurnout(true);
        setTimeout(_ => {
            veh.setBurnout(false);
            setTimeout(_ => {
                regs = false;
            }, 2000)
        }, 2000)
    }
})