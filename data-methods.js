process.env.LEAGUE_API_KEY = "RGAPI-5408f576-b56c-4828-a9d6-e0b9cc02bf43"
const LeagueJS = require('./node_modules/leaguejs/lib/LeagueJS.js');
const leagueJs = new LeagueJS(process.env.LEAGUE_API_KEY);

//summoner name made accessible to all methods to prevent 
//passing it separately to each method
let summoner = ""

//key created for specific summoner in each match per object
let id = 0;

module.exports = {

    /*
    getting encrypted summonerId and puuid 
    using summoner name
    */

    getIdByName(summonerName) {
        return new Promise((resolve, reject) => {
            leagueJs.Summoner
                .gettingByName(summonerName)
                .then(data => {
                    summoner = summonerName;
                    return resolve(data);
                })
                .catch(err => {
                    console.log("Data could not be fetched, API failed with error: ", err);
                    return reject(err);
                });

        })
    },

    /*
    getting an array of all matchIds that were played
    by the summoner using puuid of the summoner
    */

    getAllMatchesPlayedBySummoner(puuid) {
        return new Promise((resolve, reject) => {
            leagueJs.Match.gettingMatchIdsByPuuid(puuid)
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    console.log("Data could not be fetched, API failed with error: ", err);
                    return reject(err)
                })

        })

    },

    /*
    loops through an array of participants per match id
    and finds the participant that matches the summoner name
    then stores all the data in one final object
    */

    getMatchDataPerSummonerMatch(matchId) {
        return new Promise((resolve, reject) => {
            let participantDetail = {};
            if(matchId && Object.keys(matchId).length > 0){
            leagueJs.Match.gettingById(matchId)
                .then((data) => {
                    participantDetail.gameDuration = data.info.gameDuration;
                    participantDetail.daysAgo = Math.floor(((data.info.gameEndTimestamp / 1000 / 60 / 60) % 24) / 24);
                    id++;
                    data.info['participants'].forEach(el => {
                        if (el.summonerName === summoner) {
                            participantDetail.id = id;
                            participantDetail.victory = (el.win) ? "VICTORY" : "DEFEAT"
                            participantDetail.summonerName = el.summonerName;
                            participantDetail.championName = el.championName;
                            participantDetail.champLevel = el.champLevel;
                            participantDetail.kills = el.kills;
                            participantDetail.deaths = el.deaths;
                            participantDetail.assists = el.assists;
                            participantDetail.totalMinionsKilled = el.totalMinionsKilled;
                            participantDetail.creepScorePerMinute = ((el.totalMinionsKilled) / ((participantDetail.gameDuration) / 60)).toFixed(1);
                            el.challenges.kda = (Math.round(el.challenges.kda * 100) / 100).toFixed(2);
                            participantDetail.kda = ((el.challenges.kda) == 1.00) ? "Perfect KDA" : el.challenges.kda
                            participantDetail.items = [];
                            for (let i = 0; i < 7; i++) {
                                let itemNum = "item" + i;
                                if (el[itemNum] != 0)
                                    participantDetail.items.push(el[itemNum])
                            }
                            participantDetail.spells = [];
                            for (let i = 1; i <= 4; i++) {
                                let spell = "spell" + i + "Casts";
                                participantDetail.spells.push(el[spell]);
                            }
                            participantDetail.perks = el.perks.statPerks;
                            participantDetail.champImage = "/champs/" + el.championName + ".png"
                        }
                    })
                    return resolve(participantDetail)
                })
                .catch((err) => {
                    console.log("No data retreived, API failed with error: ", err);
                    return reject(err);
                })
            }
            else{
                return reject("No Match Id received by the method")
            }
        })
    },

    /*
    based on the number of matches to loop through, the method
    loops through the decided number and passes each one to 
    "getMatchDataPerSummonerMatch" to retreive summoner 
    specific stats and pushes acquired to an array after each iteration
    */
    getAllMatchesSummonerDetails(allMatchIds) {
        return new Promise(async (resolve, reject) => {
            let numOfMatches = (Object.keys(allMatchIds).length) > 5 ? 5 : (Object.keys(allMatchIds).length)
            let allMatchDataArr = [];
            if (numOfMatches && numOfMatches > 0) {
                for (let i = 0; i < numOfMatches; i++) {
                    await this.getMatchDataPerSummonerMatch(allMatchIds[i])
                        .then((matchDataObj) => {
                            allMatchDataArr.push(matchDataObj);
                        })
                        .catch((err) => {
                            console.log("No data retreived, API failed with error: ", err)
                            return reject(err);
                        })
                }
                return resolve(allMatchDataArr);
            }
            else {
                return reject("No matches were played by the summoner, no matchIds received");
            }
        })
    }

}