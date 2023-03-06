import {expect} from "chai";
import {getConcept} from "../src";
import {SomeNode, SomeNodeInPackage} from "./nodes";
import {Concept, Containment, Link} from "lioncore";

function getFeatureByName(concept: Concept, name: string) {
    return concept.allFeatures().find(f => f.simpleName == name);
}

describe('Lionweb metamodel', function() {
    it("Concept is computed",
        function () {
            const concept = getConcept(SomeNodeInPackage)!;
            //TODO bug in Lioncore? expect(concept!.namespaceQualifier()).to.equal("some.package");
            expect(concept.simpleName).to.equal("SomeNodeInPackage");
            expect(concept.qualifiedName()).to.equal("some.package.SomeNodeInPackage");
            expect(getFeatureByName(concept, "doesntExist")).to.be.undefined;
            expect(getFeatureByName(concept, "a")).not.to.be.undefined;
            const someNodeF = getFeatureByName(concept, "someNode") as Link;
            expect(someNodeF instanceof Containment).to.be.true;
            expect(someNodeF.type).to.be.null;
            const multiF = getFeatureByName(concept, "multi") as Link;
            expect(multiF instanceof Containment).to.be.true;
            expect(multiF.multiple).to.be.true;
            expect(multiF.type).to.be.null;
            const selfRefF = getFeatureByName(concept, "selfRef") as Link;
            expect(selfRefF instanceof Containment).to.be.true;
            expect(selfRefF.type).to.equal(concept);
        });
    it("Concept is not computed without package",
        function () {
            expect(() => getConcept(SomeNode)).to.throw;
        });
});
