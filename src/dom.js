/* @flow */

import type { VNode } from "./vdom";

import {
  ATTRS_KEY,
  COMMENT_END_PREFIX,
  COMMENT_NODE,
  COMMENT_PREFIX,
  KEY,
  META_KEY,
  ON_KEY,
  TEXT_NODE,
} from "./constants";
import { mkRender }   from "./render";

const replaceNode = (node, orig) => {
  const p = orig.parentNode;

  p.replaceChild(node, orig);
};

const removeNode = node => {
  const p = node.parentNode;

  p && p.removeChild(node);
};

const mkTextNode = (text, meta, orig) => {
  if(orig && orig.nodeType === TEXT_NODE) {
    if(orig.nodeValue != text) {
      orig.nodeValue = text;
    }
  }
  else {
    // orig && removeNode(orig);

    orig = document.createTextNode(text);
  }

  (orig: any)[META_KEY] = meta;

  return orig;
};

const getStack = node =>
  (node: any)[META_KEY] || [];

const hashToClassName = obj => {
  let str = "";

  for(let key in obj) {
    if(obj[key]) {
      if(str) {
        str += " ";
      }

      str += key;
    }
  }

  return str;
};

function eventListener(event) {
  return this[ON_KEY][event.type](event);
};

const setAttr = (node, key, value) => {
  if(key === "class") {
    key = "className";
  }

  // TODO: Any way to prevent Babel from generating the full typeof shim? We don't need to
  // take Symbol into account here
  // Maybe move to a separate file and then make rollup exclude that file when using the babel-plugin
  if(key === "className" && typeof value === "object" && value) {
    value = hashToClassName(value);
  }

  // TODO: Style

  // TODO: Event-listeners
  if(key[0] === "o" && key[1] === "n") {
    let listeners = (node: any)[ON_KEY] || ((node: any)[ON_KEY] = {});

    key = key.substring(2).toLowerCase();

    if(value && !listeners[key]) {
      // TODO: Bubbling or non-bubbling?
      node.addEventListener(key, eventListener);
    }
    else if(!value && listeners[key]) {
      // TODO: Bubbling or non-bubbling?
      node.removeEventListener(key, eventListener);
    }

    listeners[key] = value;
  }
  else if(key in node) {
    try {
      (node: any)[key] = (value == null ? "" : value);
    } catch(e) { }

    (value == null || value === false) && (node: any).removeAttribute(key);
  }
  else if(value != null && value !== false) {
    (node: any).setAttribute(key, value);
  }
};

const setAttrs = (node, attrs) => {
  const prev = (node: any)[ATTRS_KEY] || {};
  let   copy = {};

  for(let k in prev) {
    if(!(k in attrs)) {
      setAttr(node, k);
    }
  }

  for(let k in attrs) {
    if(k === "key" || k === "children" || k === "innerHTML") {
      continue;
    }

    // Duplicate the attributes to be able to diff later
    copy[k] = attrs[k];

    // Diff the value, only update if it actually changed
    if(attrs[k] !== (k === "value" || k === "checked" ? (node: any)[k] : prev[k])) {
      setAttr(node, k, attrs[k]);
    }
  }

  (node: any)[ATTRS_KEY] = copy;
};

const mkNode = (type, attrs, meta, orig) => {
  if( ! type) {
    // TODO: Code
    throw new Error("Unimplemented");
  }

  const node = orig && orig.nodeName === type.toUpperCase() ? orig : document.createElement(type);

  if(orig && orig !== node) {
    while(orig.firstChild) {
      node.appendChild(orig.firstChild);
    }

    // TODO: What are the implications of replacing the node instead of adding it?
    // removeNode(orig);

    //replaceNode(node, orig);
  }

  setAttrs(node, attrs);

  (node: any)[META_KEY] = meta;

  return node;
};

const getKeyedChildren = (_old, node) => {
  // Old can be an old node, all nodes have been moved to the new intermediate node

  const nodes = node.childNodes;
  let   map   = {};

  // TODO: Support nested arrays
  for(let i = 0, d = nodes.length; i < d; i++) {
    const n = (nodes[i]: any);

    if(n.nodeType === COMMENT_NODE && n.nodeValue.substring(0, 3) === COMMENT_PREFIX) {
      // TODO: Code
      throw new Error("Unimplemented");
    }

    if(n[KEY]) {
      map[n[KEY]] = nodes[i];
    }
    else {
      map[i] = nodes[i];
    }
  }

  return map;
};

const addChild = (parent, newChild, prev?) => {
  // FIXME: Code
  // TODO: Support nested arrays
  if( ! prev) {
    // Nothing to swap with later, insert it here now
    parent.appendChild(newChild);
  }
  // We replace the node when it is finished instead of here

  return parent;
};

// FIXME: Types
const finalizeNode = (newNode: any, prevNode: any) => {
  if(newNode !== prevNode && prevNode) {
    replaceNode(newNode, prevNode);
  }

  // TODO: Support nested arrays
  // TODO: Call onMount callback or so

  return newNode;
};

const removeNodeIfInParent = (parent, node) => {
  const p = node.parentNode;

  p && p.removeChild(node);

  return parent;
};

export const renderDom: (n: VNode<*, *>, n: HTMLElement) => HTMLElement|Text
  = mkRender(mkTextNode, getStack, mkNode, getKeyedChildren, addChild, removeNodeIfInParent, finalizeNode);
