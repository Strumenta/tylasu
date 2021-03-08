import {expect} from "chai";

import {fromEObject, registerECoreModel, toEObject} from "../src/interop/ecore";
import {SomeNodeInPackage} from "./nodes";

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
            expect(eClass.get('eStructuralFeatures').size()).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("a");
        });
});

describe('Model generation', function() {
    it("simple EObject creation",
        function () {
            const eObject = toEObject(new SomeNodeInPackage("aaa"));
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("a")).to.equal("aaa");
            const node = fromEObject(eObject) as SomeNodeInPackage;
            expect(node instanceof SomeNodeInPackage).to.be.true;
            expect(node.a).to.equal("aaa");
        });
});
