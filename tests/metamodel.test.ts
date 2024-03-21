import {expect} from "chai";

import {getNodeDefinition, NODE_TYPES} from "../src";
import {SomeNode, SomeNodeInPackage, SomeNodeWithReferences} from "./nodes";

describe('Meta model', function () {
    it("info recorded in the default package",
        function () {
            expect(NODE_TYPES[""]).not.to.be.undefined;
            expect(NODE_TYPES[""].nodes["SomeNode"]).to.equal(SomeNode);
            const def = getNodeDefinition(SomeNode);
            expect(def).not.to.be.undefined;
            expect(def!.package).to.equal("");
            expect(def!.name).to.equal("SomeNode");
        });
    it("info recorded in some named package",
        function () {
            expect(NODE_TYPES["some.package"]).not.to.be.undefined;
            expect(NODE_TYPES["some.package"].nodes["SomeNodeInPackage"]).to.equal(SomeNodeInPackage);
            const def = getNodeDefinition(SomeNodeInPackage);
            expect(def).not.to.be.undefined;
            expect(def!.package).to.equal("some.package");
            expect(def!.name).to.equal("SomeNodeInPackage");
            expect(def!.features["nonExistent"]).to.be.undefined;
            expect(def!.features["someNode"]).not.to.be.undefined;
            expect(def!.features["someNode"].multiple).to.be.false;
            expect(def!.features["multi"]).not.to.be.undefined;
            expect(def!.features["multi"].multiple).to.be.true;
        });
    it("records references",
        function () {
            const def = getNodeDefinition(SomeNodeWithReferences);
            expect(def).not.to.be.undefined;
            expect(def!.features["a"].reference).to.be.undefined;
            expect(def!.features["ref"].reference).to.be.true;
        });
});
