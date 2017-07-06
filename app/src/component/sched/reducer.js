/* eslint react/prop-types: 0 no-console: 0 */
import moment from 'moment';

import { 
  RECEIVE_DATE
} from './constants';

// log state
const initState = {
  date: moment()
};

export default (state = initState, action) => {

  switch (action.type) {
    case RECEIVE_DATE:
      console.log('RECEIVE_DATE', action.date.format());
      return { ...state, date: action.date };
    default:
      return state;
  }

};
