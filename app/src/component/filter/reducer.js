import { SHOW_FILTER, FILTER_CHANGED, 
  SET_DISPLAY_ORDER, EDIT_DISPLAY_ORDER } from './constants';

// filter state
const initState = {
  displayOrder: {},
  displayOrderEdit: {}
};

export default (state = initState, action) => {

  switch (action.type) {
    case SHOW_FILTER:
      return { ...state, [action.id]: state[action.id] ? 
        { ...state[action.id], show: typeof(action.show) === 'boolean' ? action.show : !state[action.id].show } : 
        { show: typeof(action.show) === 'boolean' ? action.show : true, 
          statusGreen: true, statusYellow: true, statusRed: true, model4k: true, modelHd: true, usbYes: true, usbNo: true } };
    case FILTER_CHANGED:
      {
        let val = action.value;

        if (typeof(val) === 'undefined' && 
          (action.name.indexOf('status') === 0 ||
            action.name.indexOf('model') === 0 ||
            action.name.indexOf('usb') === 0)) {
          val = !state[action.id][action.name];
        }

        return { ...state, [action.id]: { ...state[action.id], [action.name]: val } };
      }
    case SET_DISPLAY_ORDER: 
      return { ...state, displayOrder: { ...state.displayOrder, [action.devType]: { ...action.displayOrder } } };
    case EDIT_DISPLAY_ORDER:
        return { ...state, displayOrderEdit: { ...state.displayOrderEdit, [action.devType]: action.mac } };
    default:
      return state;
  }
};
