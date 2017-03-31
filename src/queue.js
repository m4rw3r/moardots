/* @flow */

const resolved = Promise && Promise.resolve();

const defer = resolved && (f => resolved.then(f)) || setTimeout;

let renderQueue: Array<() => void> = [];

const drainRenderQueue = () => {
  while(renderQueue.length) {
    renderQueue.pop()();
  }
};

// TODO: Any identifiers here?
// Currently should probably not be used for consumers of the library since it will just run the
// code multiple times
export const enqueueRender = (renderCb: () => void): void => {
  renderQueue.push(renderCb) === 1 && defer(drainRenderQueue);
};
