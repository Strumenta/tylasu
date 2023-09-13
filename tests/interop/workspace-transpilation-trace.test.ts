import {expect} from "chai";
import * as fs from "fs";
import {Point, Position} from "../../src";
import { loadEObject, loadEPackages } from "../../src/interop/ecore"
import { TranspilationTraceLoader } from "../../src/interop/strumenta-playground"
import {THE_AST_EPACKAGE} from "../../src/interop/starlasu-v2-metamodel";
import * as Ecore from "ecore/dist/ecore";
import {
        THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
        TRANSPILATION_EPACKAGE
} from "../../src/interop/transpilation-package";
import {EList} from "ecore";

describe('Workspace Transpilation traces', function() {
    it("Can load workspace transpilation trace produced by Kolasu as EObject",
        function () {
            this.timeout(0);

            const resourceSet = Ecore.ResourceSet.create();
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const rpg2pyMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg2py-metamodels.json'})
            const rpg2pyPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/rpg/rpg2py-metamodels.json").toString()),
                rpg2pyMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpg2py-workspace-example1.json' });
            const text = fs.readFileSync('tests/data/playground/rpg/rpg2py-workspace-example1.json', 'utf8')
            const workspaceTrace = loadEObject(text, resource, THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS)

            expect(workspaceTrace.eClass.get("name")).to.eql("WorkspaceTranspilationTrace");

            const originalFiles = workspaceTrace.get("originalFiles") as EList;
            expect(originalFiles.size()).to.eql(6);

            expect(originalFiles.at(0).get("path")).to.eql("qddssrc/DEORD.dds");
        });
    it("Can load workspace transpilation trace produced by Kolasu as WorkspaceTranspilationTrace instance",
        function () {
            this.timeout(0);
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const loader = new TranspilationTraceLoader({
                name: "rpg2py",
                uri: "file://tests/data/playground/rpg/rpg2py-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/rpg/rpg2py-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/rpg/rpg2py-workspace-example1.json").toString();
            const trace = loader.loadWorkspaceTranspilationTrace(example);

            expect(trace.originalFiles.length).to.eql(6);
            expect(trace.generatedFiles.length).to.eql(2);
            expect(trace.transpilationIssues.length).to.eql(0);

            const deordFile = trace.originalFiles[0];
            expect(deordFile.path).to.eql("qddssrc/DEORD.dds")
            expect(deordFile.code).to.eql("     A                                      REF(SAMREF)\n     A          R FDETO\n     A            ODORID    R               REFFLD(ORID)\n     A            ODYEAR    R               REFFLD(YEAR)\n     A            ODLINE    R\n     A            ODARID    R               REFFLD(ARID)\n     A            ODQTY     R               TEXT('ORDERED QUANTITY')\n     A                                      COLHDG('ORDER' 'QUANTITY')\n     A                                      REFFLD(QUANTITY)\n     A            ODQTYLIV  R               TEXT('DELIVERED QUANTITY')\n     A                                      COLHDG('DELIV' 'QUANTITY')\n     A                                      REFFLD(QUANTITY)\n     A            ODPRICE   R               REFFLD(UNITPRICE)\n     A            ODTOT     R               REFFLD(TOTPRICE)\n     A            ODTOTVAT  R               REFFLD(TOTPRICE)\n     A                                      TEXT('TOTAL LINE WITH VAT')\n     A                                      COLHDG('TOTAL LINE' 'WITH VAT')\n     A          K ODLINE\n     A          K ODORID\n     A          K ODYEAR");
            expect(deordFile.issues.length).to.eql(0)
            expect(deordFile.node.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit")
            expect(deordFile.node.getSimpleType()).to.eql("CompilationUnit")
            expect(deordFile.node.getPosition()).to.eql(new Position(new Point(1, 0), new Point(20, 24)))
            expect(deordFile.node.getChildren("dataDescriptions").length).to.eql(2)
            expect(deordFile.node.getChildren("dataDescriptions")[0].getSimpleType()).to.eql("FileEntry")
            expect(deordFile.node.getChildren("dataDescriptions")[1].getSimpleType()).to.eql("RecordFormat")
            expect(deordFile.node.getChildren("dataDescriptions")[1].getAttribute("name")).to.eql("FDETO")

            const customerFile = trace.originalFiles[1];
            expect(customerFile.path).to.eql("qddssrc/CUSTOMER.dds");
            const field = customerFile.node.getChildren("dataDescriptions")[1].getChildren("fields")[2];
            let destinationNodes = field.getDestinationNodes();
            expect(destinationNodes.length).to.equal(1);
            expect(destinationNodes[0].file?.path).to.equal("output/schema.sql");

            const cus200File = trace.originalFiles.find(
                f => f.path == "qrpglesrc/CUS200.rpgle"
            )!;
            const firstStatement = cus200File.node.getChildren("mainStatements")[0];
            expect(firstStatement.isDeclaration()).to.be.false;
            expect(firstStatement.isExpression()).to.be.false;
            expect(firstStatement.isStatement()).to.be.true;
            destinationNodes = firstStatement.getDestinationNodes();
            expect(destinationNodes.length).to.equal(1);
            expect(destinationNodes[0].file?.path).to.equal(
                "/Users/ftomassetti/repos/rpg-to-python-transpiler/output/CUS200.py"
            );
        });
});
