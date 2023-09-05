import {expect} from "chai";
import * as fs from "fs";
import {findByPosition, IssueSeverity, IssueType, Point, pos, Position} from "../../src";
import {ParserNode, ParserTraceLoader} from "../../src/interop/strumenta-playground";

describe('Parser traces – Kolasu metamodel V1', function() {

    const rpgMetamodel =
        JSON.parse(fs.readFileSync("tests/data/playground/rpg/metamodel.json").toString());
    const rpgLoader = new ParserTraceLoader({
        name: "rpg",
        uri: "file://tests/data/playground/rpg/metamodel.json",
        metamodel: rpgMetamodel
    });

    it("Can load reference RPG parser trace: BBSAACCLVR",
        function () {
            this.timeout(0);

            const code = fs.readFileSync("tests/data/playground/rpg/BBSAACCLVR.json").toString();
            const trace = rpgLoader.loadParserTrace(code, "rpg");

            expect(trace.rootNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.rootNode.getSimpleType()).to.eql("CompilationUnit");
            expect(trace.rootNode.getPosition()).to.eql(new Position(new Point(1, 0), new Point(297, 0)));
            expect(trace.rootNode.getChildren().length).to.eql(28);
            expect(trace.rootNode.getChildren("mainStatements").length).to.eql(5);
            expect(trace.rootNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            expect(trace.rootNode.getChildren("mainStatements")[1].getChildren()[0].getPathFromRoot()).to.eql(
                ['mainStatements', 1, 'formatName']);
            expect(trace.issues.length).to.eql(3);
            expect(trace.issues[0].type).to.eql(IssueType.SEMANTIC);
            expect(trace.issues[0].message).to.eql("Physical line of type FileDescription are currently ignored");
            expect(trace.issues[0].severity).to.eql(IssueSeverity.WARNING);
            expect(trace.issues[0].position).to.eql(new Position(new Point(18, 0), new Point(18, 42)));
        });

    it("Can load reference RPG parser trace: open-weather",
        function () {
            this.timeout(0);


            const code = fs.readFileSync("tests/data/playground/rpg/open-weather.json").toString();
            const trace = rpgLoader.loadParserTrace(code, "rpg");
            const rootNode = trace.rootNode;
            expect(rootNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(rootNode.getSimpleType()).to.eql("CompilationUnit");
            const child = rootNode.getChildren("dataDefinitions")[3];
            expect(child.getProperties()).to.eql({
                name: { child: false },
                keywords: { child: true }
            });
            expect(child.getAttributes()).to.eql({ name: 'ENDPOINT' });
        });

    for (const example of ["JD_001", "moulinette", "plugconv"]) {
        it(`Can load RPG parser trace: ${example}`,
            function () {
                this.timeout(0);
                const code = fs.readFileSync(`tests/data/playground/rpg/${example}.json`).toString();
                const trace = rpgLoader.loadParserTrace(code, "rpg");
                expect(trace.rootNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit", example);
            });
    }
});

describe('Parser traces – Starlasu metamodel V2', function() {
    it("Can load SAS parser traces",
        function () {
            this.timeout(0);

            const metamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/sas/metamodel.json").toString());
            const loader = new ParserTraceLoader({
                name: "sas",
                uri: "file://tests/data/playground/sas/metamodel.json",
                metamodel: metamodel
            });
            let code = fs.readFileSync(
                "tests/data/playground/sas/open-source_covid-19-sas_data_import-data-jhu.sas.json").toString();
            let trace = loader.loadParserTrace(code, "sas");

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
