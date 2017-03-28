/* @flow */

import { State } from "./state";

/**
 * Potentially empty reference.
 */
export type Ref<T> = {| ref: (?T) |};

export const mkRef = <T>(target: T): Ref<T> =>
  ({ ref: target });

export const updateState = <S, T>(ref: Ref<S>, data: T | State<S, T>): T => {
  if(data instanceof State) {
    ref.ref = data._state;

    return data._value;
  }

  return data;
};
