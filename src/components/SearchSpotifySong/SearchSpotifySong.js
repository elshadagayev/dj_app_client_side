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

        this.searchSong = this.searchSong.bind(this);
        this.playSong = this.playSong.bind(this);
        this.timeOutHandler = 0;
        this.state = {
            audioPlayer: new Audio(),
            songs: [],
            offset: 0,
            limit: 50
        }
    }

    render () {
        if(!this.user.spotify_access_token)
            return this.displaySpotifyAuthButton();
        return this.displaySpotifySearch();
    }

    displaySpotifyAuthButton () {
        return (
            <a class="btn btn-primary" href={this.spotifyAuthUrl}>Get Access To Spotify</a>
        )
    }

    playSong (button, url) {
        if(this.state.audioPlayer.src != url) {
            this.state.audioPlayer.src = url;
            this.state.audioPlayer.play();
            button.innerHTML = 'Pause';
        } else if(this.state.audioPlayer.paused) {
            this.state.audioPlayer.play();   
            button.innerHTML = 'Pause';         
        } else {
            this.state.audioPlayer.pause();
            button.innerHTML = 'Play';
        }
    }

    displaySpotifySearch () {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="form-group">
                        <br />
                        <input onInput={this.searchSong} className="form-control" type="search" ref="search_song" placeholder="Search for song" />
                    </div>
                </div>
                {this.state.songs.length ? 
                (
                    <div className="col-lg-12">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Artist</th>
                                    <th>Release Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.songs.map((el, ind) => {
                                    const album = el.album;
                                    if(!el.preview_url)
                                        return;
                                    return (
                                        <tr key={ind} id={`tr_${ind}`}>
                                            <td><button className="btn btn-primary" onClick={(e) => {
                                                this.playSong(e.target, el.preview_url)
                                            }}>play</button></td>
                                            <td>{album.name}</td>
                                            <td>{album.artists.map((artist) => {
                                                return (<div>{artist.name}</div>)
                                            })}</td>
                                            <td>{album.release_date}</td>
                                            <td><button className="btn btn-primary" onClick={() => {
                                                this.addSong(el.id, `tr_${ind}`)
                                            }}>Add</button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : ""}
            </div>
        )
    }

    addSong (songID, trId) {
        axios.post(config.api_server + '/api/client/songs/add', 
        {
            songID,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            let data = res.data;
            if(data.statusCode !== 200)
                return;
            const trDOM = document.querySelector('#' + trId)
           trDOM.parentNode.removeChild(trDOM);
        })
    }

    searchSong (e) {
        const input = e.target;
        const spotify_access_token = this.user.spotify_access_token;

        clearTimeout(this.timeOutHandler);
        this.timeOutHandler = setTimeout(() => {
            axios.get('https://api.spotify.com/v1/search', {
                params: {
                    q: input.value,
                    type: 'track,album,playlist,artist',
                    offset: this.state.offset,
                    limit: this.state.limit
                },
                headers: {
                    "Authorization": `Bearer ${spotify_access_token}`,
                }
            }
        ).then(res => {
                this.setState({
                    ...this.state,
                    songs: res.data.tracks.items,
                })
            }).catch(err => {
                console.log("spotify error", err);
            })
        }, 1000);
    }
}

export default SearchSpotifySong