import {
  F3_SET_GROUP_TO_DEPARTMENT
} from './action-type';

// Lưu thông in chi nhánh đã chọn để nhóm F3
export function f3SetGroupToDepartment(payload) {
  return {
    type: F3_SET_GROUP_TO_DEPARTMENT,
    payload: payload
  }
}
