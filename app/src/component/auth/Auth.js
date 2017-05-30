/* eslint react/prop-types: 0 no-console: 0 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _flow from 'lodash/flow';
import { Button, FormGroup, FormControl, ControlLabel, Modal, Checkbox }
  from 'react-bootstrap';
import Loader from 'react-loader';
import { browserHistory, Router, Route, Link, withRouter } from 'react-router';
import classNames from 'classnames';
import { appName } from '../../constant/app';
import * as authActions from './actions';
import * as secActions from '../security/actions';
import { getPermsObject, strongRegex, mediumRegex } from '../security/constants';

import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES
  } from '../appMenu/constants';

class Auth extends Component {

  constructor(props) {
    super(props);
    this.onRequestToken = this.onRequestToken.bind(this);
    this.state = { selectedRoleIndex: -1, userPwChange: false,
      username: undefined, password: undefined };
  }

  componentWillMount() {    
    const { secActions, token, secType } = this.props;
    const { itemChanged, onRequestList } = secActions;
    
    if (window.sec) {
      onRequestList(secType);
      onRequestList(MENU_ITEM_SEC_ROLES);
      itemChanged(secType);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { secActions, authActions, token: curToken, item: curItem, secType } = this.props;
    const { token: nextToken, item: nextItem } = nextProps;
    const { itemChanged, onRequestList } = secActions;
    const { onGetUserRoles } = authActions;
    const { userPwChange } = this.state;

    if (!curToken && nextToken && (nextToken.forcePwChange || userPwChange)) {
        onRequestList(MENU_ITEM_SEC_USERS, nextToken);
    } else if (!curItem && nextItem) {
        itemChanged(secType, { ...nextItem, pw: '', pwv: '' });
    } else if (nextToken && !nextToken.forcePwChange && !nextToken.roles) {
        onGetUserRoles();
    }
  }

  onRequestToken(type, evt) {
    const { secType, authActions, secActions, users, token, error, item } = this.props;
    const { onLogin, onChangeToken, receiveError, onSignOut, onSelectRole } = authActions;
    const { onSave, onRequestList } = secActions;
    const { username, password, selectedRoleIndex, userPwChange } = this.state;

    switch (type) {
      case 'username':
        this.setState({ username: evt.target.value });
        break;
      case 'password':
        this.setState({ password: evt.target.value });
        break;
      case 'submit':

        if (error) {
          this.setState({ username: undefined, password: undefined });
          onSignOut();
        } else if (token && token.id && item && (item.forcePwChange || userPwChange)) {
          this.setState({ username: undefined, password: undefined, userPwChange: false });
          onSave(secType, { ...item, forcePwChange: false, id: token.id, pwv: undefined });
          onSignOut();
          onRequestList(secType);
        } else if (token) {          
//          console.log('submit token', token);
          if (token.roles) {

            const role = { ...token.roles[selectedRoleIndex] };
            delete token.roles;

            if (role.perms) {

              const perms = [...role.perms];

              role.perms = getPermsObject(perms);
            
              onChangeToken({ ...token, role });
            } else {

              dispatch(receiveError('no perms in role'));

            }
          }
        } else {
          onLogin(username, password);
          this.setState({ username: undefined, password: undefined });
        }

        break;
      default:
        break;
    }

    evt.preventDefault();

  }

  render() {
  
    const { token, error, authActions, secActions, showModal, fetching, 
      item, secType, pw, pwv } = this.props;
    const { onSignOut } = authActions;
    const { itemChanged, onPwChanged, onPwvChanged } = secActions;
    const { selectedRoleIndex, username, password, userPwChange } = this.state;

//    console.log('auth', token, item);

    const titleClass = classNames({ 'text-danger': '' }, 'text-center');
    const errClass = classNames({ 'text-danger': error }, 'text-center');

    const btnsStyle = {
      display: 'flex',
      flex: '0 0 auto',
      flexFlow: 'row nowrap',
      alignSelf: 'flex-end',
      justifyContent: 'space-between',
//      marginRight: 15,
    };

    let content = (<div />);

    if (error) {
      content = (<div className={errClass}>{error}</div>);
    } else if (item && (item.forcePwChange || userPwChange)) {
//      console.log('item', item);

      const pwStyle = { 
        width: '100%', 
        backgroundColor: pw && strongRegex.test(pw) ? 'lightgreen' : 'pink'
      };

      const pwvStyle = { 
        width: '100%',
        backgroundColor: pw === pwv && strongRegex.test(pwv) ? 'lightgreen' : 'pink'
      };

      content = (<div>
        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl 
            style={pwStyle}         
            className="input-sm"
            autoFocus={item.forcePwChange}
            type="password"
            value={pw || ''}
            placeholder="Enter new password" 
            required
            onChange={(e) => {
              onPwChanged(secType, item, e.target.value, false);
              e.preventDefault();
            }} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Password Verification</ControlLabel>
          <FormControl
            style={pwvStyle}
            className="input-sm"
            type="password"
            value={pwv || ''}
            placeholder="Enter password verification" 
            required
            onChange={(e) => {
              onPwvChanged(secType, item, e.target.value, false);
              e.preventDefault();
            }} />

            <br />
            <span style={{ fontSize: 10, fontStyle: 'italic' }}>
              Password rules: at least 8 charactors, one lower, upper, number and special charactor.
            </span>

        </FormGroup>
      </div>);            
    } else if (token && token.roles) {
        
        const options = token.roles.map((role, index) => {
          return (<option key={index} value={index}>{role.name}</option>);
        });

        content = (<div>
          <FormGroup>
            <select className="form-control input-sm" 
              value={selectedRoleIndex} 
              autoFocus={!error && token && token.roles}
              onChange={(e) => {
                this.setState({ selectedRoleIndex: e.target.value });
              }}>
              <option value={-1} disabled>Select role</option>         
              {options}
            </select>            
          </FormGroup>
        </div>);

    } else {
      content = (<div>
        <FormGroup>
          <ControlLabel>User ID</ControlLabel>
          <FormControl 
            className="input-sm"
            type="text"
            autoCapitalize="none"
            autoCorrect="none"
            autoFocus={!error && !token}
            value={username || ''}
            onChange={(e) => {
              this.onRequestToken('username', e);
              e.preventDefault();
            }}
            placeholder="Enter user ID" required />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            className="input-sm"
            type="password"
            value={password || ''}
            onChange={(e) => {
              this.onRequestToken('password', e);
              e.preventDefault();
            }}
            placeholder="Enter password" required />
        </FormGroup>
        {username && username !== 'admin' && password ?
          (<Checkbox className="input-sm" 
            checked={userPwChange}
            onChange={(e) => {
              this.setState({ userPwChange: e.target.checked });
            }}>
            Password change following sign in
          </Checkbox>) : (<div />)
        }
      </div>);
    }

    let cancelBtn = (<div />);

    if (!error && ((item && item.forcePwChange) || (token && token.roles))) {
      cancelBtn = (<Button bsSize="small" bsStyle="primary" onClick={(e) => {
        this.setState({ username: undefined, password: undefined, userPwChange: false });
        onSignOut();
        itemChanged(secType);
        e.preventDefault();
      }}>Cancel</Button>);
    }

    const okBtnFocus = false; // (error && !token) || (token && token.roles && selectedRoleIndex > -1);

    return (
      <div className="loginButton">
        {showModal &&
          <Modal bsSize="small" show={showModal} onHide={this.props.onHideModal}>
            <Loader color="grey" loaded={!fetching} />
            <Modal.Header closeButton={false}>
              <Modal.Title className={titleClass}>
                  {appName || '\xa0'}
              </Modal.Title>
            </Modal.Header>
            <form onSubmit={(e) => {
              this.onRequestToken('submit', e);
            }}>
              <Modal.Body>
                {content}
              </Modal.Body>
              <Modal.Footer>
                <div style={btnsStyle}>
                  {cancelBtn}
                  <Button type="submit" bsSize="small" bsStyle="primary"
                    autoFocus={okBtnFocus}
                    disabled={!(error || selectedRoleIndex > -1 || 
                      (pw && pwv) || 
                      (username && password))}>
                      {error || token ? 'OK' : 'Sign In'}
                  </Button>
                </div>
              </Modal.Footer>
            </form>
          </Modal>
        }
      </div>
      );
  }
}

function mapStateToProps(state) {
  const secType = MENU_ITEM_SEC_USERS;
  const { error, token } = state.auth;
  const { [secType]: subState } = state.sec;

  const showModal = !token || !token.role || error !== undefined;

  return {
    secType,
    token,
    error,
    showModal,
    fetching: false,
    item: subState.item.data,
    pw: subState.pw,
    pwv: subState.pwv
  };
}

function mapDispatchToProps(dispatch) {
 return {
      authActions: bindActionCreators(authActions, dispatch),
      secActions: bindActionCreators(secActions, dispatch)
    };
}

module.exports = _flow(
  connect(mapStateToProps, mapDispatchToProps)
)(Auth);
