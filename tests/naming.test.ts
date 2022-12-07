import {Named, Node, ReferenceByName} from "../src";
import {expect} from "chai";

class MyNode extends Node implements Named {
    constructor(public name: string) {
        super();
    }
}

class NotNode implements Named {
    constructor(public name: string) {}
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
    it("Named reference is a Node",
        function () {
            const ref = new ReferenceByName<MyNode>("foo", new MyNode("foo"));
            expect(ref).not.to.be.null;
        });
    it("Undefined named reference assignment",
        function () {
            const ref = new ReferenceByName<MyNode>("foo", undefined);
            expect(ref).not.to.be.null;
        });
    it("Named reference is not a Node",
        function () {
            let ref : ReferenceByName<NotNode> | undefined = undefined;
            try {
                ref = new ReferenceByName<NotNode>("foo", new NotNode("foo"));
            }
            catch (e) {
                expect(e).to.be.not.null;
            }
            expect(ref).to.be.undefined;
        });
});
