export interface MafiaCar {
    name: string;
    cost: number;
    rank: number;
    model: string;
    type: "mafia" | "gang" | "all";
    items: [string, number][]
}
export const mafiaCarsConf: MafiaCar[] = [
    {
        rank: 2, name: "Марихуаной", cost: 5000, model: "Pony2", type: "all", items: [["145", 1],
        ["143", 1],]
    },
    {
        rank: 7, name: "Тяжёлыми наркотиками", cost: 21000, model: "Pony2", type: "gang", items: [["156", 1],
        ["176", 1],
        ["177", 1],
        ["178", 1],
        ["179", 1],
        ["180", 1]
        ]
    },
    {
        rank: 4, name: "Патронами", cost: 25600, model: "Surfer", type: "all", items: [["30", 10],
        ["29", 10],
        ["28", 10],
        ["153", 20],
        ["27", 20],
        ["146", 4]
        ]
    },
    {
        rank: 4, name: "Лёгким оружием", cost: 16300, model: "Burrito3", type: "all", items: [["77", 10],
        ["71", 5],
        ["101", 4],
        ["63", 2],
        ["153", 5],
        ["27", 10]]
    },
    {
        rank: 5, name: "Средним оружием", cost: 41200, model: "Burrito3", type: "all", items: [["101", 10],
        ["94", 5],
        ["87", 2],
        ["153", 15],
        ["28", 5],]
    },
    {
        rank: 7, name: "Тяжелым оружием", cost: 78600, model: "Mule", type: "mafia", items: [["106", 6],
        ["117", 1],
        ["108", 4],
        ["112", 4],
        ["30", 15],
        ["146", 2],]
    },
    {
        rank: 4, name: "Специальным содержимым", cost: 10000, model: "Regina", type: "all", items: [["276", 1],
        ["40", 2],]
    },
    { rank: 8, name: "С4", cost: 80000, model: "Mule", type: "mafia", items: [["262", 5],] },
]

interface mafiaTerritoryData {
    pos: [number, number];
    name: string;
    desc: string;
    cost: number;
}

export const containerMafiaTerritoryId = 500000;

export const mafiaTerritoriesData: mafiaTerritoryData[] = [
    { name: "Элизиан Айленд", desc: "Территория поставок оружия", pos: [34.23244857788086, -2711.05078125], cost:350000 },
    { name: "Ла Пуэрта", desc: "Территория поставок отмычек и патрон", pos: [-552.1932983398438, -1656.835205078125], cost: 300000 },
    { name: "Грейпсид Аэропорт", desc: "Территория поставок наркотиков", pos: [2106.784423828125, 4790.55029296875], cost: 250000 },
]