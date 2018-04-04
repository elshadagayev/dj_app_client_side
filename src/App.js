import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { HomePage, LoginPage, RoomsPage, UsersPage } from './components/pages'
import Navbar from './components/Navbar';
import './App.css';

class App extends Component {
  render() {
    this.checkSession()
    return (
      <Router>
        <div>
          <Navbar />
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/rooms" component={RoomsPage} />
          <Route exact path="/users"component={UsersPage} />
        </div>
      </Router>
    );
  }

  checkSession () {
    const pathname = window.location.pathname;

    switch(pathname) {
      case "/login":
        return;
      default:
        if(!checkUser())
          return window.location.href = '/login'
    }

    function checkUser () {
      const user = JSON.parse(window.localStorage.getItem("user"));

      if(!user)
        return false;

      return user.isLoggedIn;
    }
  }
}

export default App;
