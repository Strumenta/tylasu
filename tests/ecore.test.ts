import {expect} from "chai";

import {fromEObject, registerECoreModel, toEObject} from "../src/interop/ecore";
import {SomeNode, SomeNodeInPackage} from "./nodes";
import * as Ecore from "ecore/dist/ecore";
import * as fs from "fs";
import {EPackage} from "ecore";

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
            expect(eClass.get('eStructuralFeatures').size()).to.equal(2);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("a");
            expect(eClass.get('eStructuralFeatures').at(1).get("name")).to.equal("someNode");
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
                const buffer = fs.readFileSync("tests/data/simplem.json");
                Ecore.JSON.parse(r, buffer.toString());
                const model = r.get("contents").at(1);
                expect(model).not.to.be.null;
                expect(model).not.to.be.undefined;
                expect(model.eClass?.get("name")).to.equal("CompilationUnit");
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
            node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.a).to.equal("aaa");
            expect(node.someNode instanceof SomeNode).to.be.true;
            expect(node.someNode.a).to.equal("A");
        });
});
