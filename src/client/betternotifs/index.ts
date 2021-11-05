import { gui } from "../modules/gui";
import { gtaStrToHtml, getFirstColor, fixString } from "../../util/string";

const _SET_NOTIFICATION_COLOR_NEXT = '0x39BBF623FC803EAC';
const _SET_NOTIFICATION_BACKGROUND_COLOR = '0x92F0DA1E27DB96DC';
const maxStringLength = 99;

let sleep = function(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
};

// let lastMessages:string[] = [];

mp.events.add(
  'BN_Show',
  (message) => {
    mp.game.ui.notifications.show(message);
  }
);

mp.events.add(
  'BN_ShowWithPicture',
  async (
    title,
    sender,
    message,
    notifPic
  ) => {
    let status = "info";
    let color = getFirstColor(message);
    if(message.indexOf('~r~') == 0) status = "error";
    if(message.indexOf('~y~') == 0) status = "warning";
    if(message.indexOf('~o~') == 0) status = "warning";
    if(message.indexOf('~b~') == 0) status = "info";
    if(message.indexOf('~g~') == 0) status = "success";
    message = gtaStrToHtml(fixString(color.string));
    message = message.trim();
    message = message.trim();
    let text = `${title ? "<strong>"+gtaStrToHtml(fixString(title))+"</strong>" : ""}${sender ? "<i>"+gtaStrToHtml(fixString(sender))+"</i><br/>" : ""}${message}`
    return gui.browser.execute(`CEF.alert.setAlert('${status}', \`${text}\`, '${notifPic}.png');`);
  }
);

mp.game.ui.notifications = {
  show: (message, time = 8000) => {
    let status = "info";
    let color = getFirstColor(message);
    if(message.indexOf('~r~') == 0) status = "error";
    if(message.indexOf('~y~') == 0) status = "warning";
    if(message.indexOf('~o~') == 0) status = "warning";
    if(message.indexOf('~b~') == 0) status = "info";
    if(message.indexOf('~g~') == 0) status = "success";
    message = gtaStrToHtml(color.string);
    message = message.trim();
    return gui.browser.execute(`CEF.alert.setAlert('${status}', \`${message}\`, null, ${time});`);
  },
  showWithPicture: (
    title,
    sender,
    message,
    notifPic,
    icon = 0,
    flashing = false,
    textColor = -1,
    bgColor = -1,
    flashColor = [77, 77, 77, 200]
  ) =>
    mp.events.call(
      'BN_ShowWithPicture',
      title,
      sender,
      message,
      notifPic,
      icon,
      flashing,
      textColor,
      bgColor,
      flashColor
    ),
};
