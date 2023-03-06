import {ParsingResult} from "../parsing/parsing";
import {
    EcoreMetamodelSupport,
    fromEObject,
    loadEObject,
    loadEPackages,
    Result,
    toEObject
} from "./ecore";
import {Node, NodeDefinition} from "../model/model";
import * as Ecore from "ecore/dist/ecore";
import {EObject, EPackage, Resource, ResourceSet} from "ecore";
import {Position} from "../model/position";
import {PARSER_TRACE_ECLASS} from "./parser-package";
import {
    THE_RESULT_ECLASS as THE_RESULT_ECLASS_V2,
    THE_NODE_ECLASS as THE_NODE_ECLASS_V2,
    THE_NODE_ORIGIN_ECLASS
} from "./starlasu-v2-metamodel";
import {THE_RESULT_ECLASS as THE_RESULT_ECLASS_V1, THE_NODE_ECLASS as THE_NODE_ECLASS_V1} from "./kolasu-v1-metamodel";
import {Issue} from "../validation";
import {THE_TRANSPILATION_TRACE_ECLASS} from "./transpilation-package";

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
        if (!eo.eClass == PARSER_TRACE_ECLASS) {
            throw new Error("Not a parser trace: " + eo.eClass);
        }
    }

    get rootNode(): ParserNode {
        let root;
        const ast = this.eo.get("ast");
        if (ast.eClass == THE_RESULT_ECLASS_V2 || ast.eClass == THE_RESULT_ECLASS_V1) {
            root = ast.get("root");
        } else {
            root = ast;
        }
        return new ParserNode(root, undefined, this);
    }

    get issues(): Issue[] {
        const ast = this.eo.get("ast");
        if (ast.eClass == THE_RESULT_ECLASS_V2 || ast.eClass == THE_RESULT_ECLASS_V1) {
            return fromEObject(ast.get("issues")) as Issue[] || [];
        } else {
            return [];
        }
    }

    get name(): string | undefined {
        return this.eo.get("name");
    }

    private getEObjectID(eObject: EObject): string {
        return eObject.fragment();
    }
}

export abstract class TraceNode extends Node {
    protected constructor(public eo: EObject) {
        super();
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

    getPosition(): Position | undefined {
        const raw = this.eo.get("position");
        if (raw) {
            return fromEObject(raw) as Position;
        } else {
            return undefined;
        }
    }

    get position(): Position | undefined {
        return this.getPosition();
    }

    protected get nodeDefinition(): NodeDefinition {
        return {
            package: this.eo.eClass.eContainer.get("name") as string,
            name: this.eo.eClass.get("name") as string,
            properties: this.getProperties()
        };
    }

    getProperties(): any {
        const result: any = {};
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            result[name] = { child: false };
        }
        return result;
    }

    getAttributes(): { [name: string]: any } {
        const result: any = {};
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            result[name] = this.eo.get(name);
        }
        return result;
    }

    getPathFromRoot(): (string | number)[] {
        if (this.parent) {
            const ft = this.eo.eContainingFeature;
            const path = (this.parent as TraceNode).getPathFromRoot();
            path.push(ft.get("name"));
            if (ft.get("many")) {
                const children = this.eo.eContainer.get(ft.get("name"));
                path.push(children.indexOf(this.eo));
            }
            return path;
        } else {
            return [];
        }
    }
}

export class ParserNode extends TraceNode {

    constructor(eo: EObject, parent: ParserNode | undefined, protected trace: ParserTrace) {
        super(eo);
        this.parent = parent;
    }

    getChildren(role?: string): ParserNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new ParserNode(c, this, this.trace));
    }

    get children(): Node[] {
        return this.getChildren();
    }

    getProperties(): any {
        const def = super.getProperties();
        this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .forEach((c) => {
                def[c.eContainingFeature.get("name")] = { child: true };
            });
        return def;
    }
}

export interface Language {
    name: string;
    uri: string;
    metamodel: any;
}

function withLanguageMetamodel<T>(
    languages: { [p: string]: Language }, language: string | undefined, resourceSet: ResourceSet, resource: Resource,
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
    private sourceToTarget = new Map<string, EObject>();
    public issues: Issue[] = [];

    constructor(private eo: EObject) {
        if (!eo.eClass == THE_TRANSPILATION_TRACE_ECLASS) {
            throw new Error("Not a transpilation trace: " + eo.eClass);
        }
        this.issues = fromEObject(eo.get("issues")) as Issue[] || [];
        this.examineTargetNode(this.rootTargetNode.eo);
    }

    private examineTargetNode(tn: EObject) {
        let origin = tn.get("origin");
        if (origin?.eClass == THE_NODE_ORIGIN_ECLASS) {
            origin = origin.get("node");
        }
        if (origin) {
            const sourceID = this.getEObjectID(origin);
            this.sourceToTarget.set(sourceID, tn);
        }
        tn.eContents().forEach((c) => this.examineTargetNode(c));
    }

    getDestinationNode(sourceNode: SourceNode): TargetNode | undefined {
        const targetEO = this.sourceToTarget.get(this.getEObjectID(sourceNode.eo));
        if (!targetEO) {
            return undefined;
        }
        return new TargetNode(targetEO, this);
    }

    get rootSourceNode(): SourceNode {
        return new SourceNode(this.eo.get("sourceResult").get("root"), this)
    }

    get rootTargetNode(): TargetNode {
        return new TargetNode(this.eo.get("targetResult").get("root"), this)
    }

    get name(): string | undefined {
        return this.eo.get("name");
    }

    private getEObjectID(eObject: EObject): string {
        return eObject.fragment();
    }
}

export class SourceNode extends TraceNode {
    parent?: SourceNode;

    constructor(eo: EObject, protected trace: TranspilationTrace) {
        super(eo);
        if (this.eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V2) || this.eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V1)) {
            this.parent = new SourceNode(this.eo.eContainer, this.trace);
        }
    }

    getDestinationNode(): TargetNode | undefined {
        return this.trace.getDestinationNode(this);
    }

    getChildren(role?: string): SourceNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new SourceNode(c, this.trace));
    }

    get children(): Node[] {
        return this.getChildren();
    }

    getProperties(): any {
        const def = super.getProperties();
        this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .forEach((c) => {
                def[c.eContainingFeature.get("name")] = { child: true };
            });
        return def;
    }

}

export class TargetNode extends TraceNode {
    parent?: TargetNode;

    constructor(eo: EObject, protected trace: TranspilationTrace) {
        super(eo);
        if (this.eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V2) || this.eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V1)) {
            this.parent = new TargetNode(this.eo.eContainer, this.trace);
        }
    }

    getPosition(): Position | undefined {
        const raw = this.eo.get("destination");
        if (raw == null) {
            return undefined;
        }
        return fromEObject(raw) as Position;
    }

    getDestination(): Position | undefined {
        return this.getPosition();
    }

    getSourcePosition(): Position | undefined {
        return super.getPosition();
    }

    getSourceNode(): SourceNode | undefined {
        let rawOrigin = this.eo.get("origin");
        if (rawOrigin?.eClass == THE_NODE_ORIGIN_ECLASS) {
            rawOrigin = rawOrigin.get("node");
        }
        if (!rawOrigin) {
            return undefined;
        }
        return new SourceNode(rawOrigin, this.trace);
    }

    getChildren(role?: string): TargetNode[] {
        return this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => c.eContainingFeature.get("name") != "origin")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"))
            .map((c) => new TargetNode(c, this.trace));
    }

    get children(): Node[] {
        return this.getChildren();
    }

    getProperties(): any {
        const def = super.getProperties();
        this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .forEach((c) => {
                def[c.eContainingFeature.get("name")] = { child: true };
            });
        return def;
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
            this.languages, sourceLang,  this.resourceSet, resource,
            () => withLanguageMetamodel(
                this.languages, targetLang,  this.resourceSet, resource,
            () => new TranspilationTrace(loadEObject(text, resource, THE_TRANSPILATION_TRACE_ECLASS))));
    }
}
