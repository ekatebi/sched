
import {
  DEFAULT_CONNECTION_CHANGED,
  CONNECTION_FORM_CHANGED,
  CONNECTION_LIST_INIT,
  CONNECTION_LIST_CHANGED,
} from './constants';

export default (state = {}, action) => {
  switch (action.type) {
    case CONNECTION_LIST_INIT:
      return { ...state, Zyper4K: action.storedState.Zyper4K, ZyperHD: action.storedState.ZyperHD };
    case CONNECTION_LIST_CHANGED:
      return { ...state,
        [action.model]: { ...state[action.model], list: action.list } };
    case DEFAULT_CONNECTION_CHANGED:
      return { ...state,
        [action.model]: { ...state[action.model], defaultIndex: action.index } };
    case CONNECTION_FORM_CHANGED:
      return { ...state, formData: action.formData };
    default:
      return state;
  }
};
