import {ASTNode, Child, Children, Node, Position, Property} from "../src";

export class Box extends Node {
    @Children()
    @Reflect.metadata("design:arrayElementType", Node)
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

export enum Fibo {
    A = 1,
    B = 1,
    C = A + B,
    D = B + C
}

@ASTNode()
export class SomeNode extends Node {
    @Property()
    a: string;
    @Property()
    fib: Fibo

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
    someNode: SomeNode;
    @Children()
    multi: SomeNode[] = [];

    constructor(a?: string, protected specifiedPosition?: Position) {
        super(specifiedPosition);
        this.a = a;
    }
}

@ASTNode("some.package")
export class NodeSubclass extends SomeNodeInPackage {
    @Property()
    a: string;
    @Property()
    b: string;
    @Child()
    anotherChild: SomeNodeInPackage;
}