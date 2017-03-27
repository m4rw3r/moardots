/* @flow */

export type Ref<T> = { ref: T };

export const mkRef = <T>(target: T): Ref<T> =>
  ({ ref: target });

export const setState = <S>(state: S, retVal?: boolean) =>
  ({ _state: state, _return: retVal });
