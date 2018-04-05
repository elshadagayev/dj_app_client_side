import React from 'react'
import axios from 'axios'
import './css/style.css'
import config from '../../../config.json'

const TAB_GENERAL_INFO = 'tab/general_info'
const TAB_CLIENTS = 'tab/clients'
const TAB_SONGS = 'tab/songs'

class RoomPage extends React.Component {
    constructor () {
        super()
        this.state = {
            current_tab: TAB_GENERAL_INFO,
            room: {
                clients: [],
                songs: []
            }
        }

        this.user = JSON.parse(window.localStorage.getItem("user"))

        this.clickTab = this.clickTab.bind(this);
    }

    componentDidMount () {
        if(!this.user)
            return

            /*axios.get(config.api_server + '/api/dj/room', {
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
            })*/

        this.getRoomInfo();

        setInterval(() => this.getRoomInfo(), 10000)
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

    render () {
        return (
            <div className="row">
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    {this.displayRoom()}
                </div>
                <div className="col-lg-3"></div>
            </div>
        )
    }

    clickTab (e) {
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
                <li className={this.state.current_tab === TAB_GENERAL_INFO ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_GENERAL_INFO}>General info</a></li>
                <li className={this.state.current_tab === TAB_CLIENTS ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_CLIENTS}>Clients ({this.state.room.clients.length})</a></li>
                <li className={this.state.current_tab === TAB_SONGS ? "active" : ""}><a href="#" onClick={this.clickTab} data-id={TAB_SONGS}>Songs ({this.state.room.songs.length})</a></li>
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
                //return this.displaySongs();
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
                        <td><input type="text" id="name" defaultValue={this.state.room.name} /></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><input type="text" id="password" defaultValue={this.state.room.password} /></td>
                    </tr>
                    <tr>
                        <td>Clients:</td>
                        <td>{this.state.room.clients.length}</td>
                    </tr>
                    <tr>
                        <td>Songs:</td>
                        <td>{this.state.room.songs.length}</td>
                    </tr>
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
                        <th>Token</th>
                    </tr>
                </thead>
                <tbody>
                    {!this.state.room.clients.length ? (<tr><td colSpan={5} className="text-center">No song</td></tr>) :
                        this.state.room.clients.map((el, ind) => {
                            return (
                                <tr key={ind}>
                                    <td>{ind+1}</td>
                                    <td>{el.full_name}</td>
                                    <td>{el.clientID}</td>
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
                {this.displayTabs()}
                {this.displayTabsBody()}
            </div>
        )
    }
}

export default RoomPage