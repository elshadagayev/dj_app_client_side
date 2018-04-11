import React from 'react'
import SpotifyPlayBack from './SpotifyPlayBack'

class Player extends React.Component {

    constructor () {
        super()

        this.style = {
            width: '100%',
            height: 80,
            left: 0,
            bottom: 0,
            position: 'fixed'
        }
    }

    componentDidMount () {
        this.playback = new SpotifyPlayBack();
        this.playback.get_state = this.props.get_state;
        this.playback.getPlayer = this.props.get_player;
        this.playback.init();
    }
    
    componentDidUpdate () {
        this.playback.playSong(this.props.uri)
    }

    render () {
        if(!this.props.uri)
            return (<div></div>)
        return (<iframe src={"https://open.spotify.com/embed?uri=" + this.props.uri} style={this.style} frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>)
    }
}

export default Player