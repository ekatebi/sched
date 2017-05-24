/* eslint no-console: 0 */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Button, Overlay, Label, Grid, Row, Col, Well,
  Form, ControlLabel, FormControl, fieldset } from 'react-bootstrap';
import { fetchServer } from '../../service/apiFetch/server';
import { GET } from '../../constant/app'; 
export default class Status extends Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.getStatus = this.getStatus.bind(this);
    this.state = { data: null, error: null };
  }

  componentWillMount() {
    // console.log('In Status componentWillMount()');
    this.getStatus();
  }

  getStatus() {
    // console.log('In Status getStatus() 1');
    fetchServer(GET, { getType: 'status' })
    .then(resp => resp.json())
    .catch((error) => {
      appAlert.error('Unable to get server status.', { error });    
    })
    .then(json => {
      // console.log('In Status getStatus() 2:', json);
      if (json.status === 'Success') {
        // console.log('**********************************************************************');
        // console.log('In Status getStatus() 3 setState():', json);
        // console.log('**********************************************************************');
        this.setState({ data: json.responses[0].text });
      } else {
        appAlert.error('Unable to get server status', { error: json.status });
      }
    })
    .catch(error => {
      appAlert.error('Unable to get server status', { error });
    });
  }

  render() {
    // console.log('In Status render()');
    const { data } = this.state;

    const legendStyle = {
      padding: '0.2em 0.5em',
      border: '1px solid green',
      color: 'green',
      fontSize: '90%',
      textAlign: 'right'
      };

    const staticStyle = {
      textAlign: 'left',
    };

    const serverStatus = () => {
      // console.log('In Status serverStatus()');
      if (data === undefined || data === null) {
        const serverStatusEmpty = (
          <div></div>
        );
        return serverStatusEmpty;
      }
      const serverStatusProcessedx = (
        <div>
          <h4>Status</h4>
          <pre>
            Host Name: {data.gen.hostname} <br />
            IP: {data.gen.ip} <br />
            MAC: {data.gen.macAddress} <br />
            Version: {data.gen.version} <br />
            Serial Number: {data.gen.serialNumber} <br />
            Uptime: {data.gen.uptime} <br />
            Free Memory: {data.gen.freeMem} <br />
          </pre>
        </div>
      );

      const serverStatusProcessed = (
        <div style={ { width: 320 } }>
          <h4>Status</h4>
          <Well>
            <Row>
              <Col sm={5}>
                <ControlLabel>Host Name:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.hostname || 'none'}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>IP:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.ip}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>MAC:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.macAddress}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>Version:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.version}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>Serial Number:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.serialNumber}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>Uptime:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.uptime}</FormControl.Static>
              </Col>
            </Row>
            <Row>
              <Col sm={5}>
                <ControlLabel>Free Memory:</ControlLabel>
              </Col>
              <Col sm={7}>
                <FormControl.Static style={staticStyle}>{data.gen.freeMem}</FormControl.Static>
              </Col>
            </Row>
          </Well>
        </div>
      );

      return serverStatusProcessed;
    };

    return (
      <Form horizontal>
        {serverStatus()}
      </Form>
    );
  }
}
