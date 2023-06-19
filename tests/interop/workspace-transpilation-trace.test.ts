import {expect} from "chai";
import * as fs from "fs";
import {findByPosition, Point, pos, Position} from "../../src";
import { loadEObject, loadEPackages } from "../../src/interop/ecore"
import { SourceNode, TargetNode, TranspilationTraceLoader } from "../../src/interop/strumenta-playground"
import {THE_AST_EPACKAGE} from "../../src/interop/starlasu-v2-metamodel";
import * as Ecore from "ecore/dist/ecore";
import {
        THE_WORKSPACE_FILE_ECLASS,
        THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
        TRANSPILATION_EPACKAGE
} from "../../src/interop/transpilation-package";
import {ensureEcoreContainsAllDataTypes} from "../../src/interop/ecore-patching";
import {EList, EObject} from "ecore";

ensureEcoreContainsAllDataTypes();

describe('Workspace Transpilation traces', function() {
    it("Can load workspace transpilation trace produced by Kolasu as EObject",
        function () {
            this.timeout(0);

            const resourceSet = Ecore.ResourceSet.create();
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const rpg2pyMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg2py-metamodels.json'})
            const rpg2pyPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/rpgexamples/rpg2py-metamodels.json").toString()),
                rpg2pyMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpg2py-workspace-example1.json' });
            const text = fs.readFileSync('tests/data/playground/rpgexamples/rpg2py-workspace-example1.json', 'utf8')
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
                uri: "file://tests/data/playground/rpgexamples/rpg2py-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/rpgexamples/rpg2py-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/rpgexamples/rpg2py-workspace-example1.json").toString();
            const trace = loader.loadWorkspaceTranspilationTrace(example);

            // const rootSourceNode = trace.rootSourceNode;
            // expect(rootSourceNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            // expect(rootSourceNode.getSimpleType()).to.eql("CompilationUnit");
            // expect(rootSourceNode.getPosition()).to.eql(pos(1, 0,36, 30));
            // expect(rootSourceNode.getDestinationNode()!.getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            // expect(rootSourceNode.getDestinationNode()!.getDestination()).to.eql(
            //     new Position(new Point(1, 0), new Point(37, 0)));
            // expect(rootSourceNode.children.length).to.eql(11);
            // expect(rootSourceNode.getChildren("mainStatements").length).to.eql(5);
            // expect(rootSourceNode.getRole()).to.eql("root");
            // expect(rootSourceNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            // let foundSourceNode = findByPosition(rootSourceNode, pos(1, 0,32, 30)) as SourceNode;
            // expect(foundSourceNode.eo == rootSourceNode.eo).to.be.true;
            // const descNode = rootSourceNode.children[3].children[1] as SourceNode;
            // expect(descNode.getPathFromRoot()).to.eql(["dataDefinitions", 3, "type"]);
            // foundSourceNode = findByPosition(descNode, descNode.position!) as SourceNode;
            // expect(foundSourceNode.eo == descNode.eo).to.be.true;
            // const destNode = descNode!.parent!.getDestinationNode();
            // expect(destNode).not.to.be.undefined;
            // expect(destNode!.getType()).to.equal("com.strumenta.javalangmodule.ast.JFieldDecl");
            // expect(destNode!.getDestination()).to.eql(pos(5, 0, 5, 15));
            // expect(destNode!.getAttributes()["name"]).to.equal("A");
            //
            // const stmt0 = rootSourceNode.getChildren("subroutines")[0].getChildren("statements")[0];
            // expect(stmt0).not.to.be.undefined;
            // expect(stmt0.getDestinationNode()).not.to.be.undefined;
            // expect(stmt0.getDestinationNode()!.getType()).to.equal(
            //     "com.strumenta.javalangmodule.ast.JExpressionStatement");
            // expect(stmt0.getDestinationNode()!.getDestination()).to.eql(pos(14, 0, 14, 17));
            //
            // const rootTargetNode = trace.rootTargetNode;
            // expect(rootTargetNode.getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            // expect(rootTargetNode.getSimpleType()).to.eql("JCompilationUnit");
            // expect(rootTargetNode.getDestination()).to.eql(pos(1, 0, 37, 0));
            // expect(rootTargetNode.getSourceNode()!.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            // expect(rootTargetNode.getSourceNode()!.getPosition()).to.eql(
            //     new Position(new Point(1, 0), new Point(36, 30)));
            // expect(rootTargetNode.getChildren().length).to.eql(1);
            // expect(rootTargetNode.getChildren("declarations").length).to.eql(1);
            // expect(rootTargetNode.getChildren("unexisting").length).to.eql(0);
            // expect(rootTargetNode.getRole()).to.eql("root");
            //
            // const declaration = rootTargetNode.getChildren("declarations")[0];
            // expect(declaration.getRole()).to.eql("declarations");
            // let foundTargetNode = findByPosition(rootTargetNode, pos(1, 0, 29, 0)) as TargetNode;
            // expect(foundTargetNode.parent!.eo == rootTargetNode.eo).to.be.true;
            // const descTargetNode = rootTargetNode.children[0].children[5] as TargetNode;
            // expect(descTargetNode.getPathFromRoot()).to.eql(['declarations', 0, 'members', 5]);
            // foundTargetNode = findByPosition(descTargetNode, descTargetNode.position!) as TargetNode;
            // expect(foundTargetNode.eo == descTargetNode.eo).to.be.true;
            //
            // const secondField = declaration.getChildren("members")[1];
            // expect(secondField.getRole()).to.eql("members");
            // expect(secondField.getAttributes()["name"]).to.eql("RESULT");
            // const fieldSourceNode = secondField.getSourceNode();
            // expect(fieldSourceNode).not.to.be.undefined;
            // expect(fieldSourceNode!.getType()).to.equal("com.strumenta.rpgparser.model.StandaloneField");
            // expect(fieldSourceNode!.getAttributes()["name"]).to.eql("RESULT");
            // expect(fieldSourceNode!.getPosition()).to.eql(pos(6, 0, 6, 49));
        });
});
