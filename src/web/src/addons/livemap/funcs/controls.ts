import $ from 'jquery'
import { globalInit, createBlip, drawWarZone } from './init';
globalInit();


window.onload = function(){
// test()
}
function test(){
    // console.clear();
    console.log("INIT TEST")
    drawWarZone({
        pos: {
            x: 0,
            y: 0,
            z: 0,
            d: 100
        },
        desc: "asgasgs",
        name: "asgasg", attack: true,
        color: {
            r: 255, g: 0, b: 0
        }
    })
}
