/* @flow */

import type { Component, VNode, Meta } from "./vdom";
import type { Ref }                    from "./util";

import {
  KEY_ATTR,
  EMPTY_CHILDREN,
  EMPTY_ATTRIBUTES
}                             from "./constants";
import { mkRef, updateState } from "./util";
import { State }              from "./state";
import { h }                  from "./vdom";
import { enqueueRender }      from "./queue";

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

export type CallNodeRefs<N> = (attrs: Object, node: N, old?: N) => void;

export type RenderOptions = {
  enqueueRender?: (() => void) => void
};

type ResolvedNode = {
  _type:     string,
  _meta:     Array<Meta<*, *>>,
  _nodeRef:  Ref<*>,
  _text:     null,
  _attrs:    Object,
  _children: Array<VNode<*, *>>
};

type ResolvedArray = {
  _type:     null,
  _meta:     Array<Meta<*, *>>,
  _nodeRef:  Ref<*>,
  _text:     null,
  _attrs:    Object,
  _children: Array<VNode<*, *>>
};

type ResolvedString = {
  _type:     true,
  _meta:     Array<Meta<*, *>>,
  _nodeRef:  Ref<*>,
  _text:     string,
  _attrs:    null,
  _children: null
};

export type ResolvedVNode = ResolvedString | ResolvedArray | ResolvedNode;

const mkAttrs = <P: Object>(attributes: P, children: Array<VNode<*, *>>): P & { children: Array<VNode<*, *>> } => {
  let newObj = {};

  for(let k in attributes) {
    if(attributes.hasOwnProperty(k)) {
      newObj[k] = attributes[k];
    }
  }

  newObj.children = children;

  return (newObj: any);
}

const resolveVNode = (node: VNode<*, *>, stack: Array<Meta<*, *>>, newStack: Array<Meta<*, *>>, render: (node: VNode<*, *>, orig?: *) => *): ResolvedVNode => {
  // We create a new reference to the item, even if a previous exists since we
  // always want to render without a reference to prevent users from setting state
  // prematurely.
  const nodeRef = mkRef(undefined);

  while(typeof node !== "string" && typeof node !== "number" && node) {
    if(Array.isArray(node)) {
      return {
        _type:     null,
        _meta:     newStack,
        _nodeRef:  nodeRef,
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
        _nodeRef:  nodeRef,
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

    // TODO: Are we sure we get the right reference to the children here?
    // TODO: Clear stack if we do not match here?
    const stackLength = newStack.length;
    const state       = data[0] === nodeName && data[2] ? data[2] : mkRef(undefined);
    const attrs       = mkAttrs(attributes, children);

    // We include children in attributes so we can diff those too
    newStack.push([nodeName, attrs, state]);

    // TODO: Can we reuse?
    const withState = callback => (...args) => {
      if( ! nodeRef.ref) {
        throw new Error("withState: empty nodeRef");
      }

      args.push(state.ref);

      const ret = callback.apply(undefined, args)

      // TODO: Maybe use a callback?
      if(ret instanceof State) {
        state.ref = ret._state;

        // TODO: Generate a unique identifier attached to the CB, such that we do not render the same element twice?
        // TODO: Account for stack offset, use stackLength and cut off the state and replace
        // TODO: We need to inject the current state into it, so we have a partially prepared
        // newStack up to stackLength
        // TODO: nodeRef might point to a comment-node maybe?
        render(h(nodeName, attributes, ...children), nodeRef.ref);

        return ret._value;
      }

      return ret;

    };

    node = updateState(state, nodeName(attrs, state.ref, withState));
  }

  return {
    _type:     true,
    _meta:     newStack,
    _nodeRef:  nodeRef,
    _text:     typeof node === "number" ? String(node) : node || "",
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
  finalizeNode: FinalizeNode<N, I>,
  callNodeRefs: CallNodeRefs<N>
): ((node: VNode<P, S>, orig?: N) => N) =>
  // TODO: Support options for rendering
  function render(node: VNode<P, S>, orig?: N, options?: RenderOptions): N {
    const queue = (vdom, orig) => (options && options.enqueueRender || enqueueRender)(() => render(vdom, orig));
    // TODO: Pass in the old stack if any is present
    const r     = resolveVNode(node, orig ? getStack(orig) : [], [], queue);

    if(r._type === true) {
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
      const key      = typeof vchild !== "string" && typeof vchild !== "number" && ! Array.isArray(vchild) && vchild && vchild.attributes[KEY_ATTR] || i;
      // TODO: Attempt to pick a matching node if its index is numeric, otherwise moving a component
      // will cause it to lose its data
      const child    = keyed[key];

      const newChild = render(vchild, child, options)

      // TODO: Go through how this works properly
      newNode = addChild(newNode, newChild, child);

      if(newChild === child) {
        delete keyed[key];
      }
    }

    for(let k in keyed) {
      newNode = removeChild(newNode, keyed[k]);
    }

    const finalNode = finalizeNode(newNode, orig);

    r._nodeRef.ref = finalNode;

    callNodeRefs(r._attrs, finalNode, orig);

    return finalNode;
  };
