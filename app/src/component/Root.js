import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext as dragDropContext } from 'react-dnd';
import MediaQuery from 'react-responsive';

import classNames from 'classnames';
import Themes from './Themes';
import { appName } from '../constant/app';

class Root extends Component {

  static propTypes = {
    children: PropTypes.element
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const { query } = this.props.location;

    window.help = typeof(query.help) === 'object' || query.help === 'true';

    window.diag = typeof(query.diag) === 'object' || query.diag === 'true';

    window.sec = typeof(query.sec) === 'object' || query.sec === 'true';

    // advanced editing of mv
    window.mv = typeof(query.mv) === 'object' || query.mv === 'true';

    // zone treeview
    window.zt = typeof(query.zt) === 'object' || query.zt === 'true';

    window.virtual = typeof(query.virtual) === 'object' || query.virtual === 'true';

    if (typeof(query.max) === 'string') {
      window.maxLength = Number(query.max);
    }

   if (typeof(query.fld) === 'string') {
      window.fetchLongDelay = Number(query.fld) * 1000;
    }

    // display browser device info
    window.dev = typeof(query.dev) === 'object' || query.dev === 'true';

    if (window.dev) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  render() {

    const hideStyle = {
      display: 'none'
    };

    const rootStyle = {
//      display: 'flex',
//      flex: '1 0 auto',
//      flexFlow: 'column nowrap',

      overflow: 'auto',
      minHeight: '100vh',

//      borderWidth: '2px',
//      borderColor: 'yellow',
//      borderStyle: 'solid',
//      padding: 2

    };

    const devStyle = window.dev ? {
      display: 'flex',
      flex: '1 0 auto',
      flexFlow: 'column nowrap',
      alignItems: 'center',
      adjustContent: 'center',
      borderWidth: 2,
      borderColor: 'yellow',
//      borderStyle: 'solid',
    } : undefined;

    let content;

    if (window.dev) {
      content = (
        <div style={devStyle}>
          <div>device info:</div>
          <MediaQuery minDeviceWidth={1224} values={{ deviceWidth: 1600 }}>
            <div>desktop or laptop (minDeviceWidth: 1224)</div>
            <MediaQuery minDeviceWidth={1824}>
              <div>large screen (minDeviceWidth: 1824)</div>
            </MediaQuery>
            <MediaQuery maxWidth={1224}>
              <div>sized like a tablet or mobile phone though (maxWidth: 1224)</div>
            </MediaQuery>
          </MediaQuery>
          <MediaQuery maxDeviceWidth={1224}>
            <div>tablet or mobile phone (maxDeviceWidth: 1224)</div>
          </MediaQuery>
          <MediaQuery orientation="portrait">
            <div>portrait</div>
          </MediaQuery>
          <MediaQuery orientation="landscape">
            <div>landscape</div>
          </MediaQuery>
          <MediaQuery minResolution="2dppx">
            <div>resolution: retina (minResolution: 2dppx)</div>
          </MediaQuery>
        </div>);      
    } else if (window.help) {
      content = (
        <div style={{ ...devStyle, paddingTop: 30, paddingLeft: 30 }}>      
          <div>{`${appName} url query string options:`}</div>
          <div style={{ ...devStyle, paddingTop: 10 }}>
            (use "?" before first and "&" before each subsequent option)
          </div>
          <div style={{ ...devStyle, paddingTop: 10, paddingLeft: 30 }}>
            <div>diag (boolean/no value) --- device raw info</div>
            {/* <div>zt (boolean/no value) --- zone treeview</div> */}
            <div>dev (boolean/no value) --- browser device info</div>
            <div>sec (boolean/no value) --- display, in app menu, users and roles</div>
            <div>virtual (boolean/no value) --- include virtual devices</div>
            <div>mv (boolean/no value) --- multiview advanced editing</div>
            <div>max (number) --- maximum device count per page</div>
            <div>fld (number of seconds) --- fetch long delay after the last one</div>
            <div>help (boolean/no value) --- display url query string options</div>
          </div>
        </div>
        );
    } else {
      content = (
        <div style={rootStyle}>
          {this.props.children}
        </div>
      );      
    }

    return (
      <div style={rootStyle} className="appMain">
        <MediaQuery maxDeviceWidth={1280}>
         {(matches) => {
            // For the show only, make this always mobile.
            if (matches) {
//              window.mobile = 'ontouchstart' in window || navigator.maxTouchPoints;
              window.mobile = true;
//              alert('mobile');
              return null; // <div>mobile</div>;
            }
            window.mobile = false;
//            alert('not mobile');
            return null; // <div>desktop</div>;
          }}
        </MediaQuery>
        <div style={hideStyle}>
          <Themes eventKey={2} />
        </div>
        {content}
      </div>
      );
  }
}

module.exports = dragDropContext(HTML5Backend)(Root);
