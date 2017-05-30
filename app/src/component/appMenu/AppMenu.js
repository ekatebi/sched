import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { scaleRotate as Menu } from 'react-burger-menu';
import { appName, appVersion as appVer } from '../../constant/app';
import { SEC } from '../security/constants';
import * as actions from './actions';
import { confirm } from '../confirm/service/confirm';
import {
  MENU_ITEM_SEC,
  MENU_ITEM_ZONES,
  menuItems,
  } from './constants';

class AppMenu extends Component {

  constructor(props) {
    super(props);
    this.state = { beenReset: false };
  }

//  componentDidUpdate(prevProps, prevState) {
  componentWillMount() {
    const { menu, onResetMenuItems } = this.props;
    const { beenReset } = this.state;
    
    const appVersion = localStorage.getItem('appVersion');

    if (appVer && Number(appVersion) !== appVer) {

      console.log('componentWillMount',
        isNaN(Number(appVersion)) ? 1.4 : Number(appVersion), 
        isNaN(appVer) ? 1.4 : appVer); 
      onResetMenuItems();
      this.setState({ beenReset: true });
      this.forceUpdate();
    }
  }

  render() {

    const { items, onToggleItem, selectedCount, maxSelectedCount } = this.props;

    const topStyle = {
//      display: 'flex',
//      flex: '1',
//      flexFlow: 'column nowrap',
    };

    const itemsStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',
    };

    const itemStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row nowrap',
      cursor: 'pointer',
      alignItems: 'center',
      fontSize: 16
    };

    const titleStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row nowrap',
      marginLeft: 40,
      justifyContent: 'center'
    };

    const titleTextStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row nowrap',
      textAlign: 'center'
    };

    const titleXStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'row wrap',
      alignSelf: 'center'
    };

    const gapStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',
      minHeight: '3em'
    };

    const gap2Style = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',
      minHeight: '1em'
    };

    const selectedDiv = (isSelected) => {
      if (isSelected) {
        return (<i className="fa fa-fw fa-circle"></i>);
      }
        
      return (<i className="fa fa-fw fa-circle-o"></i>);      
    };

    const itemsDiv = items.map((item, index) => {
      
//      console.log('app menu', item, index);

      return (
          <a key={index} style={itemStyle}
            onClick={(e) => {
              if (selectedCount < maxSelectedCount || item.isSelected) {
                onToggleItem(item.id);
              } else {
                confirm(`Maximum open panel count (${maxSelectedCount}) has been reached.`, {
                  description: 'Please close any other panel before opening this one.',
                }).then(() => {
                }).catch(() => {});            
              }
            }}>
            {selectedDiv(item.isSelected)}
            <span>{item.title}</span>
          </a>
        );
    });

    const appImagePath = 'src/images/MaestroZLogoWhite.png';
    
    const appImageStyle = {
//      position: 'relative',
      borderWidth: '2px',
      borderColor: 'gray',
  //      borderStyle: isDragging ? 'solid' : 'none',
      cursor: 'pointer',
      marginLeft: 10,
      marginTop: 8,
      marginRight: 30,
    };

    return (
      <div style={topStyle}>
        <Menu pageWrapId={'page-wrap'} outerContainerId={'outer-container'} width={250}>
          <div style={itemsStyle}>
            <div style={gapStyle}> </div>              
              <img src={appImagePath} alt={'ZV Logo'}
                height={50} width={210}
                className="nonDraggableImage" 
                style={appImageStyle} />
            <div style={gap2Style}> </div>

            <div style={itemsStyle}>
              {itemsDiv}
            </div>
          </div>        
        </Menu>
      </div>
    );
  }
}

function deselect(item, token) {
  
//  console.log('deselect item', item);

  if (token && token.role && token.role.perms && 
      token.role.perms[item.title] && token.role.perms[item.title].Display) {
    return item.isSelected;
  }

  return false;
}

function mapStateToProps(state) {

  const { menu, maxSelectedCount } = state.appMenu;
  
  const { token } = state.auth;

  let selectedCount = 0;

  const items = Object.keys(menu).map((key) => {
    selectedCount += menu[key].isSelected ? 1 : 0; 
    return {
      isSelected: deselect(menu[key], token),
//      isSelected: menu[key].isSelected, // menu[key].index > -1, // bool
      id: key,
      title: menu[key].title      
    };
  })
  .filter((item) => {

    if ((item.title === 'Users' || item.title === 'Roles') && !window.sec) {
      return false;
    }
    
    return token && token.role && token.role.perms && 
      token.role.perms[item.title] && token.role.perms[item.title].Display;
    });

//  console.log('appMenu mapStateToProps items', items);

  return {
    maxSelectedCount,
    selectedCount,
    items,
    menu
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu);

