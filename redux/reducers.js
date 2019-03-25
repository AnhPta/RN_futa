import { combineReducers } from 'redux';
import cartState from '../screens/Cart/redux/reducer';
import accountState from '../screens/Account/redux/reducer';
import f3State from '../screens/F3GroupHome/redux/reducer';

const loadingState = (state = false, action) => {
  if (action.type === 'SHOW_LOADING') {
    return true
  }
  if (action.type === 'HIDE_LOADING') {
    return false
  }
  return state
}

export default combineReducers({
  loadingState: loadingState,
  cartState: cartState,
  accountState: accountState,
  f3State: f3State
});
