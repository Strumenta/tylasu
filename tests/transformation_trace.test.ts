import {expect} from "chai";
import * as fs from "fs";
import {loadEObject, loadEPackages, THE_AST_EPACKAGE, THE_NODE_ECLASS} from "../src";
import * as Ecore from "ecore/dist/ecore";
import {KOLASU_TRANSPILATION_URI_V1, TRANSPILATION_EPACKAGE} from "../src/interop/transpilation_package";
import {ensureEcoreContainsEchar} from "../src/interop/ecorefix";

describe('Transformation traces', function() {
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
    it("Can load transformation trace produced by Kolasu",
        function () {
            this.timeout(0);
            const resourceSet = Ecore.ResourceSet.create();
            ensureEcoreContainsEchar();
            Ecore.EPackage.Registry.register(THE_AST_EPACKAGE)
            Ecore.EPackage.Registry.register(TRANSPILATION_EPACKAGE)
            const rpgMetamodelsResource = resourceSet.create({uri: 'file:/tests/data/total-bench/rpg-metamodels.json'})
            const rpgPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/total-bench/rpg-metamodels.json").toString()),
                 rpgMetamodelsResource);
            const javaPackages = loadEPackages(JSON.parse(fs.readFileSync("tests/data/total-bench/java-metamodels.json").toString()),
                rpgMetamodelsResource);

            //resourceSet.eContents().add(TRANSPILATION_EPACKAGE)
            const resource = resourceSet.create({ uri: 'rpgtojava-transpilation-example.json' });
            // const mmBuffer = fs.readFileSync("tests/data/sas.metamodel.json");
            // const ePackages = loadEPackages(JSON.parse(mmBuffer.toString()), resource);
            // expect(ePackages.length).to.equal(5);
            const text = fs.readFileSync('tests/data/total-bench/rpgtojava-transpilation-example.json', 'utf8')

            const javaast = rpgMetamodelsResource.eContents()[2];
            console.log(javaast.get("name"))
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

            //const example1 = loadEObject(text.toString(), resource);
            //const trace : TranspilationTrace = loadTranspilationTraceFromJSON(text);
            // expect(trace.sourceAST.type).to.equal("com.strumenta.rpgparser.model.CompilationUnit");
            // expect(trace.sourceAST.id).to.equal("src-1");
            // expect(trace.sourceAST.destination.id).to.equal("target-1");
            // expect(trace.sourceAST.destination.type).to.equal("com.strumenta.javaast.JCompilationUnit");
            // expect(trace.sourceAST.position).to.equal({start:{line:1,column:0}, end:{line:32, column:30}});
            // expect(trace.sourceAST.dataDefinitions.length).to.equal(5);
        });
});
