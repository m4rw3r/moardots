require("babel-register");

require("tap").mochaGlobals();

let should = require("should");

const { renderStruct, h } = require("../src");

const myComponent = (props, n = 0) => [h("p", null, props.foo + " " + ++n), n];

context("h", () => {
  describe("string", () => {
    console.log(h("ul", {}, h("li", {}, "Test"), h("li", {}, "Foobar")));

    console.log(renderStruct(h("ul", {}, h("li", {}, "Test"), h("li", {}, "Foobar"))));
    console.log(renderStruct(h(myComponent, { foo: "LOL" })));
  });
});
