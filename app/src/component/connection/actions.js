/* eslint no-use-before-define: [1, 'nofunc'] */

import { Zyper4K, ZyperHD } from './connectionDefaults';
import { fetchConn, saveConn, removeConn } from './fetch';
import {
  DEFAULT_CONNECTION_CHANGED,
  CONNECTION_FORM_CHANGED,
  CONNECTION_LIST_INIT,
  CONNECTION_LIST_CHANGED,
} from './constants';

import { StorageTypes } from '../../constant/storageTypes';
import { ObjectStorage } from '../../service/storage';

const initState = {
  Zyper4K: { ...Zyper4K },
  ZyperHD: { ...ZyperHD }
};

const storage = new ObjectStorage(localStorage, StorageTypes.Connection);

export function defaultConnectionChanged(model, index) {
  return {
    type: DEFAULT_CONNECTION_CHANGED,
    model,
    index
  };
}

export function connectionFormDataChanged(model, formData) {
  return {
    type: CONNECTION_FORM_CHANGED,
    model,
    formData
  };
}

export function connectionListChanged(model, list) {
  return {
    type: CONNECTION_LIST_CHANGED,
    model,
    list
  };
}

export function connectionListInit(storedState) {
//  console.log('connectionListInit', storedState);
  return {
    type: CONNECTION_LIST_INIT,
    storedState
  };
}

export function onLoad() {
  return (dispatch, getState) => {
    // Get join configurations from storage file.
    fetchConn()
      .then(resp => resp.json())
      .catch((error) => {
        appAlert.error(`Connection settings, ${error}`);
      })
      .then(json => {
        if (json.error && json.error === 'store not found') {
          // If there are no join configurations from the storage file,
          // get join configurations from the browser's local storage.
          let localStorageConn = storage.get();
          if (localStorageConn) {
            // If the stored configuration is from an early release, 1.2,
            // it has a list of Zyper4K join configurations
            // so it will not have model Zyper4K on the top level.
            if (!localStorageConn.Zyper4K) {
              // Move the existing list to model Zyper4K list,
              // and add all the initial join configurations.
              localStorageConn = {
                Zyper4K: {
                  defaultIndex: 0,
                  list: initState.Zyper4K.list.concat(localStorageConn.list),
                },
                ZyperHD: {
                  defaultIndex: 0,
                  list: initState.ZyperHD.list,
                },
                list: undefined
              };
              dispatch(connectionListInit(localStorageConn));
              storage.remove();
              dispatch(onSave());
              appAlert.info('Connection settings imported from 1.2 version of browser local storage');
            } else {
              dispatch(connectionListInit(localStorageConn));
              storage.remove();
              dispatch(onSave());
              appAlert.info('Connection settings imported from 1.3 version of user local storage');
            }
          } else {
            // If there are no join configurations from the browser's local storage,
            // use the factory default join configurations.
            dispatch(connectionListInit({ ...initState }));
            dispatch(onSave());
            appAlert.info('Connection settings restored from factory defaults');
          }

        } else if (json.error) {
          appAlert.error(`Connection settings, ${json.error}`);
        } else {
          // Process join configurations from the storage file.
          dispatch(connectionListInit({ ...json }));
        }
      })
      .catch((error) => {
        appAlert.error(`Connection settings, ${error}`);
      });
  };
}

export function onSave() {
  return (dispatch, getState) => {
    const obj = getState().connection; 
    delete obj.formData;
    saveConn(obj)
      .then(resp => resp.json())
      .then(json => {
        if (json.error) {
          appAlert.error(`Connection settings, ${json.error}`);
        } else {
          dispatch(onLoad());
        }
      })
      .catch((error) => {
        appAlert.error(`Connection settings, save: ${error}`);
      });
  };
}

export function onRestoreFactoryDefaults() {
  return (dispatch, getState) => {
    const obj = getState().connection; 
    removeConn()
      .then(resp => resp.json())
      .then(json => {        
        if (json.status === 'success') {
          appAlert.success(`Connection settings, ${json.msg}`);
          dispatch(onLoad());
        } else {          
          appAlert.error(`Connection settings, ${json.msg}`);
        }
      })
      .catch((error) => {
        appAlert.error(`Connection settings, ${error}`);
      });
  };
}

export function onDefaultConnectionChanged(model, index) {
  return (dispatch, getState) => {
//    console.log('onDefaultConnectionChanged');
    dispatch(defaultConnectionChanged(model, index));
    dispatch(onSave());
  };

}
