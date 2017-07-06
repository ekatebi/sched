import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Well, Collapse, Button, Overlay, Label }
  from 'react-bootstrap';
// import ReactTable from 'sb-react-table';
import { Row, Col } from 'react-simple-flex-grid';
import SchedCell from './SchedCell';
import * as schedActionsEx from './actions';

class SchedDay extends Component {

  constructor(props) {
	  super(props);
    this.clickHandler = this.clickHandler.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
  	this.state = { overCellId: undefined, overRow: -1, overCol: -1 };
  }

  clickHandler(e) {
  	console.log('clickHandler', e.target.id);
  }

	handleMouseOver(e, row, col) {
//  	console.log(e.target.id, row, col);
//  	this.setState({ overCellId: e.target.id, overRow: row, overCol: col });
  	this.setState({ overRow: row, overCol: col });
	}

  render() {

  	const { date } = this.props;

  	const gridHeaderData = [
  		{ id: 'time', text: 'Time' },
  		{ id: 'court-1', text: 'Court 1' },
  		{ id: 'court-2', text: 'Court 2' },
//  		{ id: 'court-3', text: 'Court 3' },
  	];

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
	    	this.state.overCol > 0 && outer) {
				style = { ...style, 
					flex: '1 0 auto',
					height: 30, 
					justifyContent: 'center', backgroundColor: 'yellow' };
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

  	const headerStyle = {
			display: 'flex', 
			flex: '1 0 auto',
			height: 30,
			width: 60,
			justifyContent: 'center',
			alignItems: 'center',

	  	borderWidth: 2,
	    borderColor: 'pink',
//	  borderStyle: 'solid',
		};

  	const gridHeader = gridHeaderData.map((head, index) => {
  		return (
					<SchedCell span={index > 0 ? 3 : 2} key={index}>
						<span style={headerStyle}>{head.text}</span>
					</SchedCell>
  			);
  	});

  	const rows = [];

  	const formaHalftHourRow = (row, hour, top = true) => {

  		const cells = [];

			gridHeaderData.forEach((head, index) => {	

				const id = `${head.id}-${hour}:${top ? '00' : '30'}`;
				const courtId = head.id;
				const time = `${hour}:${top ? '00' : '30'}`;

				let content = (
					<span style={contentStyle}>
						<i className="fa fa-circle-o" aria-hidden="true"></i>
						<i className="fa fa-circle-o" aria-hidden="true"></i>
						<i className="fa fa-circle-o" aria-hidden="true"></i>
					</span>
					);

  			const timeCell = (
	  			<span style={{ paddingRight: 10 }}>
	  					{`${top ? (hour < 13 ? hour : hour - 12).toString() : ''}:${top ? '00' : '30'} ${hour < 12 ? 'AM' : 'PM'}`}
	  			</span>);

  			const cellText = index > 0 ? content : timeCell;

		  	cells.push(
						<SchedCell span={index > 0 ? 3 : 2} key={hour * 10 + index} 
							courtId={courtId} time={time} date={date}>
							<span style={textStyle(index, row, true)}>
								<span style={textStyle(index, row)} id={id} 
									onMouseOver={(e) => {
										this.setState({ overRow: row, overCol: index });
									}}
									onMouseLeave={(e) => {
										this.setState({ overRow: -1, overCol: -1 });
									}}
									>
									{cellText}
								</span>
							</span>
						</SchedCell>
		  		);
			});

			rows.push(
				<div key={rows.length}>
					<Row key={hour * 100 + rows.length}>
						{cells}
					</Row>
				</div>
				);
  	};

  	let row = -1;

  	for (let hour = 6; hour <= 21; hour++) {
  		formaHalftHourRow(row++, hour);
  		formaHalftHourRow(row++, hour, false);
		}

		const compStyle = {
			display: 'flex',
			flex: '1',
			flexFlow: 'column nowrap',
//			overflow: 'auto',
	  	borderWidth: 4,
	    borderColor: 'blue',
//	    borderStyle: 'solid'
		};

		const headStyle = {
			display: 'flex',
//			flex: '0',
			flexFlow: 'column nowrap',

			overflowY: 'scroll',
	  	borderWidth: 2,
	    borderColor: 'black',
//	    borderStyle: 'solid'
		};
// 				onMouseOver={(e) => { this.handleMouseOver(e, -1, -1); }}

		const bodyStyle = {
			display: 'flex',
			flex: '1',
			flexFlow: 'column nowrap',
//      height: '100%',
			
			overflowY: 'scroll',
	  	borderWidth: 4,
	    borderColor: 'red',
//	    borderStyle: 'solid',
//	    backgroundColor: 'lightgreen'
		};

		const innerStyle = {
			display: 'flex',
			flex: '0 0 auto',
			flexFlow: 'column nowrap',

//			height: 300,
//			overflowY: 'scroll',
	  	borderWidth: 2,
	    borderColor: 'black',
//	    borderStyle: 'solid',
//	    backgroundColor: 'pink'
		};

  	return (
  		<div style={compStyle} id={'grid-comp'}>
		 		<div style={headStyle} id={'grid-head'}>
	  			<Row>{gridHeader}</Row>
	  		</div>
	  		<div style={bodyStyle} id={'grid-outer'}>
 		  		<div style={innerStyle} id={'grid'}>
				  	{rows}
					</div>
				</div>
			</div>
  		);
  }
}


function mapStateToProps(state, props) {

  const { date } = state.sched;

  return {
    date,
  };

}

function mapDispatchToProps(dispatch) {
 return {
      schedActions: bindActionCreators(schedActionsEx, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SchedDay);
