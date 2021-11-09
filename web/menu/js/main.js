'use strict';

var menuItems = [
    {
        id   : 'do',
        title: 'Действия',
        icon: '#people',
        items: [
            {
                id   : 'giveMoney',
                icon: '#money',
                title: 'Передать'
            },
            {
                id   : 'friend',
                icon : '#friend',
                title: 'Знакомство'
            },
            {
                id   : 'uncuff',
                title: 'Снять',
                icon: '#cuff'
            },
            {
                id   : 'cuff',
                title: 'Надеть',
                icon: '#cuff'
            },
            {
                id   : 'inCar',
                title: 'Затащить',
                icon: '#car'
            },
            {
                id   : 'outCar',
                title: 'Вытащить',
                icon: '#car'
            },
            {
                id   : 'more',
                icon : '#more',
                title: 'Еще',
                items: [
                    {
                        id   : 'takeGun',
                        icon: '#gun',
                        title: 'Изъять оружие'
                    },
                    {
                        id   : 'takeMask',
                        title: 'Снять маску',
                        icon: '#mask'
                    },
                    {
                        id   : 'followUs',
                        icon : '#follow',
                        title: 'Вести за собой'
                    }
                ]
            }
        ]
    },
    {
        id   : 'run',
        icon   : '#docs',
        title: 'Документы',
        items: [
            {
                id   : 'showGosDoc',
                title: 'Удостоверение'
            },
            {
                id   : 'showCardId',
                title: 'Паспорт'
            },
            {
                id   : 'showLic',
                title: 'Лицензии'
            }
        ]
    },
    {
        id   : 'home',
        title: 'Главная',
        icon: '#home',
        items: [
            {
                id   : 'report',
                icon   : '#report',
                title: 'Жалоба'
            },
            {
                id   : 'ask',
                icon   : '#ask',
                title: 'Вопрос'
            },
            {
                id   : 'faq',
                icon   : '#faq',
                title: 'Справка'
            },
            {
                id   : 'settings',
                icon   : '#settings',
                title: 'Настройки'
            }
        ]
    },
    {
        id   : 'carMenu',
        title: 'Транспорт',
        icon: '#car',
        items: [
            {
                id   : 'leftIndicator',
                icon   : '#leftArrow',
                title: 'Поворотник'
            },
            {
                id   : 'lockV',
                icon   : '#carLock',
                title: 'Открыть / Закрыть'
            },
            {
                id   : 'rightIndicator',
                icon   : '#rightArrow',
                title: 'Поворотник'
            },
            {
                id   : 'twoIndicator',
                icon   : '#twoLight',
                title: 'Аварийка'
            },
        ]
    },
    {
        id   : 'anim',
        title: 'Анимации',
        icon: '#anim',
        items: [
            {
                id   : 'animDo',
                title: 'Действия',
                items: [
                    {
                        id   : 'animDo1',
                        title: 'Поднять руки'
                    },
                    {
                        id   : 'animDo2',
                        title: 'Воен. приветсвие'
                    },
                    {
                        id   : 'animDo3',
                        title: 'Согласиться'
                    },
                    {
                        id   : 'animDo4',
                        title: 'Отказать'
                    },
                    {
                        id   : 'animDo5',
                        title: 'Рука на кобуре'
                    },
                ]
            },
            {
                id   : 'animPose',
                title: 'Позирующие',
                items: [
                    {
                        id   : 'animPose1',
                        title: 'Распальцовка'
                    },
                    {
                        id   : 'animPose2',
                        title: 'Руки в боки'
                    },
                    {
                        id   : 'animPose3',
                        title: 'Охранник'
                    },
                    {
                        id   : 'animPose4',
                        title: 'Размяться'
                    },
                    {
                        id   : 'animPose5',
                        title: 'Лечь'
                    },
                ]
            },
            {
                id   : 'animEmoji',
                title: 'Эмоции',
                items: [
                    {
                        id   : 'animEmoji1',
                        title: 'Радоваться'
                    },
                    {
                        id   : 'animEmoji2',
                        title: 'Поддержать'
                    },
                    {
                        id   : 'animEmoji3',
                        title: 'Уважение'
                    },
                    {
                        id   : 'animEmoji4',
                        title: 'Разочароваться'
                    },
                    {
                        id   : 'animEmoji5',
                        title: 'Дурак'
                    },
                ]
            },
            {
                id   : 'animDance',
                title: 'Танцы',
                items: [
                    {
                        id   : 'animDance1',
                        title: 'Танец-1'
                    },
                    {
                        id   : 'animDance2',
                        title: 'Танец-2'
                    },
                    {
                        id   : 'animDance3',
                        title: 'Танец-3'
                    },
                    {
                        id   : 'animDance4',
                        title: 'Танец-4'
                    },
                    {
                        id   : 'animDance5',
                        title: 'Танец-5'
                    },
                    {
                        id   : 'animDance6',
                        title: 'Танец-6'
                    },
                    {
                        id   : 'animDance7',
                        title: 'Танец-7'
                    },
                    {
                        id   : 'animDance8',
                        title: 'Танец-8'
                    }
                ]
            },
            {
                id   : 'animDoPlayer',
                title: 'С игроком',
                items: [
                    {
                        id   : 'animDoPlayer4',
                        title: 'Поцелуй'
                    },
                    {
                        id   : 'animDoPlayer1',
                        title: 'Подзороваться 1'
                    },
                    {
                        id   : 'animDoPlayer3',
                        title: 'Дать пять'
                    },
                    {
                        id   : 'animDoPlayer2',
                        title: 'Подзороваться 2'
                    },
                ]
            },
            {
                id   : 'animAll',
                title: 'Все анимации'
            },
            {
                id   : 'animStop',
                title: 'Остановить'
            }
        ]
    },
    {
        id: 'donate',
        title: 'Донат',
        icon: '#money'
    },
    {
        id: 'gps',
        title: 'GPS',
        icon: '#gps'
    }
];

var menuItems2 = [
    {
        id   : 'run',
        title: 'Run'
    }
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let svgMenu = null;
let openAgain = false;

window.onload = function () {

    let sizeMenu = screen.height / 2.8;
    if (sizeMenu < 350)
        sizeMenu = 350;

    svgMenu = new RadialMenu({
        parent      : document.body,
        size        : sizeMenu,
        closeOnClick: true,
        menuItems   : menuItems,
        onClick     : function (item) {

            if (item.id == 'giveMoney' || item.id == 'showGosDoc' || item.id == 'showCardId' || item.id == 'showLic' || item.id == 'friend' || item.id == 'animDoPlayer') {
                openAgain = true;
                setTimeout(function () {
                    openAgain = false;
                    mp.trigger('client:uimenu:trigger', item.id);
                }, 500);
            }
            else
                mp.trigger('client:uimenu:trigger', item.id);

            console.log('You have clicked:', item.id);
        }
    });

    /*var openMenu = document.getElementById('openMenu');
    openMenu.onclick = function () {
        svgMenu.open();
    };

    var closeMenu = document.getElementById('closeMenu');
    closeMenu.onclick = function () {
        svgMenu.close();
    };*/
};

function eventSend(data) {
    try {
        if (data.type == 'show') {
            svgMenu.open();
        }
        else if (data.type == 'hide') {
            svgMenu.close();
        }
        else if (data.type == 'showIdsMenu') {

            try {

                if (data.menuList.length > 0) {
                    svgMenu.menuItems = data.menuList;
                    svgMenu.open();
                }
                else {
                    svgMenu.menuItems = menuItems;
                    mp.trigger('client:uimenu:hide');
                }
            }
            catch (e) {
                mp.trigger('client:console', e);

            }
        }
    } catch (e) {
        
    }
}

document.addEventListener('onClose', function () {
    svgMenu.menuItems = menuItems;
    if (openAgain)
        return;
    //console.log('CLOSE');
    mp.trigger('client:uimenu:hide');
});