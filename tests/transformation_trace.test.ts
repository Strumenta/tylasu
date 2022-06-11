import {expect} from "chai";
import * as fs from "fs";
import {TranspilationTrace} from "../src/transformation_trace";

describe('Transformation traces', function() {
    it("Can load transformation trace produced by Kolasu",
        function () {
            const text = fs.readFileSync('tests/data/transpilation/rpgtojava-transpilation-example.json', 'utf8')
            const trace : TranspilationTrace = TranspilationTrace.loadFromJSON(text);
            expect(trace.sourceAST.type).to.equal("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.sourceAST.id).to.equal("src-1");
            expect(trace.getNodeById("target-3").attributes.name).to.equal("NBR");
            expect(trace.sourceAST.destination.id).to.equal("target-1");
            expect(trace.sourceAST.destination.type).to.equal("com.strumenta.javaast.JCompilationUnit");
            expect(trace.sourceAST.position).to.eql({start:{line:1,column:0}, end:{line:32, column:30}});
            expect(trace.sourceAST.children.dataDefinitions.length).to.equal(5);
        });
});
