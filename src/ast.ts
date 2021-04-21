import {ParseTree} from "antlr4ts/tree";
import {Position} from "./position";
import "reflect-metadata";

export const NODE_DEFINITION_SYMBOL = Symbol("nodeDefinition");

export type PackageDescription = {
    name: string,
    nodes: { [name: string]: new (...args: any[]) => Node }
};
export const NODE_TYPES: { [name: string]: PackageDescription } = {
    "": { name: "", nodes: {} }
};

export type NodeDefinition = {
    package: string,
    name: string,
    properties: { [name: string]: any },
    generated?: boolean,
    resolved?: boolean;
};

export function getNodeDefinition(node: Node | (new (...args: any[]) => Node)): NodeDefinition | undefined {
    const target = typeof node === "function" ? node : node.constructor;
    if(Object.prototype.hasOwnProperty.call(target, NODE_DEFINITION_SYMBOL)) {
        const definition = target[NODE_DEFINITION_SYMBOL];
        if(definition && definition.properties && !definition.resolved) {
            try {
                const metadataHolder = typeof node === "function" ? new node() : node;
                let noTypesToFind = true;
                let atLeastOneFound = false;
                for(const p in definition.properties) {
                    noTypesToFind = false;
                    const type = Reflect.getMetadata("design:type", metadataHolder, p);
                    atLeastOneFound = atLeastOneFound || !!type;
                    definition.properties[p].type = type;
                    if(type === Array) {
                        definition.properties[p].arrayType =
                            Reflect.getMetadata("design:arrayElementType", metadataHolder, p);
                    }
                }
                definition.resolved = noTypesToFind || atLeastOneFound;
            } catch (e) {
                //Ignore
            }
        }
        return definition;
    } else {
        return undefined;
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

    set position(newPos: Position) {
        this.specifiedPosition = newPos;
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

export function ensurePackage(packageName: string): PackageDescription {
    if (!NODE_TYPES[packageName]) {
        NODE_TYPES[packageName] = { name: packageName, nodes: {}};
    }
    return NODE_TYPES[packageName];
}

export const SYMBOL_NODE_NAME = Symbol("name");

export function registerNodeDefinition<T extends Node>(
    target: { new(...args: any[]): T }, pkg = ""): NodeDefinition {
    ensurePackage(pkg);
    const name = target[SYMBOL_NODE_NAME] || target.name;
    let def;
    const existingTarget = NODE_TYPES[pkg].nodes[name];
    if(existingTarget && existingTarget !== target) {
        throw new Error(`${name} (${target}) is already defined as ${existingTarget}`);
    }
    const existingDef = target[NODE_DEFINITION_SYMBOL] as NodeDefinition;
    if(Object.prototype.hasOwnProperty.call(target, NODE_DEFINITION_SYMBOL)) {
        if(existingDef.package != pkg || existingDef.name != name) {
            if(existingDef.generated && NODE_TYPES[existingDef.package].nodes[existingDef.name] === target) {
                delete NODE_TYPES[existingDef.package].nodes[existingDef.name];
                existingDef.package = pkg;
                existingDef.name = name;
                existingDef.generated = false;
                def = existingDef;
            } else {
                throw new Error(`Type ${name} is already defined as ${JSON.stringify(existingDef)}`);
            }
        } else {
            def = existingDef;
        }
    } else {
        def = {
            package: pkg,
            name: name,
            properties: {}
        };
        if(existingDef) {
            for(const prop in existingDef.properties) {
                def.properties[prop] = {inherited: true, ...existingDef.properties[prop]};
            }
        }
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

export function Children(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        const props = registerNodeChild(target, methodName);
        props.multiple = true;
    };
}


export function Property(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeProperty(target, methodName);
    };
}