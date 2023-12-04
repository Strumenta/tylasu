import {SimpleLangLexer} from "../parser/SimpleLangLexer";
import {CharStreams, CommonTokenStream} from "antlr4ng";
import {SimpleLangParser} from "../parser/SimpleLangParser";
import {ParseTreeOrigin} from "../../src/parsing";
import {expect} from "chai";
import {Point, Position} from "../../src";

describe('Origin', function () {
    it("has valid position",
        function () {
            const code = `set a = 1 + 2
input c is string
display 2 * 3`;
            const lexer = new SimpleLangLexer(CharStreams.fromString(code));
            const parser = new SimpleLangParser(new CommonTokenStream(lexer));
            const parseTreeRoot = parser.compilationUnit();
            expect(parser.numberOfSyntaxErrors).to.equal(0);
            const rootOrigin = new ParseTreeOrigin(parseTreeRoot);
            expect(rootOrigin.position!.compareTo(
                new Position(new Point(1, 0), new Point(3, 13)))
            ).to.equal(0);

            const inputStatement = new ParseTreeOrigin(parseTreeRoot.statement(1)!);
            expect(inputStatement.position!.compareTo(
                new Position(new Point(2, 0), new Point(2, 17)))
            ).to.equal(0);
        });

    it("retains source text",
        function () {
            const code = `set a = 1 + 2
input c is string
display 2 * 3`;
            const lexer = new SimpleLangLexer(CharStreams.fromString(code));
            const parser = new SimpleLangParser(new CommonTokenStream(lexer));
            const parseTreeRoot = parser.compilationUnit();
            expect(parser.numberOfSyntaxErrors).to.equal(0);
            const rootOrigin = new ParseTreeOrigin(parseTreeRoot);
            expect(rootOrigin.sourceText).to.equal(code);

            const inputStatement = new ParseTreeOrigin(parseTreeRoot.statement(1)!);
            expect(inputStatement.sourceText).to.equal("input c is string");
        });
});
