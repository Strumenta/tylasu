import {expect} from "chai";

import {
    NodeName,
    ASTTransformer,
    Child,
    ErrorNode,
    Init,
    IssueSeverity,
    Mapped,
    ASTNode, NodeFactory,
    NodeTransform,
    PartiallyInitializedNode, pos, Position,
    Property,
    transform
} from "../../src";
import exp = require("constants");

@NodeName("", "A")
class A extends ASTNode {
    child: ASTNode;
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
class B extends ASTNode {
    @Child()
    @Mapped("child")
    aChild: ASTNode;
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

class C extends ASTNode {}
@NodeTransform(C)
class D extends ASTNode {
    a;
    b;
    @Init
    brokenInit() {
        this.a = "OK";
        throw new Error("Broken");
    }
}

class AA extends A {}
class AAA extends AA {}

describe('AST transformations', function() {
    it("A => B, model to model",
        function () {
            const nodeA = new A();
            nodeA.child = new A();
            nodeA.property = 42;
            nodeA.other = "other";
            const nodeB = transform(nodeA) as B;
            expect(nodeB instanceof B).to.be.true;
            expect(nodeB.origin).to.be.undefined;
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

describe("Transformers", function () {
    it("Correctly collecting issues", function () {
       const transformer = new ASTTransformer();
       transformer.addIssue("error", IssueSeverity.ERROR);
       transformer.addIssue("warning", IssueSeverity.WARNING);
       transformer.addIssue("info", IssueSeverity.INFO, pos(1, 0, 1, 2));

       expect(transformer.issues[0].message
       ).to.be.equal("error");
       expect(transformer.issues[1].message
       ).to.be.equal("warning");
       expect(transformer.issues[2].message
       ).to.be.equal("info");
   });
   it("Transform function does not accept collections as source", function () {
       const transformer = new ASTTransformer();
       expect(() =>
           transformer.transform([])
       ).to.throw();
   });
   it("No node factories defined, with allowGenericNode=false", function () {
       const transformer = new ASTTransformer(undefined, false);
       expect(() =>
           transformer.transform(new A())
       ).to.throw();
    });
   it("No node factories defined, with allowGenericNode=true", function () {
       const transformer = new ASTTransformer(undefined, true);
       transformer.transform(new A());
       expect(transformer.issues.length).to.equal(1);
       expect(transformer.issues[0].message).to.contain("not mapped: A");
    });
    it("Factory that transform from a node A to a node C", function () {
        let tree: ASTNode | undefined = new A();
        expect(tree).to.be.instanceof(A);

        const transformer = new ASTTransformer(undefined, true);
        transformer.registerNodeFactory(A,(source) => new C());
        tree = transformer.transform(tree);
        expect(tree).to.be.instanceof(C);
    });
    it("Identity transformation", function () {
        const tree = new A();

        const transformer = new ASTTransformer(undefined, true);
        transformer.registerIdentityTransformation(A);
        const transformedTree = transformer.transform(tree);

        expect(transformedTree).to.be.instanceof(A);
    });
    it("Factory is expected to act on the whole tree", function () {
        const tree = new A();
        tree.child = new C();

        const transformer = new ASTTransformer(undefined, true);
        transformer.registerIdentityTransformation(A)
            .withChild(
                (source: A) => source.child,
                (target: A, child?: ASTNode) => target.child = child!,
                "child",
                A
            );
        transformer.registerNodeFactory(C,(source) => new A());
        const transformedTree = transformer.transform(tree);

        expect(transformedTree).to.be.instanceof(A);
        expect((transformedTree as A).child).to.be.instanceof(A);
    });
    it("Factory that returns an undefined node", function () {
        let tree : ASTNode | undefined = new A();

        const transformer = new ASTTransformer(undefined, true);
        transformer.registerNodeFactory(A,(source) => undefined);
        tree = transformer.transform(tree);

        expect(tree).to.be.undefined;
    });
    it("Select the closest node factory in the class hierarchy", function () {
        const tree = new AAA();

        const transformer = new ASTTransformer(undefined, true);
        transformer.registerNodeFactory(A,(source) => new B());
        transformer.registerNodeFactory(AA, (source) => new C());

        const transformedTree = transformer.transform(tree);
        expect(transformedTree).to.be.instanceof(C);
    });
});
