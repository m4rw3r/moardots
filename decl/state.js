declare class State<S, T> {
  _state: S;
  _value: T;
}

declare function setState<S, T>(state: S, value: T): State<S, T>;
