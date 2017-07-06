
import { 
  RECEIVE_DATE
} from './constants';

export function receiveDate(date) {
	return {
		type: RECEIVE_DATE,
		date
	};
}