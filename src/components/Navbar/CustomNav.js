import React, { Component } from "react";
import { Navbar, MenuItem, Nav, NavDropdown, NavItem } from "react-bootstrap";
import { Link } from "react-router-dom";
import { USER_TYPE_DJ, USER_TYPE_CLIENT } from '../pages/LoginPage/LoginPage'
import './CustomNav.css'

class CustomNavbar extends Component {

  constructor () {
    super();
    this.user = JSON.parse(window.localStorage.getItem("user"));
  }
  
  render() {
    return <Navbar className="Nav" inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Q U E U E</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {this.user ? (
              <NavItem eventKey={1}>
                <Link to="/">Home</Link>
              </NavItem>
            ) : ""}          
            {this.user && this.user.type === USER_TYPE_DJ ? (
              <NavItem eventKey={2}>
              <Link to="/rooms">My Rooms</Link>
            </NavItem>
            ) : ""}
          </Nav>
          <Nav pullRight>
            <NavItem onClick={e => {
                e.preventDefault();

                window.localStorage.setItem("user", null);
                window.location.reload();
              }} href="#">
              Log Out
            </NavItem>
            <Navbar.Brand>
              <a href="#">
                <img src={"https://instagram-brand.com/wp-content/uploads/2016/11/app-icon2.png"} style={{ width: 32, height: 32, marginTop: -7 }} />
              </a>
            </Navbar.Brand>
            <Navbar.Brand>
              <a href="#">
                <img src={"https://www.vectorlogo.zone/logos/facebook/facebook-tile.svg"} style={{ width: 32, height: 32, marginTop: -7 }} />
              </a>
            </Navbar.Brand>
            <Navbar.Brand>
              <a href="#">
                <img src={"https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/youtube_v2-512.png"} style={{ width: 32, height: 32, marginTop: -7 }} />
              </a>
            </Navbar.Brand>
            <Navbar.Brand>
              <a href="#">
                <img src={"http://www.stickpng.com/assets/images/580b57fcd9996e24bc43c536.png"} style={{ width: 32, height: 32, marginTop: -7 }} />
              </a>
            </Navbar.Brand>
          </Nav>
        </Navbar.Collapse>
      </Navbar>;
  }
}

export default CustomNavbar;
