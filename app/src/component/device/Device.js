// Note: When displaying join information, only use config fields, and not status fields, 
// since status lastChangeMaxId is not updated following a join.

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Overlay, Label, Grid, Row, Col, Accordion, Panel } from 'react-bootstrap';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { findDOMNode } from 'react-dom';

import DevicePopupPanel from '../DevicePopupPanel';
import DeviceDetailSummary from './DeviceDetailSummary';
import DeviceDetailConnection from './DeviceDetailConnection';
import DeviceDetailId from './DeviceDetailId';
import DeviceDetailStatus from './DeviceDetailStatus';
import DeviceDetailConfig from './DeviceDetailConfig';
import DeviceDetailAction from './DeviceDetailAction';
import { getPosition } from '../../service/dom';
import { DropTarget as dropTarget } from 'react-dnd';
import { DndItemTypes } from '../../constant/dndItemTypes';

import DeviceJoinConfig from './DeviceJoinConfig';
import DeviceJoins from './DeviceJoins';
import ConnectionList from '../connection/ConnectionList';
import { DeviceSettings } from './service/DeviceSettings';
import {
  itemBackgroundColor,
  DEVICE_COLOR_GREEN,
  DEVICE_COLOR_YELLOW,
  DEVICE_COLOR_RED
} from '../../constant/app';
import * as mvActions from '../multiview/actions';
import * as filterActions from '../filter/actions';
import * as deviceActions from './actions';
import _flow from 'lodash/flow';
import ToolTip from '../ToolTip';
import keydown from 'react-keydown';

const deviceDropTarget = {
  canDrop: (props, monitor) => {
    // You can disallow drop based on props or item

    const item = monitor.getItem();
    const itemType = monitor.getItemType();

    if (itemType === DndItemTypes.MVITEM) {
      return props.settings.status.gen.type === 'decoder' &&
      props.settings.capabilities && props.settings.capabilities['join-video'] &&
      props.settings.capabilities['join-video'].values &&
      props.settings.capabilities['join-video'].values.indexOf('multiview') >= 0;
    }

//    if (item.settings && item.settings.gen.type === 'decoder' && 
//        props.settings.status.gen.type === 'decoder') {
//      return false;
//    }

    if ((item.settings && item.settings.gen.type === 'decoder' && 
        props.settings.status.gen.type === 'decoder') || 
      (item.settings && item.settings.gen.type === 'encoder' && 
        props.settings.status.gen.type === 'encoder')) {
      return true;
    }

    if (item && props.settings.status.gen.model !== item.model) {
      return false;
    }

    return (props.settings.status.gen.type === 'decoder' && 
      item.settings && item.settings.gen.type === 'encoder') ||
      (props.settings.status.gen.type === 'decoder' && 
        item.item && item.item.video && item.item.video.value !== 'videoWall');
  },

  drop: (props, monitor, component) => {
//    console.log('Device drop', component, monitor.getItemType(), DndItemTypes.MVITEM, monitor.getItem(), props);

    const item = monitor.getItem();
    const itemType = monitor.getItemType();

    if (DndItemTypes.MVITEM === itemType) {
      if (component) {
        component.animateEx(true, 2);
      }

      props.mvActions.onRequestJoinMvToDisplay(monitor.getItem().gen.name,
        props.settings.config.gen.name);

      return;
    }

    if ((item.settings && item.settings.gen.type === 'decoder' && 
        props.settings.status.gen.type === 'decoder') || 
      (item.settings && item.settings.gen.type === 'encoder' && 
        props.settings.status.gen.type === 'encoder')) {

//      console.log('drop displayOrder', props.settings.index, item.settings.gen.mac);      

      props.filterActions.onSetDisplayOrder(item.settings.gen.type, 
        item.settings.gen.mac, props.settings.index);

    } else if (component) {
      component.joinTwoDevices(monitor.getItem());
    }
  }
};

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
    draggedItem: monitor.getItem()
    // mousePosition: getClientOffset()
  };
}

// const KEYS = ['esc', 'up', 'ctrl+z', 'shift+up', 'shift+down', 'enter', 'j', 'k', 'h', 'l'];
const KEYS = ['esc'];
 
@keydown(KEYS)
class Device extends Component {

  static propTypes = {
    settings: PropTypes.object.isRequired
  };

  static defaultProps = {
    settings: {}
  };

  constructor(props) {
    super(props);
    this.updatePosition = this.updatePosition.bind(this);
    this.devicePopupToggle = this.devicePopupToggle.bind(this);
    this.deviceRawPopupToggle = this.deviceRawPopupToggle.bind(this);
    this.joinConfigPanelToggle = this.joinConfigPanelToggle.bind(this);
    this.summaryExpandToggle = this.summaryExpandToggle.bind(this);
    this.connectionExpandToggle = this.connectionExpandToggle.bind(this);
    this.idExpandToggle = this.idExpandToggle.bind(this);
    this.statusExpandToggle = this.statusExpandToggle.bind(this);
    this.configExpandToggle = this.configExpandToggle.bind(this);
    this.actionExpandToggle = this.actionExpandToggle.bind(this);
    this.animateEx = this.animateEx.bind(this);
    this.joinTwoDevices = this.joinTwoDevices.bind(this);
    this.deviceColor = this.deviceColor.bind(this);
    this.tabletJoin = this.tabletJoin.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.keyHandler = this.keyHandler.bind(this);

    this.state = { showDevicePopup: false,
      showDeviceRawPopup: false,
      showJoinConfigPanel: false,
      isSummaryExpanded: false,
      isConnectionExpanded: false,
      isIdExpanded: false,
      isStatusExpanded: false,
      isConfigExpanded: false,
      isActionExpanded: false,
      animate: false,
      animationValue: 0,
      popupPanelPosition: { x: 100, y: 100 },
      popupPanelConfigPosition: { x: 100, y: 100 },
      popupPanelRawPosition: { x: 100, y: 100 },
      popupPanelMouseDown: false,
      videoUrl: undefined,
      showDisplayOrder: false,
      displayOrderIndex: -1
    };
    this.compName = 'Device';
    this.elemId = '';
    this.elemCm = '';
    this.elemCmJoins = '';
    this.nameId = '';
    this.width = 100;
    this.height = 100;
  }

  componentWillMount() {
    const { settings } = this.props;
    if (settings.status) {
      this.elemId = `${this.compName}-${settings.status.gen.type}-${settings.status.gen.mac}`;
    } else {
      this.elemId = '';
    }
    this.elemCm = `${this.elemId}-cm`;
    this.elemCmJoins = `${this.elemId}-cmJoins`;
    this.nameId = `${this.elemId}-name`;
  }

  componentDidMount() {
    this.elem = document.getElementById(this.elemId);
  }

  componentWillReceiveProps(nextProps) {
    const { keydown } = nextProps;

    if (keydown.event) {
      // inspect the keydown event and decide what to do 
      console.log('Device', keydown.event.which);
    }

    if (this.props.displayOrderEdit && !nextProps.displayOrderEdit) {

      if (this.state.displayOrderIndex !== this.props.displayOrder.index) {
        this.props.filterActions.onSetDisplayOrder(this.props.settings.status.gen.type, 
          this.props.settings.status.gen.mac, this.state.displayOrderIndex);
      }

      this.setState({ showDisplayOrder: false });      
    } else if (!this.props.displayOrderEdit && nextProps.displayOrderEdit) {
      this.setState({ displayOrderIndex: nextProps.displayOrder.index });
    }

  }

  joinTwoDevices(item) {

    const { deviceActions } = this.props;

//    console.log('joinTwoDevices', item);
    setTimeout(() => {
      this.animateEx(true, window.mobile ? 5 : 2);
    }, 100);

//    this.animateEx(true, 2);
    const sourceMac = item.sourceMac;
    const displayName = this.props.settings.config.gen.name;
    const oldVideoConnection = this.props.settings.config.connectedEncoder.macAddr;

    deviceActions.joinDevicesEx(sourceMac, displayName, item, oldVideoConnection);
  }

  tabletJoin(e) {
    const {
      settings, deviceActions, mvActions,
      connectDropTarget, itemType, canDrop, selected,
      isOverCurrent, draggedItem, connectionData, selectedSource, selectedMultiview,
    } = this.props;

    const { model } = settings.status.gen;
    const { list, defaultIndex } = connectionData[model];
    const item = list[defaultIndex];

    const selectSource = { 
      sourceMac: settings.status.gen.mac, 
      item, 
      model,
      // TODO - remove settings, after we are sure it is no longer used.
      settings: settings.status,

      status: settings.status,
      config: settings.config,
      capabilities: settings.capabilities 
    };

    if (settings.status.gen.type === 'encoder') {
      deviceActions.onSelectDevices(selectSource, e.ctrlKey);
    } else if (!selectedSource && settings.status.gen.type === 'decoder') {
      deviceActions.onSelectDevices(selectSource, e.ctrlKey, settings.status.gen.type);      
    } else if (selectedSource && settings.status.gen.type === 'decoder' &&
      selectedSource.model === settings.status.gen.model) {
        this.joinTwoDevices({ ...selectedSource });
    } else if (selectedMultiview) {

      if (settings.status.gen.type === 'decoder' &&
        settings.capabilities && settings.capabilities['join-video'] &&
        settings.capabilities['join-video'].values &&
        settings.capabilities['join-video'].values.indexOf('multiview') >= 0) {

          setTimeout(() => {
            this.animateEx(true, window.mobile ? 5 : 2);
          }, 100);

          mvActions.onRequestJoinMvToDisplay(selectedMultiview.gen.name,
            settings.config.gen.name);

      }
    }
  }

  clickHandler(e) {
//    console.log('clickHandler', e.shiftKey, e.ctrlKey);
    if (e.target.id === this.nameId) {
      this.devicePopupToggle();
    } else if (e.target.id === 'devModel') {
      const {
        settings, deviceActions, selectedSource
      } = this.props;

      if (!this.state.showDisplayOrder) {
        this.setState({ displayOrderIndex: this.props.displayOrder.index });
        this.props.filterActions.onEditDisplayOrder(settings.status.gen.type, settings.status.gen.mac);
      } else {

        this.props.filterActions.onEditDisplayOrder(settings.status.gen.type);

        if (this.state.displayOrderIndex !== this.props.displayOrder.index) {
          this.props.filterActions.onSetDisplayOrder(settings.status.gen.type, 
            settings.status.gen.mac, this.state.displayOrderIndex);
        }

//        this.setState({ displayOrderIndex: -1 });
      }

      this.setState({ showDisplayOrder: !this.state.showDisplayOrder });

      if (settings.status.gen.type === 'encoder' &&
          selectedSource && selectedSource.sourceMac === settings.status.gen.mac) {
          deviceActions.onSelectDevices();
      }

      e.stopPropagation();
    } else if (e.target.id === 'displayOrder') {
//      console.log('showDisplayOrder', this.state.showDisplayOrder);
      e.stopPropagation();
    } else if (!this.state.showDisplayOrder) {
      this.tabletJoin(e);
    }
    e.stopPropagation();
  }


  keyHandler(e) {
    console.log('keyHandler', e.keyCode);
  }

  updatePosition() {
    const position = getPosition(this.elem);
    position.y = 0;
    position.x += this.width + 5;
    // Make sure that device details pop up on the screen.
    position.x = Math.max(0, Math.min(position.x, window.innerWidth - 450));
    const { x, y } = this.state.popupPanelPosition;
    if (x !== position.x || y !== position.y) {
      this.setState({ popupPanelPosition: position });
    }
  }

  devicePopupToggle() {
    this.setState({
      showDevicePopup: !this.state.showDevicePopup,
    });
    if (!this.state.showDevicePopup) {
      this.setState({
        isSummaryExpanded: false,
        isConnectionExpanded: false,
        isIdExpanded: false,
        isStatusExpanded: false,
        isConfigExpanded: false,
        isActionExpanded: false
      });
    }
  }

  deviceRawPopupToggle() {
    this.setState({ showDeviceRawPopup: !this.state.showDeviceRawPopup });
  }

  joinConfigPanelToggle() {
    const { settings } = this.props;
    if (settings.status.gen.type === 'encoder') {
      this.setState({ showJoinConfigPanel: !this.state.showJoinConfigPanel });
    }
  }

  summaryExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isSummaryExpanded: !this.state.isSummaryExpanded });
    }
    event.stopPropagation();
  }

  connectionExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isConnectionExpanded: !this.state.isConnectionExpanded });
    }
    event.stopPropagation();
  }

  idExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isIdExpanded: !this.state.isIdExpanded });
    }
    event.stopPropagation();
  }

  statusExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isStatusExpanded: !this.state.isStatusExpanded });
    }
    event.stopPropagation();
  }

  configExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isConfigExpanded: !this.state.isConfigExpanded });
    }
    event.stopPropagation();
  }

  actionExpandToggle(event) {
    // Only toggle when the link or image within the header is selected.
    if (event.target.tagName === 'A' || event.target.tagName === 'I') {
      this.setState({ isActionExpanded: !this.state.isActionExpanded });
    }
    event.stopPropagation();
  }

  animateEx(on, val) {
    const { animate, animationValue } = this.state;
    const newVal = animationValue - 1;

    if (on) {
      this.setState({ animate: true, animationValue: val });
      this.animateEx(false, val);
    } else {
      if (animationValue > 0) {
        setTimeout(() => {
          this.setState({ animate: false, animationValue: newVal });
          this.animateEx(false, newVal);
        }, 400);
      }
    }
  }

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

  render() {
    const {
      settings, deviceActions, dragInfo, isConfig, isAdmin, selected,
      connectDropTarget, itemType, canDrop, displayOrder,
      isOverCurrent, draggedItem, connectionData, selectedSource,
    } = this.props;

    const { popupPanelPosition, popupPanelConfigPosition, displayOrderIndex,
      popupPanelRawPosition, animationValue, animate, videoUrl } = this.state;

    const {
      showDevicePopup,
      showDeviceRawPopup,
      showJoinConfigPanel,
      isSummaryExpanded,
      isConnectionExpanded,
      isIdExpanded,
      isStatusExpanded,
      isConfigExpanded,
      isActionExpanded,
    } = this.state;

    this.deviceSettings = new DeviceSettings(settings);

    // If config exists, it has the most up to date information.
    let name = '';
    if (settings && settings.config && settings.config.gen) {
      name = settings.config.gen.name;
    } else if (settings && settings.status && settings.status.gen) {
      name = settings.status.gen.name;
    }

    const deviceType = this &&
      this.deviceSettings &&
      this.deviceSettings.getDeviceType();
    const model = this &&
      this.deviceSettings &&
      this.deviceSettings.status &&
      this.deviceSettings.status.gen &&
      this.deviceSettings.status.gen.model;

    const width = this.width;
    const height = this.height;

    let borderWidth = 3;

    if (animationValue > 0) {
      if (animationValue === 2) {
        borderWidth *= 2;
      } else {
        borderWidth *= 3;
      }
    }

    let borderStateColor = this.deviceColor(settings);

    let backgroundColor = itemBackgroundColor;
    if (isOverCurrent) {
      backgroundColor = canDrop ? 'lightGreen' : 'pink';
    }

    if (selected) {
      backgroundColor = 'grey';
    }
      
    const deviceFrameStyle = {
      float: 'left',
      position: 'relative',
      width: `${width + 5}px`,
      height: `${height + 5}px`,
    };

    const deviceStyle = {
      borderStyle: 'solid',
      borderWidth: `${borderWidth}px`,
      borderRadius: 10,
      borderColor: borderStateColor,
      width: `${width}px`,
      height: `${height}px`,
      float: 'left',
      paddingTop: '10px',
      opacity: showDevicePopup || showJoinConfigPanel ? '0.5' : '1',
      backgroundColor
    };

    const mobileDeviceStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row nowrap',
      justifyContent: 'center',
//      alignItems: 'center',
      margin: 'auto',

      borderStyle: animate ? 'solid' : 'hidden',
      borderWidth: `${borderWidth}px`,
      borderRadius: 10,
      borderColor: borderStateColor,
      width: `${width}px`,
      height: `${height}px`,
      float: 'left',
      paddingTop: '10px',
//      opacity: showDevicePopup || showJoinConfigPanel ? '0.5' : '1',

      backgroundColor
    };

    const deviceNameStyle = {
      textAlign: 'center',
      whiteSpace: 'nowrap',
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      position: 'absolute',

      opacity: showDevicePopup ? 0.7 : 1.0,
  
      borderWidth: '2px',
      borderColor: 'lightgrey',
//      borderStyle: showDevicePopup ? 'solid' : 'none',
      cursor: 'pointer',
      fontSize: '9px',
      marginLeft: -12,
      marginTop: 5
    };

    const preStyle = {
      textAlign: 'left',
      overflow: 'auto',
      maxHeight: '400',
    };

    const deviceDetailsStyle = {
      display: 'block',
      overflowY: 'auto',
      width: '100%',
      minHeight: 200,
      maxHeight: window.innerHeight - 200,
      paddingRight: 15
    };

    const rawButtonStyle = {
      display: window.diag ? 'inherit' : 'none',
      margin: '0px 0px 15px',
    };

    const caretStyle = {
      margin: '0px 7px 0px 0px',
    };

    const summaryCaret = isSummaryExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';
    const connectionCaret = isConnectionExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';
    const idCaret = isIdExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';
    const statusCaret = isStatusExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';
    const configCaret = isConfigExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';
    const actionCaret = isActionExpanded ? 'fa fa-lg fa-caret-down' : 'fa fa-lg fa-caret-right';

    // Collect status, config and capability data for this device
    // and prepare it for display.
    const deviceProcessedDetails = () => {
      const deviceDetailSummary = (
        <DeviceDetailSummary settings={settings} />
      );

      const deviceDetailConnection = (
        <DeviceDetailConnection settings={settings} />
      );

      const deviceDetailId = (
        <DeviceDetailId settings={settings} />
      );

      const deviceDetailStatus = (
        <DeviceDetailStatus settings={settings} />
      );

      const deviceDetailConfig = (
        <DeviceDetailConfig settings={{ ...settings, popupPanelMouseDown: this.state.popupPanelMouseDown }} />
      );

      const deviceDetailAction = (
        <DeviceDetailAction settings={settings} isConfig={isConfig} isAdmin={isAdmin} />
      );

      const connections = (
        <Accordion>
          <Panel
            header={<div onClick={this.connectionExpandToggle}>
            <i className={connectionCaret} style={caretStyle}></i>Connections</div>}
            eventKey="1">
            {deviceDetailConnection}
          </Panel>
        </Accordion>
      );

      const showRawDetails =
        (<button className="btn" onClick={this.deviceRawPopupToggle} style={rawButtonStyle}>
          Show Raw Details
        </button>);

      return (
        <DevicePopupPanel
          position={popupPanelPosition}
          settings={{
            title: `${name} - ${deviceType}`,
            id: name,
            onToggleItem: this.devicePopupToggle,
            onMouseDown: (down) => {
              this.setState({ popupPanelMouseDown: down });
            } }}>
          <div>
            <div style={deviceDetailsStyle}>
              <Accordion onClick={this.summaryExpandToggle}>
                <Panel
                  header={<div>
                    <i className={summaryCaret} style={caretStyle}></i>Summary</div>}
                  eventKey="1">
                  {deviceDetailSummary}
                </Panel>
              </Accordion>
              {this.deviceSettings.isDisplay() ? connections : ''}
              <Accordion onClick={this.idExpandToggle}>
                <Panel
                  header={<div>
                    <i className={idCaret} style={caretStyle}></i>ID</div>}
                  eventKey="1">
                  {deviceDetailId}
                </Panel>
              </Accordion>
              <Accordion>
                <Panel
                  header={<div onClick={this.statusExpandToggle}>
                    <i className={statusCaret} style={caretStyle}></i>Status</div>}
                  eventKey="1">
                  {deviceDetailStatus}
                </Panel>
              </Accordion>
              {isConfig ? (<Accordion>
                <Panel
                  header={<div onClick={this.configExpandToggle}>
                    <i className={configCaret} style={caretStyle}></i>Config</div>}
                  eventKey="1">
                  {deviceDetailConfig}
                </Panel>
              </Accordion>) : undefined}
              {isAdmin || isConfig ? (<Accordion>
                <Panel
                  header={<div onClick={this.actionExpandToggle}>
                    <i className={actionCaret} style={caretStyle}></i>Actions</div>}
                  eventKey="1">
                  {deviceDetailAction}
                </Panel>
              </Accordion>) : undefined}
              {showRawDetails}
            </div>
          </div>
        </DevicePopupPanel>
      );
    };

    // Collect status, config and capability data for this device
    // and prepare it for display.
    const deviceRawDetails = () => {
      const deviceRawStatus = (
        <div>
          <h4>
            Raw Status
          </h4>
          <pre style={preStyle}>
            {JSON.stringify(settings.status, 0, 2)}
          </pre>
        </div>
      );

      const deviceRawConfig = (
        <div>
          <h4>
            Raw Config
          </h4>
          <pre style={preStyle}>
            {JSON.stringify(settings.config, 0, 2)}
          </pre>
        </div>
      );

      const deviceRawCapabilities = (
        <div>
          <h4>
            Raw Capabilities
          </h4>
          <pre style={preStyle}>
            {JSON.stringify(settings.capabilities, 0, 2)}
          </pre>
        </div>
      );

      return (
        <DevicePopupPanel
          position={popupPanelRawPosition}
          settings={{
            title: `Raw ${deviceType} - ${name}`,
            id: `raw${name}`,
            onToggleItem: this.deviceRawPopupToggle }}>
          <div style={ { maxHeight: 400, overflow: 'auto' } }>
            <div>
              {deviceRawStatus}
            </div>
            <div>
              {deviceRawConfig}
            </div>
            <div>
              {deviceRawCapabilities}
            </div>
          </div>
        </DevicePopupPanel>
      );
    };

    let shortModel;

    const vid = 'https://www.youtube.com/watch?v=4T9IL0gY7P0';

    if (settings && settings.status && settings.status.gen && settings.status.gen.model === 'ZyperHD') {
      shortModel = 'HD';
    } else if (settings && settings.status && settings.status.gen && settings.status.gen.model === 'Zyper4K') {
      shortModel = '4K';
    } else {
      shortModel = '';
    }

    const deviceJoinConfigs = () => {
      const nbsp3 = '\u00a0\u00a0\u00a0';
      return (
        <DevicePopupPanel
          position={popupPanelConfigPosition}
          settings={{
            title: `${name}${nbsp3}(${shortModel})${nbsp3}-${nbsp3}Join Configuration`,
            id: `config${name}`,
            onToggleItem: this.joinConfigPanelToggle }}>
          <ConnectionList key={0} settings={settings.status} />
        </DevicePopupPanel>);
    };
// cursor: selectedSource && selectedSource.model === settings.status.gen.model ? 'pointer' : 'default'

    let contextMenu;
    let contextMenuJoins;

    if (!window.mobile) {

      let configJoinMenu;      
      let clearJoinMenu;      

      if (isConfig) {

        configJoinMenu = settings.status.gen.type === 'encoder' ?
          (<MenuItem onClick={(e) => {
            this.joinConfigPanelToggle();
            e.stopPropagation();
          }}>
            <span><i className="fa fa-cog" aria-hidden="true"></i>&nbsp;&nbsp;Configure Join</span>
          </MenuItem>)
          :
          undefined;

        clearJoinMenu = settings.status.gen.type === 'decoder' ?
          (<MenuItem onClick={(e) => {
//            this.clearJoins();
//            console.log('disconns', this.deviceSettings.getDisconnects());

            this.joinTwoDevices({ item: this.deviceSettings.getDisconnects() });
            e.stopPropagation();
          }}>
            <span><i className="fa fa-trash" aria-hidden="true"></i>&nbsp;&nbsp;Disconnect Joins</span>
          </MenuItem>)
          :
          (<div />);
      }

      const deviceDetailsMenu =
        (<MenuItem onClick={(e) => {
          this.devicePopupToggle();
          e.stopPropagation();
        }}>
          <span><i className="fa fa-pencil" aria-hidden="true"></i>&nbsp;&nbsp;Device Details</span>
        </MenuItem>);

      contextMenu = (
        <div> 
          <ContextMenu id={this.elemCm}>
            {configJoinMenu}
            {deviceDetailsMenu}
            {/* <MenuItem divider /> */}
          </ContextMenu>
        </div>);

      contextMenuJoins = (
        <div> 
          <ContextMenu id={this.elemCmJoins}>
            {clearJoinMenu}
          </ContextMenu>
        </div>);
    }

    let deviceImageStyle = { 
      marginTop: 10, 
      marginLeft: -5 
    }; 

    let deviceImageDiv = (
      <div style={deviceImageStyle}>
        <DeviceJoinConfig settings={{ ...settings, videoUrl }} showName={false} 
          size={ { width: 50, height: 50 } } />
      </div>
      );

    let joinsDiv = !this.state.showDisplayOrder && settings.status.gen.type === 'decoder' ? 
      (<div className="devModel"><DeviceJoins settings={settings} /></div>) : (<div />);

    if (!window.mobile) {
      
      joinsDiv = (
        <div>
          <ContextMenuTrigger id={this.elemCmJoins} holdToDisplay={1000} disable={dragInfo !== undefined}>
            {joinsDiv}
            {contextMenuJoins}
          </ContextMenuTrigger>
        </div>);

      deviceImageDiv = (
        <div>
          <ContextMenuTrigger id={this.elemCm} holdToDisplay={1000} disable={dragInfo !== undefined}>
            {deviceImageDiv}
            {contextMenu}
          </ContextMenuTrigger>
        </div>);

      if (this.state.showDisplayOrder) {
        const displayOrderStyle = { 
          height: 17, 
          width: 55, 
          borderRadius: 5,
        };

        deviceImageStyle = { 
          ...deviceImageStyle,
          fontSize: 10, 
          width: 50, 
          height: 50, 
          marginTop: 10
        };

        deviceImageDiv = (
          <div style={deviceImageStyle}>
            <div>Display Order:</div>
            <input id={'displayOrder'} style={displayOrderStyle} type="number" onChange={(e) => {
              let val = e.target.value === '' ? -1 : e.target.value; 
              this.setState({ displayOrderIndex: val });
              e.stopPropagation();
            }} 
              value={displayOrderIndex > -1 ? displayOrderIndex : ''} 
              min={displayOrder.min} />
          </div>
        );
      }
    }

    const devModelStyle = { 
      marginTop: -8, 
      marginLeft: -11, 
      fontSize: 12, 
      cursor: 'default',
    };

    const displayOrderTooltip = displayOrder.index > -1 ? `: ${displayOrder.index}` : '';

    let deviceDiv =
      (<div id={this.elemId} style={deviceFrameStyle}
          onClick={this.clickHandler}>
        <Grid style={deviceStyle}>
          <Row>
            <Col xs={1} xsOffset={0}>
              <div style={devModelStyle}>
                <ToolTip placement="right" 
                  tooltip={!this.state.showDisplayOrder ? 
                    `click to show/set display order ${displayOrderTooltip}` : 'click to hide display order'}>
                  <strong id="devModel" className="devModel">{shortModel}</strong>
                </ToolTip>
              </div>
            </Col>
            <Col xs={4} xsOffset={0}>
              {deviceImageDiv}
            </Col>
            <Col xs={2} xsOffset={3}>
              {joinsDiv}
              {/* !this.state.showDisplayOrder ? (<DeviceJoins settings={settings} />) : (<div />) */}
            </Col>
          </Row>
          <Row>
            <ToolTip placement="bottom"
              tooltip={name}>
              <span style={deviceNameStyle}><strong id={this.nameId}>{name}</strong></span>
            </ToolTip>
          </Row>
        </Grid>

        <Overlay show={showDevicePopup} onEnter={this.updatePosition}>
          {deviceProcessedDetails()}
        </Overlay>

        <Overlay show={showDeviceRawPopup} onEnter={this.updatePosition}>
          {deviceRawDetails()}
        </Overlay>

        <Overlay show={showJoinConfigPanel} onEnter={this.updatePosition}>
          {deviceJoinConfigs()}
        </Overlay>
      </div>
    );

    return connectDropTarget(deviceDiv);
  }
}

function mapStateToProps(state, props) {
  const { settings } = props;
  const { selectedSources, selectedDisplays, dragInfo } = state.device;
  const { selectedMultiview } = state.multiview;
  const { token } = state.auth;

  const displayOrder = state.filter.displayOrder && state.filter.displayOrder[settings.status.gen.type] ?
    { ...state.filter.displayOrder[settings.status.gen.type] } : {};

  const displayOrderIndex = displayOrder[settings.status.gen.mac] !== undefined ? 
    displayOrder[settings.status.gen.mac] : -1;

  let displayOrderEdit = false;

  if (state && state.filter &&
    state.filter.displayOrderEdit && state.filter.displayOrderEdit[settings.status.gen.type] && 
    state.filter.displayOrderEdit[settings.status.gen.type] === settings.status.gen.mac) {
    
    displayOrderEdit = true;
//    console.log('displayOrderEdit map', displayOrderEdit);
  }

  const title = settings.status.gen.type === 'encoder' ? 'Sources' : 'Displays';

  const isConfig = token && token.role && token.role.perms && 
      token.role.perms[title] && token.role.perms[title].Configure;

  const isAdmin = token && token.role && token.role.perms && 
      token.role.perms[title] && token.role.perms[title].Admin;

  let selectedIndex = -1;

  if (settings.status.gen.type === 'encoder') {
    selectedIndex = selectedSources.findIndex((dev) => {
//      console.log('dev', settings, dev.config.gen.mac === settings.config.gen.mac);    
      return dev.config.gen.mac === settings.config.gen.mac;
    });
  } else if (settings.status.gen.type === 'decoder') {
    selectedIndex = selectedDisplays.findIndex((dev) => {
  //    console.log('dev', dev, settings, dev.config.gen.mac === settings.config.gen.mac);    
      return dev.config.gen.mac === settings.config.gen.mac;
    });    
  }

//  console.log('selectedIndex', selectedIndex);

  let selectedSource;

  if (settings.status.gen.type === 'encoder') {
    selectedSource = selectedIndex > -1 ? selectedSources[selectedIndex] : undefined;
  } else if (settings.status.gen.type === 'decoder') {
    selectedSource = selectedSources.length === 1 ? selectedSources[0] : undefined;
  } 

//  console.log('selectedSource', selectedSource);

  let selected = false;

  if (settings.status.gen.type === 'encoder') {
    selected = selectedIndex > -1;
  } else if (settings.status.gen.type === 'decoder' && !selectedSource) {
    selected = selectedIndex > -1;
  }

  return {
    displayOrderEdit,
    displayOrder: { index: displayOrderIndex, min: -1 },
    dragInfo,
    selectedMultiview,
    selectedSource,
    selected,
    connectionData: state.connection,
    isConfig,
    isAdmin
  };
}

function mapDispatchToProps(dispatch) {
 return {
      mvActions: bindActionCreators(mvActions, dispatch),
      deviceActions: bindActionCreators(deviceActions, dispatch),
      filterActions: bindActionCreators(filterActions, dispatch)
    };
}

module.exports = _flow(
  dropTarget([DndItemTypes.JOIN, DndItemTypes.MVITEM], deviceDropTarget, collect),
  connect(mapStateToProps, mapDispatchToProps)
)(Device);
