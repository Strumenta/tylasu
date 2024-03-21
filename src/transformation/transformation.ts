import {
    ASTNode,
    getNodeDefinition,
    Node,
    NodeDefinition,
    Origin,
} from "../model/model";
import {Issue, IssueSeverity} from "../validation";
import {Position} from "../model/position";
import {GenericErrorNode} from "../model/errors";

export class PropertyRef<Obj, Value> {
    constructor(
        public readonly name: string,
        public readonly get: (o: Obj) => Value | undefined,
        public readonly set: (o: Obj, v: Value) => void) {}

    static get<Obj, Value>(name: string | symbol | number, nodeDefinition?: NodeDefinition): PropertyRef<Obj, Value> {
        if (typeof name == "symbol") {
            name = name.toString();
        } else if (typeof name == "number") {
            name = name + "";
        }

        if (nodeDefinition) {
            const property = Object.keys(nodeDefinition.features).find(p => p == name);
            if (!property) {
                throw new Error(`${name} is not a feature of ${nodeDefinition}`)
            }
        }

        function getter(obj: Obj): Value {
            const value = obj[name];
            if (typeof value === "function") { // ANTLR defines accessor functions in some cases
                return value.call(obj);
            } else {
                return value;
            }
        }

        return new PropertyRef<Obj, Value>(
            name,
            getter,
            (obj, value) => obj[name] = value
        );
    }
}

export type ChildDef<Source, Target, Child> = {
    source: keyof Source | PropertyRef<Source, any> | ((s: Source) => any | undefined),
    target?: keyof Target | PropertyRef<Target, Child> | ((t: Target, c?: Child) => void),
    name?: string,
    scopedToType?: new (...args: any[]) => Target
};

export class NodeFactory<Source, Output extends Node> {
    constructor(
        public constructorFunction: (s: Source, t: ASTTransformer, f: NodeFactory<Source, Output>) => Output[],
        public children: Map<string, ChildNodeFactory<Source, any, any> | undefined> = new Map(),
        public finalizer: (node: Output) => void = () => undefined,
        public skipChildren: boolean = false,
        public childrenSetAtConstruction: boolean = false
    ) {}

    static single<Source, Output extends Node>(
        singleConstructor: (s: Source, t: ASTTransformer, f: NodeFactory<Source, Output>) => Output | undefined,
        children: Map<string, ChildNodeFactory<Source, any, any> | undefined> = new Map(),
        finalizer: (node: Output) => void = () => undefined,
        skipChildren: boolean = false,
        childrenSetAtConstruction: boolean = false
    ): NodeFactory<Source, Output> {
        return new NodeFactory(
            (source, at, nf) => {
                const result = singleConstructor(source, at, nf);
                if (result) {
                    return [result];
                } else {
                    return [];
                }
            },
            children, finalizer, skipChildren, childrenSetAtConstruction);
    }

    /**
     * Specify how to convert a child. The value obtained from the conversion could either be used
     * as a constructor parameter when instantiating the parent, or be used to set the value after
     * the parent has been instantiated.
     */
    withChild<Target, Child>(child: ChildDef<Source, Target, Child>) : NodeFactory<Source, Output> {
        const nodeDefinition =
            child.scopedToType ? getNodeDefinition(child.scopedToType as any) : undefined;
        let prefix = nodeDefinition?.name ? nodeDefinition.name : (child.scopedToType?.name || "");
        if (prefix) {
            prefix += "#";
        }
        let source = child.source;
        if (typeof source == "string" || typeof source ==  "symbol" || typeof source ==  "number") {
            source = PropertyRef.get(source as any);
        }
        if (source instanceof PropertyRef) {
            source = source.get;
        }
        let target = child.target;
        let name = child.name;
        if (!target) {
            // given we have no setter we MUST set the children at construction
            this.childrenSetAtConstruction = true;
        }
        if (typeof target == "string" || typeof target ==  "symbol" || typeof target ==  "number") {
            target = PropertyRef.get(target, nodeDefinition);
        }
        if (target instanceof PropertyRef) {
            if (name && name != target.name) {
                throw new Error(`Name mismatch: ${name} != ${target.name}`)
            }
            name = target.name;
            target = target.set;
        }
        if (!name) {
            throw new Error("Child name is required");
        }
        this.children.set(prefix + name, new ChildNodeFactory(prefix + name, source, target));
        return this;
    }

    /**
     * Tells the transformer whether this factory already takes care of the node's children and no further computation
     * is desired on that subtree. E.g., when we're mapping an ANTLR parse tree, and we have a context that is only a
     * wrapper over several alternatives, and for some reason those are not labeled alternatives in ANTLR (subclasses),
     * we may configure the transformer as follows:
     *
     * ```typescript
     * transformer.registerNodeFactory(XYZContext) { ctx => transformer.transform(ctx.children[0]) }
     * ```
     *
     * However, if the result of `transformer.transform(ctx.children[0])` is an instance of a Node with a child
     * for which `withChild` was configured, the transformer will think that it has to populate that child,
     * according to the configuration determined by reflection. When it tries to do so, the "source" of the node will
     * be an instance of `XYZContext` that may not have a child with a corresponding name, and the transformation will
     * fail – or worse, it will map an unrelated node.
     *
     * Note: this method is called `skipChildren` in StarLasu, but `skipChildren` is already the name of a property,
     * and the TypeScript and JavaScript languages don't allow to have a property with the same name as a method.
     */
    setSkipChildren(skip: boolean = true): NodeFactory<Source, Output> {
        this.skipChildren = skip;
        return this;
    }

    withFinalizer(finalizer: (o: Output) => void) : void {
        this.finalizer = finalizer;
    }

    getChildNodeFactory(prefix: string, propertyName: string) {
        return this.children.get(prefix + propertyName) || this.children.get(propertyName);
    }
}

/**
 * Information on how to retrieve a child node.
 *
 * The setter could be null, if the property is not mutable. In that case the value
 * must necessarily be passed when constructing the parent.
 */
export class ChildNodeFactory<Source, Target, Child> {
    constructor(
        public name: string,
        public get: (source: Source) => any | undefined,
        public setter?: (target: Target, child?: Child) => void
    ) {}

    set(node: Target, child?: Child) : void {
        if (!this.setter) {
            throw new Error(`Unable to set value ${this.name} in ${node}`)
        }
        try {
            this.setter(node, child);
        } catch (e) {
            const error = new Error(`${this.name} could not set child ${child} of ${node} using ${this.setter}`);
            error["cause"] = e;
            throw error;
        }
    }
}

/**
 * Sentinel value used to represent the information that a given property is not a child node.
 */
const NO_CHILD_NODE = new ChildNodeFactory<any, any, any>("", (node) => node);

/**
 * Implementation of a tree-to-tree transformation. For each source node type, we can register a factory that knows how
 * to create a transformed node. Then, this transformer can read metadata in the transformed node to recursively
 * transform and assign children.
 * If no factory is provided for a source node type, a GenericNode is created, and the processing of the subtree stops
 * there.
 */
export class ASTTransformer {
    /**
     * Factories that map from source tree node to target tree node.
     */
    private factories = new Map<any, NodeFactory<any, any>>();
    readonly knownClasses = new Map<string, Set<any>>();

    /**
     * @param issues Additional issues found during the transformation process.
     * @param allowGenericNode Use GenericNode as a strategy for missing factories for nodes.
     */
    constructor(
        /** Additional issues found during the transformation process. */
        public readonly issues: Issue[] = [],
        public readonly allowGenericNode = true) {}

    addIssue(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position?: Position) : Issue {
        const issue = Issue.semantic(message, severity, position);
        this.issues.push(issue);
        return issue;
    }

    transform(source?: any, parent?: Node) : Node | undefined {
        const result = this.transformIntoNodes(source, parent);
        switch (result.length) {
            case 0:
                return undefined;
            case 1: {
                const node = result[0]
                if (!(node instanceof Node)) {
                    throw new Error(`Not a node: ${node}`);
                }
                return node;
            }
            default:
                throw new Error(`Cannot transform ${source} into a single Node as multiple nodes where produced: ${result}`);
        }
    }

    /**
     * Performs the transformation of a node and, recursively, its descendants.
     */
    transformIntoNodes(source?: any, parent?: Node): Node[] {
        if (!source) {
            return [];
        }
        if (Array.isArray(source)) {
            throw Error("Mapping error: received collection when value was expected");
        }

        const factory: NodeFactory<any, any> | undefined = this.getNodeFactory(source);
        let nodes: Node[];

        if (factory) {
            nodes = this.makeNodes(factory, source);

            if (!factory.skipChildren && !factory.childrenSetAtConstruction) {
                nodes.forEach(node => {
                    this.setChildren(factory, source, node);
                });
            }
            nodes.forEach(node => {
                factory.finalizer(node);
                node.parent = parent;
            });
        } else {
            if (this.allowGenericNode) {
                const origin : Origin | undefined = this.asOrigin(source);
                nodes = [new GenericNode(parent).withOrigin(origin)];
                this.issues.push(
                    Issue.semantic(
                        `Source node not mapped: ${getNodeDefinition(source)?.name}`,
                        IssueSeverity.INFO,
                        origin?.position
                    )
                );
            }
            else {
                throw new Error(`Unable to translate node ${source} (class ${getNodeDefinition(source)?.name})`)
            }
        }
        return nodes;
    }

    private setChildren(factory: NodeFactory<any, any>, source: any, node: Node) {
        const nodeClass = Object.getPrototypeOf(node).constructor;
        const nodeDefinition = getNodeDefinition(node);
        let prefix = nodeDefinition?.name || nodeClass?.name || "";
        if (prefix) {
            prefix += "#";
        }
        const properties = nodeDefinition ? Object.keys(nodeDefinition.features) : Object.keys(node);
        properties.forEach(propertyName => {
            const childNodeFactory = factory.getChildNodeFactory(prefix, propertyName);
            if (childNodeFactory) {
                if (childNodeFactory !== NO_CHILD_NODE) {
                    this.setChild(childNodeFactory, source, node!, propertyName);
                }
            } else {
                const childKey: string = prefix + propertyName;
                factory.children.set(childKey, NO_CHILD_NODE);
            }
        });
    }

    asOrigin(source: any) : Origin | undefined {
        if (source instanceof Origin)
            return source;
        else
            return undefined;
    }

    setChild(
        childNodeFactory: ChildNodeFactory<any, any, any>,
        source: any,
        node: Node,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        propertyDescription: string
    ) : void {
        const src = childNodeFactory.get(this.getSource(node, source));

        let child: any | undefined;
        if (Array.isArray(src)) {
            child = src.map(it => this.transform(it, node)).filter(n => n != undefined);
        } else {
            child = this.transform(src, node);
        }

        try {
            childNodeFactory.set(node, child);
        } catch (e) {
            throw new Error(`Could not set child ${childNodeFactory}`);
        }
    }

    getSource(node: Node, source: any) : any {
        return source;
    }

    protected makeNodes<S, T extends Node>(factory: NodeFactory<S, T>, source: S) : Node[] {
        let nodes : Node[];
        try {
            nodes = factory.constructorFunction(source, this, factory);
        } catch (e) {
            if (this.allowGenericNode) {
                nodes = [new GenericErrorNode(e)];
            } else {
                throw e;
            }
        }
        nodes.forEach(node => {
            if (!node.origin) {
                node.withOrigin(this.asOrigin(source));
            }
        });
        return nodes;
    }

    getNodeFactory<S, T extends Node>(type: any) : NodeFactory<S, T> | undefined {
        let nodeClass = type.constructor;
        while (nodeClass) {
            const factory : NodeFactory<S, T> | undefined = this.factories.get(nodeClass);
            if (factory) {
                return factory as NodeFactory<S, T>;
            }
            nodeClass = Object.getPrototypeOf(nodeClass);
        }

        return undefined;
    }

    public registerNodeFactory<S, T extends Node>(
        nodeClass: new(...args: any) => S,
        factory: (type: S, transformer: ASTTransformer, factory: NodeFactory<S, T>) => T | undefined
    ) : NodeFactory<S, T> {

        const nodeFactory = NodeFactory.single(factory);
        this.factories.set(nodeClass, nodeFactory);
        return nodeFactory;
    }

    public registerMultipleNodeFactory<S, T extends Node>(
        nodeClass: any,
        factory: (type: S, transformer: ASTTransformer, factory: NodeFactory<S, T>) => T[]
    ) : NodeFactory<S, T> {
        const nodeFactory = new NodeFactory(factory);
        this.factories.set(nodeClass, nodeFactory);
        return nodeFactory;
    }

    public registerIdentityTransformation<T extends Node>(nodeClass: new(...args: any[]) => T) : NodeFactory<T, T> {
        return this.registerNodeFactory(nodeClass, (node: T) => node);
    }
}

@ASTNode("com.strumenta.tylasu.transformation", "GenericNode")
export class GenericNode extends Node {
    constructor(parent?: Node) {
        super();
        this.parent = parent;
    }
}
