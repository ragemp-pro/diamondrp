import React, { Component } from 'react';
import { API, CEF } from 'api';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Auth from './Auth';
import Reg from './Reg';
import Newpass from './Newpass';

interface LoginProps {
  login: {
    name: string;
    password: string;
    email: string;
  };
  gui: {
    open: string;
  };
}

class Login extends Component<LoginProps, any> {
  render() {
    return (
      <div className="auth">
        {this.props.gui.open == 'login' ? <Auth /> : false}
        {this.props.gui.open == 'reg' ? <Reg /> : false}
        {this.props.gui.open == 'newpass' ? <Newpass /> : false}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    login: state.login,
    gui: state.gui,
  };
};

export default connect(
  mapStateToProps,
  null
)(Login);
