import {
    ASTNode,
    Attribute,
    Child,
    Children,
    ErrorNode,
    Node,
    Position,
    PossiblyNamed,
    Reference,
    ReferenceByName
} from "../src";

export class Box extends Node {
    @Children()
    contents: Node[];

    constructor(public name: string, contents: Node[], positionOverride?: Position) {
        super(positionOverride);
        this.contents = contents;
    }
}

export class Item extends Node {
    @Child()
    nested?: Item;
    constructor(public name: string, positionOverride?: Position) {
        super(positionOverride);
    }

    withNested(nested: Item) {
        this.nested = nested;
        return this;
    }
}

export enum Fibo {
    A = 1,
    B = 2,
    C = A + B,
    D = B + C
}

@ASTNode("", "SomeNode")
export class SomeNode extends Node implements PossiblyNamed {
    @Attribute()
    a?: string;
    @Attribute()
    fib: Fibo

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }

    get name(): string | undefined {
        return this.a;
    }
}

@ASTNode("some.package", "SomeNodeInPackage")
export class SomeNodeInPackage extends Node {
    @Attribute()
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
    @Attribute()
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

@ASTNode("", "SomeNodeWithReferences")
export class SomeNodeWithReferences extends Node {
    @Attribute()
    a?: string;
    @Reference()
    ref: ReferenceByName<SomeNode> = new ReferenceByName<SomeNode>("a")

    constructor(a?: string, positionOverride?: Position) {
        super(positionOverride);
        this.a = a;
    }
}
