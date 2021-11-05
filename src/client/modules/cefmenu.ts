export {}
let browser:BrowserMp;
mp.events.add('web:loadMenuBrowser', (url) => {
  browser = mp.browsers.new(url);
})

class Menu {
  
}