import {Node, Origin, Point, Position} from "../";
import {ParserRuleContext, ParseTree, TerminalNode, Token} from "antlr4ng";

// Note: we cannot provide Kolasu-style extension methods on ParseTree because it's an interface.
// Also, Kolasu-style extension methods on Token are problematic because we use Token.EOF below.
// Instead, we opted to provide the same methods as static methods in Position and Point.
declare module "../model/position" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Point {
        export function ofTokenStart(token: Token): Point;
        export function ofTokenEnd(token: Token): Point;
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    export namespace Position {
        export function ofParseTree(parseTree: ParseTree): Position | undefined;
        export function ofToken(token: Token): Position;
        export function ofTokenStart(token: Token): Position;
        export function ofTokenEnd(token: Token): Position;
    }
}

export function positionOfParseTree(parseTree: ParseTree): Position | undefined {
    if(parseTree instanceof ParserRuleContext) {
        const startToken = parseTree.start;
        const stopToken = parseTree.stop;

        if (startToken) {
            if (stopToken) {
                return new Position(Point.ofTokenStart(startToken), Point.ofTokenEnd(stopToken));
            } else {
                return Point.ofTokenStart(startToken).asPosition();
            }
        }
    } else if(parseTree instanceof TerminalNode) {
        return new Position(Point.ofTokenStart(parseTree.symbol), Point.ofTokenEnd(parseTree.symbol));
    }
}

Point.ofTokenStart = function (token: Token): Point {
    return new Point(token.line, token.column)
}

Point.ofTokenEnd = function (token: Token): Point {
    const length = (token.type == Token.EOF) ? 0 : token.text?.length ?? 0;
    return new Point(token.line, token.column + length)
}

Position.ofParseTree = positionOfParseTree;

Position.ofTokenStart = function (token: Token): Position {
    return new Position(Point.ofTokenStart(token), Point.ofTokenStart(token));
}

Position.ofTokenEnd = function (token: Token): Position {
    return new Position(Point.ofTokenEnd(token), Point.ofTokenEnd(token));
}

Position.ofToken = function (token: Token): Position {
    return new Position(Point.ofTokenStart(token), Point.ofTokenEnd(token));
}

export class ParseTreeOrigin extends Origin {
    constructor(public parseTree?: ParseTree) {
        super();
    }

    get position(): Position | undefined {
        return this.parseTree ? Position.ofParseTree(this.parseTree) : undefined;
    }

    get sourceText(): string | undefined {
        if (this.parseTree instanceof ParserRuleContext) {
            return this.parseTree.getOriginalText();
        } else if (this.parseTree instanceof TerminalNode) {
            return this.parseTree.getText();
        } else {
            return undefined;
        }
    }
}

declare module '../model/model' {
    export interface Node {
        parseTree?: ParseTree;
        withParseTreeNode(parseTree?: ParseTree | null): this;
    }
}

declare module 'antlr4ng' {
    export interface ParserRuleContext {
        getOriginalText(): string;
    }
}

export function withParseTreeNode(node: Node, parseTree?: ParseTree | null): Node {
    if (parseTree) {
        node.origin = new ParseTreeOrigin(parseTree);
    }
    return node;
}

Node.prototype.withParseTreeNode = function (parseTree) {
    return withParseTreeNode(this, parseTree);
}

Object.defineProperty(Node.prototype, "parseTree", {
    get(): ParseTree | undefined {
        if (this.origin instanceof ParseTreeOrigin) {
            return this.origin.parseTree;
        } else {
            return undefined;
        }
    }
});

ParserRuleContext.prototype.getOriginalText = function () {
    const a = this.start.start;
    const b = this.stop.stop;
    return this.start.inputStream?.getTextFromRange(a, b);
}
