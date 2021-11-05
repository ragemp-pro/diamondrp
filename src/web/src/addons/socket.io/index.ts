import io from 'socket.io-client';

const log = (...args: any[]) => {
  mp.trigger('socket.web.log', ...args);
};

try {
  let socket: SocketIOClient.Socket;

  window.initSocketSystem = (url: string, id: number, key: string) => {
    log('Start initSocketSystem');

    socket = io(url, {
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax : 500,
      reconnectionAttempts: Infinity,
      query: {
        rageKey: key,
        rageId: id
      }
    });

    log('init eventClient');
    socket.on('eventClient', (name: string, jsArgs: string) => mp.trigger('socketEvent', name, jsArgs));

    log('init connect');
    socket.on('connect', () => {
      log('socket:connected');
      mp.trigger('socket:connected');
    });

    window.callRemote = (name: string, jsArgs: string) => socket.emit("eventServer", name, jsArgs);
  };

  mp.trigger('socketBrowserInit');
  log('call socketBrowserInit');
} catch (e) {
  log(`error: ${e.message}`);
}
