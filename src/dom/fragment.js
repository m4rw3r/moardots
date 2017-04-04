import {
  COMMENT_PREFIX,
  COMMENT_END_PREFIX,
  META_KEY,
} from "../constants";

let virtualCounter = 0;

const genVirtualId = () => ++virtualCounter;

export function Fragment(id?: string, start?: Comment, end?: Comment) {
  id = id || COMMENT_PREFIX + genVirtualId();

  this._start     = start || document.createComment(id);
  this._end       = start || document.createComment(COMMENT_END_PREFIX + id);
  this.childNodes = [];
}

Fragment.prototype = {
  appendChild: function appendChild(node) {
    const p = this._end.parentNode;

    this.childNodes.push(node);

    p && p.insertBefore(this._end);
  },
  insertBefore: function insertBefore(node, before) {
    const p = this._end.parentNode;
    let idx = before ? this.childNodes.indexOf(before) : -1;

    // TODO: Insert in parent
    if(idx >= 0) {
      // TODO: Account for the case when childNodes[idx] is a Fragment
      p && p.insertBefore(this.childNodes[idx]);

      this.childNodes.splice(idx, 0, node);
    }
    else {
      this.childNodes.push(node);

      p && p.insertBefore(this._end);
    }
  },
  replaceChild: function replaceChild(node, orig) {
    throw new Error("replaceChild: Unimplemented");
  },
  removeChild: function removeChild(node) {
    throw new Error("replaceChild: Unimplemented");
  }
};
