import {Node} from "../model/model";
import {
    ATNSimulator,
    CharStream,
    CommonTokenStream,
    ErrorNode,
    Lexer,
    Parser as ANTLRParser,
    ParserRuleContext,
    ParseTree,
    Recognizer,
    TerminalNode,
    Token,
    TokenStream
} from "antlr4ng";
import {Issue, IssueSeverity} from "../validation";
import {Point, Position, Source, StringSource} from "../model/position";
import {assignParents} from "../model/processing";
import {walk} from "../traversing/structurally";
import {
    FirstStageParsingResult,
    LexingResult,
    ParsingResult,
    TokenCategory,
    TylasuANTLRToken, TylasuLexer,
    TylasuToken
} from "./parsing";
import {ASTParser} from "./ast-parser";

export abstract class TokenFactory<T extends TylasuToken> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    categoryOf(t: Token): TokenCategory {
        return TokenCategory.PLAIN_TEXT;
    }

    abstract convertToken(t: Token): T;

    private convertTerminal(terminalNode: TerminalNode): T {
        return this.convertToken(terminalNode.symbol);
    }

    extractTokens(result: ParsingResult<any>): LexingResult<T> | undefined {
        const antlrTerminals: TerminalNode[] = [];
        function extractTokensFromParseTree(pt?: ParseTree | null) {
            if (pt instanceof TerminalNode) {
                antlrTerminals.push(pt);
            } else if (pt != null) {
                for (let i = 0; i < pt.getChildCount(); i++) {
                    extractTokensFromParseTree(pt.getChild(i))
                }
            }
        }

        const ptRoot = result.firstStage?.root;
        if (ptRoot != null) {
            extractTokensFromParseTree(ptRoot);
            antlrTerminals.sort((a, b) => a.symbol.tokenIndex - b.symbol.tokenIndex);
            const tokens = antlrTerminals.map(t => this.convertTerminal(t));
            return new LexingResult(result.code, tokens, result.issues, result.firstStage?.lexingTime);
        }
    }
}

export class ANTLRTokenFactory extends TokenFactory<TylasuANTLRToken> {
    convertToken(t: Token): TylasuANTLRToken {
        return new TylasuANTLRToken(this.categoryOf(t), t);
    }
}

export const SYNTAX_ERROR = "parser.syntaxError";
export const INPUT_NOT_FULLY_CONSUMED = "parser.inputNotFullyConsumed";
export const ERROR_NODE_FOUND = "parser.errorNodeFound";

export abstract class TylasuANTLRLexer<T extends TylasuToken> implements TylasuLexer<T> {

    constructor(public readonly tokenFactory: TokenFactory<T>) {}

    /**
     * Creates the lexer.
     */
    protected abstract createANTLRLexer(inputStream: CharStream): Lexer | undefined;

    /**
     * Performs "lexing" on the given code stream, i.e., it breaks it into tokens.
     */
    lex(inputStream: CharStream, onlyFromDefaultChannel = true): LexingResult<T> {
        const issues: Issue[] = [];
        const tokens: T[] = [];
        const time = performance.now();
        const lexer = this.createANTLRLexer(inputStream)!;
        this.injectErrorCollectorInLexer(lexer, issues);
        let t: Token;
        do {
            t = lexer.nextToken();
            if (!t) {
                break;
            } else {
                if (!onlyFromDefaultChannel || t.channel == Token.DEFAULT_CHANNEL) {
                    tokens.push(this.tokenFactory.convertToken(t));
                }
            }
        } while (t.type != Token.EOF);

        if (t && (t.type != Token.EOF)) {
            const message = "The lexer didn't consume the entire input";
            issues.push(Issue.lexical(message, IssueSeverity.WARNING, Position.ofTokenEnd(t), undefined,
                INPUT_NOT_FULLY_CONSUMED))
        }

        const code = inputStream.getTextFromRange(0, inputStream.size - 1);
        return new LexingResult(code, tokens, issues, performance.now() - time);
    }

    protected injectErrorCollectorInLexer(lexer: Lexer, issues: Issue[]): void {
        lexer.removeErrorListeners();
        lexer.addErrorListener({
            reportAmbiguity() {},
            reportAttemptingFullContext() {},
            reportContextSensitivity() {},
            syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>, offendingSymbol: S | null, line: number, charPositionInLine: number, msg: string) {
                issues.push(
                    Issue.lexical(
                        msg || "unspecified",
                        IssueSeverity.ERROR,
                        Position.ofPoint(new Point(line, charPositionInLine)),
                        undefined,
                        SYNTAX_ERROR));
            }
        });
    }

}

export abstract class TylasuParser<
    R extends Node, P extends ANTLRParser, C extends ParserRuleContext, T extends TylasuToken
> extends TylasuANTLRLexer<T> implements ASTParser<R> {

    /**
     * Creates the first-stage parser.
     */
    protected abstract createANTLRParser(tokenStream: TokenStream): P;

    /**
     * Invokes the parser's root rule, i.e., the method which is responsible of parsing the entire input.
     * Usually this is the topmost rule, the one with index 0 (as also assumed by other libraries such as antlr4-c3),
     * so this method invokes that rule. If your grammar/parser is structured differently, or if you're using this to
     * parse only a portion of the input or a subset of the language, you have to override this method to invoke the
     * correct entry point.
     */
    protected invokeRootRule(parser: P): C {
        const entryPoint = parser[parser.ruleNames[0]]
        return entryPoint!.call(parser) as C
    }

    /**
     * Transforms a parse tree into an AST (second parsing stage).
     */
    protected abstract parseTreeToAst(parseTreeRoot: C, considerPosition: boolean, issues: Issue[], source?: Source): R | undefined;

    /**
     * Creates the first-stage lexer and parser.
     */
    protected createParser(inputStream: CharStream, issues: Issue[]): P {
        const lexer = this.createANTLRLexer(inputStream)!;
        this.injectErrorCollectorInLexer(lexer, issues);
        const tokenStream = this.createTokenStream(lexer);
        const parser = this.createANTLRParser(tokenStream);
        this.injectErrorCollectorInParser(parser, issues);
        return parser;
    }

    protected createTokenStream(lexer: Lexer): TokenStream {
        return new CommonTokenStream(lexer);
    }

    /**
     * Checks the parse tree for correctness. If you're concerned about performance, you may want to override this to
     * do nothing.
     */
    protected verifyParseTree(parser: ANTLRParser, issues: Issue[], root: ParserRuleContext): void {
        const lastToken = parser.inputStream.get(parser.inputStream.index);
        if (lastToken.type != Token.EOF) {
            issues.push(
                Issue.syntactic(
                    "The whole input was not consumed",
                    IssueSeverity.ERROR,
                    Position.ofTokenEnd(lastToken),
                    undefined,
                    INPUT_NOT_FULLY_CONSUMED));
        }

        processDescendantsAndErrors(
            root,
            () => {},
            it => {
                const message = `Error node found (token: ${it.symbol?.type} – ${it.symbol?.text})`;
                issues.push(Issue.syntactic(message, IssueSeverity.ERROR, Position.ofParseTree(it),
                    undefined,
                    ERROR_NODE_FOUND,
                    [
                        { name: "type", value: it.symbol?.type?.toString() || "" },
                        { name: "text", value: it.symbol?.text || "" },
                    ]));
            });
    }

    /**
     * Executes only the first stage of the parser, i.e., the production of a parse tree. Usually, you'll want to use
     * the [parse] method, that returns an AST which is simpler to use and query.
     */
    parseFirstStage(inputStream: CharStream, measureLexingTime = false): FirstStageParsingResult<C> {
        const issues: Issue[] = [];
        let lexingTime: number | undefined = undefined;
        const time = performance.now();
        const parser = this.createParser(inputStream, issues);
        if (measureLexingTime) {
            const tokenStream = parser.inputStream;
            if (tokenStream instanceof CommonTokenStream) {
                lexingTime = performance.now();
                tokenStream.fill();
                tokenStream.seek(0);
                lexingTime = lexingTime - performance.now();
            }
        }
        const root = this.invokeRootRule(parser);
        if (root != null) {
            this.verifyParseTree(parser, issues, root);
        }
        const code = inputStream.getTextFromRange(0, inputStream.size - 1);
        return new FirstStageParsingResult(code, root, issues, parser, performance.now() - time, lexingTime);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postProcessAst(ast: R, issues: Issue[]): R {
        return ast;
    }

    parse(
        code: string | CharStream, considerPosition = true,
        measureLexingTime = true, source?: Source
    ): ParsingResult<R> {
        if (typeof code === "string") {
            if (!source) {
                source = new StringSource(code);
            }
            code = CharStream.fromString(code);
        }
        const start = performance.now();
        const firstStage = this.parseFirstStage(code, measureLexingTime);
        const issues = firstStage.issues;
        let ast = this.parseTreeToAst(firstStage.root!, considerPosition, issues, source);

        if (ast) {
            this.assignParents(ast);
        }

        ast = ast ? this.postProcessAst(ast, issues) : ast;
        if (ast != null && !considerPosition) {
            for (const node of walk(ast)) {
                delete node.origin;
            }
        }
        const text = code.getTextFromRange(0, code.size - 1);
        return new ParsingResult(text, ast, issues, undefined, firstStage, performance.now() - start);
    }

    /**
     * Traverses the AST to ensure that parent nodes are correctly assigned.
     *
     * If you assign the parents correctly when you build the AST, or you're not interested in tracking child-parent
     * relationships, you can override this method to do nothing to improve performance.
     */
    protected assignParents(ast: R): void {
        assignParents(ast);
    }

    protected injectErrorCollectorInParser(parser: ANTLRParser, issues: Issue[]): void {
        parser.removeErrorListeners();
        parser.addErrorListener({
            reportAmbiguity() {},
            reportAttemptingFullContext() {},
            reportContextSensitivity() {},
            syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>, offendingSymbol: S | null, line: number, charPositionInLine: number, msg: string) {
                issues.push(
                    Issue.syntactic(
                        msg || "unspecified",
                        IssueSeverity.ERROR,
                        Position.ofPoint(new Point(line, charPositionInLine)),
                        undefined,
                        SYNTAX_ERROR));
            }
        });
    }
}

function processDescendantsAndErrors(
    self: ParserRuleContext,
    operationOnParserRuleContext: (c: ParserRuleContext) => void,
    operationOnError: (e: ErrorNode) => void,
    includingMe = true
) {
    if (includingMe) {
        operationOnParserRuleContext(self);
    }
    if (self.children != null) {
        self.children.filter(c => c instanceof ParserRuleContext).forEach(c => {
            processDescendantsAndErrors(
                c as ParserRuleContext, operationOnParserRuleContext, operationOnError, true);
        });
        self.children.filter(c => c instanceof ErrorNode).forEach(operationOnError);
    }
}
