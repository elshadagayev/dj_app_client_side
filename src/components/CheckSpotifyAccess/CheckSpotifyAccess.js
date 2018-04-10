import React from 'react'
import config from '../../config.json'
import axios from 'axios'

class SearchSpotifySong extends React.Component {
    constructor () {
        super()
        this.user = JSON.parse(window.localStorage.getItem("user"));
        this.spotifyAuthUrl = "https://accounts.spotify.com/authorize?" + [
            "client_id=" + config.spotify_client_id,
            "scope=playlist-read-private playlist-read-collaborative playlist-modify-public user-read-recently-played playlist-modify-private ugc-image-upload user-follow-modify user-follow-read user-library-read user-library-modify user-read-private user-read-email user-top-read user-read-playback-state",
            "response_type=token",
            "redirect_uri=http://localhost:3000/callback"
        ].join('&')
    }

    componentDidMount () {
        if(window.location.hash.match(/^#access_token/))
            return this.saveSpotifyAccessToken();

        setInterval(this.checkSpotifyTokenExpireTime.bind(this), 1000);
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