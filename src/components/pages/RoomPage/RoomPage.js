import React from 'react'
import Header from '../../Header'
import axios from 'axios'
import config from '../../../config.json'
import $ from 'jquery'
import { Link } from 'react-router-dom'

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
                room: res
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
        return (<div></div>)
    }
}

export default RoomPage