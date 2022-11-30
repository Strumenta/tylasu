import {expect} from "chai";

import {Issue} from "../src";
import {registerECoreModel} from "../src/interop/ecore";
import {saveForStrumentaPlayground} from "../src/interop/strumenta-playground";
import {NodeSubclass} from "./nodes";
import {CharStream, Lexer, TokenStream} from "antlr4ts";
import * as fs from "fs";
import * as Ecore from "ecore/dist/ecore";
import {ParsingResult} from "../src/parsing";
import {EcoreEnabledParser} from "../src/interop/ecore-enabled-parser";

describe('Strumenta Playground', function() {
    it("Export", function () {
        const result = new ParsingResult<NodeSubclass, any>(
            "some code", new NodeSubclass("root"), [Issue.semantic("Something's wrong")]);
        const testParser = new TestParser();
        const resourceSet = Ecore.ResourceSet.create();
        const mmResource = resourceSet.create({ uri: "some.package" });
        testParser.generateMetamodel(mmResource, false);
        mmResource.save((data, e) => {
            expect(e).to.be.null;
            fs.writeFileSync("tests/data/playground/metamodel.json", JSON.stringify(data, null, 2));
        });
        saveForStrumentaPlayground(result, "test-1", testParser, (data, error) => {
           expect(error).to.be.null;
           expect(data).not.to.be.null;
           expect(data.name).to.equal("test-1");
           expect(data.code).to.equal("some code");
           expect(data.ast).not.to.be.undefined;
           fs.writeFileSync("tests/data/playground/example1.json", JSON.stringify(data, null, 2));
        });
    });
});

class TestParser extends EcoreEnabledParser<NodeSubclass, any, any> {
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

    protected parseTreeToAst(parseTreeRoot: any, considerPosition: boolean, issues: Issue[]): NodeSubclass | undefined {
        return undefined;
    }

}
