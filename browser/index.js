/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2018 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

var backboneEvents;
var sessionInstance = false;
var userName = null;

var jquery = require('jquery');
require('snackbarjs');

var exId = `login-modal-body`;

const urlparser = require('./../../../browser/modules/urlparser');
const urlVars = urlparser.urlVars;

/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */
module.exports = {
    set: function (o) {
        utils = o.utils;
        backboneEvents = o.backboneEvents;
        return this;
    },
    init: function () {
        if (typeof urlVars.session === "string") {
            const MAXAGE = (config.sessionMaxAge || 86400) / 86400; // In days
            // Try to remove existing cookie
            document.cookie = 'connect.gc2=; Max-Age=0; path=/; domain=' + location.host;
            cookie.set("connect.gc2", urlVars.session, {expires: MAXAGE});
        }
        /*quickfix */
        //<span class="badge badge-secondary">Beta</span>
        $('a[data-module-id="stateSnapshots"] span').append('<span class="badge badge-secondary">Beta</span>');
        /*quickfix */

        var parent = this;

        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        $("#session").show();
        // Check if signed in
        //===================
        var dict = {
            "Username" :{
                "da_DK": "Brugernavn",
                "en_US": "Username"
            },
            "Password" :{
                "da_DK": "Adgangskode",
                "en_US": "Password"
            },
            "Type your username and password" :{
                "da_DK": "Indtast din brugernavn og adgangskode",
                "en_US": "Type your username and password"
            },
            "Wrong user name or password": {
                "da_DK": "Forkert brugernavn eller adgangskode",
                "en_US": "Wrong user name or password"
            },
            "Signed in as ": {
                "da_DK": "Logget ind som ",
                "en_US": "Signed in as "
            },
            "Not signed in":{
                "da_DK": "Ikke logget ind",
                "en_US": "Not signed in"
            },
            "Sign in": {
                "da_DK": "Log ind",
                "en_US": "Sign in"
            },
            "Log out":{
                "da_DK": "Log ud",
                "en_US": "Log out"
            }
        }

        $.ajax({
            dataType: 'json',
            url: "/api/session/status",
            type: "GET",
            success: function (data) {
                if (data.status.authenticated) {
                    backboneEvents.get().trigger(`refresh:auth`);
                    backboneEvents.get().trigger(`session:authChange`, true);
                    $(".gc2-session-lock").show();
                    $(".gc2-session-unlock").hide();
                    userName = data.status.screen_name;
                } else {
                    backboneEvents.get().trigger(`session:authChange`, false);
                    $(".gc2-session-lock").hide();
                    $(".gc2-session-unlock").show();
                    userName = null;
                }
            },
            error: function (error) {
                console.error(error.responseJSON);
            }
        });

        class Status extends React.Component {
            render() {
                return <div className={"alert alert-dismissible " + this.props.alertClass} role="alert">
                    {this.props.statusText}
                </div>
            }
        }

        class Session extends React.Component {
            constructor(props) {
                super(props);

                this.state = {
                    sessionScreenName: "",
                    sessionPassword: "",
                    statusText:  utils.__("Type your user name and password", dict),
                    alertClass: "alert-info hidden",
                    btnText: utils.__("Sign in",dict),
                    auth: false
                };

                this.validateForm = this.validateForm.bind(this);
                this.handleChange = this.handleChange.bind(this);
                this.handleSubmit = this.handleSubmit.bind(this);

                this.padding = {
                    padding: "12px"
                };
                this.sessionLoginBtn = {
                    width: "100%"
                };

            }

            validateForm() {
                return this.state.sessionScreenName.length > 0 && this.state.sessionPassword.length > 0 || this.state.auth;
            }

            handleChange(event) {
                this.setState({
                    [event.target.id]: event.target.value
                });
            }

            checkSignin(){
                var timeout;
                var self = this;
                if(this.state.auth){
                    clearTimeout(timeout);
                    //console.log('Signed in!');
                    $("#search-ribbon").show();
                    $("#pane").show();
                    $('#login-modal .close').hide();
                    $('#login-modal .modal-footer button').hide();
                    $('#login-modal').modal("hide");

                    //console.log('CLOSING MODAL!')
                    // setTimeout(this.openDHP(), 1000);
                }else{
                    //console.log('Not signed in!', this.state.auth);
                    $('#login-modal').modal({
                        backdrop:"static",
                        keyboard: false,
                        focus:true,
                        show:true
                    });
                    $("#search-ribbon").hide();
                    $("#pane").hide();
                    $('#login-modal .close').hide();
                    $('#login-modal .modal-footer button').hide();
                    timeout = setTimeout(() => this.checkSignin(), 1000);
                }
            }
            handleDHP(data){
                backboneEvents.get().trigger(`on:`);
                if(data.properties != null && data.properties.dhp){
                    data.properties.dhp = JSON.parse(atob(data.properties.dhp));
                    backboneEvents.get().trigger('session:DHPauth', data)
                }else{
                    backboneEvents.get().trigger('session:DHPauth', false);
                }
            }

            handleSubmit(event) {
                let me = this;
                event.preventDefault();
                if (!me.state.auth) {
                    let dataToAuthorizeWith = dataToAuthorizeWith = {
                        "user":  me.state.sessionScreenName,
                        "password":  me.state.sessionPassword,
                        "schema": "public"
                    };

                    if (vidiConfig.appDatabase) {
                        dataToAuthorizeWith.database = vidiConfig.appDatabase;
                    }

                    $.ajax({
                        dataType: 'json',
                        url: "/api/session/start",
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        scriptCharset: "utf-8",
                        data: JSON.stringify(dataToAuthorizeWith),
                        success: function (data) {
                            backboneEvents.get().trigger(`session:authChange`, true);
                            me.handleDHP(data);

                            me.setState({statusText: `Signed in as ${data.screen_name} (${data.email})`});
                            me.setState({alertClass: "alert-success"});
                            me.setState({btnText: utils.__("Log out", dict)});
                            me.setState({auth: true});
                            $(".gc2-session-lock").show();
                            $(".gc2-session-unlock").hide();
                            userName = data.screen_name;
                            parent.update();
                            parent.addFeedbackModule();
                        },
                        error: function (error) {
                            me.setState({statusText: utils.__("Wrong user name or password", dict)});
                            me.setState({alertClass: "alert-danger"});
                        }
                    });
                } else {
                    $.ajax({
                        dataType: 'json',
                        url: "/api/session/stop",
                        type: "GET",
                        success: function (data) {
                            backboneEvents.get().trigger(`session:authChange`, false);
                            me.setState({statusText: utils.__("Not signed in", dict)});
                            me.setState({alertClass: "alert-info"});
                            me.setState({btnText: utils.__("Sign in", dict)});
                            me.setState({auth: false});
                            $(".gc2-session-lock").hide();
                            $(".gc2-session-unlock").show();
                            parent.update();
                            me.checkSignin();
                        },
                        error: function (error) {
                            console.error(error.responseJSON);
                        }
                    });
                }
            }

            componentDidMount() {
                var me = this;
                this.checkSignin();
                $.ajax({
                    dataType: 'json',
                    url: "/api/session/status",
                    type: "GET",
                    success: function (data) {
                        if (data.status.authenticated) {
                            backboneEvents.get().trigger(`session:authChange`, true);

                            me.setState({sessionScreenName: data.status.screen_name});
                            me.setState({statusText: utils.__("Signed in as ", dict) + data.status.screen_name});
                            me.setState({alertClass: "alert-success"});
                            me.setState({btnText: utils.__("Sign out", dict)});
                            me.setState({auth: true});
                            me.handleDHP(data.status);
                            $(".gc2-session-lock").show();
                            $(".gc2-session-unlock").hide();
                            parent.addFeedbackModule();
                        } else {
                            backboneEvents.get().trigger(`session:authChange`, false);

                            $(".gc2-session-lock").hide();
                            $(".gc2-session-unlock").show();
                            //me.checkSignin();
                        }

                    },
                    error: function (error) {
                        console.error(error.responseJSON);
                    }
                });
            }

            authenticated() {
                parent.addFeedbackModule();
                return this.state.auth;
            }

            handleCloseModal = () =>{
                if(this.state.auth){
                    $('#login-modal').modal("hide");
                }
            }
            openDHP() {
                //console.log('OPENING DHP!')
                if($('#search-ribbon').css("right") == '-660px'){
                    $('#search-border').click();
                }
                $("a[data-module-id='openrouteservice']").click();
            }

            render() {

                return (<div style={this.padding} className="login-form-container">
                    {this.state.auth? <button type="button" className="btn btn-default" id="XLoginModal" onClick={this.handleCloseModal}>X<div className="ripple-container"></div></button>: ''}
                    <div className="login">
                        <img src="/img/Logo_COWI_AB.jpg" alt="" style={{width:"40%", margin: "auto", display: "block"}}/>
                        <h5 className="card-title text-center detail-title" style={{color:"#f04f23", fontSize: "2.5rem", fontWeight:100}}>Detailhandelsportalen</h5>
                        <form onSubmit={this.handleSubmit}>
                            <div style={{display: this.state.auth ? 'none' : 'inline'}}>
                                <div className="form-group">
                                    <label htmlFor="session-email">{utils.__("Username", dict)}</label>
                                    <input
                                        id="sessionScreenName"
                                        className="form-control"
                                        defaultValue={this.state.sessionScreenName}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="session-password"> {utils.__("Password", dict)}</label>
                                    <input
                                        id="sessionPassword"
                                        className="form-control"
                                        defaultValue={this.state.sessionPassword}
                                        onChange={this.handleChange}
                                        type="password"
                                    />
                                </div>
                            </div>
                            <Status statusText={this.state.statusText} alertClass={this.state.alertClass}/>
                            <button
                                type="submit"
                                disabled={!this.validateForm()}
                                className="btn btn-raised"
                                style={this.sessionLoginBtn}
                            >
                                {this.state.btnText}
                            </button>
                            {this.state.auth? <button type="button" className="btn btn-default" id="closeLoginModal" onClick={this.handleCloseModal}>Luk<div className="ripple-container"></div></button>: ''}
                        </form>
                    </div>
                </div>);
            }
        }

        if (document.getElementById(exId)) {
            sessionInstance = ReactDOM.render(<Session/>, document.getElementById(exId));
        } else {
            console.warn(`Unable to find the container for session extension (element id: ${exId})`);
        }
    },

    isAuthenticated() {
        if (sessionInstance) {
            return sessionInstance.authenticated();
        } else {
            return false;
        }
    },

    update: function () {
        backboneEvents.get().trigger("refresh:auth");
        backboneEvents.get().trigger("refresh:meta");
    },

    getUserName: function () {
        return userName;
    },

    addFeedbackModule() {
        if($('.feedback-container').length > 0){
            return;
        }
        /*Feedback component */
        $(document.body).append(`<div class="feedback-container"></div>`);
        try{
            ReactDOM.render(<FeedbackComponent />, document.querySelector('.feedback-container'));
        }catch(err){console.log(err)}
    }
};

