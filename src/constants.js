/* @flow */

export const EMPTY_ATTRIBUTES = {};
export const EMPTY_CHILDREN   = [];
export const HTML_ESCAPE_MAP  = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};
export const ID        = <T>(x: T): T => x;
export const META_KEY  = "...meta";
export const KEY       = "...key";
export const ATTRS_KEY = "...attrs";
export const KEY_ATTR  = "key";
