import {ParserRuleContext, Token} from "antlr4ts";
import {Issue} from "../validation";
import {Position} from "../model/position";
import {Node} from "../model/model";
import {CodeProcessingResult} from "../model/processing";
import "../interop/antlr4";

export enum TokenCategory {
    COMMENT = "Comment",
    KEYWORD = "Keyword",
    NUMERIC_LITERAL = "Numeric literal",
    STRING_LITERAL = "String literal",
    PLAIN_TEXT = "Plain text"
}

/**
 * A token is a portion of text that has been assigned a category.
 */
export class TylasuToken {
    constructor(
        public readonly category: TokenCategory,
        public readonly position: Position,
        public readonly text: string | undefined
    ) {}
}


/**
 * A [TylasuToken] generated from a [Token]. The [token] contains additional information that is specific to ANTLR,
 * such as type and channel.
 */
export class TylasuANTLRToken extends TylasuToken {

    constructor(category: TokenCategory, public readonly token: Token) {
        super(category, Position.ofToken(token), token.text);
    }
}

export class LexingResult<T extends TylasuToken> extends CodeProcessingResult<T[]> {

    time?: number;

    constructor(code: string, data: T[], issues: Issue[], time?: number) {
        super(code, data, issues);
        this.time = time;
    }
}

export class FirstStageParsingResult<C extends ParserRuleContext> extends CodeProcessingResult<C> {
    incompleteNode?: Node;
    time?: number;
    lexingTime?: number;

    constructor(code: string, data: C, issues: Issue[], time?: number, lexingTime?: number, incompleteNode?: Node) {
        super(code, data, issues);
        this.time = time;
        this.lexingTime = lexingTime;
        this.incompleteNode = incompleteNode;
    }

    get root(): C | undefined {
        return this.data;
    }
}

export class ParsingResult<RootNode extends Node, C extends ParserRuleContext> extends CodeProcessingResult<RootNode> {

    incompleteNode?: Node;
    firstStage?: FirstStageParsingResult<C>;
    time?: number;

    constructor(
        code: string, data: RootNode | undefined, issues: Issue[],
        incompleteNode?: Node, firstStage?: FirstStageParsingResult<C>, time?: number) {
        super(code, data, issues);
        this.incompleteNode = incompleteNode;
        this.firstStage = firstStage;
        this.time = time;
    }

    get root(): RootNode | undefined {
        return this.data;
    }
}

