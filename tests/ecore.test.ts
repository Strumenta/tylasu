import {expect} from "chai";

import {ASTNode, getNodeDefinition, Node, NODE_TYPES} from "../src";
import {toECoreModel} from "../src/interop/ecore";

@ASTNode()
class SomeNode extends Node {}

@ASTNode("some.package")
class SomeNodeInPackage extends Node {}

describe('Ecore', function() {
    it("default package",
        function () {
            const ePackage = toECoreModel("");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size()).to.equal(1);
            expect(ePackage.get("eClassifiers").at(0).get('name')).to.equal("SomeNode");
        });
    it("named package",
        function () {
            const ePackage = toECoreModel("some.package");
            expect(ePackage).not.to.be.undefined;
            expect(ePackage.get("eClassifiers").size()).to.equal(1);
            expect(ePackage.get("eClassifiers").at(0).get('name')).to.equal("SomeNodeInPackage");
        });
});
