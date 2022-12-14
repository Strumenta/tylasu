import {
    ASTNode,
    ensureNodeDefinition,
    getNodeDefinition,
    Node,
    NODE_DEFINITION_SYMBOL, Origin,
    registerNodeDefinition,
    registerNodeProperty
} from "../model/model";
import {Issue, IssueSeverity} from "../validation";
import {Position} from "../model/position";

/**
 * Implementation of a tree-to-tree transformation. For each source node type, we can register a factory that knows how
 * to create a transformed node. Then, this transformer can read metadata in the transformed node to recursively
 * transform and assign children.
 * If no factory is provided for a source node type, a GenericNode is created, and the processing of the subtree stops
 * there.
 */
export class ASTTransformer {
    private readonly _issues: Issue[];
    private allowGenericNode: boolean;

    get issues() : Issue[] {
        return this._issues;
    }

    /**
     * Factories that map from source tree node to target tree node.
     */
    private factories = [];
    private knownClasses = [];

    /**
     * @param issues Additional issues found during the transformation process.
     * @param allowGenericNode Use GenericNode as a strategy for missing factories for nodes.
     */
    constructor(issues: Issue[] = [], allowGenericNode = true) {
        this._issues = issues;
        this.allowGenericNode = allowGenericNode;
    }

    addIssue = function(message: string, severity: IssueSeverity = IssueSeverity.ERROR, position?: Position) : Issue {
        const issue = Issue.semantic(message, severity, position);
        this._issues.push(issue);
        return issue;
    }

    transform = function(source?: any, parent?: Node) : Node | undefined {
        if (source == undefined)
            return undefined;

        if (Array.isArray(source))
            throw Error("Mapping error: received collection when value was expected");

        const factory = this.getNodeFactory(source);
        let node: Node | undefined;

        if (factory != undefined) {
            node = makeNode(factory, source);

            if (node == undefined)
                return undefined;

            // TODO: node.processProperties

            factory.finalizer(node);
            node.parent = parent;
        }
        else {
            if (this.allowGenericNode) {
                const origin : Node | undefined = this.asOrigin(source);
                node = new GenericNode(parent).withOrigin(origin);
                this._issues.push(
                    Issue.semantic(
                        `Source node not mapped: ${Object.getPrototypeOf(source).constructor.name}`,
                        IssueSeverity.INFO,
                        origin?.position
                    )
                );
            }
            else {
                throw new Error(`Unable to translate node ${source} (class ${Object.getPrototypeOf(source).constructor.name})`)
            }
        }

        return node;
    }

    getNodeFactory = function<S extends any, T extends Node>(source: any) : Node | undefined {
        return undefined; // TODO
    }

    asOrigin = function(source: any) : Origin | undefined {
        if (source instanceof Origin)
            return source;
        else
            return undefined;
    }
}



//-----------------------------------//
// Factory and metadata registration //
//-----------------------------------//

export const NODE_FACTORY_SYMBOL = Symbol("nodeFactory");
export const INIT_SYMBOL = Symbol("init");

//TODO for future version: allow multiple factories, keyed by name (string | symbol).
export function registerNodeFactory<T>(type: new (...args: any[]) => T, factory: (tree: T) => Node): void {
    type.prototype[NODE_FACTORY_SYMBOL] = factory;
}

/**
 * Marks a property of a node as mapped from a property of another node of a different name.
 * @param type the source node's type.
 * @param propertyName the name of the target property.
 * @param path the path in the source node that will be mapped to the target property.
 */
export function registerPropertyMapping<T extends Node>(
    type: new (...args: any[]) => T, propertyName: string, path: string = propertyName): any {
    const propInfo = registerNodeProperty(type, propertyName);
    propInfo.path = path || propertyName;
    return propInfo;
}

export function registerInitializer<T extends Node>(type: new (...args: any[]) => T, methodName: string): void {
    type[INIT_SYMBOL] = methodName;
}

//------------//
// Decorators //
//------------//

export function NodeTransform<T extends Node>(type: new (...args: any[]) => T) {
    return function (target: new () => Node): void {
        if(!target[NODE_DEFINITION_SYMBOL]) {
            registerNodeDefinition(target);
        }
        registerNodeFactory(type, () => new target());
    };
}

/**
 * Marks a property of a node as mapped from a property of another node of a different name.
 *
 * Note: this will eventually be integrated with Kolasu-style transformers.
 * @param path the path in the source node that will be mapped to the target property.
 */
export function Mapped(path?: string): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerPropertyMapping(target, methodName, path);
    };
}

/**
 * Decorator to register an initializer method on a Node. When a node is instantiated as the target of a
 * transformation, after its properties have been set, the transformer calls the init method, if any.
 * @param target the target type.
 * @param methodName the name of the init method.
 * @deprecated this will be replaced by Kolasu-style transformers.
 */
// Since target is any-typed (see https://www.typescriptlang.org/docs/handbook/decorators.html),
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Init(target, methodName: string): void {
    registerInitializer(target, methodName);
}

//-----------------//
// Transformations //
//-----------------//

export function fillChildAST<FROM, TO extends Node>(
    node: TO, property: string, tree: FROM | undefined, transformer: (node: FROM) => TO | undefined): TO[] {
    const propDef = ensureNodeDefinition(node).properties[property];
    const propertyPath = propDef.path || property;
    if (propertyPath && propertyPath.length > 0) {
        const path = propertyPath.split(".");
        let error;
        for (const segment in path) {
            if (tree && (typeof(tree[path[segment]]) === "function")) {
                try {
                    tree = tree[path[segment]]();
                } catch (e) {
                    error = e;
                    break;
                }
            } else if (tree && tree[path[segment]]) {
                tree = tree[path[segment]];
            } else {
                tree = undefined;
                break;
            }
        }
        if(error) {
            node[property] = new ErrorNode(error);
        } else if (tree) {
            if(propDef.child) {
                if (Array.isArray(tree)) {
                    node[property] = [];
                    for (const i in tree) {
                        node[property].push(transformer(tree[i])?.withParent(node));
                    }
                    return node[property];
                } else {
                    node[property] = transformer(tree)?.withParent(node);
                    return [node[property]];
                }
            } else {
                node[property] = tree;
            }
        }
    }
    return [];
}

function makeNode(factory, tree: unknown) {
    try {
        return factory(tree) as Node;
    } catch (e) {
        return new ErrorNode(e);
    }
}

export function transform(tree: unknown, parent?: Node, transformer: typeof transform = transform): Node | undefined {
    if (typeof tree !== "object" || !tree) {
        return undefined;
    }
    const factory = tree[NODE_FACTORY_SYMBOL];
    let node: Node;
    if (factory) {
        node = makeNode(factory, tree);
        const def = getNodeDefinition(node);
        if (def) {
            for (const p in def.properties) {
                fillChildAST(node, p, tree, transformer);
            }
        }
        const initFunction = node[INIT_SYMBOL];
        if (initFunction) {
            try {
                node[initFunction].call(node, tree);
            } catch (e) {
                node = new PartiallyInitializedNode(node, e);
            }
        }
    } else {
        node = new GenericNode();
    }
    return node.withParent(parent);
}

@ASTNode("", "GenericNode")
export class GenericNode extends Node {
    constructor(parent?: Node) {
        super();
        this.parent = parent;
    }
}

@ASTNode("", "ErrorNode")
export class ErrorNode extends Node {
    constructor(readonly error: Error) {
        super();
    }
}

export class PartiallyInitializedNode extends ErrorNode {
    constructor(readonly node: Node, error: Error) {
        super(error);
    }
}
