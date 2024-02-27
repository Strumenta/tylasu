import {ParsingResult} from "../parsing";
import {EcoreMetamodelSupport, fromEObject, loadEObject, loadEPackages, Result, toEObject} from "./ecore";
import {Node, NodeDefinition} from "../model/model";
import ECore from "ecore/dist/ecore";
import {Position} from "../model/position";
import {PARSER_EPACKAGE, PARSER_TRACE_ECLASS} from "./parser-package";
import {
    THE_AST_EPACKAGE,
    THE_ENTITY_DECLARATION_INTERFACE,
    THE_EXPRESSION_INTERFACE, THE_NODE_ECLASS as THE_NODE_ECLASS_V2,
    THE_NODE_ORIGIN_ECLASS,
    THE_RESULT_ECLASS as THE_RESULT_ECLASS_V2,
    THE_STATEMENT_INTERFACE
} from "./starlasu-v2-metamodel";
import {THE_NODE_ECLASS as THE_NODE_ECLASS_V1, THE_RESULT_ECLASS as THE_RESULT_ECLASS_V1} from "./kolasu-v1-metamodel";
import {Issue} from "../validation";
import {
    THE_TRANSPILATION_TRACE_ECLASS, THE_WORKSPACE_FILE_ECLASS,
    THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
    TRANSPILATION_EPACKAGE
} from "./transpilation-package";
import {TRANSPILATION_EPACKAGE_V1} from "./transpilation-package-v1";
import {ensureEcoreContainsAllDataTypes} from "./ecore-patching";

export function saveForStrumentaPlayground<R extends Node>(
    result: ParsingResult<R>, name: string,
    metamodelSupport: EcoreMetamodelSupport, callback: (data: any, error: any) => void
): void {
    const resourceSet = ECore.ResourceSet.create();
    const mmResource = resourceSet.create({ uri: "ast" });
    metamodelSupport.generateMetamodel(mmResource, false);
    mmResource.set("uri", "");
    const resource = resourceSet.create({ uri: 'file:' + name + ".json" });
    const simplifiedResult: Result = { root: result.root, issues: result.issues };
    resource.get("contents").add(toEObject(simplifiedResult));
    resource.save((data, e) => {
        if (e == null) {
            const playgroundData: any = {
                ast: data,
                code: result.code,
                name,
                astBuildingTime: result.time
            };
            if (result.firstStage) {
                playgroundData.parsingTime = result.firstStage.time;
            }
            callback(playgroundData, e);
        } else {
            callback(undefined, e);
        }
    });
}

export class ParserTrace {
    constructor(private eo: ECore.EObject) {
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

    private getEObjectID(eObject: ECore.EObject): string {
        return eObject.fragment();
    }
}

export abstract class TraceNode extends Node {
    protected constructor(public eo: ECore.EObject) {
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

    getAttribute(attrName: string): any {
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            if (name == attrName) {
                return this.eo.get(name);
            }
        }
        throw new Error(`Unknown attribute ${attrName}`)
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

    isDeclaration(): boolean {
        return this.eo.isKindOf(THE_ENTITY_DECLARATION_INTERFACE);
    }

    isExpression(): boolean {
        return this.eo.isKindOf(THE_EXPRESSION_INTERFACE);
    }

    isStatement(): boolean {
        return this.eo.isKindOf(THE_STATEMENT_INTERFACE);
    }

    protected getChildrenEObjects(role: string | undefined) {
        return this.eo.eContents()
            .filter((c) => c.isKindOf(THE_NODE_ECLASS_V2) || c.isKindOf(THE_NODE_ECLASS_V1))
            .filter((c) => c.eContainingFeature.get("name") != "origin")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"));
    }
}

export class ParserNode extends TraceNode {

    constructor(eo: ECore.EObject, parent: ParserNode | undefined, protected trace: ParserTrace) {
        super(eo);
        this.parent = parent;
    }

    getChildren(role?: string): ParserNode[] {
        return this.getChildrenEObjects(role).map((c) => new ParserNode(c, this, this.trace));
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
    languages: { [p: string]: Language }, language: string | undefined,
    resourceSet: ECore.ResourceSet, resource: ECore.Resource, fn: () => T): T {
    if (language) {
        // The trace DOES NOT contain a reference to the language URI
        const theLanguage = languages[language];
        if (!theLanguage) {
            throw new Error(`Unknown language: ${language}`);
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
    private readonly resourceSet: ECore.ResourceSet;
    private readonly languages: { [name: string]: Language } = {};

    static {
        ensureEcoreContainsAllDataTypes();
        ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
        ECore.EPackage.Registry.register(PARSER_EPACKAGE);
    }

    constructor(...languages: Language[]) {
        this.resourceSet = ECore.ResourceSet.create();
        languages.map(this.registerLanguage.bind(this));
    }

    registerLanguage(lang: Language): ECore.EPackage[] {
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

abstract class AbstractTranspilationTrace {
    protected sourceToTarget = new Map<string, TargetNode[]>();
    public issues: Issue[] = [];

    protected constructor(protected eo: ECore.EObject) {}

    getDestinationNodes(sourceNode: SourceNode): TargetNode[] {
        return this.sourceToTarget.get(this.getEObjectID(sourceNode.eo)) || [];
    }

    protected getEObjectID(eObject: ECore.EObject): string {
        return eObject.fragment();
    }

    protected examineTargetNode(
        tn: ECore.EObject, parent?: TargetNode,
        customize: (targetNode: TargetNode) => TargetNode = x => x
    ) {
        let origin = tn.get("origin");
        if (origin?.eClass == THE_NODE_ORIGIN_ECLASS) {
            origin = origin.get("node");
        }
        const targetNode = customize(new TargetNode(tn, this).withParent(parent));
        if (origin) {
            const sourceID = this.getEObjectID(origin);
            let list = this.sourceToTarget.get(sourceID);
            if (list === undefined) {
                list = [];
                this.sourceToTarget.set(sourceID, list);
            }
            list.push(targetNode);
        }
        tn.eContents().forEach((c) => this.examineTargetNode(c, targetNode, customize));
        return targetNode;
    }
}

export class TranspilationTrace extends AbstractTranspilationTrace {
    readonly rootTargetNode: TargetNode;

    constructor(eo: ECore.EObject) {
        super(eo)
        if (!eo.eClass == THE_TRANSPILATION_TRACE_ECLASS) {
            throw new Error("Not a transpilation trace: " + eo.eClass);
        }
        this.issues = fromEObject(eo.get("issues")) as Issue[] || [];
        this.rootTargetNode = this.examineTargetNode(this.eo.get("targetResult").get("root"));
    }

    get rootSourceNode(): SourceNode {
        return new SourceNode(this.eo.get("sourceResult").get("root"), this);
    }

    get name(): string | undefined {
        return this.eo.get("name");
    }
}

export class WorkspaceTranspilationTrace extends AbstractTranspilationTrace {
    originalFiles: SourceWorkspaceFile[];
    generatedFiles: TargetWorkspaceFile[];
    targetFileMap = new Map<string, TargetWorkspaceFile>();

    constructor(eo: ECore.EObject) {
        super(eo)
        if (!eo.eClass == THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS) {
            throw new Error("Not a workspace transpilation trace: " + eo.eClass);
        }
        const originalFiles = this.eo.get("originalFiles") as ECore.EList;
        this.originalFiles = originalFiles.map((eo) => new SourceWorkspaceFile(eo, this));
        const generatedFiles = this.eo.get("generatedFiles") as ECore.EList;
        this.generatedFiles = generatedFiles.map((eo) => {
            const targetWorkspaceFile = new TargetWorkspaceFile(eo, this);
            targetWorkspaceFile.node = this.examineTargetNode(eo.get("result").get("root"), undefined, n => {
                n.file = targetWorkspaceFile;
                return n;
            });
            return targetWorkspaceFile;
        });
        this.issues = fromEObject(eo.get("issues")) as Issue[] || [];
    }

    get name(): string | undefined {
        return this.eo.get("name");
    }

    get transpilationIssues(): Issue[] {
        return fromEObject(this.eo.get("transpilationIssues")) as Issue[] || []
    }

}

abstract class AbstractWorkspaceFile<N> {
    protected constructor(protected eo: ECore.EObject, protected trace: AbstractTranspilationTrace) {

    }

    get path(): string {
        return this.eo.get("path") as string
    }

    get code(): string {
        return this.eo.get("code") as string
    }

    get issues(): Issue[] {
        return fromEObject(this.eo.get("issues")) as Issue[] || []
    }

    abstract get node() : N
}

export class SourceWorkspaceFile extends AbstractWorkspaceFile<SourceNode> {
    constructor(eo: ECore.EObject, trace: AbstractTranspilationTrace) {
        super(eo, trace);
    }

    get node(): SourceNode {
        return new SourceNode(this.eo.get("result").get("root"), this.trace, this);
    }
}

export class TargetWorkspaceFile extends AbstractWorkspaceFile<TargetNode> {
    node: TargetNode;

    constructor(eo: ECore.EObject, trace: AbstractTranspilationTrace) {
        super(eo, trace);
    }
}

export class SourceNode extends TraceNode {
    parent?: SourceNode;
    protected _destinations?: TargetNode[];

    constructor(eo: ECore.EObject, protected trace: AbstractTranspilationTrace, public readonly file?: SourceWorkspaceFile) {
        super(eo);
        if (eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V2) || eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V1)) {
            this.parent = new SourceNode(this.eo.eContainer, this.trace, file);
        }
    }

    getDestinationNodes(): TargetNode[] {
        if (this._destinations === undefined) {
            this._destinations = this.trace.getDestinationNodes(this);
        }
        return this._destinations;
    }

    getChildren(role?: string): SourceNode[] {
        return this.getChildrenEObjects(role).map((c) => new SourceNode(c, this.trace, this.file));
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

    constructor(eo: ECore.EObject, protected trace: AbstractTranspilationTrace, public file?: TargetWorkspaceFile) {
        super(eo);
        if (eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V2) || eo?.eContainer?.isKindOf(THE_NODE_ECLASS_V1)) {
            this.parent = new TargetNode(this.eo.eContainer, this.trace, this.file);
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
        if (!this.origin) {
            let rawOrigin = this.eo.get("origin");
            if (rawOrigin?.eClass == THE_NODE_ORIGIN_ECLASS) {
                rawOrigin = rawOrigin.get("node");
            }
            if (!rawOrigin) {
                return undefined;
            }
            let file: SourceWorkspaceFile | undefined = undefined;
            let parent = rawOrigin.eContainer;
            while (parent) {
                if (parent.isKindOf(THE_WORKSPACE_FILE_ECLASS)) {
                    file = new SourceWorkspaceFile(parent, this.trace);
                    break;
                } else {
                    parent = parent.eContainer;
                }
            }
            this.origin = new SourceNode(rawOrigin, this.trace, file);
        }
        return this.origin as SourceNode;
    }

    getChildren(role?: string): TargetNode[] {
        return this.getChildrenEObjects(role).map((c) => new TargetNode(c, this.trace, this.file));
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
    private readonly resourceSet: ECore.ResourceSet;
    private readonly languages: { [name: string]: Language } = {};

    static {
        ECore.EPackage.Registry.register(THE_AST_EPACKAGE);
        ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE);
        ECore.EPackage.Registry.register(TRANSPILATION_EPACKAGE_V1);
    }

    constructor(...languages: Language[]) {
        this.resourceSet = ECore.ResourceSet.create();
        languages.map(this.registerLanguage.bind(this));
    }

    registerLanguage(lang: Language): ECore.EPackage[] {
        const languageResource = this.resourceSet.create({uri: lang.uri});
        const ePackages = loadEPackages(lang.metamodel, languageResource);
        this.languages[lang.name] = lang;
        return ePackages;
    }

    loadTranspilationTrace(trace: string | any, sourceLang?: string, targetLang?: string,
                           uri = 'transpiler-trace.json'): TranspilationTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, sourceLang,  this.resourceSet, resource,
            () => withLanguageMetamodel(
                this.languages, targetLang,  this.resourceSet, resource,
            () => new TranspilationTrace(loadEObject(trace, resource, THE_TRANSPILATION_TRACE_ECLASS))));
    }

    loadWorkspaceTranspilationTrace(trace: string | any, sourceLang?: string, targetLang?: string,
                                    uri = 'transpiler-trace.json'): WorkspaceTranspilationTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, sourceLang,  this.resourceSet, resource,
            () => withLanguageMetamodel(
                this.languages, targetLang,  this.resourceSet, resource,
                () => new WorkspaceTranspilationTrace(loadEObject(trace, resource, THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS))));
    }
}
