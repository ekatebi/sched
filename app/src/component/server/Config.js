/* eslint no-console: 0 */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Button, Radio, Overlay, Label, Grid, Row, Col,
  form, fieldset, Well, ControlLabel } from 'react-bootstrap';
import Panel from '../Panel';
import { fetchServer, fetchUpdateServer } from '../../service/apiFetch/server';
import Dropzone from 'react-dropzone';
import {
  GET,
  SET,
  ACTION,
  CONFIG,
  EDID,
  IGMP,
  RESTART,
  REBOOT,
  SHUTDOWN,
  TROUBLE,
  backEndHost
} from '../../constant/app';
import { confirm } from '../confirm/service/confirm';
import { getHeartbeat } from './Heartbeat';

export default class Config extends Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.getConfig = this.getConfig.bind(this);
    this.setConfigEdid = this.setConfigEdid.bind(this);
    this.setConfigIgmp = this.setConfigIgmp.bind(this);
    this.setConfigAction = this.setConfigAction.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onUpdateServer = this.onUpdateServer.bind(this);
    this.state = { data: null, error: null };
  }

  componentWillMount() {
    // console.log('In Config componentWillMount()');
    this.getConfig();
  }

  getConfig() {
    // console.log('In Config getConfig() 1');
    fetchServer(GET, { getType: CONFIG })
    .then(resp => resp.json())
    .catch((error) => {
      appAlert.error('Unable to contact server', error);
    })
    .then(json => {
      if (json.responses[0].errors.length === 0) {
//        console.log('In Config getConfig() 3 setState():', json);
        this.setState({ data: json.responses[0].text });
      } else {
        appAlert.error(`Failed to get server config info, ${json.responses[0].errors.join(', ')}`);
      }
    })
    .catch(error => {
      appAlert.error('Failed to get server config information', error);
    });
  }

  setConfigEdid(edid) {
    // console.log('In Config setConfigEdid() 1');
    fetchServer(SET, { setType: EDID, edid })
    .then(resp => resp.json())
    .catch((err) => {
      appAlert.error(err);
    })
    .then(json => {
      if (json.responses[0].errors.length === 0) {
        appAlert.success(`EDID mode set to ${edid}`);
        this.getConfig();
      } else {
        appAlert.error(`Failed to set EDID mode, ${json.responses[0].errors.join(', ')}`);
        // Also, get information from the device and display it in the GUI.
        this.getConfig();
      }
    })
    .catch(error => {
      appAlert.error('Failed to set EDID mode.', error);
      // Also, get information from the device and display it in the GUI.
      this.getConfig();
    });
  }

  setConfigIgmp(igmp) {
    // console.log('In Config setConfigIgmp() 1');
    fetchServer(SET, { setType: IGMP, igmp })
    .then(resp => resp.json())
    .catch((err) => {
      appAlert.error(err);
    })
    .then(json => {
      if (json.responses[0].errors.length === 0) {
        appAlert.success(`IGMP Querier Mode set to ${igmp}`);
        this.getConfig();
      } else {
        appAlert.error(`Failed to set IGMP Querier Mode, ${json.responses[0].errors.join(', ')}`);
        // Also, get information from the device and display it in the GUI.
        this.getConfig();
      }
    })
    .catch(error => {
      appAlert.error('Failed to set IGMP Querier Mode', error);
      // Also, get information from the device and display it in the GUI.
      this.getConfig();
    });
  }

  setConfigAction(action) {
    const fullMessage = {
      [RESTART]: {
        success: 'Successfully sent command to Restart server.',
        error: 'Failed to send command to Restart server.'
      },
      [REBOOT]: {
        success: 'Successfully sent command to Reboot server.',
        error: 'Failed to send command to Reboot server.'
      },
      [SHUTDOWN]: {
        success: 'Successfully sent command to Shutdown server.',
        error: 'Failed to send command to Shutdown server.'
      },
      [TROUBLE]: {
        success: 'Successfully sent command to create Trouble Report.',
        error: 'Failed to send command to create Trouble Report.'
      }
    };

    // console.log('In Config setConfigAction() 1');
    fetchServer(ACTION, { action })
    .then(resp => resp.json())
    .catch((error) => {
      appAlert.error('Failed to contact server.', error);
    })
    .then(json => {
      // console.log('In Config setConfigAction() 2:', json);
      if (json.responses[0].errors.length === 0) {
        // console.log('In Config setConfigAction() 3 success:');
        appAlert.success(fullMessage[action].success);
      } else {
        appAlert.error(`${fullMessage[action].error}, ${json.responses[0].errors.join(', ')}`);
        // Also, get information from the device and display it in the GUI.
        this.getConfig();
      }
    })
    .catch(error => {
      appAlert.error(fullMessage[action].error, error);
      // Also, get information from the device and display it in the GUI.
      this.getConfig();
    });
  }

  onDrop(acceptedFiles) {
    this.setState({
      files: acceptedFiles
    });
  }

  onUpdateServer() {
    this.state.files.forEach((file) => {
      appAlert.success(`Update server software ${file.name}`);
      appAlert.info('File transfer started.');
      fetchUpdateServer(file)
      .then(() => {
        // This starts when the file has been completely sent to the MP.
        appAlert.info('File transfer completed.');
        appAlert.info('Server will reboot now');
        // Sometimes the server goes down and up so quickly,
        // that the long polling loop does not detect that the
        // server has gone down and up.
        // This insures that the browser is refreshed after
        // a server software update.
        setTimeout(() => {
          getHeartbeat();
        }, 10000);
      });

    });
  }

  render() {
    // console.log('In Config render()');
    const { isConfig, isAdmin } = this.props;
    const { data } = this.state;

    // console.log('In Config serverConfig()', data.gen);
    // TODO - move hardcoded values to constants.
    if (!data) {
      return (<div>No server data available at this time</div>);
    }

    const dropzoneStyle = {
      width: '200px',
      height: '200px',
      borderWidth: '2px',
      borderColor: 'gray',
      borderStyle: 'dashed',
      borderRadius: '5px',
      margin: 'auto',
    };

    return (
      <div style={ { width: 320 } }>
        {isConfig ?
          (<div>
            <h4>Config</h4>
            <Well>
              <ControlLabel>EDID Mode</ControlLabel>
              <Well>
                <Radio
                  value="enabled"
                  checked={data.gen.autoEdidMode === 'enabled'}
                  onChange= {(e) => {
                    e.preventDefault();
                    confirm('Are you sure?', {
                      description: 'Would you like to enable EDID mode?',
                      confirmLabel: 'Enable EDID',
                      abortLabel: 'Cancel'
                    }).then(() => {
                      this.setConfigEdid('enabled');
                    }).catch((evt) => {
      //                  console.log('cancel restart');
                    });
                  }}
                >Enabled</Radio>
                <Radio
                  value="disabled"
                  checked={data.gen.autoEdidMode === 'disabled'}
                  onChange= {(e) => {
                    e.preventDefault();
                    confirm('Are you sure?', {
                      description: 'Would you like to disable EDID mode?',
                      confirmLabel: 'Disable EDID',
                      abortLabel: 'Cancel'
                    }).then(() => {
                      this.setConfigEdid('disabled');
                    }).catch((evt) => {
      //                  console.log('cancel restart');
                    });
                  }}
                >Disabled</Radio>
              </Well>

              {
              /* The GUI does not turn IGMP on and off for now. May return in advanced controls.
              <ControlLabel>IGMP Querier Mode</ControlLabel>
              <Well>
                <Radio
                  value="enabled"
                  checked={data.gen.igmpQuerierMode === 'enabled'}
                  onChange= {(e) => {
                    e.preventDefault();
                    confirm('Are you sure?', {
                      description: 'Would you like to enable IGMP Querier mode?',
                      confirmLabel: 'Enable IGMP',
                      abortLabel: 'Cancel'
                    }).then(() => {
                      this.setConfigIgmp('enabled');
                    }).catch((evt) => {
                    });
                  }}
                >Enabled</Radio>
                <Radio
                  value="disabled"
                  checked={data.gen.igmpQuerierMode === 'disabled'}
                  onChange= {(e) => {
                    e.preventDefault();
                    confirm('Are you sure?', {
                      description: 'Would you like to disable IGMP Querier mode?',
                      confirmLabel: 'Disable IGMP',
                      abortLabel: 'Cancel'
                    }).then(() => {
                      this.setConfigIgmp('disabled');
                    }).catch((evt) => {
                    });
                  }}
                >Disabled</Radio>
              </Well>
              */
              }

              <Button style={ { width: 160 } }
                onClick= {(e) => {
                  e.preventDefault();
                  confirm('Are you sure?', {
                    description: 'Would you like to restart the server?',
                    confirmLabel: 'Restart',
                    abortLabel: 'Cancel'
                  }).then(() => {
                    this.setConfigAction('restart');
                  }).catch((evt) => {
  //                    console.log('cancel restart');
                  });
                }}>Restart
              </Button>

              <br />
              <br />
              <Button style={ { width: 160 } }
                onClick= {(e) => {
                  e.preventDefault();
                  confirm('Are you sure?', {
                    description: 'Would you like to reboot the server?',
                    confirmLabel: 'Reboot',
                    abortLabel: 'Cancel'
                  }).then(() => {
                    this.setConfigAction('reboot');
                  }).catch((evt) => {
  //                  console.log('cancel reboot');
                  });
                }}>Reboot
              </Button>

              <br />
              <br />
              <Button style={ { width: 160 } }
                onClick= {(e) => {
                  e.preventDefault();
                  confirm('Are you sure?', {
                    description: 'Would you like to shut down the server?',
                    confirmLabel: 'Shutdown',
                    abortLabel: 'Cancel'
                  }).then(() => {
                    this.setConfigAction('shutdown');
                  }).catch((evt) => {
  //                  console.log('cancel shutdown');
                  });
                }}>Shut Down
              </Button>

              <br />
              <br />
              <Button style={ { width: 160 } }
                onClick= {(e) => {
                  e.preventDefault();
                  confirm('Are you sure?', {
                    description: 'Would you like to create and download trouble report?',
                    confirmLabel: 'Create and Download',
                    abortLabel: 'Cancel'
                  }).then(() => {
                    this.setConfigAction('trouble');
                  }).then(() => {
                    // Wait and then download the trouble report to the user's PC.
                    setTimeout(() => {
                      window.location.assign(`ftp://${backEndHost}/files/trouble_report.tgz`);
                    }, 5000);
                  }).catch((evt) => {
  //                  console.log('cancel trouble report');
                  });
                }}>Trouble Report
              </Button>
            </Well>
          </div>) : (<div />)}
        {isAdmin ?
          (<div>
            <ControlLabel>Update Server Software</ControlLabel>
            <Well>

              <div>
                <Dropzone multiple={false} onDrop={this.onDrop} style={dropzoneStyle}>
                  <div><br />Drop file here,<br />
                  or click here to select file.</div>
                </Dropzone>
                {this.state.files && this.state.files.length > 0 ?
                  <div>
                    <br />
                    Selected file
                    <div>
                      {this.state.files.map((file) => file.name)}
                    </div>
                  </div> :
                  <div>
                    <br />
                  </div>
                }
                <br />
                <Button style={ { width: 160 } }
                  onClick= {(e) => {
                    e.preventDefault();
                    confirm('Are you sure?', {
                      description: `Would you like to update the server software ${this.state.files.map((file) => file.name)}?`,
                      descriptionMore: 'Please note that updating will reboot the server.',
                      confirmLabel: 'Update',
                      abortLabel: 'Cancel'
                    }).then(() => {
                      this.onUpdateServer();
                    }).catch((evt) => {
  //                    console.log('cancel update server');
                    });
                  }}>Update Server
                </Button>
                <br />

              </div>

            </Well>
          </div>) : (<div />)}
      </div>
    );
  }
}
