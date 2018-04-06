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
            all_songs: [],
            current_tab: TAB_SEARCH_SONG,
            audioPlayer: new Audio(),
        }

        this.clickTab = this.clickTab.bind(this);
        this.playSong = this.playSong.bind(this);
        this.removeMyAudio = this.removeMyAudio.bind(this);
    }

    componentDidMount () {
        if(!this.user)
            return;
        
        switch(this.user.type) {
            case USER_TYPE_CLIENT:
                if(window.location.hash.match(/^#access_token/))
                    return this.saveSpotifyAccessToken();
                setInterval(this.checkSpotifyTokenExpireTime.bind(this), 1000);
                this.getClientSongs();
                this.getAllSongs();
                break;
        }
    }

    checkSpotifyTokenExpireTime () {
        const create_time = this.user.spotify_access_token_create_time;
        if(!create_time)
            return;
        const now = Date.now();

        if(Math.abs(create_time - now) > config.spotify_token_expire_time) {
            this.user.spotify_access_token = this.user.spotify_access_token_create_time = undefined;
            window.localStorage.setItem('user', JSON.stringify(this.user));
            return;
        }
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

    getClientSongs () {
        let songs = this.state.songs;
        axios.get(config.api_server + '/api/client/songs', {
            params: {
                token: this.user.token,
                clientID: this.user.id
            }
        }).then(res1 => {
            if(res1.data.statusCode !== 200)
                return;

            const ids = res1.data.data.map(el => {
                return el.songID;
            })

            if(!ids || !ids.length)
                return this.setState({
                    ...this.state,
                    songs: []
                });

            axios.get('https://api.spotify.com/v1/tracks', {
                params: {
                    ids: ids.join(','),
                },
                headers: {
                    "Authorization": `Bearer ${this.user.spotify_access_token}`,
                }
            }).then(res => {
                let songs = res.data.tracks.map(song => {
                    const songs = {
                        id: song.id,
                        artists: song.artists.map(el => el.name),
                        preview_url: song.preview_url,
                        name: song.album.name,
                        release_date: song.album.release_date,
                    }

                    return songs;
                })

                songs = songs.map(el => {
                    let song = res1.data.data.find(song => {
                        return song.songID == el.id
                    })

                    el.clientID = song.clientID;
                    el.likes = song.likes;
                    el.dislikes = song.dislikes;
                    return el;
                })

                this.setState({
                    ...this.state,
                    songs
                })
            })
        })
    }

    getAllSongs () {
        let songs = this.state.all_songs || [];
        axios.get(config.api_server + '/api/client/songs/all', {
            params: {
                token: this.user.token,
                clientID: this.user.id
            }
        }).then(res1 => {
            if(res1.data.statusCode !== 200)
                return;
            
            const ids = res1.data.data.map(el => {
                return el.songID;
            })

            if(!ids || !ids.length)
                return this.setState({
                    ...this.state,
                    all_songs: []
                });

            axios.get('https://api.spotify.com/v1/tracks', {
                params: {
                    ids: ids.join(','),
                },
                headers: {
                    "Authorization": `Bearer ${this.user.spotify_access_token}`,
                }
            }).then(res => {
                let songs = res.data.tracks.map(song => {
                    const songs = {
                        id: song.id,
                        artists: song.artists.map(el => el.name),
                        preview_url: song.preview_url,
                        name: song.album.name,
                        release_date: song.album.release_date,
                    }

                    return songs;
                })

                songs = songs.map(el => {
                    let song = res1.data.data.find(song => {
                        return song.songID == el.id
                    })

                    el.clientID = song.clientID;
                    el.likes = song.likes;
                    el.dislikes = song.dislikes;
                    return el;
                })

                this.setState({
                    ...this.state,
                    all_songs: songs
                })
            }).catch(err => {
                //console.log("BBB", err);
            })
        }).catch(err => {
            //console.log("AAA", err);
        })
    }

    saveSpotifyAccessToken () {
        let access_token = window.location.hash.split("=")
        if(access_token[1])
            access_token = access_token[1];
        
        this.user.spotify_access_token = access_token;
        this.user.spotify_access_token_create_time = Date.now();
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
            <ul className="nav nav-tabs">
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
            case TAB_ALL_SONGS:
                return this.displayAllSongs();
            default:
                return this.displaySearch()
        }
    }

    displayClientSongs () {
        return (
            <div className="row">
                {this.state.songs.length ? 
                (
                    <div className="col-lg-12">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Likes / Dislikes</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.songs.map((el, ind) => {
                                    return (
                                        <tr key={ind}>
                                            <td><button className="btn btn-primary" onClick={(e) => {
                                                this.playSong(e.target, el.preview_url)
                                            }}>play</button></td>
                                            <td>{el.name} ({el.artists.join(',')})</td>
                                            <td>{el.likes} / {el.dislikes}</td>
                                            <td>{!el.likes && !el.dislikes ? (<button className="btn btn-danger" onClick={() => this.removeMyAudio(el.id)}>X</button>) : (<div></div>)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (<div>There is no song</div>)}
            </div>
        )
    }

    displayAllSongs () {
        return (
            <div className="row">
                {this.state.all_songs.length ? 
                (
                    <div className="col-lg-12">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.all_songs.map((el, ind) => {
                                    return (
                                        <tr key={ind}>
                                            <td><button className="btn btn-primary" onClick={(e) => {
                                                this.playSong(e.target, el.preview_url)
                                            }}>play</button></td>
                                            <td>{el.name} ({el.artists.join(',')})</td>
                                            <td>
                                                {el.clientID !== this.user.id ? (
                                                    <div>
                                                        <button onClick={() => this.likeSong(el)} className="btn btn-primary">like</button>
                                                        <button onClick={() => this.dislikeSong(el)}  className="btn btn-primary">dislike</button>
                                                    </div>
                                                ) : ""}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (<div>There is no song</div>)}
            </div>
        )
    }

    likeSong (song) {
        axios.post(config.api_server + '/api/client/songs/like', {
            songID: song.id,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            this.getAllSongs();
        })
    }

    dislikeSong (song) {
        axios.post(config.api_server + '/api/client/songs/like', {
            songID: song.id,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            this.getAllSongs();
        })
    }

    removeMyAudio (songID) {
        axios.post(config.api_server + '/api/client/songs/remove', {
            songID,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            this.getClientSongs();
        })
    }

    displaySearch () {
        return <SearchSpotifySong onGetSongs={this.getClientSongs.bind(this)} />
    }
}

export default HomePage