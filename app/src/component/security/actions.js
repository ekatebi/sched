import CryptoJS from 'crypto-js';
import { fetchSec, saveSec, deleteSec } from './fetch';

import {
    defaultUser,
    defaultRole,
    defaultPerm,
    SEC,
    REQUEST_LIST,
    RECEIVE_LIST,
    RECEIVE_ITEM,
    REQUEST_TOKEN,
    RECEIVE_TOKEN,
    RECEIVE_ERROR,
    ITEM_CHANGED,
    PW_CHANGED,
    PWV_CHANGED,
    SHOW_EDITOR,
    GUID,
  } from './constants';

import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES,
  MENU_ITEM_SEC_PERMS
  } from '../appMenu/constants';

export const encrypt = (param) => {
  return CryptoJS.AES.encrypt(param, GUID).toString();
};

export const decrypt = (param) => {
  return CryptoJS.AES.decrypt(param, GUID).toString(CryptoJS.enc.Utf8);
};

// authentication
function requestToken() {
  return {
    type: REQUEST_TOKEN
  };
}

function receiveToken(jwt, roles) {
  return {
    type: RECEIVE_TOKEN,
    jwt,
    roles
  };
}
// authentication end

function requestList(secType) {
  return {
    type: REQUEST_LIST,
    secType
  };
}

function receiveList(secType, list) {
  return {
    type: RECEIVE_LIST,
    secType,
    list
  };
}

function receiveItem(secType, data) {
  return {
    type: RECEIVE_ITEM,
    secType,
    data
  };
}

function receiveError(secType, error) {
  return {
    type: RECEIVE_ERROR,
    secType,
    error
  };
}

export function itemChanged(secType, data, show = true) {
  return {
    type: ITEM_CHANGED,
    secType,
    data,
    show
  };
}

export function pwChanged(secType, pw) {
  return {
    type: PW_CHANGED,
    secType,
    pw
  };
}

export function pwvChanged(secType, pwv) {
  return {
    type: PWV_CHANGED,
    secType,
    pwv
  };
}

export function onPwChanged(secType, data, pw, show = true) {
  return (dispatch, getState) => {
      dispatch(pwChanged(secType, pw));
      dispatch(itemChanged(secType, { ...data, pw: encrypt(pw) }, show));      
  };
}

export function onPwvChanged(secType, data, pwv, show = true) {
  return (dispatch, getState) => {
      dispatch(pwvChanged(secType, pwv));
      dispatch(itemChanged(secType, { ...data, pwv: encrypt(pwv) }, show));
  };
}

function defaultSec(secType) {
  switch (secType) {
    case MENU_ITEM_SEC_USERS:
      return defaultUser();
    case MENU_ITEM_SEC_ROLES:
      return defaultRole();
    default:
      return undefined;
  }  
}

export function showEditor(secType, show, data) {
  return {
    type: SHOW_EDITOR,
    secType,
    show,
    data: data || defaultSec(secType)
  };
}

export function onShowEditor(secType, show, data) {
  return (dispatch, getState) => {
    if (secType === MENU_ITEM_SEC_USERS) {
      dispatch(showEditor(secType, show, data));
      dispatch(pwChanged(secType, data && data.pw ? decrypt(data.pw) : undefined));
      dispatch(pwvChanged(secType, data && data.pw ? decrypt(data.pw) : undefined));
    } else if (secType === MENU_ITEM_SEC_ROLES) {
      dispatch(showEditor(secType, show, data));
    }
  };
}

function object2Array(obj) {
  if (obj) {

    const arr = Object.keys(obj).map((key) => {
      return { ...obj[key], id: key };
    });

    return arr;
  }
  
  return [];  
}

// get list
export function onRequestList(secType, item) {
  return (dispatch, getState) => {
    dispatch(requestList(secType));
    fetchSec(secType, item)
      .then(resp => resp.json())
      .catch((err) => {
        appAlert.error(err);    
      })
      .then(json => {
        
//        console.log('fetchSec', secType, item, json);

        if (item) {
          dispatch(receiveItem(secType, json));
        } else {
          dispatch(receiveList(secType, object2Array(json)));
        }
      })
      .catch(error => {
        console.error('fetchSec error', error);
        dispatch(receiveError(secType, error));
      })
      .then(() => {
//        dispatch(showSpinner(false));
      });
  };
}

// create, update
export function onSave(secType, item) {
  return (dispatch, getState) => {

    saveSec(secType, item)
      .then(resp => resp.json())
      .catch((err) => {
        appAlert.error(err);    
      })
      .then(json => {
//        console.log('saveSec', json);
        dispatch(showEditor(secType, false));
        dispatch(onRequestList(secType));
      })
      .catch(error => {
        console.error('saveSec error', error);
        dispatch(receiveError(secType, error));
      })
      .then(() => {
//        dispatch(showSpinner(false));
      });      
  };
}

// delete
export function onDelete(secType, item) {
  return (dispatch, getState) => {
    deleteSec(secType, item)
      .then(resp => resp.json())
      .catch((err) => {
        appAlert.error(err);    
      })
      .then(json => {
//        console.log('deleteSec', json);
        dispatch(onRequestList(secType));
      })
      .catch(error => {
        console.error('deleteSec error', error);
        dispatch(receiveError(secType, error));
      })
      .then(() => {
//        dispatch(showSpinner(false));
      });      
  };
}

export function onAddChildren(parent, children) {
  return (dispatch, getState) => {

  };
}

export function onRemoveChildren(parent, children) {
  return (dispatch, getState) => {

  };
}

// return { jwt, roles: [ { name, id }, { name, id } ] }
// role[0] corresponds to jwt
export function onAuth(userId, pw) {
  return (dispatch, getState) => {
    console.log('onAuth', userId, pw);
    // 1) look up user from users db
    // 2) validate user pw
    dispatch(onRequestList(MENU_ITEM_SEC_USERS));
    const { [MENU_ITEM_SEC_USERS]: users } = getState().sec;
    console.log('users', users);

  };
}

// return { jwt, roles: [ { name, id }, { name, id } ] }
// role[0] corresponds to jwt
export function onSetRole(roleId) {
  return (dispatch, getState) => {

  };
}


