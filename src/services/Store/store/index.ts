import { useDispatch } from 'react-redux';

export { default as createStore } from './store';
export { getAppState, getPassword } from './reducer';
export { initialLegacyState } from './legacy.initialState';
export { useSelector, default as useAppState } from './useAppState';
export { useDispatch };
export { createNotification, updateNotification } from './notification.slice';
export { setPassword } from './password.slice';
export {
  createAccount,
  createAccounts,
  destroyAccount,
  updateAccount,
  updateAccounts
} from './account.slice';
export { createContact, destroyContact, updateContact } from './contact.slice';
export { createUserAction, destroyUserAction, updateUserAction } from './userAction.slice';
export { createContract, destroyContract } from './contract.slice';
export {
  createNetworks,
  createNetwork,
  destroyNetwork,
  updateNetwork,
  updateNetworks
} from './network.slice';
export {
  createAssets,
  createAsset,
  destroyAsset,
  updateAsset,
  updateAssets,
  addAssetsFromAPI
} from './asset.slice';
