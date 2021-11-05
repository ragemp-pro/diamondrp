/// <reference path="../declaration/client.ts" />

const chat = {
  clRed: '#f44336',
  clBlue: '#2196F3',
  clOrange: '#FFC107',
  clWhite: '#FFFFFF',
  clBlack: '#000000',
  
  sendMeCommand: (text: string) => {
    mp.events.callRemote('server:chat:sendMeCommand', text);
  },
    
};

export { chat };
