import {expect} from "chai";

import {Issue, ParsingResult, registerECoreModel} from "../src";
import {NodeSubclass, SomeNodeInAnotherPackage, SomeNodeInPackage} from "./nodes";
import {saveForParserBench} from "../src/interop/parser-bench";
import {EMFEnabledParser, toEObject} from "../src/interop/ecore";
import {CharStream, Lexer, TokenStream} from "antlr4ts";
import * as fs from "fs";
import * as Ecore from "ecore/dist/ecore";

describe('Parser Bench', function() {
    it("Export", function () {
        const result = new ParsingResult<NodeSubclass, any>(
            "some code", new NodeSubclass("root"), [Issue.semantic("Something's wrong")]);
        const testParser = new TestParser();
        const resourceSet = Ecore.ResourceSet.create();
        const mmResource = resourceSet.create({ uri: "some.package" });
        testParser.generateMetamodel(mmResource, false);
        mmResource.save((data, e) => {
            expect(e).to.be.null;
            fs.writeFileSync("tests/data/parser-bench/metamodel.json", JSON.stringify(data, null, 2));
        });
        saveForParserBench(result, "test-1", testParser, (data, error) => {
           expect(error).to.be.null;
           expect(data).not.to.be.null;
           expect(data.name).to.equal("test-1");
           expect(data.code).to.equal("some code");
           expect(data.ast).not.to.be.undefined;
           fs.writeFileSync("tests/data/parser-bench/example1.json", JSON.stringify(data, null, 2));
        });
    });
});

class TestParser extends EMFEnabledParser<NodeSubclass, any, any> {
    protected createANTLRLexer(inputStream: CharStream): Lexer {
        return undefined;
    }

    protected createANTLRParser(tokenStream: TokenStream): any {
        return undefined;
    }

    protected doGenerateMetamodel(resource): void {
        resource.get("contents").add(registerECoreModel("some.package"));
        resource.get("contents").add(registerECoreModel("another.package"));
    }

    protected parseTreeToAst(parseTreeRoot: any, considerPosition: boolean, issues: Issue[]): NodeSubclass | undefined {
        return undefined;
    }

}