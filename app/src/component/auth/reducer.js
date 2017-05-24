import { RECEIVE_ERROR, SIGNOUT, LOGIN } from './constants';

const initState = {
  error: undefined,
  token: undefined
};

export default function auth(state = initState, action) {
  switch (action.type) {
    case RECEIVE_ERROR:
      return { ...state, error: action.error, token: undefined };
    case SIGNOUT:
      return { ...state, token: undefined, error: undefined };
    case LOGIN:
      return { ...state, token: { ...action.token }, error: undefined };
    default:
      return state;
  }
}
