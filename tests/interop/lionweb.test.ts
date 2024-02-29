import FS_LANGUAGE_JSON from "./fs-language.json";
import FS_MODEL from "./fs-model.json";
import {expect} from "chai";
import {deserializeChunk, deserializeLanguages, SerializationChunk} from "@lionweb/core";
import {Children, Node, walk} from "../../src";
import {
    DynamicNode,
    findClassifier,
    LanguageMapping,
    STARLASU_LANGUAGE,
    STARLASU_LANGUAGE_MAPPING,
    TylasuInstantiationFacade
} from "../../src/interop/lionweb";
import {map, pipe, reduce} from "iter-ops";

abstract class File extends Node {
    name: string;
}

class Directory extends File {
    @Children()
    files: File[];
}

class TextFile extends File {
    contents: string;
}

function printSequence(sequence: Generator<Node>): string {
    return pipe(sequence, map(n => n.name), reduce((s1, s2) => s1 + (s1 ? ", " : "") + s2, "")).first;
}

describe('Lionweb integration', function() {
    const FS_LANGUAGE = deserializeLanguages(FS_LANGUAGE_JSON as SerializationChunk, STARLASU_LANGUAGE)[0];
    const FS_LANGUAGE_MAPPING = new LanguageMapping().extend(STARLASU_LANGUAGE_MAPPING);
    FS_LANGUAGE_MAPPING.register(Directory, findClassifier(FS_LANGUAGE, "starlasu_language_com-strumenta-codeinsightstudio-model-filesystem_Directory"));
    FS_LANGUAGE_MAPPING.register(File, findClassifier(FS_LANGUAGE, "starlasu_language_com-strumenta-codeinsightstudio-model-filesystem_File"));
    FS_LANGUAGE_MAPPING.register(TextFile, findClassifier(FS_LANGUAGE, "starlasu_language_com-strumenta-codeinsightstudio-model-filesystem_TextFile"));

    it("can deserialize simple model",
        function () {
            const nodes = deserializeChunk(FS_MODEL, new TylasuInstantiationFacade([FS_LANGUAGE_MAPPING]), [FS_LANGUAGE], []);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            const root = nodes[0];
            expect(root.node).to.be.instanceof(Directory);
            let dir = root.node as Directory;
            expect(dir.name).to.equal("resources.zip");
            expect(dir.files.length).to.equal(1);
            expect(dir.files[0]).to.be.instanceof(Directory);
            dir = dir.files[0] as Directory;
            expect(dir.name).to.equal("resources");
            expect(dir.files.length).to.equal(15);
            expect(dir.files[0]).to.be.instanceof(TextFile);
            const file = dir.files[0] as TextFile;
            expect(file.name).to.equal("delegate.egl");
            expect(file.contents.substring(0, 10)).to.equal("Delegate F");

            expect(printSequence(walk(root.node))).to.equal(
                "resources.zip, resources, delegate.egl, rosetta-code-count-examples-2.egl, " +
                "rosetta-code-count-examples-1.egl, sub1, sub2, foreach.egl, SQLDropTable.egl, for.egl, SQLBatch.egl, " +
                "SQLCreateTable.egl, SQLDropTable.egl, hello.egl, foreach.egl, Calc.egl, SQLBatch.egl, " +
                "multipleWhenCondition.egl, handler.egl, SQLCreateTable.egl, newExample.egl, SQLDropTable.egl, " +
                "nestedLoop.egl, for.egl");
        });

    it("can deserialize simple model to dynamic nodes",
        function () {
            const nodes = deserializeChunk(FS_MODEL, new TylasuInstantiationFacade(), [FS_LANGUAGE], []);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            const root = nodes[0];
            expect(root.node).to.be.instanceof(DynamicNode);
            let dir = root.node as DynamicNode & any;
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.name).to.equal("resources.zip");
            expect(dir.files.length).to.equal(1);
            expect(dir.files[0]).to.be.instanceof(DynamicNode);
            dir = dir.files[0] as DynamicNode & any;
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.name).to.equal("resources");
            expect(dir.files.length).to.equal(15);
            expect(dir.files[0]).to.be.instanceof(DynamicNode);
            const file = dir.files[0] as DynamicNode & any;
            expect(file.nodeDefinition.name).to.equal("TextFile");
            expect(file.name).to.equal("delegate.egl");
            expect(file.contents.substring(0, 10)).to.equal("Delegate F");

            expect(printSequence(walk(root.node))).to.equal(
                "resources.zip, resources, delegate.egl, rosetta-code-count-examples-2.egl, " +
                "rosetta-code-count-examples-1.egl, sub1, sub2, foreach.egl, SQLDropTable.egl, for.egl, SQLBatch.egl, " +
                "SQLCreateTable.egl, SQLDropTable.egl, hello.egl, foreach.egl, Calc.egl, SQLBatch.egl, " +
                "multipleWhenCondition.egl, handler.egl, SQLCreateTable.egl, newExample.egl, SQLDropTable.egl, " +
                "nestedLoop.egl, for.egl");
        });
});