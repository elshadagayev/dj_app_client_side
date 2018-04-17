import React from 'react'
import config from '../../config.json'
import axios from 'axios'

class SearchSpotifySong extends React.Component {
    constructor () {
        super()
        this.user = JSON.parse(window.localStorage.getItem("user"));
        const scopes = [];
        this.spotifyAuthUrl = this.createSpotifyAuthUrl();

        //streaming user-read-birthdate user-read-email user-modify-playback-state user-read-private
    }

    componentDidMount () {
        if(window.location.hash.match(/^#access_token/))
            return this.saveSpotifyAccessToken();

        setInterval(this.checkSpotifyTokenExpireTime.bind(this), 1000);
    }

    createSpotifyAuthUrl () {
        const params = [
            "client_id=" + config.spotify_client_id,
            "response_type=token",
            "redirect_uri=" + encodeURIComponent(config.spotify_redirect_uri + "callback"),
            "show_dialog=true"
        ];

        switch(this.user.type) {
            case "DJ":
                params.push('scope=' + config.spotify_dj_scopes.join(' '))
                break;
            default:
                params.push('scope=' + config.spotify_client_scopes.join(' '))
        }

        //https://accounts.spotify.com/en/authorize?response_type=token&client_id=adaaf209fb064dfab873a71817029e0d&redirect_uri=https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/&scope=streaming user-read-birthdate user-read-email user-modify-playback-state user-read-private&show_dialog=true

        return "https://accounts.spotify.com/en/authorize?" + params.join('&')
    }

    render () {
        if(!this.user.spotify_access_token)
            return this.displaySpotifyAuthButton();
        return this.props.children;
    }

    saveSpotifyAccessToken () {
        let access_token = window.location.hash.split("=")
        if(access_token[1])
            access_token = access_token[1];
        
        this.user.spotify_access_token = access_token;
        this.user.spotify_access_token_create_time = Date.now();
        window.localStorage.setItem("user", JSON.stringify(this.user));
        window.location.href = this.props.redirect || "/" 
    }

    checkSpotifyTokenExpireTime () {
        const create_time = this.user.spotify_access_token_create_time;
        if(!create_time) {
            this.forceUpdate(() => {})
            return;
        }
        const now = Date.now();

        if(Math.abs(create_time - now) > config.spotify_token_expire_time) {
            this.user.spotify_access_token = this.user.spotify_access_token_create_time = undefined;
            window.localStorage.setItem('user', JSON.stringify(this.user));
            this.forceUpdate(() => {})
            return;
        }
    }

    displaySpotifyAuthButton () {
        return (
            <a className="btn btn-primary" href={this.spotifyAuthUrl}>Get Access To Spotify</a>
        )
    }
}

export default SearchSpotifySong