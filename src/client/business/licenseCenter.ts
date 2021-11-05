/// <reference path="../../declaration/client.ts" />

let licenseCenter = {
    buy: function(type: string, price: number) {
        mp.events.callRemote('server:licenseCenter:buy', type, price);
    }
};

export { licenseCenter };
