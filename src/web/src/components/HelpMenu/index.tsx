import React, { Component } from "react";
import Loading from "../Loading";
import { CEF } from "api";
import { helpType, topicReasons, getReportLabel, getReportData, QuestionPrewiew, ticketItem } from "../../../../util/helpmenu";
import Select from 'react-select';



interface HelpMenuState {
    list: QuestionPrewiew[];
    currentTicket: ticketItem,
    admin: boolean;
    helper: boolean;
    loaded: boolean;
    current: "my" | "admin" | "helper"
    createMenuBlock: boolean;
    createMenuBlockReason: helpType;
    createMenuBlockReportId: number;
    createMenuBlockText: string;
    readedTickets: number[]
}

class HelpMenu extends Component<{ test?: boolean }, HelpMenuState> {
    ev: RegisterResponse;
    ev2: RegisterResponse;
    constructor(props: any) {
        super(props);

        this.state = {
            list: [
                { id: 1, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
                { id: 2, my: false, author: "Test User", authorid: 12, category: "reportUser", text: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать", messagesCount: 10, last_updated: 1432222330, is_report: 1, closed: true },
            ],
            currentTicket: {
                id: 1,
                my: true,
                authorid: 1,
                author: "Test User",
                category: "reportUser",
                is_report: 1,
                messagesCount: 1,
                last_updated: 1432222330,
                closed: false,
                messages: [
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                    { userid: 1, username: "Test User", when: 1432222330, message: "Это какое то сообщение, которое нам не очень интересно на самом деле, если так подумать" },
                ]
            },
            admin: true,
            helper: true,
            loaded: false,
            current: "my",
            createMenuBlock: false,
            createMenuBlockReason: null,
            createMenuBlockReportId: null,
            createMenuBlockText: "",
            readedTickets: []
        };
        if (this.props.test) {
            setTimeout(() => {
                this.setState({ loaded: true });
            }, 100)
        }

        this.ev = mp.events.register("tickets:main", (admin: boolean, helper: boolean, list: QuestionPrewiew[]) => {
            this.setState({ admin, helper, list, loaded: true });
        })
        this.ev2 = mp.events.register("tickets:loadTicket", (item: ticketItem) => {
            this.setState({ currentTicket: item })
        })

    }
    componentDidMount() {
        this.loadData()
    }
    loadData() {
        mp.events.triggerServer('tickets:loadlist', this.state.current)
    }
    loadTicket(id: number) {
        let q = this.state.list.find(a => a.id == id);
        if (!q.my) {
            let dataReport = getReportData(q.category);
            if (dataReport.admin && this.state.admin) {

            } else if (dataReport.helper && this.state.helper) {

            } else {
                return CEF.alert.setAlert('error', "У вас нет доступа к просмотру данного тикета");
            }
            mp.events.triggerServer('help:loadTicket', q.id);
        }
    }
    sendTicket() {
        if (!this.state.createMenuBlockReason) return CEF.alert.setAlert("error", "Выберите раздел");
        if (!this.state.createMenuBlockText) return CEF.alert.setAlert("error", "Введите сообщение");
        let dataReport = getReportData(this.state.createMenuBlockReason);
        if (!dataReport) return CEF.alert.setAlert("error", "Раздел выбран не верно");
        if (dataReport.isReport) {

            if (!this.state.createMenuBlockReportId && this.state.createMenuBlockReportId !== 0) return CEF.alert.setAlert("error", "Укажите ID нарушителя");
            if (isNaN(this.state.createMenuBlockReportId) || this.state.createMenuBlockReportId < 0) return CEF.alert.setAlert("error", "ID нарушителя указан не верно. Если вы не заметили ID - укажите 0");
        }
        mp.events.triggerServer('ticket:create', this.state.createMenuBlockReason, this.state.createMenuBlockText, this.state.createMenuBlockReportId)
        this.closeSendTicket();
    }
    closeSendTicket() {
        this.setState({ createMenuBlock: false, createMenuBlockReason: null, createMenuBlockText: "" })
    }
    selectTicket(item: QuestionPrewiew) {
        if (!item.my) {
            let dataReport = getReportData(item.category);
            if (dataReport.admin && this.state.admin) {

            } else if (dataReport.helper && this.state.helper) {

            } else {
                return CEF.alert.setAlert('error', "У вас нет доступа к просмотру данного тикета");
            }
        }
        mp.events.triggerServer('help:loadTicket', item.id);
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy()
        if (this.ev2) this.ev2.destroy()
    }

    digitFormat(number: number) {
        return ("0" + number).slice(-2);
    }
    tmToDate(timestamp: number) {
        let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
    }

    render() {
        if (!this.state.loaded) return <Loading loading="Загрузка данных" />;
        return <div className="helpMenuBlock">
            <div className="content">
                <div className="col-md-6 bl">
                    <div className="headerButtons">
                        <div className="content">
                            <div className="col-sm-7">
                                <button className="btn" onClick={e => {
                                    e.preventDefault();
                                    this.setState({ current: 'my' })
                                }}>Мои запросы</button>
                                <button className={`btn ${this.state.admin ? '' : 'disabled'}`} onClick={e => {
                                    e.preventDefault();
                                    if (!this.state.admin) return CEF.alert.setAlert("error", "Доступно только администраторам сервера")
                                    this.setState({ current: 'admin' })
                                }}>Жалобы</button>
                                <button className={`btn ${this.state.helper ? '' : 'disabled'}`} onClick={e => {
                                    e.preventDefault();
                                    if (!this.state.helper) return CEF.alert.setAlert("error", "Доступно только хелперам сервера")
                                    this.setState({ current: 'helper' })
                                }}>Вопросы</button>
                            </div>
                            <div className="col-sm-5">
                                <div className="content">
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" placeholder="Поиск по тикетам" />
                                    </div>
                                    <div className="col-sm-4">
                                        <button className={`btn ${this.state.helper ? '' : 'disabled'}`} onClick={e => {
                                            e.preventDefault();
                                            if (!this.state.helper) return CEF.alert.setAlert("error", "Доступно только хелперам сервера")
                                            this.setState({ current: 'helper' })
                                        }}>Поиск</button>
                                    </div>
                                </div>


                            </div>
                        </div>

                    </div>
                    {this.state.current == "my" ? <div className="newTicketBlock">
                        {!this.state.createMenuBlock ? <button className="btn btn-success" onClick={e => {
                            e.preventDefault();
                            this.setState({ createMenuBlock: true })
                        }}>Новое обращение</button> : <>
                                <div className="form-group">
                                    <span className="desc">Укажите тип тикета</span>
                                    <Select
                                        name="HelpTopicReason"
                                        onChange={(e: any) => this.setState({ createMenuBlockReason: e.value })}
                                        options={topicReasons}
                                        isSearchable={false}
                                        placeholder="Выберите раздел"
                                        styles={{
                                            control: (base: any) => ({
                                                ...base,
                                                minHeight: 34,
                                                minWidth: 225,
                                                backgroundColor: '#ebf1f6',
                                                boxShadow: 'inset 0px 0px 0px 2px rgba(220, 228, 235, 0.97)',
                                            }),
                                        }}
                                    /><br />
                                    {this.state.createMenuBlockReason && getReportData(this.state.createMenuBlockReason).desc ? <div className="alert alert-info">
                                        {getReportData(this.state.createMenuBlockReason).desc}
                                    </div> : ''}

                                    {this.state.createMenuBlockReason && getReportData(this.state.createMenuBlockReason).isReport ? <>
                                        <span className="desc">Укажите ID нарушителя</span>
                                        <input type="number" className="form-control"
                                            defaultValue={this.state.createMenuBlockReportId ? this.state.createMenuBlockReportId.toString() : null} onChange={e => {
                                                this.setState({ createMenuBlockReportId: parseInt(e.currentTarget.value) })
                                            }} />
                                        <br />
                                    </> : ''}


                                    <span className="desc">Введите сообщение</span>
                                    <textarea className="form-control" onChange={e => {
                                        this.setState({ createMenuBlockText: e.currentTarget.value })
                                    }}></textarea>
                                    <br />
                                    <button className="btn btn-block btn-success" onClick={e => {
                                        e.preventDefault();
                                        this.sendTicket()
                                    }}>Отправить</button>
                                    <br />
                                    <button className="btn btn-block btn-info" onClick={e => {
                                        e.preventDefault();
                                        this.closeSendTicket()
                                    }}>Назад</button>
                                </div>
                            </>}

                    </div> : ''}
                    <div className="ticketList-title">{this.state.current == "my" ? "Мои обращения" : ""}{this.state.current == "admin" ? "Тикеты администрации" : ""}{this.state.current == "helper" ? "Тикеты хелперов" : ""}</div>
                    <div className="ticketList" style={{ height: this.state.createMenuBlock ? '48.1%' : '81.5%'}}>
                        {this.state.current == "my" ? this.state.list.map(item => {
                            return <div className={`ticketItem ${this.state.currentTicket && this.state.currentTicket.id == item.id ? 'selecteds' : ''}`} onClick={e => {
                                e.preventDefault();
                                this.selectTicket(item)
                            }}>

                                <div className="title">#{item.id} {item.author} <span>({item.authorid}) {getReportLabel(item.category)}</span> {!this.state.readedTickets.includes(item.id) ? <span className="new">NEW</span> : ''}{item.closed ? <span className="new">Закрыт</span> : ''}</div>
                                <div className="desc">{item.text}</div>
                                <div className="row">
                                    <div className="col-md-6 footer">Сообщений: {item.messagesCount}</div>
                                    <div className="col-md-6 footer">{this.tmToDate(item.last_updated)}</div>
                                </div>
                            </div>
                        }) : ''}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="headerButtons">
                        <button className="btn">{!this.state.currentTicket ? 'Выберите тикет для просмотра' : 'Текущий тикет №' + this.state.currentTicket.id}</button>
                    </div>
                    {this.state.currentTicket ? <div className="ticketData">

                        <div className="ticketItem">
                            <div className="title">{getReportLabel(this.state.currentTicket.category)} {this.state.currentTicket.is_report != 0 ? `(ID: ${this.state.currentTicket.is_report})` : ''}</div>
                        </div>
                        <div className="ticketItem">
                            <div className="title">#{this.state.currentTicket.id} {this.state.currentTicket.author} <span>({this.state.currentTicket.authorid}) {getReportLabel(this.state.currentTicket.category)}</span> {!this.state.readedTickets.includes(this.state.currentTicket.id) ? <span className="new">NEW</span> : ''}{this.state.currentTicket.closed ? <span className="new">Закрыт</span> : ''}</div>
                            <div className="desc">{this.state.currentTicket.messages[0].message}</div>
                        </div>

                        {this.state.currentTicket.messages.map((item, index) => {
                            return <div className="ticketItem">
                                <div className="title">#{(index + 1)} {item.username} <span>({item.userid}) {item.userid == this.state.currentTicket.authorid ? 'Автор' : ''}</span></div>
                                <div className="desc">{item.message}</div>
                                <div className="row">
                                    <div className="col-md-6 footer">{this.tmToDate(item.when)}</div>
                                </div>
                            </div>
                        })}
                        <br />
                        {this.state.currentTicket.closed ? <div className="alert alert-success">
                            Тикет закрыт
                        </div> : <>
                                <div className="ticketItem send">
                                    <div className="col-md-8"><textarea className="form-control" placeholder="Сообщение" /></div>
                                    <div className="col-md-4">
                                        <button className="btn btn-success btn-block">Отправить</button>
                                        <button className="btn btn-danger  btn-block">Закрыть тикет</button>
                                    </div>
                                </div>
                            </>}
                        {this.state.admin ? <>
                            <div className="ticketItem footerEl">
                                <div className="title">Действия над автором тикета {`(ID: ${this.state.currentTicket.authorid} ${this.state.currentTicket.author})`}</div><br/>
                                <button className="btn btn-block btn-info">Телепортировать к себе</button>
                                <button className="btn btn-block btn-info">Телепортироватся самому</button>
                            </div>
                            {this.state.currentTicket.is_report ? <>
                                <div className="ticketItem footerEl">
                                    <div className="title">Действия над нарушителем {`(ID: ${this.state.currentTicket.is_report})`}</div><br />
                                    <button className="btn btn-block btn-info">Телепортировать к себе</button>
                                    <button className="btn btn-block btn-info">Телепортироватся самому</button>
                                </div>
                            </> : ''}
                        </> : ''}
                    </div> : ''}

                </div>
            </div>
        </div>
            ;
    }
}

export default HelpMenu;

