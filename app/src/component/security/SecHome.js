import { Well, Collapse, Button, Overlay, Label, Grid, Row, Col }
  from 'react-bootstrap';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Loader from 'react-loader';
import _flow from 'lodash/flow';
import Panel from '../Panel';
import * as actions from './actions';
import SecEditor from './SecEditor';
import SecList from './SecList';
import AddOrEditSecItem from './AddOrEditSecItem';
import AddItem from '../AddItem';

import {
    REQUEST_LIST,
    RECEIVE_LIST,
    REQUEST_TOKEN,
    RECEIVE_TOKEN,
    capitalize
  } from './constants';

class SecHome extends Component {

  componentWillMount() {
    const { secType, onRequestList, onSave } = this.props;
    onRequestList(secType);
  }

	render() {

    const { settings, style, fetching, list, showEditorDiv, secTypeName, onShowEditor, secType } = this.props;
    const filterVar = showEditorDiv ? undefined : { status: false, filterFor: 'filter for name' };

//    console.log('secTypeName', secTypeName);

   const compStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',
//      overflow: 'auto',

//      borderWidth: 2,
//      borderColor: 'blue',
//      borderStyle: 'solid'
    };

   const listStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',
//      overflow: 'auto',

//      marginTop: 15,

      borderWidth: 2,
      borderColor: 'lightgreen',
//      borderStyle: 'solid'
    };

   const editorStyle = {
      display: 'flex',
      flex: '1',
      flexFlow: 'column nowrap',

      borderWidth: 2,
      borderColor: 'lightgreen',
//      borderStyle: 'solid'
    };

    let content;

//    console.log('showEditorDiv', showEditorDiv);

    if (showEditorDiv) {
      content = (<SecEditor settings={settings} />);
    } else {
      content = (
        <div style={compStyle}>
          <AddItem tooltip={`Add ${secTypeName}`} onClick={(e) => {
                  onShowEditor(secType, true);
                  e.stopPropagation();
                 }} />
          <div style={listStyle}>
            <SecList settings={settings} />
          </div>
        </div>); 
    }

    return (
      <Panel settings={ { ...settings, filter: filterVar } } loaded={!fetching} style={style} >
        <div style={compStyle}>
          {content}
        </div>
      </Panel>
    );

	}

}

function mapStateToProps(state, props) {

//  console.log('mapStateToProps', props);

  const { id } = props.settings;
  const { [id]: subState } = state.sec;

//  console.log('mapStateToProps', subState);

  return {
    secType: id,
    secTypeName: capitalize(subState.name),
  	fetching: subState.fetching,
    list: subState.list,
    showEditorDiv: subState.item && subState.item.data && subState.item.show,
    filter: state.filter[id]
  };

}

function mapDispatchToProps(dispatch) {
 return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SecHome);

