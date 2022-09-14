import {expect} from "chai";
import * as fs from "fs";
import {IssueSeverity, IssueType, ParserTraceLoader, Point, Position} from "../../src";

describe('Parser traces', function() {

    it("Can load parser traces built using Kolasu metamodel V1 (RPG)",
        function () {
            this.timeout(0);

            const metamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/rpgexamples/metamodel.json").toString());
            const loader = new ParserTraceLoader({
                name: "rpg",
                uri: "file://tests/data/playground/rpgexamples/metamodel.json",
                metamodel: metamodel
            });
            const code = fs.readFileSync("tests/data/playground/rpgexamples/BBSAACCLVR.json").toString();
            const trace = loader.loadParserTrace(code, "rpg");

            expect(trace.rootNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.rootNode.getSimpleType()).to.eql("CompilationUnit");
            expect(trace.rootNode.getPosition()).to.eql(new Position(new Point(1, 0), new Point(297, 0)));
            expect(trace.rootNode.getChildren().length).to.eql(28);
            expect(trace.rootNode.getChildren("mainStatements").length).to.eql(5);
            expect(trace.rootNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            expect(trace.issues.length).to.eql(3);
            expect(trace.issues[0].type).to.eql(IssueType.SEMANTIC);
            expect(trace.issues[0].message).to.eql("Physical line of type FileDescription are currently ignored");
            expect(trace.issues[0].severity).to.eql(IssueSeverity.WARNING);
            expect(trace.issues[0].position).to.eql(new Position(new Point(18, 0), new Point(18, 42)));
        });

    it("Can load parser traces built using Kolasu metamodel V1 (SAS)",
        function () {
            this.timeout(0);

            const metamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/sas-examples/metamodel.json").toString());
            const loader = new ParserTraceLoader({
                name: "sas",
                uri: "file://tests/data/playground/sas-examples/metamodel.json",
                metamodel: metamodel
            });
            const code = fs.readFileSync(
                "tests/data/playground/sas-examples/open-source_covid-19-sas_data_import-data-ihme.sas.json").toString();
            const trace = loader.loadParserTrace(code, "sas");

            expect(trace.rootNode.getType()).to.eql("com.strumenta.sas.ast.SourceFile");
            expect(trace.rootNode.getSimpleType()).to.eql("SourceFile");
            expect(trace.rootNode.getPosition()).to.eql(new Position(new Point(16, 0), new Point(349, 0)));
            expect(trace.rootNode.getChildren().length).to.equal(44);
            expect(trace.rootNode.getChildren("statementsAndDeclarations").length).to.equal(44);
            expect(trace.rootNode.getChildren("statementsAndDeclarations")[0].getRole())
                .to.equal("statementsAndDeclarations");
            expect(trace.issues.length).to.equal(5);
            expect(trace.issues[0].type).to.equal(IssueType.SEMANTIC);
            expect(trace.issues[0].message).to.equal("Unparsed macro code");
            expect(trace.issues[0].severity).to.equal(IssueSeverity.WARNING);
            expect(trace.issues[0].position).to.eql(new Position(new Point(36, 1), new Point(36, 50)));
        });
});
