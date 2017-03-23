/* @flow */

import { EMPTY_ATTRIBUTES, EMPTY_CHILDREN } from "./constants";

export type VNode<P: Object, S> = string | {
  nodeName:   string|Component<P, S>,
  attributes: P,
  children:   Array<VNode<*, *>>
};

export type Component<P: Object, S> = (p: P, s?: S) => [VNode<*, *>, ?S];

export type Meta<P: Object, S>      = [Component<P, S>, P, S];

// TODO: Handle numbers and nested arrays in children
export function h<P: Object, S>(nodeName: string|Component<P, S>, attributes: P, ...children: Array<VNode<*, *>>): VNode<P, S> {
  // TODO: Warn in dev-mode?
  if(typeof nodeName !== "string" && typeof nodeName !== "function") {
    return nodeName ? "" + nodeName : "";
  }

  return {
    nodeName:   nodeName,
    attributes: attributes || EMPTY_ATTRIBUTES,
    children:   children   || EMPTY_CHILDREN
  };
}
