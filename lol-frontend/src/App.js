import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sumName: '',
      loadingText: 'Your stats will be displayed here',
      response: []
    };
  }

  submitSummoner = async e => {
    this.setState({loadingText: "Loading data.."})
    e.preventDefault();
    let result = await fetch("http://localhost:3000/summoner", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sumName: this.state.sumName })
    });

    let jsonResult = await result.text();
    jsonResult = JSON.parse(jsonResult);
    console.log((jsonResult));
    //this.setState({loadingText: (jsonResult === "API failed, try again" ? "" : "No data retreived from that name, try again please")}) 
    this.setState({ response: jsonResult });
    this.setState({loadingText: ""})

  };

  render() {
    return (
      <div className="App">
        <div className="input-div">
        <input id="input-text"type="text" placeholder="summoner name here" value={this.state.post} onChange={e => this.setState({ sumName: e.target.value })}></input>
        <button onClick={this.submitSummoner} id="submit-btn">Submit Name</button>
        </div>
        <p id="loading">{this.state.loadingText}</p>
        <div className="d-flex-out">
          
          {this.state.response.map(el => (
            <div className="each-card" key={el.id}>
              <div className="section-div">
                <p>Ranked Solo</p>
                <p> {el.daysAgo} days ago </p>
                <p> {el.victory} </p>
              </div>
              <div className="section-div">
                <img src={el.champImage} alt= {el.championName} className="champ-img"></img>
                <p id="champ-name">{el.championName}</p>
              </div>
              <div className="section-div">
                <p>{el.kills} / {el.deaths} / {el.assists}</p>
                <p> {el.kda}:1 KDA </p>
              </div>
              <div className="section-div">
                <p>Level{el.champLevel}</p>
                <p>{el.totalMinionsKilled} ({el.creepScorePerMinute}) CS</p>
              </div>
              <div className="section-div">
              </div>
              </div>
          ))}

        </div>
      </div>
    );
  }
}

export default App;


