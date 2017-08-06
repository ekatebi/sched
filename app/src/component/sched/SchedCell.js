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
  	this.state = { over: false, overRow: -1, overCol: -1 };
  }

  render() {
  
  	const { cellId, selected, schedActions, col, row, hour, top, id, header } = this.props;
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
			backgroundColor: 'lightblue', 
			margin: 'auto',
			justifyContent: 'center',
			alignItems: 'center',
			alignContent: 'center',
			borderRadius: 5,
//			padding: 10

	  		borderWidth: 8,
	      borderColor: 'blue',
//	      borderStyle: over && selected ? 'solid' : 'none'
  	};

  	const textStyle = (col, row, outer = false) => {

  		let style = {
				display: 'flex', 
//				flex: '1',
				justifyContent: col === 0 && !outer ? 'flex-end' : 'center',
				alignItems: 'center',

	  		textAlign: 'left',
				cursor: 'default',

	  		width: col > 0 ? 30 : 80,
	  		borderWidth: 2,
	      borderColor: 'green',
//	      borderStyle: 'solid'
	    };

	    if (row === this.state.overRow && 
	    	(col === 0 || col === this.state.overCol) && 
	    	this.state.overCol > 0 && outer && !selected) {
				style = { ...style, 
					flex: '1 0 auto',
					height: 30, 
					justifyContent: 'center', 
					backgroundColor: 'yellow' };
	    }

	    style = col > 0 ? { ...style, flex: '1' } : style;

	    return style;
  	};

  	const contentStyle = {
			display: 'flex', 
			flex: '0 0 auto',
			flexFlow: 'row nowrap',
			height: 30,
			width: 45,
			justifyContent: 'space-between',
			alignItems: 'center',

	  	borderWidth: 2,
	    borderColor: 'red',
//	    borderStyle: 'solid',
		};

	const circle = selected ? 'fa fa-circle' : 'fa fa-circle-o';

	let content = (
		<span style={contentStyle}>
			<i className={circle} aria-hidden="true"></i>
			<i className={circle} aria-hidden="true"></i>
			<i className={circle} aria-hidden="true"></i>
		</span>
		);

		const timeCell = (
			<span style={{ paddingRight: 10 }}>
				{`${top ? (hour < 13 ? hour : hour - 12).toString() : ''}:${top ? '00' : '30'} ${hour < 12 ? 'AM' : 'PM'}`}
			</span>);

  	const cellText = col > 0 ? content : timeCell;

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
						if (col > 0) {
							onReceiveRes(cellId);
						}
			  }}>
			  <span style={spanStyle}>
			   	{header ? this.props.children :

					(<span style={textStyle(col, row, true)}>
						<span style={textStyle(col, row)} id={id} 
							onMouseOver={(e) => {
								this.setState({ overRow: row, overCol: col });
							}}
							onMouseLeave={(e) => {
								this.setState({ overRow: -1, overCol: -1 });
							}}
							>
							{cellText}
						</span>
					</span>)}

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
