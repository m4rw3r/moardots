/* @flow */

import {
  Fragment,
} from "./fragment";

export const appendNode = (parent: Node, node: Node) =>
  node instanceof Fragment ? appendFragment(parent, node) : parent.appendChild(node);

export const replaceNode = (node: Node, orig: Node) => {
  if(node instanceof Fragment) {
    replaceFragment(node, orig);
  }
  else {
    const p = orig.parentNode;

    p && p.replaceChild(node, orig);
  }
};

export const removeNode = (node: Node) => {
  if(node instanceof Fragment) {
    removeFragment(node);
  }
  else {
    const p = node.parentNode;

    p && p.removeChild(node);
  }
};

const appendFragment = (parent: Node, frag: Fragment, end?: ?Node) => {
  const children = frag.childNodes;

  parent.insertBefore(frag._start, end);

  for(let i = 0; i < children.length; i++) {
    parent.insertBefore(children[i], end);
  }

  parent.insertBefore(frag._end, end);
}

const replaceFragment = (frag: Fragment, orig: Node) => {
  const next   = orig.nextSibling;
  const parent = orig.parentNode;

  removeNode(orig);

  if( ! parent) {
    return;
  }

  appendFragment(parent, frag, next);
}

const removeFragment = frag => {
  throw new Error("removeFragment: Unimplemented");
}
