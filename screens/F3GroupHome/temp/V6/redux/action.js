import {
  F3_SET_GROUP_TO_DEPARTMENT,
  F3_CHANGE,
  F3_SET,
  F3_SET_LISTDEPARTMENT,
  F3_CHANGE_ITEM_LISTDEPARTMENT,
} from './action-type';

// Lưu thông in chi nhánh đã chọn để nhóm F3
export function f3SetGroupToDepartment(payload) {
  return {
    type: F3_SET_GROUP_TO_DEPARTMENT,
    payload: payload
  }
}

// Lưu thông in chi nhánh đã chọn để nhóm F3
export function f3Change(payload) {
  return {
    type: F3_CHANGE,
    payload: payload
  }
}

// Lưu thông in chi nhánh đã chọn để nhóm F3
export function f3Set(payload) {
  return {
    type: F3_SET,
    payload: payload
  }
}

// Lưu thông in chi nhánh đã chọn để nhóm F3
export function f3SetListDepartment(payload) {
  console.log('Đẩy dũ liệu list deparemnt');
  return {
    type: F3_SET_LISTDEPARTMENT,
    payload: payload
  }
}
// Thay đổi item list deparrtmnt
export function f3ChangeItemDepartment(payload) {
  return {
    type: F3_CHANGE_ITEM_LISTDEPARTMENT,
    payload: payload
  }
}
