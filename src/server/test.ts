import { menu } from "./modules/menu"
import { user } from "./user";
import { methods } from "./modules/methods";
import { socketInit } from "./socket";

mp.events.addRemoteCounted("server:user:testSetting", (player) => {
  let m = menu.new(player, "Экспериментальные\nфункции", "Список");
  if(!player.socket){
    m.newItem({
      name: "Socket.IO Передача данных",
      desc: "Включить педачу данных через протокол Socket",
      onpress: async () => {
        if(!user.isAdminNow(player)){
          let pass = await menu.input(player, "Введите пароль, выданный администратором");
          if(!pass) return;
          if(pass != methods.sha256("SOCKET"+user.getId(player).toString()).slice(0, 5)) return player.notify("~r~Пароль указан не верно");
        }
        if(player.socket) return player.notify("~r~Socket.IO уже включён");
        socketInit(player);
      }
    })
  }
  if(user.isAdminNow(player)){
    m.newItem({
      name: "Создать пароль для игрока",
      more: "Socket.IO",
      desc: "Этот пароль нужен для включения SocketIO",
      onpress: () => {
        menu.input(player, "Введите ID").then(ids => {
          if(!ids) return;
          menu.input(player, "Скопируйте пароль и скиньте его игроку", methods.sha256("SOCKET"+ids).slice(0, 5))
        })
      }
    })
    m.newItem({
      name: "Тест реги",
      onpress: () => { player.call('regtest')}
    })
    m.newItem({
      name: "Тест ПК",
      onpress: () => user.testPC(player)
    })
  }
  m.newItem({
    name: "Тест соединения",
    more: "Ping",
    onpress: () => user.testNet(player)
  })

  m.open()
})