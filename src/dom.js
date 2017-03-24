/* @flow */

import type { VNode } from "./vdom";

import { META_KEY,
         KEY }      from "./constants";
import { mkRender } from "./render";

const replaceNode = (node, orig) => {
  const p = orig.parentNode;

  p && p.replaceChild(node, orig);
};

const removeNode = node => {
  const p = node.parentNode;

  p && p.removeChild(node);
};

const mkTextNode = (text, meta, orig) => {
  if(orig && orig instanceof Text) {
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

const setAttr = (node, key, value) => {
  if(key === "class") {
    key = "className";
  }

  if(key === "className" && typeof value === "object") {
    value = hashToClassName(value);
  }

  console.log(key, value);

  // TODO: Why is value not set on input?
  if(key in node) {
    // try {
      (node: any)[key] = (value == null ? "" : value);
    //} catch(e) { }
    (value == null || value === false) && (node: any).removeAttribute(key);
  }
  else if(value != null && value !== false) {
    (node: any).setAttribute(key, value);
  }
};

const mkNode = (type, attrs, meta, orig) => {
  if( ! type) {
    // Nested node
    // TODO: Implement
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

  for(let k in attrs) {
    if(k === "key" || k === "children") {
      continue;
    }

    // TODO: Diff existing

    setAttr(node, k, attrs[k]);
  }

  (node: any)[META_KEY] = meta;

  return node;
};

const getKeyedChildren = (_old, node) => {
  // Old can be an old node, all nodes have been moved to the new intermediate node

  const nodes = node.childNodes;
  let   map   = {};

  for(let i = 0, d = nodes.length; i < d; i++) {
    const n = (nodes[i]: any);

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
  //throw new Error("dom: addChild: Incomplete");

  if( ! prev) {
    parent.appendChild(newChild);
  }
  // We replace in parent (right?)
  /*else {
    parent.replaceChild(newChild, prev);
  }*/

  return parent;
};

// FIXME: Types
const finalizeNode = (newNode: any, prevNode: any) => {
  if(newNode !== prevNode && prevNode) {
    replaceNode(newNode, prevNode);
  }

  return newNode;
}

export const renderDom: (n: VNode<*, *>, n: Node) => Node
  = mkRender(mkTextNode, getStack, mkNode, getKeyedChildren, addChild, (parent, node) => {removeNode(node); return parent; }, finalizeNode);
