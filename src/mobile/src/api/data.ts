import { App } from "../components/App";
import { SiteLog } from "../../../util/mobiledata";

setInterval(() => {
    console.log("Current path", user.path)
}, 3000)

export const user = {
    data: {
        login: "",
        passToken: 0,
    },
    path: "/",
    setPath: (url:string) => {
        user.path = url;
        user.mainComponent.forceUpdate();
    },
    mainComponent: <App> null,
    putMainComponent: (item: App) => {
        user.mainComponent = item;
    },
    check: () => {
        fetch('/mobile/checktoken?login=' + user.data.login + "&token=" + user.data.passToken).then(datas => {
            datas.json().then(data => {
                if (!data.err) return user.setPath('/main'), user.notify("Успешная авторизация", "success");
                user.data = {
                    login: "",
                    passToken: 0,
                }
                user.setPath('/auth')
                return user.notify(data.err, "error");
            })
        })
    },
    setLoginToken: (login: string, token: number) => {
        user.data.login = login;
        user.data.passToken = token;
        localStorage.setItem("login", login);
        localStorage.setItem("passToken", token.toString());
        user.check()
    },
    auth: (login:string,pass:string) => {
        fetch('/mobile/check?login='+login+"&pass="+pass).then(datas => {
            datas.json().then(data => {
                if (data.err) return user.notify(data.err, "error");
                user.setLoginToken(data.login, data.token);
            })
        })
    },
    loadData: (path:string):Promise<{[param:string]:any}> => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/data?path='+path+'&login=' + user.data.login + "&token=" + user.data.passToken).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(data)
                    user.data = {
                        login: "",
                        passToken: 0,
                    }
                    user.setPath('/auth')
                })
            })
        })
    },
    setXParam: (name:string,value:boolean) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/setx?login=' + user.data.login + "&token=" + user.data.passToken+'&name='+name+"&value="+Number(value)).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                    user.data = {
                        login: "",
                        passToken: 0,
                    }
                    user.setPath('/auth')
                })
            })
        })
    },
    removeWarn: (id:number) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/removewarn?login=' + user.data.login + "&token=" + user.data.passToken+'&name='+name+"&id="+id).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    blackList: (id:number, reason:string) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/blacklist?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&id=" + id + "&reason=" + reason).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    whiteList: (id:string) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/whitelist?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&social=" + id).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    blackListRM: (id:number) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/blackListRM?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&id=" + id).then(datas => {
                datas.json().then(data => {
                    console.log(data)
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    kickUser: (id:number) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/kickUser?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&id=" + id).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    addMoney: (id:number,sum:number) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/addMoney?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&id=" + id + "&sum=" + sum).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    removeMoney: (id:number,sum:number) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/removeMoney?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&id=" + id + "&sum=" + sum).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    promocodes: (promo:string):Promise<number> => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/promocodes?login=' + user.data.login + "&token=" + user.data.passToken + '&promo=' + promo).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(data.ok), user.notify('Количество активаций [' + promo + ']: ' + data.ok)
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    siteBuyLog: (): Promise<SiteLog[]> => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/siteBuyLog?login=' + user.data.login + "&token=" + user.data.passToken).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(data.ok)
                    else user.notify(data.err, "error"), resolve([])
                })
            })
        })
    },
    reboot: (min:number,reason:string) => {
        return new Promise((resolve, reject) => {
            fetch('/mobile/reboot?login=' + user.data.login + "&token=" + user.data.passToken + '&name=' + name + "&min=" + min + "&reason=" + reason).then(datas => {
                datas.json().then(data => {
                    if (!data.err) return resolve(true), user.notify('Успешно')
                    else user.notify(data.err, "error")
                })
            })
        })
    },
    init: () => {
        if (localStorage.getItem('login') && localStorage.getItem('passToken')) user.setLoginToken(localStorage.getItem('login'), parseInt(localStorage.getItem('passToken')))
        else user.setPath('/auth')
    },
    notify: (text: string, type: "success" | "info" | "warn" | "error" = "info") => {
        // @ts-ignore
        $.notify(text, type);
    },
    accept: (text: string) => {
        return window.confirm(text)
    },
    input: (text: string) => {
        return window.prompt(text)
    }
}