import {expect} from "chai";
import {assertASTsAreEqual} from "../../src/testing/testing";
import {ASTNode, Children, Node, Point, Position, PossiblyNamed, Property} from "../../src";

describe('AssertASTsAreEqual', function() {
    it("the very same node instance compared with itself must pass", function () {
        const simpleNode1 : Node = new SimpleNode("node");
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode1)
        ).not.to.throw();
    });
    it("two different node instances of the same type and with the same values must pass", function () {
        const simpleNode1 : Node = new SimpleNode("node");
        const simpleNode2 : Node = new SimpleNode("node");
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2)
        ).not.to.throw();
    });
    it("nodes with different positions must pass when considerPosition == false", function () {
        const simpleNode1 : Node = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(1, 0));
        const simpleNode2 : Node = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(2, 0));
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2)
        ).not.to.throw();
    });
    it("nodes with different positions must NOT pass when considerPosition == true", function () {
        const simpleNode1 : Node = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(1, 0));
        const simpleNode2 : Node = new SimpleNode("node");
        simpleNode1.position = Position.ofPoint(new Point(2, 0));
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2, "<root>", true)
        ).to.throw();
    });
    it("two different node instances of the same type and with different values must NOT pass", function () {
        const simpleNode1 : Node = new SimpleNode("node");
        const simpleNode2 : Node = new SimpleNode("different node");
        expect(() =>
            assertASTsAreEqual(simpleNode1, simpleNode2)
        ).to.throw();
    });
    it("two different node instances of two different types, but with same values must NOT pass", function () {
        const node1 : Node = new SimpleNode("node");
        const node2 : Node = new AnotherSimpleNode("node");
        expect(() =>
            assertASTsAreEqual(node1, node2)
        ).to.throw();
    });
    it("two different node instances of two different types, and with different values must NOT pass", function () {
        const node1 : Node = new SimpleNode("node");
        const node2 : Node = new AnotherSimpleNode("different node");
        expect(() =>
            assertASTsAreEqual(node1, node2)
        ).to.throw();
    });
    it("two equal trees of height = 3", function () {
        const tree1 = new SimpleNode("A", [
            new SimpleNode("B"), new SimpleNode("C", [
                new SimpleNode("D")
            ])
        ]);
        const tree2 = new SimpleNode("A", [
            new SimpleNode("B"), new SimpleNode("C", [
                new SimpleNode("D")
            ])
        ]);
        expect(() =>
            assertASTsAreEqual(tree1, tree2)
        ).not.to.throw();
    });
    it("two trees of height = 3 with different node on the 3rd level", function () {
        const tree1 =
            new SimpleNode("A", [
                new SimpleNode("B"),
                new SimpleNode("C", [
                    new SimpleNode("D1")
                ])
            ]);
        const tree2 =
            new SimpleNode("A", [
                new SimpleNode("B"),
                new SimpleNode("C", [
                    new SimpleNode("D2")
                ])
            ]);
        expect(() =>
            assertASTsAreEqual(tree1, tree2)
        ).to.throw();
    });
    it("two different nodes with same property names but one is a Node and the other is a string, then must NOT pass", function () {
        const treeWithLegitSubTree = new SimpleNode("A", []);
        const treeWithStringSubTree = new NodeWithStringSubTree("A", "sub-tree");
        expect(() =>
            assertASTsAreEqual(treeWithLegitSubTree, treeWithStringSubTree)
        ).to.throw();
    });
});

@ASTNode("", "SimpleNode")
class SimpleNode extends Node implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree: Node[];
    constructor(name?: string, subTree: Node[] = []) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}

@ASTNode("", "AnotherSimpleNode")
class AnotherSimpleNode extends Node implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree: Node[];
    constructor(name?: string, subTree: Node[] = []) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}

@ASTNode("", "NodeWithStringSubTree")
class NodeWithStringSubTree extends Node implements PossiblyNamed {
    @Property() public name?: string;
    @Children() public subTree?: string;
    constructor(name?: string, subTree?: string) {
        super();
        this.name = name;
        this.subTree = subTree;
    }
}