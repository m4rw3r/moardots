/* @flow */

import {
  COMMENT_PREFIX,
  COMMENT_END_PREFIX
} from "./constants";

let virtualCounter = 0;

const genVirtualId = () => ++virtualCounter;

function VirtualNode(meta: *, id?: string, start?: Comment, end?: Comment) {
  id = id || COMMENT_PREFIX + genVirtualId();

  this._meta      = meta;
  this._start     = start || document.createComment(id);
  this._end       = start || document.createComment(COMMENT_END_PREFIX + id);
  this.childNodes = [];
  this.firstChild = null;
}

VirtualNode.prototype = {
  appendChild: function appendChild(node) {
    if( ! this.firstChild) {
      this.firstChild = node;
    }

    (this: any).childNodes.push(node);
  }
};
