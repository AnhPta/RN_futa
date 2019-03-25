import {
  ACCOUNT_SET_INFO_USER,
  ACCOUNT_REMOVE_INFO_USER,
  ACCOUNT_SET_WORK_DEPARTMENT
} from './action-type';

// Lưu thông tin User đang đăng nhập
export function accountSetInfoUser(payload) {
  return {
    type: ACCOUNT_SET_INFO_USER,
    payload: payload
  }
}

// Xóa thông tin User đang đăng nhập
export function accountRemoveInfoUser(payload) {
  return {
    type: ACCOUNT_REMOVE_INFO_USER,
    payload: payload
  }
}

// Lưu thông tin văn phòng làm việc
export function accountSetWorkDepartment(payload) {
  return {
    type: ACCOUNT_SET_WORK_DEPARTMENT,
    payload: payload
  }
}
