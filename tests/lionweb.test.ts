import {expect} from "chai";
import {getConcept} from "../src";
import {NodeSubclass, SomeNode, SomeNodeInPackage} from "./nodes";
import {Concept, Containment, Link} from "lioncore";

function getFeatureByName(concept: Concept, name: string) {
    return concept.allFeatures().find(f => f.name == name);
}

describe('Lionweb metamodel', function() {
    it("Can construct a Concept for a Node",
        function () {
            const concept = getConcept(SomeNodeInPackage)!;
            //TODO bug in Lioncore? expect(concept!.namespaceQualifier()).to.equal("some.package");
            expect(concept.extends).to.be.undefined;
            expect(concept.name).to.equal("SomeNodeInPackage");
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
    it("Cannot construct a Concept without package",
        function () {
            expect(() => getConcept(SomeNode)).to.throw;
        });
    it("Supports inheritance",
        function () {
            const concept = getConcept(NodeSubclass)!;
            const parentConcept = getConcept(SomeNodeInPackage);
            expect(concept.extends).to.equal(parentConcept);
            //TODO bug in Lioncore? expect(concept!.namespaceQualifier()).to.equal("some.package");
            expect(concept.name).to.equal("NodeSubclass");
            expect(concept.qualifiedName()).to.equal("some.package.NodeSubclass");
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
            expect(selfRefF.type).to.equal(parentConcept);
            const anotherChildF = getFeatureByName(concept, "anotherChild") as Link;
            expect(anotherChildF instanceof Containment).to.be.true;
            expect(anotherChildF.type).to.equal(parentConcept);
        });
    it("Works on instances",
        function () {
            const concept = getConcept(new NodeSubclass())!;
            const parentConcept = getConcept(new SomeNodeInPackage());
            expect(concept.extends).to.equal(parentConcept);
            //TODO bug in Lioncore? expect(concept!.namespaceQualifier()).to.equal("some.package");
            expect(concept.name).to.equal("NodeSubclass");
            expect(concept.qualifiedName()).to.equal("some.package.NodeSubclass");
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
            expect(selfRefF.type).to.equal(parentConcept);
            const anotherChildF = getFeatureByName(concept, "anotherChild") as Link;
            expect(anotherChildF instanceof Containment).to.be.true;
            expect(anotherChildF.type).to.equal(parentConcept);
        });
});
