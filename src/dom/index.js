/* @flow */

import type { VNode } from "../vdom";

import {
  COMMENT_END_PREFIX,
  COMMENT_NODE,
  COMMENT_PREFIX,
  KEY,
  META_KEY,
  TEXT_NODE,
}                   from "../constants";
import { setAttrs } from "./attrs";
import { mkRender } from "../render";
import { callRefs } from "../util";
import { Fragment } from "./fragment";
import {
  appendNode,
  replaceNode,
  removeNode,
} from "./ops";

const mkTextNode = (text, meta, orig) => {
  if(orig && orig.nodeType === TEXT_NODE) {
    if(orig.nodeValue != text) {
      orig.nodeValue = text;
    }
  }
  else {
    // The finalizeNode function will replace the node if they do not match
    orig = document.createTextNode(text);
  }

  setStack(orig, meta);

  return orig;
};

const getStack = node =>
  (node: any)[META_KEY] || [];

const setStack = (node, meta) =>
  (node: any)[META_KEY] = meta;

const mkNode = (type, attrs, meta, orig): HTMLElement => {
  // TODO: Merge with opposite case
  if( ! type) {
    const node = orig && orig instanceof Fragment ? orig : new Fragment();

    setStack(node, meta);

    return node;
  }

  const node: HTMLElement = orig && orig.nodeName === type.toUpperCase() ? (orig: any) : document.createElement(type);

  if(orig && orig !== node) {
    let children = orig.childNodes;

    // We are not using a while-loop with orig.firstChild since that will not support Fragment
    for(let i = 0, d = children.length; i < d; i++) {
      node.appendChild(children[i]);
    }

    // We replace the item in finalizeNode
  }

  setAttrs(node, attrs);
  setStack(node, meta);

  return node;
};

const getKeyedChildren = (_old, node) => {
  // Old can be an old node, all nodes have been moved to the new intermediate node

  const nodes = node.childNodes;
  let   map   = {};

  for(let i = 0, d = nodes.length; i < d; i++) {
    const n = (nodes[i]: any);

    if(n.nodeType === COMMENT_NODE && n.nodeValue.substring(0, 3) === COMMENT_PREFIX) {
      // TODO: Code
      throw new Error("Unimplemented");
    }

    if(n[KEY]) {
      map[n[KEY]] = n;
    }
    else {
      map[i] = n;
    }
  }

  return map;
};

const addChild = (parent, newChild, orig?) => {
  if( ! orig) {
    // Nothing to swap with later, insert it here now
    appendNode(parent, newChild);
  }
  // We replace the node when it is finished instead of here

  return parent;
};

// FIXME: Types
const finalizeNode = (newNode, origNode): HTMLElement|Text => {
  if(newNode !== origNode && origNode) {
    replaceNode(newNode, origNode);
  }

  return newNode;
};

const removeNodeIfInParent = (parent, node) => {
  removeNode(node);

  return parent;
};

export const renderDom: (n: VNode<*, *>, n: HTMLElement) => HTMLElement|Text
  = mkRender(mkTextNode, getStack, mkNode, getKeyedChildren, addChild, removeNodeIfInParent, finalizeNode, callRefs);
