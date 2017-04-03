/* @flow */

import { State } from "./state";

/**
 * Potentially empty reference.
 */
export type Ref<T> = {| ref: (?T) |};

/**
 * Creates a new reference, potentially empty.
 */
export const mkRef = <T>(target: T): Ref<T> =>
  ({ ref: target });

/**
 * Updates the suppplied ref with the state contained in the State if it is a State-instance,
 * returning the return-value of the State instance.
 */
export const updateState = <S, T>(ref: Ref<S>, data: T | State<S, T>): T => {
  if(data instanceof State) {
    ref.ref = data._state;

    return data._value;
  }

  return data;
};

/**
 * Calls ref and on mount if they exist. Ref is called every time, onMount only when first created.
 */
export const callRefs = <T>(attrs: Object, node: T, old?: T) => {
  // TODO: We should probably only call ref whenever the node is new for the component
  typeof attrs.ref === "function" && attrs.ref(node);
  // TODO: Should really interact with the resolveVNode, since we should only call onMount whenever the
  //       component is swapped out
  node !== old && typeof attrs.onMount === "function" && attrs.onMount();
};

