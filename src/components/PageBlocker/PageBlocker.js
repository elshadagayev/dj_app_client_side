import React from 'react'
import './css/style.css'

class PageBlocker extends React.Component {
    render () {
        if(this.props.block)
            return this.blockPage();
        return this.props.children
    }

    blockPage () {
        return (
            <div>
                <div className="page-blocker">
                    <div className="page-blocker-text">{this.props.messages}</div>
                </div>
                {this.props.children}
            </div>
        )
    }
}

export default PageBlocker