import {expect} from "chai";

import {Node, NODE_TYPES, Point, Position, SYMBOL_NODE_NAME} from "../src";
import {
    fromEObject,
    generateASTClasses,
    registerECoreModel,
    SYMBOL_CLASS_DEFINITION,
    toEObject
} from "../src/interop/ecore";
import {SomeNode, SomeNodeInPackage} from "./nodes";
import * as Ecore from "ecore/dist/ecore";
import * as fs from "fs";

describe('Ecore metamodel', function() {
    it("default package",
        function () {
            const ePackage = registerECoreModel("");
            expect(ePackage).not.to.be.undefined;
            const classes = ePackage.get("eClassifiers");
            expect(classes.size() > 0).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNode");
            expect(eClass).not.to.be.undefined;
        });
    it("named package",
        function () {
            const ePackage = registerECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size() >= 1).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNodeInPackage");
            expect(eClass).not.to.be.undefined;
            expect(eClass.get('eStructuralFeatures').size()).to.equal(3);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("a");
            expect(eClass.get('eStructuralFeatures').at(0).get("upperBound")).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(1).get("name")).to.equal("someNode");
            expect(eClass.get('eStructuralFeatures').at(1).get("upperBound")).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(2).get("name")).to.equal("multi");
            expect(eClass.get('eStructuralFeatures').at(2).get("upperBound")).to.equal(-1);
            expect(eClass.get('eStructuralFeatures').at(2).get("containment")).to.be.true;
        });
    it("inheritance",
        function () {
            const ePackage = registerECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size() >= 1).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "NodeSubclass");
            expect(eClass).not.to.be.undefined;
            expect(eClass.get('eStructuralFeatures').size()).to.equal(2);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("b");
            expect(eClass.get('eStructuralFeatures').at(1).get("name")).to.equal("anotherChild");
            expect(eClass.get('eAllStructuralFeatures').length).to.equal(6);
            expect(eClass.get('eAllStructuralFeatures')[0].get("name")).to.equal("position");
            expect(eClass.get('eAllStructuralFeatures')[1].get("name")).to.equal("a");
            expect(eClass.get('eAllStructuralFeatures')[2].get("name")).to.equal("someNode");
            expect(eClass.get('eAllStructuralFeatures')[3].get("name")).to.equal("multi");
            expect(eClass.get('eAllStructuralFeatures')[4].get("name")).to.equal("b");
            expect(eClass.get('eAllStructuralFeatures')[5].get("name")).to.equal("anotherChild");
        });
    it("importing",
    function () {
            const resourceSet = Ecore.ResourceSet.create();
            const resource = resourceSet.create({ uri: 'file:data/simplemm.json' });
            const buffer = fs.readFileSync("tests/data/simplemm.json");
            resource.load(buffer.toString(), (r, e) => {
                expect(r).not.to.be.null;
                expect(r).not.to.be.undefined;
                const ePackage = r.get("contents").at(0);
                if(!ePackage.get("nsURI")) {
                    ePackage.set("nsURI", "");
                }
                Ecore.EPackage.Registry.register(ePackage);
                const pkg = generateASTClasses(ePackage);
                expect(Object.keys(pkg.nodes).length).to.equal(5);
                expect(NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]).not.to.be.undefined;

                expect(NODE_TYPES["SimpleMM"].nodes["CompilationUnit"][SYMBOL_CLASS_DEFINITION]).to.equal(
`@ASTNode("SimpleMM")
class CompilationUnit extends Node {
\t@Child()
\tstatements;
}`);
                let node = new NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]() as any;
                expect(node instanceof Node).to.be.true;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("CompilationUnit");
                node = new NODE_TYPES["SimpleMM"].nodes["Statement"]() as any;
                expect(node instanceof Node).to.be.true;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("Statement");
                //Subclassing
                expect(NODE_TYPES["SimpleMM"].nodes["StringLiteral"][SYMBOL_CLASS_DEFINITION]).to.equal(
`@ASTNode("SimpleMM")
class StringLiteral extends Expression {
\t@Property()
\tvalue;
}`);
                node = new NODE_TYPES["SimpleMM"].nodes["StringLiteral"]() as any;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["Expression"]).to.be.true;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["StringLiteral"]).to.be.true;
                expect(node instanceof NODE_TYPES["SimpleMM"].nodes["CompilationUnit"]).to.be.false;
                expect(node.constructor[SYMBOL_NODE_NAME]).to.equal("StringLiteral");

                expect(NODE_TYPES[""].nodes["CompilationUnit"]).to.be.undefined;

                const buffer = fs.readFileSync("tests/data/simplem.json");
                Ecore.JSON.parse(r, buffer.toString());
                const cu = r.get("contents").at(1);
                expect(cu).not.to.be.null;
                expect(cu).not.to.be.undefined;
                expect(cu.eClass?.get("name")).to.equal("CompilationUnit");
                node = fromEObject(cu) as any;
                expect(node instanceof Node).to.be.true;
                expect(node.statements.length).to.equal(2);
                expect(node.statements.filter(s => s instanceof Node).length).to.equal(2);
            });
    });
});

describe('Model generation and import', function() {
    it("simple EObject creation",
        function () {
            let node = new SomeNodeInPackage("aaa");
            node.someNode = new SomeNode("A");
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("a")).to.equal("aaa");
            expect(eObject.get("someNode").get("a")).to.equal("A");
            expect(eObject.get("someNode").eContainer).to.equal(eObject);
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.a).to.equal("aaa");
            expect(node.someNode instanceof SomeNode).to.be.true;
            expect(node.someNode.a).to.equal("A");
        });
    it("lists",
        function () {
            let node = new SomeNodeInPackage();
            node.multi = [new SomeNode("A"), new SomeNode("B")];
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("multi").size()).to.equal(2);
            expect(eObject.get("multi").at(0).get("a")).to.equal("A");
            expect(eObject.get("multi").at(0).eContainer === eObject).to.be.true;
            expect(eObject.get("multi").at(1).get("a")).to.equal("B");
            expect(eObject.get("multi").at(1).eContainer === eObject).to.be.true;
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.multi.length).to.equal(2);
            expect(node.multi[0].a).to.equal("A");
            expect(node.multi[0].parent === node).to.be.true;
            expect(node.multi[1].a).to.equal("B");
            expect(node.multi[1].parent === node).to.be.true;
        });
    it("position",
        function () {
            let node = new SomeNodeInPackage("aaa", new Position(new Point(1, 2), new Point(3, 4)));
            const eObject = toEObject(node);
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("position")).not.to.be.undefined;
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.position).not.to.be.undefined;
            expect(node.position.start.line).to.equal(1);
            expect(node.position.start.column).to.equal(2);
            expect(node.position.end.line).to.equal(3);
            expect(node.position.end.column).to.equal(4);
        });
});
