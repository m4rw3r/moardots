/* @flow */

import type { VNode } from "./vdom";

import { mkRender } from "./render";

const removeNode = node => {};

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

  // TODO: Assign meta
  (orig: any).meta = meta;

  return orig;
};

const getStack = (node) => {
  return (node: any).meta || [];
};

const mkNode = (type, attrs, meta, orig) => {
  const node = document.createElement(type);

  //children.forEach(c => node.appendChild(c));

  (node: any).meta = meta;

  return node;
};

export const renderDom: (n: VNode<*, *>, n: Node) => Node
  = mkRender(mkTextNode, getStack, mkNode);
