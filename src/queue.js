/* @flow */

const resolved = Promise && Promise.resolve();

const defer = resolved && (f => resolved.then(f)) || setTimeout;

let renderQueue: Array<() => void> = [];

const drainRenderQueue = () => {
  while(renderQueue.length) {
    renderQueue.pop()();
  }
};

export const enqueueRender = (renderCb: () => void): void => {
  renderQueue.push(renderCb) === 1 && defer(drainRenderQueue);
};
