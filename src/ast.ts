import {ParseTree} from "antlr4ts/tree";
import {Position} from "./position";

export const CHILD_PROPERTIES_SYMBOL = Symbol("childProperties");
export const NODE_DEFINITION_SYMBOL = Symbol("nodeDefinition");

export const NODE_TYPES: { [name: string]: { [name: string]: new (...args: any[]) => Node } } = {
    "": {}
};

export type NodeDefinition = { package: string, name: string };

export function getNodeDefinition(node: Node | (new (...args: any[]) => Node)): NodeDefinition | undefined {
    if(node instanceof Node) {
        const nodeType = Object.getPrototypeOf(node).constructor;
        let definition = nodeType[NODE_DEFINITION_SYMBOL];
        if(!definition) {
            definition = registerNodeDefinition(nodeType);
        }
        return definition;
    } else {
        return node[NODE_DEFINITION_SYMBOL];
    }
}

export abstract class Node {
    parent?: Node;
    parseTreeNode?: ParseTree;

    constructor(protected specifiedPosition?: Position) {}

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

    getChildNames() {
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

    get position(): Position | undefined {
        return this.specifiedPosition || Position.ofParseTree(this.parseTreeNode);
    }
}

export class NodeVisitor {
    visit(node: Node): void {
        this.visitNode(node);
        this.visitChildren(node);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected visitNode(ast: Node): void {
        //By default, do nothing
    }

    protected visitChildren(node: Node): void {
        node.children.forEach(c => this.visit(c));
    }
}

function registerNodeDefinition<T extends Node>(target: { new(...args: any[]): T }, pkg = ""): NodeDefinition {
    if (!NODE_TYPES[pkg]) {
        NODE_TYPES[pkg] = {};
    }
    NODE_TYPES[pkg][target.name] = target;
    const def = {
        package: pkg,
        name: target.name
    };
    target[NODE_DEFINITION_SYMBOL] = def;
    return def;
}

export function ASTNode<T extends Node>(pkg = "") {
    return function (target: new (...args: any[]) => T): void {
        registerNodeDefinition(target, pkg);
    };
}