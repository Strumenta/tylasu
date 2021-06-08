import {expect} from "chai";

import {ASTNode, Child, GenericNode, Node} from "../src";
import {JSONGenerator} from "../src/interop/json";

describe('JSON generator', function() {
    it("Empty AST",
        function () {
            const json = new JSONGenerator().toJSON(new GenericNode());
            expect(json).to.deep.equal({
                type: "GenericNode"
            });
        });
    it("Empty AST with potential children",
        function () {
            const json = new JSONGenerator().toJSON(new NodeWithChildren());
            expect(json).to.deep.equal({
                type: "NodeWithChildren"
            });
        });
    it("AST node with payload and no children",
        function () {
            const node = new NodeWithChildren();
            node.payload = 42;
            const json = new JSONGenerator().toJSON(node);
            expect(json).to.deep.equal({
                type: "NodeWithChildren",
                payload: 42
            });
        });
    it("AST node with child",
        function () {
            const node = new NodeWithChildren();
            node.payload = 1;
            const child = new NodeWithChildren();
            child.payload = 2;
            node.setChild("singleChild", child);
            const json = new JSONGenerator().toJSON(node);
            expect(json).to.deep.equal({
                type: "NodeWithChildren",
                payload: 1,
                singleChild: { type: "NodeWithChildren", payload: 2 }
            });
        });
    it("AST node with child collection",
        function () {
            const node = new NodeWithChildren();
            node.payload = 1;
            let child = new NodeWithChildren();
            child.payload = 2;
            node.addChild("childrenCollection", child);
            child = new NodeWithChildren();
            child.payload = 3;
            node.addChild("childrenCollection", child);
            const json = new JSONGenerator().toJSON(node);
            expect(json).to.deep.equal({
                type: "NodeWithChildren",
                payload: 1,
                childrenCollection: [
                    { type: "NodeWithChildren", payload: 2 },
                    { type: "NodeWithChildren", payload: 3 }]
            });
        });
    it("AST node with children",
        function () {
            const node = new NodeWithChildren();
            node.payload = 1;
            let child = new NodeWithChildren();
            child.payload = 2;
            node.setChild("singleChild", child);
            child = new NodeWithChildren();
            child.payload = 3;
            node.addChild("childrenCollection", child);
            child = new NodeWithChildren();
            child.payload = 4;
            node.addChild("childrenCollection", child);
            const json = new JSONGenerator().toJSON(node);
            expect(json).to.deep.equal({
                type: "NodeWithChildren",
                payload: 1,
                singleChild: { type: "NodeWithChildren", payload: 2 },
                childrenCollection: [
                    { type: "NodeWithChildren", payload: 3 },
                    { type: "NodeWithChildren", payload: 4 }]
            });
        });
    it("Wrongly configured node",
        function () {
            expect(() => require("./wrong-node")).to.throw;
        });
});

@ASTNode("", "NodeWithChildren")
class NodeWithChildren extends Node {
    payload: number
    @Child()
    singleChild: NodeWithChildren
    @Child()
    childrenCollection: NodeWithChildren[]
}