import {ParsingResult} from "../parsing";
import {EcoreMetamodelSupport, fromEObject, loadEObject, loadEPackages, Result, toEObject} from "./ecore";
import {Node, PropertyDefinition} from "../model/model";
import ECore from "ecore/dist/ecore";
import {Position} from "../model/position";
import {PARSER_EPACKAGE, PARSER_TRACE_ECLASS} from "./parser-package";
import {
    THE_AST_EPACKAGE,
    THE_ENTITY_DECLARATION_INTERFACE,
    THE_EXPRESSION_INTERFACE,
    THE_NODE_ECLASS as THE_NODE_ECLASS_V2,
    THE_NODE_ORIGIN_ECLASS,
    THE_RESULT_ECLASS as THE_RESULT_ECLASS_V2,
    THE_STATEMENT_INTERFACE
} from "./starlasu-v2-metamodel";
import {THE_NODE_ECLASS as THE_NODE_ECLASS_V1, THE_RESULT_ECLASS as THE_RESULT_ECLASS_V1} from "./kolasu-v1-metamodel";
import {Issue} from "../validation";
import {
    THE_TRANSPILATION_TRACE_ECLASS,
    THE_WORKSPACE_FILE_ECLASS,
    THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
    TRANSPILATION_EPACKAGE
} from "./transpilation-package";
import {TRANSPILATION_EPACKAGE_V1} from "./transpilation-package-v1";
import {ensureEcoreContainsAllDataTypes} from "./ecore-patching";
import {ExternalNode, TraceNode} from "../trace/trace-node";

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
        return new ParserNode(new ECoreNode(root), undefined, this);
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
}

export class ECoreNode extends ExternalNode {
    constructor(public eo: ECore.EObject) {
        super();
    }

    get definition() {
        return {
            package: this.eo.eClass.eContainer.get("name") as string,
            name: this.eo.eClass.get("name") as string,
            properties: this.getProperties()
        };
    }

    get parent() {
        const container = this.eo.eContainer;
        if (container?.isKindOf(THE_NODE_ECLASS_V2) || container?.isKindOf(THE_NODE_ECLASS_V1)) {
            return new ECoreNode(container);
        }
    }

    get(...path: string[]): ExternalNode | undefined {
        let eo: ECore.EObject = this.eo;
        for (const component of path) {
            eo = eo?.get(component);
        }
        if (eo) {
            return new ECoreNode(eo);
        } else {
            return undefined;
        }
    }

    getAttribute(name: string): any {
        return this.eo.get(name);
    }

    getAttributes(): { [p: string]: any } {
        const result: any = {};
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            result[name] = this.eo.get(name);
        }
        return result;
    }

    getChildren(role?: string): ExternalNode[] {
        return this.getChildrenEObjects(role).map(c => new ECoreNode(c));
    }

    getId(): string {
        return this.eo.fragment();
    }

    getIssues(property = "issues"): Issue[] | undefined {
        const raw = this.eo.get(property);
        if (raw) {
            return fromEObject(raw) as Issue[];
        } else {
            return undefined;
        }
    }

    getPosition(property = "position"): Position | undefined {
        const raw = this.eo.get(property);
        if (raw) {
            return fromEObject(raw) as Position;
        } else {
            return undefined;
        }
    }

    getRole(): string | undefined {
        return this.eo.eContainingFeature?.get("name");
    }

    getProperties(): { [name: string | symbol]: PropertyDefinition } {
        const result: { [name: string | symbol]: PropertyDefinition } = {};
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            result[name] = { name: name, child: false };
        }
        this.eo.eContents()
            .filter((c) => c.eContainingFeature.get("name") != "position")
            .forEach((c) => {
                const name = c.eContainingFeature.get("name");
                result[name] = { name, child: true, multiple: c.eContainingFeature.get("many") };
            });
        return result;
    }

    protected getChildrenEObjects(role: string | undefined) {
        return this.eo.eContents()
            .filter((c) => c.isKindOf(THE_NODE_ECLASS_V2) || c.isKindOf(THE_NODE_ECLASS_V1))
            .filter((c) => c.eContainingFeature.get("name") != "origin")
            .filter((c) => c.eContainingFeature.get("name") != "destination")
            .filter((c) => role == null || role == c.eContainingFeature.get("name"));
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

    equals(other: ExternalNode): boolean {
        return super.equals(other) || (other instanceof ECoreNode && other.eo == this.eo);
    }
}

export class ParserNode extends TraceNode {

    parent?: ParserNode;

    constructor(eo: ECore.EObject, parent: ParserNode | undefined, protected trace: ParserTrace) {
        super(eo);
        this.parent = parent;
    }

    getChildren(role?: string): ParserNode[] {
        return this.wrappedNode.getChildren(role).map((c) => new ParserNode(c, this, this.trace));
    }

    get children(): Node[] {
        return this.getChildren();
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

    loadParserTrace(trace: string | any, language?: string, uri = 'parser-trace.json'): ParserTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, language, this.resourceSet, resource,
            () => new ParserTrace(loadEObject(trace, resource, PARSER_TRACE_ECLASS)));
    }
}

abstract class AbstractTranspilationTrace {
    protected sourceToTarget = new Map<string, TargetNode[]>();
    public issues: Issue[] = [];

    protected constructor(protected wrappedNode: ExternalNode) {}

    getDestinationNodes(sourceNode: SourceNode): TargetNode[] {
        return this.sourceToTarget.get(sourceNode.wrappedNode.getId()) || [];
    }

    protected examineTargetNode(
        tn: ECore.EObject, parent?: TargetNode,
        customize: (targetNode: TargetNode) => TargetNode = x => x
    ) {
        let origin = tn.get("origin");
        if (origin?.eClass == THE_NODE_ORIGIN_ECLASS) {
            origin = origin.get("node");
        }
        const targetNode = customize(new TargetNode(new ECoreNode(tn), this).withParent(parent));
        if (origin) {
            const sourceID = origin.fragment();
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
    readonly rootSourceNode: SourceNode;
    readonly rootTargetNode: TargetNode;

    constructor(wrappedNode: ECoreNode) {
        super(wrappedNode);
        if (!wrappedNode.eo.eClass == THE_TRANSPILATION_TRACE_ECLASS) {
            throw new Error("Not a transpilation trace: " + wrappedNode.eo.eClass);
        }
        this.issues = wrappedNode.getIssues() || [];
        this.rootSourceNode = new SourceNode(wrappedNode.get("sourceResult", "root")!, this);
        this.rootTargetNode = this.examineTargetNode(wrappedNode.eo.get("targetResult").get("root"));
    }

    get name(): string | undefined {
        return this.wrappedNode.getAttribute("name");
    }
}

export class WorkspaceTranspilationTrace extends AbstractTranspilationTrace {
    readonly originalFiles: SourceWorkspaceFile[];
    readonly generatedFiles: TargetWorkspaceFile[];
    readonly transpilationIssues: Issue[];
    readonly targetFileMap = new Map<string, TargetWorkspaceFile>();

    constructor(wrapped: ECoreNode) {
        super(wrapped);
        const originalFiles = wrapped.eo.get("originalFiles") as ECore.EList;
        this.originalFiles = originalFiles.map((eo) => new SourceWorkspaceFile(new ECoreNode(eo), this));
        const generatedFiles = wrapped.eo.get("generatedFiles") as ECore.EList;
        this.generatedFiles = generatedFiles.map((eo) => {
            const targetWorkspaceFile = new TargetWorkspaceFile(new ECoreNode(eo), this);
            targetWorkspaceFile.node = this.examineTargetNode(eo.get("result").get("root"), undefined, n => {
                n.file = targetWorkspaceFile;
                return n;
            });
            return targetWorkspaceFile;
        });
        this.issues = fromEObject(wrapped.eo.get("issues")) as Issue[] || [];
        this.transpilationIssues = fromEObject(wrapped.eo.get("transpilationIssues")) as Issue[] || [];
    }

    get name(): string | undefined {
        return this.wrappedNode.getAttribute("name");
    }
}

abstract class AbstractWorkspaceFile<N> {
    protected constructor(protected wrappedNode: ExternalNode, protected trace: AbstractTranspilationTrace) {}

    get path(): string {
        return this.wrappedNode.getAttribute("path");
    }

    get code(): string {
        return this.wrappedNode.getAttribute("code");
    }

    get issues(): Issue[] {
        return fromEObject(this.wrappedNode.getIssues()) as Issue[] || []
    }

    abstract get node() : N
}

export class SourceWorkspaceFile extends AbstractWorkspaceFile<SourceNode> {
    constructor(wrapped: ExternalNode, trace: AbstractTranspilationTrace) {
        super(wrapped, trace);
    }

    get node(): SourceNode {
        return new SourceNode(this.wrappedNode.get("result", "root")!, this.trace, this);
    }
}

export class TargetWorkspaceFile extends AbstractWorkspaceFile<TargetNode> {
    node: TargetNode;

    constructor(wrapped: ExternalNode, trace: AbstractTranspilationTrace) {
        super(wrapped, trace);
    }
}

export class SourceNode extends TraceNode {
    parent?: SourceNode;
    protected _destinations?: TargetNode[];

    constructor(wrappedNode: ExternalNode, protected trace: AbstractTranspilationTrace,
                public readonly file?: SourceWorkspaceFile) {
        super(wrappedNode);
        if (wrappedNode.parent) {
            this.parent = new SourceNode(wrappedNode.parent, this.trace, file);
        }
    }

    getDestinationNodes(): TargetNode[] {
        if (this._destinations === undefined) {
            this._destinations = this.trace.getDestinationNodes(this);
        }
        return this._destinations;
    }

    getChildren(role?: string): SourceNode[] {
        return this.wrappedNode.getChildren(role).map((c) => new SourceNode(c, this.trace, this.file));
    }

    get children(): Node[] {
        return this.getChildren();
    }
}

export class TargetNode extends TraceNode {
    parent?: TargetNode;

    constructor(wrapped: ExternalNode, protected trace: AbstractTranspilationTrace, public file?: TargetWorkspaceFile) {
        super(wrapped);
        if (wrapped.parent) {
            this.parent = new TargetNode(wrapped.parent, this.trace, this.file);
        }
    }

    getPosition(): Position | undefined {
        return this.wrappedNode.getPosition("destination");
    }

    getDestination(): Position | undefined {
        return this.getPosition();
    }

    getSourcePosition(): Position | undefined {
        return super.getPosition();
    }

    getSourceNode(): SourceNode | undefined {
        if (!this.origin) {
            // TODO
            if (this.wrappedNode instanceof ECoreNode) {
                let rawOrigin = this.wrappedNode.eo.get("origin");
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
                        file = new SourceWorkspaceFile(new ECoreNode(parent), this.trace);
                        break;
                    } else {
                        parent = parent.eContainer;
                    }
                }
                this.origin = new SourceNode(new ECoreNode(rawOrigin), this.trace, file);
            }
        }
        return this.origin as SourceNode;
    }

    getChildren(role?: string): TargetNode[] {
        return this.wrappedNode.getChildren(role).map((c) => new TargetNode(c, this.trace, this.file));
    }

    get children(): Node[] {
        return this.getChildren();
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
            () => {
                const eo = loadEObject(trace, resource, THE_TRANSPILATION_TRACE_ECLASS);
                return withLanguageMetamodel(
                    this.languages, targetLang, this.resourceSet, resource,
                    () => new TranspilationTrace(new ECoreNode(eo)));
            });
    }

    loadWorkspaceTranspilationTrace(trace: string | any, sourceLang?: string, targetLang?: string,
                                    uri = 'transpiler-trace.json'): WorkspaceTranspilationTrace {
        const resource = this.resourceSet.create({uri: uri});
        return withLanguageMetamodel(
            this.languages, sourceLang,  this.resourceSet, resource,
            () => {
                const eo = loadEObject(trace, resource, THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS);
                return withLanguageMetamodel(
                    this.languages, targetLang, this.resourceSet, resource,
                    () => new WorkspaceTranspilationTrace(new ECoreNode(eo)));
            });
    }
}
