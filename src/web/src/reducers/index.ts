const reducers = {};

const req = require.context('.', true, /\.ts$/);

req.keys().forEach((key) => {
  const storeName = key.replace(/\.\/(.+)\.ts$/, '$1');
  // @ts-ignore
  storeName != 'index' ? (reducers[storeName] = req(key).default) : false;
});

export default reducers;
