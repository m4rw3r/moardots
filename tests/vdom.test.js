require("tap").mochaGlobals();

let should = require("should");

const { renderStruct, renderString, h } = require("../src");

const myComponent = (props, n = 0) => [h("p", null, props.foo + ++n), n];

describe("string", () => {
  it("empty",  () => h("").should.deepEqual({ nodeName: "", attributes: {}, children: [] }));
  it("p",      () => h("p").should.deepEqual({ nodeName: "p", attributes: {}, children: [] }));
  it("simple", () => h("test").should.deepEqual({ nodeName: "test", attributes: {}, children: [] }));
});

describe("invalid", () => {
  it("NaN",       () => h(NaN).should.equal(""));
  it("null",      () => h(null).should.equal(""));
  it("undefined", () => h(undefined).should.equal(""));

  context("children", () => {
    it("_null",      () => h("p", null, null).should.deepEqual({ nodeName: "p", attributes: {}, children: [null] }));
    it("_undefined", () => h("p", null, undefined).should.deepEqual({ nodeName: "p", attributes: {}, children: [undefined] }));
  });
});



describe("complex", () => {
  it("unordered list", () => h("ul", {}, h("li", {}, "Test"), h("li", {}, "Foobar")).should.deepEqual({
    nodeName: "ul",
    attributes: {},
    children:  [
      { nodeName: "li", attributes: {}, children: ["Test"] },
      { nodeName: "li", attributes: {}, children: ["Foobar"] },
    ]
  }));
});

describe("component", () => {
  it("top level", () => h(myComponent, { foo: "LOL" }).should.deepEqual({
    nodeName:   myComponent,
    attributes: { foo: "LOL" },
    children:   []
  }));
  it("top level 2", () => h(myComponent).should.deepEqual({
    nodeName:   myComponent,
    attributes: {},
    children:   []
  }));
});
