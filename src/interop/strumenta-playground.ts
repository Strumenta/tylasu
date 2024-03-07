import {ParsingResult} from "../parsing";
import {EcoreMetamodelSupport, ECoreNode, fromEObject, loadEObject, loadEPackages, Result, toEObject} from "./ecore";
import {Node} from "../model/model";
import ECore from "ecore/dist/ecore";
import {Position} from "../model/position";
import {PARSER_EPACKAGE, PARSER_TRACE_ECLASS} from "./parser-package";
import {THE_AST_EPACKAGE, THE_NODE_ORIGIN_ECLASS,} from "./starlasu-v2-metamodel";
import {Issue} from "../validation";
import {
    THE_TRANSPILATION_TRACE_ECLASS,
    THE_WORKSPACE_FILE_ECLASS,
    THE_WORKSPACE_TRANSPILATION_TRACE_ECLASS,
    TRANSPILATION_EPACKAGE
} from "./transpilation-package";
import {TRANSPILATION_EPACKAGE_V1} from "./transpilation-package-v1";
import {ensureEcoreContainsAllDataTypes} from "./ecore-patching";
import {NodeAdapter, ParserNode, TraceNode} from "../trace/trace-node";

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
    constructor(private node: NodeAdapter) {
        if (node.nodeDefinition?.package != "StrumentaLanguageSupportParsing" || node.nodeDefinition?.name != "ParserTrace") {
            throw new Error("Not a parser trace: " + node.nodeDefinition?.package + "." + node.nodeDefinition?.name);
        }
    }

    get rootNode(): ParserNode {
        let root;
        const ast = this.node.get("ast");
        if (ast?.nodeDefinition?.name == "Result") {
            root = ast.get("root");
        } else {
            root = ast;
        }
        return new ParserNode(root);
    }

    get issues(): Issue[] {
        return this.node.get("ast")?.getIssues() || [];
    }

    get name(): string | undefined {
        return this.node.getAttribute("name");
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
            () => new ParserTrace(new ECoreNode(loadEObject(trace, resource, PARSER_TRACE_ECLASS))));
    }
}

abstract class AbstractTranspilationTrace {
    protected sourceToTarget = new Map<string, TargetNode[]>();
    public issues: Issue[] = [];

    protected constructor(protected wrappedNode: NodeAdapter) {}

    getDestinationNodes(sourceNode: SourceNode): TargetNode[] {
        return this.sourceToTarget.get(sourceNode.nodeAdapter.getId()) || [];
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
    protected constructor(protected wrappedNode: NodeAdapter, protected trace: AbstractTranspilationTrace) {}

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
    constructor(wrapped: NodeAdapter, trace: AbstractTranspilationTrace) {
        super(wrapped, trace);
    }

    get node(): SourceNode {
        return new SourceNode(this.wrappedNode.get("result", "root")!, this.trace, this);
    }
}

export class TargetWorkspaceFile extends AbstractWorkspaceFile<TargetNode> {
    node: TargetNode;

    constructor(wrapped: NodeAdapter, trace: AbstractTranspilationTrace) {
        super(wrapped, trace);
    }
}

export class SourceNode extends TraceNode {
    parent?: SourceNode;
    protected _destinations?: TargetNode[];

    constructor(wrappedNode: NodeAdapter, protected trace: AbstractTranspilationTrace,
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
        return this.nodeAdapter.getChildren(role).map((c) => new SourceNode(c, this.trace, this.file).withParent(this));
    }

    get children(): Node[] {
        return this.getChildren();
    }
}

export class TargetNode extends TraceNode {
    parent?: TargetNode;

    constructor(wrapped: NodeAdapter, protected trace: AbstractTranspilationTrace, public file?: TargetWorkspaceFile) {
        super(wrapped);
        if (wrapped.parent) {
            this.parent = new TargetNode(wrapped.parent, this.trace, this.file);
        }
    }

    getPosition(): Position | undefined {
        return this.nodeAdapter.getPosition("destination");
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
            if (this.nodeAdapter instanceof ECoreNode) {
                let rawOrigin = this.nodeAdapter.eo.get("origin");
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
        return this.nodeAdapter.getChildren(role).map((c) => new TargetNode(c, this.trace, this.file));
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
