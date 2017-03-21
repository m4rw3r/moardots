/* @flow */

import type { Meta, VNode } from "./vdom";

import { mkRender }  from "./render";

export type StructNode = {
  nodeName:   string,
  attributes: Object,
  children:   Array<StructNode|string>,
  meta:       Array<Meta<any, any>>
};

const getStructStack = (node: StructNode|string): Array<Meta<*, *>> =>
  typeof node === "string" ? [] : node.meta;

const mkStruct = (nodeName, attributes, meta, orig): StructNode =>
  ({ nodeName, attributes, meta, children: typeof orig !== "string" ? orig.children : [] });

export const renderStruct: (n: VNode<*, *>, n: StructNode|string) => StructNode|string
  = mkRender(x => x, getStructStack, mkStruct);
