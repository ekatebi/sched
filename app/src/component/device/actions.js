/* eslint react/prop-types: 0 no-console: 0 */

import { NOOP, CLEAR_INFO, REQUEST_INFO, RECEIVE_INFO, REFRESH_INFO,
  RECEIVE_ERROR, RECEIVE_TIMEOUT, REQUEST_MAX_NUMBERS,
  RECEIVE_MAX_NUMBERS, RECEIVE_MAX_NUMBERS_ERROR, FIRMWARE_VERSION,
  SELECT_DISPLAYS, SELECT_SOURCES, RECEIVE_DRAG, INIT_COUNTER } from './constants';
import { fetchDevice, fetchLong } from '../../service/apiFetch/device';
import { joinDevices } from '../../service/apiFetch/join';
import { getHeartbeat } from '../server/Heartbeat';
import * as connectionActions from '../connection/actions';
import * as multiviewActions from '../multiview/actions';
import { FetchLongDelay } from '../../constant/app';

function noop() {
  return {
    type: NOOP
  };
}

export function firmwareVersion(firmwareVer, devType) {
  return {
    type: FIRMWARE_VERSION,
    firmwareVer,
    devType
  };
}

export function selectSources(sources) {
  return {
    type: SELECT_SOURCES,
    sources
  };
}

export function selectDisplays(displays) {
  return {
    type: SELECT_DISPLAYS,
    displays
  };
}

export function onSelectDevices(source, ctrlKey = false, devType = 'encoder') {
  return (dispatch, getState) => {

//    console.log('onSelectSources', source);

    const { selectedSources: selectedSrcs, selectedDisplays } = getState().device;

    const selectedSources = devType === 'encoder' ? selectedSrcs : selectedDisplays;

    const index = selectedSources.findIndex((src) => {
//      return source && src.sourceMac === source.sourceMac;
      return source && src.config.gen.mac === source.config.gen.mac;
    });

    if (ctrlKey) {
      if (index < 0) {
        selectedSources.push(source);
      } else {
        selectedSources.splice(index, 1);        
      }
    } else {

      const len = selectedSources.length; 

      if (len > 0) {
        selectedSources.splice(0, selectedSources.length);
      }      

      if (index < 0 || len > 1) {
        selectedSources.push(source);
      }
    }

    if (devType === 'encoder') {
      dispatch(selectSources([...selectedSources]));

      if (selectedSources.length === 1) {
        dispatch(multiviewActions.selectMultiview());
      }
    } else {
      dispatch(selectDisplays([...selectedSources]));
    }
  };
}

export function receiveDragInfo(dragInfo) {
  return {
    type: RECEIVE_DRAG,
    dragInfo
  };
}

export function initCounter(globalCounter) {
  return {
    type: INIT_COUNTER,
    globalCounter
  };
}

export function clearInfo() {
  return {
    type: CLEAR_INFO
  };
}

function requestInfo(deviceType, infoType) {
  return {
    type: REQUEST_INFO,
    deviceType,
    infoType
  };
}

function receiveInfo(info, deviceType, infoType) {
  return {
    type: RECEIVE_INFO,
    info,
    deviceType,
    infoType
  };
}

function refreshInfo(refreshing) {
  return {
    type: REFRESH_INFO,
    refreshing
  };
}

function receiveError(error, deviceType, infoType) {
  return {
    type: RECEIVE_ERROR,
    error, // string
    deviceType,
    infoType
  };
}

// long polling
function requestMaxNumbers() {
  return {
    type: REQUEST_MAX_NUMBERS
  };
}

function receiveMaxNumbers(lastChangeIdMaxNumbers) {
  return {
    type: RECEIVE_MAX_NUMBERS,
    lastChangeIdMaxNumbers
  };
}

function receiveMaxNumbersError(error) {
  return {
    type: RECEIVE_MAX_NUMBERS_ERROR,
    error // string
  };
}

function receiveTimeout() {
  return {
    type: RECEIVE_TIMEOUT
  };
}

function mergeDeviceLists(fullDeviceList, newDeviceList, refreshing) {
  // When refreshing, ignore the existing list so devices can be deleted.

  if (!fullDeviceList || fullDeviceList.length < 1 || refreshing) {
    return [...newDeviceList];
  }

  let outputDeviceList = [...fullDeviceList];

//  console.log('newDeviceList', newDeviceList);

  if (Array.isArray(newDeviceList)) {
    newDeviceList.forEach((newDevice) => {
      let index = fullDeviceList.findIndex((oldDevice) => {
        return newDevice.gen.mac === oldDevice.gen.mac;
      });

      if (index > -1) {
        // Replace the device.
        outputDeviceList[index] = newDevice;
      } else {
        // Push the new device onto the end of the list.
        outputDeviceList.push(newDevice);
      }
    });
  }

  return [...outputDeviceList];
}

function counter() {
  let privateCounter = 0;
  return {
    increment: () => { privateCounter++; },
    value: () => { return privateCounter; },
  };
}

export function onRequestInfo() {

  return (dispatch, getState) => {

    return new Promise((resolve, reject) => {

//      console.log('onRequestInfo Promise');

      const { fetching, refreshing, encoders, decoders } = getState().device;
      let { lastChangeIdMaxNumbers, globalCounter } = getState().device;

      // Initialize globalCounter exactly once.
      if (!globalCounter) {
        globalCounter = counter();
        dispatch(initCounter(globalCounter));
      }

      const waitingForFetch = {};
      const localFetchId = globalCounter.value();
      globalCounter.increment();

      // Only refresh once.
      if (refreshing) {
        dispatch(refreshInfo(false));
      }

      if (fetching) {
        dispatch(noop());
//        console.log('fetching');
        resolve(true);      
      } else {
//        console.log('not fetching');
        setTimeout(() => {
          dispatch(connectionActions.onLoad());
        }, 200);
        dispatch(requestMaxNumbers());
        try {

          waitingForFetch[localFetchId] = true;

          setTimeout(() => {
            if (waitingForFetch[localFetchId]) {
              appAlert.error('The server is not available.');
              // Loop until server is available again.
              getHeartbeat();
            }
          }, 20000);

          // Refreshing - get information on every device.
          if (refreshing) {

//            console.log('refreshing', lastChangeIdMaxNumbers);
            lastChangeIdMaxNumbers = { status: -1, config: -1, capabilities: -1 };
          }

//          console.log('fetchLong', lastChangeIdMaxNumbers);

          fetchLong(lastChangeIdMaxNumbers)
          .then((resp) => {
            delete waitingForFetch[localFetchId];
            let json;
            if (resp.ok) {
              // console.log('resp ok', resp.status);
              if (resp.status === 200) {
                json = resp.json();
              }
            } else {
              // console.log('resp not ok', resp.status);
              if (resp.status === 408) {
                dispatch(receiveTimeout());
                // Loop.

                const fld = window.fetchLongDelay ? window.fetchLongDelay : FetchLongDelay;

                setTimeout(() => {
                  dispatch(onRequestInfo());
                }, fld);
              }
            }
            return json;
          })
          .catch((err) => {
            appAlert.error('Server is not available.');
            getHeartbeat();
          })
          .then((json) => {
            if (json) {
              if (json.status === 'Success') {
                const { changedData } = json;

                let newLastChangeIdMaxNumbers = { ...lastChangeIdMaxNumbers };
                let parent = 'devices';
                // changedInfo:
                //   lastChangeIdMax: integer
                //   text: an array of devices for this deviceType/infoType combination.
                let changedInfo;
                if (changedData[parent]) {
                  let deviceType = 'encoders';
                  if (changedData[parent][deviceType]) {
                    let infoType = 'status';
                    changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = encoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }

                    infoType = 'config';
                    changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = encoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }

                    infoType = 'capabilities';
                    changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = encoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }
                  }

                  deviceType = 'decoders';
                  if (changedData[parent][deviceType]) {
                    let infoType = 'status';
                    let changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = decoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }
                    infoType = 'config';
                    changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = decoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      // TODO - Rename to newDeviceInfo, or also pass the "parent" value of "devices".
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }

                    infoType = 'capabilities';
                    changedInfo = changedData[parent][deviceType][infoType];
                    if (changedInfo) {
                      let fullDeviceList;
                      let fullInfo = decoders[infoType].info;
                      if (fullInfo) {
                        fullDeviceList = fullInfo.text;
                      } else {
                        fullDeviceList = [];
                      }
                      let newDeviceList = mergeDeviceLists(fullDeviceList, changedInfo.text, refreshing);
                      let newInfo = { lastChangeIdMax: changedInfo.lastChangeIdMax, text: newDeviceList };
                      newLastChangeIdMaxNumbers = { ...newLastChangeIdMaxNumbers, [infoType]: changedInfo.lastChangeIdMax };
                      dispatch(receiveInfo(newInfo, deviceType, infoType));
                    }
                  }
                }
                // console.log('newLastChangeIdMaxNumbers', newLastChangeIdMaxNumbers);
                // Set the max numbers on the state.
                dispatch(receiveMaxNumbers(newLastChangeIdMaxNumbers));
                // Loop.
                dispatch(onRequestInfo());
              } else {
                appAlert.error('Failed to fetch device info.', { error: json.status });
                dispatch(receiveMaxNumbersError(json.status));
              }  
            }

//          console.log('resolve not fetching');
            resolve(false);

          })
          .catch(error => {
//             console.error('fetchLong catch error', error);
            dispatch(receiveMaxNumbersError(error));
            reject(error);
          });
        
        } catch (error) {
          console.error('fetchLong error', error);
          dispatch(receiveMaxNumbersError(error));
          reject(error);
        }
        
      }

    });

  };
}

export function onRemoveDevice() {
  return (dispatch, getState) => {
    const { fetching, lastChangeIdMaxNumbers, encoders, decoders } = getState().device;
    dispatch(refreshInfo(true));
    // Elsewhere, if "refreshing", then request info on all devices (max of -1).
    // When the results comes back, use only the new information.
    // Then set "refreshing" to false.
    // In this way, the device will be deleted.
  };
}

const keyToName = (key) => {
  if (key === 'digitalAudio') {
    return 'Digital Audio';
  }
  if (key === 'analogAudio') {
    return 'Analog Audio';
  }
  return key;
};

export function joinDevicesEx(sourceMac, displayName, 
    item, oldVideoConnection, analogAudioConnection) {
  return (dispatch, getState) => {


    joinDevices(sourceMac, displayName, item.item, oldVideoConnection)
      .then((resp) => resp.json())
      .then((json) => {
        // console.log('joinDevices', JSON.stringify(json, 0, 2));
        if (json.status === 'Success') {
          json.responses.forEach((res, index) => {
            // Note: There is one res for each command line which was sent.
            //   There is one item.item[key] for each possible part of a join configuration.
            //   Currently, there is no way to tie the two pieces together
            //   to indicate which part of the join configuration succeeded or failed.
            //   One solution is when we send commands to rcCmd.php, send JSON instead of
            //   simply a concatenated list of commands.
            //   The JSON indicates the part of the join command associated with each API command.
            //   Then when the API command succeeds or fails, rcCmd.php will also return join command information.
            //   This way, we can simply parse and report each res,
            //   and not loop through each part of the join configuration (item.item).
            if (res.errors.length !== 0) {
              if (res.errors.join(', ').indexOf('does not support or cannot change this functionality') > -1) {
                appAlert.info(`${res.errors.join(', ')} API Command: ${res.command}`);
              } else {
                appAlert.error(`${res.errors.join(', ')} API Command: ${res.command}`);
              }
            }
          });

          Object.keys(item.item).forEach((key, index) => {
            if (key !== 'name' && key !== 'index' && key !== 'readOnly' && key !== 'defaultConnection') {
              if (item.item[key].value === 'none') {
                appAlert.success(`Disconnected ${keyToName(key)} from display ${displayName}`,
                  { time: window.diag ? 0 : 8000 });
              } else if (item.item[key].value !== 'noChange') {
                if (item.item[key].value === 'connect') {
                  appAlert.success(`Joined ${keyToName(key)} from source ${sourceMac} to display ${displayName}`,
                    { time: window.diag ? 0 : 8000 });
                } else {
                  appAlert.success(`Joined ${item.item[key].label} ${keyToName(key)} from source ${sourceMac} to display ${displayName}`,
                    { time: window.diag ? 0 : 8000 });
                }
              }
            }
          });
          // appAlert.success(`Overall source ${sourceMac} and display ${displayName}`);
        } else {
          appAlert.error(`Failure ${json.status}, source ${sourceMac} and display ${displayName}`);
        }

      })
      .catch((err) => {
        appAlert.error(`Join devices error ${err}`);
      });


  };
}

export function onFirmwareVersion(selectedDevicesEx, type) {

//  console.log('onFirmwareVersion', selectedDevices, type);

  return (dispatch, getState) => {

    const { encoders, decoders } = getState().device;

    let selectedDevices = selectedDevicesEx || [];

    let devs;

    if (selectedDevices.length === 0 && type === 'encoder') {
      devs = encoders;
    } else if (selectedDevices.length === 0 && type === 'decoder') {
      devs = decoders;
    }

//    console.log('onFirmwareVersion', selectedDevices.length);

    if (selectedDevices.length === 0) {
      selectedDevices = devs.config.info.text.map((config) => {
        return { config };
      });
    }
    
//    console.log('onFirmwareVersion', selectedDevices);

    let firmwareVer;

    if (selectedDevices.length > 0) {

      firmwareVer = selectedDevices.reduce((acc, cur, i) => {

          if (!acc[cur.config.gen.firmware]) {
            acc[cur.config.gen.firmware] = [];
          }

          acc[cur.config.gen.firmware].push(cur.config.gen.name); 

          return acc;
        }, {});

    }

    dispatch(firmwareVersion(firmwareVer, type));

  };
}