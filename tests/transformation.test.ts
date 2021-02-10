import {expect} from "chai";

import {Child, Mapped, Node, NodeTransform, Property, transform} from "../src";

class A extends Node {
    child: Node;
    property: number;
    other: string;
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
            expect(nodeB.aChild instanceof B).to.be.true;
        });
});
