
import { 
  RECEIVE_DATE,
  RECEIVE_RES,
  RECEIVE_OVER_CELL
} from './constants';

export function receiveDate(date) {
	return {
		type: RECEIVE_DATE,
		date
	};
}

function receiveReserv(res) {
	return {
		type: RECEIVE_RES,
		res
	};
}

export function receiveOverCell(overCell) {
	return {
		type: RECEIVE_OVER_CELL,
		overCell
	};
}

export function onReceiveReserv(r) {
  return (dispatch, getState) => {

  	let { res } = getState().sched;

  	if (!res) {
  		res = {};
  	}

  	if (res[r]) {
  		delete res[r];
  	} else {
  		res[r] = r;
  	}

  	dispatch(receiveReserv(res));
  	dispatch(receiveOverCell());
  };
}

export function onReceiveDate(date) {
  return (dispatch, getState) => {
  	dispatch(receiveDate(date));
  	dispatch(receiveReserv({}));
  };
}


