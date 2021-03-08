import {ensureNodeDefinition, getNodeDefinition, Node, NODE_TYPES} from "../ast";
import * as Ecore from "ecore/dist/ecore";
import {EObject, EPackage} from "ecore";

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const EPACKAGE_SYMBOL = Symbol("EPackage");

function getEPackage(packageName: string, args: { nsPrefix?: string; nsUri?: string }) {
    //TODO nested packages for a.b.c?
    const ePackage = Ecore.EPackage.Registry.ePackages().find(p => p.get("name") == packageName);
    if(ePackage) {
        if(ePackage.get("nsUri") !== args.nsUri) {
            throw new Error("Package " + packageName + " already exists with different nsUri: " + ePackage.get("nsUri"));
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

export function registerECoreModel(packageName: string, args: { nsPrefix?: string, nsUri?: string } = {}): EPackage {
    const packageDef = NODE_TYPES[packageName];
    if(!packageDef) {
        return undefined;
    }
    const pkg = getEPackage(packageName, args);
    packageDef[EPACKAGE_SYMBOL] = pkg;
    for(const nodeType in packageDef.nodes) {
        const eClass = Ecore.EClass.create({
            name: nodeType
        });
        pkg.get('eClassifiers').add(eClass);
        const nodeDef = getNodeDefinition(packageDef.nodes[nodeType]);
        if(nodeDef) {
            for(const prop in nodeDef.properties) {
                const eAttr = Ecore.EAttribute.create({
                    name: prop
                });
                eClass.get("eStructuralFeatures").add(eAttr);
            }
        }
        //TODO superclass
    }
    return pkg;
}

export function ensureECoreModel(packageName: string): EPackage {
    if(!NODE_TYPES[packageName]) {
        NODE_TYPES[packageName] = { nodes: {} };
    }
    if(!NODE_TYPES[packageName][EPACKAGE_SYMBOL]) {
        return registerECoreModel(packageName);
    } else {
        return NODE_TYPES[packageName][EPACKAGE_SYMBOL];
    }
}

export function toEObject(obj: Node | any): EObject | any {
    return (obj instanceof Node) ? obj[TO_EOBJECT_SYMBOL]() : obj;
}

export function fromEObject(obj: EObject): Node {
    if(!obj) {
        return undefined;
    }
    const eClass = obj.eClass;
    const ePackage = eClass.eContainer as EPackage;
    const constructor = NODE_TYPES[ePackage.get("name")]?.nodes[eClass.get("name")];
    if(constructor) {
        const node = new constructor();
        const def = getNodeDefinition(node);
        if (def) {
            for (const p in def.properties) {
                const value = obj.get(p);
                if(value && Object.prototype.hasOwnProperty.call(value,"eClass")) {
                    node[p] = fromEObject(value);
                } else {
                    node[p] = value;
                }
            }
        }
        return node;
    } else {
        throw new Error("Unknown node definition: " + ePackage.get("name") + "." + eClass.get("name"));
    }
}

export class EObjectGenerator {
    toEObject(node: Node): EObject {
        return toEObject(node);
    }
    fromEObject(eObject: EObject): Node {
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
            result.set(name, toEObject(this[name]));
        }
    });
    return result;
}