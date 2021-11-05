import { user } from "../user"
import { QuestionPrewiew, topicReasons, helpType, getReportData, ticketItem } from "../../util/helpmenu"
import { ticketEntity } from "./entity/ticketsModel"
import { Op } from "sequelize"
import { methods } from "./methods";

let blockMap = new Map<number,boolean>();

setTimeout(() => {
    mp.events.register('ticket:create', (player: PlayerMp, type: helpType, text:string, report_id:number) => {
        if(blockMap.has(user.getId(player))) return player.notify(`~r~Не создавайте тикеты так часто`);

        let ticketConfig = getReportData(type)
        if (!ticketConfig) return player.notify(`~r~Ошибка создания тикета`)
        ticketEntity.create({
            timestamp: methods.getTimeStamp(),
            last_update: methods.getTimeStamp(),
            report_target: ticketConfig.isReport ? report_id : 0,
            authorid: user.getId(player),
            authorname: user.getRpName(player),
            messages: [
                {
                    userid: user.getId(player),
                    username: user.getRpName(player),
                    when: methods.getTimeStamp(),
                    message: methods.filter(text)
                }
            ]
        }).then(res => {
            player.notify(`~g~Тикет #${res.id} успешно создан.`)
        })


        blockMap.set(user.getId(player), true);
        setTimeout(() => {
            blockMap.delete(user.getId(player));
        }, 120000)
    })
    mp.events.register('help:loadTicket', (player, id:number) => {
        ticketEntity.findOne({
            where: {
                id
            }
        }).then(ticket => {
            if(!ticket) return player.notify(`~r~Тикет не обнаружен`);
            let ticketConfig = getReportData(ticket.type)
            if (!ticketConfig) return player.notify(`~r~Ошибка создания тикета`)
            if(ticket.authorid != user.getId(player)){
                if (ticketConfig.admin && !user.isAdmin(player)) return player.notify(`~r~У вас нет доступа к данному тикету`)
                if (ticketConfig.helper && !user.isHelper(player)) return player.notify(`~r~У вас нет доступа к данному тикету`)
            }
            let itemResult: ticketItem = {
                id: ticket.id,
                my: user.getId(player) == ticket.authorid,
                authorid: ticket.authorid,
                author: ticket.authorname,
                category: ticket.type,
                is_report: ticket.report_target,
                messagesCount: ticket.messages.length,
                last_updated: ticket.last_update,
                closed: ticket.closed,
                messages: ticket.messages
            };
            mp.events.triggerBrowser(player, 'tickets:loadTicket', itemResult)
        })
    })
    mp.events.register('tickets:loadlist', async (player, type: "admin" | "helper" | "my") => {
        if(type == "admin" && !user.isAdmin(player)) return player.notify(`~r~У вас нет доступа к данному разделу`)
        if (type == "helper" && !user.isHelper(player)) return player.notify(`~r~У вас нет доступа к данному разделу`)
        let list: QuestionPrewiew[] = []
        let items: ticketEntity[] = []
        if(type == "my"){
            items = await ticketEntity.findAll({
                where: {
                    authorid: user.getId(player)
                },
                limit: 30,
                order: [
                    ['id', 'DESC']
                ]
            })
        }
        else {
            let reasons = topicReasons.filter(itm => (type == "admin" && itm.admin) || (type == "helper" && itm.helper)).map(itm => {return itm.value})
            items = await ticketEntity.findAll({
                where: {
                    type: {
                        [Op.in]: reasons
                    }
                },
                limit: 50,
                order: [
                    ['id', 'DESC']
                ]
            })
        }
        list = items.map(itm => {
            return ({
                id: itm.id,
                my: type == "my",
                author: itm.authorname,
                authorid: itm.authorid,
                category: itm.type,
                text: itm.messages[0].message,
                messagesCount: itm.messages.length,
                last_updated: itm.last_update,
                is_report: itm.report_target,
                closed: itm.closed
            })
        })
        mp.events.triggerBrowser(player, "tickets:main", user.isAdmin(player), user.isHelper(player), list)
    })
}, 1000)