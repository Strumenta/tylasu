import fs from "fs";
import {EObject, Resource} from "ecore";
import {loadEObject, loadEPackages} from "../interop/ecore";
import * as Ecore from "ecore/dist/ecore";

export class TranspilationTrace {
    constructor(private eo: EObject) {
    }
}

export class TranspilationTraceLoader {
    private readonly resourceSet: Ecore.ResourceSet
    private readonly resource: Resource

    constructor(...languages: string[]) {
        this.resourceSet = Ecore.ResourceSet.create();
        this.resource = this.resourceSet.create({uri: 'transpilation-dummy.json'});
        languages.forEach((l)=> this.registerLanguageFromFile(l));
    }

    registerLanguageFromFile(metamodelPath: string) {
        const languageResource = this.resourceSet.create({uri: 'language_' + metamodelPath})
        const languagePackages = loadEPackages(JSON.parse(fs.readFileSync(metamodelPath).toString()),
            languageResource);
    }

    loadTranspilationTraceFromFile(path: string) : TranspilationTrace {
        const text = fs.readFileSync(path, 'utf8')
        const eo = loadEObject(text.toString(), this.resource);
        return new TranspilationTrace(eo);
    }
}
