import { expect } from "chai";
import { Box, SomeNode, SomeNodeInPackage } from "../nodes";

describe('Node.transformChildren', () => {
    let childNode1: SomeNode;
    let childNode2: SomeNode;
    let boxNode: Box;

    beforeEach(() => {
        childNode1 = new SomeNode("Child1");
        childNode2 = new SomeNode("Child2");

        boxNode = new Box("BoxNode", [childNode1, childNode2]);
    })

    it('should apply in-place transformation to each child node', () => {
        const inPlaceTransformation = (node: SomeNode): SomeNode => {
            node.a = node.a?.toUpperCase();
            return node;
        };

        boxNode.transformChildren(inPlaceTransformation);

        expect(boxNode.contents[0]["a"]).to.eq("CHILD1");
        expect(boxNode.contents[0]).to.eq(childNode1);
        expect(boxNode.contents[1]["a"]).to.eq("CHILD2");
        expect(boxNode.contents[1]).to.eq(childNode2);
    });

    it('should replace children nodes when used with pure-functions', () => {
        const replaceTransformation = (node: SomeNode): SomeNode => {
            return new SomeNode(node.a?.toUpperCase())
        };

        boxNode.transformChildren(replaceTransformation);

        expect(boxNode.contents[0]["a"]).to.eq("CHILD1");
        expect(boxNode.contents[0]).to.not.eq(childNode1);
        expect(boxNode.contents[1]["a"]).to.eq("CHILD2");
        expect(boxNode.contents[1]).to.not.eq(childNode2);
    });
});

describe('Node.replaceWith', () => {
    it('should replace a child node with another node', () => {
        const childNode1 = new SomeNode("Child1");
        const childNode2 = new SomeNode("Child2");

        const parentNode = new SomeNodeInPackage("ParentNode");

        parentNode.setChild('someNode', childNode1);
        expect(parentNode.getChildren('someNode')).to.eql([childNode1]);
        childNode1.replaceWith(childNode2);
        expect(parentNode.getChildren('someNode')).to.eql([childNode2]);
    });

    it('should throw error if parent is not set', () => {
        const childNode1 = new SomeNode("Child1");

        const nodeWithoutParent = new SomeNode("NodeWithoutParent");
        expect(() => nodeWithoutParent.replaceWith(childNode1)).to.throw('Cannot replace a Node that has no parent');
    });
});

