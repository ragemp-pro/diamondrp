import { gui } from "../modules/gui";
import { user } from "../user";
import { phone } from "../phone";

let spamBlock = false;

function spbl(){
    spamBlock = true;
    setTimeout(() => {
        spamBlock = false;
    }, 2000)
}

setInterval(() => {
    if(spamBlock) return;
    if(user.isDead()) return;
    const player = mp.players.local
    let dictphone = "cellphone@"
    if (mp.players.local.vehicle) dictphone += "in_car@ds";
    const playphoneanim = player.isPlayingAnim(dictphone, 'cellphone_text_read_base', 3)
    // Tablet
    if (gui.currentGui == 'tablet'){
        if (!playphoneanim){
            user.playAnimation(dictphone, 'cellphone_text_read_base', 49, true)
            spbl()
        }
    } else if (phone.isPhoneOpen()){
        if (!playphoneanim) {
            user.playAnimation(dictphone, 'cellphone_text_read_base', 49, true)
            spbl()
        }
    } else if (playphoneanim){
        user.stopAllAnimation();
        spbl()
    }
}, 100);