import { Well, Collapse, Button, Overlay, Label, Grid, Row, Col }
  from 'react-bootstrap';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DragSource as dragSource } from 'react-dnd';
import { DndItemTypes } from '../../constant/dndItemTypes';
import _flow from 'lodash/flow';
import { confirm } from '../confirm/service/confirm';
import ToolTip from '../ToolTip';

import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES,
  MENU_ITEM_SEC_PERMS
  } from '../appMenu/constants';

import {
  SEC_TYPE_NAMES,
  capitalize
  } from './constants';

const secItemDragSource = {

  beginDrag: (props, monitor, component) => {
    const { item } = props;
    return { ...item };
  },

  endDrag: (props, monitor, component) => {
    const { item } = props;
  },

  canDrag: (props) => {
    return props.item.secType === MENU_ITEM_SEC_USERS;
  }

};

function collectForDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    canDrag: monitor.canDrag()
  };
}

class SecItem extends Component {

	render() {

		const { settings, item, onSave, onDelete, onShowEditor, canDrag,
      connectDragSource, handlePermChange, roleNames } = this.props;

    let backgroundColor;
    let permsSymbol = 'lock';

    if (item.secType === MENU_ITEM_SEC_PERMS) {
      if (item.Display === true && 
          (item.Configure === true || item.Configure === undefined)) {
        backgroundColor = 'lightgreen';
        permsSymbol = 'unlock fa-flip-horizontal';
      } else if (item.Display === true && item.Configure === false) {
        backgroundColor = '#F0E68C'; // light yellow
        permsSymbol = 'unlock-alt';
      } else if (item.Display === false &&
          (item.Configure === false || item.Configure === undefined)) {
        backgroundColor = 'lightpink';
        permsSymbol = 'lock';
      }
    }

    const compStyle = (color) => {

      return {
        display: 'flex',
        flex: '0 1 auto',
        flexFlow: 'row nowrap',
        borderStyle: 'solid',
        borderWidth: 2,
//        borderColor: appBackgroundColor,
        fontSize: 14,
        color,
        marginLeft: 1,
        marginBottom: 4,
        textAlign: 'left',
  //      backgroundColor: highlight ? '#EADAF3' : itemBackgroundColor,
        borderRadius: 8,
        backgroundColor,

        width: '100%',
        maxHeight: 40,
        minHeight: 40
      };
    };

    const colIconStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      cursor: canDrag ? 'move' : 'default',
//      paddingTop: 7,
//      paddingBottom: 7
    };

    const nameStyle = {
//      display: 'flex',
//      flex: '0 1 auto',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'space-between',
      overflow: 'auto',
//      paddingTop: 7,
//      paddingBottom: 7,
      borderWidth: 2,
      borderColor: 'lightblue',
//      borderStyle: 'solid'

    };

    const colStyle = {
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflow: 'auto',
//      paddingTop: 7,
//      paddingBottom: 7
    };

    let color;
    let sym;
    let secTypeName;
    let nameColWidth = 3;

    switch (item.secType) {
    	case MENU_ITEM_SEC_USERS:
        secTypeName = capitalize(SEC_TYPE_NAMES.user);
	      sym = 'user';
  	    color = 'blue';
  	    break;
    	case MENU_ITEM_SEC_ROLES:
        secTypeName = capitalize(SEC_TYPE_NAMES.role);
	      sym = 'users';
  	    color = 'green';
//        nameColWidth = 5;
  	    break;
  	  default:
        secTypeName = capitalize(SEC_TYPE_NAMES.perm);
	      sym = permsSymbol;
  	    color = 'brown';
  	  	break;
  	 }

     const permStyle = (val) => {
      return {
        textDecoration: val ? 'none' : 'line-through',
        color: val ? 'green' : 'red'
        };
     };


    let contentOffset = 5;
    let content = (<Col xs={nameColWidth} xsOffset={0} style={nameStyle}>
      <span><strong>{item.name}</strong></span>
    </Col>);

    if (item.secType === MENU_ITEM_SEC_USERS) {
      contentOffset = 2;
      let roleNamesDiv;

      if (Array.isArray(roleNames) && roleNames.length > 0) { 
        roleNamesDiv = roleNames.map((roleName, index) => {
          if (index > 0) {
            return (<span key={index}>, {roleName}</span>);
          }
          
          return (<span key={index}>{roleNames.length > 1 ? 'roles' : 'role'}: {roleName}</span>);          
        }); 
      } else if (onShowEditor) {
        roleNamesDiv = (<span>{'role: none'}</span>);
      }
      
      content = (<Col xs={6} xsOffset={0} style={nameStyle}>
        <span><strong>{item.name}</strong></span>
        <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {roleNamesDiv}
        </span>
      </Col>);
    } else if (item.secType === MENU_ITEM_SEC_PERMS) {
      contentOffset = 0;
      content =
      (<Col xs={10} xsOffset={0} style={nameStyle}>
        <span><strong>{item.name}</strong></span>
        {item.Display !== undefined ? (<Button className="btn btn-link" bsSize="small"
          bsStyle={{ backgroundColor }} 
          onClick={(e) => {
            handlePermChange(item.index, 'Display');
          }}>
            <span style={permStyle(item.Display)}>Display</span>
          </Button>) : (<div />)}
        {item.Configure !== undefined ? (<Button className="btn btn-link" bsSize="small"
          bsStyle={{ backgroundColor }} 
          onClick={(e) => {
            handlePermChange(item.index, 'Configure');
          }}>
          <span style={permStyle(item.Configure)}>Configure</span>
          </Button>) : (<div />)}
        {item.Admin !== undefined ? (<Button className="btn btn-link" bsSize="small"
          bsStyle={{ backgroundColor }} 
          onClick={(e) => {
            handlePermChange(item.index, 'Admin');
          }}>
          <span style={permStyle(item.Admin)}>Admin</span>
          </Button>) : (<div />)}
      </Col>);
    }

		return (
      <Row style={compStyle(color)}>
        <Col xs={2} xsOffset={0} style={colIconStyle}>
          {connectDragSource(<span><i className={`fa fa-${sym} fa-lg`} aria-hidden="true" /></span>)}
        </Col>
        {content}
				<Col xs={1} xsOffset={contentOffset} style={colStyle}>
	        <span key={0} style={ { cursor: 'pointer', display: onShowEditor ? 'inherit' : 'none' } } onClick={(e) => {
//	          console.log('edit item clicked!', item);
	          e.preventDefault();
	          onShowEditor(item.secType, true, item);
	        }}><i className="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i></span>
				</Col>
        {item.secType !== MENU_ITEM_SEC_PERMS ?
        (<Col xs={1} xsOffset={0} style={colStyle}>
            <span style={{ cursor: 'pointer', display: onDelete ? 'inherit' : 'none' }} key={2} onClick={(e) => {
              // console.log('edit item clicked!');
              e.preventDefault();
             
              confirm('Are you sure?', {
                description: `Would you like to delete ${secTypeName}, \"${item.name}\"?`,
                confirmLabel: 'Delete',
                abortLabel: 'Cancel'
              }).then(() => {
              	onDelete(item.secType, item);
              });

            }}>
              <i className="fa fa-trash fa-lg" aria-hidden="true">
            </i></span>
        </Col>) : undefined}
      </Row> 
			);
	}

}

function mapStateToProps(state, props) {

  const { item, onShowEditor } = props;

  if (item.secType === MENU_ITEM_SEC_USERS && onShowEditor) {
    const { [MENU_ITEM_SEC_ROLES]: rolesState } = state.sec;
    const rolesList = rolesState.list || [];
    const roleNames = [];

    rolesList.forEach((role) => {

      let index = -1;

      if (role.userIds) {
        index = role.userIds.findIndex((userId) => {
          return userId === item.id;
        });
      }

      if (index > -1) {
        roleNames.push(role.name);
      }

    });

    return {
      roleNames
    };
  }

  return {
  };
}

module.exports = _flow(
  dragSource(DndItemTypes.SECITEM, secItemDragSource, collectForDragSource),
  connect(mapStateToProps)
)(SecItem);
