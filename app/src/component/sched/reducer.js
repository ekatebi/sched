/* eslint react/prop-types: 0 no-console: 0 */
import moment from 'moment';

import { 
  RECEIVE_DATE,
  RECEIVE_RES,
  RECEIVE_OVER_CELL
} from './constants';

// log state
const initState = {
  date: moment(),
  res: undefined,
  overCell: undefined
};

export default (state = initState, action) => {

  switch (action.type) {
    case RECEIVE_DATE:
      console.log('RECEIVE_DATE', action.date.format());
      return { ...state, date: action.date };
    case RECEIVE_RES:
      return { ...state, res: { ...action.res } };
    case RECEIVE_OVER_CELL:
      return { ...state, overCell: { ...action.overCell } };
    default:
      return state;
  }

};
