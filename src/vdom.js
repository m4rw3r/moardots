/* @flow */

import type { Ref } from "./util";
import { State } from "./state";

import { EMPTY_ATTRIBUTES, EMPTY_CHILDREN } from "./constants";

export type VNode<P: Object, S> = string | Array<VNode<*, *>> | {|
  nodeName:   string|Component<P, S>,
  attributes: P,
  children:   Array<VNode<*, *>>
|};

// TODO: Improve
export type WithState<S> = (f: Function) => * => *;

// any used to prevent stack overflow in flow
export type Component<P: Object, S> = (p: P, s?: S, withState: WithState<S>) => VNode<any, any> | State<S, VNode<*, *>>;

/**
 * Metadata associated with a node.
 */
export type Meta<P: Object, S> = [Component<P, S>, P, Ref<S>];

// TODO: Handle numbers and nested arrays in children
export function h<P: Object, S>(nodeName: string|Component<P, S>, attributes: P, ...children: Array<VNode<*, *>>): VNode<P, S> {
  // TODO: Warn in dev-mode?
  if(typeof nodeName !== "string" && typeof nodeName !== "function") {
    return nodeName ? "" + nodeName : "";
  }

  // TODO: Flatten children-arrays (this is a performance-optimization, avoiding unnecesary fragment-creation)
  return {
    nodeName:   nodeName,
    attributes: attributes || EMPTY_ATTRIBUTES,
    children:   children   || EMPTY_CHILDREN
  };
}
