/* @flow */

import type { VNode } from "./vdom";

import { META_KEY,
         KEY }      from "./constants";
import { mkRender } from "./render";

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
    orig && removeNode(orig);

    orig = document.createTextNode(text);
  }

  (orig: any)[META_KEY] = meta;

  return orig;
};

const getStack = node =>
  (node: any)[META_KEY] || [];

const mkNode = (type, attrs, meta, orig) => {
  if( ! type) {
    // Nested node
    // TODO: Implement
    throw new Error("Unimplemented");
  }

  const node = orig && orig.nodeName === type ? orig : document.createElement(type);

  if(orig && orig !== node) {
    while(orig.firstChild) {
      node.appendChild(orig.firstChild);
    }

    removeNode(orig);
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
  throw new Error("dom: addChild: Incomplete");

  // parent.children.push(newChild);

  //return parent;
};

export const renderDom: (n: VNode<*, *>, n: Node) => Node
  = mkRender(mkTextNode, getStack, mkNode, getKeyedChildren, addChild, (parent, node) => {removeNode(node); return parent; }, x => x);
