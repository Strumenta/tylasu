import {ensureNodeDefinition, getNodeDefinition, Node, NODE_TYPES} from "../ast";
import * as Ecore from "ecore/dist/ecore";
import {EObject, EPackage} from "ecore";

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const EPACKAGE_SYMBOL = Symbol("EPackage");

export function registerECoreModel(packageName: string, args: { nsPrefix?: string, nsUri?: string } = {}): EPackage {
    const packageDef = NODE_TYPES[packageName];
    if(!packageDef) {
        return undefined;
    }
    const pkg = Ecore.EPackage.create({
        name: packageName,
        ...args
    });
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

export class EObjectGenerator {
    toEObject(node: Node): any {
        return toEObject(node);
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