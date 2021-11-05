import Telegraf, { Markup, ContextMessageUpdate } from 'telegraf'
import { user } from '../user';
let datas = new Map<string, (ctx: ContextMessageUpdate) => any>();
let authorized:number[] = []
let keyProtect = "sf4fd5gf5hwe4hr56tfdtr6hsr6"

const bot = new Telegraf("1091504944:AAEjj02lIxDofhtXw9Vj33kUyY4s33X8kGM")
bot.start((ctx) => {
    if (!authorized.includes(ctx.from.id)) return ctx.reply('Для доступа к системе необходимо авторизоватся', Markup
        .keyboard(["🔒 Авторизация в системе"])
        .oneTime()
        .resize()
        .extra()
    )
    startMenu(ctx);
});

function startMenu(ctx: ContextMessageUpdate){
    return ctx.reply('Главное меню бота', Markup
        .keyboard([[...datas].map(([name]) => { return name })])
        .oneTime()
        .resize()
        .extra()
    )
}

bot.hears(keyProtect, (ctx) => {
    ctx.deleteMessage();
    if (authorized.includes(ctx.from.id)) return ctx.reply('Вы уже авторизованы')
    authorized.push(ctx.from.id)
    ctx.reply('Вы успешно авторизовались')
    startMenu(ctx);
})

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', Telegraf.reply('λ'))



registerButton('Админы в сети', (ctx) => {
    const admins = mp.players.toArray().filter(usr => user.isAdmin(usr))
    if (admins.length == 0) return ctx.reply('Администраторов в сети нет');
    ctx.reply("Список админов в сети: " + admins.map(usr => { return user.getRpName(usr) + " (ID: " + user.getId(usr) + ") (LVL: " + user.getAdminLevel(usr) +")"}).join(', '));
    startMenu(ctx);
})
registerButton('Общая информация', (ctx) => {
    const admins = mp.players.toArray().filter(usr => user.isAdmin(usr))
    const online = mp.players.length
    ctx.reply(`Онлайн: ${online}\nАдминистраторов: ${admins.length}`);
    startMenu(ctx);
})

bot.launch()

bot.hears("🔒 Авторизация в системе", (ctx) => ctx.reply('Введите пинкод для авторизации'))

function registerButton(name: string, callback: (ctx: ContextMessageUpdate)=>any){
    datas.set(name, callback);
    bot.hears(name, ctx => {
        if (!authorized.includes(ctx.from.id)) return ctx.reply('Для доступа к системе необходимо авторизоватся', Markup
            .keyboard(["🔒 Авторизация в системе"])
            .oneTime()
            .resize()
            .extra()
        )
        callback(ctx)
    })
}
