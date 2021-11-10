'use strict';
var menu = require('console-menu');
let exec = require('child_process').exec
let title = "Обновление системы";
const fs = require('fs-extra')
let hotkeyid = 1;
let items = [];
console.clear();
function addItem(name, handle){
    items.push({
        hotkey: `${hotkeyid}`,
        title: name,
        handle
    })
    hotkeyid++;
}
function addSeparator(){
    items.push({
        separator: true
    })
}

addItem("Проверка конфигов", () => {
    checkConfig()
    openMenu()
})
addItem("Скопировать конфиги", () => {
    runproduction().then(() => {
        openMenu()
    })
})
addSeparator()
addItem("GIT Pull", () => {
    gitPull().then(() => {
        openMenu()
    })
})
addSeparator()
addItem("npm i", () => {
    npmi().then(() => {
        openMenu()
    })
})
addItem("npm run production", () => {
    runproduction().then(() => {
        openMenu()
    })
})
addSeparator()
addItem("Глобальная заливка обновления", () => {
    globalupdate().then(() => {
        openMenu()
    })
})
addSeparator()
addItem("Залить аддоны [RAGE BETA]", () => {
    copyaddonsnew().then(() => {
        openMenu()
    })
})
addItem("Залить аддоны [RAGE OLD]", () => {
    copyaddonsold().then(() => {
        openMenu()
    })
})
addSeparator()
addItem("Полноценное обновление [RAGE BETA]", () => {
    globalupdate().then(() => {
        copyaddonsnew().then(() => {
            openMenu()
        })
    })
})
addItem("Полноценное обновление [RAGE OLD]", () => {
    globalupdate().then(() => {
        copyaddonsold().then(() => {
            openMenu()
        })
    })
})
addSeparator()
addItem("Обновление сайта логов", () => {
    exec('cd ../logs && git pull && npm i && npm run build', () => {
        exec('pm2 restart ../logs/process.json', (err, end) => {
            console.log(end)
            console.info('Сайт с логами перезапущен')
            openMenu()
        });
    });
})
addSeparator()
let conftest = require('./conf.json');
if(conftest){
    if (!conftest.announce) {
        addItem("Перезапустить сервер [RAGE BETA]", () => {
            exec('chmod +x ./ragemp-server', () => {
                exec('pm2 restart ./process_beta.json', () => {
                    console.info('Сервер успешно перезапущен')
                    openMenu()
                });
            });
        })
        addItem("Перезапустить сервер [RAGE OLD]", () => {
            exec('chmod +x ./server', () => {
                exec('pm2 restart ./process.json', () => {
                    console.info('Сервер успешно перезапущен')
                    openMenu()
                });
            });
        })
        addSeparator()
    }
}
addItem("Выход", () => {
    process.exit();
})

function openMenu(){
    console.log('=============================');
    menu([...items], {
        header: title,
        border: true,
    }).then(item => {
        if (item && item.handle) {
            return item.handle();
        }
    });
}

function checkConfig(){
    let conf = require('./conf.json');
    let mysql = require('./src/server/config/mysql.json');
    if (!conf) {
        console.error("Конфиг сервера недоступен");
    } else {
        console.info(`Статус конфига сервера: ${!conf.announce ? 'Тестовый' : 'Продакшн'}`)
    }
    if (!mysql) {
        console.error("Конфиг базы данных недоступен");
    } else {
        console.info(`Конфиг базы данных доступен`)
    }
}

function globalupdate() {
    return new Promise((resolve, reject) => {
        gitPull().then(() => {
            npmi().then(() => {
                copyconfig().then(() => {
                    runproduction().then(() => {
                        resolve()
                    })
                })
            })
        })
    })
}
function gitPull(){
    return new Promise((resolve, reject) => {
        exec('git pull', (err, end) => {
            console.log(end)
            resolve()
        })
    })
}
function npmi(){
    return new Promise((resolve, reject) => {
        exec('npm i', (err, end) => {
            console.log(end)
            resolve()
        })
    })
}
function runproduction() {
    return new Promise((resolve, reject) => {
        exec('npm run production', (err, end) => {
            console.log(end)
            resolve()
        })
    })
}
function copyaddonsold() {
    return new Promise((resolve, reject) => {
        fs.rmdir('./client_packages/game_resources/dlcpacks');
        fs.copy('./src/addons', './client_packages/dlcpacks', function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Файлы скопированы!");
            }
            resolve()
        });
    })
}
function copyaddonsnew() {
    return new Promise((resolve, reject) => {
        fs.rmdir('./client_packages/dlcpacks');
        fs.copy('./src/addons', './client_packages/game_resources/dlcpacks', function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Файлы скопированы!");
            }
            resolve()
        });
    })
}
function copyconfig() {
    return new Promise((resolve, reject) => {
        fs.copy('../configs/conf.json', './conf.json', function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Файл конфига сервера скопирован!");
            }
            fs.copy('../configs/mysql.json', './src/server/config/mysql.json', function (err2) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Файл конфига БД скопирован!");
                }
                resolve()
            });
        });
    })
}

openMenu();
