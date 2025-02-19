/**
 * ECore interoperability module with ecore.js.
 * @module interop/ecore
 */
import {
    ensureNodeDefinition,
    ensurePackage,
    getNodeDefinition,
    Node,
    NODE_TYPES, NodeDefinition,
    PackageDescription,
    Feature,
    registerNodeDefinition,
    registerNodeAttribute
} from "../model/model";
import ECore from "ecore/dist/ecore";
import {Point, Position} from "../model/position";
import {Issue, IssueSeverity, IssueType} from "../validation";
import {addLiteral, getEPackage} from "./ecore-basic";
import {
    STARLASU_URI_V2, THE_DESTINATION_INTERFACE,
    THE_ENTITY_DECLARATION_INTERFACE,
    THE_EXPRESSION_INTERFACE,
    THE_ISSUE_ECLASS,
    THE_ISSUE_SEVERITY_EENUM,
    THE_ISSUE_TYPE_EENUM,
    THE_LOCAL_DATE_ECLASS,
    THE_LOCAL_DATE_TIME_ECLASS,
    THE_LOCAL_TIME_ECLASS,
    THE_NODE_ECLASS as THE_NODE_ECLASS_V2,
    THE_NODE_ECLASS,
    THE_NODE_ORIGIN_ECLASS,
    THE_POINT_ECLASS,
    THE_POSITION_ECLASS,
    THE_REFERENCE_BY_NAME_ECLASS,
    THE_RESULT_ECLASS,
    THE_SIMPLE_ORIGIN_ECLASS,
    THE_STATEMENT_INTERFACE,
    THE_TEXT_FILE_DESTINATION_ECLASS
} from "./starlasu-v2-metamodel";
import {KOLASU_URI_V1, THE_NODE_ECLASS as THE_NODE_ECLASS_V1} from "./kolasu-v1-metamodel";
import {EBigDecimal, EBigInteger} from "./ecore-patching";
import {NodeAdapter} from "../trace/trace-node";
import {EClassifier} from "ecore";
import {PossiblyNamed, ReferenceByName} from "../model/naming";

export * as starlasu_v2 from "./starlasu-v2-metamodel";
export * as kolasu_v1 from "./kolasu-v1-metamodel";

export const TO_EOBJECT_SYMBOL = Symbol("toEObject");
export const ECLASS_SYMBOL = Symbol("EClass");
export const EPACKAGE_SYMBOL = Symbol("EPackage");
export const SYMBOL_NODE_NAME = Symbol("name");

const THE_ECORE_URI = "http://www.eclipse.org/emf/2002/Ecore";
const THE_ECORE_EPACKAGE = ECore.EPackage.Registry.getEPackage(THE_ECORE_URI);
const THE_ENUM_ECLASS = THE_ECORE_EPACKAGE.get("eClassifiers").find((c: ECore.EClassifier) => c.get("name") == "EEnum");

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
        return ECore.EDouble;
    } else if (type === String) {
        return ECore.EString;
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
    const constructor = packageDef.nodes[nodeType];
    if (Object.prototype.hasOwnProperty.call(constructor, ECLASS_SYMBOL)) {
        const eClass = constructor[ECLASS_SYMBOL];
        ePackage.get('eClassifiers').add(eClass);
        return eClass;
    }
    const eClass = ECore.EClass.create({
        name: nodeType
    });
    constructor[ECLASS_SYMBOL] = eClass;
    const proto = Object.getPrototypeOf(constructor);
    const parentNodeDef = getNodeDefinition(proto);
    if(parentNodeDef && parentNodeDef.package && parentNodeDef.name) {
        const {packageDef, ePackage} = registerEPackage(parentNodeDef.package, {});
        const superclass = registerEClass(parentNodeDef.name, packageDef, ePackage);
        eClass.get("eSuperTypes").add(superclass);
    } else {
        eClass.get("eSuperTypes").add(THE_NODE_ECLASS);
    }
    const nodeDef = getNodeDefinition(constructor);
    if (nodeDef) {
        for (const prop in nodeDef.features) {
            const property = nodeDef.features[prop];
            if(property.inherited) {
                continue;
            }
            if (property.child) {
                const eRef = ECore.EReference.create({
                    name: prop,
                    eType: THE_NODE_ECLASS,
                    containment: true
                });
                if(property.multiple) {
                    eRef.set("upperBound", -1);
                }
                eClass.get("eStructuralFeatures").add(eRef);
            } else {
                const eAttr = ECore.EAttribute.create({
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

export function registerECoreModel(
    packageName: string, args: { nsPrefix?: string, nsURI?: string } = {}
): ECore.EPackage {
    const {packageDef, ePackage} = registerEPackage(packageName, {nsURI: "", ...args});
    for(const nodeType in packageDef.nodes) {
        registerEClass(nodeType, packageDef, ePackage);
    }
    return ePackage;
}

export function ensureECoreModel(packageName = ""): ECore.EPackage {
    ensurePackage(packageName);
    if(!NODE_TYPES[packageName][EPACKAGE_SYMBOL]) {
        return registerECoreModel(packageName);
    } else {
        return NODE_TYPES[packageName][EPACKAGE_SYMBOL];
    }
}

function samePropertiesAs(propertyNames: string[], eClass: ECore.EClass) {
    const attributes = eClass.get("eAllStructuralFeatures");
    if(propertyNames.length !== attributes.length) {
        return false;
    }
    for(let i = 0; i < propertyNames.length; i++) {
        if(!propertyNames.includes(attributes[i].get("name"))) {
            return false;
        }
    }
    return true;
}

/**
 * Transforms an AST into its Ecore representation.
 * @param obj the root AST node
 * @param owner the EObject which will own the collection (when obj is an array)
 * @param feature the feature that will own the collection (when obj is an array)
 */
export function toEObject(obj: ASTElement | any, owner?: ECore.EObject, feature?: ECore.EObject): ECore.EObject | any {
    if(Array.isArray(obj)) {
        const eList = new ECore.EList(owner!, feature!);
        obj.forEach(o => {
            eList.add(toEObject(o));
        });
        return eList;
    } else {
        if (obj && (typeof obj[TO_EOBJECT_SYMBOL] === "function")) {
            return obj[TO_EOBJECT_SYMBOL]();
        } else if(obj) {
            const propertyNames = Object.getOwnPropertyNames(obj);
            if(samePropertiesAs(propertyNames, THE_RESULT_ECLASS) &&
                obj.root instanceof Node &&
                Array.isArray(obj.issues)) {
                return THE_RESULT_ECLASS.create({
                    root: toEObject(obj.root),
                    issues: obj.issues.map(toEObject)
                });
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_ECLASS)) {
                return THE_LOCAL_DATE_ECLASS.create(obj);
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_TIME_ECLASS)) {
                return THE_LOCAL_TIME_ECLASS.create(obj);
            } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_TIME_ECLASS)) {
                return THE_LOCAL_DATE_TIME_ECLASS.create({
                    date: toEObject(obj.date),
                    time: toEObject(obj.time)
                });
            } else if(samePropertiesAs(propertyNames, THE_ISSUE_ECLASS)) {
                return THE_ISSUE_ECLASS.create({
                    type: IssueType[obj.type],
                    message: obj.message,
                    severity: obj.severity !== undefined ? IssueSeverity[obj.severity] : undefined,
                    position: obj.position ? toEObject(obj.position) : undefined
                });
            } else {
                return obj;
            }
        } else {
            return obj;
        }
    }
}

export interface LocalDate {
    year: number;
    month: number;
    dayOfMonth: number;
}

export interface LocalTime {
    hour: number;
    minute: number;
    second: number;
    nanosecond: number;
}

export interface LocalDateTime {
    date: LocalDate;
    time: LocalTime;
}

export interface Result {
    root: Node | undefined;
    issues: Issue[];
}

export type ASTElement = Node | Position | Issue | LocalDate | LocalTime | LocalDateTime | Result | ASTElement[];

function decodeEnumLiteral(eType, literalName: string | number | unknown) {
    if(!literalName) {
        return undefined;
    }
    if(typeof literalName === "string") {
        const literal = eType.get("eLiterals").find(l => l.get("name") === literalName);
        if (literal) {
            return literal.get("value") || 0;
        } else {
            throw new Error(`Unknown enum literal: ${literalName} of ${eType.get("name")}`);
        }
    } else if(typeof literalName === "number") {
        const literal = eType.get("eLiterals").at(literalName);
        if (literal) {
            return literal.get("value") || literalName;
        } else {
            throw new Error(`Unknown enum literal: ${literalName} of ${eType.get("name")}`)
        }
    } else {
        throw new Error(`Invalid enum literal: ${literalName} of ${eType.get("name")}`)
    }
}

export function fromEObject(obj: ECore.EObject | any, parent?: Node): ASTElement | undefined {
    if(!obj) {
        return undefined;
    }
    if(Object.getPrototypeOf(obj) == ECore.EList.prototype) {
        return (obj as ECore.EList).map(o => fromEObject(o, parent));
    }
    const eClass = obj.eClass;
    if(!eClass) {
        return obj;
    }
    if(isBuiltInClass(eClass, THE_POSITION_ECLASS)) {
        return new Position(
            new Point(obj.get("start")?.get("line") || 1, obj.get("start")?.get("column") || 0),
            new Point(obj.get("end")?.get("line") || 1, obj.get("end")?.get("column") || 0));
    }
    if(isBuiltInClass(eClass, THE_LOCAL_DATE_ECLASS)) {
        return { year: obj.get("year"), month: obj.get("month"), dayOfMonth: obj.get("dayOfMonth") };
    }
    if(isBuiltInClass(eClass, THE_LOCAL_TIME_ECLASS)) {
        return {
            hour: obj.get("hour"),
            minute: obj.get("minute"),
            second: obj.get("second"),
            nanosecond: obj.get("nanosecond")
        };
    }
    if(isBuiltInClass(eClass, THE_LOCAL_DATE_TIME_ECLASS)) {
        return { date: fromEObject(obj.get("date")) as LocalDate, time: fromEObject(obj.get("time")) as LocalTime };
    }
    if(isBuiltInClass(eClass, THE_ISSUE_ECLASS)) {
        return new Issue(
            decodeEnumLiteral(THE_ISSUE_TYPE_EENUM, obj.get("type")),
            obj.get("message"),
            decodeEnumLiteral(THE_ISSUE_SEVERITY_EENUM, obj.get("severity")),
            fromEObject(obj.get("position")) as Position);
    }
    if(isBuiltInClass(eClass, THE_RESULT_ECLASS)) {
        return {
            root: fromEObject(obj.get("root")) as Node,
            issues: (obj.get("issues") as ECore.EList)?.map(fromEObject) as Issue[] || []
        };
    }
    if(isBuiltInClass(eClass, THE_NODE_ORIGIN_ECLASS)) {
        return fromEObject(obj.get("node")) as Node;
    }
    if(isBuiltInClass(eClass, THE_SIMPLE_ORIGIN_ECLASS)) {
        return undefined;
    }
    if(isBuiltInClass(eClass, THE_TEXT_FILE_DESTINATION_ECLASS)) {
        return fromEObject(obj.get("position")) as Position;
    }
    const ePackage = eClass.eContainer as ECore.EPackage;
    const constructor = NODE_TYPES[ePackage.get("name")]?.nodes[eClass.get("name")] as new (...args: any[]) => Node;
    if(constructor) {
        const node = new constructor().withParent(parent);
        node.parent = parent;
        eClass.get("eAllStructuralFeatures").forEach(ft => {
            const name = ft.get("name");
            const value = obj.get(name);
            const eType = ft.get("eType");
            if(Array.isArray(value)) {
                node[name] = value.map(e => {
                    if(e.eClass === "http://www.eclipse.org/emf/2002/Ecore#//EEnumLiteral") {
                        if(e.$ref) {
                            const literalName = e.$ref.substring(e.$ref.lastIndexOf("/") + 1);
                            return decodeEnumLiteral(eType, literalName);
                        }
                    }
                    return fromEObject(e, node);
                });
            } else if(ft.isTypeOf("EReference")) {
                node[name] = fromEObject(value, node);
            } else if(value !== undefined && value !== null && eType && eType.isTypeOf("EEnum")) {
                node[name] = decodeEnumLiteral(eType, value);
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
    toEObject(node: Node): ECore.EObject {
        return toEObject(node);
    }
    fromEObject(eObject: ECore.EObject): ASTElement | undefined {
        return fromEObject(eObject);
    }
}

Node.prototype[TO_EOBJECT_SYMBOL] = function(): ECore.EObject {
    const def = ensureNodeDefinition(this);
    const ePackage = ensureECoreModel(def.package);
    const eClass = ePackage.get("eClassifiers").find(c => c.get("name") == def.name);
    if(!eClass) {
        throw new Error("Unknown class " + def.name + " in package " + def.package);
    }
    const eObject = eClass.create();
    for (const name in def.features) {
        const p = def.features[name];
        const feature = eClass.get("eAllStructuralFeatures").find(f => f.get("name") == name);
        if (!feature) {
            throw new Error(`Unknown feature: ${name} of ${eClass.get("name")}`);
        }
        if(p.child) {
            eObject.set(name, toEObject(this[name], eObject, feature));
        } else {
            const value = this[name];
            const eType = feature.get("eType");
            if(value !== undefined && value !== null && eType && eType.isTypeOf("EEnum")) {
                const literal = eType.get("eLiterals").find(l => l.get("value") === value);
                if(literal) {
                    eObject.set(name, literal.get("name"));
                } else {
                    throw new Error(`No literal has value ${value} in enum ${eType.get("name")}`)
                }
            } else {
                eObject.set(name, value);
            }
        }
    }
    eObject.set("position", toEObject(this.position, eObject));
    // TODO origin, destination
    return eObject;
}

Position.prototype[TO_EOBJECT_SYMBOL] = function(): ECore.EObject {
    const pos = THE_POSITION_ECLASS.create({});
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

function isBuiltInClass(eClass: ECore.EClass, refClass: ECore.EClass): boolean {
    const nsURI = eClass?.eContainer?.get("nsURI");
    return (nsURI == KOLASU_URI_V1 || nsURI == STARLASU_URI_V2) && eClass.get("name") == refClass.get("name");
}

function generateASTClass(eClass, pkg: PackageDescription) {
    if(isBuiltInClass(eClass, THE_NODE_ECLASS)) {
        return Node;
    }
    const className = eClass.get("name");
    if (pkg.nodes[className]) {
        return pkg.nodes[className];
    }
    const supertypes: ECore.EClass[] = eClass.get("eSuperTypes").filter(t => t.isTypeOf("EClass"));
    const superclasses = supertypes.filter(t => !t.get("interface"));
    let nodeSuperclass;
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
        const superClassName = nodeSuperclass == Node ? "Node" : nodeSuperclass[SYMBOL_NODE_NAME];
        // TODO we don't generate interfaces yet
        // const implementsClause = interfaces.length > 0 ? ` implements ${interfaces.map(i => i.get("name")).join(", ")}` : "";
        classDef[SYMBOL_CLASS_DEFINITION] =
            `@ASTNode("${pkg.name}", "${className}")
export class ${className} extends ${superClassName} {`;
        registerNodeDefinition(classDef as any, pkg.name, className);

        eClass.get("eStructuralFeatures").each(a => {
            const name = a.get("name");
            defineProperty(classDef, name);
            const prop = registerNodeAttribute(classDef as any, name);
            prop.child = a.isTypeOf('EReference');
            const annotation = prop.child ? (prop.multiple ? "@Children()" : "@Child()") : "@Attribute()"
            classDef[SYMBOL_CLASS_DEFINITION] += `\n\t${annotation}\n\t${name};`;
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

export function generateASTModel(model: ECore.EPackage[]): PackageDescription[] {
    return model.map(generateASTClasses);
}

export function generateASTClasses(model: ECore.EPackage): PackageDescription {
    const packageName = model.get("name");
    const pkg = ensurePackage(packageName);
    model.get("eClassifiers").filter(c => c.isTypeOf("EClass") && !c.get("interface")).forEach(
        eClass => generateASTClass(eClass, pkg));
    return pkg;
}

export function loadEPackages(data: any, resource: ECore.Resource): ECore.EPackage[] {
    if(typeof data === "string") {
        data = JSON.parse(data);
    }
    const referencesTracker = new ReferencesTracker(resource);
    if (Array.isArray(data)) {
        for (const pkg of data) {
            const result = importJsonObject(pkg, resource, undefined, true, referencesTracker);
            resource.add(result);
        }
    } else {
        const result = importJsonObject(data, resource, undefined, true, referencesTracker);
        resource.add(result);
    }
    referencesTracker.resolveAllReferences();
    return registerPackages(resource);
}

interface PostponedReference {
    eObject: ECore.EObject, feature: any, refName: string | undefined, refValue: any
}

/**
 * Used to track references to resolve once the whole model is loaded.
 */
class ReferencesTracker {
    private postponedReferences : PostponedReference[] = [];

    constructor(public resource: ECore.Resource) {
    }

    trackReference(eObject: ECore.EObject, feature: any, refName: string | undefined, refValue: any) : void {
        this.postponedReferences.push({eObject, feature, refName: refName, refValue});
    }

    resolveAllReferences() : void {
        this.postponedReferences.forEach((pr)=> {
            this.resolveReference(pr);
        });
        this.postponedReferences = [];
    }

    resolveReference(pr: PostponedReference) {
        if (pr.refName) {
            pr.eObject.set(pr.feature, THE_REFERENCE_BY_NAME_ECLASS.create({
                name: pr.refName,
                referenced: pr.refValue ? this.getReferredObject(pr.refValue["$ref"]) : undefined
            }));
        } else if (pr.feature.get('upperBound') !== 1) {
            const list = pr.eObject.get(pr.feature);
            pr.refValue.forEach(ref => {
                list.add(this.getReferredObject(ref.$ref));
            });
        } else {
            pr.eObject.set(pr.feature, this.getReferredObject(pr.refValue["$ref"]));
        }
    }

    getReferredObject(uri?: string) {
        if (uri === undefined) {
            return undefined;
        }
        let eClass;
        try {
            eClass = findEClass(uri, this.resource);
        } catch {
            //Not an eclass
        }
        if (eClass) {
            return eClass;
        } else if (uri.indexOf("#") != -1) {
            const parts = uri.split("#");
            if (parts.length != 2) {
                throw new Error(`Unexpected URI: ${uri}. It was expected to have a single # symbol`);
            }
            const packageURI = parts[0];
            const ePackage = ECore.EPackage.Registry.getEPackage(packageURI);
            if (ePackage == null) {
                throw new Error(`Could not find EPackage with URI ${packageURI}`)
            }
            throw new Error("Not supported: " + uri);
        } else {
            let referred: any = this.resource.getEObject(uri);
            if (!referred) {
                if (uri.startsWith("/")) {
                    const components = uri.substring(1).split("/");
                    referred = this.resource.getEObject("/").eContents();
                    for (const fragment of components) {
                        if (Array.isArray(referred)) {
                            referred = referred[parseInt(fragment)];
                        } else {
                            referred = referred.get(fragment);
                        }
                    }
                }
                if (!referred) {
                    throw new Error(`Unresolved reference ${uri} in resource ${this.resource.get("uri")}`);
                }
            }
            return referred;
        }
    }
}

/**
 * Interprets a string or JSON object as an EObject.
 * @param data the input string or object.
 * @param resource where to look for to resolve references to types.
 * @param eClass the class of the object, if not specified in the `data`.
 */
export function loadEObject(data: string | any, resource: ECore.Resource, eClass?: ECore.EClass): ECore.EObject {
    if(typeof data === "string") {
        data = JSON.parse(data);
    }
    const referencesTracker = new ReferencesTracker(resource);
    const result = importJsonObject(data, resource, eClass, true, referencesTracker);
    resource.add(result);
    referencesTracker.resolveAllReferences();
    return result;
}

export function findEClass(name: string, resource: ECore.Resource): ECore.EClass | undefined {
    const index = name.lastIndexOf("#");
    if (index > 0) {
        const packageName = name.substring(0, index);
        const ePackage = ECore.EPackage.Registry.getEPackage(packageName);
        if(!ePackage) {
            throw new Error("Package not found: " + packageName + " while loading class " + name);
        }
        const className = name.substring(name.lastIndexOf("/") + 1);
        if (ePackage.get("nsURI") == KOLASU_URI_V1) {
            // Possibly handle Kolasu v1 data types
            if (className == "BigDecimal") {
                return EBigDecimal;
            } else if (className == "BigInteger") {
                return EBigInteger;
            } else if (className == "boolean") {
                return ECore.EBoolean;
            } else if (className == "int") {
                return ECore.EInt;
            } else if (className == "string") {
                return ECore.EString;
            }
        }
        return ePackage.get("eClassifiers").find((c: ECore.EClassifier) => c.get("name") == className);
    } else {
        const parts = name.substring(1).split("/").filter(s => s.length > 0);
        const packages = resource.eContents().filter(value => value.isTypeOf("EPackage"));
        if(parts.length == 2) {
            const ePackage = packages[parseInt(parts[0])];
            if (ePackage == null) {
                throw new Error("Package not found while looking for EClass " + name)
            }
            return ePackage.get("eClassifiers").find((c: ECore.EClassifier) => c.get("name") == parts[1]);
        } else if(packages.length == 1) {
            return packages[0].get("eClassifiers").find((c: ECore.EClassifier) => c.get("name") == parts[0]);
        } else {
            throw new Error("Unsupported class name: " + name);
        }
    }
}

function ensureEClass(obj: any, eClass: ECore.EClass | undefined, resource: ECore.Resource): ECore.EClass {
    if (obj.eClass) {
        eClass = findEClass(obj.eClass, resource);
        if(!eClass) {
            throw new Error(`Unknown EClass: ${obj.eClass}`);
        }
    }
    if(!eClass) {
        const propertyNames = Object.getOwnPropertyNames(obj);
        if(samePropertiesAs(propertyNames, THE_RESULT_ECLASS) &&
            Array.isArray(obj.issues)) {
            eClass = THE_RESULT_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_ECLASS)) {
            eClass = THE_LOCAL_DATE_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_TIME_ECLASS)) {
            eClass = THE_LOCAL_TIME_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_LOCAL_DATE_TIME_ECLASS)) {
            eClass = THE_LOCAL_TIME_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_ISSUE_ECLASS)) {
            return THE_ISSUE_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_POINT_ECLASS)) {
            eClass = THE_POINT_ECLASS;
        } else if(samePropertiesAs(propertyNames, THE_POSITION_ECLASS)) {
            eClass = THE_POSITION_ECLASS;
        }

        if (!eClass) {
            throw new Error(`EClass is not specified and not present in the object. Property names: ${propertyNames}`);
        }
    }
    return eClass;
}

function featureError(message: string, key: string, eClass: ECore.EObject, resource: ECore.Resource) {
    return new Error(message + ": " + key + " of " + eClass.fragment() + " in " + resource.eURI());
}

function setChild(
    feature, obj: any, key: string, eObject: ECore.EObject, resource: ECore.Resource, eType, strict: boolean,
      referencesTracker: ReferencesTracker, eClass: ECore.EObject
) {
    if (feature.get("many")) {
        if (obj[key]) {
            obj[key].forEach((v: any) => {
                eObject.get(key).add(
                    importJsonObject(v, resource, eType, strict, referencesTracker));
            });
        }
    } else {
        let value: any;
        if (Array.isArray(obj[key])) {
            if (obj[key].length == 1) {
                value = obj[key][0];
            } else if (obj[key].length > 1) {
                throw new Error("Unexpected array: " + key + " of " + eClass.fragment);
            }
        } else {
            value = obj[key];
        }
        if (value) {
            eObject.set(key, importJsonObject(value, resource, eType, strict, referencesTracker));
        }
    }
}

/**
 * Interprets a JSON object as an EObject.
 * @param obj the input object.
 * @param resource where to look for to resolve references to types.
 * @param eClass if the object does not specify an EClass, this method will use this parameter, if provided.
 * @param strict if true (the default), unknown attributes are an error, otherwise they're ignored.
 * @param referencesTracker references tracker used to read references and solve them later (after loading all nodes)
 */
function importJsonObject(
    obj: any, resource: ECore.Resource, eClass?: ECore.EClass,
    strict = true, referencesTracker: ReferencesTracker = new ReferencesTracker(resource)): ECore.EObject {
    eClass = ensureEClass(obj, eClass, resource);
    if (eClass == THE_ISSUE_ECLASS) {
        return eClass.create({
            type: IssueType[obj.type],
            message: obj.message,
            severity: obj.severity !== undefined ? IssueSeverity[obj.severity] : undefined,
            position: obj.position ?
                importJsonObject(obj.position, resource, undefined, strict, referencesTracker) :
                undefined
        });
    } else if (eClass == THE_ENUM_ECLASS) {
        const theEnum = ECore.EEnum.create({
            name: obj.name
        });
        obj.eLiterals?.forEach((name: string | any, index: number) => {
            if (typeof name === 'string') {
                addLiteral(theEnum, name, index);
            } else {
                addLiteral(theEnum, name?.name, typeof name?.value === 'number' ? name.value : index);
            }
        })
        return theEnum;
    }
    const eObject = eClass.create({});
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key != "eClass") {
            const feature = eClass.getEStructuralFeature(key);
            if (feature) {
                if (feature.isTypeOf('EAttribute')) {
                    eObject.set(key, obj[key]);
                } else if (feature.isTypeOf('EReference')) {
                    let eType = feature.get("eType");
                    if (!eType) {
                        const eGenericType = feature.get("eGenericType");
                        if (eGenericType) {
                            eType = eGenericType.get("eClassifier");
                            if (eType == THE_REFERENCE_BY_NAME_ECLASS) {
                                referencesTracker.trackReference(eObject, feature, obj[key].name, obj[key].referenced);
                                continue;
                            }
                        }
                    }
                    if (feature.get("containment") === true) {
                        setChild(feature, obj, key, eObject, resource, eType, strict, referencesTracker, eClass);
                    } else if (feature.isKindOf(ECore.EReference)) {
                        referencesTracker.trackReference(eObject, feature, undefined, obj[key]);
                    } else {
                        throw featureError("The feature is neither a containment nor a reference", key, eClass, resource);
                    }
                } else if (strict) {
                    throw featureError("Not a feature", key, eClass, resource);
                }
            } else if (strict) {
                throw featureError("Not a feature", key, eClass, resource);
            }
        }
    }
    return eObject;
}

export function registerPackages(resource: ECore.Resource): ECore.EPackage[] {
    return resource.get("contents")
        .filter((p: ECore.EObject) =>
            p.isKindOf("EPackage") &&
            p.get("name") != "javax.xml.datatype")
        .map((p: ECore.EPackage) => {
            ECore.EPackage.Registry.register(p);
            return p;
        });
}

export function isNodeType(type: EClassifier) {
    return type && (
        (type.get("interface") && type != THE_DESTINATION_INTERFACE) ||
        type == THE_NODE_ECLASS_V2 || type == THE_NODE_ECLASS_V1 ||
        type.get("eAllSuperTypes")?.find(t => t == THE_NODE_ECLASS_V2 || t == THE_NODE_ECLASS_V1) ||
        type == THE_REFERENCE_BY_NAME_ECLASS);
}

export interface EcoreMetamodelSupport {
    /**
     * Generates the metamodel. The standard Kolasu metamodel [EPackage][org.eclipse.emf.ecore.EPackage] is included.
     */
    generateMetamodel(resource: ECore.Resource, includingKolasuMetamodel: boolean): void;
}

export class ECoreNode extends NodeAdapter implements PossiblyNamed {

    parent?: ECoreNode;

    constructor(public eo: ECore.EObject, parent?: ECoreNode) {
        super();
        const container = eo.eContainer;
        if (parent) {
            this.parent = parent;
        } else if (container?.isKindOf(THE_NODE_ECLASS_V2) || container?.isKindOf(THE_NODE_ECLASS_V1)) {
            this.parent = new ECoreNode(container);
        }
    }

    get name(): string | undefined {
        return this.getAttributeValue("name");
    }

    private _nodeDefinition?: NodeDefinition;

    get nodeDefinition() {
        if (!this._nodeDefinition) {
            this._nodeDefinition = {
                package: this.eo.eClass.eContainer.get("name") as string,
                name: this.eo.eClass.get("name") as string,
                features: this.getFeatures()
            };
        }
        return this._nodeDefinition;
    }

    get(...path: string[]): NodeAdapter | undefined {
        let eo: ECore.EObject = this.eo;
        for (const component of path) {
            eo = eo?.get(component);
        }
        if (eo) {
            return new ECoreNode(eo);
        } else {
            return undefined;
        }
    }

    getAttributeValue(name: string): any {
        return this.eo.get(name);
    }

    getAttributes(): { [p: string]: any } {
        const result: any = {};
        for (const attr of this.eo.eClass.get("eAllAttributes")) {
            const name = attr.get("name");
            result[name] = this.eo.get(name);
        }
        return result;
    }

    private _children?: ECoreNode[] = undefined;

    getChildren(role?: string): ECoreNode[] {
        if (this._children === undefined) {
            this._children = this.getChildrenEObjects().map(c => new ECoreNode(c, this));
        }
        return this._children!.filter(c => !role || c.getRole() == role);
    }

    protected doGetChildOrChildren(name: string | symbol): ECoreNode | ECoreNode[] | undefined {
        const containment = this.containment(name);
        const children = this.getChildren(name.toString());
        if (!containment?.multiple) {
            if (children) {
                return children[0];
            } else {
                return undefined;
            }
        } else {
            return children;
        }
    }

    getReference(name: string | symbol): ReferenceByName<ECoreNode> | undefined {
        const ref = this.eo.get(name.toString());
        if (ref) {
            if (ref.isKindOf(THE_REFERENCE_BY_NAME_ECLASS)) {
                const referred = ref.get("referenced");
                return new ReferenceByName<any>(ref.get("name"), referred ? new ECoreNode(referred) : undefined);
            } else {
                const error = new Error(`Not a reference: ${name.toString()}`) as any;
                error.object = ref;
                throw error;
            }
        } else {
            return undefined;
        }
    }

    getId(): string {
        return this.eo.fragment();
    }

    getIssues(property = "issues"): Issue[] | undefined {
        const raw = this.eo.get(property);
        if (raw) {
            return fromEObject(raw) as Issue[];
        } else {
            return undefined;
        }
    }

    getPosition(property = "position"): Position | undefined {
        const raw = this.eo.get(property);
        if (raw) {
            return fromEObject(raw) as Position;
        } else {
            return undefined;
        }
    }

    getRole(): string | undefined {
        return this.eo.eContainingFeature?.get("name");
    }

    getFeatures(): { [name: string | symbol]: Feature } {
        const result: { [name: string | symbol]: Feature } = {};
        const eClass = this.eo.eClass;
        const features = eClass.get("eAllStructuralFeatures");
        for (const ft of features) {
            const name = ft.get("name");
            const isReference = ft.isTypeOf('EReference');
            if (isReference && !isNodeType(ft.get("eType") || ft.get("eGenericType")?.get("eClassifier"))) {
                // skip
            } else {
                const isChild = isReference &&
                    ft.get('containment') &&
                    ft.get("eGenericType")?.get("eClassifier") != THE_REFERENCE_BY_NAME_ECLASS;
                result[name] = {
                    name,
                    child: isChild,
                    reference: isReference && !isChild,
                    multiple: isReference ? ft.get('many') : undefined,
                };
            }
        }
        return result;
    }

    protected getChildrenEObjects() {
        return this.eo.eContents()
            .filter((c) => c.isKindOf(THE_NODE_ECLASS_V2) || c.isKindOf(THE_NODE_ECLASS_V1))
            .filter((c) => c.eContainingFeature.get("name") != "origin")
            .filter((c) => c.eContainingFeature.get("name") != "destination");
    }

    isOfKnownType(name: string) {
        const intf = THE_NODE_ECLASS_V2.eContainer.get("eClassifiers").find((c: ECore.EClassifier) =>
            c.get("interface") && c.get("name") == name);
        return intf && this.eo.isKindOf(intf);
    }

    isDeclaration(): boolean {
        return this.eo.isKindOf(THE_ENTITY_DECLARATION_INTERFACE);
    }

    isExpression(): boolean {
        return this.eo.isKindOf(THE_EXPRESSION_INTERFACE);
    }

    isStatement(): boolean {
        return this.eo.isKindOf(THE_STATEMENT_INTERFACE);
    }

    equals(other: NodeAdapter): boolean {
        return super.equals(other) || (other instanceof ECoreNode && other.eo == this.eo);
    }
}
