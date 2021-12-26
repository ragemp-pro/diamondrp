/// <reference path="../declaration/server.ts" />
import httpServer from 'http';
import socketServer from 'socket.io';
import ip from 'ip';
import { methods } from './modules/methods';
import { chat } from './modules/chat';
import { user } from './user';

let socketHandleList:[string, (player: PlayerMp,...args:any[])=>void][] = []
mp.events.addSocket = (name, handle) => {
  console.log("REGISTER SOCKET EVENT", name)
  socketHandleList.push([name, handle]);
  mp.events.add(name, handle)
}


let http = httpServer.createServer();
let ip_address = ip.address();

export const socketPort = 3400;

http.listen(socketPort, function(){
  console.log(`listening on *: ${socketPort}`);
  methods.saveLog('socket', `listening on ${socketPort}`);
});

const io = socketServer(http);

const isMpEntity = (entity: any | EntityMp) => {
  if (!entity || typeof entity !== 'object') {
    return false;
  }

  return (
    mp.players.exists(entity as PlayerMp) ||
    mp.vehicles.exists(entity as VehicleMp) ||
    mp.objects.exists(entity as ObjectMp) ||
    mp.colshapes.exists(entity as ColshapeMp) ||
    mp.blips.exists(entity as BlipMp) ||
    mp.checkpoints.exists(entity as CheckpointMp) ||
    mp.labels.exists(entity as TextLabelMp) ||
    mp.markers.exists(entity as MarkerMp)
  );
};

mp.events.addSocket("test", (player) => {
  console.log("test", player.id)
})

mp.events.add("playerJoin", (player: PlayerMp) => {
  player.socketConnected = false
  player.callsocket = (event, args) => {
    player.call(event, args)
  }
  // socketInit(player);
});

io.on('connection', (socket) => {
  // methods.saveLog('socket', `socket connection step 1: ${socket.handshake.query.rageKey} | ${socket.handshake.query.rageId}`);

  if (!socket.handshake.query.rageKey) {
    methods.saveLog('socket', `socket connection step 2: rageKey NotFound`);
    return socket.disconnect(true);
  }

  let player = mp.players.at(methods.parseInt(socket.handshake.query.rageId));

  if (!player || !mp.players.exists(player)) {
    methods.saveLog('socket', `socket connection step 3: player not found`);
    return socket.disconnect(true);
  }

  methods.saveLog('socket', `socket connection step 4: player found ${player.name}`);

  if (!player.socketAdvancedLog && player.socketKey !== socket.handshake.query.rageKey) {
    methods.saveLog('socket', `socket connection step 5: rageKey not equal with player.socketKey`);
    return socket.disconnect(true);
  }

  // if (!player.socket) {
  //   player.notify('Socket.IO протокол передачи данных активирован');
  // }

  player.socket = socket;
  player.socketConnected = true
  player.callsocket = (event, args) => {
    if (!player.socketConnected) return player.call(event, args);
    if (player.socket != socket) return;
    const parsedArguments: any[] = [];

    if (args) {
      for (const arg of args) {
        if (isMpEntity(arg)) {
          parsedArguments.push({
            '!__type__!': arg.type,
            id: arg.id
          });
        } else {
          parsedArguments.push(arg);
        }
      }
    }

    player.socket.emit('eventClient', event, JSON.stringify(parsedArguments));
    
  };

  socket.on('disconnect', () => {
    player.socketConnected = false
  })

  socket.on('eventServer', (event: string, jsArgs: string) => {
    const args = JSON.parse(jsArgs) || [];

    const parsedData:any[] = [];

    for (const arg of args) {
      if (typeof arg === 'object' && typeof arg['!__type__!'] === 'string') {

        // @ts-ignore
        parsedData.push(mp[`${arg['!__type__!']}s`].at(arg.id));
      } else {
        parsedData.push(arg);
      }
    }
    let eventq = socketHandleList.filter(item => item[0] == event)
    if (eventq.length == 0){
      // console.log('socket default call', event, ...parsedData)
      return mp.events.call(event, player, ...parsedData);
    }
    eventq.map(([_,handle]) => {
      // console.log("socket handle", _)
      handle(player, ...parsedData);
    })
  });
});



function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
setTimeout(function () {
  chat.registerCommand('socket', (player, pass, advancedPass) => {
    if (!pass && !user.isAdminNow(player)) {
      return player.notify('~r~Данная команда требует ввода пароля.');
    }
  
    if (pass !== methods.sha256(`SOCKET${user.getId(player).toString()}`).slice(0, 5) && !user.isAdminNow(player)) {
      return player.notify('~r~Пароль указан не верно');
    }
  
    if (player.socket) {
      return player.notify('~r~Socket.IO уже включён');
    }
  
    methods.saveLog('socket', `command: socket ${player.name}`);
  
    socketInit(player, advancedPass === 'xSr37qWdv');
  });
}, 1000)

export function socketInit(player: PlayerMp, advanced: boolean = false) {
  player.socketKey = makeId(25);
  player.socketAdvancedLog = advanced;
  const port = methods.isTestServer() ? 3400 : 80;
  player.call('web:socket', [`http://${ip_address}:${port}/web/socket.html`, socketPort, ip_address, player.socketKey, advanced]);
  methods.saveLog('socket', `${player.name} call web:socket with ${[socketPort, ip_address, player.socketKey, advanced].join(' | ')}`);
}
