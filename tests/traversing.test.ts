import {expect} from "chai";

import {Node} from "../src";
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
        new Box("first",[new Item("1")]),
        new Item("2"),
        new Box("big",[new Box("small",
            [new Item("3"), new Item("4"), new Item("5")])]),
        new Item("6")
    ]);

describe('Tree traversing', function() {
    it("depth-first",
        function () {
            expect(printSequence(testCase.walk())).to.equal("root, first, 1, 2, big, small, 3, 4, 5, 6");
        });
});