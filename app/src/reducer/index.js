import { combineReducers } from 'redux';
// import { routeReducer as routing } from 'react-router-redux';
import auth from '../component/auth/reducer';
import appMenu from '../component/appMenu/reducer';
import connection from '../component/connection/reducer';
import wall from '../component/wall/reducer';
import multiview from '../component/multiview/reducer';
import zone from '../component/zone/reducer';
import filter from '../component/filter/reducer';
import device from '../component/device/reducer';
import log from '../component/log/reducer';
import sec from '../component/security/reducer';
import sched from '../component/sched/reducer';

const rootReducer = combineReducers({
//  routing,
  appMenu,
  connection,
  wall,
  multiview,
  zone,
  filter,
  device,
  log,
  auth,
  sec,
  sched
});

export default rootReducer;
