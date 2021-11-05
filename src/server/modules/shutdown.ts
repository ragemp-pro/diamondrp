/// <reference path="../../declaration/server.ts" />
import {methods, lastMessageLog} from '../modules/methods'

mp.events.addCommand('shutdown', () => {
    methods.debug('command.shutdown');
    //process.exit(0);
});

process.on('exit', (code) => {
    let text = `
    --------
    LAST DEBUG
    ${JSON.stringify(lastMessageLog)}
    --------
    `;
    methods.saveLog('exitSave', text);
    if(code==0)
        methods.saveAll();
});

/*process.on('SIGINT', shutdownProcess);  // Runs when you Ctrl + C in console
process.on('SIGHUP', shutdownProcess);  // Runs when you press the 'Close' button on your server.exe window
//process.on('SIGKILL', shutdownProcess);

function shutdownProcess(){
    process.exit(0);
}*/

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });