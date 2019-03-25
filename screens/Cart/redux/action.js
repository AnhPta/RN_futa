import {
  INCREASE,
  DECREASE
} from './action-type';

/**
 * Tăng số lượng bất kì
 */
export function counterIncrease (payload) {
  return {
    type: INCREASE,
    payload: payload
  }
}


