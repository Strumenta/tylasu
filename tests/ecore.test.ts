import {expect} from "chai";

import {ASTNode, Node, Position, Property} from "../src";
import {registerECoreModel, toEObject} from "../src/interop/ecore";

//Renamed as ...1 because it clashes with metamodel.test.ts. We should handle that more reliably (with a specific exception).
@ASTNode()
class SomeNode1 extends Node {}

@ASTNode("some.package")
class SomeNodeInPackage1 extends Node {
    @Property()
    a: string;

    constructor(a: string, protected specifiedPosition?: Position) {
        super(specifiedPosition);
        this.a = a;
    }
}

describe('Ecore metamodel', function() {
    it("default package",
        function () {
            const ePackage = registerECoreModel("");
            expect(ePackage).not.to.be.undefined;
            const classes = ePackage.get("eClassifiers");
            expect(classes.size() > 0).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNode1");
            expect(eClass).not.to.be.undefined;
        });
    it("named package",
        function () {
            const ePackage = registerECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size() >= 1).to.be.true;
            const eClass = ePackage.get("eClassifiers").find(ec => ec.get('name') == "SomeNodeInPackage1");
            expect(eClass).not.to.be.undefined;
            expect(eClass.get('eStructuralFeatures').size()).to.equal(1);
            expect(eClass.get('eStructuralFeatures').at(0).get("name")).to.equal("a");
        });
});

describe('Model generation', function() {
    it("simple EObject creation",
        function () {
            const eObject = toEObject(new SomeNodeInPackage1("aaa"));
            expect(eObject).not.to.be.undefined;
            expect(eObject.get("a")).to.equal("aaa");
        });
});
