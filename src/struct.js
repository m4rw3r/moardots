/* @flow */

import type { Meta, VNode } from "./vdom";

import { mkRender }  from "./render";

import { KEY_ATTR, ID } from "./constants";

export type StructNode = {
  nodeName:   string,
  attributes: Object,
  children:   Array<StructNode|string>,
  meta:       Array<Meta<any, any>>
};

const getStructStack = (node: StructNode|string): Array<Meta<*, *>> =>
  typeof node === "string" ? [] : node.meta;

const mkStruct = (nodeName, attributes, meta, orig): StructNode =>
  ({ nodeName, attributes, meta, children: orig && typeof orig !== "string" ? orig.children : [] });

const getKeyedChildren = node =>
  typeof node === "string" ? {} : node.children.reduce((o, n, i) => {
    if(typeof n === "string" || ! n.attributes[KEY_ATTR]) {
      o[i] = n;
    }
    else {
      o[n.attributes[KEY_ATTR]] = n;
    }

    return o;
  }, {});

const addChild = (parent: StructNode, newChild: StructNode|string, prev?: StructNode|string) => {
  // FIXME
  parent.children.push(newChild);

  return parent;
};

export const renderStruct: (n: VNode<*, *>, n: StructNode|string) => StructNode|string
  = mkRender(ID, getStructStack, mkStruct, getKeyedChildren, addChild, ID, ID);
