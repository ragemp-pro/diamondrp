import { autosalon } from "../business/autosalon";
import { business } from "../business";

let q:[string, number, number, number][] = [
    ["Ограбление казино перед сейфом", 999.67, 29.53, 71.76],
    ["Военное стрельбище", -1755.14, 2931.84, 31.96],
    ["Arcadius", business.BusinessStreetPos.x, business.BusinessStreetPos.y, business.BusinessStreetPos.z],
    ['Maze Bank', -72.68, -816.07, 243.39],
    ['Точка спавна аэропорт', -1037.20, -2728.15, 20.08],
    ['Стандартный спавн 1', 124.8076, -1215.845, 28.33152],
    ['Стандартный спавн 2', 1.66987, -1225.569, 28.29525],
    ['Стандартный спавн 3', 462.8509, -850.47, 26.12981],
]

export const addAdminTP = (name:string, pos:Vector3Mp) => {
    q.push([name, pos.x, pos.y, pos.z])
}

autosalon.list.map(item => {
    q.push([item[0], item[1], item[2], item[3]])
})
export default q;