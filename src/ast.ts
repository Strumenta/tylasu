import {ParseTree} from "antlr4ts/tree";
import {Position} from "./position";

export const NODE_DEFINITION_SYMBOL = Symbol("nodeDefinition");

export type PackageDescription = {
    nodes: { [name: string]: new (...args: any[]) => Node }
};
export const NODE_TYPES: { [name: string]: PackageDescription } = {
    "": { nodes: {} }
};

export type NodeDefinition = {
    package: string,
    name: string,
    properties: { [name: string]: any },
    generated?: boolean
};

export function getNodeDefinition(node: Node | (new (...args: any[]) => Node)): NodeDefinition | undefined {
    return typeof node === "function" ? node[NODE_DEFINITION_SYMBOL] : node.constructor[NODE_DEFINITION_SYMBOL];
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

    getChildNames(): string[] {
        const props = getNodeDefinition(this)?.properties || {};
        return Object.getOwnPropertyNames(props).filter(p => props[p].child);
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

//-----------------------//
// Metadata registration //
//-----------------------//

function registerNodeDefinition<T extends Node>(
    target: { new(...args: any[]): T }, pkg = ""): NodeDefinition {
    if (!NODE_TYPES[pkg]) {
        NODE_TYPES[pkg] = { nodes: {} };
    }
    const name = target.name;
    let def;
    const existingTarget = NODE_TYPES[pkg].nodes[name];
    if(existingTarget && existingTarget !== target) {
        throw new Error(target + " is already defined as " + existingTarget);
    }
    const existingDef = target[NODE_DEFINITION_SYMBOL] as NodeDefinition;
    if(existingDef && (existingDef.package != pkg || existingDef.name != name)) {
        if(existingDef.generated && NODE_TYPES[existingDef.package].nodes[existingDef.name] === target) {
            delete NODE_TYPES[existingDef.package].nodes[existingDef.name];
            existingDef.package = pkg;
            existingDef.name = name;
            existingDef.generated = false;
            def = existingDef;
        } else {
            throw new Error("Type " + name + " is already defined as " + JSON.stringify(existingDef));
        }
    } else {
        def = {
            package: pkg,
            name: name,
            properties: {}
        };
    }
    NODE_TYPES[pkg].nodes[name] = target;
    target[NODE_DEFINITION_SYMBOL] = def;
    return def;
}

export function ensureNodeDefinition(node: Node | { new (...args: any[]): Node }): NodeDefinition {
    let definition = getNodeDefinition(node);
    if (!definition) {
        if(typeof node === 'function') {
            definition = registerNodeDefinition(node);
            definition.generated = true;
        } else if(typeof node.constructor === 'function') {
            definition = registerNodeDefinition(node.constructor as any);
            definition.generated = true;
        } else {
            throw new Error("Not a valid node: " + node);
        }
    }
    return definition;
}

export function registerNodeProperty<T extends Node>(type: { new(...args: any[]): T }, methodName: string): any {
    if (methodName == "parent" || methodName == "children" || methodName == "parseTreeNode") {
        throw new Error(`Can't register the ${methodName} property as a node property`);
    }
    const definition = ensureNodeDefinition(type);
    if (!definition.properties[methodName]) {
        definition.properties[methodName] = {};
    }
    return definition.properties[methodName];
}

export function registerNodeChild<T extends Node>(
    type: new (...args: any[]) => T, methodName: string): any {
    const propInfo = registerNodeProperty(type, methodName);
    propInfo.child = true;
    return propInfo;
}

//------------//
// Decorators //
//------------//

export function ASTNode<T extends Node>(pkg = "") {
    return function (target: new (...args: any[]) => T): void {
        registerNodeDefinition(target, pkg);
    };
}

export function Child(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeChild(target, methodName);
    };
}

export function Property(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeProperty(target, methodName);
    };
}