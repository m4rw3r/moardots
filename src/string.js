/* @flow */

import type { VNode } from "./vdom";

import {
  HTML_ESCAPE_MAP,
  ID
}                   from "./constants";
import { mkRender } from "./render";

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
    // Exclude attributes, eg. on*
    if(key[0] == "o" && key[1] == "n" ||
       key === "children" ||
       key === "key" ||
       key === "ref") {
      continue;
    }

    // TODO: Style and Class attributes
    // TODO: dangerouslySetInnerHTML

    const value = attrs[key]

    if(key === "className") {
      key = "class";
    }

    // If the value is a function or falsy we skip the attribute
    // (0 is not considered falsy for HTML-attributes, nor is empty string)
    if(typeof value === "function" || ! (value || value === 0 || value === "")) {
      continue;
    }

    if(key === "class" && typeof value === "object") {
      //value = hashToClassName(value);
    }

    // Boolean attributes
    if(value === true || value === "") {
      str += " " + key;

      continue;

      // XML-mode
      // value = key;
    }

    str += ` ${key}="${escapeStr(value)}"`;
  }

  return str;
};

/**
 * Converts an intermediate node-representation to a string.
 */
const finalizeNode = node => {
  const t = node._type;

  // TODO: void-elements
  return t ? "<" + t + mkAttrs(node._attrs) + ">" + node._children.join("") + "</" + t + ">" : node._children.join("");
};

/**
 * Renders a VNode to a string.
 */
export const renderString: (n: VNode<*, *>, n: string) => string
  = mkRender(escapeStr, () => [], mkNode, () => ({}), addChild, ID, finalizeNode, () => {});
