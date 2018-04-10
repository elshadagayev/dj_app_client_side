import React from 'react'
import axios from 'axios'
import config from '../../../config.json'
import './css/login.css'

export const USER_TYPE_DJ = "DJ"
export const USER_TYPE_CLIENT = "client"

class LoginPage extends React.Component {
    constructor () {
        super()
        this.state = {
            form: 'login',
            userType: USER_TYPE_DJ,
            errorMessage: "",
            successMessage: ""
        }
    }
    render () {
        return (
            <div className="col-lg-12">
                {this.state.errorMessage ? (<div className="alert alert-danger">{this.state.errorMessage.toString()}</div>) : ""}
                {this.state.successMessage ? (<div className="alert alert-success">{this.state.successMessage}</div>) : ""}
                {this.state.form === 'login' ? this.loginPage() : this.registerPage()}
            </div>
        )
    }

    registerPage () {
        return <div className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input key="email" ref="email" id="email" className="form-control" type="email" placeholder="E-mail..." />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input key="password" ref="password" id="password" className="form-control" type="password" placeholder="Type room password..." />
            </div>
            <div className="form-group">
              <label htmlFor="password">Retype Password</label>
              <input key="retype_password" ref="retype_password" id="retype_password" className="form-control" type="password" placeholder="Type room password..." />
            </div>
            <div className="form-group">
              <button className="form-control btn btn-primary" onClick={this.signUp.bind(this)}>
                Sign Up
              </button>
            </div>
            <div className="form-group">
              <a href="" onClick={e => {
                  e.preventDefault();

                  this.setState({ ...this.state, form: "login" });
                }}>
                Log In
              </a>
            </div>
          
          </div>;
    }

    loginPage () {
        return (
            <div className="login-form">
                {this.state.userType === USER_TYPE_DJ ? this.djLoginPage() : this.clientLoginPage()}
                <div className="form-group">
                    <label>I'm:&nbsp;&nbsp;&nbsp;</label>
                    <input type="radio" ref="user_type" checked={this.state.userType === USER_TYPE_DJ} id="user_type_dj" name="user_type" onChange={() => {
                        this.setState({
                            ...this.state,
                            userType: USER_TYPE_DJ
                        })
                    }} />
                    <label htmlFor="user_type_dj">&nbsp;DJ</label>
                    &nbsp;&nbsp;&nbsp;
                    <input type="radio" ref="user_type" checked={this.state.userType === 'client'} id="user_type_client" name="user_type" onChange={() => {
                        this.setState({
                            ...this.state,
                            userType: 'client'
                        })
                    }} />
                    <label htmlFor="user_type_client">&nbsp;Client</label>
                </div>
                <div className="form-group">
                    <button className="form-control btn btn-primary" onClick={this.login.bind(this)}>Log In</button>
                </div>
                <div className="form-group">
                    <a href="" onClick={(e) => {
                        e.preventDefault();

                        this.setState({
                            ...this.state,
                            form: 'register'
                        })
                    }}>Sign up as DJ</a>
                </div>
            </div>
        )
    }

    djLoginPage () {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input key="email" ref="email" id="email" className="form-control" type="email" placeholder="E-mail..." />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input key="password" ref="password" id="password" className="form-control" type="password" placeholder="password..." />
                </div>
            </div>
        )
    }

    clientLoginPage () {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="full_name">Full Name</label>
                    <input key="full_name" ref='full_name' id="full_name" className="form-control" type="text" placeholder="Type your full name" />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Room Password</label>
                    <input key="password" ref="password" id="password" className="form-control" type="text" placeholder="Type room password" />
                </div>
            </div>
        )
    }

    login () {
        switch(this.state.userType) {
            case USER_TYPE_DJ:
                axios.post(config.api_server + '/api/dj/auth',
                {
                    email: this.refs.email.value,
                    password: this.refs.password.value
                }).then((res) => {
                    let data = res.data;
                    if(data.statusCode !== 200)
                        return this.setState({
                            ...this.state,
                            successMessage: "",
                            errorMessage: data.errorMessage
                        })
                    
                    data = data.data;
                    
                    window.localStorage.setItem('user', JSON.stringify({
                        token: data.token,
                        email: data.email,  
                        isLoggedIn: true,
                        type: USER_TYPE_DJ
                    }))

                    window.location.href = '/'
                }).catch((err) => {
                    console.log("dj auth error:", err)
                })
                break;
            case USER_TYPE_CLIENT:
                axios.post(config.api_server + '/api/client/auth',
                {
                    full_name: this.refs.full_name.value,
                    password: this.refs.password.value
                }).then((res) => {
                    let data = res.data;
                    if(data.statusCode !== 200)
                        return this.setState({
                            ...this.state,
                            successMessage: "",
                            errorMessage: data.errorMessage
                        })
                    
                    data = data.data;

                    window.localStorage.setItem('user', JSON.stringify({
                        token: data.token,
                        id: data.clientID,  
                        isLoggedIn: true,
                        type: USER_TYPE_CLIENT
                    }))

                    window.location.href = '/'
                }).catch((err) => {
                    console.log("dj auth error:", err)
                })
                break;
            default:
                return false;
        }
    }

    signUp () {
        axios.post(config.api_server + '/api/dj/register', {
            email: this.refs.email.value,
            password: this.refs.password.value,
            retypePassword: this.refs.retype_password.value
        }).then(res => {
            const data = res.data;
            if(data.statusCode !== 200)
                return this.setState({
                    ...this.state,
                    successMessage: "",
                    errorMessage: data.errorMessage
                })
            
            this.setState({
                ...this.state,
                errorMessage: "",
                successMessage: "You've registered successfully. Go to the login page and sign in"
            })
        }).catch(errorMessage => {
            this.setState({
                ...this.state,
                errorMessage
            })
        })
    }
}

export default LoginPage