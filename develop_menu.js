let mysql = require('mysql');
let fs = require('fs');
let config = require('./src/server/config/mysql.json').test
var menu = require('console-menu');
const prompt = require('prompt');
const pool = mysql.createPool({
  host: config.host,
  port: 3300,
  //host     : '54.37.128.202',
  user: config.db_user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
});


setTimeout(() => {
  buildMenu("Sequelize contructor", () => {
    prompt.start();

    prompt.get(['TableName'], function (err, result) {
      if (err) {
        return onErr(err);
      }
      generateText(result.TableName)
    });
  })
}, 200)






const generateText = (table) => {
  pool.query(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, [config.database, table], (err, res) => {
    if (err) return console.error(err);
    let text = `
    @Table({modelName: "${table}"})
export class ${table}Entity extends Model<${table}Entity> {`
    res.map(w => {
      let type = "REPLACE_NEED";
      let typescript_name = "REPLACE_NEED";
      let add_param = [];
      if (w.COLUMN_KEY == "PRI") add_param.push("primaryKey: true")
      if (w.EXTRA.includes("auto_increment")) add_param.push("autoIncrement: true")
      if (w.IS_NULLABLE == "NO") add_param.push("allowNull: false")
      else add_param.push("allowNull: true")
      add_param.push("defaultValue: " + w.COLUMN_DEFAULT)
      if (w.COLUMN_TYPE.indexOf("varchar") == 0) type = `Sequelize.STRING(${parseInt(w.COLUMN_TYPE.replace("varchar(", ''))})`, typescript_name = "string";
      if (w.COLUMN_TYPE.indexOf("int") == 0) type = `Sequelize.INTEGER(${parseInt(w.COLUMN_TYPE.replace("int(", ''))})`, typescript_name = "number";
      if (w.COLUMN_TYPE.toUpperCase().indexOf("FLOAT") == 0) type = `Sequelize.FLOAT`, typescript_name = "number";

      text += `
    @Column({ type: ${type}, ${add_param.join(', ')} })
    ${w.COLUMN_NAME}: ${typescript_name};`
    })
    text += `
}
    `
    fs.writeFileSync('./model_' + table + ".ts", text)
    console.log(text)
  })
}

/*

SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gta5db' AND TABLE_NAME = 'stocks';
*/


const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let menus = new Map();
const buildMenu = (title, hanlde) => {
  menus.set(title, hanlde)
}
setTimeout(() => {
  let q = [];
  let index = 1;
  menus.forEach((_, item) => {
    q.push({
      hotkey: index.toString(),
      title: item
    })
    index++;
  })
  menu(q, {
    header: 'Select menu',
    border: true,
  }).then(item => {
    if (item) {
      menus.get(item.title)();
    } else {
      console.log('You cancelled the menu.');
    }
  });
}, 500)