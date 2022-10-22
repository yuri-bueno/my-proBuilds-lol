const fs = require('fs')
const axios = require('axios');
let rawFile = require('./playerBruto.json')

rawFile.shift()
let players = []




for (const player in rawFile) {
    let { summonerName, championId, championName, win, lane, item0, item1, item2, item3, item4, item5, perks } = rawFile[player]

    players.push({ summonerName, championId, championName, win, lane, items: [item0, item1, item2, item3, item4, item5], perks })

}



//let itemsDeSup = [3850, 3858, 3854, 3862]
let initialItems = [0, 1054, 1055, 1056, 1001, 2422]
let boots = [3006, 3009, 3047, 3117, 3158, 3111, 3020]

start()
async function start() {
    console.log('start');
    let base = await getBaseChamps()

    for (const campeao in base) {

        players.find(champ => {

            if (champ.championName.toLowerCase() == base[campeao].name.toLowerCase()) {

                for (const slot in champ.items) {

                    if (!isNaN(initialItems.find(e => e == champ.items[slot]))) { //initial filter of items
                        return
                    }

                    if (!isNaN(boots.find(e => e == champ.items[slot]))) {//boots filter of items
                        base[campeao].bota.push(champ.items[slot])
                        return
                    }

                    base[campeao].items[slot].push(champ.items[slot])
                    base[campeao].itemsMaisFeitos.push(champ.items[slot])

                }


            }
        })
    }
    for (const campeao in base) {

        for (const slot in base[campeao].items) {
            let item = await rateOfUse(base[campeao].items[slot])

            base[campeao].items[slot] = item[0] ? item[0].index : 0

        }
        let bota = await rateOfUse(base[campeao].bota)
        base[campeao].bota = bota[0] ? bota[0].index : 0

        let itemsMaisFeitos = await rateOfUse(base[campeao].itemsMaisFeitos)
        base[campeao].itemsMaisFeitos = itemsMaisFeitos.map(e => e.index)
    }

    fs.writeFileSync('./playerDone.json', JSON.stringify(base))
    console.log('finished');
}



async function rateOfUse(slot) {

    let itemDaVez = []
    let organizedItems = []

    if (!slot[1]) {
        return 0
    }

    await slot.filter((item, i) => {


        if (slot.indexOf(item) === i) {
            itemDaVez.push({ index: item, vezes: 1 })
        }
        else {
            let itemRepetido = itemDaVez.findIndex(e => e.index == item)
            itemDaVez[itemRepetido].vezes++
        }

        organizedItems = itemDaVez.sort((e, y) => {
            if (e.vezes < y.vezes) return 1
            if (e.vezes > y.vezes) return -1
            return 0
        })

    });
    return organizedItems

}

async function getBaseChamps() {
    let base = []
    const campeoes = await axios.get('https://ddragon.leagueoflegends.com/cdn/12.19.1/data/pt_BR/champion.json').then(e => {
        return e.data.data
    })

    for (const campeao in campeoes) {

        base.push({ name: campeao, wins: [], items: [[], [], [], [], [], []], bota: [], itemsMaisFeitos: [], runas: [] })
    }
    return base
}