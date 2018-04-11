import React from 'react'

class SpotifyPlayBack {
    constructor () {
        this.user = JSON.parse(window.localStorage.getItem("user"))
    }

    loadScript () {
        const addScript = document.createElement('script');
        addScript.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js');
        document.body.appendChild(addScript);
    }

    init () {
        this.loadScript();
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = this.user.spotify_access_token
            this.player = new window.Spotify.Player({
                name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: cb => { cb(token); },
                volume: 1,
            });

            // Error handling
            //player.addListener('initialization_error', ({ message }) => { console.error(message); });
            //player.addListener('authentication_error', ({ message }) => { console.error(message); });
            //player.addListener('account_error', ({ message }) => { console.error(message); });
            //player.addListener('playback_error', ({ message }) => { console.error(message); });

            // Playback status updates
            this.player.addListener('player_state_changed', state => { 
                if(!state) 
                    return;

                if(typeof this.get_state === 'function') {
                    this.get_state(state)
                }
            });

            // Ready
            this.player.addListener('ready', ({device_id}) => {
                this.play = ({
                    spotify_uri, 
                    playerInstance: {
                    _options: {
                        getOAuthToken,
                        id
                    }
                    }
                }) => {
                    getOAuthToken(access_token => {
                        const url = "https://api.spotify.com/v1/me/player/play?device_id=" + device_id
                        fetch(url, {
                            method: 'PUT',
                            body: JSON.stringify({ uris: [spotify_uri] }),
                            headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + access_token
                            },
                        });
                    });
                }
            });

            // Connect to the player!
            this.player.connect().then(success => {
                if(typeof this.getPlayer === 'function' && success) {
                    this.getPlayer(this.player);
                }
            }).catch(error => {
                
            });
        }
    }

    playSong (spotify_uri) {
        let interval = setInterval(() => {
            if(!this.play)
                return;

            clearInterval(interval);

            this.play({
                spotify_uri,
                playerInstance: this.player
            })
        }, 10);
    }
}

export default SpotifyPlayBack