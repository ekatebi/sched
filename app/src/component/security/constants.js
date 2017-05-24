const prefix = 'SEC__';
export const REQUEST_LIST = `${prefix}REQUEST_LIST`;
export const RECEIVE_LIST = `${prefix}RECEIVE_LIST`;
export const RECEIVE_ITEM = `${prefix}RECEIVE_ITEM`;
export const REQUEST_TOKEN = `${prefix}REQUEST_TOKEN`;
export const RECEIVE_TOKEN = `${prefix}RECEIVE_TOKEN`;
export const RECEIVE_ERROR = `${prefix}RECEIVE_ERROR`;
export const ITEM_CHANGED = `${prefix}ITEM_CHANGED`;
export const PW_CHANGED = `${prefix}PW_CHANGED`;
export const PWV_CHANGED = `${prefix}PWV_CHANGED`;
export const SHOW_EDITOR = `${prefix}SHOW_EDITOR`;

export const SEC_TYPE_NAMES = {
	user: 'user',
	role: 'role',
	perm: 'permission'
};

export const GUID = '061abff2-7ba0-4af2-ae31-15a703af5ac1';

const defaultPerms = [
	// { name: 'Devices', Display: false, Configure: false },
	{ name: 'Sources', Display: false, Configure: false, Admin: false },
	{ name: 'Displays', Display: false, Configure: false, Admin: false },
	{ name: 'Zones', Display: false, Configure: false },  
	{ name: 'Walls', Display: false, Configure: false },
	{ name: 'Multiview', Display: false, Configure: false },
	{ name: 'Logs', Display: true },
	{ name: 'Help', Display: true },
//	{ name: 'Security', Display: false, Configure: false },
	{ name: 'Users', Display: false, Configure: false },
	{ name: 'Roles', Display: false, Configure: false },
	{ name: 'Server', Display: false, Configure: false, Admin: false }
];

export const getDefaultPerms = () => {
	return defaultPerms.map((perm) => {
		return { ...perm };
	});
};

export const getPermsObject = (perms, admin = false) => {

// console.log('getPermsObject', perms);

 const permsObj = {};

 for (let i = 0; i < perms.length; ++i) {

//	console.log('perm', perms[i].name, perms[i]);

    permsObj[perms[i].name] = { ...perms[i] };

    delete permsObj[perms[i].name].name;

    if (admin) {
    	permsObj[perms[i].name].Display = true;
    	if (permsObj[perms[i].name].Configure !== undefined) {
	    	permsObj[perms[i].name].Configure = true;
	    }
    	if (permsObj[perms[i].name].Admin !== undefined) {
	    	permsObj[perms[i].name].Admin = true;
	    }
    } 
 }

 return { ...permsObj };
};

export const defaultUser = () => {
	return { name: '', userId: '', pw: '', pwv: '', forcePwChange: false };
};

export const defaultRole = () => {
	return { name: '', desc: '', userIds: undefined, perms: getDefaultPerms() };
};

export const getAdminRole = () => {
	return { ...defaultRole, name: 'admin', perms: getPermsObject(getDefaultPerms(), true) };
};

// export const defaultPerm = { name: '', desc: '' };

export function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

// https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
export const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
export const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');
