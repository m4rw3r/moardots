const tap = require("tap");

const { renderStruct, renderString, h } = require("../src");

const myComponent = (props, n = 0) => setState(++n, h("p", null, props.foo + ++n));

tap.test("string", t => {
  t.deepEqual(h(""), { nodeName: "", attributes: {}, children: [] });
  t.deepEqual(h("p"), { nodeName: "p", attributes: {}, children: [] });
  t.deepEqual(h("test"), { nodeName: "test", attributes: {}, children: [] });

  t.end();
});

tap.test("invalid", t => {
  t.assert(isNaN(h(NaN)), "NaN");
  t.equal(h(null), null, "null");
  t.equal(h(undefined), undefined, "undefined");

  t.test("children", t => {
    let nan = h("p", null, NaN);

    t.assert(typeof nan === "object");
    t.equal(nan.nodeName, "p");
    t.deepEqual(nan.attributes, {});
    t.assert(Array.isArray(nan.children));
    t.assert(nan.children.length === 1);
    t.assert(isNaN(nan.children[0]));

    t.deepEqual(h("p", null, null), { nodeName: "p", attributes: {}, children: [null] });
    t.deepEqual(h("p", null, undefined), { nodeName: "p", attributes: {}, children: [undefined] });

    t.end();
  });

  t.end();
});

tap.test("complex", t => {
  t.deepEqual(h("ul", {}, h("li", {}, "Test"), h("li", {}, "Foobar")), {
    nodeName: "ul",
    attributes: {},
    children:  [
      { nodeName: "li", attributes: {}, children: ["Test"] },
      { nodeName: "li", attributes: {}, children: ["Foobar"] },
    ]
  });

  t.end();
});

tap.test("component", t => {
  t.deepEqual(h(myComponent, { foo: "LOL" }), {
    nodeName:   myComponent,
    attributes: { foo: "LOL" },
    children:   []
  });
  t.deepEqual(h(myComponent), {
    nodeName:   myComponent,
    attributes: {},
    children:   []
  });

  t.end();
});
