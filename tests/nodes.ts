import {ASTNode, Child, Node, Position, Property} from "../src";

export class Box extends Node {
    @Child()
    contents: Node[];

    constructor(public name: string, contents: Node[]) {
        super();
        this.contents = contents;
    }
}

export class Item extends Node {
    constructor(public name: string) {
        super();
    }
}

@ASTNode()
export class SomeNode extends Node {
    @Property()
    a: string;

    constructor(a?: string, protected specifiedPosition?: Position) {
        super(specifiedPosition);
        this.a = a;
    }
}

@ASTNode("some.package")
export class SomeNodeInPackage extends Node {
    @Property()
    a: string;
    @Child()
    someNode: SomeNode

    constructor(a?: string, protected specifiedPosition?: Position) {
        super(specifiedPosition);
        this.a = a;
    }
}