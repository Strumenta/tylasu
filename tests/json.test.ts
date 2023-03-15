import {expect} from "chai";

import {NodeName, Child, GenericNode, ASTNode, PossiblyNamed, Property, ReferenceByName} from "../src";
import {JSONGenerator} from "../src/interop/json";
import {Indexer} from "../src/interop/indexing";

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
    it("Node with resolved reference by name",
        function () {
            const jsonGenerator = new JSONGenerator();

            const referencedNode = new DummyNamedNode("referencedNode");
            const referencedNodeJson = jsonGenerator.toJSON(referencedNode, Indexer.computeIds(referencedNode));
            const referencedNodeExpectedJson = {
                id: "0",
                type: "DummyNamedNode",
                name: "referencedNode"
            };
            expect(referencedNodeJson).to.deep.equal(referencedNodeExpectedJson);

            const reference = new ReferenceByName<DummyNamedNode>("referencedNode");
            const nodeWithReference = new NodeWithReference("nodeWithReference", reference);
            nodeWithReference.namedNode = referencedNode;
            nodeWithReference.reference!.referred = referencedNode;
            const nodeWithReferenceJson = new JSONGenerator().toJSON(nodeWithReference, Indexer.computeIds(nodeWithReference));
            const nodeWithReferenceExpectedJson = {
                id: "0",
                type: "NodeWithReference",
                name: "nodeWithReference",
                namedNode: {
                    id: "1",
                    name: "referencedNode",
                    type: "DummyNamedNode"
                },
                reference: {
                    name: "referencedNode",
                    referred: "1"
                }
            };
            expect(nodeWithReferenceJson).to.deep.equal(nodeWithReferenceExpectedJson);
        });
    it("Node with unresolved reference by name",
        function () {
            const node = new NodeWithReference(
                "nodeWithReference",
                new ReferenceByName<NodeWithReference>("unknown"));
            const json = new JSONGenerator().toJSON(node, Indexer.computeIds(node));
            expect(json).to.deep.equal({
                id: "0",
                type: "NodeWithReference",
                name: "nodeWithReference",
                reference: {
                    name: "unknown",
                    referred: undefined
                }
            });
        });
    it("Node with resolved self-reference by name",
        function () {
            const jsonGenerator = new JSONGenerator();

            const node = new NodeWithSelfReference("node", new ReferenceByName<NodeWithSelfReference>("node"));
            node.reference!.referred = node;

            const nodeJson = jsonGenerator.toJSON(node, Indexer.computeIds(node));
            const nodeExpectedJson = {
                id: "0",
                type: "NodeWithSelfReference",
                name: "node",
                reference: {
                    name: "node",
                    referred: "0"
                }
            };

            expect(nodeJson).to.deep.equal(nodeExpectedJson);
        });
    it("Node with resolved self-reference by name using IDs for references only",
        function () {
            const jsonGenerator = new JSONGenerator();

            const node = new NodeWithSelfReference("node", new ReferenceByName<NodeWithSelfReference>("node"));
            node.reference!.referred = node;

            const nodeJson = jsonGenerator.toJSON(node, Indexer.computeReferencedIds(node));
            const nodeExpectedJson = {
                id: "0",
                type: "NodeWithSelfReference",
                name: "node",
                reference: {
                    name: "node",
                    referred: "0"
                }
            };

            expect(nodeJson).to.deep.equal(nodeExpectedJson);
        });
});

@NodeName("", "NodeWithChildren")
class NodeWithChildren extends ASTNode {
    payload: number
    @Child()
    singleChild: NodeWithChildren
    @Child()
    childrenCollection: NodeWithChildren[]
}

@NodeName("", "DummyNamedNode")
class DummyNamedNode extends ASTNode implements PossiblyNamed {
    constructor(
        public name?: string
    ) {
        super();
    }
}

@NodeName("", "NodeWithReference")
class NodeWithReference extends ASTNode implements PossiblyNamed {
    constructor(
        public name?: string,
        public reference?: ReferenceByName<DummyNamedNode>) {
        super();
    }
    @Child() namedNode?: DummyNamedNode;
}

@NodeName("", "NodeWithSelfReference")
class NodeWithSelfReference extends ASTNode implements PossiblyNamed {
    @Property() public reference?: ReferenceByName<NodeWithSelfReference>;

    constructor(
        public name?: string,
        reference?: ReferenceByName<NodeWithSelfReference>) {
        super();
        this.reference = reference;
    }
}
