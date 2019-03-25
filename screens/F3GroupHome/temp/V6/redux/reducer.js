import {
  F3_SET_GROUP_TO_DEPARTMENT,
  F3_CHANGE,
  F3_SET,
  F3_SET_LISTDEPARTMENT,
  F3_CHANGE_ITEM_LISTDEPARTMENT
} from './action-type';
import { set } from 'lodash'

let initState = {
  toDepartment: {},
  listPackage: [],
  listDepartment: [

  ]
}

export default (state = initState, action) => {
  // let listDepartment = [...state.listDepartment]
  switch (action.type) {
    case F3_SET_GROUP_TO_DEPARTMENT:
      return {
        ...state, toDepartment: action.payload
      }
      break
    case F3_SET:
      return {
        ...state, listPackage: action.payload
      }
      break
    case F3_SET_LISTDEPARTMENT:
      console.log('Vào hàm set listDepartment');
      return {
        ...state, listDepartment: action.payload
      }
      break
    case F3_CHANGE_ITEM_LISTDEPARTMENT:
      console.log('Vào thay đổi list listDepartment');
      console.log(action.payload)
      let temp = state.listDepartment
      temp[action.payload].checked = !temp[action.payload].checked

      temp1 = temp[action.payload]
      console.log(temp1);
      // return {
      //   ...state, ... {
      //     listDepartment, ... {
      //       ...state.listDepartment, state.listDepartment[]
      //     }
      //   }
      // }
      //
      return state
      break
    case F3_CHANGE:
    console.log('132131');
    set(state, 'listPackage[' + action.payload.indexGroupBy + '].items[' + action.payload.index + '].checked', 1);
    console.log(state);
    // console.log(state.listPackage);
      // console.log(state.listPackage[0].items[0]);
      // let temp = !state.listPackage[0].items[0].checked
      return state


      break
    default:
      return state
  }
}
