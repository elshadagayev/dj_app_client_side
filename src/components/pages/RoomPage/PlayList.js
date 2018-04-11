import React from 'react'
import Player from './Player'
import axios from 'axios'
import config from '../../../config.json'
import './css/playlist.css'

class PlayList extends React.Component {
    constructor () {
        super()

        this.user = JSON.parse(window.localStorage.getItem("user"))

        this.state = {
            spotify_uri: null,
            autoplay: true,
            repeat: true
        }
    }

    componentDidUpdate () {
        
    }

    play (song) {
        if(song.uri === this.state.spotify_uri)
            return;
            
        this.setState({
            ...this.state,
            spotify_uri: song.uri
        })
    }

    playNext (track) {
        if(!this.state.autoplay)
            return;

        let index = -1;
        this.props.list.forEach((song, ind) => {
            if(song.id === track.id) {
                index = ind;
                return;
            }
        });

        if(index !== -1) {
            if(this.state.repeat) {
                if(index+1 >= this.props.list.length) {
                    index = 0;
                } else {
                    index++;
                }
            } else {
                if(index+1 < this.props.list.length) {
                    index++;                    
                }
            }
        }

        setTimeout(() => {
            this.play(this.props.list[index])
        }, 2000)
    }

    getPlayer (player) {
        setInterval(() => {
            player.getCurrentState().then(state => {
                console.log("current state", state);
                if(!state)
                    return;
                
                if(state.position > state.track_window.current_track.duration_ms) {
                    this.playNext(state.track_window.current_track);
                }
            })
        }, 1000)
    }

    getState (state) {
        const track = state.track_window.current_track;
        this.highLightCurrentTrack(track.id);
    }

    highLightCurrentTrack(trackID) {
        document.querySelectorAll('.record').forEach(el => {
            el.className = el.className.replace(' playing', '')
        });
        document.querySelector(`#track_${trackID}`).className += ' playing';
    }

    render () {
        return (
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Song</th>
                            <th>Artists</th>
                            <th>Release Date</th>
                            <th>Likes / Dislikes</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.list.map((song,ind) => {
                            return (
                                <tr className="record" id={`track_${song.id}`} key={song.id}>
                                    <td>{ind+1}</td>
                                    <td>{song.name}</td>
                                    <td>{song.artists.join(' & ')}</td>
                                    <td>{song.release_date}</td>
                                    <td>{song.likes}/{song.dislikes}</td>
                                    <td style={{width:70}}><button className="btn btn-primary" onClick={() => {
                                        this.play(song)
                                    }}>play</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <br/><br/><br/><br/>
                <Player ref="player" uri={this.state.spotify_uri} get_state={this.getState.bind(this)} get_player={this.getPlayer.bind(this)} />
            </div>
        )
    }
}

export default PlayList