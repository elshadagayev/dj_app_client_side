import React from 'react'
import axios from 'axios'
import PageBlocker from '../../PageBlocker'
import MySocket from '../../../modules/my-socket/SocketIO'
import CheckSpotifyAccess from '../../CheckSpotifyAccess'
import PlayList from './PlayList'
import './css/style.css'
import config from '../../../config.json'
import Script from 'react-load-script'

const TAB_GENERAL_INFO = 'tab/general_info'
const TAB_CLIENTS = 'tab/clients'
const TAB_SONGS = 'tab/songs'

class RoomPage extends React.Component {
    constructor () {
        super()
        this.io = new MySocket();
        this.state = {
            current_tab: TAB_GENERAL_INFO,
            general_info: {
                room: {},
                dj: {}
            },
            server_connect_failed: null,
            room: {
                clients: [],
                songs: [],
            },
            playlist: []
        }

        this.user = JSON.parse(window.localStorage.getItem("user"))

        this.openTab = this.openTab.bind(this);
    }

    componentDidMount () {
        if(!this.user)
            return
        
        this.getGeneralInfo();
        //this.checkRoomExistance();

        //this.getRoomInfo();
    }

    getGeneralInfo () {
        try {
            const token = this.user.token; 
            const roomID = this.props.match.params.roomid;
            
            const socket = this.io.request('get_dj_room_general_info', {
                token, roomID
            }, res => {
                if(res.statusCode !== 200)
                    return;

                if(res.data.room.songs) {
                    const ids = res.data.room.songs.map(el => {
                        return el.songID;
                    })
        
                    if(!ids || !ids.length)
                        return;
        
                    axios.get('https://api.spotify.com/v1/tracks', {
                        params: {
                            ids: ids.join(','),
                        },
                        headers: {
                            "Authorization": `Bearer ${this.user.spotify_access_token}`,
                        }
                    }).then(sres => {
                        let songs = sres.data.tracks.map(song => {
                            const songs = {
                                id: song.id,
                                artists: song.artists.map(el => el.name),
                                preview_url: song.preview_url,
                                uri: song.uri,
                                name: song.album.name,
                                release_date: song.album.release_date,
                            }
        
                            return songs;
                        })
        
                        songs = songs.map(el => {
                            let song = res.data.room.songs.find(song => {
                                return song.songID == el.id
                            })
        
                            el.clientID = song.clientID;
                            el.likes = song.likes;
                            el.dislikes = song.dislikes;
                            return el;
                        })

                        const room = this.state.room;
                        room.songs = songs || [];
        
                        this.setState({
                            ...this.state,
                            room,
                            playlist: room.songs
                        })
                    })
                }

                const room = {
                    clients: res.data.room.clients || []
                }

                this.setState({
                    ...this.state,
                    general_info: res.data,
                    room
                })
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
        } catch(E) {
            
        }
    }

    getRoomInfo () {
        axios.get(config.api_server + '/api/dj/room', {
            params: {
                room_id: this.props.match.params.roomid,
                token: this.user.token
            }
        }).then(res => {
            this.setState({
                ...this.state,
                room: res.data.data
            })
        }).catch(err => {
            this.setState({
                ...this.state,
                room: null
            })
        })
    }

    componentDidUpdate () {
        
    }

    render () {
        return (
            <PageBlocker block={!!this.state.server_connect_failed} messages={this.state.server_connect_failed}>
                <div className="row">
                    <div className="col-lg-3"></div>
                    <div className="col-lg-6">
                        {this.displayRoom()}
                    </div>
                    <div className="col-lg-3"></div>
                </div>
            </PageBlocker>
        )
    }

    openTab (e) {
        e.preventDefault();
        const a = e.target;
        switch(a.dataset.id) {
            case TAB_GENERAL_INFO:
                this.setState({
                    ...this.state,
                    current_tab: TAB_GENERAL_INFO
                })
                break;
            case TAB_CLIENTS:
                this.setState({
                    ...this.state,
                    current_tab: TAB_CLIENTS
                })
                break;
            case TAB_SONGS:
                this.setState({
                    ...this.state,
                    current_tab: TAB_SONGS
                })
                break;
            default:
                this.setState({
                    ...this.state,
                    current_tab: TAB_GENERAL_INFO
                })
        }
    }

    displayTabs () {
        return (
            <ul className="nav nav-tabs">
                <li className={this.state.current_tab === TAB_GENERAL_INFO ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_GENERAL_INFO}>General info</a></li>
                <li className={this.state.current_tab === TAB_CLIENTS ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_CLIENTS}>Clients ({this.state.general_info.room.clients_len})</a></li>
                <li className={this.state.current_tab === TAB_SONGS ? "active" : ""}><a href="#" onClick={this.openTab} data-id={TAB_SONGS}>Songs ({this.state.general_info.room.songs_len})</a></li>
            </ul>
        )
    }

    displayTabsBody () {
        switch(this.state.current_tab) {
            case TAB_GENERAL_INFO:
                return this.displayGeneralInfo();
            case TAB_CLIENTS:
                return this.displayClients();
            case TAB_SONGS:
                return this.displaySongs();
            default:
                return this.displayGeneralInfo();
        }
    }

    displayGeneralInfo () {
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <td>Name:</td>
                        <td>{this.state.general_info.room.name}</td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td>{this.state.general_info.room.password}</td>
                    </tr>
                    <tr>
                        <td>Clients:</td>
                        <td>{this.state.general_info.room.clients_len}</td>
                    </tr>
                    <tr>
                        <td>Songs:</td>
                        <td>{this.state.general_info.room.songs_len}</td>
                    </tr>
                </tbody>
            </table>
        )
    }

    displaySongs () {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {!this.state.room.songs || !this.state.room.songs.length ? (<tr><td colSpan={5} className="text-center">No song</td></tr>) :
                        this.state.room.songs.map((el, ind) => {
                            return (
                                <tr key={el.id}>
                                    <td>{ind+1}</td>
                                    <td><PlayList uri={el.uri} /></td>
                                    <td><a href={el.uri} class="btn btn-primary">Spotify Player</a></td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    displayClients () {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Songs</th>
                    </tr>
                </thead>
                <tbody>
                    {!this.state.room.clients.length ? (<tr><td colSpan={5} className="text-center">No client</td></tr>) :
                        this.state.room.clients.map((el, ind) => {
                            return (
                                <tr key={ind}>
                                    <td>{ind+1}</td>
                                    <td>{el.full_name}</td>
                                    <td>{el.songs}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    displayRoom () {
        if(!this.state.room)
            return (<h2>There is no room</h2>)
        
        return (
            <div>
                <CheckSpotifyAccess redirect={window.location.href}>
                    {this.displayTabs()}
                    {this.displayTabsBody()}
                </CheckSpotifyAccess>
            </div>
        )
    }
}

export default RoomPage