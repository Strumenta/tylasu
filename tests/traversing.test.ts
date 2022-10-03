import {expect} from "chai";

import {Node, pos} from "../src";
import {Box, Item} from "./nodes";
import {map, pipe, reduce} from "iter-ops";

function printSequence(sequence: Generator<Node>): string {
    return pipe(sequence, map(n => {
        if(n instanceof Box || n instanceof Item) {
            return n.name;
        } else {
            throw new Error("Unsupported node: " + n);
        }
    }), reduce((s1, s2) => s1 + (s1 ? ", " : "") + s2, "")).first;
}

const testCase = new Box(
    "root",
    [
        new Box(
            "first",[new Item("1", pos(3, 6, 3, 12))],
            pos(2, 3, 4, 3)),
        new Item("2", pos(5, 3, 5, 9)),
        new Box("big",[
            new Box("small",[
                new Item("3", pos(8, 7, 8, 13)),
                new Item("4", pos(9, 7, 9, 13)),
                new Item("5", pos(10, 7, 10, 13))
                ],
                pos(7, 5, 11, 5))],
            pos(6, 3, 12, 3)),
        new Item("6", pos(13, 3, 13, 9))
    ],
    pos(1, 1, 14, 1));

describe('Structurally', function() {
    it("depth-first",
        function () {
            const result = "root, first, 1, 2, big, small, 3, 4, 5, 6";
            expect(printSequence(testCase.walk())).to.equal(result);
        });

    it("descendants",
        function () {
            const result = "first, 1, 2, big, small, 3, 4, 5, 6";
            expect(printSequence(testCase.walkDescendants())).to.equal(result);
        });
});

describe('By position', function() {
    it("within outside position",
        function () {
            const position = pos(15, 1, 15, 1);
            const result = printSequence(testCase.walkWithin(position));
            expect(result).to.equal("");
        });

    it("with root position",
        function () {
            const position = pos(1, 1, 14, 1);
            const result = printSequence(testCase.walkWithin(position));
            expect(result).to.equal("root, first, 1, 2, big, small, 3, 4, 5, 6");
        });

    it("with leaf position",
        function () {
            const position = pos(13, 3, 13, 9);
            const result = printSequence(testCase.walkWithin(position));
            expect(result).to.equal("6");
        });

    it("with subtree position",
        function () {
            const position = pos(7, 5, 11, 5);
            const result = printSequence(testCase.walkWithin(position));
            expect(result).to.equal("small, 3, 4, 5");
        });
});