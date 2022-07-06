import {expect} from "chai";
import * as fs from "fs";
import {ParserTraceLoader, Point, Position} from "../../src";

describe('Parser traces', function() {

    it("Can load parser traces built using Kolasu metamodel V1",
        function () {
            this.timeout(0);

            const metamodel =
                JSON.parse(fs.readFileSync("tests/data/parser-bench/rpgexamples/metamodel.json").toString());
            const loader = new ParserTraceLoader({
                name: "rpg",
                uri: "file://tests/data/parser-bench/rpgexamples/metamodel.json",
                metamodel: metamodel
            });
            const code = fs.readFileSync("tests/data/parser-bench/rpgexamples/BBSAACCLVR.json").toString();
            const trace = loader.loadParserTrace(code, "rpg");

            expect(trace.rootNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.rootNode.getSimpleType()).to.eql("CompilationUnit");
            expect(trace.rootNode.getPosition()).to.eql(new Position(new Point(1, 0), new Point(297, 0)));
            expect(trace.rootNode.getChildren().length).to.eql(28);
            expect(trace.rootNode.getChildren("mainStatements").length).to.eql(5);
            expect(trace.rootNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
        });
});
