import {Position, Source} from "./position";
import "reflect-metadata";
import {PossiblyNamed, ReferenceByName} from "./naming";

export const NODE_DEFINITION_SYMBOL = Symbol("nodeDefinition");

export type PackageDescription = {
    name: string,
    nodes: { [name: string]: new (...args: any[]) => Node }
};
export const NODE_TYPES: { [name: string]: PackageDescription } = {
    "": { name: "", nodes: {} }
};

export type NodeDefinition = {
    package?: string,
    name?: string,
    features: { [name: string | symbol]: PropertyDefinition },
    resolved?: boolean;
};

export type PropertyDefinition = {
    name: string | symbol,
    child?: boolean,
    multiple?: boolean,
    inherited?: boolean,
    reference?: boolean,
    type?: any,
    arrayType?: any
}

export function getNodeDefinition(node: Node | (new (...args: any[]) => Node)): NodeDefinition {
    const target = typeof node === "function" ? node : node.constructor;
    let definition: NodeDefinition;
    if(Object.prototype.hasOwnProperty.call(target, NODE_DEFINITION_SYMBOL)) {
        definition = target[NODE_DEFINITION_SYMBOL] as NodeDefinition;
    } else {
        const inheritedFeatures = {...(target[NODE_DEFINITION_SYMBOL]?.features || {})};
        for (const p in inheritedFeatures) {
            inheritedFeatures[p] = { inherited: true, ...inheritedFeatures[p] };
        }
        target[NODE_DEFINITION_SYMBOL] = definition = {
            features: inheritedFeatures,
            resolved: false
        };
    }
    if(definition && definition.features && !definition.resolved) {
        try {
            let metadataHolder;
            try {
                metadataHolder = new (node as any)();
            } catch (_) {
                metadataHolder = node;
            }
            for(const p in definition.features) {
                if (!definition.features[p].type) {
                    const type = Reflect.getMetadata("design:type", metadataHolder, p);
                    definition.features[p].type = type;
                    if(type === Array) {
                        definition.features[p].arrayType =
                            Reflect.getMetadata("design:arrayElementType", metadataHolder, p);
                    }
                }
            }
            definition.resolved = true;
        } catch (e) {
            //Ignore
        }
    }
    return definition;
}

export abstract class Origin {
    abstract get position(): Position | undefined;
    get sourceText(): string | undefined {
        return undefined;
    }
    /**
     * Tests whether the given position is contained in the interval represented by this object.
     * @param position the position
     */
    contains(position?: Position): boolean {
        return this.position?.contains(position) || false;
    }

    /**
     * Tests whether the given position overlaps the interval represented by this object.
     * @param position the position
     */
    overlaps(position?: Position): boolean {
        return this.position?.overlaps(position) || false
    }

    get source(): Source | undefined {
        return this.position?.source;
    }
}

export class SimpleOrigin extends Origin {
    constructor(public myPosition?: Position, public mySourceText?: string) {
        super();
    }

    get position(): Position | undefined {
        return this.myPosition
    }

    get sourceText(): string | undefined {
        return this.mySourceText
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Destination {}


export class CompositeDestination implements Destination {
    constructor(public readonly elements: Destination[]) {}
}

export class TextFileDestination implements Destination {
    constructor(public readonly position?: Position) {}
}

/**
 * The Abstract Syntax Tree will be constituted by instances of Node.
 *
 * It implements Origin as it could be the source of a AST-to-AST transformation, so the node itself can be
 * the Origin of another node.
 */
export abstract class Node extends Origin implements Destination {
    parent?: Node;
    origin?: Origin;
    destination?: Destination;

    constructor(protected positionOverride?: Position) {
        super();
    }

    get children(): Node[] {
        const names = this.getChildNames();
        const children : Node[] = [];

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
        const props = this.nodeDefinition?.features || {};
        return Object.getOwnPropertyNames(props).filter(p => props[p].child);
    }

    get nodeDefinition(): NodeDefinition {
        return getNodeDefinition(this);
    }

    get features(): FeatureDescription[] {
        const props = this.nodeDefinition?.features || {};
        return Object.getOwnPropertyNames(props).map(p => {
            const value = props[p].child ?
                (props[p].multiple  ? this.getChildren(p)  : this.getChild(p)) :
                (props[p].reference ? this.getReference(p) : this.getAttributeValue(p));
            return { name: p, value };
        });
    }

    containment(name: string | symbol): PropertyDefinition | undefined {
        const props = this.nodeDefinition?.features || {};
        return props[name]?.child ? props[name] : undefined;
    }

    setChild(name: string, child: Node): void {
        const containment = this.containment(name);
        if(!containment) {
            throw new Error("Not a containment: " + name);
        } else if (containment.multiple) {
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
        const containment = this.containment(name);
        if(!containment) {
            throw new Error("Not a containment: " + name);
        } else if (!containment.multiple) {
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

    getChild(name: string | symbol, index?: number): Node | undefined {
        const containment = this.containment(name);
        if(!containment) {
            throw new Error("Not a containment: " + name.toString());
        }
        const raw = this.doGetChildOrChildren(name);
        if (containment.multiple) {
            if (index !== undefined) {
                return (raw as Node[])[index];
            } else {
                throw new Error(name.toString() + " is a collection, an index is required");
            }
        } else {
            if (index) {
                throw new Error(name.toString() + " is not a collection, index " + index + " is invalid");
            } else {
                return raw as Node;
            }
        }
    }

    protected doGetChildOrChildren(name: string | symbol): Node | Node[] | undefined {
        return this[name];
    }

    getChildren(name?: string | symbol): Node[] {
        if (name !== undefined) {
            return this.getChildrenWithRole(name);
        } else {
            return this.getAllChildren();
        }
    }

    getAllChildren() {
        const props = this.nodeDefinition?.features || {};
        const result: Node[] = [];
        for (const p in props) {
            const prop = props[p];
            if (prop.child) {
                if (prop.multiple) {
                    result.push(...this.getChildren(p));
                } else {
                    const child = this.getChild(p);
                    if (child) {
                        result.push(child);
                    }
                }
            }
        }
        return result;
    }

    getChildrenWithRole(name: string | symbol) {
        const containment = this.containment(name);
        if (!containment) {
            throw new Error("Not a containment: " + name.toString());
        }
        const raw = this.doGetChildOrChildren(name);
        if (containment.multiple) {
            return (raw as Node[]) || [];
        } else if (raw) {
            return [raw as Node];
        } else {
            return [];
        }
    }

    getAttributeValue(name: string | symbol): any {
        const props = this.nodeDefinition?.features || {};
        const prop = props[name];
        if(prop) {
            if (prop.child) {
                throw new Error(name.toString() + " is a containment, please use getChild");
            } else {
                const attributeValue = this.doGetAttributeValue(name);
                if (attributeValue instanceof ReferenceByName) {
                    throw new Error(name.toString() + " is a reference, please use getReference");
                }
                return attributeValue;
            }
        } else {
            throw new Error(`${name.toString()} is not a feature of ${this} (${this.nodeDefinition}).`);
        }
    }

    setAttributeValue(name: string | symbol, value: any) {
        const props = this.nodeDefinition?.features || {};
        const prop = props[name];
        if(prop) {
            if (prop.child) {
                throw new Error(name.toString() + " is a containment, please use setChild/addChild");
            } else {
                this.doSetAttributeValue(name, value);
            }
        } else {
            throw new Error(`${name.toString()} is not a feature of ${this} (${this.nodeDefinition}).`);
        }
    }

    protected doSetAttributeValue(name: string | symbol, value: any) {
        this[name] = value;
    }

    protected doGetAttributeValue(name: string | symbol) {
        return this[name];
    }

    getReference(name: string | symbol): ReferenceByName<any> | undefined {
        return this.doGetReference(name) as ReferenceByName<any>;
    }

    protected doGetReference(name: string | symbol) {
        return this[name];
    }

    withParent(parent?: Node): this {
        this.parent = parent;
        return this;
    }

    withOrigin(origin?: Origin): this {
        this.origin = origin;
        return this;
    }

    get position(): Position | undefined {
        return this.positionOverride || this.origin?.position;
    }

    set position(newPos: Position | undefined) {
        this.positionOverride = newPos;
    }
}

export interface FeatureDescription {
    name: string;
    value: any;
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

export function errorOnRedefinition<T>(
    name: string, target: { new(...args: any[]): T }, existingTarget: { new(...args: any[]): Node }): void {
    throw new Error(`${name} (${target}) is already defined as ${existingTarget}`);
}

export function warnOnRedefinition<T>(
    name: string, target: { new(...args: any[]): T }, existingTarget: { new(...args: any[]): Node }): void {
    console.warn(`Redefining ${name} from`, existingTarget, 'to', target);
}

let nodeRedefinitionStrategy = errorOnRedefinition;

export function setNodeRedefinitionStrategy(strategy: typeof errorOnRedefinition): void {
    nodeRedefinitionStrategy = strategy;
}

export function registerNodeDefinition<T extends Node>(
    target: { new(...args: any[]): T }, pkg?: string, name?: string): NodeDefinition {
    let def: NodeDefinition;
    if(pkg !== undefined) {
        if (!name) {
            throw new Error("Package name without node name");
        }
        ensurePackage(pkg);
        const existingTarget = NODE_TYPES[pkg].nodes[name];
        if (existingTarget && existingTarget !== target) {
            nodeRedefinitionStrategy(name, target, existingTarget);
        }
    }
    const existingDef = target[NODE_DEFINITION_SYMBOL] as NodeDefinition;
    if(Object.prototype.hasOwnProperty.call(target, NODE_DEFINITION_SYMBOL)) {
        if((existingDef.package !== undefined && existingDef.package != pkg) ||
            (existingDef.name !== undefined && existingDef.name != name)) {
            throw new Error(`Type ${pkg}.${name} (${target}) is already defined as ${JSON.stringify(existingDef)}`);
        } else {
            def = existingDef;
            def.package = pkg;
            def.name = name;
        }
    } else {
        def = {
            package: pkg,
            name: name,
            features: {}
        };
        if(existingDef) {
            for(const prop in existingDef.features) {
                def.features[prop] = { inherited: true, ...existingDef.features[prop]};
            }
        }
    }
    if(pkg !== undefined && name !== undefined) {
        NODE_TYPES[pkg].nodes[name] = target;
    }
    target[NODE_DEFINITION_SYMBOL] = def;
    return def;
}

export function ensureNodeDefinition(node: Node | { new (...args: any[]): Node }): NodeDefinition {
    let definition = getNodeDefinition(node);
    if (!definition) {
        if(typeof node === 'function') {
            definition = registerNodeDefinition(node);
        } else if(typeof node.constructor === 'function') {
            definition = registerNodeDefinition(node.constructor as any);
        } else {
            throw new Error("Not a valid node: " + node);
        }
    }
    return definition;
}

export function registerNodeAttribute<T extends Node>(
    type: { new(...args: any[]): T }, methodName: string | symbol
): PropertyDefinition {
    if (methodName == "parent" || methodName == "children" || methodName == "origin") {
        methodName = Symbol(methodName);
    }
    const definition = ensureNodeDefinition(type);
    if (!definition.features[methodName]) {
        definition.features[methodName] = {
            name: methodName
        };
    }
    return definition.features[methodName];
}

export function registerNodeChild<T extends Node>(
    type: new (...args: any[]) => T, methodName: string, multiple: boolean = false): PropertyDefinition {
    const propInfo = registerNodeAttribute(type, methodName);
    propInfo.child = true;
    propInfo.multiple = multiple;
    return propInfo;
}

export function registerNodeReference<T extends Node & PossiblyNamed>(
    type: new (...args: any[]) => T, methodName: string): PropertyDefinition {
    const propInfo = registerNodeAttribute(type, methodName);
    propInfo.reference = true;
    return propInfo;
}

//------------//
// Decorators //
//------------//

export function ASTNode<T extends Node>(pkg: string, name: string) {
    return function (target: new (...args: any[]) => T): void {
        registerNodeDefinition(target, pkg, name);
    };
}

/**
 * Declares the decorated property as the holder of a child node.
 */
export function Child(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeChild(target, methodName);
    };
}

/**
 * Declares the decorated property as the holder of a collection of child nodes.
 */
export function Children(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeChild(target, methodName, true);
    };
}

/**
 * Declares the decorated property as an attribute.
 * @deprecated use Attribute instead.
 */
export function Property(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeAttribute(target, methodName);
    };
}

/**
 * Declares the decorated property as an attribute.
 */
export function Attribute(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeAttribute(target, methodName);
    };
}

/**
 * Declares the decorated property as a reference.
 */
export function Reference(): (target, methodName: string) => void {
    return function (target, methodName: string) {
        registerNodeReference(target, methodName);
    };
}
