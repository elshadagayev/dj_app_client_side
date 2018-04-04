import React from 'react'
import { Link } from 'react-router-dom'

class Header extends React.Component {
    render () {
        return (
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/rooms">My Rooms</Link></li>
                <li><a href="" onClick={(e) => {
                    e.preventDefault();

                    window.localStorage.setItem('user', null);
                    window.location.reload();
                }}>Log out</a></li>
            </ul>
        )
    }
}

export default Header;