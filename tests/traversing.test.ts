import {expect} from "chai";

import {Node, pos, Position} from "../src";
import {Box, Item} from "./nodes";
import {map, pipe, reduce} from "iter-ops";

export function printSequence(sequence: Generator<Node>): string {
    return pipe(sequence, map(n => {
        if(n instanceof Box || n instanceof Item) {
            return n.name;
        } else {
            throw new Error("Unsupported node: " + n);
        }
    }), reduce((s1, s2) => s1 + (s1 ? ", " : "") + s2, "")).first;
}

function* of(node?: Node): Generator<Node> {
    if (node) {
        yield node;
    }
}

export const testCase = new Box(
    "root",
    [
        new Box(
            "first",[new Item("1", pos(3, 6, 3, 12))],
            pos(2, 3, 4, 3)),
        new Item("2", pos(5, 3, 5, 9)).withNested(new Item("nested")),
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

    it("with point inside leaf",
        function () {
            const position = pos(13, 4, 13, 5)
            expect(printSequence(testCase.walkWithin(position))).to.equal("");
        });

    it("with subtree position",
        function () {
            const position = pos(7, 5, 11, 5);
            const result = printSequence(testCase.walkWithin(position));
            expect(result).to.equal("small, 3, 4, 5");
        });

    it("find", function () {
        const leaf1: Position = pos(13, 4, 13, 5);
        expect(printSequence(testCase.searchByPosition(leaf1, true))).to.equal("root, 6");
        expect(printSequence(of(testCase.findByPosition(leaf1, true)))).to.equal("6");
        expect(printSequence(testCase.searchByPosition(leaf1, false))).to.equal("root, 6");
        expect(printSequence(of(testCase.findByPosition(leaf1, false)))).to.equal("6");

        const leaf2: Position = pos(10, 8, 10, 12);
        expect(printSequence(testCase.searchByPosition(leaf2, true))).to.equal("root, big, small, 5");
        expect(printSequence(of(testCase.findByPosition(leaf2, true)))).to.equal("5");
        expect(printSequence(testCase.searchByPosition(leaf2, false))).to.equal("root, big, small, 5");
        expect(printSequence(of(testCase.findByPosition(leaf2, false)))).to.equal("5");

        const internal: Position = pos(8, 8, 10, 12);
        expect(printSequence(testCase.searchByPosition(internal, true))).to.equal("root, big, small");
        expect(printSequence(of(testCase.findByPosition(internal, true)))).to.equal("small");
        expect(printSequence(testCase.searchByPosition(internal, false))).to.equal("root, big, small");
        expect(printSequence(of(testCase.findByPosition(internal, false)))).to.equal("small");

        const outside: Position = pos(100, 100, 101, 101);
        expect(printSequence(testCase.searchByPosition(outside, true))).to.equal("");
        expect(testCase.findByPosition(outside, true)).to.be.undefined;
        expect(printSequence(testCase.searchByPosition(outside, false))).to.equal("");
        expect(testCase.findByPosition(outside, false)).to.be.undefined;
    });
});
