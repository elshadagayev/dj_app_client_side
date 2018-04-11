import React from 'react'
import { USER_TYPE_CLIENT, USER_TYPE_DJ } from '../LoginPage/LoginPage'
import SearchSpotifySong from '../../SearchSpotifySong'
import config from '../../../config.json'
import CheckSpotifyAccess from '../../CheckSpotifyAccess'
import axios from 'axios'
import MySocket from '../../../modules/my-socket/SocketIO';
import PageBlocker from '../../PageBlocker'

const TAB_GENERAL_INFO = 'tabs/general_info'
const TAB_MY_SONGS = 'tabs/my_songs'
const TAB_ALL_SONGS = 'tabs/all_songs'
const TAB_SEARCH_SONG = 'tabs/search_song'

class HomePage extends React.Component {
    constructor () {
        super()
        this.user = JSON.parse(window.localStorage.getItem("user"))
        const audioPlayer = new Audio();
        audioPlayer.onended = () => {
            document.querySelectorAll('.play-btn').forEach(button => {
                button.innerHTML = 'Play';
            });
        }

        this.io = new MySocket();
        
        this.state = {
            songs: [],
            all_songs: [],
            current_tab: TAB_GENERAL_INFO,
            audioPlayer,
            server_connect_failed: null,
            general_info: {}
        }

        this.openTab = this.openTab.bind(this);
        this.playSong = this.playSong.bind(this);
        this.removeMyAudio = this.removeMyAudio.bind(this);
    }

    componentDidMount () {
        if(!this.user)
            return;
        
        switch(this.user.type) {
            case USER_TYPE_CLIENT:
                this.getClientSongs();
                this.getAllSongs();
                this.getGeneralInfo();
                this.checkRoomExistance();
                break;
        }
    }

    playSong (button, url) {
        document.querySelectorAll('.play-btn').forEach(button => {
            button.innerHTML = 'Play';
        });

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

    /*getClientSongs_bkp () {
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
    }*/

    getClientSongs () {
        const socket = this.io.request('get_client_songs', {
            token: this.user.token,
            clientID: this.user.id
        }, res1 => {
            if(res1.statusCode !== 200)
                return;

            const ids = res1.data.map(el => {
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
                    let song = res1.data.find(song => {
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
        });
    }

    getAllSongs () {
        let songs = this.state.all_songs || [];
        const socket = this.io.request('get_all_songs', {
            token: this.user.token,
            clientID: this.user.id
        }, res1 => {
            this.setState({
                ...this.state,
                server_connect_failed: null
            })
            if(res1.statusCode !== 200)
                return;
            
            const ids = res1.data.map(el => {
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
                    let song = res1.data.find(song => {
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
            })
        })

        socket.on('connect_error', err => {
            /*this.setState({
                ...this.state,
                server_connect_failed: 'Could not be connected to the server'
            })*/
        })

        socket.on('connect_timeout', timeout => {
            /*this.setState({
                ...this.state,
                server_connect_failed: 'Could not connect to the server'
            })*/
        })

        socket.on('error', err => {
            /*this.setState({
                ...this.state,
                server_connect_failed: 'Could not connect to the server'
            })*/
        })

        socket.on('disconnect', reason => {
            this.setState({
                ...this.state,
                server_connect_failed: 'Disconnected from the server'
            })
        })

        socket.on('reconnect', attemptNumber => {
            this.setState({
                ...this.state,
                server_connect_failed: null
            })
        })

        socket.on('reconnect_attempt', attemptNumber => {
            this.setState({
                ...this.state,
                server_connect_failed: 'Could not be connected to the server. Trying to connect to the server. Attempt ' + attemptNumber
            })
        })

        socket.on('reconnecting', attemptNumber => {
            let message = (
            <div>
                <div>Could not be connected to the server</div>
                <div>Trying to connect to the server...</div>
                <div>Attempt #{attemptNumber}</div>
            </div>
            )
            
            this.setState({
                ...this.state,
                server_connect_failed: message
            })
        })
    }

    checkRoomExistance () {
        try { 
            const roomToken = this.user.token;

            const socket = this.io.request('room_deleted', {
                roomToken
            }, res => {
                if(res.statusCode !== 200)
                    return;

                this.user = null;
                window.localStorage.setItem('user', null);
                window.location.reload();
            })
        } catch(E) {
            
        }
    }

    getGeneralInfo () {
        try {
            const clientID = this.user.id; 
            const roomToken = this.user.token;
            
            const socket = this.io.request('get_room_general_info', {
                clientID, roomToken
            }, res => {
                if(res.statusCode !== 200)
                    return;

                this.setState({
                    ...this.state,
                    general_info: res.data
                })
            })
        } catch(E) {
            
        }
    }

    render () {
        return (
        <PageBlocker block={!!this.state.server_connect_failed} messages={this.state.server_connect_failed}>
            {this.condRender()}
        </PageBlocker>
        )
    }

    condRender () {
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
        return (
            <CheckSpotifyAccess>
                <div>DJ HomePage</div>
            </CheckSpotifyAccess>
        )
    }

    clientHomePage () {
        return (
                <div className="row">
                    <div className="col-lg-3"></div>
                    <div className="col-lg-6">
                        <CheckSpotifyAccess>
                            {this.displayTabs()}
                            {this.displayTabsBody()}
                        </CheckSpotifyAccess>
                    </div>
                    <div className="col-lg-3"></div>
                </div>
        )
    }

    openTab (e) {
        e.preventDefault();

        switch(e.target.dataset.id) {
            case TAB_GENERAL_INFO:
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
                <li className={this.state.current_tab === TAB_GENERAL_INFO ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_GENERAL_INFO}>General Info</a></li>
                <li className={this.state.current_tab === TAB_MY_SONGS ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_MY_SONGS}>My Songs ({this.state.songs.length})</a></li>
                <li className={this.state.current_tab === TAB_ALL_SONGS ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_ALL_SONGS}>All Songs ({this.state.all_songs.length})</a></li>
                <li className={this.state.current_tab === TAB_SEARCH_SONG ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_SEARCH_SONG}>Search</a></li>
            </ul>
        )
    }

    displayTabsBody () {
        switch(this.state.current_tab) {
            case TAB_GENERAL_INFO:
                return this.displayClientGeneralInfo();
            case TAB_MY_SONGS:
                return this.displayClientSongs();
            case TAB_ALL_SONGS:
                return this.displayAllSongs();
            default:
                return this.displaySearch()
        }
    }

    displayClientGeneralInfo () {
        return (
            <table class="table">
                <tbody>
                    <tr>
                        <td style={{width:'20%'}}>My name:</td>
                        <td>{this.state.general_info.client}</td>
                    </tr>
                    <tr>
                        <td style={{width:'20%'}}>Room name:</td>
                        <td>{this.state.general_info.name}</td>
                    </tr>
                    <tr>
                        <td>Room password:</td>
                        <td>{this.state.general_info.password}</td>
                    </tr>
                    <tr>
                        <td>Songs:</td>
                        <td>{this.state.general_info.songs}</td>
                    </tr>
                    <tr>
                        <td>Room clients:</td>
                        <td>{this.state.general_info.clients}</td>
                    </tr>
                </tbody>
            </table>
        )
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
                                        <tr key={el.id}>
                                            <td><button className="btn btn-primary play-btn" onClick={(e) => {
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
                ) : (<div className="no-data">There is no song</div>)}
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
                                        <tr key={el.id}>
                                            <td><button className="btn btn-primary play-btn" onClick={(e) => {
                                                this.playSong(e.target, el.preview_url)
                                            }}>play</button></td>
                                            <td>{el.name} ({el.artists.join(',')})</td>
                                            <td>
                                                {el.clientID !== this.user.id ? (
                                                    <div>
                                                        {!this.state.general_info.voting_stopped && !this.wasLiked(el.id) && !this.wasDisliked(el.id) ? (
                                                            <div>
                                                                <button onClick={() => this.likeSong(el)} className="btn btn-primary">like</button>
                                                                <button onClick={() => this.dislikeSong(el)}  className="btn btn-primary">dislike</button>
                                                            </div>
                                                        ): ""}
                                                    </div>
                                                ) : ""}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (<div className="no-data">There is no song</div>)}
            </div>
        )
    }

    wasLiked (songID) {
        const likes = this.user.likes || [];
        return likes.indexOf(songID) !== -1;
    }

    wasDisliked (songID) {
        const dislikes = this.user.dislikes || [];
        return dislikes.indexOf(songID) !== -1;
    }

    likeSong (song) {
        axios.post(config.api_server + '/api/client/songs/like', {
            songID: song.id,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            this.saveLikeDislikeHistory(song.id, 1);
        })
    }

    dislikeSong (song) {
        axios.post(config.api_server + '/api/client/songs/dislike', {
            songID: song.id,
            token: this.user.token,
            clientID: this.user.id
        }).then(res => {
            this.saveLikeDislikeHistory(song.id, -1);
        })
    }

    saveLikeDislikeHistory (songID, action) {
        const likes = this.user.likes || [];
        const dislikes = this.user.dislikes || [];

        switch(action) {
            case 1:
                likes.push(songID);
                break;
            case -1:
                dislikes.push(songID);
                break;
        }

        this.user.likes = likes;
        this.user.dislikes = dislikes;
        window.localStorage.setItem('user', JSON.stringify(this.user));
    }

    removeMyAudio (songID) {
        axios.post(config.api_server + '/api/client/songs/remove', {
            songID,
            token: this.user.token,
            clientID: this.user.id
        })
    }

    displaySearch () {
        return <SearchSpotifySong />
    }
}

export default HomePage