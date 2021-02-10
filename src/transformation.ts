import {ASTNode, Node, NODE_DEFINITION_SYMBOL, PROPERTIES_SYMBOL, registerNodeProperty} from "./ast";
import {GenericNode} from "./mapping";

//-----------------------------------//
// Factory and metadata registration //
//-----------------------------------//

export const NODE_FACTORY_SYMBOL = Symbol("nodeFactory");
export const INIT_SYMBOL = Symbol("init");

export function registerNodeFactory<T>(type: new (...args: any[]) => T, factory: (tree: T) => Node): void {
    type.prototype[NODE_FACTORY_SYMBOL] = factory;
}

export function registerPropertyMapping<T extends Node>(
    type: new (...args: any[]) => T, methodName: string, path: string = methodName): any {
    const propInfo = registerNodeProperty(type, methodName);
    propInfo.path = path || methodName;
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
            ASTNode("")(target);
        }
        registerNodeFactory(type, () => new target());
    };
}

export function Mapped(path?: string): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerPropertyMapping(target, methodName, path);
    };
}

// Since target is any-typed (see https://www.typescriptlang.org/docs/handbook/decorators.html),
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Init(target, methodName: string): void {
    registerInitializer(target, methodName);
}

//-----------------//
// Transformations //
//-----------------//

export function fillChildAST<FROM, TO extends Node>(
    node: TO, property: string, tree: FROM, transformer: (node: FROM) => TO): TO[] {
    const propDef = node[PROPERTIES_SYMBOL][property];
    const propertyPath = propDef.path || property;
    if (propertyPath && propertyPath.length > 0) {
        const path = propertyPath.split(".");
        for (const segment in path) {
            if (tree && (tree[path[segment]] instanceof Function)) {
                tree = tree[path[segment]]();
            } else if (tree && tree[path[segment]]) {
                tree = tree[path[segment]];
            } else {
                tree = null;
                break;
            }
        }
        if (tree) {
            if(propDef.child) {
                if (Array.isArray(tree)) {
                    node[property] = [];
                    for (const i in tree) {
                        node[property].push(transformer(tree[i]).withParent(node));
                    }
                    return node[property];
                } else {
                    node[property] = transformer(tree).withParent(node);
                    return [node[property]];
                }
            } else {
                node[property] = tree;
            }
        }
    }
    return [];
}

export function transform(tree: unknown, parent?: Node, transformer: typeof transform = transform): Node {
    const factory = tree[NODE_FACTORY_SYMBOL];
    let node: Node;
    if (factory) {
        node = factory(tree) as Node;
        if (node[PROPERTIES_SYMBOL]) {
            for (const p in node[PROPERTIES_SYMBOL]) {
                fillChildAST(node, p, tree, transformer);
            }
        }
        const initFunction = node[INIT_SYMBOL];
        if (initFunction) {
            node[initFunction].call(node, tree);
        }
    } else {
        node = new GenericNode();
    }
    return node.withParent(parent);
}