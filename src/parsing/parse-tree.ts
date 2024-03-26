import {Node, Origin, Point, Position, Source} from "../";
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
        export function ofParseTree(parseTree: ParseTree, source?: Source): Position | undefined;
        export function ofToken(token: Token): Position;
        export function ofTokenStart(token: Token): Position;
        export function ofTokenEnd(token: Token): Position;
    }
}

export function positionOfParseTree(parseTree: ParseTree, source?: Source): Position | undefined {
    if(parseTree instanceof ParserRuleContext) {
        const startToken = parseTree.start;
        const stopToken = parseTree.stop;

        if (startToken) {
            if (stopToken) {
                return new Position(Point.ofTokenStart(startToken), Point.ofTokenEnd(stopToken), source);
            } else {
                return Point.ofTokenStart(startToken).asPosition(source);
            }
        }
    } else if(parseTree instanceof TerminalNode) {
        return new Position(Point.ofTokenStart(parseTree.symbol), Point.ofTokenEnd(parseTree.symbol), source);
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
    constructor(public parseTree?: ParseTree, protected readonly _source?: Source) {
        super();
    }

    get position(): Position | undefined {
        return this.parseTree ? Position.ofParseTree(this.parseTree, this._source) : undefined;
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


    get source(): Source | undefined {
        return this._source;
    }
}

declare module '../model/model' {
    export interface Node {
        parseTree?: ParseTree;
        withParseTreeNode(parseTree?: ParseTree | null, source?: Source): this;
    }
}

declare module 'antlr4ng' {
    export interface ParserRuleContext {
        getOriginalText(): string;
    }
}

export function withParseTreeNode(node: Node, parseTree?: ParseTree | null, source?: Source): Node {
    if (parseTree) {
        node.origin = new ParseTreeOrigin(parseTree, source);
    }
    return node;
}

Node.prototype.withParseTreeNode = function (parseTree, source) {
    return withParseTreeNode(this, parseTree, source);
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
