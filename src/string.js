/* @flow */

import type { VNode } from "./vdom";

import { mkRender } from "./render";

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

const escapeChar = tag =>
 HTML_ESCAPE_MAP[tag] || tag;

const escapeStr = str =>
 str.replace(/[&<>"']/g, escapeChar);

const mkNode = (_type, _attrs, _meta) => ({ _type, _attrs, _meta });

export const renderString: (n: VNode<*, *>, n: string) => string
  = mkRender(escapeStr, () => [], mkNode);
