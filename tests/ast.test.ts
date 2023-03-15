import {expect} from "chai";

import {
    errorOnRedefinition,
    ASTNode,
    NODE_TYPES,
    registerNodeDefinition,
    setNodeRedefinitionStrategy,
    warnOnRedefinition
} from "../src";
import {fail} from "assert";

class Foo extends ASTNode {}
class Bar extends ASTNode {}

describe('AST management facilities', function() {
    it("By default, redefining a node errors",
        function () {
            registerNodeDefinition(Foo, "", "Foo");
            try {
                registerNodeDefinition(Bar, "", "Foo");
                fail("I was expecting an exception")
            } catch (e) {
                expect(e.message.startsWith("Foo")).to.be.true;
                expect(e.message.indexOf(") is already defined as ") > 0).to.be.true;
                expect(NODE_TYPES[""].nodes["Foo"]).to.equal(Foo);
            }
        });
    it("We can change the redefinition strategy",
        function () {
            registerNodeDefinition(Foo, "", "Foo");
            try {
                setNodeRedefinitionStrategy((name, target, existingTarget) => {
                    warnOnRedefinition(name, target, existingTarget);
                    expect(name).to.equal("Foo");
                    expect(target).to.equal(Bar);
                    expect(existingTarget).to.equal(Foo);
                });
                registerNodeDefinition(Bar, "", "Foo");
                expect(NODE_TYPES[""].nodes["Foo"]).to.equal(Bar);
            } finally {
                setNodeRedefinitionStrategy(errorOnRedefinition);
            }
        });
});
