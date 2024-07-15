import {expect} from "chai";

import {
    ASTNode,
    ASTTransformer, Attribute,
    Child,
    ErrorNode, GenericErrorNode,
    IssueSeverity,
    Node,
    pos,
} from "../../src";

@ASTNode("", "A")
class A extends Node {
    @Child()
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

class B extends Node {
    @Child()
    aChild: Node;
    @Attribute()
    property: number;
    other2: string;
    notThere: any;
    method: string;
    nested: string;
    @Child()
    error: ErrorNode;
}

class C extends Node {}

class D extends Node {
    a;
    b;
}

class AA extends A {}
class AAA extends AA {}

describe("AST Transformers", function () {
    it("A => B, model to model",
        function () {
            const nodeA = new A();
            nodeA.child = new A();
            nodeA.property = 42;
            nodeA.other = "other";
            const transformer = new ASTTransformer();
            transformer.registerNodeFactory(A, (a) => {
                const b = new B();
                b.property = a.property;
                b.other2 = a.other;
                b.method = a.method();
                b.nested = a.outer().inner;
                return b;
            })
                .withChild({ source: "child", target: "aChild" })
                // TODO Not even Kolasu handles this:
                //  .withChild({ source: "error", target: "error" });
            const nodeB = transformer.transform(nodeA) as B;
            expect(nodeB.origin).to.equal(nodeA);
            expect(nodeB.property).to.equal(42);
            expect(nodeB.other2).to.equal("other");
            expect(nodeB.aChild).not.to.be.undefined;
            expect(nodeB.notThere).to.be.undefined;
            expect(nodeB.method).to.equal("method");
            expect(nodeB.nested).to.equal("innerValue");
            expect(nodeB.aChild instanceof B).to.be.true;
            // TODO see above expect(nodeB.error).to.be.instanceof(GenericErrorNode);
            // expect(nodeB.error.message).to.equal("Exception Error: I don't like this");
        });
    it("handles exceptions",
        function () {
            const node1 = new C();

            const transformer = new ASTTransformer();
            transformer.registerNodeFactory(C, () => {
                const d = new D();
                d.a = "OK";
                throw new Error("Broken");
            });

            const node2 = transformer.transform(node1) as Node;
            expect(node2 instanceof GenericErrorNode).to.be.true;
        });
    it("collects issues", function () {
       const transformer = new ASTTransformer();
       transformer.addIssue("error", IssueSeverity.ERROR);
       transformer.addIssue("warning", IssueSeverity.WARNING);
       transformer.addIssue("info", IssueSeverity.INFO, pos(1, 0, 1, 2));

       expect(transformer.issues[0].message).to.be.equal("Error");
       expect(transformer.issues[1].message).to.be.equal("Warning");
       expect(transformer.issues[2].message).to.be.equal("Info");
   });
   it("transform function does not accept collections as source", function () {
       const transformer = new ASTTransformer();
       expect(() =>
           transformer.transform([])
       ).to.throw();
   });
   it("no node factories defined, with allowGenericNode=false, throws", function () {
       const transformer = new ASTTransformer(undefined, false);
       expect(() =>
           transformer.transform(new A())
       ).to.throw();
    });
   it("no node factories defined, with allowGenericNode=true, returns", function () {
       const transformer = new ASTTransformer(undefined, true);
       transformer.transform(new A());
       expect(transformer.issues.length).to.equal(1);
       expect(transformer.issues[0].message).to.contain("not mapped: A");
    });
    it("Factory that transform from a node A to a node C", function () {
        let tree: Node | undefined = new A();
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
            .withChild({ source: "child", target: "child" });
        transformer.registerNodeFactory(C, () => new A());
        const transformedTree = transformer.transform(tree);

        expect(transformedTree).to.be.instanceof(A);
        expect((transformedTree as A).child).to.be.instanceof(A);
    });
    it("Factory that returns an undefined node", function () {
        let tree : Node | undefined = new A();

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
