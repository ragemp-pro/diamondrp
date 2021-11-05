const thisInfo: {
  browser: BrowserMp;
  port: number;
  ip: string;
  key: string;
  advancedLog: boolean;
} = {
  browser: null,
  port: null,
  ip: null,
  key: null,
  advancedLog: false
};

mp.events.add("web:socket", (url: string, port: number, ip: string, key: string, advancedLog: boolean) => {
  if (advancedLog) {
    mp.gui.chat.push(`web:socket ${port} ${ip} ${key}`);
  }

  thisInfo.advancedLog = advancedLog;

  thisInfo.port = port;
  thisInfo.ip = ip;
  thisInfo.key = key;
  thisInfo.browser = mp.browsers.new(url);
});

mp.events.add('socketBrowserInit', () => {
  if (thisInfo.advancedLog) {
    mp.gui.chat.push(`socketBrowserInit called`);
  }

  thisInfo.browser.execute(`initSocketSystem('ws://${thisInfo.ip}:${thisInfo.port}', ${mp.players.local.remoteId}, '${thisInfo.key}');`);
});

const isMpEntity = (entity: any | EntityMp) => {
  if (!entity || typeof entity !== 'object' || typeof entity.remoteId !== 'number' || entity.remoteId === 65535) {
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

mp.events.add('socket.web.log', (...args) => {
  if (thisInfo.advancedLog) {
    mp.gui.chat.push(`web: ${args.join(' ')}`);
  }
});

mp.events.callSocket = mp.events.callRemote;

mp.events.add('socket:connected', () => {
  if (thisInfo.advancedLog) {
    mp.gui.chat.push(`socket:connected called`);
  }

  mp.events.callSocket = (event: string, ...args:any[]) => {
    
    const parsedArguments: any[] = [];

    for (const arg of args) {
      if (isMpEntity(arg)) {
        parsedArguments.push({
          '!__type__!': arg.type,
          id: arg.remoteId
        });
      } else {
        parsedArguments.push(arg);
      }
    }
    let str = `callRemote('${event}', '${JSON.stringify(parsedArguments)}');`;
    // mp.console.logInfo("callSocket", event, ...args);
    // mp.console.logInfo(str)
    thisInfo.browser.execute(str)
  };

  if (thisInfo.advancedLog) {
    mp.gui.chat.push(`socket:connected ended`);
  }
});

mp.events.add('socketEvent', (name: string, jsArgs: string) => {
  let data = JSON.parse(jsArgs);

  try {
    const parsedData = [];

    for (const arg of data) {
      if (typeof arg === 'object' && typeof arg['!__type__!'] === 'string') {

        // @ts-ignore
        parsedData.push(mp[`${arg['!__type__!']}s`].at(arg.id));
      } else {
        parsedData.push(arg);
      }
    }

    mp.events.call(name, ...parsedData);
  } catch (error) {

  }
});

