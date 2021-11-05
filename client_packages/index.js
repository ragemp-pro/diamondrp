
try {
    require('./client.js');
} catch(e) {
    mp.game.graphics.notify(e.toString());
}