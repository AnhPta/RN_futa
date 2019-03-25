import {
  ACCOUNT_SET_INFO_USER,
  ACCOUNT_REMOVE_INFO_USER,
  ACCOUNT_SET_WORK_DEPARTMENT,
} from './action-type';


let initState = {
  accountInfo: {

  },
  workDepartment: {

  }
}

export default (state = initState, action) => {
  switch (action.type) {
    case ACCOUNT_SET_INFO_USER:
      return {
        ...state, accountInfo: action.payload
      }
      break
    case ACCOUNT_REMOVE_INFO_USER:
      return {
        ...state, accountInfo: {}
      }
      break
    case ACCOUNT_SET_WORK_DEPARTMENT:
      return {
        ...state, workDepartment: action.payload
      }
      break
    default:
      return state
  }
}
