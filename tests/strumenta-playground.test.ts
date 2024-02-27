import {expect} from "chai";

import {Issue, Source} from "../src";
import {registerECoreModel} from "../src/interop/ecore";
import {ParserTraceLoader, saveForStrumentaPlayground} from "../src/interop/strumenta-playground";
import {NodeSubclass} from "./nodes";
import {CharStream, CommonToken, Lexer, TerminalNode, Token, TokenStream} from "antlr4ng";
import * as fs from "fs";
import ECore from "ecore/dist/ecore";
import {ANTLRTokenFactory, ParsingResult} from "../src/parsing";
import {EcoreEnabledParser} from "../src/interop/ecore-enabled-parser";

describe('Strumenta Playground', function() {
    it("Export round-trip", function () {
        // We assign a fake parse tree, to ensure that we don't attempt to serialize ANTLR parse trees into the model.
        const fakePT = new TerminalNode(new CommonToken([null, null], Token.EOF, Token.DEFAULT_CHANNEL, 0, 0));
        (fakePT.symbol as CommonToken).line = 1;
        (fakePT.symbol as CommonToken).column = 0;
        /* TODO not supported yet
        const nodeWithError = new NodeWithError("root");
        nodeWithError.errorNode = new GenericErrorNode(new Error("Something bad happened"));
        */
        const result = new ParsingResult<NodeSubclass>(
            "some code", new NodeSubclass("root").withParseTreeNode(fakePT),
            [Issue.semantic("Something's wrong")]);
        const testParser = new TestParser(new ANTLRTokenFactory());
        const resourceSet = ECore.ResourceSet.create();
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
                expect(data.ast.root.a).to.equal("root");
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
