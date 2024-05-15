import EGL_LANGUAGE_JSON from "./egl-language.json";
import EGL_MODEL from "./egl-model.json";
import FS_LANGUAGE_JSON from "./fs-language.json";
import FS_MODEL from "./fs-model.json";
import {expect} from "chai";
import {deserializeLanguages, SerializationChunk} from "@lionweb/core";
import {Attribute, Child, Children, Node, TraceNode, walk} from "../../src";
import {
    deserializeToTraceNodes,
    deserializeToTylasuNodes,
    findClassifier,
    LanguageMapping, LionwebNode,
    STARLASU_LANGUAGE_MAPPING,
    TylasuInstantiationFacade, TylasuNodeWrapper
} from "../../src/interop/lionweb";
import {filter, map, pipe, reduce} from "iter-ops";
import {STARLASU_LANGUAGE} from "../../src/interop/lionweb-starlasu-language";

abstract class File extends Node {
    @Attribute()
    name: string;
}

class Directory extends File {
    @Children()
    files: File[];
}

class TextFile extends File {
    @Attribute()
    contents: string;
    @Child()
    parsingResult: Node;
}

function printSequence(sequence: Generator<Node>): string {
    return pipe(sequence, filter(n => n.name), map(n => n.name), reduce((s1, s2) => s1 + (s1 ? ", " : "") + s2, "")).first;
}

describe('Lionweb integration', function() {
    const EGL_LANGUAGE = deserializeLanguages(EGL_LANGUAGE_JSON as SerializationChunk, STARLASU_LANGUAGE)[0];

    const FS_LANGUAGE = deserializeLanguages(FS_LANGUAGE_JSON as SerializationChunk, STARLASU_LANGUAGE)[0];
    const FS_LANGUAGE_MAPPING = new LanguageMapping().extend(STARLASU_LANGUAGE_MAPPING);
    FS_LANGUAGE_MAPPING.register(Directory, findClassifier(FS_LANGUAGE, "com_strumenta_codeinsightstudio_model_filesystem-Directory-id"));
    FS_LANGUAGE_MAPPING.register(File, findClassifier(FS_LANGUAGE, "com_strumenta_codeinsightstudio_model_filesystem-File-id"));
    FS_LANGUAGE_MAPPING.register(TextFile, findClassifier(FS_LANGUAGE, "com_strumenta_codeinsightstudio_model_filesystem-TextFile-id"));

    it("can deserialize model to Tylasu nodes",
        function () {
            const nodes = deserializeToTylasuNodes(FS_MODEL, [FS_LANGUAGE], [FS_LANGUAGE_MAPPING]);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            const root = nodes[0];
            expect(root).to.be.instanceof(Directory);
            let dir = root as Directory;
            expect(dir.name).to.equal("egl-example-1.zip");
            expect(dir.files.length).to.equal(1);
            expect(dir.files[0]).to.be.instanceof(Directory);
            dir = dir.files[0] as Directory;
            expect(dir.name).to.equal("eglzip");
            expect(dir.files.length).to.equal(4);
            expect(dir.files[0]).to.be.instanceof(TextFile);
            const file = dir.files[0] as TextFile;
            expect(file.name).to.equal("delegate.egl");
            expect(file.contents.substring(0, 10)).to.equal("Delegate F");
        });

    it("can deserialize model to dynamic nodes",
        function () {
            const nodes = deserializeToTylasuNodes(FS_MODEL, [FS_LANGUAGE]);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            const root = nodes[0];
            expect(root).to.be.instanceof(LionwebNode);
            let dir = root as LionwebNode & any;
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.getAttributeValue("name")).to.equal("egl-example-1.zip");
            expect(dir.files.length).to.equal(1);
            expect(dir.files[0]).to.be.instanceof(LionwebNode);
            dir = dir.files[0] as LionwebNode & any;
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.name).to.equal("eglzip");
            expect(dir.files.length).to.equal(4);
            expect(dir.files[0]).to.be.instanceof(LionwebNode);
            const file = dir.files[0] as LionwebNode & any;
            expect(file.nodeDefinition.name).to.equal("TextFile");
            expect(file.name).to.equal("delegate.egl");
            expect(file.contents.substring(0, 10)).to.equal("Delegate F");
        });

    it("supports trace nodes",
        function () {
            const nodes = deserializeToTraceNodes(FS_MODEL, [FS_LANGUAGE]);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            let dir = nodes[0];
            expect(dir.nodeDefinition).not.to.be.undefined;
            expect(dir.getRole()).to.be.undefined;
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.containment("position")).to.be.undefined;
            expect(dir.getAttributeValue("name")).to.equal("egl-example-1.zip");
            expect(dir.getChildren("files").length).to.equal(1);
            dir = dir.getChildren("files")[0];
            expect(dir.nodeDefinition.name).to.equal("Directory");
            expect(dir.getAttributeValue("name")).to.equal("eglzip");
            expect(dir.getChildren("files").length).to.equal(4);
            const file = dir.getChildren("files")[1];
            expect(file.nodeDefinition.name).to.equal("TextFile");
            expect(file.getAttributeValue("name")).to.equal("foreach.egl");
            expect(file.getAttributeValue("contents").substring(0, 10)).to.equal("function e");
            expect(file.getRole()).to.equal("files");
            expect(file.getPathFromRoot()).to.eql(["files", 0, "files", 1]);
        });
    it("trace nodes don't include the position as a child",
        function () {
            const nodes = deserializeToTraceNodes(EGL_MODEL, [EGL_LANGUAGE]);
            expect(nodes).not.to.be.empty;
            expect(nodes.length).to.equal(1);
            const dir = nodes[0];
            expect(dir.nodeDefinition).not.to.be.undefined;
            expect(dir.getRole()).to.be.undefined;
            expect(dir.nodeDefinition.name).to.equal("EglCompilationUnit");
            expect(dir.containment("position")).to.be.undefined;
            expect(dir.position).not.to.be.undefined;
            expect(dir.children.length).to.equal(0);
        });
});
