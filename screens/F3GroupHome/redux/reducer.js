import {
  F3_SET_GROUP_TO_DEPARTMENT
} from './action-type';


let initState = {
  toDepartment: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case F3_SET_GROUP_TO_DEPARTMENT:
      return {
        ...state, toDepartment: action.payload
      }
      break
    default:
      return state
  }
}
