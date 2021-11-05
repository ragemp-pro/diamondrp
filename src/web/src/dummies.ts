if (!window.mp) {
  window.mp = {
    // @ts-ignore
    trigger: (event, ...args) => console.log(`triggered`, event, ...args),
    // @ts-ignore
    invoke: (event, ...args) => console.log(`invoked`, event, ...args),
    // @ts-ignore
    enableDebuggingAlerts: (...args) => {},
  };
}
