import {expect} from "chai";
import * as fs from "fs";
import {Point, pos, Position, ReferenceByName, TraceNode} from "../../src";
import { loadEObject, loadEPackages } from "../../src/interop/ecore"
import {TranspilationTraceLoader} from "../../src/interop/strumenta-playground"
import {THE_AST_EPACKAGE} from "../../src/interop/starlasu-v2-metamodel";
import ECore from "ecore";
import {
        THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
        TRANSPILATION_EPACKAGE
} from "../../src/interop/transpilation-package";
import {pipe, filter, first} from "iter-ops";

describe('Workspace Transpilation traces', function() {
    it("Can load workspace transpilation trace produced by Kolasu as EObject",
        function () {
            const resourceSet = ECore.ResourceSet.create();
            ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
            ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const rpg2pyMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg2py-metamodels.json'})
            const rpg2pyPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/rpg/rpg2py-metamodels.json").toString()),
                rpg2pyMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpg2py-workspace-example1.json' });
            const text = fs.readFileSync('tests/data/playground/rpg/rpg2py-workspace-example1.json', 'utf8')
            const workspaceTrace = loadEObject(text, resource, THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS)

            expect(workspaceTrace.eClass.get("name")).to.eql("WorkspaceTranspilationTrace");

            const originalFiles = workspaceTrace.get("originalFiles") as ECore.EList;
            expect(originalFiles.size()).to.eql(6);

            expect(originalFiles.at(0).get("path")).to.eql("qddssrc/DEORD.dds");
        });
    it("Can load workspace transpilation trace produced by Kolasu as WorkspaceTranspilationTrace instance",
        function () {
            ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
            ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
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
            expect(deordFile.node.getChildren("dataDescriptions")[1].getAttributeValue("name")).to.eql("FDETO")

            const customerFile = trace.originalFiles[1];
            expect(customerFile.path).to.eql("qddssrc/CUSTOMER.dds");
            const field = customerFile.node.getChildren("dataDescriptions")[1].getChildren("fields")[2];
            expect(field.getPathFromRoot()).to.eql(['dataDescriptions', 1, 'fields', 2]);
            let destinationNodes = field.getDestinationNodes();
            expect(destinationNodes.length).to.equal(1);
            expect(destinationNodes[0].file?.path).to.equal("output/schema.sql");
            expect(destinationNodes[0].parent).not.to.be.undefined;
            expect(destinationNodes[0].getPathFromRoot()).to.eql(['body', 3, 'columns', 3]);
            const sourceNode = destinationNodes[0].getSourceNode();
            expect(sourceNode?.getPathFromRoot()).to.eql(['dataDescriptions', 1, 'fields', 2]);
            expect(sourceNode?.file?.path).to.equal("qddssrc/CUSTOMER.dds");

            const cus200File = trace.originalFiles.find(
                f => f.path == "qrpglesrc/CUS200.rpgle"
            )!;
            const firstStatement = cus200File.node.getChildren("mainStatements")[0];
            expect(firstStatement.isOfKnownType("EntityDeclaration")).to.be.false;
            expect(firstStatement.isOfKnownType("Expression")).to.be.false;
            expect(firstStatement.isOfKnownType("Statement")).to.be.true;
            destinationNodes = firstStatement.getDestinationNodes();
            expect(destinationNodes.length).to.equal(1);
            expect(destinationNodes[0].file?.path).to.equal(
                "/Users/ftomassetti/repos/rpg-to-python-transpiler/output/CUS200.py"
            );
        });
    it("Can load workspace transpilation trace produced by Kolasu with ReferenceByName instances",
            function () {
            ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
            ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const loader = new TranspilationTraceLoader({
                name: "rpg2java",
                uri: "file://tests/data/playground/java/rpg2java-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/java/rpg2java-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/java/trace.json").toString();
            const trace = loader.loadWorkspaceTranspilationTrace(example);

            expect(trace.originalFiles.length).to.eql(1);
            expect(trace.generatedFiles.length).to.eql(4);
            expect(trace.transpilationIssues.length).to.eql(0);

            const cus300File = trace.originalFiles[0];
            expect(cus300File.path).to.eql("CUS300.rpgle")
            expect(cus300File.issues.length).to.eql(0)

            const sourceRoot = cus300File.node;
            expect(sourceRoot.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit")
            expect(sourceRoot.getSimpleType()).to.eql("CompilationUnit")
            expect(sourceRoot.getPosition()).to.eql(new Position(new Point(1, 0), new Point(82, 18)))

            let refExpr = pipe(sourceRoot.walkDescendants(),
                filter((node: TraceNode) => node.getType() == "com.strumenta.rpgparser.model.ReferenceExpr"),
                first()).first as TraceNode;
            expect(refExpr).not.to.be.undefined;
            expect(refExpr.getPathFromRoot()).to.eql(["mainStatements", 0, "expression", "target"]);
            let refDef = refExpr.nodeDefinition.features["dataDefinition"];
            expect(refDef?.reference).to.be.true;
            let reference = refExpr.getReference("dataDefinition");
            expect(reference).to.be.instanceof(ReferenceByName);
            expect(reference?.name).to.equal("CNT");
            let refTarget = reference?.referred;
            expect(refTarget).to.be.instanceof(TraceNode);
            expect(refTarget?.getType()).to.equal("com.strumenta.rpgparser.model.StandaloneField");
            expect(refTarget?.name).to.equal("CNT");
            expect(refTarget?.getRole()).to.equal("dataDefinitions");
            expect(refTarget?.getPathFromRoot()).to.eql(["dataDefinitions", 3]);
            expect(refTarget?.getRoot()).to.equal(sourceRoot);
            expect(refExpr.getAttributes()["dataDefinition"]).to.be.undefined;

            refExpr = sourceRoot.getDescendant(["mainStatements", 4, "name"]) as TraceNode;
            refDef = refExpr.nodeDefinition.features["dataDefinition"];
            expect(refDef?.reference).to.be.true;
            reference = refExpr.getReference("dataDefinition");
            expect(reference).to.be.instanceof(ReferenceByName);
            expect(reference?.name).to.equal("CUSTOMER");
            refTarget = reference?.referred;
            expect(refTarget).to.be.instanceof(TraceNode);
            expect(refTarget?.getType()).to.equal("com.strumenta.rpgparser.model.ExternalFileDefinition");
            expect(refTarget?.name).to.equal("CUSTOMER");
            expect(refTarget?.getRole()).to.equal("file");
            expect(refTarget?.getPathFromRoot()).to.eql(["externalDefinitions", 17, "record", "file"]);
            expect(refTarget?.getRoot()).to.equal(sourceRoot);
            expect(refExpr.getAttributes()["dataDefinition"]).to.be.undefined;

            // TODO broken expect(cus300File.node.getChildren("dataDefinition").length).to.eql(4)
            expect(sourceRoot.getChildren("mainStatements").length).to.eql(9)
            const firstStatement = sourceRoot.getChildren("mainStatements")[0];
            expect(firstStatement.isOfKnownType("EntityDeclaration")).to.be.false;
            expect(firstStatement.isOfKnownType("Expression")).to.be.false;
            expect(firstStatement.isOfKnownType("Statement")).to.be.true;
            const destinationNodes = firstStatement.getDestinationNodes();
            expect(destinationNodes.length).to.equal(1);
            expect(destinationNodes[0].file?.path).to.equal("Cus300.java");
        });
    it("Can load workspace transpilation trace produced by Kolasu with SimpleOrigin instances",
        function () {
            ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
            ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const loader = new TranspilationTraceLoader({
                name: "rpg2java",
                uri: "file://tests/data/playground/rpg/rpg2java-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/java/rpg2java-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/java/trace-with-simple-origins.json").toString();
            const trace = loader.loadWorkspaceTranspilationTrace(example);

            expect(trace.originalFiles.length).to.eql(1);
            expect(trace.generatedFiles.length).to.eql(0);
            expect(trace.transpilationIssues.length).to.eql(0);

            const cus300File = trace.originalFiles[0];
            expect(cus300File.path).to.eql("CUS300.rpgle")
            expect(cus300File.issues.length).to.eql(0)
            expect(cus300File.node.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit")
            expect(cus300File.node.getSimpleType()).to.eql("CompilationUnit")
            // The origin is ignored. The position loaded is the explicit position
            // The sourceText is not accessible anywhere, as it is irrelevant for the TranspilationTrace
            expect(cus300File.node.getPosition()).to.eql(new Position(new Point(1, 0), new Point(82, 18)));

            const byPosition = cus300File.node.findByPosition(pos(1, 21, 1, 21)) as TraceNode;
            expect(byPosition.getType()).not.to.contain("SimpleOrigin");
        });
});
