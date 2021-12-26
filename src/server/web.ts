/// <reference path="../declaration/server.ts" />
import fs from 'fs';
import ip from 'ip';
let ip_address = ip.address();
import express from 'express';
import { getRandomInt } from '../util/methods';
import { methods } from './modules/methods';
import { user } from './user';
import { items } from './items';
import fetch from 'node-fetch';
import { RAGE_BETA } from '../util/newrage';
export let app = express();

app.get("/serverstat", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  res.send({
    players: mp.players.length,
    admins: mp.players.toArray().map(player => {
      if(user.isAdmin(player)) return player;
    }).length
  })
})

app.get("/items", (req, res) => {
  let itemsText = ``;
  items.itemList.forEach((item, index) => {
    itemsText+=`ID: ${index} | Name: ${item[0]}<br/>`
  })
  res.send(itemsText)
})


app.use('/', express.static('./web'));


setTimeout(() => {
  fetch('https://api.ipify.org?format=json').then(q => {
    q.json().then((data:{ip:string}) => {
      ip_address = data.ip
      console.log("REGISTER IP", ip_address)
    })
  })
}, 100)
mp.events.add('playerJoin', (player: PlayerMp) => {
  const resip = (player.ip == "127.0.0.1") ? "127.0.0.1" : ip_address;
  let port = methods.isTestServer() ? 3400 : 80; // // Порт 3400 (тест) или 80 (прод)
  // player.call('web:loadMenuBrowser', [`http://${ip_address}:${port}/cefmenu/index.html`]);
  // player.call('web:loadVoiceBrowser', [`https://voice.diamondbots.ru/client`, randomKeyVoice]);

  player.call('web:browsers:urls', [
    [`http://${resip}:${port}/web/index.html${RAGE_BETA ? '?ragebeta' : ''}`,
      `http://${resip}:${port}/menu/index.html${RAGE_BETA ? '?ragebeta' : ''}`,
      `http://${resip}:${port}/phone/phone.html${RAGE_BETA ? '?ragebeta' : ''}`,
      `http://${resip}:${port}/web/custom_sound.html${RAGE_BETA ? '?ragebeta' : ''}`,
      `http://${resip}:${port}/minigames/`]
  ])
});


// Порт 3400 (тест) или 80 (прод)
app.listen(3400, function() {
  // console.log('Web Express Server runned');
});