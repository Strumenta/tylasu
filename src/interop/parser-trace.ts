import {EObject, Resource} from "ecore";
import {Position} from "../position";
import {Node, TranspilationTrace} from "../transformation/transpilation_trace"
import {fromEObject, loadEObject, loadEPackages} from "./ecore";
import fs from "fs";
import * as Ecore from "ecore/dist/ecore";
import {PARSER_TRACE_ECLASS} from "./parser_package";

export class ParserTrace {
    constructor(private eo: EObject) {
    }

    getRootNode() : ParserNode {
        return new ParserNode(this.eo.get("sourceAST"), this)
    }

    private getEObjectID(eObject: EObject) : string {
        return eObject.fragment();
    }
}

class ParserNode extends Node {

    constructor(eo: EObject, protected trace: ParserTrace) {
        super(eo);
    }

    getPosition() : Position | null {
        const raw = this.eo.get("position");
        if (raw == null) {
            return null
        }
        return fromEObject(raw) as Position;
    }

    getChildren(role?: string) : ParserNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c)=>role==null || role == c.eContainingFeature.get("name"))
            .map((c)=>new ParserNode(c, this.trace));
    }

}


export class ParserTraceLoader {
    private readonly resourceSet: Ecore.ResourceSet
    private readonly resource: Resource

    constructor(...languages: string[]) {
        this.resourceSet = Ecore.ResourceSet.create();
        this.resource = this.resourceSet.create({uri: 'parser-dummy.json'});
        languages.forEach((l)=> this.registerLanguageFromFile(l));
    }

    registerLanguageFromFile(metamodelPath: string) : void {
        const languageResource = this.resourceSet.create({uri: 'language_' + metamodelPath})
        loadEPackages(JSON.parse(fs.readFileSync(metamodelPath).toString()),
            languageResource);
    }

    loadParserTraceFromFile(path: string) : ParserTrace {
        const text = fs.readFileSync(path, 'utf8')
        const eo = loadEObject(text.toString(), this.resource, PARSER_TRACE_ECLASS);
        return new ParserTrace(eo);
    }
}
