import React from 'react'
import { USER_TYPE_CLIENT, USER_TYPE_DJ } from '../LoginPage/LoginPage'
import SearchSpotifySong from '../../SearchSpotifySong'
import config from '../../../config.json'
import axios from 'axios'

const TAB_MY_SONGS = 'tabs/my_songs'
const TAB_ALL_SONGS = 'tabs/all_songs'
const TAB_SEARCH_SONG = 'tabs/search_song'

class HomePage extends React.Component {
    constructor () {
        super()
        this.user = JSON.parse(window.localStorage.getItem("user"))
        this.state = {
            songs: [],
            current_tab: TAB_SEARCH_SONG
        }

        this.clickTab = this.clickTab.bind(this);
    }

    componentDidMount () {
        if(!this.user)
            return;
        
        switch(this.user.type) {
            case USER_TYPE_CLIENT:
                if(window.location.hash.match(/^#access_token/))
                    return this.saveSpotifyAccessToken();
                this.getClientSongs();
                break;
        }
    }

    getClientSongs () {
        let songs = this.state.songs;
        axios.get(config.api_server + '/api/client/songs', {
            params: {
                token: this.user.token,
                clientID: this.user.id
            }
        }).then(res => {
            if(res.data.statusCode !== 200)
                return;
            
            this.setState({
                ...this.state,
                songs: res.data.data
            })
        })
    }

    saveSpotifyAccessToken () {
        let access_token = window.location.hash.split("=")
        if(access_token[1])
            access_token = access_token[1];
        
        this.user.spotify_access_token = access_token;
        window.localStorage.setItem("user", JSON.stringify(this.user));
        window.location.href = "/" 
    }

    render () {
        if(!this.user)
            return (<div></div>)
        switch(this.user.type) {
            case USER_TYPE_DJ:
                return this.djHomePage()
            case USER_TYPE_CLIENT:
                return this.clientHomePage();
        }
    }

    djHomePage () {
        return (<div>DJ HomePage</div>)
    }

    clientHomePage () {
        return (
            <div className="row">
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    {this.displayTabs()}
                    {this.displayTabsBody()}
                </div>
                <div className="col-lg-3"></div>
            </div>
        )
    }

    clickTab (e) {
        e.preventDefault();

        switch(e.target.dataset.id) {
            case TAB_SEARCH_SONG:
            case TAB_ALL_SONGS:
            case TAB_MY_SONGS:
                return this.setState({
                    ...this.state,
                    current_tab: e.target.dataset.id
                })
            default:
                this.setState({
                    ...this.state,
                    current_tab: TAB_SEARCH_SONG
                })
        }
    }

    displayTabs () {
        return (
            <ul class="nav nav-tabs">
                <li className={this.state.current_tab === TAB_SEARCH_SONG ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_SEARCH_SONG}>Search</a></li>
                <li className={this.state.current_tab === TAB_MY_SONGS ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_MY_SONGS}>My Songs</a></li>
                <li className={this.state.current_tab === TAB_ALL_SONGS ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_ALL_SONGS}>Songs</a></li>
            </ul>
        )
    }

    displayTabsBody () {
        switch(this.state.current_tab) {
            case TAB_MY_SONGS:
                return this.displayClientSongs();
            default:
                return this.displaySearch()
        }
    }

    displayClientSongs () {
        axios.get(config.api_server + '/api/client/songs', {
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            console.log("AAA", res);
        })

        return (<div>my songs</div>)
    }

    displaySearch () {
        return <SearchSpotifySong />
    }
}

export default HomePage