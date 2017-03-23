/* @flow */

import type { VNode } from "./vdom";

import { HTML_ESCAPE_MAP,
         ID }              from "./constants";
import { mkRender }        from "./render";

const escapeChar = tag =>
 HTML_ESCAPE_MAP[tag] || tag;

/**
 * Escapes a string for safe use in HTML.
 */
const escapeStr = str =>
 str.replace(/[&<>"]/g, escapeChar);

/**
 * Creates an intermediate node-structure where rendered children will be collected.
 */
const mkNode = (_type, _attrs, _meta) =>
  ({ _type, _attrs, _children: [] });

/**
 * Adds a child to an intermediate parent representation.
 */
const addChild = (parent, child) => {
  parent._children.push(child);

  return parent;
};

/**
 * Converts a map into HTML-attributes.
 */
const mkAttrs = attrs => {
  let str = "";

  // TODO: Sort keys to make it testable
  for(let key in attrs) {
    // TODO: Exclude attributes, eg. on*
    if(key[0] == "o" && key[1] == "n" || key === "children") {
      continue;
    }

    // TODO: Boolean attributes
    // TODO: Style and Class attributes
    // TODO: dangerouslySetInnerHTML
    str += " " + escapeStr(key) + "=\"" + escapeStr(attrs[key]) + "\"";
  }

  return str;
};

/**
 * Converts an intermediate node-representation to a string.
 */
const finalizeNode = node => {
  const t = node._type;

  return t ? "<" + t + mkAttrs(node._attrs) + ">" + node._children.join("") + "</" + t + ">" : node._children.join("");
};

/**
 * Renders a VNode to a string.
 */
export const renderString: (n: VNode<*, *>, n: string) => string
  = mkRender(escapeStr, () => [], mkNode, () => ({}), addChild, ID, finalizeNode);
