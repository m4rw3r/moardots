/* @flow */
import {
  ON_KEY,
  ATTRS_KEY,
} from "../constants";

/**
 * Generic event-handler for all types of events.
 */
function eventListener(event) {
  // TODO: Why is this[ON_KEY] not always present?
  return this[ON_KEY] && this[ON_KEY][event.type](event);
};

/**
 * Converts an object into a space-separated string of the keys which have truthy values.
 */
const hashToClassName = (obj: Object): string => {
  let str = "";

  for(let key in obj) {
    if(obj[key]) {
      if(str) {
        str += " ";
      }

      str += key;
    }
  }

  return str;
};

const setAttr = (node: Element, key, value) => {
  if(key === "class") {
    key = "className";
  }

  // TODO: Any way to prevent Babel from generating the full typeof shim? We don't need to
  // take Symbol into account here
  // Maybe move to a separate file and then make rollup exclude that file when using the babel-plugin
  if(key === "className" && typeof value === "object" && value) {
    value = hashToClassName(value);
  }

  // TODO: Style

  if(key[0] === "o" && key[1] === "n") {
    // Event-listeners
    let listeners = (node: any)[ON_KEY] || ((node: any)[ON_KEY] = {});

    key = key.substring(2).toLowerCase();

    if(value && !listeners[key]) {
      // TODO: Bubbling or non-bubbling?
      node.addEventListener(key, eventListener);
    }
    else if(!value && listeners[key]) {
      // TODO: Bubbling or non-bubbling?
      node.removeEventListener(key, eventListener);
    }

    listeners[key] = value;
  }
  else if(key in node) {
    assignProp(node, key, value);

    (value == null || value === false) && node.removeAttribute(key);
  }
  else if(value != null && value !== false) {
    node.setAttribute(key, value);
  }
};

/**
 * Assigns an object property on the given node. This is moved to a separate function to allow
 * `setAttr` to be inlined for performance.
 */
const assignProp = (node, key, value) => {
  // TODO: Fix any
  try {
    (node: any)[key] = (value == null ? "" : value);
  }
  catch(e) {
    // Intentionally left empty
  }
};


export const setAttrs = (node: Element, attrs: Object) => {
  const prev = (node: any)[ATTRS_KEY] || {};
  let   copy = {};

  for(let k in prev) {
    if(!(k in attrs)) {
      setAttr(node, k);
    }
  }

  for(let k in attrs) {
    if(k === "key" || k === "children" || k === "innerHTML") {
      continue;
    }

    // Duplicate the attributes to be able to diff later
    copy[k] = attrs[k];

    // Diff the value, only update if it actually changed
    if(attrs[k] !== (k === "value" || k === "checked" ? (node: any)[k] : prev[k])) {
      setAttr(node, k, attrs[k]);
    }
  }

  // TODO: innerHTML

  (node: any)[ATTRS_KEY] = copy;
};
