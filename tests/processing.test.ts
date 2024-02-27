import {expect} from "chai";

import {walkDescendants} from "../src";
import {Box, Item} from "./nodes";

const testCase = new Box(
    "root",
    [
        new Box("first",[new Item("1")]),
        new Item("2"),
        new Box("big",[new Box("small",
            [new Item("3"), new Item("4"), new Item("5")])]),
        new Item("6")
    ]);

const rootP = (n: any) => n instanceof Box && n.name == "root";
const item1P = (n: any) => n instanceof Item && n.name == "1";

describe('Tree processing', function() {
    it("find a node, depth-first",
        function () {
            let result = testCase.find(rootP) as Item;
            expect(result).not.to.be.undefined;
            expect(result.name).to.equal("root");
            result = testCase.find(item1P) as Item;
            expect(result).not.to.be.undefined;
            expect(result.name).to.equal("1");
            result = testCase.find(n => n instanceof Item && n.name == "No, you won't find me") as Item;
            expect(result).to.be.undefined;
        });
    it("find a node, depth-first excluding parent",
        function () {
            let result = testCase.find(rootP, walkDescendants) as Item;
            expect(result).to.be.undefined;
            result = testCase.find(item1P, walkDescendants) as Item;
            expect(result).not.to.be.undefined;
            expect(result.name).to.equal("1");
        });
});
