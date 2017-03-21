/* @flow */

export type VNode<P: Object, S> = string | {
  nodeName:   string|Component<P, S>,
  attributes: P,
  children:   Array<VNode<*, *>>
};

export type Component<P: Object, S> = (p: P, s?: S) => [VNode<*, *>, ?S];

export type Meta<P: Object, S>      = [Component<P, S>, P, S];

const EMPTY_ATTRIBUTES = {};
const EMPTY_CHILDREN   = [];

// TODO: Handle numbers and nested arrays in children
export function h<P: Object, S>(nodeName: string|Component<P, S>, attributes: P, ...children: Array<VNode<*, *>>): VNode<P, S> {
  return {
    nodeName:   nodeName,
    attributes: attributes || EMPTY_ATTRIBUTES,
    children:   children   || EMPTY_CHILDREN
  };
}
