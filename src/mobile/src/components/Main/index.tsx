import { Component, createRef } from "react";
import React from "react";
import { user } from "../../api/data";
import Modal from 'react-modal';
import { UserData } from "../../../../util/mobiledata";
import { fractionUtil } from "../../../../util/fractions";
import { vipStatus } from "../../../../util/vip";
import { tempConfigs } from "../../../../util/tempConfigs";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        backgroundColor: 'black'
    }
};

const xparamsnames = tempConfigs

export class Main extends Component<any, { maxPlayers: number, search: string, xparams: { [param: string]: boolean }, vehicles: number, objects: number, users: UserData[], loaded: boolean, currentModal: string, siteLog: JSX.Element[] }> {
    tm: number;
    search: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        document.title = "Панель администратора"
        this.state = {
            loaded: false, vehicles: 0, objects: 0, users: [], xparams: {}, currentModal: "0", search: "", maxPlayers : 0, siteLog: []
        }
        this.search = createRef();

    }
    loadData() {
        user.loadData('main').then(data => {
            console.log(data)
            this.setState({ loaded: true, ...data  })
            this.siteLog();
        })
    }
    componentDidMount() {
        this.loadData();
        this.tm = setInterval(() => {
            this.loadData();
        }, 5000)
    }
    componentWillUnmount() {
        clearInterval(this.tm)
    }
    xparamDataGen() {
        let items: any[] = []
        for (let name in this.state.xparams) {
            let value = this.state.xparams[name];
            items.push(<tr style={{ cursor: 'pointer' }} key={name} onClick={e => {
                e.preventDefault();
                if (!user.accept("Вы уверены что хотите " + (value ? 'Выключить' : 'Включить') + " " + xparamsnames[name])) return;
                user.setXParam(name, !value).then(() => {
                    this.loadData()
                });
            }}><td>{xparamsnames[name]}</td><td style={{ color: value ? "green" : "yellow" }}>{value ? "Включено" : "Выключено"}</td></tr>)
        }
        return items
    }
    drawUserData(item: UserData, index: number) {
        if (this.state.search) {
            let show = false
            let searchId = parseInt(this.state.search);
            if (!isNaN(searchId) && searchId > 0) {
                if (searchId == item.id || searchId == index) show = true;
                if (searchId == item.fraction) show = true;
            }
            for (let it in item) {
                // @ts-ignore
                let val = item[it];
                if (typeof val == "string") {
                    if (val.indexOf(this.state.search) >= 0) show = true;
                }
            }
            if (fractionUtil.getFractionName(item.fraction) && fractionUtil.getFractionName(item.fraction).indexOf(this.state.search) > -1) show = true;
            if (fractionUtil.getRankName(item.fraction, item.rank) && fractionUtil.getRankName(item.fraction, item.rank).indexOf(this.state.search) > -1) show = true;
            if (!show) return <></>;
        }
        return <><tr key={`user${item.id}`} onClick={e => {
            this.setState({ currentModal: "info_" + item.id })
        }} style={{cursor: "pointer"}}>
            <th scope="row">{(index + 1)}</th>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{fractionUtil.getFractionName(item.fraction)} ({item.fraction})</td>
            <td>{fractionUtil.getRankName(item.fraction, item.rank)} ({item.rank})</td>
            <td>{item.adminLvl} LVL</td>
        </tr>
            <Modal
                isOpen={this.state.currentModal == "info_" + item.id}
                onRequestClose={() => {
                    this.setState({ currentModal: null })
                }}
                style={customStyles}
                contentLabel="Example Modal"
                ariaHideApp={false}
            >
                <h2 className="h2">Подробная информация об игроке {item.name} ({item.id})</h2>
                    ID: {item.id}<br />
                    RP Имя: {item.name}<br />
                    Отыгранное за сутки время: {item.playedTime} ч.<br />
                    Social Club: <img src={"https://a.rsg.sc//n/" + item.social.toLowerCase()} /><a href={"https://ru.socialclub.rockstargames.com/member/" + item.social + "/"} target="_blank">{item.social}</a><br />
                    IP: <a href={"https://ru.infobyip.com/ip-" + item.ip + ".html"} target="_blank">{item.ip}</a><br />
                    IP Регистрации: <a href={"https://ru.infobyip.com/ip-" + item.ip_reg + ".html"} target="_blank">{item.ip_reg}</a><br />
                    Наличка: ${item.money}<br />
                    Банк: ${item.bank} ({item.bankcard})<br />
                    VIP: {item.vip && vipStatus.getVipStatusData(item.vip) ? vipStatus.getVipStatusData(item.vip).name : item.vip}<br />
                    Админ уровень: {item.adminLvl}<br />
                    Хелпер уровень: {item.helperLvl}<br />


                <button className="btn btn-danger" onClick={e => {
                    e.preventDefault();
                    if (user.accept('Кикнуть?')) user.kickUser(item.id)
                }}>Кикнуть</button>
                <button className="btn btn-success" onClick={e => {
                    e.preventDefault();
                    let sum = parseInt(user.input("Введите сумму"))
                    if (isNaN(sum) || sum < 0 || sum > 999999999) return user.notify('Значение указанно не верно', "error")
                    if (user.accept('Дать игроку ' + sum + '$?')) user.addMoney(item.id, sum)
                }}>Выдать наличные</button>
                <button className="btn btn-info" onClick={e => {
                    e.preventDefault();
                    let sum = parseInt(user.input("Введите сумму"))
                    if (isNaN(sum) || sum < 0 || sum > 999999999) return user.notify('Значение указанно не верно', "error")
                    if (user.accept('Отнять у игрока ' + sum + '$?')) user.removeMoney(item.id, sum)
                }}>Забрать наличные</button>
                <button className="btn btn-danger" onClick={e => {
                    this.setState({ currentModal: "giveBl_" + item.id })
                }}>Дать BlackList игроку по ID</button>
                <button className="btn btn-info" onClick={() => {
                    this.setState({ currentModal: null })
                }}>Закрыть</button>

            </Modal>
            <Modal
                isOpen={this.state.currentModal == "giveBl_" + item.id}
                onRequestClose={() => {
                    this.setState({ currentModal: null })
                }}
                style={customStyles}
                contentLabel="Example Modal"
                ariaHideApp={false}
            >
                <h2 className="h2">Дать BlackList игроку {item.name} ({item.id})</h2>
                <form>
                    <input className="form-control" placeholder="Введите причину" id={"blReason" + item.id} />
                    <button className="btn btn-success" onClick={e => {
                        e.preventDefault();
                        user.blackList(item.id, document.getElementById('blReason' + item.id).value)
                    }}>Выполнить</button>
                </form>
                <button className="btn btn-info" onClick={() => {
                    this.setState({ currentModal: "info_" + item.id })
                }}>Закрыть</button>
            </Modal>
        </>
    }
    async siteLog(){
        let res: JSX.Element[] = []
        let items = await user.siteBuyLog()
        items.map((item, index) => {
            res.push(<tr key={`sitelog${item.id}`}>
                <th scope="row">{(index + 1)}</th>
                <td>{item.id}</td>
                <td>{item.user_id}</td>
                <td>{item.action}</td>
                <td>{item.price}</td>
                <td>{item.coins_before}</td>
                <td>{item.coins_after}</td>
                <td>{item.datetime}</td>
            </tr>)
        })
        this.setState({ siteLog: res})
    }
    render() {
        // if(!this.state.loaded) return <>Загрузка данных</>;
        return <><div className="row">
            <div className="col-lg-6">
                <h2 className="h2">Администраторы в сети</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">ID</th>
                            <th scope="col">Уровень</th>
                            <th scope="col">Имя</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.users.filter(player => player.adminLvl > 0).map((item, index) => {
                            return <tr key={`admin${item.id}`}>
                                <th scope="row">{(index + 1)}</th>
                                <td>{item.id}</td>
                                <td>{item.adminLvl}</td>
                                <td>{item.name}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
                <h2 className="h2">Основная информация</h2>
                <table className="table">
                    <tbody>
                    <tr><td>Текущий онлайн</td><td>{this.state.users.length} / {this.state.maxPlayers}</td></tr>
                        <tr><td>Транспорта на карте</td><td>{this.state.vehicles}</td></tr>
                        <tr><td>Объектов на карте</td><td>{this.state.objects}</td></tr>
                    </tbody>
                </table>
                <h2 className="h2">Действия</h2>
                <button className="btn btn-success btn-block" onClick={e => {
                    let code = user.input('Введите промокод');
                    user.promocodes(code);
                }}>Количество активаций промокодов</button>



                <button className="btn btn-info btn-block" onClick={e => {
                    this.setState({ currentModal: "buySiteLogs" })
                }}>История покупок на сайте</button>
                <Modal
                    isOpen={this.state.currentModal == "buySiteLogs"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">История покупок на сайте (Последние 300)</h2>
                    <table className="table" style={{
                        height: '300px',
                        overflow: 'auto',
                        display: 'block',
                        color: 'white',
                    }}>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">ID</th>
                                <th scope="col">Игрок</th>
                                <th scope="col">Действие</th>
                                <th scope="col">Стоимость</th>
                                <th scope="col">Было коинов</th>
                                <th scope="col">Стало коинов</th>
                                <th scope="col">Время</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.siteLog}
                        </tbody>
                    </table>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>



                <button className="btn btn-info btn-block" onClick={e => {
                    this.setState({ currentModal: "warnClear" })
                }}>Очистить варн по ID</button>
                <Modal
                    isOpen={this.state.currentModal == "warnClear"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">Очистить варн по ID</h2>
                    <form>
                        <input className="form-control" placeholder="Введите ID Варна" id="warnId" />
                        <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            user.removeWarn(parseInt(document.getElementById('warnId').value))
                        }}>Удалить варн</button>
                    </form>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>
                <button className="btn btn-success btn-block" onClick={e => {
                    this.setState({ currentModal: "giveWl" })
                }}>Внести Social в белый список WhiteList</button>
                <Modal
                    isOpen={this.state.currentModal == "giveWl"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">Внести Social в белый список WhiteList</h2>
                    <form>
                        <input className="form-control" placeholder="Введите Social" id="wlId" />
                        <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            user.whiteList(document.getElementById('wlId').value)
                        }}>Выполнить</button>
                    </form>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>
                <button className="btn btn-danger btn-block" onClick={e => {
                    this.setState({ currentModal: "giveBl" })
                }}>Дать BlackList игроку по ID</button>
                <Modal
                    isOpen={this.state.currentModal == "giveBl"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">Дать BlackList игроку по ID</h2>
                    <form>
                        <input className="form-control" placeholder="Введите ID Игрока" id="blId" />
                        <input className="form-control" placeholder="Введите причину" id="blReason" />
                        <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            user.blackList(parseInt(document.getElementById('blId').value), document.getElementById('blReason').value)
                        }}>Выполнить</button>
                    </form>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>
                <button className="btn btn-success btn-block" onClick={e => {
                    this.setState({ currentModal: "clearBl" })
                }}>Снять BlackList с игрока по ID</button>
                <Modal
                    isOpen={this.state.currentModal == "clearBl"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">Снять BlackList с игрока по ID</h2>
                    <form>
                        <input className="form-control" placeholder="Введите ID Игрока" id="blIdr" />
                        <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            user.blackListRM(parseInt(document.getElementById('blIdr').value))
                        }}>Выполнить</button>
                    </form>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>
                <button className="btn btn-success btn-block" onClick={e => {
                    this.setState({ currentModal: "reboot" })
                }}>Перезагрузка сервера</button>
                <Modal
                    isOpen={this.state.currentModal == "reboot"}
                    onRequestClose={() => {
                        this.setState({ currentModal: null })
                    }}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={false}
                >
                    <h2 className="h2">Перезагрузка сервера</h2>
                    <form>
                        <input className="form-control" placeholder="Введите количество минут" id="rebootMin" />
                        <input className="form-control" placeholder="Введите причину перезагрузки" id="rebootReason" />
                        <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            user.reboot(parseInt(document.getElementById('rebootMin').value), document.getElementById('rebootReason').value)
                        }}>Выполнить</button>
                    </form>
                    <button className="btn btn-info" onClick={() => {
                        this.setState({ currentModal: null })
                    }}>Закрыть</button>
                </Modal>
                <br/>
                <div className="row">
                    <div className="col-lg-6"><a className="btn btn-success btn-block" target="_blank" href={'/web/livemap.html?adminshow=1&login=' + user.data.login + "&token=" + user.data.passToken}>Карта сервера</a></div>
                    <div className="col-lg-6"><a className="btn btn-success btn-block" target="_blank" href={'/web/livemap.html'}>Карта каптов</a></div>
                </div>
            </div>
            <div className="col-lg-6">
                <h2 className="h2">Настройки X параметров</h2>
                <table className="table">
                    <tbody>
                        {this.xparamDataGen()}
                    </tbody>
                </table>

            </div>
        </div>
            <div className="content">
                <div className="row">
                    <div className="col-lg-6 col-sm-12"><h2 className="h2">Список игроков</h2></div>
                    <div className="col-lg-6 col-sm-12"><input
                        type="text"
                        placeholder="Поиск по игрокам (ID, Name, Social etc.)"
                        className="form-control"
                        ref={this.search}
                        onChange={e => {
                            this.setState({ search: e.target.value })
                        }}
                    /></div>
                </div>
                
                
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">ID</th>
                            <th scope="col">Имя</th>
                            <th scope="col">Фракция</th>
                            <th scope="col">Ранг</th>
                            <th scope="col">Админ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.users.map((item, index) => {
                            return this.drawUserData(item, index)
                        })}
                    </tbody>
                </table>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
        </>
    }
}