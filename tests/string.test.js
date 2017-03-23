require("tap").mochaGlobals();

let should = require("should");

const { renderString, h } = require("../src");

/* @jsx h */

const MyCounter = (props, n = 0) => [h("p", null, (props.foo || "") + ++n), n];

describe("string", () => {
  it("empty", () => renderString("").should.equal(""));
  it("plain", () => renderString("a").should.equal("a"));
});

describe("invalid", () => {
  it("null",      () => renderString(h("p", null, null)).should.equal("<p></p>"));
  it("undefined", () => renderString(h("p", null, undefined)).should.equal("<p></p>"));
  it("NaN",       () => renderString(h("p", null, undefined)).should.equal("<p></p>"));
});

describe("JSX", () => {
  it("<p />",         () => renderString(<p />).should.equal("<p></p>"));
  it("<p>foobar</p>", () => renderString(<p>foobar</p>).should.equal("<p>foobar</p>"));
  it("<MyCounter />", () => renderString(<MyCounter />).should.equal("<p>1</p>"));
  it("<MyCounter foo=\"Count: \" />", () => renderString(<MyCounter foo="Count: " />).should.equal("<p>Count: 1</p>"));
});
