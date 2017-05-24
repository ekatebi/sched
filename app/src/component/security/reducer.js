import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES,
  MENU_ITEM_SEC_PERMS
  } from '../appMenu/constants';

import {
  defaultUser,
  defaultRole,
  defaultPerm,
  SEC_TYPE_NAMES,
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
  SHOW_EDITOR
  } from './constants';

// sec state
const initState = {
  token: {
    user: { userId: 'admin', name: 'administrator', pw: '' },
    roles: [], // [0] is the role jwt was created for
    fetching: false,
    jwt: undefined
  },
  [MENU_ITEM_SEC_USERS]: {
      name: SEC_TYPE_NAMES.user,
      fetching: false,
      list: [],
      item: {
        show: false,
        dirty: false,
        data: { ...defaultUser }
      }
    },
  [MENU_ITEM_SEC_ROLES]: {
      name: SEC_TYPE_NAMES.role,
      fetching: false,
      list: [],
      item: {
        show: false,
        dirty: false,
        data: { ...defaultRole }
      }
    },
  [MENU_ITEM_SEC_PERMS]: {
      name: SEC_TYPE_NAMES.perm,
      fetching: false,
      list: [],
      item: {
        show: false,
        dirty: false,
        data: { ...defaultPerm }
      }
    }
};

export default (state = initState, action) => {

  switch (action.type) {
    case REQUEST_TOKEN:
      return { ...state, token: { ...state.token, fetching: true, jwt: undefined, roles: [] } };
    case RECEIVE_TOKEN:
      return { ...state, token: { ...state.token, fetching: false, jwt: action.jwt, roles: action.roles } };
    case REQUEST_LIST:
      return { ...state, [action.secType]: { ...state[action.secType], fetching: true, list: [] } };
    case RECEIVE_LIST:
      return { ...state, [action.secType]: { ...state[action.secType], fetching: false, list: action.list || [] } };
    case RECEIVE_ITEM:
      return { ...state, [action.secType]: { ...state[action.secType], fetching: false, 
        item: { data: action.data } } };
    case RECEIVE_ERROR:
      return { ...state, [action.secType]: { ...state[action.secType], fetching: false, list: [] } };
    case ITEM_CHANGED:
      return { ...state, [action.secType]: { ...state[action.secType],
        item: { data: action.data, dirty: true, show: action.show } } };
    case PW_CHANGED:
      return { ...state, [action.secType]: { ...state[action.secType],
        pw: action.pw } };
    case PWV_CHANGED:
      return { ...state, [action.secType]: { ...state[action.secType],
        pwv: action.pwv } };
    case SHOW_EDITOR:
      {
        let newState;

        if (action.secType === MENU_ITEM_SEC_USERS) {
          const data = { ...action.data, pwv: action.data.pw }; 
          newState = { ...state, [action.secType]: { ...state[action.secType],
            item: { data, show: action.show, dirty: false } } };
        } else if (action.secType === MENU_ITEM_SEC_ROLES) {
          newState = { ...state, [action.secType]: { ...state[action.secType],
          item: { data: action.data, show: action.show, dirty: false } } };
        }
        return newState;
      }
    default:
      return state;
  }

};
