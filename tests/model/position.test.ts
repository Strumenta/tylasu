import {expect} from "chai";

import {Point, START_POINT, Node, Position} from "../../src";
import {SimpleLangLexer} from "../parser/SimpleLangLexer";
import {CharStream, CommonTokenStream} from "antlr4ng";
import {SetStmtContext, SimpleLangParser} from "../parser/SimpleLangParser";
import {positionOfParseTree} from "../../src/parsing";

class MySetStatement extends Node {}

describe('Position', function() {
    it("Point comparisons",
        function () {
            const p0 = START_POINT;
            const p1 = new Point(1, 1);
            const p2 = new Point(1, 100);
            const p3 = new Point(2, 90);

            expect(p0.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p1)).to.be.true;
            expect(p1.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p2)).to.be.true;
            expect(p2.isBefore(p0)).to.be.false;
            expect(p0.isBefore(p3)).to.be.true;
            expect(p1.isBefore(p2)).to.be.true;
            expect(p2.isBefore(p1)).to.be.false;
            expect(p1.isBefore(p3)).to.be.true;
            expect(p3.isBefore(p1)).to.be.false;
        });
    it("Point.isBefore",
        function () {
            const p0 = START_POINT;
            const p1 = new Point(1, 1);
            const p2 = new Point(1, 100);
            const p3 = new Point(2, 90);

            expect(p0.compareTo(p0)).to.equal(0);
            expect(p0.compareTo(p1)).to.equal(-1);
            expect(p1.compareTo(p0)).to.equal(1);
            expect(p0.compareTo(p2)).to.equal(-1);
            expect(p2.compareTo(p0)).to.equal(1);
            expect(p0.compareTo(p3)).to.equal(-1);
            expect(p1.compareTo(p2)).to.equal(-1);
            expect(p2.compareTo(p1)).to.equal(1);
            expect(p1.compareTo(p3)).to.equal(-1);
            expect(p3.compareTo(p1)).to.equal(1);
        });

    it("ParserRuleContext position",
        function () {
            const code = "set foo = 123";
            const lexer = new SimpleLangLexer(CharStream.fromString(code));
            const parser = new SimpleLangParser(new CommonTokenStream(lexer));
            const cu = parser.compilationUnit();
            const setStmt = cu.statement(0) as SetStmtContext;
            const pos = positionOfParseTree(setStmt);
            expect(pos).to.deep.equal(new Position(new Point(1, 0), new Point(1, 13)));
        });

    it("Position derived from parse tree node",
        function () {
            const code = "set foo = 123";
            const lexer = new SimpleLangLexer(CharStream.fromString(code));
            const parser = new SimpleLangParser(new CommonTokenStream(lexer));
            const cu = parser.compilationUnit();
            const setStmt = cu.statement(0) as SetStmtContext;
            const mySetStatement = new MySetStatement().withParseTreeNode(setStmt);
            expect(mySetStatement.position).to.deep.equal(new Position(new Point(1, 0), new Point(1, 13)));
        });
});
