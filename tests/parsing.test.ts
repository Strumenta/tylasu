import {expect} from "chai";

import {Issue, Node} from "../src";
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
});
