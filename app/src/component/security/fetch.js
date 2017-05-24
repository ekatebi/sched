
import {
  URL_DB as strUrl,
  secDb
} from '../../constant/app';

import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES,
  MENU_ITEM_SEC_PERMS
  } from '../appMenu/constants';


import {
    REQUEST_LIST,
    RECEIVE_LIST,
    RECEIVE_TOKEN
  } from './constants';

function queryString(secType, id) {
	switch (secType) {
		case MENU_ITEM_SEC_USERS:
			return { user: id };
		case MENU_ITEM_SEC_ROLES:
			return { role: id };
		case MENU_ITEM_SEC_PERMS:
			return { perm: id };
		default:
			return {};
	}
}

function restUrl(secType, item) {
  let url = secDb;
  switch (secType) {
    case MENU_ITEM_SEC_USERS:
      url += '/users';
      break;
    case MENU_ITEM_SEC_ROLES:
      url += '/roles';
      break;
    case MENU_ITEM_SEC_PERMS:
      url += '/perms';
      break;
    default:
      url += '/default';    
      break;
   }   

   url += item && item.id ? `/${item.id}` : '';
   url += '.json';

//   console.log('restUrl', url);
   return url;
}

/*
curl -X POST -d '{"user_id" : "jack", "text" : "Ahoy!"}' \
  'https://zv-sec.firebaseio.com/message_list.json'
*/

// jwt
// get array of security objects of users, rolls and permissions
// 	optional id and id's type.
// examples:
// 	?cmd=sec&getList&users[&role=55] all users or the ones for the specified role id
// 	?cmd=sec&roles[&user=23] all roles or the ones for the specified user id
// 	?cmd=sec&perms[&role=55] all perms or the ones for the specified role id
// 	?cmd=sec&perms[&user=23] all perms or the ones for the specified user id
// return { status: success | fail list: [] }
export function fetchSecProd(secType, forSecType, forId) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    method: 'POST'
  };

  const cmd = 'sec';
  const subCmd = 'getList';

  const url = new URL(strUrl);
  const params = { cmd, subCmd, ...queryString(forSecType, forId) };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url, options);
}

export function fetchSecDev(secType, item) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    method: 'GET'
  };

  const url = new URL(restUrl(secType, item));

  return fetch(url, options);
}

export function fetchSec(secType, item) {
  return fetchSecDev(secType, item);
}

// ?cmd=sec&save
// if there is id in item, it's update otherwise create.
// return { status: success | fail id: number }
export function saveSecProd(item) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: 'POST',
    body: JSON.stringify(item)
  };

  const cmd = 'sec';
  const subCmd = 'save';

  const url = new URL(strUrl);
//  const params = { cmd, subCmd };
//  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url, options);
}

function removeExtraProps(item) {
  const item2 = { ...item };
  delete item2.secType;
  delete item2.id;
  delete item2.index;  
  return item2; 
}

export function saveSecDev(secType, item) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: item.id ? 'PUT' : 'POST',
    body: JSON.stringify(removeExtraProps(item))
  };

  const url = new URL(restUrl(secType, item));

  return fetch(url, options);
}

export function saveSec(secType, item) {
  return saveSecDev(secType, item);
}

// ?cmd=sec&delete&user | role | perm =55
// return { status: success | fail }
export function deleteSecProd(secType, id) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: 'POST'
  };

  const cmd = 'sec';
  const subCmd = 'delete';

  const url = new URL(strUrl);
  const params = { cmd, subCmd, ...queryString(secType, id) };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url, options);
}

export function deleteSecDev(secType, item) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: 'DELETE'
  };

  const url = new URL(restUrl(secType, item));

  return fetch(url, options);
}

export function deleteSec(secType, item) {
  return deleteSecDev(secType, item);
}

// ?cmd=sec&add&user | role | perm = 55
// return { status: success | fail id: number }
export function addSecChildren(children) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: 'POST',
    body: JSON.stringify(children) // { type: user | role | perm, list: [] }
  };

  const cmd = 'sec';
  const subCmd = 'add';

  const url = new URL(strUrl);
  const params = { cmd, subCmd };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url, options);
}

// ?cmd=sec&remove&user | role | perm = 55
// return { status: success | fail }
export function removeSecChildren(children) {

  const options = {
    headers: new Headers({
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.8',
      'Content-Type': 'application/json'
    }),
    method: 'POST',
    body: JSON.stringify(children) // { type: user | role | perm, list: [] }
  };

  const cmd = 'sec';
  const subCmd = 'remove';

  const url = new URL(strUrl);
  const params = { cmd, subCmd };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return fetch(url, options);
}
