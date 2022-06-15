import {expect} from "chai";
import * as fs from "fs";
import {loadEObject, loadEPackages, THE_AST_EPACKAGE, THE_NODE_ECLASS} from "../../src";
import * as Ecore from "ecore/dist/ecore";
import {TRANSPILATION_EPACKAGE} from "../../src/interop/transpilation_package";
import {ensureEcoreContainsEchar} from "../../src/interop/ecore_patching";
import {
    TranspilationTraceLoader
} from "../../src/transformation/transpilation_trace";

describe('Transpilation traces', function() {
    // This test verifies that the EReference class has been loaded correctly.
    // Under certain circumstances this was not the case
    it("Can instantiate EReference correctly", function () {
            const A_ECLASS = Ecore.EClass.create({
                    name: "MyClass",
                    abstract: true,
            });
            const ef = Ecore.EReference.create({
                    name: "sourceAST",
                    containment: true,
                    eType: A_ECLASS
            });
            expect(ef.get("eType").get("name")).to.eql("MyClass")
    })
        it("Can load Java metamodel correctly", function () {
                const resourceSet = Ecore.ResourceSet.create();
                const resource = resourceSet.create({uri: 'file:/tests/data/total-bench/java-metamodels.json'})
                const data = JSON.parse(fs.readFileSync("tests/data/total-bench/java-metamodels.json").toString());
                resource.parse(data);
                const jcompilationunit = resource.eContents()[0].eContents()[30];
                expect(jcompilationunit.get("name")).to.eql( "JCompilationUnit");
                const declarations = jcompilationunit.eContents()[0];
                expect(declarations.get("name")).to.eql( "declarations");
                expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");
        })
        it("Can load eType for all references in Java metamodel",
            function () {
                    this.timeout(0);
                    const resourceSet = Ecore.ResourceSet.create();
                    Ecore.EPackage.Registry.register(THE_AST_EPACKAGE)
                    Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE)
                    const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/total-bench/rpg-metamodels.json'})
                    const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/total-bench/java-metamodels.json").toString()),
                        rpgMetamodelsResource);
                    expect(rpgMetamodelsResource.eContents().length).to.eql(1);
                    const javaast = rpgMetamodelsResource.eContents()[0];
                    expect(javaast.eClass.get("name")).to.eql("EPackage");
                    expect(javaast.eContents().length).to.eql(31);
                    const jCompilationUnit = javaast.eContents()[30];
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
            this.timeout(0);

            const resourceSet = Ecore.ResourceSet.create();
            ensureEcoreContainsEchar();
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE)
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE)
            const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/total-bench/rpg-metamodels.json'})
            const rpgPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/total-bench/rpg-metamodels.json").toString()),
                 rpgMetamodelsResource);
            const javaMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/total-bench/java-metamodels.json'})
            const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/total-bench/java-metamodels.json").toString()),
                javaMetamodelsResource);

            const resource = resourceSet.create({ uri: 'rpgtojava-transpilation-example.json' });
            const text = fs.readFileSync('tests/data/total-bench/rpgtojava-transpilation-example.json', 'utf8')

            const javaast = javaMetamodelsResource.eContents()[0];
            expect(javaast.eClass.get("name")).to.eql("EPackage");
            expect(javaast.eContents().length).to.eql(31);
            const jCompilationUnit = javaast.eContents()[30];
            expect(jCompilationUnit.eClass.get("name")).to.eql("EClass");
            expect(jCompilationUnit.get("name")).to.eql("JCompilationUnit");
            expect(jCompilationUnit.eContents().length).to.eql(1);
            const declarations = jCompilationUnit.eContents()[0];
            expect(declarations.eClass.get("name")).to.eql("EReference");
            expect(declarations.get("name")).to.eql("declarations");
            expect(declarations.get("eType").get("name")).to.eql("JClassDeclaration");

            const example1 = loadEObject(text.toString(), resource);
            expect(example1.get("sourceAST").eClass.get("name")).to.equal("CompilationUnit");
        });
    it("Can load transpilation trace produced by Kolasu as TranspilationTrace instance",
        function () {
            this.timeout(0);
            const loader = new TranspilationTraceLoader("tests/data/total-bench/rpg-metamodels.json", "tests/data/total-bench/java-metamodels.json");
            const trace = loader.loadTranspilationTraceFromFile('tests/data/total-bench/rpgtojava-transpilation-example.json');
            // TODO test type of target root
            // TODO test type of source root
            // TODO test source root to target root
            // TODO test target root to source root
        });
});
