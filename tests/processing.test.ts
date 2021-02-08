import {expect} from "chai";

import {Child, Node} from "../src";

class Box extends Node {
    @Child()
    contents: Node[];

    constructor(public name: string, contents: Node[]) {
        super();
        this.contents = contents;
    }
}

class Item extends Node {
    constructor(public name: string) {
        super();
    }
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

describe('Tree processing', function() {
    it("find a node",
        function () {
            const result = testCase.find(n => n instanceof Item && n.name == "1") as Item;
            expect(result).not.to.be.undefined;
            expect(result.name).to.equal("1");
        });
});