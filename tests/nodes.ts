import {NodeName, Child, Children, ASTNode, Position, Property} from "../src";

export class Box extends ASTNode {
    @Children()
    @Reflect.metadata("design:arrayElementType", ASTNode)
    contents: ASTNode[];

    constructor(public name: string, contents: ASTNode[], positionOverride?: Position) {
        super(positionOverride);
        this.contents = contents;
    }
}

export class Item extends ASTNode {
    constructor(public name: string, positionOverride?: Position) {
        super(positionOverride);
    }
}

export enum Fibo {
    A = 1,
    B = 1,
    C = A + B,
    D = B + C
}

@NodeName("", "SomeNode")
export class SomeNode extends ASTNode {
    @Property()
    a?: string;
    @Property()
    fib: Fibo

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }
}

@NodeName("some.package", "SomeNodeInPackage")
export class SomeNodeInPackage extends ASTNode {
    @Property()
    a?: string;
    @Child()
    someNode: SomeNode;
    @Children()
    multi: SomeNode[] = [];
    @Child()
    selfRef: SomeNodeInPackage;

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }
}

@NodeName("some.package", "NodeSubclass")
export class NodeSubclass extends SomeNodeInPackage {
    @Property()
    a: string;
    @Property()
    b: string;
    @Child()
    anotherChild: SomeNodeInPackage;
}

@NodeName("another.package", "SomeNodeInPackage")
export class SomeNodeInAnotherPackage extends ASTNode {}
