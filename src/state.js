/*
 * This file does not have any flow annotations, instead those can be found in `/decl/state.js`.
 */

/**
 * State-monad-like object enabling updating state and returning a value at the same time.
 *
 * We are using a "class" here because we want to be able to use instanceof to determine if it
 * is a state object. The properties are private and they will be mangled.
 *
 * See `decl/state.js` for the class-definition.
 */
export function State(state, value) {
  this._state = state;
  this._value = value;
}

export function setState(state, value) {
  return new State(state, value);
}
