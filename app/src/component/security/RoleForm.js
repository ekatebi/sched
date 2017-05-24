import { Well, Collapse, form, Button, Checkbox, fieldset,
  ButtonToolbar, ControlLabel, FormControl } 
  from 'react-bootstrap';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as actions from './actions';
import SecListDropTarget from './SecListDropTarget';

import {
  SEC_TYPE_NAMES,
  getDefaultPerms,
  } from './constants';

import {
  MENU_ITEM_SEC_USERS,
  MENU_ITEM_SEC_ROLES,
  MENU_ITEM_SEC_PERMS
  } from '../appMenu/constants';

class RoleForm extends Component {

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handlePermChange = this.handlePermChange.bind(this);
    this.state = { selectedTabIndex: 0 };
  }

	handleSelect(index, last) {
//    console.log('Selected tab: ', index, 'Last tab: ', last);
    this.setState({ selectedTabIndex: index });
  }

  handlePermChange(index, name) {
    const { secType, item, itemChanged } = this.props;
    const perms = item.perms || getDefaultPerms();
    const perm = perms[index];

    perm[name] = !perm[name];

    if (name === 'Display' && !perm[name]) {
      if (perm.Configure !== undefined) {
        perm.Configure = false;
      }
      if (perm.Admin !== undefined) {        
        perm.Admin = false;
      }
    } else if ((name === 'Configure' || name === 'Admin') && perm[name]) {
    	perm.Display = true;    	
    }

    perms[index] = perm;

	  itemChanged(secType, { ...item, perms: [...perms] });
  }

	render() {

		const { secType, item, itemChanged } = this.props;

		const compStyle = {
			display: 'flex',
			flex: '1',
//      borderWidth: 2,
//      borderColor: 'lightgreen',
//      borderStyle: 'solid',
		};

		const tabPanelStyle = {
			display: 'flex',
			flex: '1',
//      borderWidth: 2,
//      borderColor: 'lightgreen',
//      borderStyle: 'solid',
		};

	const genStyle = {
      display: 'block',
      textAlign: 'left',
      flex: '1',
//      width: '100%',
      flexFlow: 'column nowrap',
      justifyContent: 'space-around',
      alignItems: 'flex-start',

      overflow: 'auto',
      
//      borderWidth: 2,
//      borderColor: 'lightgreen',
//      borderStyle: 'solid',
//      marginTop: 20,
//      minWidth: 455,
//			width: '100%'
		};

		return (
			<div style={compStyle}>
				<Tabs
	        onSelect={this.handleSelect}
  	      selectedIndex={this.state.selectedTabIndex}>
  	      <TabList>
  	      	<Tab>General</Tab>
						<Tab>Users</Tab>
	          <Tab>Permissions</Tab>
  	      </TabList>
  	      <TabPanel>
  	      	<Well style={genStyle}>
	            <ControlLabel>Role Name</ControlLabel>
	            <FormControl className="input-sm" style={{ width: '100%' }}
	              type="text"
	              value={item.name}
	              autoFocus
	              placeholder=""
	              onChange={(e) => {
	              	itemChanged(secType, { ...item, name: e.target.value });
	              }} />  	      		
  	      	</Well>
        	</TabPanel>
					<TabPanel>
						<Well style={tabPanelStyle}>						
		          <SecListDropTarget userIds={item.userIds || []} secType={MENU_ITEM_SEC_USERS} 
		            onAdd={(user) => {
//		            	console.log('onAdd', secType, item, user.id);

		              itemChanged(secType, { ...item, userIds: item.userIds ? 
		              	[...item.userIds, user.id] : [...[], user.id] });

		            }}	
		            onDelete={(userSecType, user) => {
		            	const userIds = [];
		            	
		            	item.userIds.forEach((id) => {
		            		if (id !== user.id) {
		            			userIds.push(id);
		            		}
		            	});
		              
		              itemChanged(secType, { ...item, userIds: [...userIds] });
		            }} />									
						</Well>
        	</TabPanel>
					<TabPanel>
						<Well style={tabPanelStyle}>
		          <SecListDropTarget list={item.perms} secType={MENU_ITEM_SEC_PERMS} 
		          	handlePermChange={this.handlePermChange} />									
						</Well>
        	</TabPanel>
  	    </Tabs>
			</div>
			);
	}
}

function mapStateToProps(state, props) {

  const { id } = props.settings;
  const { [id]: subState } = state.sec;

  const item = subState.item.data;

  return {
    secType: id,
    item
  };

}

function mapDispatchToProps(dispatch) {
 return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RoleForm);
