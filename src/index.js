/* @flow */

export type VNode<P, S>     = {
  nodeName:   string|Component<P, S>,
  attributes: P,
  children:   Array<VNode<*, *>>
}|string;
export type Meta<P, S> = {
  source: Component<P, S>,
  props:  P,
  state:  S
};
export type FullVNode = {
  nodeName:   string,
  attributes: Object,
  children:   Array<FullVNode>,
  meta:       Array<Meta<any, any>>
};
export type Component<P, S> = (p: P, s?: S) => [VNode<*, *>, ?S];

export function h<P, S>(nodeName: string|Component<P, S>, attributes: P, ...children: Array<VNode<*, *>>): VNode<P, S> {
  return {
    nodeName:   nodeName,
    attributes: attributes || {},
    children:   children   || []
  };
}

function mkAttrs(attributes, children) {
  let newObj = {};

  for(let k in attributes) {
    if(attributes.hasOwnProperty(k)) {
      newObj[k] = attributes[k];
    }
  }

  newObj.children = children;

  return newObj;
}

// TODO: Make it possible to slot in an implementation which would actually render these FullVNodes
export function render<P, S>(node: VNode<P, S>, orig?: FullVNode): FullVNode {
  if(typeof node === "string") {
    return node;
  }

  const oldStack = orig ? orig.meta : [];
  let   newStack = [];

  while(typeof node.nodeName === "function") {
    const { state, source, props }           = oldStack.pop() || {};
    const { nodeName, attributes, children } = node;

    // TODO: Diff

    const res = nodeName(mkAttrs(attributes, children), source === nodeName ? state : undefined);

    node = res[0];

    newStack.push({
      source: nodeName,
      props:  attributes,
      state:  res[1]
    });
  }

  // TODO: How to map the keys?
  return {
    nodeName:   node.nodeName,
    attributes: node.attributes,
    meta:       newStack,
    children:   node.children.map((n, i) => render(n, orig && orig.children[i] ? orig.children[i] : undefined))
  };
}
