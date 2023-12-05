import {expect} from "chai";
import * as fs from "fs";
import {findByPosition, Point, pos, Position} from "../../src";
import { loadEObject, loadEPackages } from "../../src/interop/ecore"
import { SourceNode, TargetNode, TranspilationTraceLoader } from "../../src/interop/strumenta-playground"
import ECore from "ecore/dist/ecore";
import {ensureEcoreContainsAllDataTypes} from "../../src/interop/ecore-patching";

ensureEcoreContainsAllDataTypes();

describe('Transpilation traces', function() {
    // This test verifies that the EReference class has been loaded correctly.
    // Under certain circumstances this was not the case
    it("Can instantiate EReference correctly", function () {
            const A_ECLASS = ECore.EClass.create({
                    name: "MyClass",
                    abstract: true,
            });
            const ef = ECore.EReference.create({
                    name: "sourceAST",
                    containment: true,
                    eType: A_ECLASS
            });
            expect(ef.get("eType").get("name")).to.eql("MyClass")
    })
        it("Can load Java metamodel correctly", function () {
                const resourceSet = ECore.ResourceSet.create();
                const resource = resourceSet.create({uri: 'file:/tests/data/playground/java-metamodels.json'})
                const data = JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString());
                resource.parse(data);
                const jcompilationunit = resource.eContents()[0].eContents().find(c => c.get("name") == "JCompilationUnit");
                expect(jcompilationunit).not.to.be.null;
                const declarations = jcompilationunit.eContents()[0];
                expect(declarations.get("name")).to.eql( "declarations");
                expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
        })
        it("Can load eType for all references in Java metamodel",
            function () {
                    const resourceSet = ECore.ResourceSet.create();
                    const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg-metamodels.json'})
                    const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString()),
                        rpgMetamodelsResource);
                    expect(rpgMetamodelsResource.eContents().length).to.eql(1);
                    const javaast = rpgMetamodelsResource.eContents()[0];
                    expect(javaast.eClass.get("name")).to.eql("EPackage");
                    expect(javaast.eContents().length).to.eql(42);
                    const jCompilationUnit = javaast.eContents().find(c => c.get("name") == "JCompilationUnit");
                    expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
                    expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
                    expect(jCompilationUnit.eContents().length).to.eql(1);
                    const declarations = jCompilationUnit.eContents()[0];
                    expect(declarations.eClass.get("name")).to.eql("EReference");
                    expect(declarations.get("name")).to.eql("declarations");
                    expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
            }
        );
    it("Can load transpilation trace produced by Kolasu as EObject",
        function () {
            const resourceSet = ECore.ResourceSet.create();
            const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/rpg-metamodels.json'})
            const rpgPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/rpg-metamodels.json").toString()),
                 rpgMetamodelsResource);
            const javaMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/playground/java-metamodels.json'})
            const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString()),
                javaMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpgtojava-transpilation-example.json' });
            const text = fs.readFileSync('tests/data/playground/rpgtojava-transpilation-example.json', 'utf8')

            const javaast = javaMetamodelsResource.eContents()[0];
            expect(javaast.eClass.get("name")).to.eql("EPackage");
            expect(javaast.eContents().length).to.eql(42);
            const jCompilationUnit = javaast.eContents().find(c => c.get("name") == "JCompilationUnit");
            expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
            expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
            expect(jCompilationUnit.eContents().length).to.eql(1);
            const declarations = jCompilationUnit.eContents()[0];
            expect(declarations.eClass.get("name")).to.eql("EReference");
            expect(declarations.get("name")).to.eql("declarations");
            expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");

            const example1 = loadEObject(text.toString(), resource);
            expect(example1.get("sourceResult").get("root").eClass.get("name")).to.equal("CompilationUnit");
        });
    it("Can load transpilation trace produced by Kolasu as TranspilationTrace instance",
        function () {
            const loader = new TranspilationTraceLoader({
                name: "rpg",
                uri: "file://tests/data/playground/rpg-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/rpg-metamodels.json").toString())
            }, {
                name: "java",
                uri: "file://tests/data/playground/java-metamodels.json",
                metamodel: JSON.parse(fs.readFileSync("tests/data/playground/java-metamodels.json").toString())
            });
            const example = fs.readFileSync("tests/data/playground/rpgtojava-transpilation-example.json").toString();
            const trace = loader.loadTranspilationTrace(example);

            const rootSourceNode = trace.rootSourceNode;
            expect(rootSourceNode.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(rootSourceNode.getSimpleType()).to.eql("CompilationUnit");
            expect(rootSourceNode.getPosition()).to.eql(pos(1, 0,36, 30));
            expect(rootSourceNode.getDestinationNodes()[0].getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            expect(rootSourceNode.getDestinationNodes()[0].getDestination()).to.eql(
                new Position(new Point(1, 0), new Point(37, 0)));
            expect(rootSourceNode.children.length).to.eql(11);
            expect(rootSourceNode.getChildren("mainStatements").length).to.eql(5);
            expect(rootSourceNode.getRole()).to.eql("root");
            expect(rootSourceNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");
            let foundSourceNode = findByPosition(rootSourceNode, pos(1, 0,32, 30)) as SourceNode;
            expect(foundSourceNode.eo == rootSourceNode.eo).to.be.true;
            const descNode = rootSourceNode.children[3].children[1] as SourceNode;
            expect(descNode.getPathFromRoot()).to.eql(["dataDefinitions", 3, "type"]);
            foundSourceNode = findByPosition(descNode, descNode.position!) as SourceNode;
            expect(foundSourceNode.eo == descNode.eo).to.be.true;
            const destinationNodes = descNode!.parent!.getDestinationNodes();
            expect(destinationNodes.length).to.eql(1);
            const destNode = destinationNodes[0];
            expect(destNode).not.to.be.undefined;
            expect(destNode!.getType()).to.equal("com.strumenta.javalangmodule.ast.JFieldDecl");
            expect(destNode!.getDestination()).to.eql(pos(5, 0, 5, 15));
            expect(destNode!.getAttributes()["name"]).to.equal("A");

            const stmt0 = rootSourceNode.getChildren("subroutines")[0].getChildren("statements")[0];
            expect(stmt0).not.to.be.undefined;
            expect(stmt0.getDestinationNodes()).not.to.be.empty;
            expect(stmt0.getDestinationNodes()[0].getType()).to.equal(
                "com.strumenta.javalangmodule.ast.JExpressionStatement");
            expect(stmt0.getDestinationNodes()[0].getDestination()).to.eql(pos(14, 0, 14, 17));

            const rootTargetNode = trace.rootTargetNode;
            expect(rootTargetNode.getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            expect(rootTargetNode.getSimpleType()).to.eql("JCompilationUnit");
            expect(rootTargetNode.getDestination()).to.eql(pos(1, 0, 37, 0));
            expect(rootTargetNode.getSourceNode()!.getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(rootTargetNode.getSourceNode()!.getPosition()).to.eql(
                new Position(new Point(1, 0), new Point(36, 30)));
            expect(rootTargetNode.getChildren().length).to.eql(1);
            expect(rootTargetNode.getChildren("declarations").length).to.eql(1);
            expect(rootTargetNode.getChildren("unexisting").length).to.eql(0);
            expect(rootTargetNode.getRole()).to.eql("root");

            const declaration = rootTargetNode.getChildren("declarations")[0];
            expect(declaration.getRole()).to.eql("declarations");
            let foundTargetNode = findByPosition(rootTargetNode, pos(1, 0, 29, 0)) as TargetNode;
            expect(foundTargetNode.parent!.eo == rootTargetNode.eo).to.be.true;
            const descTargetNode = rootTargetNode.children[0].children[5] as TargetNode;
            expect(descTargetNode.getPathFromRoot()).to.eql(['declarations', 0, 'members', 5]);
            foundTargetNode = findByPosition(descTargetNode, descTargetNode.position!) as TargetNode;
            expect(foundTargetNode.eo == descTargetNode.eo).to.be.true;

            const secondField = declaration.getChildren("members")[1];
            expect(secondField.getRole()).to.eql("members");
            expect(secondField.getAttributes()["name"]).to.eql("RESULT");
            const fieldSourceNode = secondField.getSourceNode();
            expect(fieldSourceNode).not.to.be.undefined;
            expect(fieldSourceNode!.getType()).to.equal("com.strumenta.rpgparser.model.StandaloneField");
            expect(fieldSourceNode!.getAttributes()["name"]).to.eql("RESULT");
            expect(fieldSourceNode!.getPosition()).to.eql(pos(6, 0, 6, 49));
        });
/*
    it("Can load transpilation trace produced by Pylasu as TranspilationTrace instance",
        function () {
            this.timeout(0);
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE);
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
            const sasMetamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/pylasu/sas-metamodel.json").toString());
            const pyMetamodel =
                JSON.parse(fs.readFileSync("tests/data/playground/pylasu/pyspark-metamodel.json").toString());
            const loader = new TranspilationTraceLoader({
                name: "sas",
                uri: "file://tests/data/playground/pylasu/sas-metamodel.json",
                metamodel: sasMetamodel
            }, {
                name: "python",
                uri: "file://tests/data/playground/pylasu/pyspark-metamodel.json",
                metamodel: pyMetamodel
            });
            const example = fs.readFileSync("tests/data/playground/pylasu/array_test_0.json").toString();
            const trace = loader.loadTranspilationTrace(example);

            expect(trace.rootSourceNode.getType()).to.eql("com.strumenta.sas.Program");
            expect(trace.rootSourceNode.getSimpleType()).to.eql("Program");
            expect(trace.rootSourceNode.getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            expect(trace.rootSourceNode.getDestinationNode().getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            expect(trace.rootSourceNode.getDestinationNode().getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            expect(trace.rootSourceNode.getChildren().length).to.eql(11);
            expect(trace.rootSourceNode.getChildren("mainStatements").length).to.eql(5);
            expect(trace.rootSourceNode.getRole()).to.eql("sourceAST");
            expect(trace.rootSourceNode.getChildren("mainStatements")[0].getRole()).to.eql("mainStatements");

            expect(trace.rootTargetNode.getType()).to.eql("com.strumenta.javalangmodule.ast.JCompilationUnit");
            expect(trace.rootTargetNode.getSimpleType()).to.eql("JCompilationUnit");
            expect(trace.rootTargetNode.getDestination()).to.eql(new Position(new Point(1, 0), new Point(29, 0)));
            expect(trace.rootTargetNode.getSourceNode().getType()).to.eql("com.strumenta.rpgparser.model.CompilationUnit");
            expect(trace.rootTargetNode.getSourceNode().getPosition()).to.eql(new Position(new Point(1, 0), new Point(32, 30)));
            expect(trace.rootTargetNode.getChildren().length).to.eql(1);
            expect(trace.rootTargetNode.getChildren("declarations").length).to.eql(1);
            expect(trace.rootTargetNode.getChildren("unexisting").length).to.eql(0);
            expect(trace.rootTargetNode.getRole()).to.eql("targetAST");
            expect(trace.rootTargetNode.getChildren("declarations")[0].getRole()).to.eql("declarations");
        });*/
});
