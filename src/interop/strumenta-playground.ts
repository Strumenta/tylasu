import {ParsingResult} from "../parsing/parsing";
import {
    EcoreMetamodelSupport,
    fromEObject,
    loadEObject,
    loadEPackages,
    Result,
    toEObject
} from "./ecore";
import {Node} from "../model/model";
import * as Ecore from "ecore/dist/ecore";
import {EObject, EPackage, Resource, ResourceSet} from "ecore";
import {Position} from "../model/position";
import {PARSER_TRACE_ECLASS} from "./parser-package";
import {THE_RESULT_ECLASS as THE_RESULT_ECLASS_V2} from "./kolasu-v2-metamodel";
import {THE_RESULT_ECLASS as THE_RESULT_ECLASS_V1} from "./kolasu-v1-metamodel";
import {Issue} from "../validation";
import {TRANSPILATION_TRACE_ECLASS} from "./transpilation-package";

export function saveForStrumentaPlayground<R extends Node>(
    result: ParsingResult<R, any>, name: string,
    metamodelSupport: EcoreMetamodelSupport, callback: (data: any, error: any) => void): void {
    const resourceSet = Ecore.ResourceSet.create();
    const mmResource = resourceSet.create({ uri: "ast" });
    metamodelSupport.generateMetamodel(mmResource, false);
    mmResource.set("uri", "");
    const resource = resourceSet.create({ uri: 'file:' + name + ".json" });
    const simplifiedResult: Result = { root: result.root, issues: result.issues };
    const ast = toEObject(simplifiedResult);
    resource.get("contents").add(ast);
    resource.save((data, e) => {
        if (e == null) {
            const parserBenchData: any = {
                ast: data,
                code: result.code,
                name,
                astBuildingTime: result.time
            };
            if (result.firstStage) {
                parserBenchData.parsingTime = result.firstStage.time;
            }
            callback(parserBenchData, e);
        } else {
            callback(undefined, e);
        }
    });
}

export class ParserTrace {
    constructor(private eo: EObject) {
    }

    get rootNode(): ParserNode {
        let root;
        const ast = this.eo.get("ast");
        if (ast.eClass == THE_RESULT_ECLASS_V2 || ast.eClass == THE_RESULT_ECLASS_V1) {
            root = ast.get("root");
        } else {
            root = ast;
        }
        return new ParserNode(root, this);
    }

    get issues(): Issue[] {
        const ast = this.eo.get("ast");
        if (ast.eClass == THE_RESULT_ECLASS_V2 || ast.eClass == THE_RESULT_ECLASS_V1) {
            return fromEObject(ast.get("issues")) as Issue[] || [];
        } else {
            return [];
        }
    }

    private getEObjectID(eObject: EObject): string {
        return eObject.fragment();
    }
}

export abstract class TraceNode {
    constructor(public eo: EObject) {
    }

    getType(): string {
        return this.eo.eClass.eContainer.get("name") + "." + this.getSimpleType();
    }

    getSimpleType(): string {
        return this.eo.eClass.get("name");
    }

    getRole(): string {
        return this.eo.eContainingFeature.get("name");
    }

    getPosition(): Position | null {
        const raw = this.eo.get("position");
        if (raw) {
            return fromEObject(raw) as Position;
        } else {
            return null;
        }
    }
}

class ParserNode extends TraceNode {

    constructor(eo: EObject, protected trace: ParserTrace) {
        super(eo);
    }

    getChildren(role?: string): ParserNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new ParserNode(c, this.trace));
    }

}

export interface Language {
    name: string;
    uri: string;
    metamodel: any;
}

function withLanguageMetamodel<T>(
    languages: { [p: string]: Language }, language: string, resourceSet: ResourceSet, resource: Resource,
    fn: () => T): T {
    if (language) {
        // The trace DOES NOT contain a reference to the language URI
        const theLanguage = languages[language];
        if (!theLanguage) {
            throw "Unknown language: " + language
        }
        const metaResource = resourceSet.get('resources').find(e => e.get('uri') === theLanguage.uri);
        try {
            resource.get("contents").addAll(metaResource.eContents());
            return fn();
        } finally {
            metaResource.get("contents").addAll(resource.eContents());
        }
    } else {
        // The trace DOES contain a reference to the language URI
        return fn();
    }
}

export class ParserTraceLoader {
    private readonly resourceSet: ResourceSet;
    private readonly languages: { [name: string]: Language } = {};

    constructor(...languages: Language[]) {
        this.resourceSet = ResourceSet.create();
        languages.map(this.registerLanguage.bind(this));
    }

    registerLanguage(lang: Language): EPackage[] {
        const languageResource = this.resourceSet.create({uri: lang.uri});
        const ePackages = loadEPackages(lang.metamodel, languageResource);
        this.languages[lang.name] = lang;
        return ePackages;
    }

    loadParserTrace(text: string, language?: string, uri = 'parser-trace.json'): ParserTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, language, this.resourceSet, resource,
            () => new ParserTrace(loadEObject(text, resource, PARSER_TRACE_ECLASS)));
    }
}

export class TranspilationTrace {
    private sourceToTarget = new Map<string, EObject>()

    constructor(private eo: EObject) {
        this.examineTargetNode(this.eo.get("targetAST"));
    }

    private examineTargetNode(tn: EObject) {
        if (tn.get("origin") != null) {
            const sourceID = this.getEObjectID(tn.get("origin"));
            this.sourceToTarget.set(sourceID, tn);
        }
        tn.eContents().forEach((c) => this.examineTargetNode(c));
    }

    getDestinationNode(sourceNode: SourceNode): TargetNode | null {
        const targetEO = this.sourceToTarget.get(this.getEObjectID(sourceNode.eo));
        if (targetEO == null) {
            return null
        }
        return new TargetNode(targetEO, this);
    }

    getRootSourceNode(): SourceNode {
        return new SourceNode(this.eo.get("sourceAST"), this)
    }

    getRootTargetNode(): TargetNode {
        return new TargetNode(this.eo.get("targetAST"), this)
    }

    private getEObjectID(eObject: EObject): string {
        return eObject.fragment();
    }
}

export class SourceNode extends TraceNode {
    constructor(eo: EObject, protected trace: TranspilationTrace) {
        super(eo);
    }

    getDestinationNode(): TargetNode | null {
        return this.trace.getDestinationNode(this);
    }

    getChildren(role?: string): SourceNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new SourceNode(c, this.trace));
    }

}

export class TargetNode extends TraceNode {

    constructor(eo: EObject, protected trace: TranspilationTrace) {
        super(eo);
    }

    getDestination(): Position | null {
        const raw = this.eo.get("destination");
        if (raw == null) {
            return null
        }
        return fromEObject(raw) as Position;
    }

    getSourceNode(): SourceNode | null {
        const rawOrigin = this.eo.get("origin");
        if (rawOrigin == null) {
            return null;
        }
        return new SourceNode(rawOrigin, this.trace);
    }

    getChildren(role?: string): TargetNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new TargetNode(c, this.trace));
    }
}

export class TranspilationTraceLoader {
    private readonly resourceSet: ResourceSet;
    private readonly languages: { [name: string]: Language } = {};

    constructor(...languages: Language[]) {
        this.resourceSet = ResourceSet.create();
        languages.map(this.registerLanguage.bind(this));
    }

    registerLanguage(lang: Language): EPackage[] {
        const languageResource = this.resourceSet.create({uri: lang.uri});
        const ePackages = loadEPackages(lang.metamodel, languageResource);
        this.languages[lang.name] = lang;
        return ePackages;
    }

    loadTranspilationTrace(text: string, sourceLang?: string, targetLang?: string,
                           uri = 'transpiler-trace.json'): TranspilationTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, targetLang,  this.resourceSet, resource,
            () => withLanguageMetamodel(
                this.languages, targetLang,  this.resourceSet, resource,
            () => new TranspilationTrace(loadEObject(text, resource, TRANSPILATION_TRACE_ECLASS))));
    }
}