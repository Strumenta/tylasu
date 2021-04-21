import {expect} from "chai";

import {Node, registerNodeDefinition, SYMBOL_NODE_NAME} from "../src";
import {fail} from "assert";

class Foo extends Node {}
class Bar extends Node {
    static [SYMBOL_NODE_NAME] = "Foo";
}

describe('AST management facilities', function() {
    it("Detect double mapping",
        function () {
            registerNodeDefinition(Foo);
            try {
                registerNodeDefinition(Bar);
                fail("I was expecting an exception")
            } catch (e) {
                expect(e.message.startsWith("Foo")).to.be.true;
                expect(e.message.indexOf(") is already defined as ") > 0).to.be.true;
            }
        });
});
