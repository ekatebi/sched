import { signInTokenKey, serverHost } from '../../constant/app';
import authOptions from '../../service/auth';
import { SIGNIN, REQUEST_TOKEN, RECEIVE_TOKEN, NOOP,
 RECEIVE_ERROR, SIGNOUT, HIDE_MODAL, LOGIN, ADD_ROLES_TO_TOKEN } from './constants';
import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES
  } from '../appMenu/constants';
import * as secActions from '../security/actions';
import { getAdminRole, getPermsObject } from '../security/constants';

function makeToken(user, pw) {
  if (user === 'admin' && pw === 'admin') {
    return Math.random().toString(36).substring(7);
  }
  return undefined;
}

function makeTokenEx(userId, pw, users) {

  if (userId.toLowerCase() === 'admin' && pw.toLowerCase() === 'admin') {
//    return Math.random().toString(36).substring(7);
//    console.log('getAdminRole', getAdminRole());
    return { name: 'admin', userId, role: getAdminRole() };
  }

  if (window.sec) {
    const user = users.find((u) => {
      return u.userId === userId;
    });

    if (user) {
      if (secActions.decrypt(user.pw) === pw) {
        return { ...user };
      }

      if (window.diag) {
        console.log(secActions.decrypt(user.pw));
      }
    } else if (window.diag) {
      console.log(`user not found, ${user}, (${users.length})`);
    }
  }

  return undefined;
}

export function login(token) {
  return {
    type: LOGIN,
    token
  };
}

function noop() {
  return {
    type: NOOP,
  };
}

function requestToken() {
  return {
    type: REQUEST_TOKEN,
  };
}

export function receiveError(error) {
  return {
    type: RECEIVE_ERROR,
    error,
  };
}

function receiveToken() {
  return {
    type: RECEIVE_TOKEN,
  };
}

export function onChangeToken(token) {
  return (dispatch) => {
    dispatch(login({ ...token }));
  };
}

export function onSelectRole(index) {
  return (dispatch, getState) => {
    const { token } = getState().auth;

    const role = { ...token.roles[index] };
    const perms = [...role.perms];
    role.perms = getPermsObject(perms);
    delete token.roles;

    dispatch(login({ ...token, role }));
  };
}

export function onLogin(user, pw) {
  return (dispatch, getState) => {    

    const { [MENU_ITEM_SEC_USERS]: usersState } = getState().sec;

    const users = usersState.list;

    const token = makeTokenEx(user, pw, users);

    if (token) {
      dispatch(login({ ...token }));
    } else {
      dispatch(receiveError('Incorrect user id or password'));
    }
    
  };
}

export function onSignOut() {
  return {
    type: SIGNOUT,
  };
}

export function onGetUserRoles() {
  return (dispatch, getState) => {

    const { token } = getState().auth;

    if (token) {
      const { [MENU_ITEM_SEC_ROLES]: rolesState } = getState().sec;
      const rolesList = rolesState.list || [];
      const userRoles = [];

      rolesList.forEach((role) => {

        let index = -1;

        if (role.userIds) {
          index = role.userIds.findIndex((id) => {
            return id === token.id;
          });
        }

        if (index > -1) {
          userRoles.push(role);
        }

      });

      if (userRoles.length === 0) {
        dispatch(receiveError(`User, ${token.name}, is not a member of any role.`));
      } else if (userRoles.length === 1) {
        const role = { ...userRoles[0] };
        const perms = [...role.perms];
        role.perms = getPermsObject(perms);
        dispatch(login({ ...token, role }));
      } else {
        dispatch(login({ ...token, roles: [...userRoles] }));
      }

    }
  };
}
