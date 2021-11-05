import { RAGE_BETA } from "../../util/newrage";

mp.events.add("entityCreated", (entity:EntityMp) => {
    if(entity.type == "ped"){
        const ped:PedMp = <any>entity
        ped.putIntoVehicle = (veh, seat, timeout, speed, flag) => {
            if (!ped.controller) return console.error("Cannot putIntoVehicle without controller")
            if (!mp.players.exists(ped.controller)) return console.error("Controller disconnected");
            if (!mp.vehicles.exists(veh)) return console.error("Vehicle not found");
            if (veh.dist(ped.controller.position) > 300) return console.error("Controller cannot put ped in this vehicle, distance error");
            if (veh.dimension != ped.controller.dimension) return console.error("Controller cannot put ped in this vehicle, dimension error");
            ped.controller.call('seatPedIntoVehicle', [ped.id, veh.id, seat, timeout, speed, flag])
        }
        ped.driveWaypoint = (x, y, z) => {
            if (!ped.controller) return console.error("Cannot putIntoVehicle without controller")
            if (!mp.players.exists(ped.controller)) return console.error("Controller disconnected");
            ped.controller.call('pedDriveWaypoint', [ped.id, x, y, z])
        }
    } else if (entity.type == "player") {
        const player: PlayerMp = <any>entity
        if (RAGE_BETA){
            player.outputChatBox = (text:string) => {
                mp.events.triggerBrowser(player, 'outputChatBox', text)
            }
        }
    } else if (entity.type == "vehicle") {
        const vehicle: VehicleMp = <any>entity
        if (RAGE_BETA){
            vehicle.driverSeat = RAGE_BETA ? 0 : -1
        }
    }
});

