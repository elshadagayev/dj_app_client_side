import React from 'react'
import './css/playlist.css'

class PlayList extends React.Component {
    constructor () {
        super()
    }

    componentDidUpdate () {
        const playBtn = this.refs.playbtn
        //playBtn.postMessage('play', 'https://open.spotify.com/embed/track/7iNIg7XDEaYECfWD5dJ9Va');
    }

    render () {
        return (
            <div className="playlist">
                <iframe src={"https://open.spotify.com/embed?uri=" + this.props.uri} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            </div>
        )
    }
}

export default PlayList