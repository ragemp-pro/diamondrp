/// <reference path="../../declaration/client.ts" />
/// <reference path="../../declaration/shared.d.ts" />
export {}
let baseUrl:string;
mp.events.add('web:browsers:urls', (q) => {
  let url = q[4]
  baseUrl = url;
})
let minigameID = 0;

let minigameCb:Map<number,(status:boolean)=>any> = new Map();
let minigameBrowser:Map<number,BrowserMp> = new Map();
let minigameName:Map<string,number> = new Map();

export function playMinigame(name:minigameTypes):Promise<boolean>{
  return new Promise((resolve) => {
    if(minigameName.has(name)) return;
    mp.gui.cursor.show(true, true)
    minigameID++;
    const id = minigameID;
    let browser = mp.browsers.new(baseUrl+name+"/index.html");
    browser.execute("minigameID = "+id+";");
    minigameCb.set(id, resolve)
    minigameName.set(name, id);
    minigameBrowser.set(id, browser)
    setTimeout(() => {
      mp.gui.cursor.visible = true;
    }, 500)
    if(name == "gr6") mp.game.ui.notifications.show("Соберите деньги в сумку")
    else if(name == "wash") mp.game.ui.notifications.show("Вытрите всю грязь тряпкой")
    setTimeout(() => {
      if(!mp.gui.cursor.visible) mp.game.ui.notifications.show("Если курсор не отображается - нажмите F3")
      mp.gui.cursor.visible = true;
    }, 2000)
  })
}

setTimeout(() => {
  mp.events.register("server:playMinigame", (name:minigameTypes) => {
    return playMinigame(name)
  })
}, 100)

mp.keys.bind(0x72, false, () => {
  if([...minigameName].length > 0){
    mp.gui.cursor.visible = true;
  }
});

mp.events.add("minigame:end", (id:number,status:boolean) => {
  mp.gui.cursor.show(false, false)
  if(minigameBrowser.has(id))minigameBrowser.get(id).destroy();
  minigameBrowser.delete(id)
  if(minigameCb.has(id))minigameCb.get(id)(status);
  minigameName.forEach((ids,name) => {
    if(ids == id) minigameName.delete(name);
  })
  minigameCb.delete(id)
})
