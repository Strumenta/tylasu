import {ParseTree} from "antlr4ts/tree";
import {ParserRuleContext, Token} from "antlr4ts";

export class Point {
    constructor(public readonly line: number, public readonly column: number) {
        if(line < 1) {
            throw new Error(`Line should be equal to or greater than 1, was ${line}`);
        }
        if(line < 0) {
            throw new Error(`Column should be equal to or greater than 0, was ${column}`);
        }
    }

    static ofTokenStart(token: Token): Point {
        return new Point(token.line, token.charPositionInLine)
    }

    static ofTokenEnd(token: Token): Point {
        const length = (token.type == Token.EOF) ? 0 : token.text.length;
        return new Point(token.line, token.charPositionInLine + length)
    }
}

export const START_POINT = new Point(1, 0);

export class Position {
    constructor(public readonly start: Point, public readonly end: Point) {}

    static ofParseTree(parseTree: ParseTree): Position | undefined {
        if(parseTree instanceof ParserRuleContext) {
            return new Position(Point.ofTokenStart(parseTree.start), Point.ofTokenEnd(parseTree.stop));
        }
    }
}