import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Well, Collapse, Button, Overlay, Label }
  from 'react-bootstrap';
// import ReactTable from 'sb-react-table';
import { Row, Col } from 'react-simple-flex-grid';
import SchedCell from './SchedCell';
export default class SchedDay extends Component {

  constructor(props) {
	  super(props);
  	this.state = {};
  }

  render() {
  	
  	return (
  		<div>
				<Row gutter={20}>
					<SchedCell>cel 1</SchedCell>
				</Row>
				<Row gutter={20}>
					<SchedCell>cel 3</SchedCell>
				</Row>			
				<Row gutter={20}>
					<SchedCell>cel 3</SchedCell>
				</Row>			
			</div>
  		);
  }
}