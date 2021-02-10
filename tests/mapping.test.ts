import {expect} from "chai";

import {ASTNodeFor, Child, GenericNode, Node, toAST} from "../src";
import {SimpleLangLexer} from "./parser/SimpleLangLexer";
import {CharStreams, CommonTokenStream} from "antlr4ts";
import {SetStmtContext, SimpleLangParser} from "./parser/SimpleLangParser";
import {ParserRuleContext} from "antlr4ts/ParserRuleContext";

@ASTNodeFor(SetStmtContext)
class MySetStatement extends Node {
    @Child({ path: "ID" })
    id: Node;
    @Child({ map: false, path: "SET" })
    set: Node;
}

describe('Mapping of Parse Trees to ASTs', function() {
    it("Generic node",
        function () {
            const node = new ParserRuleContext().toAST();
            expect(node).not.to.be.undefined;
            expect(node instanceof GenericNode).to.be.true;
        });
    it("Node registered declaratively",
        function () {
            const code = "set foo = 123";
            const lexer = new SimpleLangLexer(CharStreams.fromString(code));
            const parser = new SimpleLangParser(new CommonTokenStream(lexer));
            const cu = parser.compilationUnit();
            const setStmt = cu.statement(0) as SetStmtContext;
            const mySetStatement = setStmt.toAST() as MySetStatement;
            expect(mySetStatement instanceof MySetStatement).to.be.true;
            expect(mySetStatement.parseTreeNode).to.equal(setStmt);
            expect(mySetStatement.id).not.to.be.undefined;
            expect(mySetStatement.set).to.be.undefined;
        });
});
