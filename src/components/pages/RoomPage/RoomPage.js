import React from 'react'
import Header from '../../Header'
import axios from 'axios'
import config from '../../../config.json'

class RoomPage extends React.Component {
    constructor () {
        super()
        this.state = {
            
        }
    }

    componentDidMount () {
        const user = JSON.parse(window.localStorage.getItem("user"))
        axios.get(config.api_server + '/api/dj/room', {
            params: {
                room_id: this.props.match.params.roomid,
                token: user.token
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
            <div>
                <Header />
                {this.displayRoom()}
            </div>
        )
    }

    displayRoom () {
        if(!this.state.room)
            return (<h2>There is no room</h2>)
        
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
}

export default RoomPage