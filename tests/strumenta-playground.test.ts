import {expect} from "chai";

import {findByPosition, Issue, IssueSeverity, IssueType, pos, Source} from "../src";
import {registerECoreModel} from "../src/interop/ecore";
import {ParserNode, ParserTraceLoader, saveForStrumentaPlayground} from "../src/interop/strumenta-playground";
import {NodeSubclass} from "./nodes";
import {CharStream, CommonToken, Lexer, Token, TokenStream} from "antlr4ts";
import * as fs from "fs";
import * as Ecore from "ecore/dist/ecore";
import {ParsingResult} from "../src/parsing";
import {EcoreEnabledParser} from "../src/interop/ecore-enabled-parser";
import {TerminalNode} from "antlr4ts/tree/TerminalNode";
import {ANTLRTokenFactory} from "../src/parsing";

describe('Strumenta Playground', function() {
    it("Export round-trip", function () {
        // We assign a fake parse tree, to ensure that we don't attempt to serialize ANTLR parse trees into the model.
        const fakePT = new TerminalNode(new CommonToken(Token.EOF));
        (fakePT.symbol as CommonToken).line = 1;
        (fakePT.symbol as CommonToken).charPositionInLine = 0;
        /* TODO not supported yet
        const nodeWithError = new NodeWithError("root");
        nodeWithError.errorNode = new GenericErrorNode(new Error("Something bad happened"));
        */
        const result = new ParsingResult<NodeSubclass>(
            "some code", new NodeSubclass("root").withParseTreeNode(fakePT),
            [Issue.semantic("Something's wrong")]);
        const testParser = new TestParser(new ANTLRTokenFactory());
        const resourceSet = Ecore.ResourceSet.create();
        const mmResource = resourceSet.create({ uri: "some.package" });
        testParser.generateMetamodel(mmResource, false);
        mmResource.save((metamodel, e) => {
            expect(e).to.be.null;
            fs.writeFileSync("tests/data/playground/metamodel.json", JSON.stringify(metamodel, null, 2));
            saveForStrumentaPlayground(result, "test-1", testParser, (data, error) => {
                expect(error).to.be.null;
                expect(data).not.to.be.null;
                expect(data.name).to.equal("test-1");
                expect(data.code).to.equal("some code");
                expect(data.ast).not.to.be.undefined;
                const json = JSON.stringify(data, null, 2);
                fs.writeFileSync("tests/data/playground/example1.json", json);

                const loader = new ParserTraceLoader({
                    name: "made-up",
                    uri: "file:metamodel.json",
                    metamodel
                });
                const trace = loader.loadParserTrace(json, "made-up");
                expect(trace.rootNode.getSimpleType()).to.equal("NodeSubclass");
                expect(trace.rootNode.getAttribute("a")).to.equal("root");
                /* TODO not supported yet
                const errorNode = trace.rootNode.getChildren("errorNode")[0];
                expect(errorNode.getAttribute("message")).to.equal("Something bad happened");
                */
            });
        });
    });

    it("SQL case-when",
        function () {
            this.timeout(0);

            const path = "tests/data/playground/sql/metamodel.json";
            const metamodel =
                JSON.parse(fs.readFileSync(path).toString());
            const loader = new ParserTraceLoader({
                name: "sql",
                uri: `file://${path}`,
                metamodel: metamodel
            });
            let code = fs.readFileSync(
                "tests/data/playground/sql/case-when.json").toString();
            let trace = loader.loadParserTrace(code, "sql");

            const rootNode = trace.rootNode;
            expect(rootNode.getType()).to.eql("com.strumenta.sas.ast.SourceFile");
            expect(rootNode.getSimpleType()).to.eql("SourceFile");
            expect(rootNode.getPosition()).to.eql(pos(12, 0,369, 0));
            let foundNode = findByPosition(rootNode, pos(12, 0,369, 0)) as ParserNode;
            expect(foundNode.eo == rootNode.eo).to.be.true;
            const descNode = rootNode.children[10].children[7] as ParserNode;
            foundNode = findByPosition(descNode, descNode.position!) as ParserNode;
            expect(foundNode.eo == descNode.eo).to.be.true;
            expect(rootNode.getChildren().length).to.equal(18);
            expect(rootNode.getChildren("statementsAndDeclarations").length).to.equal(18);
            // foundNode = findByPosition(rootNode, pos(20, 28, 20, 29)) as ParserNode;
            // expect(foundNode).not.to.be.undefined;
            const child = rootNode.getChildren("statementsAndDeclarations")[0];
            expect(child.getRole()).to.equal("statementsAndDeclarations");
            expect(child.getAttributes()).to.eql({ name: "importSheets" });
            expect(trace.issues.length).to.equal(1);
            expect(trace.issues[0].type).to.equal(IssueType.SEMANTIC);
            expect(trace.issues[0].message).to.equal("Unparsed macro code: `filename `");
            expect(trace.issues[0].severity).to.equal(IssueSeverity.WARNING);
            expect(trace.issues[0].position).to.eql(pos(43, 8,43, 17));

            code = fs.readFileSync(
                "tests/data/playground/sas/open-source_sas-cert-prep-data_professional-prep-guide_cre8permdata.sas.json").toString();
            trace = loader.loadParserTrace(code, "sas");
            expect(trace).not.to.be.undefined;
            expect(trace.rootNode).not.to.be.undefined;
            expect(trace.rootNode.position).to.eql(pos(15, 0, 10161, 0));
            expect(trace.issues).to.eql([]);
        });
});

class TestParser extends EcoreEnabledParser<NodeSubclass, any, any, any> {
    protected createANTLRLexer(inputStream: CharStream): Lexer | undefined {
        return undefined;
    }

    protected createANTLRParser(tokenStream: TokenStream): any {
        return undefined;
    }

    protected doGenerateMetamodel(resource): void {
        resource.get("contents").add(registerECoreModel("some.package"));
        resource.get("contents").add(registerECoreModel("another.package"));
    }

    protected parseTreeToAst(parseTreeRoot: any, considerPosition: boolean, issues: Issue[], source?: Source): NodeSubclass | undefined {
        return undefined;
    }

}
