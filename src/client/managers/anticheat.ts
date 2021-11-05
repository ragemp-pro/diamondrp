import { user } from "../user";

let timeRender = 1;
let timeRenderOld = 0;
let timeRenderCountWarning = 0;
// mp.events.add("render", () => {
//   timeRender++;
// })
// setInterval(() => {
//   if(!user.isLogin()) return;
//   if(timeRender == timeRenderOld) timeRenderCountWarning++;
//   else timeRenderOld = timeRender, timeRenderCountWarning = 0;

//   if(timeRenderCountWarning > 3){
//     user.setVariable("collapsedGame", true);
//   } else if(mp.players.local.getVariable("collapsedGame")) user.setVariable("collapsedGame", false);
// }, 1000)