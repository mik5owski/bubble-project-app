import React, { Component } from "react";
import { Header, Table, Button, Icon } from 'semantic-ui-react'

import PlayersForm from './PlayersForm'
import Player from '../player/Player'
import PlayerTable from './PlayerTable'

import './Players.css'


const fetchPlayers = async () => {
    const response = await fetch(process.env.PUBLIC_URL + "/players.json");
    const players = await response.json();
    return players;
}

const fetchSports = async () => {
    const response = await fetch(process.env.PUBLIC_URL + "/sports.json");
    const sports = await response.json();
    return sports;
}


const fetchUser = async () => {
    const response = await fetch(process.env.PUBLIC_URL + "/user.json");
    const user = await response.json();
    return user;
}


const fetchUsersFavorites = async () => {
    const response = await fetch(process.env.PUBLIC_URL + "/user.json");
    const user = await response.json();
    return user.favouritePlayersIDs;
}



class Players extends Component {

    state = {
        players: [],
        sports: [],
        user: {},
        favoritePlayers: [],
        filter: {
            player: '',
            location: '',
            sports: [],
        },
        filterVisible: false,
        clickedPlayer: {}
    };

    componentDidMount() {
        Promise.all([fetchPlayers(), fetchSports(), fetchUser(), fetchUsersFavorites()])
            .then(([players, sports, user, favPlayers]) => this.setState({
                players: players,
                sports: sports,
                user: user,
                favoritePlayers: favPlayers,
            }))
    }

    compareFavPlayers = () => {
        let favoritePlayersAsIs = this.state.user.favouritePlayersIDs;
        let usersFromLocStorage = JSON.parse(localStorage.getItem('favPlayersNoDups'));

        return usersFromLocStorage || favoritePlayersAsIs;
    }

    saveUserFavPlayersInLocStorage = (component, addedPlayer) => {
        let favouritePlayers = this.compareFavPlayers();
        let favPlayersNoDups = [];

        favouritePlayers.includes(addedPlayer) ? favouritePlayers.splice((favouritePlayers.indexOf(addedPlayer)), 1) : favouritePlayers.push(addedPlayer);
        favPlayersNoDups = favouritePlayers.filter((item, pos, self) => self.indexOf(item) === pos)

        localStorage.setItem('favPlayersNoDups', JSON.stringify(favPlayersNoDups));

        this.setState({ favoritePlayers: favPlayersNoDups })
        return favPlayersNoDups;
    }

    setNewFilter = (playerReceived, locationReceived, sportReceived) => {
        
        this.setState({
            filter: {   
                player: playerReceived,
                location: locationReceived,
                sports: sportReceived,
            }
        })
        this.toggleFilter()
    }

    toggleFilter = () => {
        this.state.filterVisible ? this.setState({ filterVisible: false }) : this.setState({ filterVisible: true })
    }

    saveClickedPlayerInfo = (player) => {
        this.setState({
            clickedPlayer: this.state.players.find(chosenPlayer => chosenPlayer.id === player.id)
        })
    }

    handlePlayerClick = (e) => {
        const player = document.querySelector('.player')
        const playerList = document.querySelector('.players')

        if (player.style.display === 'none') {
            this.saveClickedPlayerInfo(e)
            player.style.display = 'flex'
            playerList.style.display = 'none'
        } else {
            player.style.display = 'none'
            playerList.style.display = 'block'
        }
    }


    filterPlayers = (players) => {
        return players.filter(
            player => (
                player.localization.toLowerCase().includes(this.state.filter.location.toLowerCase())
            ))
        .filter(
            player => (
                player.name.toLowerCase().includes(this.state.filter.player.toLowerCase())
            ))
        .filter(
            player => (
                this.state.sports
                    .filter(sport => player.favouriteSportsIDs.includes(sport.id))                  
            ).some(sport => (this.state.filter.sports).includes(sport.id))  || this.state.filter.sports[0] === undefined)
    }


    render() {

        return (
        <div className="componentWrapper">
            <Player 
                togglePlayerView = {this.handlePlayerClick}
                player = {this.state.clickedPlayer}
                players= {this.state.players}
                sports = {this.state.sports}
            />
            <div className="players">

                <PlayersForm
                    toggleFilter={this.toggleFilter}
                    filterStatus={this.state.filterVisible}
                    searchForPlayer={this.setNewFilter}
                    sports={this.state.sports.map(
                        sport => ({
                            key: sport.id,
                            text: sport.name,
                            value: sport.id,
                        })
                    )}
                />
                <Table basic='very' celled>

                        <PlayerTable 
                            filterPlayers={this.filterPlayers}
                            compareFavPlayers={this.compareFavPlayers}
                            saveUserFavPlayersInLocStorage={this.saveUserFavPlayersInLocStorage}
                            sports={this.state.sports}
                            players={this.state.players}
                        />

                </Table>
            </div>
        </div>
        )
    }
}

export default Players