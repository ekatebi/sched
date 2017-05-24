import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { ZoneTreeNode } from '../ZoneTreeNode';
import { parentIdKey } from '../constants';

function mapStateToProps(state, props) {
  const { data } = props;
  const { listObject, selected, uncollapsed, editorShowing } = state.zone;

  const list = Object.keys(listObject).filter((key) => {
    return listObject[key][parentIdKey] === data.id;
  }).map((key) => {
    return listObject[key];
  });

  return {
    editorShowing,
    selected,
    listObject,
    uncollapsed,
    list
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoneTreeNode);
