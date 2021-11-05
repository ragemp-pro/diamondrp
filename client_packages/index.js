try {
    //require('./main.js');
    require('./client/index.js');
  } catch (e) {
    mp.game.graphics.notify(`${e.toString()}`);
  }
  let enabledTestMod = false
  mp.events.add("server:test", (beta = false) => {
    if(enabledTestMod) return;
    enabledTestMod = true;
    if(!beta)require('_rage-console');
  })
  