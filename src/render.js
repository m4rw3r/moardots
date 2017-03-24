/* @flow */

import type { Component, Meta, VNode } from "./vdom";

import { KEY_ATTR, EMPTY_CHILDREN, EMPTY_ATTRIBUTES } from "./constants";

export type MkNode<N> = (nodeName: string, attributes: Object, children: Array<N|string>, meta: Array<Meta<*, *>>) => N;

/**
 * Function obtaining a metadata stack from a node of type N.
 */
export type GetStack<N>  = (node: N) => Array<Meta<*, *>>;

export type MkString<N>  = (str: string, meta: Array<Meta<*, *>>, orig?: N) => N;

export type AdaptNode<N, I> = (type: string|null, attrs: Object, meta: Array<Meta<*, *>>, orig?: N) => I;

export type GetChildMap<N, I> = (node: N, intermediate: I) => {[key: string|number]: N};

export type AddChild<N, I> = (parent: I, newChild: N, prev?: N) => I;

export type RemoveChild<N, I> = (parent: I, oldChild: N) => I;

export type FinalizeNode<N, I> = (transient: I, orig?: N) => N;

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

type ResolvedNode = {
  _type:     string,
  _meta:     Array<Meta<any, any>>,
  _text:     null,
  _attrs:    Object,
  _children: Array<VNode<any, any>>
};

type ResolvedArray = {
  _type:     null,
  _meta:     Array<Meta<any, any>>,
  _text:     null,
  _attrs:    Object,
  _children: Array<VNode<any, any>>
};

type ResolvedString = {
  _type:     true,
  _meta:     Array<Meta<any, any>>,
  _text:     string,
  _attrs:    null,
  _children: null
};

export type ResolvedVNode = ResolvedString | ResolvedArray | ResolvedNode;

const resolveVNode = <P: Object, S>(node: VNode<P, S>, stack: Array<Meta<any, any>>): ResolvedVNode => {
  let newStack = [];

  while(typeof node !== "string" && node) {
    if(Array.isArray(node)) {
      return {
        _type:     null,
        _meta:     newStack,
        _text:     null,
        _attrs:    EMPTY_ATTRIBUTES,
        _children: node
      };
    }

    const { nodeName, attributes, children } = node;

    if(typeof nodeName !== "function") {
      return {
        _type:     (nodeName: string),
        _meta:     newStack,
        _text:     null,
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
    _type:     true,
    _meta:     newStack,
    _text:     node || "",
    _attrs:    null,
    _children: null,
  };
}

/**
 * Constructor for the actual render.
 */
export const mkRender = <P: Object, S, N, I>(
  mkString:    MkString<N>,
  getStack:    GetStack<N>,
  adaptNode:   AdaptNode<N, I>,
  getChildMap: GetChildMap<N, I>,
  addChild:    AddChild<N, I>,
  removeChild: RemoveChild<N, I>,
  finalizeNode: FinalizeNode<N, I>
): ((node: VNode<P, S>, orig?: N) => N) =>
  function render(node: VNode<P, S>, orig?: N): N {
    const r = resolveVNode(node, orig ? getStack(orig) : []);

    if(r._type === true) {
      // Why does Flow fail to detect _text here?
      return mkString(r._text, r._meta, orig);
    }

    const children = r._children;
    let   newNode  = adaptNode(r._type, r._attrs, r._meta, orig);
    const keyed    = orig ? getChildMap(orig, newNode) : {};

    // We do not want to use a `for(let child of iter)` since the code
    // generated is complex to account for every case

    for(let i = 0; i < children.length; i++) {
      const vchild = children[i];
      // TODO: This feels a bit long, any way to shorten it?
      const key    = (typeof vchild !== "string" && vchild && vchild.attributes && (vchild: any).attributes[KEY_ATTR] || i: any);
      (key: string|number);
      const child  = keyed[key];

      const newChild = render(vchild, child)

      // TODO: Support nested arrays

      // TODO: Go through how this works properly
      newNode = addChild(newNode, newChild, child);

      if(newChild === child) {
        delete keyed[key];
      }
    }

    for(let k in keyed) {
      newNode = removeChild(newNode, keyed[k]);
    }

    return finalizeNode(newNode, orig);
  };
