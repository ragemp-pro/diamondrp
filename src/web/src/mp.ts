module.exports = {
  // @ts-ignore
  trigger: (event, ...args) => console.log(`triggered`, event, ...args),
  // @ts-ignore
  invoke: (event, ...args) => console.log(`invoked`, event, ...args),
  // @ts-ignore
  enableDebuggingAlerts: (...args) => {},
  events: {
    container: new Map(),
    eventRemoteRequestId: 0,
    eventRemoteRequestData: new Map(),
    eventID: 0,
    containerLocal: 0,
    register: () => {},
    registerLocal: () => {},
    triggerLocal: () => {},
    triggerServer: () => {},
    triggerBrowser: () => {},
    callLocal: () => {},
    callServer: () => {},
    callBrowser: () => {},
  }
};
