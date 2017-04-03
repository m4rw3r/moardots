let tap       = require("tap");
let jsdom     = require("jsdom");
let moardots  = require("../src");
let h         = moardots.h;
let renderDom = moardots.renderDom;
let setState  = moardots.setState;

function startDocument(doc) {
  global.document  = jsdom.jsdom(doc);
  global.window    = document.defaultView;
  global.Text      = window.Text;
  global.navigator = { userAgent: 'node.js' };
}

tap.test("dom", t => {
  t.afterEach(done => {
    global.window && global.window.close();

    delete global.window;
    delete global.document;
    delete global.navigator;

    done();
  });

  t.test("should render simple elements", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    let node = renderDom(h("p", null, "Hello World!"), document.getElementById("app"));

    t.equal(node.outerHTML, '<p>Hello World!</p>');
    t.equal(document.documentElement.outerHTML, '<html><head></head><body><p>Hello World!</p></body></html>');

    t.done();
  });

  t.test("should render complex elements", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    let node = renderDom(h("ul",
      { className: "foobar, lol asdf", id: "app" },
      h("li", { class: { first: true, second: false, list_item: "" } }, "Hello"),
      h("li", { class: { the_number: 0, shownNumber: "0", notShown: null, notSeen: undefined } }, "World"),
      h("li", { class: { item: true, list: false, hello: "yes" } }, "World"),
      h("li", null, h("p", null, "A", "B", "C"))
    ), document.getElementById("app"));

    t.equal(node.outerHTML, '<ul class="foobar, lol asdf" id="app"><li class="first">Hello</li><li class="shownNumber">World</li><li class="item hello">World</li><li><p>ABC</p></li></ul>');
    t.equal(document.documentElement.outerHTML, '<html><head></head><body><ul class="foobar, lol asdf" id="app"><li class="first">Hello</li><li class="shownNumber">World</li><li class="item hello">World</li><li><p>ABC</p></li></ul></body></html>');

    node = renderDom(h("ul", null, h("li", { class: { first: true, second: true } }, "Bye!")), node);

    t.equal(node.outerHTML, '<ul class=""><li class="first second">Bye!</li></ul>');
    t.equal(document.documentElement.outerHTML, '<html><head></head><body><ul class=""><li class="first second">Bye!</li></ul></body></html>');

    t.done();
  });

  t.test("should remove old attributes", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    let node = renderDom(h("input", { type: "text", required: true, value: "Foobar!" }), document.getElementById("app"));

    t.equal(node.outerHTML, '<input type="text" required="">');
    t.equal(document.documentElement.outerHTML, '<html><head></head><body><input type="text" required=""></body></html>');
    t.deepEqual([].slice.call(document.getElementsByTagName("input")).map(i => i.value), ["Foobar!"]);

    node = renderDom(h("input", { type: "text", value: "Lel" }), node);

    // WAT: it does not seem to actually replace
    t.equal(node.outerHTML, '<input type="text">');
    t.equal(document.documentElement.outerHTML, '<html><head></head><body><input type="text"></body></html>');
    t.deepEqual([].slice.call(document.getElementsByTagName("input")).map(i => i.value), ["Lel"]);

    t.done();
  });

  t.test("should preserve state", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    const MyComponent = (_props, state = 0) => setState(++state, h("p", null, "Num: " + state));

    let node = renderDom(h(MyComponent), document.getElementById("app"));

    t.equal(node.outerHTML, '<p>Num: 1</p>');

    node = renderDom(h(MyComponent), node);

    t.equal(node.outerHTML, '<p>Num: 2</p>');

    node = renderDom(h(MyComponent), node);

    t.equal(node.outerHTML, '<p>Num: 3</p>');

    t.end();
  });

  t.test("should preserve nested state", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    const MyComponent       = (props, state = 0)  => setState(++state, h("p", null, props.pre + ":" + state));
    const MyNestedComponent = (props, state = 11) => setState(state = state + 2, h(MyComponent, { pre: state }));

    let node = renderDom(h(MyNestedComponent), document.getElementById("app"));

    t.equal(node.outerHTML, '<p>13:1</p>');

    node = renderDom(h(MyNestedComponent), node);

    t.equal(node.outerHTML, '<p>15:2</p>');

    node = renderDom(h(MyNestedComponent), node);

    t.equal(node.outerHTML, '<p>17:3</p>');

    t.end();
  });

  t.test("should update the local state", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    const incCounter = (_e, counter)   => setState(counter + 1);
    const Counter    = (_p, state = 0, withState) => setState(state, h("a", { onClick: withState(incCounter) }, "Count: " + state));

    let node = renderDom(h(Counter), document.getElementById("app"));

    t.equal(node.outerHTML, '<a>Count: 0</a>');

    node = renderDom(h(Counter), node);

    t.equal(node.outerHTML, '<a>Count: 0</a>');

    node.click();

    t.deepEqual(node["...meta"], [[Counter, { children: [] }, { ref: 1 }]]);

    // Rendering is delayed
    t.equal(node.outerHTML, '<a>Count: 0</a>');

    // Re-render with the new state explicitly
    node = renderDom(h(Counter), node);

    t.deepEqual(node["...meta"], [[Counter, { children: [] }, { ref: 1 }]]);
    t.equal(node.outerHTML, '<a>Count: 1</a>');

    node = renderDom(h(Counter), node);

    t.equal(node.outerHTML, '<a>Count: 1</a>');

    node.click();

    t.deepEqual(node["...meta"], [[Counter, { children: [] }, { ref: 2 }]]);
    t.equal(node.outerHTML, '<a>Count: 1</a>');

    node = renderDom(h(Counter), node);

    t.deepEqual(node["...meta"], [[Counter, { children: [] }, { ref: 2 }]]);
    t.equal(node.outerHTML, '<a>Count: 2</a>');

    node = renderDom(h(Counter), node);

    t.deepEqual(node["...meta"], [[Counter, { children: [] }, { ref: 2 }]]);
    t.equal(node.outerHTML, '<a>Count: 2</a>');

    t.end();
  });

  t.test("should support array as VDom", t => {
    startDocument('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>');

    const Multi = (props, state = 0) => [[h("label", null, "Test"), h("p", null, "Count: " + ++state)], state];

    let node = renderDom(h(Multi), document.getElementById("app"));

    t.equal(node.outerHTML, '<label>Test</label><p>Count: 1</p>');

    node = renderDom(h(Multi), node);

    t.equal(node.outerHTML, '<label>Test</label><p>Count: 2</p>');

    node = renderDom(h(Multi), node);

    t.equal(node.outerHTML, '<label>Test</label><p>Count: 3</p>');

    t.end();
  });

  t.end();
});
