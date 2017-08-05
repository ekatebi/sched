import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Well, Collapse, Button, Overlay, Label }
  from 'react-bootstrap';
// import ReactTable from 'sb-react-table';
import { Row, Col } from 'react-simple-flex-grid';
import * as schedActionsEx from './actions';

class SchedCell extends Component {

  constructor(props) {
	  super(props);
  	this.state = { over: false };
  }

  render() {
  
  	const { cellId, selected, schedActions } = this.props;
  	const { over } = this.state;
  	const { onReceiveRes } = schedActions;

  	const colStyle = {
  		padding: 3
  	};

  	const spanStyle = {
			display: 'flex', 
			flex: '1 0 auto',
			height: 30,
//			width: 100,
			backgroundColor: selected ? 'blue' : 'lightblue', 
			margin: 'auto',
			justifyContent: 'center',
			alignItems: 'center',
			alignContent: 'center',
			borderRadius: 5,
//			padding: 10

	  		borderWidth: 8,
	      borderColor: 'blue',
	      borderStyle: over && selected ? 'solid' : 'none'
  	};

  	return (
		  <Col style={colStyle} span={this.props.span}		  
				onMouseOver={(e) => {
					this.setState({ over: true });
				}}
				onMouseLeave={(e) => {
					this.setState({ over: false });
				}}
			  onClick={(e) => {
//			  	console.log(courtId, time, this.props.date.format());
						console.log(cellId);
						onReceiveRes(cellId);
			  }}>
			   	<span style={spanStyle}>
			   	{ this.props.children }
		   	</span>
		  </Col>
  		);
  }
}

function mapStateToProps(state, props) {

  const { courtId, time, date } = props;
  const { res } = state.sched;

	const time2 = time ? time.replace(':', '-') : '';
	const date2 = date ? date.format('MM-DD-YYYY') : '';
	const cellId = `${courtId}-${time2}-${date2}`;

	const selected = res && res[cellId];

  return {
    cellId,
    selected
  };

}

function mapDispatchToProps(dispatch) {
 return {
      schedActions: bindActionCreators(schedActionsEx, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SchedCell);
