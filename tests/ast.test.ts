import {expect} from "chai";

import {errorOnRedefinition, Node, NODE_TYPES, registerNodeDefinition, setNodeRedefinitionStrategy, SYMBOL_NODE_NAME} from "../src";
import {fail} from "assert";

class Foo extends Node {}
class Bar extends Node {
    static [SYMBOL_NODE_NAME] = "Foo";
}

describe('AST management facilities', function() {
    it("By default, redefining a node errors",
        function () {
            registerNodeDefinition(Foo);
            try {
                registerNodeDefinition(Bar);
                fail("I was expecting an exception")
            } catch (e) {
                expect(e.message.startsWith("Foo")).to.be.true;
                expect(e.message.indexOf(") is already defined as ") > 0).to.be.true;
                expect(NODE_TYPES[""].nodes["Foo"]).to.equal(Foo);
            }
        });
    it("We can change the redefinition strategy",
        function () {
            registerNodeDefinition(Foo);
            try {
                setNodeRedefinitionStrategy((name, target, existingTarget) => {
                    expect(name).to.equal("Foo");
                    expect(target).to.equal(Bar);
                    expect(existingTarget).to.equal(Foo);
                });
                registerNodeDefinition(Bar);
                expect(NODE_TYPES[""].nodes["Foo"]).to.equal(Bar);
            } finally {
                setNodeRedefinitionStrategy(errorOnRedefinition);
            }
        });
});
