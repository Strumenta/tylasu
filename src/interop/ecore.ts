import {ensureNodeDefinition, getNodeDefinition, NODE_TYPES} from "../ast";
import * as Ecore from "ecore/dist/ecore";
import {EPackage} from "ecore";

export function toECoreModel(packageName: string, args: { nsPrefix?: string, nsUri?: string } = {}): EPackage {
    const packageDef = NODE_TYPES[packageName];
    const pkg = Ecore.EPackage.create({
        name: packageName,
        ...args
    });
    for(const nodeType in packageDef) {
        const eClass = Ecore.EClass.create({
            name: nodeType
        });
        pkg.get('eClassifiers').add(eClass);
        const nodeDef = getNodeDefinition(packageDef[nodeType]);
        if(nodeDef) {
            for(const prop in nodeDef.properties) {
                const eAttr = Ecore.EAttribute.create({
                    name: prop
                });
                eClass.eAttributes().add(eAttr);
            }
        }
        //TODO superclass
    }
    return pkg;
}