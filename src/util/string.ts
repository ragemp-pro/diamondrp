String.prototype.regexIndexOf = function(regex: RegExp, startpos: number) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
String.prototype.isNumberOnly = function() {
  let nm = String(parseInt(this))
  return nm == this
}

Object.defineProperty(Array.prototype, 'chunk_inefficient', {
  value: function (chunkSize:number) {
    var array = this;
    return [].concat.apply([],
      array.map(function (elem:any, i:number) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }
});

export function fixString(string:string){
  if(!string) return string;
  string = string.replace(/\(/g, '[').replace(/\)/g, ']')
  string = string.replace(/\`/g, '')
  string = string.replace(/\'/g, '')
  string = string.replace(/\"/g, '')
  string = string.replace(/\\/g, '')
  return string
}
/** Функция переваривает строку с GTA разметкой в HTML гипертекст */
export function gtaStrToHtml(message: string) {
    if(!message) message = "";
    let str = message
    let regex = /~[a-z]~/g, result, indices = [];
    /** Индикатор для замены цвета */
    let startColor = false;
    while ((result = regex.exec(str))) {
        /** Строка для замены */
        let replaceString = "";
        /** Детектор цвета */
        let color = getColor(result[0]);
        if (color) {
            if (startColor) replaceString += "</font>";
            if (color != "white") replaceString += `<font color="${color}">`, startColor = true;
            else startColor = false;
        } else {
            if (result[0] == "~n~") replaceString += "<br/>"
        }
        str = str.replace(result[0], replaceString)
    }
    str = str.replace(/\n/g, "<br/>")
    str = str.replace(/~[a-zA-Z]~/g, "")
    if(startColor) str+="</font>";
    return str
}

/** Функция вернёт цвет, который в начале строки и саму строку без этого цвета */
export function getFirstColor(message:string){
  let fnd:string = message.substr(0, 3);
  let color:string = getColor(fnd);
  let string = color ? message.slice(3) : message
  
  return {
    string,
    color
  };
}

export function getColor(fnd:string){
  switch (fnd) {
    case "~r~":
      return "#f51d1d"
        break;
    case "~g~":
      return "#7FFF00"
        break;
    case "~b~":
      return "#1E90FF"
        break;
    case "~y~":
      return "#FFD700"
        break;
    case "~p~":
      return "purple"
        break;
    case "~o~":
      return "orange"
        break;
    case "~c~":
        return "grey"
        break;
    case "~m~":
      return "grey"
        break;
    case "~u~":
      return "black"
        break;
    case "~s~":
      return "white"
        break;
    case "~w~":
      return "white"
        break;
    default:
      return null;
        break;
  }
}