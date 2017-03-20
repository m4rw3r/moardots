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
  children:   Array<FullVNode|string>,
  meta:       Array<Meta<any, any>>
};
export type Component<P, S> = (p: P, s?: S) => [VNode<*, *>, ?S];

const EMPTY_ATTRIBUTES = {};
const EMPTY_CHILDREN   = [];

// TODO: Handle numbers and nested arrays in children
export function h<P, S>(nodeName: string|Component<P, S>, attributes: P, ...children: Array<VNode<*, *>>): VNode<P, S> {
  return {
    nodeName:   nodeName,
    attributes: attributes || EMPTY_ATTRIBUTES,
    children:   children   || EMPTY_CHILDREN
  };
}

const mkAttrs = (attributes, children) => {
  let newObj = {};

  for(let k in attributes) {
    if(attributes.hasOwnProperty(k)) {
      newObj[k] = attributes[k];
    }
  }

  newObj.children = children;

  return newObj;
}

export type MkNode<N> = (nodeName: string, attributes: Object, meta: Array<Meta<any, any>>, children: Array<N|string>) => N;
/**
 * Function obtaining a metadata stack from a node of type N.
 */
export type GetStack<N> = (node: N) => Array<Meta<*, *>>;
export type MkString<N> = (str: string) => N;

/**
 * Constructor for the actual render.
 */
export const mkRender = <P, S, N>(mkString: MkString<N>, getStack: GetStack<N>, mkNode: MkNode<N>): ((node: VNode<P, S>, orig?: N) => N) =>  {
  return function render(node: VNode<P, S>, orig?: N): N {
    if(typeof node === "string") {
      return mkString(node);
    }

    const oldStack = orig ? getStack(node) : [];
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
    const newChildren = node.children.map((n, i) => render(n, orig && orig.children[i] ? orig.children[i] : undefined))

    return mkNode(node.nodeName, node.attributes, newStack, newChildren);
  }
}

const getStructStack = (node: FullVNode|string): Array<Meta<*, *>> =>
  typeof node !== "object" ? [] : node.stack;

const mkStruct = (nodeName, attributes, meta, children): FullVNode =>
  ({
    nodeName:   nodeName,
    attributes: attributes,
    meta:       meta,
    children:   children
  });

export const renderStruct: (n: VNode<*, *>, n: FullNode|string) => FullNode|string
  = mkRender(x => x, getStructStack, mkStruct);

// export const renderDom = mkRender();
