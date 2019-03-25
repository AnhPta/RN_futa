import {
  INCREASE,
  DECREASE
} from './action-type';


let initState = {
  count: 5
}

export default (state = initState, action) => {
  switch (action.type) {
    case INCREASE:
      return {
        ...state, count: state.count + action.payload
      }
    default:
      return state
  }
}
