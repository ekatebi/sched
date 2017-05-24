import { 
	SHOW_FILTER, 
	FILTER_CHANGED,
	SET_DISPLAY_ORDER,
	EDIT_DISPLAY_ORDER
} from './constants';

export function showFilter(id, show) { // toggle between show and hide if show arg is undefined
	return {
		type: SHOW_FILTER,
		id,
		show
	};
}

export function filterChanged(id, name, value) {
	return {
		type: FILTER_CHANGED,
		id,
		name,
		value
	};
}

export function editDisplayOrder(devType, mac) {
	return {
		type: EDIT_DISPLAY_ORDER,
		devType,
		mac
	};
}

export function onEditDisplayOrder(devType, mac) {
  return (dispatch, getState) => {
  	dispatch(editDisplayOrder(devType));
  	dispatch(editDisplayOrder(devType, mac));
  };
}

export function setDisplayOrder(devType, displayOrder) {
	return {
		type: SET_DISPLAY_ORDER,
		devType,
		displayOrder: displayOrder || {}
	};
}

export function onSetDisplayOrder(devType, mac, index = -1) {
  return (dispatch, getState) => {

  	let displayOrder = {};

  	if (getState().filter.displayOrder[devType]) {
	  	displayOrder = { ...getState().filter.displayOrder[devType] };
		}

		// delete entry if it exists
		if (displayOrder[mac] !== undefined) {
			delete displayOrder[mac];
		}

		if (index > -1) {

			const preKey = Object.keys(displayOrder).find((key) => {
				return displayOrder[key] === index; 
			});

			if (preKey) {

				Object.keys(displayOrder)
					.forEach((mac2) => {

						if (displayOrder[mac2] >= index) {

							displayOrder[mac2] += 1;
						}
					});

			}

			displayOrder[mac] = index;
  	}

  	dispatch(setDisplayOrder(devType, displayOrder));
  };
}

