const dataMethods = require("./data-methods.js");
const express = require("express");
const path = require("path");
var bodyParser = require("body-parser")
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static('lol-frontend/build'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(PORT, () => {
    console.log("Server running and listening for requests!");
})

// app.get('/read', (req, res) => {
//     res.send({ read: "Go to the home page to enter your summoner name and view your LoL game statistics!"});
// })

app.post('/summoner', (req, res) => {
    //console.log("node request body: ", req.body);
    if(req.body && req.body.sumName){
    dataMethods.getIdByName(req.body.sumName)
        .then((summonerDetails) => {
            dataMethods.getAllMatchesPlayedBySummoner(summonerDetails.puuid)
                .then((allMatches) => {
                    dataMethods.getAllMatchesSummonerDetails(allMatches)
                        .then((allMatchesSummonerData) => {
                            res.send(allMatchesSummonerData);
                        })
                        .catch((err) => {
                            console.log("getAllMatchesSummonerDetails API failed with error: ", err);
                            res.send("API failed, try again");
                        })
                })
                .catch((err) => {
                    console.log("getAllMatchesPlayedBySummoner API failed with error: ", err);
                    res.send("API failed, try again");
                })
        })
        .catch((err) => {
            console.log("getIdByName API failed with error: ", err);
            res.send("API failed, try again");
        })
    }
    else{
        res.send("Empty body received. Cannot process any further")
    }
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '/lol-frontend/build', 'index.html'))
})