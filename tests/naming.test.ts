import {Named, Node, ReferenceByName, START_POINT} from "../src";
import {expect} from "chai";
import {SimpleLangLexer} from "./parser/SimpleLangLexer";
import {CharStreams, CommonTokenStream} from "antlr4ts";
import {SetStmtContext, SimpleLangParser} from "./parser/SimpleLangParser";

class MyNode extends Node implements Named {
    constructor(public name: string) {
        super();
    }
}

describe('Naming', function() {
    it("Unsolved named reference to string",
        function () {
            const unresolvedRef = new ReferenceByName<MyNode>("foo");
            expect(unresolvedRef.toString()).to.equal("Ref(foo)[Unresolved]");
        });
    it("Named reference resolved to string",
        function () {
            const resolvedRef = new ReferenceByName<MyNode>("foo", new MyNode("foo"));
            expect(resolvedRef.toString()).to.equal("Ref(foo)[Resolved]");
        });
    it("Named reference resolved – same case",
        function () {
            const ref = new ReferenceByName<MyNode>("foo");
            expect(ref.tryToResolve([new MyNode("foo")])).to.be.true;
            expect(ref.resolved).to.be.true;
        });
    it("Named reference not resolved – same case",
        function () {
            const ref = new ReferenceByName<MyNode>("foo");
            expect(ref.tryToResolve([new MyNode("foo2")])).to.be.false;
            expect(ref.resolved).to.be.false;
        });
    it("Named reference resolved – different case",
        function () {
            const ref = new ReferenceByName<MyNode>("foo");
            expect(ref.tryToResolve([new MyNode("fOo")], true)).to.be.true;
            expect(ref.resolved).to.be.true;
        });
    it("Named reference not resolved – different case",
        function () {
            const ref = new ReferenceByName<MyNode>("foo");
            expect(ref.tryToResolve([new MyNode("fOo")])).to.be.false;
            expect(ref.resolved).to.be.false;
        });
});

