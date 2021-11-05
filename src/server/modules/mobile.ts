import { app } from "../web";
import { userEntity } from "./entity/user";
import { methods } from "./methods";
import { user } from "../user";
import { customParams, setCustomParams, restartProtocol, isRestarting } from "./admin";
import { userWarnEntity } from "./entity/warns";
import { blackListEntity } from "./entity/blackList";
import { Op } from "sequelize";
import { UserData, UserMap, SiteLog } from "../../util/mobiledata";
import { mysql } from "./mysql";
import { tradeLogEntity } from "./entity/tradeLogEntity";
import { whitelist } from "./whitelist";

let authTokens = new Map<string,number>();

app.get('/mobile/check', async (req, res) => {
    if (!req.query.login || !req.query.pass) return res.send({ err: "Недостаточно параметров для авторизации"})
    const db_user = await userEntity.findOne({ where: { rp_name: req.query.login } });
    if (!db_user) {
        res.send({ err: "Учётная запись не обнаружена" })
        return;
    }

    if (db_user.admin_level < 6) {
        res.send({ err: "Данный раздел предназначен исключительно для главных администраторов" })
        return;
    }

    if (db_user.password !== methods.sha256(String(req.query.pass))) {
        res.send({ err: "Учётная запись не обнаружена либо пароль не верный", q: [db_user.password, methods.sha256(String(req.query.pass)), String(req.query.pass)] })
        return;
    }
    if (authTokens.has(db_user.rp_name)) return res.send({ login: db_user.rp_name, token: authTokens.get(db_user.rp_name) })
    const tm = methods.getTimeStamp()
    authTokens.set(db_user.rp_name, tm)
    return res.send({ login: db_user.rp_name, token:tm})
})
app.get('/mobile/checktoken', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    return res.send({ ok: true })
})
app.get('/mobile/data', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let players: UserData[] = mp.players.toArray().filter(player => user.isLogin(player)).map(player => {
        return {
            id: user.getId(player),
            name: user.getRpName(player),
            social: player.socialClub,
            ip: player.ip,
            adminLvl: user.getAdminLevel(player),
            helperLvl: user.getHelperLevel(player),
            playedTime: player.played_time,
            fraction: user.getPlayerFraction(player),
            rank: user.getPlayerFractionRank(player),
            money: user.getCashMoney(player),
            bank: user.getBankMoney(player),
            phone: user.getPhone(player),
            ip_reg: user.get(player, 'ip_reg'),
            bankcard: user.get(player, 'bank_prefix') + "-" + user.get(player, 'bank_number'),
            vip: user.getVipStatus(player)
        }
    })

    return res.send({ 
        users: players,
        vehicles: mp.vehicles.length,
        objects: mp.objects.length,
        xparams: customParams,
        maxPlayers: mp.config.maxplayers,
     })
})
app.get('/mobile/setx', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let name = req.query.name;
    let value = req.query.value == "1" ? true : false
    setCustomParams(name, value)
    return res.send({ ok: true })
})
app.get('/mobile/removewarn', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let warnid = parseInt(req.query.id);
    if(isNaN(warnid) || warnid <= 0) return res.send({err: "ID Указан не верно"})
    userWarnEntity.destroy({where: {id: warnid}}).then(() => {
        return res.send({ ok: true })
    })
})
app.get('/mobile/playersPosition', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let players: UserMap[] = mp.players.toArray().filter(player => user.isLogin(player)).map(player => {
        return {
            id: user.getId(player),
            name: user.getRpName(player),
            social: player.socialClub,
            ip: player.ip,
            adminLvl: user.getAdminLevel(player),
            helperLvl: user.getHelperLevel(player),
            playedTime: player.played_time,
            fraction: user.getPlayerFraction(player),
            rank: user.getPlayerFractionRank(player),
            money: user.getCashMoney(player),
            bank: user.getBankMoney(player),
            phone: user.getPhone(player),
            ip_reg: user.get(player, 'ip_reg'),
            bankcard: user.get(player, 'bank_prefix') + "-" + user.get(player, 'bank_number'),
            vip: user.getVipStatus(player),
            hp: player.health,
            ap: player.armour,
            d: player.dimension,
            position: {x: player.position.x, y: player.position.y, z: player.position.z}
        }
    })
    res.send({players:players})
})
app.get('/mobile/blacklist', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let id = parseInt(req.query.id);
    let reason = req.query.reason;
    if(isNaN(id) || id <= 0) return res.send({err: "ID Указан не верно"})
    if (!reason || reason.length < 3) return res.send({err: "Причина должна быть не менее 3х символов"})
    const db_user = await userEntity.findOne({ where: { rp_name: req.query.login } });
    user.checkIdUser(id).then(rank => {
        if (rank == -1) return res.send({ err: "ID Указан не верно" })
        if (rank == 6) return res.send({ err: "Вы не можете занести данного человека в BlackList"});
        userEntity.findOne({ where: { id: id } }).then(usr => {
            const lic = usr.lic;
            const guid = usr.name;
            const rgscId = usr.rgscid;
            blackListEntity.findOne({ where: { lic, guid } }).then(q => {
                if (q) return res.send({ err: "Игрок уже занесён в BlackList" })
                const target = user.getPlayerById(id);
                blackListEntity.create({
                    lic: usr.lic,
                    reason: `${reason} [Занёс ${db_user.rp_name} (${db_user.id})]`,
                    guid: usr.name,
                    rgscId: target ? target.clientSocial : rgscId ? rgscId : 0
                }).then(() => {
                    res.send({ ok: true })
                    methods.saveLog("addBlackList", db_user.rp_name + " занёс в BlackList " + id + " " + guid + " " + lic)
                    user.log(db_user.id, "AdminJob", "Занёс в BlackList @user" + id + " " + guid + " " + lic)
                })
            })
        });
    });
})
app.get('/mobile/whitelist', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let social = (req.query.social as string).toLowerCase();
    let reason = req.query.reason;
    if(!social) return res.send({err: "Social Указан не верно"})
    whitelist.new(null, social)
    return res.send({ ok: true })
})
app.get('/mobile/blackListRM', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let id = parseInt(req.query.id);
    if(isNaN(id) || id <= 0) return res.send({err: "ID Указан не верно"})
    const db_user = await userEntity.findOne({ where: { rp_name: req.query.login } });
    user.checkIdUser(id).then(rank => {
        if (rank == -1) return res.send({ err: "ID Указан не верно" })
        userEntity.findOne({ where: { id: id } }).then(usr => {
            const lic = usr.lic;
            const guid = usr.name;
            const rgscId = usr.rgscid;
            blackListEntity.findOne({
                where: {
                    [Op.or]: [{ lic }, { guid }]
                }
            }).then((itm) => {
                if (!itm) return res.send({ err: "Игрок не обнаружен в BlackList" })
                itm.destroy();
                user.log(db_user.id, "AdminJob", "Удалил из BlackList @user" + id + " " + guid + " " + lic)
                return res.send({ ok: true })
            })
        });
    });
})
app.get('/mobile/kickUser', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let id = parseInt(req.query.id);
    let target = user.getPlayerById(id);
    if (!target) return res.send({ err: "Игрок не найден" });
    user.kick(target, "Кикнут администратором");
    return res.send({ ok: true })
})
app.get('/mobile/addMoney', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let id = parseInt(req.query.id);
    let sum = parseInt(req.query.sum);
    if (isNaN(sum) || sum <= 0) return res.send({ err: "Сумма указанна не верно" })
    let target = user.getPlayerById(id);
    if (!target) return res.send({ err: "Игрок не найден" });
    user.addCashMoney(target, sum)
    return res.send({ ok: true })
})
app.get('/mobile/removeMoney', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let id = parseInt(req.query.id);
    let sum = parseInt(req.query.sum);
    if (isNaN(sum) || sum <= 0) return res.send({ err: "Сумма указанна не верно" })
    let target = user.getPlayerById(id);
    if (!target) return res.send({ err: "Игрок не найден" });
    user.removeCashMoney(target, sum)
    return res.send({ ok: true })
})
app.get('/mobile/reboot', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let min = parseInt(req.query.min);
    let reason = req.query.reason
    const db_user = await userEntity.findOne({ where: { rp_name: req.query.login } });
    if (isNaN(min) || min <= 0) return res.send({ err: "Количество минут указанно не верно" })
    if (isRestarting()) return res.send({ err: "Процедура рестарта уже запущена" })
    restartProtocol(min, reason)
    user.log(db_user.id, "AdminJob", "Запустил процедуру рестарта сервера. Время: " + min + " Причина: " + reason)
    return res.send({ ok: true })
})
app.get('/mobile/promocodes', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    let promo = req.query.promo
    if (!promo) return res.send({ err: "Промокод указан не верно" })
    userEntity.count({ where: { promocode: promo } }).then(count => {
        if (count == 0) return res.send({ err: "Промокод никем не вводился" })
        return res.send({ ok: count })
    })
})
app.get('/mobile/siteBuyLog', async (req, res) => {
    if (!await tokenAuth(req, res)) return;
    tradeLogEntity.findAll({
        order: [["id", "DESC"]], limit: 300
    }).then(data => {
        res.send({ ok: data })
    })
})

async function tokenAuth(req: any, res: {send:(param:any)=>any}){
    if (!req.query.login || !req.query.token){
        res.send({ err: "Недостаточно параметров для авторизации" })
        return false

    } 
    if (!authTokens.has(req.query.login)){
        res.send({ err: "Ошибка верификации логина" })
        return false
    } 
    if (authTokens.get(req.query.login) != req.query.token){
        res.send({ err: "Ошибка верификации токена" })
        return false
    } 
    const db_user = await userEntity.findOne({ where: { rp_name: req.query.login } });
    if (!db_user) {
        res.send({ err: "Учётная запись не обнаружена" })
        return false;
    }

    if (db_user.admin_level < 6) {
        res.send({ err: "Данный раздел предназначен исключительно для главных администраторов" })
        return false;
    }
    return true;
}