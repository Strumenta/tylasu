import {Position} from "./position";
import "reflect-metadata";
import {
    Concept, Containment, Feature, Id, Link, Metamodel, Node as LNode, Property as LProperty,
    booleanDatatype, intDatatype, stringDatatype
} from "lioncore";

export const NODE_DEFINITION_SYMBOL = Symbol("nodeDefinition");
export const CONCEPT_SYMBOL = Symbol("concept");

export type PackageDescription = {
    name: string,
    nodes: { [name: string]: new (...args: any[]) => Node }
};
export const NODE_TYPES: { [name: string]: PackageDescription } = {
    "": { name: "", nodes: {} }
};

export type NodeProperty = {
    type?: any,
    child?: boolean,
    inherited?: boolean,
    multiple?: boolean
}

export type NodeDefinition = {
    package?: string,
    name?: string,
    extends?: NodeDefinition,
    properties: { [name: string | symbol]: NodeProperty },
};

export function getNodeDefinition(node: Node | (new (...args: any[]) => Node)): NodeDefinition | undefined {
    if (node instanceof Node) {
        node = node.constructor as any;
    }
    if(Object.prototype.hasOwnProperty.call(node, NODE_DEFINITION_SYMBOL)) {
        return node[NODE_DEFINITION_SYMBOL] as NodeDefinition;
    } else {
        return undefined;
    }
}

export const METAMODELS = new Map<string, Metamodel>();

function setPropertyType(lionProp: LProperty, property: NodeProperty) {
    if (property.type === String) {
        lionProp.type = stringDatatype;
    } else if (property.type === Number) {
        lionProp.type = intDatatype;
    } else if (property.type === Boolean) {
        lionProp.type = booleanDatatype;
    }
}

export function getConcept(node: Node | (new (...args: any[]) => Node)): Concept {
    if (node instanceof Node) {
        node = Object.getPrototypeOf(node).constructor;
    }
    const nodeDefinition = getNodeDefinition(node);
    if (!Object.prototype.hasOwnProperty.call(node, CONCEPT_SYMBOL)) {
        const pkg = nodeDefinition?.package;
        const name = nodeDefinition?.name;
        if (pkg && name) {
            let metamodel = METAMODELS.get(pkg);
            if (!metamodel) {
                metamodel = new Metamodel(pkg, pkg);
                METAMODELS.set(pkg, metamodel);
            }
            const concept = new Concept(metamodel, name, pkg + "." + name, false);
            metamodel.elements.push(concept);
            node[CONCEPT_SYMBOL] = concept; // We need this to avoid infinite recursion for self-referencing nodes
            const features: Feature[] = [];
            for (const pName in nodeDefinition!.properties) {
                const property = nodeDefinition.properties[pName];
                let feature: Feature;
                if (property.child) {
                    const containment = new Containment(concept, pName, concept.qualifiedName() + "." + pName);
                    if (property.type) try {
                        containment.type = getConcept(property.type);
                    } catch {
                        // Ignore
                    }
                    feature = containment;
                } else {
                    const lionProp = new LProperty(concept, pName, concept.qualifiedName() + "." + pName);
                    setPropertyType(lionProp, property);
                    feature = lionProp;
                }
                if (property.multiple) {
                    if (feature instanceof Link) {
                        feature.multiple = true;
                    }
                }
                features.push(feature);
            }
            if (nodeDefinition.extends) {
                const superclass = Object.getPrototypeOf(node);
                if (superclass != Node) {
                    concept.extends = getConcept(superclass);
                }
            }
            node[CONCEPT_SYMBOL] = concept.havingFeatures(...features);
        } else {
            throw new Error(
                `Cannot derive a Concept for ${node} – definition is missing or has no package/name: ${JSON.stringify(nodeDefinition)}`);
        }
    }
    return node[CONCEPT_SYMBOL] as Concept;
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

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Destination {}

/**
 * The Abstract Syntax Tree will be constituted by instances of Node.
 *
 * It implements Origin as it could be the source of a AST-to-AST transformation, so the node itself can be
 * the Origin of another node.
 */
export abstract class Node extends Origin implements Destination, LNode {
    parent?: Node;
    origin?: Origin;
    id: Id;

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
        const props = this.nodeDefinition?.properties || {};
        return Object.getOwnPropertyNames(props).filter(p => props[p].child);
    }

    protected get nodeDefinition(): NodeDefinition | undefined {
        return getNodeDefinition(this);
    }

    get concept(): Concept | undefined {
        return getConcept(this);
    }

    get properties(): PropertyDescription[] {
        const props = this.nodeDefinition?.properties || {};
        return Object.getOwnPropertyNames(props).map(p => {
            return { name: p, value: this[p] };
        });
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

export interface PropertyDescription {
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
            properties: {}
        };
        if(existingDef) {
            def.extends = existingDef;
            for(const prop in existingDef.properties) {
                def.properties[prop] = {inherited: true, ...existingDef.properties[prop]};
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

export function registerNodeProperty<T extends Node>(
    type: { new(...args: any[]): T }, methodName: string | symbol
): any {
    const definition = ensureNodeDefinition(type);
    if (!definition.properties[methodName]) {
        definition.properties[methodName] = {};
        let metadataHolder;
        try {
            metadataHolder = new (type as any)();
        } catch (_) {
            metadataHolder = type;
        }
        const pType = Reflect.getMetadata("design:type", metadataHolder, methodName);
        if(pType === Array) {
            definition.properties[methodName].type =
                Reflect.getMetadata("design:arrayElementType", metadataHolder, methodName);
        } else {
            definition.properties[methodName].type = pType;
        }
    }
    return definition.properties[methodName];
}

export function registerNodeChild<T extends Node>(
    type: new (...args: any[]) => T, methodName: string | symbol): any {
    const propInfo = registerNodeProperty(type, methodName);
    propInfo.child = true;
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
export function Child(): (target, methodName: string | symbol) => void {
    return function (target, methodName: string | symbol) {
        registerNodeChild(target, methodName);
    };
}

/**
 * Declares the decorated property as the holder of a collection of child nodes.
 */
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
