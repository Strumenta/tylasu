import {expect} from "chai";
import * as fs from "fs";
import {loadEObject, loadEPackages, Point, Position,} from "../../src";
import * as Ecore from "ecore/dist/ecore";
import {TRANSPILATION_EPACKAGE} from "../../src/interop/transpilation_package";
import {ensureEcoreContainsEchar} from "../../src/interop/ecore_patching";
import {
    TranspilationTraceLoader
} from "../../src/transformation/transpilation_trace";
import {ParserTraceLoader} from "../../src/interop/parser-trace";

describe('Parser traces', function() {

    it("Can load parser traces built using Kolasu metamodel V1",
        function () {
            this.timeout(0);

            const loader = new ParserTraceLoader("tests/data/parser-bench/rpgexamples/metamodel.json");
            const trace = loader.loadParserTraceFromFile("tests/data/parser-bench/rpgexamples/BBSAACCLVR.json");

            // expect(trace.getRootSourceNode().getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            // expect(trace.getRootSourceNode().getSimpleType()).to.eql("CompilationUnit");
            // expect(trace.getRootSourceNode().getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            // expect(trace.getRootSourceNode().getDestinationNode().getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            // expect(trace.getRootSourceNode().getDestinationNode().getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            // expect(trace.getRootSourceNode().getChildren().length).to.eql(11);
            // expect(trace.getRootSourceNode().getChildren("mainStatements").length).to.eql(5);
            // expect(trace.getRootSourceNode().getRole()).to.eql("sourceAST");
            // expect(trace.getRootSourceNode().getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            //
            // expect(trace.getRootTargetNode().getType()).to.eql("com.strumenta.javaast.JCompilationUnit");
            // expect(trace.getRootTargetNode().getSimpleType()).to.eql("JCompilationUnit");
            // expect(trace.getRootTargetNode().getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            // expect(trace.getRootTargetNode().getSourceNode().getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            // expect(trace.getRootTargetNode().getSourceNode().getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            // expect(trace.getRootTargetNode().getChildren().length).to.eql(1);
            // expect(trace.getRootTargetNode().getChildren("declarations").length).to.eql(1);
            // expect(trace.getRootTargetNode().getChildren("unexisting").length).to.eql(0);
            // expect(trace.getRootTargetNode().getRole()).to.eql("targetAST");
            // expect(trace.getRootTargetNode().getChildren("declarations")[0].getRole()).to.eql("declarations");
        });
});
