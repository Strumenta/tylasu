import {ParseTree} from "antlr4ts/tree";
import {ParserRuleContext} from "antlr4ts";

//-----------------------------------//
// Factory and metadata registration //
//-----------------------------------//

const NODE_FACTORY_SYMBOL = Symbol("nodeFactory");
const INIT_SYMBOL = Symbol("init");
const CHILD_PROPERTIES_SYMBOL = Symbol("childProperties");

export function registerNodeFactory<T extends ParseTree>(type: new (...args: any[]) => T, factory: (tree: T) => Node): void {
    type.prototype[NODE_FACTORY_SYMBOL] = factory;
}

export function registerNodeChild<T extends Node>(type: new (...args: any[]) => T, methodName: string, path: string = methodName): void {
    if(methodName == "parent" || methodName == "children") {
        throw new Error(`Can't register the ${methodName} property as a child`);
    }
    if (!type[CHILD_PROPERTIES_SYMBOL]) {
        type[CHILD_PROPERTIES_SYMBOL] = {};
    }
    type[CHILD_PROPERTIES_SYMBOL][methodName] = { path: path || methodName };
}

export function registerInitializer<T extends Node>(type: new (...args: any[]) => T, methodName: string): void {
    type[INIT_SYMBOL] = methodName;
}

//------------//
// Decorators //
//------------//

export function ASTNodeFor<T extends ParseTree>(type: new (...args: any[]) => T) {
    return function (target: new () => Node): void {
        registerNodeFactory(type, () => new target());
    };
}

export function Child(path?: string): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeChild(target, methodName, path);
    };
}

// Since target is any-typed (see https://www.typescriptlang.org/docs/handbook/decorators.html),
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Init(target, methodName: string): void {
    registerInitializer(target, methodName);
}

//-----//
// AST //
//-----//

export function fillChildAST(node: Node, property: string, tree: ParseTree): Node[] {
    const childPath = node[CHILD_PROPERTIES_SYMBOL][property].path;
    if (childPath && childPath.length > 0) {
        const path = childPath.split(".");
        for (const segment in path) {
            if (tree && (tree[path[segment]] instanceof Function)) {
                tree = tree[path[segment]]();
            } else {
                tree = null;
                break;
            }
        }
        if (tree) {
            if (Array.isArray(tree)) {
                node[property] = [];
                for (const i in tree) {
                    node[property].push(toAST(tree[i], node));
                }
                return node[property];
            } else {
                node[property] = toAST(tree, node);
                return [node[property]];
            }
        }
    }
    return [];
}

export function toAST(tree: ParseTree, parent?: Node): Node {
    if(!tree) {
        return null;
    }
    const factory = tree[NODE_FACTORY_SYMBOL];
    let node: Node;
    if (factory) {
        node = factory(tree) as Node;
        if (node[CHILD_PROPERTIES_SYMBOL]) {
            for (const p in node[CHILD_PROPERTIES_SYMBOL]) {
                fillChildAST(node, p, tree);
            }
        }
        const initFunction = node[INIT_SYMBOL];
        if(initFunction) {
            node[initFunction].call(node, tree);
        }
    } else {
        node = new GenericNode();
    }
    node.parseTreeNode = tree;
    return node.withParent(parent);
}

export abstract class Node {
    parent: Node;
    parseTreeNode?: ParseTree;

    get children(): Node[] {
        const names = this.getChildNames();
        const children = [];

        function addChildren(child) {
            if (child) {
                if (child instanceof Node) {
                    children.push(child);
                } else if (Array.isArray(child)) {
                    child.forEach(addChildren);
                }
            }
        }

        names.forEach(n => addChildren(this[n]));
        return children;
    }

    private getChildNames() {
        return Object.getOwnPropertyNames(this[CHILD_PROPERTIES_SYMBOL] || {});
    }

    isChild(name: string): boolean {
        return this.getChildNames().indexOf(name) >= 0;
    }

    setChild(name: string, child: Node): void {
        if(!this.isChild(name)) {
            throw new Error("Not a child: " + name);
        }
        if(Array.isArray(this[name])) {
            throw new Error(name + " is a collection, use addChild");
        }
        if(child.parent && child.parent != this) {
            throw new Error("Child already has a different parent");
        }
        if(this[name] instanceof Node) {
            this[name].parent = undefined;
        }
        this[name] = child.withParent(this);
    }

    addChild(name: string, child: Node): void {
        if(!this.isChild(name)) {
            throw new Error("Not a child: " + name);
        }
        if(this[name] && !Array.isArray(this[name])) {
            throw new Error(name + " is not a collection, use setChild");
        }
        if(child.parent && child.parent != this) {
            throw new Error("Child already has a different parent");
        }
        if(!this[name]) {
            this[name] = [];
        }
        this[name].push(child.withParent(this));
    }

    withParent(parent: Node): this {
        this.parent = parent;
        return this;
    }
}

export class NodeVisitor {
    visit(ast: Node): void {
        this.visitNode(ast);
        this.visitChildren(ast);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected visitNode(ast: Node): void {
        //By default, do nothing
    }

    protected visitChildren(ast: Node): void {
        ast.children.forEach(c => this.visit(c));
    }
}

@ASTNodeFor(ParserRuleContext)
export class GenericNode extends Node {
}