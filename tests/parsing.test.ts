import {expect} from "chai";

import {Issue, IssueSeverity, IssueType, Node, Point, Position} from "../src";
import {SimpleLangLexer} from "./parser/SimpleLangLexer";
import {CharStream, Lexer, TokenStream} from "antlr4ng";
import {CompilationUnitContext, SimpleLangParser} from "./parser/SimpleLangParser";
import {ANTLRTokenFactory, ParseTreeOrigin, TylasuANTLRToken, TylasuParser} from "../src/parsing";

class CompilationUnit extends Node {}

class SLParser extends TylasuParser<CompilationUnit, SimpleLangParser, CompilationUnitContext, TylasuANTLRToken> {
    protected createANTLRLexer(inputStream: CharStream): Lexer {
        return new SimpleLangLexer(inputStream);
    }

    protected createANTLRParser(tokenStream: TokenStream): SimpleLangParser {
        return new SimpleLangParser(tokenStream);
    }

    protected parseTreeToAst(parseTreeRoot: CompilationUnitContext, considerPosition: boolean, issues: Issue[]):
        CompilationUnit | undefined {
        return new CompilationUnit().withParseTreeNode(parseTreeRoot);
    }
}

describe('Parsing', function() {
    it("ParserRuleContext position",
        function () {
            const code = "set foo = 123";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);
            expect(result.root instanceof CompilationUnit).to.be.true;
            expect(result.root!.origin instanceof ParseTreeOrigin).to.be.true;
            const origin = result.root!.origin as ParseTreeOrigin;
            expect(origin.parseTree).to.equal(result.firstStage!.root);
            expect(result.root!.parseTree).to.equal(result.firstStage!.root);
            expect(result.code).to.equal(code);
        });
    it("produce correct issues for: display 1 +",
        function () {
            const code = "display 1 +";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);
            expect(result.issues).to.eql([new Issue(
                IssueType.SYNTACTIC,
                "mismatched input '<EOF>' expecting {INT_LIT, DEC_LIT, STRING_LIT, BOOLEAN_LIT}",
                IssueSeverity.ERROR,
                new Position(new Point(1, 11), new Point(1, 11)),
                undefined,
                "parser.mismatchedinput",
                [
                    {
                        name: "mismatched",
                        value: "<EOF>"
                    },
                    {
                    name: "expected",
                    value: "INT_LIT"
                    },
                    {
                        name: "expected",
                        value: "DEC_LIT"
                    },
                    {
                        name: "expected",
                        value: "STRING_LIT"
                    },
                    {
                        name: "expected",
                        value: "BOOLEAN_LIT"
                    }
                ]
            )])
        });
    it("produce correct issues for: display 1 ++",
        function () {
            const code = "display 1 ++";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);
            expect(result.issues).to.eql([
                new Issue(
                    IssueType.SYNTACTIC,
                    "mismatched input '+' expecting {INT_LIT, DEC_LIT, STRING_LIT, BOOLEAN_LIT}",
                    IssueSeverity.ERROR,
                    new Position(new Point(1, 11), new Point(1, 12)),
                    undefined,
                    "parser.mismatchedinput",
                    [
                        {
                            name: "mismatched",
                            value: "+"
                        },
                        {
                            name: "expected",
                            value: "INT_LIT"
                        },
                        {
                            name: "expected",
                            value: "DEC_LIT"
                        },
                        {
                            name: "expected",
                            value: "STRING_LIT"
                        },
                        {
                            name: "expected",
                            value: "BOOLEAN_LIT"
                        }
                    ]
                ),
                new Issue(
                IssueType.SYNTACTIC,
                "mismatched input '<EOF>' expecting {INT_LIT, DEC_LIT, STRING_LIT, BOOLEAN_LIT}",
                IssueSeverity.ERROR,
                new Position(new Point(1, 12), new Point(1, 12)),
                undefined,
                "parser.mismatchedinput",
                [
                    {
                        name: "mismatched",
                        value: "<EOF>"
                    },
                    {
                        name: "expected",
                        value: "INT_LIT"
                    },
                    {
                        name: "expected",
                        value: "DEC_LIT"
                    },
                    {
                        name: "expected",
                        value: "STRING_LIT"
                    },
                    {
                        name: "expected",
                        value: "BOOLEAN_LIT"
                    }
                ]
            )])
        });
    it("produce correct issues for: display",
        function () {
            const code = "display";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);
            expect(result.issues).to.eql([
                new Issue(
                    IssueType.SYNTACTIC,
                    "mismatched input '<EOF>' expecting {INT_LIT, DEC_LIT, STRING_LIT, BOOLEAN_LIT}",
                    IssueSeverity.ERROR,
                    new Position(new Point(1, 7), new Point(1, 7)),
                    undefined,
                    "parser.mismatchedinput",
                    [
                        {
                            name: "mismatched",
                            value: "<EOF>"
                        },
                        {
                            name: "expected",
                            value: "INT_LIT"
                        },
                        {
                            name: "expected",
                            value: "DEC_LIT"
                        },
                        {
                            name: "expected",
                            value: "STRING_LIT"
                        },
                        {
                            name: "expected",
                            value: "BOOLEAN_LIT"
                        }
                    ]
                )])
        });
    it("produce correct issues for: ###",
        function () {
            const code = "###";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);
            expect(result.issues).to.eql([
                new Issue(
                    IssueType.LEXICAL,
                    "token recognition error at: '#'",
                    IssueSeverity.ERROR,
                    new Position(new Point(1, 0), new Point(1, 0)),
                    undefined,
                    "lexer.tokenrecognitionerror",
                    [
                        {
                            name: "token",
                            value: "#"
                        }
                    ]
                ),
                new Issue(
                    IssueType.LEXICAL,
                    "token recognition error at: '#'",
                    IssueSeverity.ERROR,
                    new Position(new Point(1, 1), new Point(1, 1)),
                    undefined,
                    "lexer.tokenrecognitionerror",
                    [
                        {
                            name: "token",
                            value: "#"
                        }
                    ]
                ),
                new Issue(
                    IssueType.LEXICAL,
                    "token recognition error at: '#'",
                    IssueSeverity.ERROR,
                    new Position(new Point(1, 2), new Point(1, 2)),
                    undefined,
                    "lexer.tokenrecognitionerror",
                    [
                        {
                            name: "token",
                            value: "#"
                        }
                    ]
                )])
        })
    it("produces issues with non-flat positions",
        function() {
            const code =
                "set set a = 10\n" +
                "|display c\n";
            const parser = new SLParser(new ANTLRTokenFactory());
            const result = parser.parse(code);

            expect(result.issues.length).to.not.eq(0)

            const extraneousInput = result.issues.find(issue => issue.message.startsWith("Extraneous input 'set'"))
            expect(!(extraneousInput?.position?.isFlat()))
            expect(extraneousInput?.position).to.eql(new Position(new Point(1, 4), new Point(1, 7)))

            const mismatchedInput = result.issues.find(issue => issue.message.startsWith("Mismatched input 'c'"))
            expect(!(mismatchedInput?.position?.isFlat()))
            expect(mismatchedInput?.position).to.eql(new Position(new Point(2, 9), new Point(2, 10)))
        })
});
