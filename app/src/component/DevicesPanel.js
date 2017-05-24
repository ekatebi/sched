import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Overlay } from 'react-bootstrap';
import Loader from 'react-loader';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import * as deviceActions from './device/actions';
import * as filterActions from './filter/actions';
import Panel from './Panel';
import Device from './device/Device';
import { fetchDevice } from '../service/apiFetch/device';
import {
  TOGGLE_MENU_ITEM,
  MENU_ITEM_SOURCES,
  MENU_ITEM_DISPLAYS
} from './appMenu/constants';
import {
  GET,
  SET,
  DEVICE_COLOR_GREEN,
  DEVICE_COLOR_YELLOW,
  DEVICE_COLOR_RED,
  PAGINATION
} from '../constant/app';
import keydown from 'react-keydown';
import DevicePopupPanel from './DevicePopupPanel';
import { getPosition } from '../service/dom';

const KEYS = ['esc'];
 
@keydown(KEYS)
class DevicesPanel extends Component {

  static propTypes = {
    settings: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      isInfoCleared: false,
      activePage: 1,
      sortedDeviceListSettings: [],
      firmwareVerShow: false,
      popupPanelPosition: { x: 100, y: 100 }, 
    };  
    this.deviceColor = this.deviceColor.bind(this);
    this.prepDeviceList = this.prepDeviceList.bind(this);
    this.fetchInfo = this.fetchInfo.bind(this);
    this.firmwareVerDiv = this.firmwareVerDiv.bind(this);
    this.firmwareRevPopupToggle = this.firmwareRevPopupToggle.bind(this);
  }

  fetchInfo(props) {
    const { requestForInfo, deviceActions } = props;
    const { onRequestInfo } = deviceActions;

    if (requestForInfo) {
      onRequestInfo();
    }
  }

  componentWillMount() {
    // Get information on all the devices via the API, and start the long polling loop.
    this.fetchInfo(this.props);
    this.prepDeviceList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // Not needed.    this.fetchInfo(nextProps);

    const { keydown, firmwareVerSource } = nextProps;

    if (keydown.event) {
      // inspect the keydown event and decide what to do 
      console.log('DevicesPanel', keydown.event.which);
    }

    this.prepDeviceList(nextProps);
  }

  // Used for filtering
  deviceColor(deviceSettings) {
    // Force virtual devices green in demo mode, "virtual".
    if (window.virtual) {
      if (deviceSettings.status.gen.mac.substring(0, 2) === 'ff') {
        return DEVICE_COLOR_GREEN;
      }
    }
    if (!deviceSettings.status) {
      return DEVICE_COLOR_RED;
    }
    if (deviceSettings.status.gen.state !== 'Up') {
      return DEVICE_COLOR_RED;
    }
    if (deviceSettings.status.gen.type === 'encoder' &&
      deviceSettings.status.hdmiInput.cableConnected === 'disconnected') {
      return DEVICE_COLOR_YELLOW;
    }
    if (deviceSettings.status.gen.type === 'decoder' &&
      deviceSettings.status.hdmiOutput &&
      deviceSettings.status.hdmiOutput.cableConnected === 'disconnected') {
      return DEVICE_COLOR_YELLOW;
    }
    if (deviceSettings.status.gen.type === 'decoder' &&
      deviceSettings.status.connectedEncoder.receivingVideoFromEncoder === 'no') {
      return DEVICE_COLOR_YELLOW;
    }
    return DEVICE_COLOR_GREEN;
  }

  isUsb(deviceSettings) {
    if (!deviceSettings.capabilities) {
      return false;
    }
    if (deviceSettings.capabilities['join-usb']) {
      return true;
    }
    return false;
  }

  prepDeviceList(props) {
    const { settings, device, filter, loaded } = props;
    const { id, title, onToggleItem } = settings;

    const itemsCountPerPage = window.maxLength ? window.maxLength : PAGINATION.itemsCountPerPage;
    let deviceList = [];
    let statusLength = 0;
    let configLength = 0;
    let capabilitiesLength = 0;
    let maxLength = 0;
    const deviceListSettings = [];
    let sortedDeviceListSettings = [];

    switch (id) {
      case MENU_ITEM_SOURCES:
        // fall through
      case MENU_ITEM_DISPLAYS:
        if (device.status.info && device.status.info.text) {
          statusLength = device.status.info.text.length;
        }
        if (device.config.info && device.config.info.text) {
          configLength = device.config.info.text.length;
        }
        if (device.capabilities.info && device.capabilities.info.text) {
          capabilitiesLength = device.capabilities.info.text.length;
        }

        maxLength = Math.max(statusLength, configLength, capabilitiesLength);

        // Loop through each device, and combine the status, config and capabilities
        // information for that one device into one deviceSettings.
        for (let i = 0; i < maxLength; i++) {
          let deviceSettings = {};

          if (device.status.info && device.status.info.text && device.status.info.text[i]) {
            deviceSettings.status = device.status.info.text[i];
          }
          if (device.config.info && device.config.info.text && device.config.info.text[i]) {
            deviceSettings.config = device.config.info.text[i];
          }
          if (device.capabilities.info && device.capabilities.info.text && device.config.info.text[i]) {
            deviceSettings.capabilities = device.capabilities.info.text[i];
          }
          if (deviceSettings.status || deviceSettings.config || deviceSettings.capabilities) {
            deviceSettings.allDevices = device;
          }

          // Save the combined deviceSettings for one device onto a list of devices.
          if (filter && filter.show) {
            if (filter.name) {
              if (deviceSettings.config && deviceSettings.config.gen && deviceSettings.config.gen.name) {
                if (
                  (deviceSettings.config.gen.name.indexOf(filter.name) > -1)
                  && ((filter.statusGreen && this.deviceColor(deviceSettings) === DEVICE_COLOR_GREEN) || 
                    (filter.statusYellow && this.deviceColor(deviceSettings) === DEVICE_COLOR_YELLOW) || 
                    (filter.statusRed && this.deviceColor(deviceSettings) === DEVICE_COLOR_RED))
                  && (deviceSettings.status && 
                    ((filter.model4k && deviceSettings.status.gen.model === 'Zyper4K') || 
                    (filter.modelHd && deviceSettings.status.gen.model === 'ZyperHD')))
                  && ((filter.usbYes && this.isUsb(deviceSettings)) || 
                    (filter.usbNo && !this.isUsb(deviceSettings)))
                ) {
                  deviceListSettings.push(deviceSettings);
                }
              }
            } else if (
              ((filter.statusGreen && this.deviceColor(deviceSettings) === DEVICE_COLOR_GREEN) || 
                (filter.statusYellow && this.deviceColor(deviceSettings) === DEVICE_COLOR_YELLOW) || 
                (filter.statusRed && this.deviceColor(deviceSettings) === DEVICE_COLOR_RED))
              && (deviceSettings.status && 
                ((filter.model4k && deviceSettings.status.gen.model === 'Zyper4K') || 
                (filter.modelHd && deviceSettings.status.gen.model === 'ZyperHD')))
              && ((filter.usbYes && this.isUsb(deviceSettings)) || 
                (filter.usbNo && !this.isUsb(deviceSettings)))
              ) {
                  deviceListSettings.push(deviceSettings);
            } 
          } else {
            deviceListSettings.push(deviceSettings);
          }
        }

        if (maxLength === 0) {
            this.setState({ sortedDeviceListSettings: [], activePage: 1 });
        } else {
          sortedDeviceListSettings = deviceListSettings.sort((a, b) => {
            if (!a || !a.config || !a.config.gen || !b || !b.config || !b.config.gen) {
              return -1;
            }

            const nameA = a.config.gen.name.toUpperCase(); // ignore upper and lowercase
            const nameB = b.config.gen.name.toUpperCase(); // ignore upper and lowercase
            
            if (nameA < nameB) {
              return -1;
            }
            
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return 0;
          });

          if (this.state.sortedDeviceListSettings.length > sortedDeviceListSettings.length) { // got to first if the new set is smaller
            this.setState({ sortedDeviceListSettings, activePage: 1 });
          } else { // if the new set is larger or equal stay on the same page
            this.setState({ sortedDeviceListSettings });
          }

        }

        break;
      default: {
        this.setState({ sortedDeviceListSettings: [], activePage: 1 });
        break;
      }
    }
  }

  firmwareRevPopupToggle(val) {
    this.setState({
      firmwareVerShow: val === true
    });
  }

  firmwareVerDiv() {

    const { firmwareVer, deviceActions, deviceDisplayOrderType } = this.props;
    const { popupPanelPosition } = this.state;

    const popupStyle = {
      display: 'flex',
      flex: '1 0 auto',
      flexFlow: 'row wrap',
//      flexFlow: 'row wrap',
      alignContent: 'flex-start',

//      borderWidth: 2,
//      borderColor: 'green',
//      borderStyle: 'solid',
      maxHeight: 250,

      overflow: 'auto',
    };

    let title = 'Firmware Versions - ';

    if (deviceDisplayOrderType === 'encoder') {
      title += 'Sources';
    } else if (deviceDisplayOrderType === 'decoder') {
      title += 'Displays';
    }

    return (
      <DevicePopupPanel
        position={popupPanelPosition}
        settings={{
          title,
          id: `firmwareVer${deviceDisplayOrderType}`,
          onToggleItem: this.firmwareRevPopupToggle
           }}>
          <pre style={popupStyle}>
            {JSON.stringify(firmwareVer[deviceDisplayOrderType], 0, 2)
              .replace(/({\n)|(})|(])|(,)|(\")|(:)|(\[)/g, '')
//              .replace(/(^\s*$)/g, '')
            }
          </pre>
      </DevicePopupPanel>);
  }

  render() {
    const { activePage, sortedDeviceListSettings, popupPanelPosition } = this.state;
    const { settings, device, filter, fetching, loaded, 
      displayOrder, deviceDisplayOrderType, filterActions, selectedDevices, 
      firmwareVerSource, deviceActions } = this.props;
    const { id, title, onToggleItem } = settings;

    const itemsCountPerPage = window.maxLength ? window.maxLength : PAGINATION.itemsCountPerPage;
    let deviceList = [];

    const start = (activePage - 1) * itemsCountPerPage;
    const end = Math.min(start + itemsCountPerPage, sortedDeviceListSettings.length);

    const firmwareVerOverlay = (
      <Overlay show={this.state.firmwareVerShow}>
        {this.firmwareVerDiv()}
      </Overlay>);

    if (displayOrder) {
      Object.keys(displayOrder)
      .sort((a, b) => {
        
        if (displayOrder[a] < displayOrder[b]) {
          return -1;
        }
        
        if (displayOrder[a] > displayOrder[b]) {
          return 1;
        }

        // names must be equal
        return 0;
      })
      .forEach((mac) => {
        const newIndex = displayOrder[mac];
        const index = sortedDeviceListSettings.findIndex((settings) => {
          return settings.status.gen.mac === mac;
        });

        if (index > -1 && newIndex < sortedDeviceListSettings.length) { // index found
          const settings = { ...sortedDeviceListSettings[index] };
          delete settings.index;
//          console.log('remove', index, sortedDeviceListSettings);
          sortedDeviceListSettings.splice(index, 1);
//          console.log('add', newIndex, settings);
          sortedDeviceListSettings.splice(newIndex, 0, settings);
//          console.log('added', sortedDeviceListSettings);
//          console.log('moved', index, newIndex, mac);
        }
      });
    }

    let indx = 0;

    for (let i = start; i < end; i++) {
      deviceList.push(
        <Device
          settings={{ ...sortedDeviceListSettings[i], index: indx }}
          key={indx++} />
        );
    }

    const listStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row wrap',
//      flexFlow: 'row wrap',
      alignContent: 'flex-start',

      borderWidth: 2,
      borderColor: 'green',
      borderStyle: 'solid',

      overflow: 'auto',
    };

    let clearDisplayOrderMenu;

    if (Object.keys(displayOrder).length > 0) { 
      clearDisplayOrderMenu = (<MenuItem onClick={(e) => {
          filterActions.setDisplayOrder(deviceDisplayOrderType);
          e.stopPropagation();
        }}>
          <span><i className="fa fa-trash" aria-hidden="true"></i>&nbsp;&nbsp;Clear Display Order</span>
        </MenuItem>);
    } else {
      clearDisplayOrderMenu = (<MenuItem>
          <span><i className="fa fa-reorder" aria-hidden="true"></i>&nbsp;&nbsp;Already Cleared</span>
        </MenuItem>);
    }

    const firmwareVersionsMenu = (<MenuItem onClick={(e) => {
        this.setState({ popupPanelPosition: { x: e.nativeEvent.clientX - 100, y: e.nativeEvent.clientY - 150 } });
        deviceActions.onFirmwareVersion(selectedDevices, deviceDisplayOrderType);
        this.firmwareRevPopupToggle(true);
        e.stopPropagation();
      }}>
        <span><i className="fa fa-file-code-o" aria-hidden="true"></i>&nbsp;&nbsp;Firmware Version</span>
      </MenuItem>);

    const contextMenu = (
      <div> 
        <ContextMenu id={`contextMenu-${deviceDisplayOrderType}`}>
          {clearDisplayOrderMenu}
          {firmwareVersionsMenu}
        </ContextMenu>
      </div>);

    let content = (<div className="appList">
        {deviceList}
        {firmwareVerOverlay}
      </div>);

      content = (
        <ContextMenuTrigger id={`contextMenu-${deviceDisplayOrderType}`} holdToDisplay={1000}>
          {content}
          {contextMenu}
        </ContextMenuTrigger>
      );
 
    return (
      <Panel settings={ { id, title, onToggleItem, 
        filter: { status: true }, 
        pagination: { 
          activePage,
          itemsCountPerPage,
          totalItemsCount: sortedDeviceListSettings.length,
          handleChange: (pageNumber) => {
//            console.log(`active page is ${pageNumber}`);
            this.setState({ activePage: pageNumber });
            } }
        } } 
        loaded={loaded} >
        {content}
      </Panel>
    );
  }
}

function mapStateToProps(state, props) {

  const { id } = props.settings;
  const { encoders, decoders, fetching, 
    lastChangeIdMaxNumbers, selectedSources, selectedDisplays, firmwareVer } = state.device;
  const { displayOrder } = state.filter;

//  console.log('settings', props.settings);

  let device;  
  let deviceDisplayOrder;
  let deviceDisplayOrderType;
  let selectedDevices;

  if (id === MENU_ITEM_SOURCES) {
    device = encoders;
    deviceDisplayOrder = displayOrder.encoder ? { ...displayOrder.encoder } : {};
    deviceDisplayOrderType = 'encoder';
    selectedDevices = selectedSources;
  } else if (id === MENU_ITEM_DISPLAYS) {
    device = decoders;
    deviceDisplayOrder = displayOrder.decoder ? { ...displayOrder.decoder } : {};
    deviceDisplayOrderType = 'decoder';
    selectedDevices = selectedDisplays;
  }

  return {
//    storageLoaded: state.storage.loaded,
    requestForInfo: lastChangeIdMaxNumbers.status === -1 && lastChangeIdMaxNumbers.config === -1 && lastChangeIdMaxNumbers.capabilities === -1,
    device,
//    loaded: !fetching,
    loaded: !fetching || (lastChangeIdMaxNumbers && lastChangeIdMaxNumbers.status > -1 && 
      lastChangeIdMaxNumbers.config > -1 && lastChangeIdMaxNumbers.capabilities > -1),
    filter: state.filter[id],
    displayOrder: deviceDisplayOrder,
    deviceDisplayOrderType,
    selectedDevices,
    firmwareVer
  };
}

function mapDispatchToProps(dispatch) {
 return {
      deviceActions: bindActionCreators(deviceActions, dispatch),
      filterActions: bindActionCreators(filterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DevicesPanel);
