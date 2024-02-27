import {ASTNode, Child, Children, ErrorNode, Node, Position, Property} from "../src";

export class Box extends Node {
    @Children()
    @Reflect.metadata("design:arrayElementType", Node)
    contents: Node[];

    constructor(public name: string, contents: Node[], positionOverride?: Position) {
        super(positionOverride);
        this.contents = contents;
    }
}

export class Item extends Node {
    constructor(public name: string, positionOverride?: Position) {
        super(positionOverride);
    }
}

export enum Fibo {
    A = 1,
    B = 2,
    C = A + B,
    D = B + C
}

@ASTNode("", "SomeNode")
export class SomeNode extends Node {
    @Property()
    a?: string;
    @Property()
    fib: Fibo

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }
}

@ASTNode("some.package", "SomeNodeInPackage")
export class SomeNodeInPackage extends Node {
    @Property()
    a?: string;
    @Child()
    someNode: SomeNode;
    @Children()
    multi: SomeNode[] = [];

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }
}

@ASTNode("some.package", "NodeSubclass")
export class NodeSubclass extends SomeNodeInPackage {
    @Property()
    b: string;
    @Child()
    anotherChild: SomeNodeInPackage;
}

@ASTNode("some.package", "NodeWithError")
export class NodeWithError extends SomeNodeInPackage {
    @Child()
    errorNode: ErrorNode;
}

@ASTNode("another.package", "SomeNodeInPackage")
export class SomeNodeInAnotherPackage extends Node {}
