import React from 'react'

class SearchSpotifySong extends React.Component {
    render () {
        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="form-group">
                        <br />
                        <input className="form-control" type="search" ref="search_song" placeholder="Search for song" />
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchSpotifySong