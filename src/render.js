/* @flow */

import type { Component, Meta, VNode } from "./vdom";

const mkAttrs = (attributes, children) => {
  let newObj = {};

  for(let k in attributes) {
    if(attributes.hasOwnProperty(k)) {
      newObj[k] = attributes[k];
    }
  }

  newObj.children = children;

  return newObj;
}

export type MkNode<N> = (nodeName: string, attributes: Object, children: Array<N|string>, meta: Array<Meta<*, *>>) => N;

/**
 * Function obtaining a metadata stack from a node of type N.
 */
export type GetStack<N>  = (node: N) => Array<Meta<*, *>>;

export type MkString<N>  = (str: string, meta: Array<Meta<*, *>>, orig?: N) => N;

export type AdaptNode<N> = (type: string, attrs: Object, meta: Array<Meta<*, *>>, orig?: N) => N;

type ResolvedNode = {
  _type:     string,
  _meta:     Array<Meta<any, any>>,
  _key:      string | null,
  _attrs:    Object,
  _children: Array<VNode<any, any>>
};

type ResolvedString = {
  _type: false,
  _meta: Array<Meta<any, any>>,
  _text: string
};

export type ResolvedVNode = ResolvedString | ResolvedNode;

const resolveVNode = <P: Object, S>(node: VNode<P, S>, stack: Array<Meta<any, any>>): ResolvedVNode => {
  let newStack = [];

  while(typeof node !== "string") {
    const { nodeName, attributes, children } = node;

    if(typeof nodeName !== "function") {
      return {
        _type:     nodeName,
        _meta:     newStack,
        _key:      attributes && attributes["key"] ? attributes.key : null,
        _attrs:    attributes,
        _children: children,
      };
    }

    const data = stack.shift() || [];

    // src   = data[0]
    // props = data[1]
    // state = data[2]

    // TODO: Diff, include children somehow in diff

    const res = nodeName((mkAttrs(attributes, children): any), data[0] === nodeName ? data[2] : undefined);

    node = res[0];

    newStack.push([nodeName, attributes, res[1]]);
  }

  return {
    _type: false,
    _meta: newStack,
    _text: node,
  };
}

/**
 * Constructor for the actual render.
 */
export const mkRender = <P: Object, S, N>(
  mkString: MkString<N>,
  getStack: GetStack<N>,
  adaptNode: AdaptNode<N>
): ((node: VNode<P, S>, orig?: N) => N) =>
  function render(node: VNode<P, S>, orig?: N): N {
    const r = resolveVNode(node, orig ? getStack(orig) : []);

    if(r._type === false) {
      // Why does Flow fail to detect _text here?
      return mkString((r: any)._text, r._meta, orig);
    }

    const newNode = adaptNode(r._type, r._attrs, r._meta, orig);

    // TODO: How to map the keys?
    const newChildren = r._children.map((n, i) => render(n, orig && orig.children[i] ? orig.children[i] : undefined));

    return newNode;
  };
