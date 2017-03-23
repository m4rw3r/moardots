require("tap").mochaGlobals();

let should = require("should");

const { renderString, h } = require("../src");

/* @jsx h */

const RenderCounter = (props, n = 0) => [h("p", null, (props.foo || "") + ++n), n];

describe("string", () => {
  it("empty", () => renderString("").should.equal(""));
  it("plain", () => renderString("a").should.equal("a"));
});

describe("invalid", () => {
  it("null",      () => renderString(h("p", null, null)).should.equal("<p></p>"));
  it("undefined", () => renderString(h("p", null, undefined)).should.equal("<p></p>"));
  it("NaN",       () => renderString(h("p", null, NaN)).should.equal("<p></p>"));
});

describe("nested", () => {
  context("string", () => {
    it("foo", () => renderString(h("p", null, ["A", "B", "C"])).should.equal("<p>ABC</p>"));
    it("foo", () => renderString(h("p", null, "A", ["B", "C"])).should.equal("<p>ABC</p>"));
    it("foo", () => renderString(h("p", null, "A", ["B"], "C")).should.equal("<p>ABC</p>"));
  });
  context("array", () => {
    it("foo", () => renderString([["A", "B", "C"]]).should.equal("ABC"));
    it("foo", () => renderString(["A", ["B", "C"]]).should.equal("ABC"));
    it("foo", () => renderString(["A", ["B"], "C"]).should.equal("ABC"));
  });
  context("VDom", () => {
    it("foo", () => renderString([h("p")]).should.equal("<p></p>"));
    it("foo", () => renderString(h("p", null, [h("span")])).should.equal("<p><span></span></p>"));
    it("foo", () => renderString(h("p", null, [h("span"), h("text")])).should.equal("<p><span></span><text></text></p>"));
  });
});

describe("JSX", () => {
  it("<p />",         () => renderString(<p />).should.equal("<p></p>"));
  it("<p>foobar</p>", () => renderString(<p>foobar</p>).should.equal("<p>foobar</p>"));
  it("<RenderCounter />", () => renderString(<RenderCounter />).should.equal("<p>1</p>"));
  it("<RenderCounter foo=\"Count: \" />", () => renderString(<RenderCounter foo="Count: " />).should.equal("<p>Count: 1</p>"));
});
