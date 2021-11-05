const fs = require("fs")
const path = require("path")

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            if (file.includes('.ts'))
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

let allFiles = getAllFiles('./src', []);
let lines = 0;
let symbols = 0;
console.log(allFiles[0].replace(/\\/gi, '/'))
let q = fs.readFileSync(allFiles[0].replace(':\\', '://').replace(/\\/gi, '/'), 'utf8')
console.log(q)
allFiles.map(url => {
    let q = fs.readFileSync(url.replace(':\\', '://').replace(/\\/gi, '/'), 'utf8')
    symbols+=q.length
    lines += q.split('\r\n').length
    // console.log(q)
})
console.log(lines, symbols)