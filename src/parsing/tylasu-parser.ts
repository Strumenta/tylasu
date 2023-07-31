import {Node} from "../model/model";
import {
    CharStream,
    CharStreams,
    CommonTokenStream,
    Lexer,
    Parser as ANTLRParser,
    ParserRuleContext,
    Recognizer,
    Token,
    TokenStream
} from "antlr4ts";
import {Issue, IssueSeverity} from "../validation";
import {Point, Position} from "../model/position";
import {assignParents} from "../model/processing";
import {Interval} from "antlr4ts/misc";
import {walk} from "../traversing/structurally";
import {ErrorNode} from "antlr4ts/tree";
import {FirstStageParsingResult, LexingResult, ParsingResult} from "./parsing";

let now: () => number;
try {
    // Web
    performance.now();
    now = () => performance.now();
} catch (e) {
    try {
        // Node.js
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { performance } = require('perf_hooks');
        now = () => performance.now();
    } catch (e) {
        // Fallback
        now = () => new Date().getTime();
    }
}

export abstract class TylasuParser<R extends Node, P extends ANTLRParser, C extends ParserRuleContext> {

    /**
     * Creates the lexer.
     */
    protected abstract createANTLRLexer(inputStream: CharStream): Lexer | undefined;

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
    protected abstract parseTreeToAst(parseTreeRoot: C, considerPosition: boolean, issues: Issue[]): R | undefined;

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
                    Position.ofTokenEnd(lastToken)));
        }

        processDescendantsAndErrors(
            root,
            it => {
                if (it.exception != null) {
                    const message = `Recognition exception: ${it.exception.message}`;
                    issues.push(Issue.syntactic(message, IssueSeverity.ERROR, Position.ofParseTree(it)));
                }
            },
            it => {
                const message = `Error node found (token: ${it.symbol?.text})`;
                issues.push(Issue.syntactic(message, IssueSeverity.ERROR, Position.ofParseTree(it)));
            });
    }

    /**
     * Executes only the first stage of the parser, i.e., the production of a parse tree. Usually, you'll want to use
     * the [parse] method, that returns an AST which is simpler to use and query.
     */
    parseFirstStage(inputStream: CharStream, measureLexingTime = false): FirstStageParsingResult<C> {
        const issues: Issue[] = [];
        let lexingTime: number | undefined = undefined;
        const time = now();
        const parser = this.createParser(inputStream, issues);
        if (measureLexingTime) {
            const tokenStream = parser.inputStream;
            if (tokenStream instanceof CommonTokenStream) {
                lexingTime = now();
                tokenStream.fill();
                tokenStream.seek(0);
                lexingTime = lexingTime - now();
            }
        }
        const root = this.invokeRootRule(parser);
        if (root != null) {
            this.verifyParseTree(parser, issues, root);
        }
        const code = inputStream.getText(Interval.of(0, inputStream.size - 1));
        return new FirstStageParsingResult(code, root, issues, now() - time, lexingTime);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postProcessAst(ast: R, issues: Issue[]): R {
        return ast;
    }

    parse(code: string | CharStream, considerPosition = true, measureLexingTime = true): ParsingResult<R, C> {
        if (typeof code === "string") {
            code = CharStreams.fromString(code);
        }
        const start = now()
        const firstStage = this.parseFirstStage(code, measureLexingTime);
        const issues = firstStage.issues;
        let ast = this.parseTreeToAst(firstStage.root!, considerPosition, issues)

        if (ast)
            this.assignParents(ast);

        ast = ast ? this.postProcessAst(ast, issues) : ast;
        if (ast != null && !considerPosition) {
            for (const node of walk(ast)) {
                delete node.origin;
            }
        }
        const text = code.getText(Interval.of(0, code.size - 1));
        return new ParsingResult(text, ast, issues, undefined, firstStage, now() - start);
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

    /**
     * Performs "lexing" on the given code stream, i.e., it breaks it into tokens.
     */
    lex(inputStream: CharStream, onlyFromDefaultChannel = true): LexingResult {
        const issues: Issue[] = [];
        const tokens: Token[] = [];
        const time = now();
        const lexer = this.createANTLRLexer(inputStream)!;
        this.injectErrorCollectorInLexer(lexer, issues);
        let t: Token;
        do {
            t = lexer.nextToken();
            if (!t) {
                break;
            } else {
                if (!onlyFromDefaultChannel || t.channel == Token.DEFAULT_CHANNEL) {
                    tokens.push(t);
                }
            }
        } while (t.type != Token.EOF);

        const lastToken = tokens[tokens.length - 1];
        if (lastToken.type != Token.EOF) {
            const message = "The parser didn't consume the entire input";
            issues.push(Issue.syntactic(message, IssueSeverity.WARNING, Position.ofTokenEnd(lastToken)))
        }

        const code = inputStream.getText(Interval.of(0, inputStream.size - 1));
        return new LexingResult(code, tokens, issues, now() - time);
    }

    protected injectErrorCollectorInLexer(lexer: Lexer, issues: Issue[]): void {
        lexer.removeErrorListeners();
        lexer.addErrorListener({
            syntaxError(recognizer: Recognizer<number, any>, offendingSymbol: number | undefined, line: number, charPositionInLine: number, msg: string) {
                issues.push(
                    Issue.lexical(
                        msg || "unspecified",
                        IssueSeverity.ERROR,
                        Position.ofPoint(new Point(line, charPositionInLine))));
            }
        });
    }

    protected injectErrorCollectorInParser(parser: ANTLRParser, issues: Issue[]): void {
        parser.removeErrorListeners();
        parser.addErrorListener({
            syntaxError(recognizer: Recognizer<Token, any>, offendingSymbol: Token | undefined, line: number, charPositionInLine: number, msg: string) {
                issues.push(
                    Issue.syntactic(
                        msg || "unspecified",
                        IssueSeverity.ERROR,
                        Position.ofPoint(new Point(line, charPositionInLine))));
            }
        });
    }
}

function processDescendantsAndErrors(
    self: ParserRuleContext,
    operationOnParserRuleContext: (ParserRuleContext) => void,
    operationOnError: (ErrorNode) => void,
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
