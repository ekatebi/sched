import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Well, Collapse, Button, Overlay, Label }
  from 'react-bootstrap';
// import ReactTable from 'sb-react-table';
import { Row, Col } from 'react-simple-flex-grid';

export default class SchedCell extends Component {

  constructor(props) {
	  super(props);
  	this.state = {};
  }

  render() {
  
  	const colStyle = {
  		padding: 3
  	};

  	const spanStyle = {
			display: 'flex', 
			flex: '1 0 auto',
			height: 30,
//			width: 100,
			backgroundColor: 'lightblue', 
			margin: 'auto',
			justifyContent: 'center',
			alignItems: 'center',
			alignContent: 'center',
			borderRadius: 5,
//			padding: 10

	  		borderWidth: 2,
	      borderColor: 'red',
//	      borderStyle: 'solid',

  	};

  	return (
			  <Col style={colStyle} span={this.props.span}>
			   	<span style={spanStyle}>
				   	{ this.props.children }
			   	</span>
			   </Col>
  		);
  }
}