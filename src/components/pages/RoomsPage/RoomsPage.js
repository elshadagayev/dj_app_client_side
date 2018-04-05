import React from 'react'
import axios from 'axios'
import config from '../../../config.json'
import $ from 'jquery'
import { Modal, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import './css/style.css'

class RoomsPage extends React.Component {
    constructor () {
        super()
        this.state = {
            add_room_show: false,
            rooms: []
        }

        this.openAddRoomModal = this.openAddRoomModal.bind(this);
        this.closeAddRoomModal = this.closeAddRoomModal.bind(this);
        this.saveRoom = this.saveRoom.bind(this);
    }

    componentDidMount () {
        this.getMyRooms((err, res) => {
            if(err)
                return;
            
            this.setState({
                ...this.state,
                rooms: res.data
            })
        });
    }

    componentDidUpdate () {
        this.getMyRooms((err, res) => {
            if(err)
                return;
            
            this.setState({
                ...this.state,
                rooms: res.data
            })
        });
    }

    openAddRoomModal () {
        this.setState({
            ...this.state,
            add_room_show: true
        })
    }

    closeAddRoomModal () {
        this.setState({
            ...this.state,
            add_room_show: false
        })
    }

    render () {
        return (
            <div className="row">
                <div className="col-lg-3"></div>
                <div className="col-lg-6">
                    <div className="form-group">
                        <button className="form-control btn btn-primary" onClick={this.openAddRoomModal}>+ Add Room</button>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Password</th>
                                <th>Clients</th>
                                <th>Songs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.displayRooms()}
                        </tbody>
                    </table>
                    {this.addRoomModal()}
                </div>
                <div className="col-lg-3"></div>
            </div>
        )
    }

    displayRooms () {
        if(!this.state.rooms.length)
            return (<tr><td colSpan={5}>There is no room yet</td></tr>)

        let count = 0;

        return this.state.rooms.map((el, ind) => {
            count++;
            return (
            <tr key={count}>
                <td>{count}</td>
                <td><Link to={"/rooms/"+el._id}>{el.name}</Link></td>
                <td>{el.password}</td>
                <td>{el.clients.length}</td>
                <td>{el.songs.length}</td>
            </tr>
            )
        })
    }

    getMyRooms (callback) {
        const user = JSON.parse(window.localStorage.getItem("user"));
        if(!user)
            return;

        axios.get(config.api_server + "/api/dj/rooms", {
            params: {
                token: user.token
            }
        }).then(res => {
            callback(null, res.data)
        }).catch(err => {
            callback(err, null);
        })
    }

    saveRoom () {
        const name = $('#room_name').val();
        const password = $('#room_password').val();
        const user = JSON.parse(window.localStorage.getItem("user"))

        console.log("user", user);

        axios.post(config.api_server + '/api/dj/rooms/create', {
            name, password, dj: user.token
        }).then(res => {
            this.closeAddRoomModal();
            this.forceUpdate()
        }).catch(err => {
            this.closeAddRoomModal();
        });
    }

    addRoomModal () {        
        return (
            <Modal
                show={this.state.add_room_show}
                onHide={() => {}}
                container={this}
                aria-labelledby="contained-modal-title"
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                    Create New Room
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="room_name">Name</label>
                        <input type="text" id="room_name" placeholder="Room name" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="room_password">Password</label>
                        <input type="text" id="room_password" placeholder="Room password" className="form-control" />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-primary" onClick={this.saveRoom}>Save</Button>
                    <Button onClick={this.closeAddRoomModal}>Close</Button>
                </Modal.Footer>
                </Modal>
        )
    }
}

export default RoomsPage