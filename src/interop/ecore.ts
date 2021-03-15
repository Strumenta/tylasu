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

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const ECLASS_SYMBOL = Symbol("EClass");
export const EPACKAGE_SYMBOL = Symbol("EPackage");

const THE_DEFAULT_EPACKAGE = getEPackage("", { nsPrefix: "node", nsURI: "https://github.com/strumenta/at-strumenta-ast-typescript" });
const THE_NODE_ECLASS = Ecore.EClass.create({
    name: "Node"
});
THE_DEFAULT_EPACKAGE.get('eClassifiers').add(THE_NODE_ECLASS);

function getEPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const ePackage = Ecore.EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(ePackage.get("nsURI") !== args.nsURI) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsURI"));
        } else if(ePackage.get("nsPrefix") !== args.nsPrefix) {
            throw new Error("Package " + packageName + " already exists with different nsPrefix: " + ePackage.get("nsPrefix"));
        } else {
            return ePackage;
        }
    } else {
        return Ecore.EPackage.create({
            name: packageName,
            ...args
        });
    }
}

function registerPackage(packageName: string, args: { nsPrefix?: string; nsURI?: string }) {
    const packageDef = NODE_TYPES[packageName];
    if (!packageDef) {
        throw new Error("Unknown package: " + packageName);
    }
    const ePackage = getEPackage(packageName, args);
    packageDef[EPACKAGE_SYMBOL] = ePackage;
    return {packageDef, ePackage};
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
        const {packageDef, ePackage} = registerPackage(parentNodeDef.package, {});
        const superclass = registerEClass(parentNodeDef.name, packageDef, ePackage);
        eClass.get("eSuperTypes").add(superclass);
    }
    const nodeDef = getNodeDefinition(constructor);
    if (nodeDef) {
        for (const prop in nodeDef.properties) {
            if(nodeDef.properties[prop].inherited) {
                continue;
            }
            if (nodeDef.properties[prop].child) {
                const eRef = Ecore.EReference.create({
                    name: prop,
                    eType: THE_NODE_ECLASS,
                    containment: true
                });
                eClass.get("eStructuralFeatures").add(eRef);
            } else {
                const eAttr = Ecore.EAttribute.create({
                    name: prop //TODO type?
                });
                eClass.get("eStructuralFeatures").add(eAttr);
            }
        }
    }
    ePackage.get('eClassifiers').add(eClass);
    return eClass;
}

export function registerECoreModel(packageName: string, args: { nsPrefix?: string, nsURI?: string } = {}): EPackage {
    const {packageDef, ePackage} = registerPackage(packageName, args);
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

export function toEObject(obj: Node | any): EObject | any {
    return (obj instanceof Node) ? obj[TO_EOBJECT_SYMBOL]() : obj;
}

export function fromEObject(obj: EObject | any): Node | any[] {
    if(!obj) {
        return undefined;
    }
    if(Object.getPrototypeOf(obj) == Ecore.EList.prototype) {
        return (obj as EList).map(fromEObject);
    }
    const eClass = obj.eClass;
    if(!eClass) {
        return obj;
    }
    const ePackage = eClass.eContainer as EPackage;
    const constructor = NODE_TYPES[ePackage.get("name")]?.nodes[eClass.get("name")];
    if(constructor) {
        const node = new constructor();
        eClass.get("eStructuralFeatures").each(ft => {
            const name = ft.get("name");
            const value = obj.get(name);
            if(ft.isTypeOf("EReference")) {
                node[name] = fromEObject(value);
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
    fromEObject(eObject: EObject): Node | any[] {
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
    eClass.get("eStructuralFeatures").each(a => {
        if(a.isTypeOf('EAttribute')) {
            const name = a.get("name");
            result.set(name, this[name]);
        } else if(a.isTypeOf('EReference')) {
            const name = a.get("name");
            result.set(name, toEObject(this[name]));
        }
    });
    return result;
}

export const SYMBOL_CLASS_DEFINITION = Symbol("class definition");

function generateASTClass(eClass, pkg: PackageDescription) {
    const className = eClass.get("name");
    if (pkg.nodes[className]) {
        return pkg.nodes[className];
    }
    const superclasses = eClass.get("eSuperTypes").filter(t => t.isTypeOf("EClass"));
    let superclass = Node;
    if(superclasses.length > 1) {
        throw new Error("A class can have at most one superclass");
    } else if(superclasses.length == 1) {
        const eSuperClass = superclasses[0];
        superclass = generateASTClass(eSuperClass, ensurePackage(eSuperClass.eContainer.get("name")));
    }
    const classDef = class GeneratedNodeClass extends superclass {};
    classDef[SYMBOL_NODE_NAME] = className;
    classDef[SYMBOL_CLASS_DEFINITION] =
`@ASTNode("${pkg.name}")
class ${className} extends ${superclass[SYMBOL_NODE_NAME] || superclass.name} {`;
    registerNodeDefinition(classDef as any, pkg.name);

    eClass.get("eStructuralFeatures").each(a => {
        const name = a.get("name");
        const prop = registerNodeProperty(classDef as any, name);
        prop.child = a.isTypeOf('EReference');
        classDef[SYMBOL_CLASS_DEFINITION] += `\n\t${prop.child ? "@Child()" : "@Property()"}\n\t${name};`;
    });
    classDef[SYMBOL_CLASS_DEFINITION] += "\n}";
    pkg.nodes[className] = classDef as any;
    return classDef;
}

export function generateASTClasses(model: EPackage): PackageDescription {
    const packageName = model.get("name");
    const pkg = ensurePackage(packageName);
    model.get("eClassifiers").filter(c => c.isTypeOf("EClass")).forEach(
        eClass => generateASTClass(eClass, pkg));
    return pkg;
}