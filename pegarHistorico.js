const puuids = require('./puuid.json')

const fs = require('fs')
const axios = require('axios');
const LOL_KEY = 'RGAPI-18a9218c-975e-4f67-a371-cecda3d6da7f'

let playersDB = require('./playerBruto.json')

let ondeParou = playersDB[0]

console.log(playersDB.length);

timer()

async function timer() {

    let status = await pegarHistorico(puuids[ondeParou])

    status && console.log(status);

    if (status == 429) {
        console.log('esperando');
        setTimeout(() => {
            console.log('voltando');
            timer()
        }, 1000 * 30 * 1);
    } else {
        timer()
    }

}


async function pegarHistorico(puuID) {
    console.log(puuID);
    const historico = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuID}/ids?queue=420&start=0&count=10`,

        { headers: { 'X-Riot-Token': LOL_KEY } }).then(resp => {
            return resp.data.map(e => e)
        }).catch((e) => {
            //  console.log(resp.data);
            return e?.response?.status

        })

    if (!isNaN(historico)) {
        return historico
    }


    return pegarPartida(historico)


}



async function pegarPartida(historico) {
    let players = []
    ondeParou++

    for (const partida of historico) {
        let participantes = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${partida}`,
            { headers: { 'X-Riot-Token': LOL_KEY } }).then(resp => {


                //  console.log(`${num} de ${quantidade} partidas ${num * 100 / quantidade}%`);
                return resp.data.info.participants
            }).catch((e) => {
                //   console.log(e);
                return e?.response?.status
            })

        if (!isNaN(participantes)) {
            return participantes
        }
        participantes.forEach(player => {
            let { summonerName, championId, championName, win, lane, item0, item1, item2, item3, item4, item5, item6, perks } = player
            players.push({ summonerName, championId, championName, win, lane, item0, item1, item2, item3, item4, item5, item6, perks })
        });

    }

    playersDB.shift()

    playersDB = [ondeParou, ...playersDB, ...players]

    await fs.writeFileSync('./historicoDePlayers/playerBruto.json', JSON.stringify(playersDB), err => { !err ? console.log('pegou todos os nome') : console.log(err);; })
    ondeParou = playersDB[0]
    console.log(`Players ${ondeParou} de ${puuids.length} ${(ondeParou * 100 / puuids.length).toFixed(3)}%`);
}