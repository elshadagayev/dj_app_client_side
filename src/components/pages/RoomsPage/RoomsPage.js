import React from 'react'
import Header from '../../Header'
import axios from 'axios'
import config from '../../../config.json'
import $ from 'jquery'
import { Modal, Button } from 'react-bootstrap'

class RoomsPage extends React.Component {
    constructor () {
        super()
        this.state = {
            add_room_show: false
        }

        this.openAddRoomModal = this.openAddRoomModal.bind(this);
        this.closeAddRoomModal = this.closeAddRoomModal.bind(this);
        this.saveRoom = this.saveRoom.bind(this);
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
        const rooms = this.getMyRooms();
        return (
            <div>
                <Header />
                <div><button className="btn btn-primary" onClick={this.openAddRoomModal}>+ Add Room</button></div>
                <table className="table">
                    <thead>

                    </thead>
                </table>
                {this.addRoomModal()}
            </div>
        )
    }

    getMyRooms () {
        const user = JSON.parse(window.localStorage.getItem("user"));
        axios.get(config.api_server + "/api/dj/rooms", {
            token: user.token,
            id: user.id
        }).then(res => {
            const data = res.data;
        }).catch(err => {
            
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
            this.forceUpdate(() => {
                
            })
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
                    Contained Modal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="room_name">Name</label>
                        <input type="text" id="room_name" placeholder="Room name" className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="room_password">Name</label>
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