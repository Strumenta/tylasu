import {expect} from "chai";

import {
    Child,
    ErrorNode,
    Init,
    Mapped,
    Node,
    NodeTransform,
    PartiallyInitializedNode,
    Property,
    transform
} from "../src";

class A extends Node {
    child: Node;
    property: number;
    other: string;
    method() {
        return "method";
    }
    outer() {
        return { inner: "innerValue" };
    }
    error() {
        throw new Error("I don't like this");
    }
}

@NodeTransform(A)
class B extends Node {
    @Child()
    @Mapped("child")
    aChild: Node;
    @Property()
    property: number;
    @Mapped("other")
    other2: string;
    @Mapped("undefined")
    notThere: any;
    @Mapped("method")
    method: string;
    @Mapped("outer.inner")
    nested: string;
    @Mapped("error")
    error: ErrorNode;
    source: A;
    @Init
    fillSource(a: A) {
        this.source = a;
    }
}

class C extends Node {}
@NodeTransform(C)
class D extends Node {
    a;
    b;
    @Init
    brokenInit() {
        this.a = "OK";
        throw new Error("Broken");
    }
}

describe('AST transformations', function() {
    it("A => B, model to model",
        function () {
            const nodeA = new A();
            nodeA.child = new A();
            nodeA.property = 42;
            nodeA.other = "other";
            const nodeB = transform(nodeA) as B;
            expect(nodeB instanceof B).to.be.true;
            expect(nodeB.parseTreeNode).to.be.undefined;
            expect(nodeB.property).to.equal(42);
            expect(nodeB.other2).to.equal("other");
            expect(nodeB.aChild).not.to.be.undefined;
            expect(nodeB.notThere).to.be.undefined;
            expect(nodeB.method).to.equal("method");
            expect(nodeB.nested).to.equal("innerValue");
            expect(nodeB.aChild instanceof B).to.be.true;
            expect(nodeB.error instanceof ErrorNode).to.be.true;
            expect(nodeB.error.error.message).to.equal("I don't like this");
            expect(nodeB.source).to.equal(nodeA);
        });
    it("handles exceptions on init",
        function () {
            const node1 = new C();
            const node2 = transform(node1) as PartiallyInitializedNode;
            expect(node2 instanceof PartiallyInitializedNode).to.be.true;
            const node = node2.node as D;
            expect(node instanceof D).to.be.true;
            expect(node.a).to.equal("OK");
            expect(node.b).to.be.undefined;
        });
});
