import {Box, Item} from "../nodes";
import {expect} from "chai";
import {assignParents} from "../../src";
import {printSequence, testCase} from "../traversing.test";

describe('Traversing structurally', function() {
    it("depth-first",
        function () {
            const result = "root, first, 1, 2, nested, big, small, 3, 4, 5, 6";
            expect(printSequence(testCase.walk())).to.equal(result);
        });
    it("ancestors",
        function () {
            assignParents(testCase);
            const item4 = ((testCase.contents[2] as Box).contents[0] as Box).contents[1];
            const result = printSequence(item4.walkAncestors());
            expect(result).to.equal("small, big, root");
        });
    it("descendants",
        function () {
            const result = "first, 1, 2, nested, big, small, 3, 4, 5, 6";
            expect(printSequence(testCase.walkDescendants())).to.equal(result);
        });
    it("ancestor of type", () => {
        expect((testCase.contents[1] as Item).findAncestorOfType(Box)).to.equal(testCase);
    });
});

