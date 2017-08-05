
import { 
  RECEIVE_DATE,
  RECEIVE_RES
} from './constants';

export function receiveDate(date) {
	return {
		type: RECEIVE_DATE,
		date
	};
}

function receiveRes(res) {
	return {
		type: RECEIVE_RES,
		res
	};
}

export function onReceiveRes(r) {
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

  	dispatch(receiveRes(res));
  };
}
