/* @flow */

import type { VNode } from "./vdom";

import { HTML_ESCAPE_MAP,
         ID }              from "./constants";
import { mkRender }        from "./render";

const escapeChar = tag =>
 HTML_ESCAPE_MAP[tag] || tag;

const escapeStr = str =>
 str.replace(/[&<>"']/g, escapeChar);

const mkNode = (_type, _attrs, _meta) =>
  ({ _type, _attrs, _children: [] });

const addChild = (parent, child) => {
  parent._children.push(child);

  return parent;
};

const mkAttrs = attrs => {
  let str = "";

  for(let key in attrs) {
    // TODO: Exclude attributes, eg. on*
    if(key[0] == "o" && key[1] == "n") {
      continue;
    }

    str += " " + escapeStr(key) + "=\"" + escapeStr(attrs[key]) + "\"";
  }

  return str;
};

const finalizeNode = node =>
  "<" + node._type + mkAttrs(node._attrs) + ">" + node._children.join("") + "</" + node._type + ">";

export const renderString: (n: VNode<*, *>, n: string) => string
  = mkRender(escapeStr, () => [], mkNode, () => ({}), addChild, ID, finalizeNode);
