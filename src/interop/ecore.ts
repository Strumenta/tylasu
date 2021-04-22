import {
    ensureNodeDefinition, ensurePackage,
    getNodeDefinition,
    Node,
    NODE_TYPES,
    PackageDescription,
    registerNodeDefinition, registerNodeProperty, SYMBOL_NODE_NAME
} from "../ast";
import * as Ecore from "ecore/dist/ecore";
import {EList, EObject, EPackage} from "ecore";
import {Point, Position} from "../position";

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const ECLASS_SYMBOL = Symbol("EClass");
export const EPACKAGE_SYMBOL = Symbol("EPackage");

const KOLASU_URI_V1 = "https://strumenta.com/kolasu/v1";
export const THE_AST_RESOURCE = Ecore.ResourceSet.create().create({ uri: 'builtin:kolasu' });
export const THE_AST_EPACKAGE = getEPackage("com.strumenta.kolasu.v1", { nsURI: KOLASU_URI_V1 });
THE_AST_RESOURCE.get("contents").add(THE_AST_EPACKAGE);
export const THE_NODE_ECLASS = Ecore.EClass.create({
    name: "ASTNode",
    abstract: true
});
export const THE_POINT_ECLASS = Ecore.EClass.create({
    name: "Point"
});
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "line",
    eType: Ecore.EInt,
    lowerBound: 1
}));
THE_POINT_ECLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "column",
    eType: Ecore.EInt,
    lowerBound: 1
}));
export const THE_POSITION_ECLASS = Ecore.EClass.create({
    name: "Position"
});
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "start",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_POSITION_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "end",
    eType: THE_POINT_ECLASS,
    containment: true,
    lowerBound: 1
}));
THE_NODE_ECLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "position",
    eType: THE_POSITION_ECLASS,
    containment: true
}));
export const THE_POSSIBLY_NAMED_INTERFACE = Ecore.EClass.create({
    name: "PossiblyNamed",
    interface: true
});
THE_POSSIBLY_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 0
}));
export const THE_NAMED_INTERFACE = Ecore.EClass.create({
    name: "Named",
    interface: true
});
THE_NAMED_INTERFACE.get("eSuperTypes").add(THE_POSSIBLY_NAMED_INTERFACE);
THE_NAMED_INTERFACE.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
export const THE_REFERENCE_BY_NAME_CLASS = Ecore.EClass.create({
    name: "ReferenceByName"
});
THE_REFERENCE_BY_NAME_CLASS.get("eSuperTypes").add(THE_NAMED_INTERFACE);
THE_REFERENCE_BY_NAME_CLASS.get("eTypeParameters").add(Ecore.ETypeParameter.create({
    name: "N"
}));
THE_REFERENCE_BY_NAME_CLASS.get("eTypeParameters").at(0).get("eBounds").add(Ecore.EGenericType.create({
    eClassifier: THE_POSSIBLY_NAMED_INTERFACE
}));
THE_REFERENCE_BY_NAME_CLASS.get("eStructuralFeatures").add(Ecore.EAttribute.create({
    name: "name",
    eType: Ecore.EString,
    lowerBound: 1
}));
THE_REFERENCE_BY_NAME_CLASS.get("eStructuralFeatures").add(Ecore.EReference.create({
    name: "referenced",
    containment: true
}));
THE_REFERENCE_BY_NAME_CLASS.get("eStructuralFeatures").at(1).set("eGenericType", Ecore.EGenericType.create({
    eTypeParameter: THE_REFERENCE_BY_NAME_CLASS.get("eTypeParameters").at(0)
}));

THE_AST_EPACKAGE.get('eClassifiers').add(THE_NODE_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POINT_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSITION_ECLASS);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_POSSIBLY_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_NAMED_INTERFACE);
THE_AST_EPACKAGE.get('eClassifiers').add(THE_REFERENCE_BY_NAME_CLASS);

function getEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const ePackage = Ecore.EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(args.nsURI && ePackage.get("nsURI") !== args.nsURI) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsURI"));
        } else if(args.nsPrefix && ePackage.get("nsPrefix") !== args.nsPrefix) {
            throw new Error("Package " + packageName + " already exists with different nsPrefix: " + ePackage.get("nsPrefix"));
        } else {
            return ePackage;
        }
    } else {
        const newPackage = Ecore.EPackage.create({
            name: packageName,
            ...args
        });
        Ecore.EPackage.Registry.register(newPackage);
        return newPackage;
    }
}

function registerEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const packageDef = NODE_TYPES[packageName];
    if (!packageDef) {
        throw new Error("Unknown package: " + packageName);
    }
    const ePackage = getEPackage(packageName, args);
    packageDef[EPACKAGE_SYMBOL] = ePackage;
    return {packageDef, ePackage};
}

function translateType(type) {
    if (type === Number) {
        return Ecore.EDouble;
    } else if (type === String) {
        return Ecore.EString;
    } else if(type.name) {
        //TODO
        return undefined
    }
}

function getEType(property: any) {
    const type = property.type;
    if(!type) {
        return undefined;
    }
    if(type === Array && property.arrayElementType) {
        //TODO
        return undefined;
    }
    return translateType(type);
}

function registerEClass(nodeType: string, packageDef: PackageDescription, ePackage) {
    if (nodeType[ECLASS_SYMBOL]) {
        return nodeType[ECLASS_SYMBOL];
    }
    const eClass = Ecore.EClass.create({
        name: nodeType
    });
    const constructor = packageDef.nodes[nodeType];
    constructor[ECLASS_SYMBOL] = eClass;
    const proto = Object.getPrototypeOf(constructor);
    const parentNodeDef = getNodeDefinition(proto);
    if(parentNodeDef) {
        const {packageDef, ePackage} = registerEPackage(parentNodeDef.package, {});
        const superclass = registerEClass(parentNodeDef.name, packageDef, ePackage);
        eClass.get("eSuperTypes").add(superclass);
    } else {
        eClass.get("eSuperTypes").add(THE_NODE_ECLASS);
    }
    const nodeDef = getNodeDefinition(constructor);
    if (nodeDef) {
        for (const prop in nodeDef.properties) {
            const property = nodeDef.properties[prop];
            if(property.inherited) {
                continue;
            }
            if (property.child) {
                const eRef = Ecore.EReference.create({
                    name: prop,
                    eType: THE_NODE_ECLASS,
                    containment: true
                });
                if(property.multiple) {
                    eRef.set("upperBound", -1);
                }
                eClass.get("eStructuralFeatures").add(eRef);
            } else {
                const eAttr = Ecore.EAttribute.create({
                    name: prop
                });
                if(property.type) {
                    const eType = getEType(property);
                    if(eType) {
                        eAttr.set("eType", eType);
                    }
                }
                eClass.get("eStructuralFeatures").add(eAttr);
            }
        }
    }
    ePackage.get('eClassifiers').add(eClass);
    return eClass;
}

export function registerECoreModel(packageName: string, args: { nsPrefix?: string, nsURI?: string } = {}): EPackage {
    const {packageDef, ePackage} = registerEPackage(packageName, {nsURI: "", ...args});
    for(const nodeType in packageDef.nodes) {
        registerEClass(nodeType, packageDef, ePackage);
    }
    return ePackage;
}

export function ensureECoreModel(packageName: string): EPackage {
    ensurePackage(packageName);
    if(!NODE_TYPES[packageName][EPACKAGE_SYMBOL]) {
        return registerECoreModel(packageName);
    } else {
        return NODE_TYPES[packageName][EPACKAGE_SYMBOL];
    }
}

export function toEObject(obj: Node | Node[] | any, owner?: EObject, feature?: EObject): EObject | any {
    if(Array.isArray(obj)) {
        const eList = new Ecore.EList(owner || Ecore.EObject.create(), feature);
        obj.forEach(o => {
            eList.add(toEObject(o));
        });
        return eList;
    } else {
        return (obj && (typeof obj[TO_EOBJECT_SYMBOL] === "function")) ? obj[TO_EOBJECT_SYMBOL]() : obj;
    }
}

export function fromEObject(obj: EObject | any, parent?: Node): Node | Position | (Node | Position)[] {
    if(!obj) {
        return undefined;
    }
    if(Object.getPrototypeOf(obj) == Ecore.EList.prototype) {
        return (obj as EList).map(o => fromEObject(o, parent));
    }
    const eClass = obj.eClass;
    if(!eClass) {
        return obj;
    }
    if(eClass == THE_POSITION_ECLASS) {
        return new Position(
            new Point(obj.get("start").get("line"), obj.get("start").get("column")),
            new Point(obj.get("end").get("line"), obj.get("end").get("column")));
    }
    const ePackage = eClass.eContainer as EPackage;
    const constructor = NODE_TYPES[ePackage.get("name")]?.nodes[eClass.get("name")];
    if(constructor) {
        const node = new constructor();
        node.parent = parent;
        eClass.get("eAllStructuralFeatures").forEach(ft => {
            const name = ft.get("name");
            const value = obj.get(name);
            if(ft.isTypeOf("EReference")) {
                node[name] = fromEObject(value, node);
            } else if(value !== undefined && value !== null && ft.get("eType") && ft.get("eType").isTypeOf("EEnum")) {
                const literal = ft.get("eType").get("eLiterals").find(l => l.get("name") === value);
                if(literal) {
                    node[name] = literal.get("value") || 0;
                } else {
                    throw new Error(`Unknown enum literal: ${value} of ${ft.get("eType").get("name")}`)
                }
            } else {
                node[name] = value;
            }
        });
        return node;
    } else {
        throw new Error("Unknown node definition: " + ePackage.get("name") + "." + eClass.get("name"));
    }
}

export class EObjectGenerator {
    toEObject(node: Node): EObject {
        return toEObject(node);
    }
    fromEObject(eObject: EObject): Node | Position | (Node | Position)[] {
        return fromEObject(eObject);
    }
}

Node.prototype[TO_EOBJECT_SYMBOL] = function (): EObject {
    const def = ensureNodeDefinition(this);
    const ePackage = ensureECoreModel(def.package);
    const eClass = ePackage.get("eClassifiers").find(c => c.get("name") == def.name);
    if(!eClass) {
        throw new Error("Unknown class " + def.name + " in package " + def.package);
    }
    const result = eClass.create();
    eClass.get("eAllStructuralFeatures").forEach(a => {
        if(a.isTypeOf('EAttribute')) {
            const name = a.get("name");
            const value = this[name];
            if(value !== undefined && value !== null && a.get("eType") && a.get("eType").isTypeOf("EEnum")) {
                const literal = a.get("eType").get("eLiterals").find(l => l.get("value") === value);
                if(literal) {
                    result.set(name, literal.get("name"));
                } else {
                    throw new Error(`No literal has value ${value} in enum ${a.get("eType").get("name")}`)
                }
            } else {
                result.set(name, value);
            }
        } else if(a.isTypeOf('EReference')) {
            const name = a.get("name");
            result.set(name, toEObject(this[name], result, a));
        }
    });
    return result;
}

Position.prototype[TO_EOBJECT_SYMBOL] = function(): EObject {
    const pos = THE_POSITION_ECLASS.create();
    pos.set("start", THE_POINT_ECLASS.create({
        line: this.start.line, column: this.start.column
    }));
    pos.set("end", THE_POINT_ECLASS.create({
        line: this.end.line, column: this.end.column
    }));
    return pos;
}

export const SYMBOL_CLASS_DEFINITION = Symbol("class definition");

function defineProperty(classDef, name) {
    const internalPropertySymbol = Symbol(name);
    Object.defineProperty(classDef, name, {
        enumerable: true,
        get(): any {
            return this[internalPropertySymbol];
        },
        set(v: any) {
            this[internalPropertySymbol] = v;
        }
    });
}

function isTheNodeClass(eClass) {
    return eClass.eContainer && eClass.eContainer.get("nsURI") == KOLASU_URI_V1 && eClass.get("name") == "ASTNode";
}

function generateASTClass(eClass, pkg: PackageDescription) {
    if(isTheNodeClass(eClass)) {
        return Node;
    }
    const className = eClass.get("name");
    if (pkg.nodes[className]) {
        return pkg.nodes[className];
    }
    const superclasses = eClass.get("eSuperTypes").filter(t => t.isTypeOf("EClass"));
    let nodeSuperclass = undefined;
    if(superclasses.length > 1) {
        throw new Error("A class can have at most one superclass");
    } else if(superclasses.length == 1) {
        const eSuperClass = superclasses[0];
        nodeSuperclass = generateASTClass(eSuperClass, ensurePackage(eSuperClass.eContainer.get("name")));
    }
    if(nodeSuperclass) {
        //TODO check it actually derives from node!
        const superclass: typeof Node = nodeSuperclass;
        const classDef = class GeneratedNodeClass extends superclass {};
        classDef[SYMBOL_NODE_NAME] = className;
        //TODO include decorator that records where the class has been loaded from?
        classDef[SYMBOL_CLASS_DEFINITION] =
            `@ASTNode("${pkg.name}")
export class ${className} extends ${nodeSuperclass[SYMBOL_NODE_NAME] || nodeSuperclass.name} {`;
        registerNodeDefinition(classDef as any, pkg.name);

        eClass.get("eStructuralFeatures").each(a => {
            const name = a.get("name");
            defineProperty(classDef, name);
            const prop = registerNodeProperty(classDef as any, name);
            prop.child = a.isTypeOf('EReference');
            const annot = prop.child ? (prop.multiple ? "@Children()" : "@Child()") : "@Property()"
            classDef[SYMBOL_CLASS_DEFINITION] += `\n\t${annot}\n\t${name};`;
        });
        classDef[SYMBOL_CLASS_DEFINITION] += "\n}";
        pkg.nodes[className] = classDef as any;
        return classDef;
    } else {
        const classDef = class GeneratedClass {};
        eClass.get("eStructuralFeatures").each(a => {
            const name = a.get("name");
            defineProperty(classDef, name);
        });
        return classDef;
    }
}

export function generateASTClasses(model: EPackage): PackageDescription {
    const packageName = model.get("name");
    const pkg = ensurePackage(packageName);
    model.get("eClassifiers").filter(c => c.isTypeOf("EClass") && !c.get("interface")).forEach(
        eClass => generateASTClass(eClass, pkg));
    return pkg;
}